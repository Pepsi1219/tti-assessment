import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { calculateEvaluationMetrics } from "../lib/services/evaluation-scoring.ts";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx") as typeof import("xlsx");
const { loadEnvConfig } = require("@next/env") as typeof import("@next/env");
const { cert, getApps, initializeApp } = require("firebase-admin/app") as typeof import("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore") as typeof import("firebase-admin/firestore");

const DEFAULT_FILE = "Nanyang Trainer Certification Evaluation Form.xlsx";
const METADATA_HEADERS = ["ID", "Start time", "ผู้ประเมิน", "ครูฝึก", "BU", "วันที่", "หลักสูตร", "รอบ"];
const ALLOWED_BU_CODES = new Set(["G1", "G2", "G3", "G4", "EA", "TRM"]);
const MAX_EVALUATIONS_PER_BATCH = 20;

type CategoryRecord = {
  id: string;
  categoryName: string;
  sortOrder: number;
  isCritical?: boolean;
};

type QuestionRecord = {
  id: string;
  categoryId: string;
  questionText: string;
  weight: number;
  maxScore: number;
  isActive: boolean;
};

type UserRecord = {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: string;
};

type RecipientRecord = {
  id: string;
  employeeId: string;
  recipientName: string;
  bu: string;
  buCode?: string;
};

type TopicRecord = {
  id: string;
  topicName: string;
};

type EvaluationDetailRecord = {
  id: string;
  evaluationId: string;
  questionId: string;
  score: number;
};

type EvaluationCandidate = {
  evaluation: {
    id: string;
    recipientId: string;
    topicId: string;
    topicName: string;
    evaluatorName: string;
    evaluatorEmail: string;
    evaluatorEmployeeId: string;
    bu: string;
    buCode?: string;
    evaluationDate: string;
    evaluationRound: number;
    categoryActualScores: Record<string, number>;
    totalScore: number;
    percentage: number;
    result: "Pass" | "Fail";
    comment: string;
    createdAt: string;
    source: "Microsoft Forms";
    legacySourceId: string;
    legacyStartTime: string;
    importSourceFile: string;
    importFileSha256: string;
    importedAt: string;
  };
  details: EvaluationDetailRecord[];
  excelRow: number;
  zeroScoreCount: number;
};

const RECIPIENT_ALIASES = new Map<string, string>([
  [lookupKey("จารุวรรณ์ ออนเอี่ยม"), lookupKey("จารุวรรณ ออนเอี่ยม")],
  [lookupKey("น้ำผึ้ง แก้วมณี"), lookupKey("น้ำผึ่ง แก้วมณี")],
  [lookupKey("พรทิวา กลึงในเมือง"), lookupKey("พรทิวา กลิ่นในเมือง")],
  [lookupKey("อลิสา เรื่องหร่าย"), lookupKey("อลิสา เรืองหร่าย")],
  [lookupKey("เนตรนพาพร พงษ์พานิช"), lookupKey("เนตรนภาพร พงษ์พานิช")],
]);

function text(value: unknown): string {
  return value === null || value === undefined ? "" : String(value).trim();
}

function lookupKey(value: unknown): string {
  return text(value)
    .normalize("NFKC")
    .replace(/\s*(?:\((?:G[1-4]|EA|TRM)\))?\s*_?round\s*\d+\s*$/i, "")
    .replace(/\s*\((?:G[1-4]|EA|TRM)\)\s*$/i, "")
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("th");
}

function resolveRecipientKey(value: unknown): string {
  const key = lookupKey(value);
  return RECIPIENT_ALIASES.get(key) ?? key;
}

function parsePositiveInteger(value: unknown, label: string): number {
  const parsed = Number(text(value));
  if (!Number.isInteger(parsed) || parsed < 1) throw new Error(`${label} must be a positive integer.`);
  return parsed;
}

