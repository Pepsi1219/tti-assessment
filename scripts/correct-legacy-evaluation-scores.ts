import { createRequire } from "node:module";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { calculateEvaluationMetrics } from "../lib/services/evaluation-scoring.ts";

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require("@next/env") as typeof import("@next/env");

const CATEGORY_IDS = ["discipline", "presentation", "communication", "knowledge", "methods", "feedback", "professionalism"] as const;
const COURSE = "CSA Basic Quality Program";
const ROUND = 2;

type CategoryScores = Record<(typeof CATEGORY_IDS)[number], number>;
type Correction = {
  recipientName: string;
  evaluatorName: string;
  scores: CategoryScores;
};

function categoryScores(values: number[]): CategoryScores {
  if (values.length !== CATEGORY_IDS.length) throw new Error("Every correction must contain seven category scores.");
  return Object.fromEntries(CATEGORY_IDS.map((categoryId, index) => [categoryId, values[index]])) as CategoryScores;
}

const corrections: Correction[] = [
  { recipientName: "จารุวรรณ ออนเอี่ยม", evaluatorName: "Pongsathon Sukjarernjit", scores: categoryScores([5, 17, 13, 7, 11, 11, 12]) },
  { recipientName: "จารุวรรณ ออนเอี่ยม", evaluatorName: "Natthasasi Chotichanawong", scores: categoryScores([5, 12, 8, 7, 11, 7, 9]) },
  { recipientName: "จารุวรรณ ออนเอี่ยม", evaluatorName: "Katekan Tongthong", scores: categoryScores([5, 15, 16, 6, 11, 11, 10]) },
  { recipientName: "อุบลรัตน์ พุ่มแก้ว", evaluatorName: "Pongsathon Sukjarernjit", scores: categoryScores([5, 15, 13, 7, 11, 12, 13]) },
  { recipientName: "อุบลรัตน์ พุ่มแก้ว", evaluatorName: "Katekan Tongthong", scores: categoryScores([5, 16, 15, 6, 11, 9, 11]) },
  { recipientName: "NGUYEN THI KIM HOANG", evaluatorName: "Pongsathon Sukjarernjit", scores: categoryScores([5, 15, 15, 8, 12, 13, 11]) },
  { recipientName: "NGUYEN THI KIM HOANG", evaluatorName: "Katekan Tongthong", scores: categoryScores([5, 14, 13, 8, 9, 9, 9]) },
  { recipientName: "น้ำผึ้ง แก้วมณี", evaluatorName: "Pongsathon Sukjarernjit", scores: categoryScores([5, 19, 14, 10, 10, 13, 11]) },
  { recipientName: "น้ำผึ้ง แก้วมณี", evaluatorName: "Natthasasi Chotichanawong", scores: categoryScores([5, 6, 7, 3, 8, 0, 4]) },
  { recipientName: "น้ำผึ้ง แก้วมณี", evaluatorName: "Katekan Tongthong", scores: categoryScores([5, 15, 14, 8, 10, 12, 10]) },
  { recipientName: "สุดารัตน์ แดงดี", evaluatorName: "Pongsathon Sukjarernjit", scores: categoryScores([5, 17, 16, 7, 11, 10, 12]) },
  { recipientName: "สุดารัตน์ แดงดี", evaluatorName: "Katekan Tongthong", scores: categoryScores([5, 12, 12, 6, 10, 9, 9]) },
  { recipientName: "พรทิวา กลิ่นในเมือง", evaluatorName: "Pongsathon Sukjarernjit", scores: categoryScores([5, 15, 16, 8, 12, 14, 13]) },
  { recipientName: "พรทิวา กลิ่นในเมือง", evaluatorName: "Natthasasi Chotichanawong", scores: categoryScores([5, 14, 13, 8, 7, 10, 10]) },
  { recipientName: "พรทิวา กลิ่นในเมือง", evaluatorName: "Katekan Tongthong", scores: categoryScores([5, 15, 15, 7, 11, 12, 10]) },
  { recipientName: "เนตรนภาพร พงษ์พานิช", evaluatorName: "Pongsathon Sukjarernjit", scores: categoryScores([5, 17, 19, 7, 12, 12, 13]) },
  { recipientName: "เนตรนภาพร พงษ์พานิช", evaluatorName: "Katekan Tongthong", scores: categoryScores([5, 13, 13, 8, 10, 9, 9]) },
  { recipientName: "สายรุ้ง คงกล้า", evaluatorName: "Pongsathon Sukjarernjit", scores: categoryScores([5, 18, 14, 7, 11, 11, 11]) },
  { recipientName: "สายรุ้ง คงกล้า", evaluatorName: "Natthasasi Chotichanawong", scores: categoryScores([5, 12, 15, 4, 9, 8, 10]) },
  { recipientName: "สายรุ้ง คงกล้า", evaluatorName: "Katekan Tongthong", scores: categoryScores([5, 16, 14, 7, 10, 11, 10]) },
  { recipientName: "อลิสา เรืองหร่าย", evaluatorName: "Pongsathon Sukjarernjit", scores: categoryScores([5, 16, 15, 7, 12, 12, 12]) },
  { recipientName: "อลิสา เรืองหร่าย", evaluatorName: "Katekan Tongthong", scores: categoryScores([5, 14, 12, 7, 9, 11, 9]) },
];

const recipientAliases = new Map<string, string>([
  [key("จารุวรรณ์ ออนเอี่ยม"), key("จารุวรรณ ออนเอี่ยม")],
  [key("น้ำผึ่ง แก้วมณี"), key("น้ำผึ้ง แก้วมณี")],
  [key("พรทิวา กลึงในเมือง"), key("พรทิวา กลิ่นในเมือง")],
  [key("อลิสา เรื่องหร่าย"), key("อลิสา เรืองหร่าย")],
  [key("เนตรนพาพร พงษ์พานิช"), key("เนตรนภาพร พงษ์พานิช")],
]);

function key(value: string) {
  return value.normalize("NFKC").replace(/\s+/g, " ").trim().toLocaleLowerCase("th");
}

function normalizedRecipient(value: string) {
  const normalized = key(value);
  return recipientAliases.get(normalized) ?? normalized;
}

async function main() {
  const commit = process.argv.includes("--commit");
  loadEnvConfig(process.cwd());
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) throw new Error("Firebase Admin environment variables are incomplete.");

  const app = getApps()[0] || initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  const db = getFirestore(app);
  const [evaluationSnapshot, recipientSnapshot, categorySnapshot, questionSnapshot] = await Promise.all([
    db.collection("evaluations").get(),
    db.collection("recipients").get(),
    db.collection("categories").get(),
    db.collection("questions").get(),
  ]);
  const recipients = new Map(recipientSnapshot.docs.map((document) => [document.id, document.data().recipientName as string]));
  const categories = categorySnapshot.docs.map((document) => ({ id: document.id, ...document.data() })) as Array<{ id: string; categoryName: string; isCritical?: boolean }>;
  const questions = questionSnapshot.docs.map((document) => ({ id: document.id, ...document.data() })) as Array<{ id: string; categoryId: string; weight: number; maxScore: number }>;
  const legacyEvaluations = evaluationSnapshot.docs.filter((document) => document.data().source === "Microsoft Forms");
  const updates = corrections.map((correction) => {
    const matches = legacyEvaluations.filter((document) => {
      const evaluation = document.data();
      return normalizedRecipient(recipients.get(evaluation.recipientId) ?? "") === normalizedRecipient(correction.recipientName)
        && key(evaluation.evaluatorName ?? "") === key(correction.evaluatorName)
        && evaluation.topicName === COURSE
        && evaluation.evaluationRound === ROUND;
    });
    if (matches.length !== 1) {
      throw new Error(`Expected one imported evaluation for ${correction.recipientName} / ${correction.evaluatorName}; found ${matches.length}.`);
    }
    const metrics = calculateEvaluationMetrics(categories, questions, {}, correction.scores);
    return { document: matches[0], correction, metrics };
  });

  const matchedIds = new Set(updates.map(({ document }) => document.id));
  if (matchedIds.size !== corrections.length) throw new Error("The correction list contains duplicate evaluation matches.");

  console.log(`Validated ${updates.length} imported evaluations for ${COURSE}, round ${ROUND}.`);
  updates.forEach(({ correction, metrics }) => {
    console.log(`${correction.recipientName} / ${correction.evaluatorName}: ${metrics.overallAverage.toFixed(2)} ${metrics.result}`);
  });
  if (!commit) {
    console.log("Dry run complete. No Firestore documents were changed.");
    console.log("Run again with --commit to apply the validated category totals.");
    return;
  }

  const batch = db.batch();
  updates.forEach(({ document, correction, metrics }) => {
    batch.update(document.ref, {
      categoryActualScores: correction.scores,
      totalScore: metrics.overallAverage,
      percentage: metrics.percentage,
      result: metrics.result,
    });
  });
  await batch.commit();
  console.log(`Corrected ${updates.length} imported evaluations.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