function parseEvaluationDate(value: unknown, label: string): string {
  const match = text(value).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) throw new Error(`${label} must use M/D/YYYY format.`);
  const [, monthText, dayText, yearText] = match;
  const month = Number(monthText);
  const day = Number(dayText);
  const year = Number(yearText);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    throw new Error(`${label} is not a valid date.`);
  }
  return `${yearText}-${monthText.padStart(2, "0")}-${dayText.padStart(2, "0")}`;
}

function parseBangkokDateTime(value: unknown, label: string): string {
  const match = text(value).match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})$/);
  if (!match) throw new Error(`${label} must use M/D/YY H:mm:ss format.`);
  const [, monthText, dayText, rawYear, hourText, minuteText, secondText] = match;
  const year = rawYear.length === 2 ? 2000 + Number(rawYear) : Number(rawYear);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59 || second > 59) {
    throw new Error(`${label} is not a valid date and time.`);
  }
  return new Date(Date.UTC(year, month - 1, day, hour - 7, minute, second)).toISOString();
}

function parseHistoricalScore(value: unknown, maxScore: number, label: string): number {
  if (!text(value)) return 0;
  const selectedCriteria = new Set(
    [...text(value).matchAll(/(?:^|;)\s*"?([1-5])\./g)].map((match) => Number(match[1])),
  );
  if (!selectedCriteria.size) throw new Error(`${label} has text but no numbered criteria.`);
  if (selectedCriteria.size > maxScore) throw new Error(`${label} exceeds the maximum score.`);
  return selectedCriteria.size;
}

function chunk<T>(rows: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < rows.length; index += size) result.push(rows.slice(index, index + size));
  return result;
}

function getFileArgument(): string {
  const fileIndex = process.argv.indexOf("--file");
  if (fileIndex < 0) return path.resolve(process.cwd(), DEFAULT_FILE);
  const supplied = process.argv[fileIndex + 1];
  if (!supplied) throw new Error("--file requires a path.");
  return path.resolve(process.cwd(), supplied);
}

async function main() {
  const commit = process.argv.includes("--commit");
  const inputPath = getFileArgument();
  const inputBytes = readFileSync(inputPath);
  const inputSha256 = createHash("sha256").update(inputBytes).digest("hex");
  const workbook = XLSX.read(inputBytes, { type: "buffer", cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("The workbook has no worksheets.");
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, defval: null, raw: false });
  if (rows.length < 2) throw new Error("The workbook has no evaluation rows.");
  const headers = rows[0].map(text);

  METADATA_HEADERS.forEach((expected, index) => {
    if (headers[index] !== expected) {
      throw new Error(`Column ${XLSX.utils.encode_col(index)} must be '${expected}', found '${headers[index] || "blank"}'.`);
    }
  });
  if (headers[28] !== "Comment") throw new Error("Column AC must be 'Comment'.");

  loadEnvConfig(process.cwd());
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) throw new Error("Firebase Admin environment variables are incomplete.");

  const app = getApps()[0] || initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  const db = getFirestore(app);
  const [usersSnapshot, recipientsSnapshot, topicsSnapshot, categoriesSnapshot, questionsSnapshot] = await Promise.all([
    db.collection("users").get(),
    db.collection("recipients").get(),
    db.collection("evaluationTopics").get(),
    db.collection("categories").get(),
    db.collection("questions").get(),
  ]);

  const evaluators = usersSnapshot.docs
    .map((document) => ({ id: document.id, ...document.data() }) as UserRecord)
    .filter((user) => user.role === "Evaluator");
  const recipients = recipientsSnapshot.docs.map(
    (document) => ({ id: document.id, ...document.data() }) as RecipientRecord,
  );
  const topics = topicsSnapshot.docs.map((document) => ({ id: document.id, ...document.data() }) as TopicRecord);
  const categories = categoriesSnapshot.docs
    .map((document) => ({ id: document.id, ...document.data() }) as CategoryRecord)
    .sort((left, right) => left.sortOrder - right.sortOrder);
  const questions = questionsSnapshot.docs
    .map((document) => ({ id: document.id, ...document.data() }) as QuestionRecord)
    .filter((question) => question.isActive);

  const evaluatorByKey = new Map(evaluators.map((user) => [lookupKey(user.name), user]));
  const recipientByKey = new Map(recipients.map((recipient) => [lookupKey(recipient.recipientName), recipient]));
  const topicByKey = new Map(topics.map((topic) => [lookupKey(topic.topicName), topic]));
  const questionByText = new Map(questions.map((question) => [text(question.questionText), question]));
  const questionColumns = headers.slice(8, 28).map((header, offset) => {
    const question = questionByText.get(header);
    if (!question) throw new Error(`Column ${XLSX.utils.encode_col(offset + 8)} does not match an active Firestore question.`);
    return { columnIndex: offset + 8, question };
  });
  if (new Set(questionColumns.map(({ question }) => question.id)).size !== 20) {
    throw new Error("The workbook must map to 20 unique active questions.");
  }

  const errors: string[] = [];
  const seenLegacyIds = new Set<string>();
  const importedAt = new Date().toISOString();
  const candidates: EvaluationCandidate[] = [];

  rows.slice(1).forEach((row, rowOffset) => {
    const excelRow = rowOffset + 2;
    try {
      const legacyId = text(row[0]);
      if (!legacyId) throw new Error("ID is blank.");
      if (seenLegacyIds.has(legacyId)) throw new Error(`ID '${legacyId}' is duplicated.`);
      seenLegacyIds.add(legacyId);

      const evaluator = evaluatorByKey.get(lookupKey(row[2]));
      if (!evaluator) throw new Error(`Evaluator '${text(row[2])}' was not found in Firestore.`);
      const recipient = recipientByKey.get(resolveRecipientKey(row[3]));
      if (!recipient) throw new Error(`Recipient '${text(row[3])}' was not found in Firestore.`);
      const topic = topicByKey.get(lookupKey(row[6]));
      if (!topic) throw new Error(`Topic '${text(row[6])}' was not found in Firestore.`);

      const buCode = text(row[4]).toUpperCase();
      if (!ALLOWED_BU_CODES.has(buCode)) throw new Error(`BU '${buCode}' is invalid.`);
      if (recipient.buCode && recipient.buCode !== buCode) {
        throw new Error(`BU '${buCode}' does not match recipient BU '${recipient.buCode}'.`);
      }

      const evaluationDate = parseEvaluationDate(row[5], "Evaluation date");
      const evaluationRound = parsePositiveInteger(row[7], "Evaluation round");
      const legacyStartTime = text(row[1]);
      const createdAt = parseBangkokDateTime(legacyStartTime, "Start time");
      const scores = new Map(
        questionColumns.map(({ columnIndex, question }) => [
          question.id,
          parseHistoricalScore(row[columnIndex], question.maxScore, `${question.id} at row ${excelRow}`),
        ]),
      );

      const metrics = calculateEvaluationMetrics(categories, questions, Object.fromEntries(scores));
      const totalScore = metrics.overallAverage;
      const percentage = metrics.percentage;
      const result = metrics.result;
      const evaluationId = `legacy-msforms-${legacyId}`;
      const details = questions.map((question) => ({
        id: `${evaluationId}-${question.id}`,
        evaluationId,
        questionId: question.id,
        score: scores.get(question.id) ?? 0,
      }));

      candidates.push({
        excelRow,
        zeroScoreCount: details.filter((detail) => detail.score === 0).length,
        evaluation: {
          id: evaluationId,
          recipientId: recipient.id,
          topicId: topic.id,
          topicName: topic.topicName,
          evaluatorName: evaluator.name,
          evaluatorEmail: evaluator.email,
          evaluatorEmployeeId: evaluator.employeeId,
          bu: recipient.bu,
          ...(recipient.buCode ? { buCode: recipient.buCode } : {}),
          evaluationDate,
          evaluationRound,
          categoryActualScores: Object.fromEntries(metrics.categorySummary.map((category) => [category.categoryId, category.actualScore])),
          totalScore,
          percentage,
          result,
          comment: text(row[28]),
          createdAt,
          source: "Microsoft Forms",
          legacySourceId: legacyId,
          legacyStartTime,
          importSourceFile: path.basename(inputPath),
          importFileSha256: inputSha256,
          importedAt,
        },
        details,
      });
    } catch (error) {
      errors.push(`Row ${excelRow}: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  if (errors.length) {
    console.error(`Validation failed with ${errors.length} error(s):`);
    errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
    return;
  }

  const existingChecks = await Promise.all(
    candidates.map(({ evaluation }) => db.collection("evaluations").doc(evaluation.id).get()),
  );
  const newCandidates = candidates.filter((_, index) => !existingChecks[index].exists);
  const existingCount = candidates.length - newCandidates.length;
  const passCount = candidates.filter(({ evaluation }) => evaluation.result === "Pass").length;
  const failCount = candidates.length - passCount;
  const rowsWithZeroScores = candidates.filter(({ zeroScoreCount }) => zeroScoreCount > 0).length;
  const zeroScoreCells = candidates.reduce((sum, candidate) => sum + candidate.zeroScoreCount, 0);

  console.log(`Workbook: ${path.basename(inputPath)}`);
  console.log(`Worksheet: ${sheetName} (${worksheet["!ref"] ?? "unknown range"})`);
  console.log(`SHA-256: ${inputSha256}`);
  console.log(`Validated evaluations: ${candidates.length}`);
  console.log(`New evaluations: ${newCandidates.length}`);
  console.log(`Already imported: ${existingCount}`);
  console.log(`Result summary: ${passCount} Pass, ${failCount} Fail`);
  console.log(`Blank criteria treated as score 0: ${zeroScoreCells} cells across ${rowsWithZeroScores} evaluations`);

  if (!commit) {
    console.log("Dry run complete. No Firestore documents were written.");
    console.log("Run again with --commit to import the validated records.");
    return;
  }

  const currentInputSha256 = createHash("sha256").update(readFileSync(inputPath)).digest("hex");
  if (currentInputSha256 !== inputSha256) {
    throw new Error("The workbook changed while it was being validated. Run the import again.");
  }

  for (const candidateChunk of chunk(newCandidates, MAX_EVALUATIONS_PER_BATCH)) {
    const batch = db.batch();
    for (const candidate of candidateChunk) {
      batch.create(db.collection("evaluations").doc(candidate.evaluation.id), candidate.evaluation);
      for (const detail of candidate.details) {
        batch.create(db.collection("evaluationDetails").doc(detail.id), detail);
      }
    }
    await batch.commit();
  }

  const verification = await Promise.all(
    candidates.map(({ evaluation }) => db.collection("evaluations").doc(evaluation.id).get()),
  );
  const missingAfterImport = verification.filter((document) => !document.exists).length;
  if (missingAfterImport) throw new Error(`${missingAfterImport} evaluation document(s) are missing after import.`);

  const expectedDetailIds = new Set(candidates.flatMap(({ details }) => details.map((detail) => detail.id)));
  const detailSnapshots = await Promise.all(
    chunk(candidates.map(({ evaluation }) => evaluation.id), 30).map((evaluationIds) =>
      db.collection("evaluationDetails").where("evaluationId", "in", evaluationIds).get(),
    ),
  );
  const importedDetailIds = new Set(
    detailSnapshots.flatMap((snapshot) => snapshot.docs.map((document) => document.id)),
  );
  const missingDetailCount = [...expectedDetailIds].filter((id) => !importedDetailIds.has(id)).length;
  if (missingDetailCount) throw new Error(`${missingDetailCount} evaluation detail document(s) are missing after import.`);

  console.log(`Import complete: ${newCandidates.length} evaluations and ${newCandidates.length * 20} detail records created.`);
  console.log(`Verified evaluation documents: ${verification.length}/${candidates.length}`);
  console.log(`Verified detail documents: ${expectedDetailIds.size - missingDetailCount}/${expectedDetailIds.size}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
