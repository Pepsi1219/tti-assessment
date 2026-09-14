import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { getCurrentUser, isAdmin } from "@/lib/auth/authorization";
import {
  getPassingCriteria,
  getReportCategoryName,
} from "@/lib/reports/evaluation-report";
import {
  getEvaluationResults,
  getEvaluationSummaries,
} from "@/lib/services/evaluation-service";
import type { CategorySummary, EvaluationSummary } from "@/lib/types";

const departmentNames: Record<string, string> = {
  เทคนิคเย็บ: "Sewing Technical",
  "CSA พัฒนาทักษะ": "CSA Skill Development",
};

const radarLabels: Record<string, string> = {
  discipline: "Discipline",
  presentation: "Delivery",
  communication: "Communication",
  knowledge: "Knowledge",
  methods: "Methods",
  feedback: "Feedback",
  professionalism: "Professionalism",
};

function isPrintableAscii(value: string) {
  return /^[\x20-\x7E]*$/.test(value);
}

function englishValue(value: string | undefined, fallback: string) {
  const normalized = value?.trim();
  return normalized && isPrintableAscii(normalized) ? normalized : fallback;
}

function drawCheckbox(doc: jsPDF, x: number, y: number, checked: boolean) {
  doc.setDrawColor(15, 23, 42);
  doc.rect(x, y - 3.3, 4, 4);
  if (!checked) return;
  doc.setLineWidth(0.7);
  doc.line(x + 0.8, y - 1.4, x + 1.7, y - 0.5);
  doc.line(x + 1.7, y - 0.5, x + 3.4, y - 2.6);
  doc.setLineWidth(0.2);
}

function drawRadarChart(
  doc: jsPDF,
  categories: CategorySummary[],
  centerX: number,
  centerY: number,
  radius: number,
) {
  if (!categories.length) return;

  const pointAt = (index: number, value: number) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / categories.length;
    const scaledRadius = radius * (value / 5);
    return {
      x: centerX + Math.cos(angle) * scaledRadius,
      y: centerY + Math.sin(angle) * scaledRadius,
    };
  };

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.2);
  for (let level = 1; level <= 5; level += 1) {
    const ring = categories.map((_, index) => pointAt(index, level));
    ring.forEach((point, index) => {
      const next = ring[(index + 1) % ring.length];
      doc.line(point.x, point.y, next.x, next.y);
    });
  }

  categories.forEach((_, index) => {
    const end = pointAt(index, 5);
    doc.line(centerX, centerY, end.x, end.y);
  });

  const values = categories.map((category, index) =>
    pointAt(index, Math.max(0, Math.min(5, category.average))),
  );
  if (values.length > 2) {
    const origin = values[0];
    const segments = values
      .slice(1)
      .map((point, index) => [
        point.x - values[index].x,
        point.y - values[index].y,
      ]);
    const last = values[values.length - 1];
    segments.push([origin.x - last.x, origin.y - last.y]);
    doc.setDrawColor(22, 163, 74);
    doc.setFillColor(34, 197, 94);
    doc.setGState(doc.GState({ opacity: 0.35, "stroke-opacity": 0.9 }));
    doc.lines(segments, origin.x, origin.y, [1, 1], "FD", true);
    doc.setGState(doc.GState({ opacity: 1, "stroke-opacity": 1 }));
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  categories.forEach((category, index) => {
    const labelPoint = pointAt(index, 6.05);
    const label = radarLabels[category.categoryId] ?? `Category ${index + 1}`;
    const options =
      labelPoint.x < centerX - 2
        ? { align: "right" as const }
        : labelPoint.x > centerX + 2
          ? { align: "left" as const }
          : { align: "center" as const };
    doc.text(label, labelPoint.x, labelPoint.y, options);
  });
}

function createConsolidatedReport(summary: EvaluationSummary) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const recipientEmployeeId = summary.recipient?.employeeId ?? "Not available";
  const recipientName = englishValue(
    summary.recipient?.recipientName,
    `Employee ${recipientEmployeeId}`,
  );
  const department =
    departmentNames[summary.bu] ??
    englishValue(summary.bu, `Department ${summary.buCode ?? "Not available"}`);
  const totalActual = summary.categorySummary.reduce(
    (sum, category) => sum + category.actualScore,
    0,
  );
  const totalFull = summary.categorySummary.reduce(
    (sum, category) => sum + category.fullScore,
    0,
  );

  doc.setProperties({
    title: `Consolidated Trainer Evaluation - ${recipientEmployeeId}`,
    subject: "Nanyang Trainer Certification Evaluation",
    author: "Nanyang",
  });
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 24, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(255, 255, 255);
  doc.text("Nanyang Trainer Certification Consolidated Evaluation", 105, 15.5, {
    align: "center",
  });

  const metadata = [
    ["Evaluation Recipient", recipientName],
    ["Employee ID", recipientEmployeeId],
    [
      "Evaluation Topic",
      englishValue(summary.topicName, "Trainer Certification"),
    ],
    ["Round / Year", `${summary.evaluationRound} / ${summary.evaluationYear}`],
    [
      "Department / BU",
      `${department}${summary.buCode ? ` / ${summary.buCode}` : ""}`,
    ],
    ["Number of Evaluators", String(summary.evaluatorCount)],
  ];
  doc.setFontSize(8.5);
  metadata.forEach(([label, value], index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = column === 0 ? 14 : 108;
    const y = 33 + row * 8;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text(`${label}:`, x, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(doc.splitTextToSize(value, 58), x + 34, y);
  });

  let y = 61;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Consolidated Score Summary", 14, y);
  y += 6;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y - 4.2, 182, 7, "F");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("EVALUATION ITEM", 17, y);
  doc.text("AVERAGE OBTAINED", 137, y, { align: "right" });
  doc.text("FULL SCORE", 164, y, { align: "right" });
  doc.text("AVERAGE / 5", 193, y, { align: "right" });
  y += 6;

  doc.setFontSize(8.5);
  summary.categorySummary.forEach((category, index) => {
    const criticalFailure = category.isCritical && category.average < 3;
    if (criticalFailure) {
      doc.setFillColor(254, 242, 242);
      doc.rect(14, y - 4, 182, 6, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(`${index + 1}  ${getReportCategoryName(category)}`, 17, y);
    doc.text(category.actualScore.toFixed(2), 137, y, { align: "right" });
    doc.text(category.fullScore.toFixed(0), 164, y, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.setTextColor(
      criticalFailure ? 220 : 15,
      criticalFailure ? 38 : 23,
      criticalFailure ? 38 : 42,
    );
    doc.text(category.average.toFixed(2), 193, y, { align: "right" });
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y + 2, 196, y + 2);
    y += 6;
  });

  doc.setFillColor(248, 250, 252);
  doc.rect(14, y - 4, 182, 18, "F");
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text("Average Total", 17, y);
  doc.text(totalActual.toFixed(2), 137, y, { align: "right" });
  doc.text(totalFull.toFixed(0), 164, y, { align: "right" });
  y += 7;
  doc.text("Score", 17, y);
  doc.setFontSize(10);
  doc.text(`${summary.totalScore.toFixed(2)} / 5`, 137, y, { align: "right" });
  doc.text("Percentage", 158, y);
  doc.text(`${summary.percentage.toFixed(2)}%`, 193, y, { align: "right" });

  const criteriaY = y + 14;
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Passing Criteria", 14, criteriaY);
  const criteria = getPassingCriteria(
    summary.totalScore,
    summary.categorySummary,
  );
  doc.setFontSize(8);
  criteria.forEach((criterion, index) => {
    const criterionY = criteriaY + 8 + index * 7;
    drawCheckbox(doc, 14, criterionY, criterion.passed);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    doc.text(criterion.label, 21, criterionY);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(
      criterion.passed ? 22 : 220,
      criterion.passed ? 163 : 38,
      criterion.passed ? 74 : 38,
    );
    doc.text(criterion.actual.toFixed(2), 103, criterionY, { align: "right" });
  });

  const resultY = criteriaY + 43;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Result", 14, resultY);
  doc.setFontSize(9);
  drawCheckbox(doc, 14, resultY + 8, summary.result === "Pass");
  doc.text("Pass", 21, resultY + 8);
  drawCheckbox(doc, 46, resultY + 8, summary.result === "Fail");
  doc.text("Fail", 53, resultY + 8);

  doc.setFontSize(11);
  doc.text("Competency Profile", 151, criteriaY, { align: "center" });
  drawRadarChart(doc, summary.categorySummary, 151, criteriaY + 38, 25);

  const evaluatorsY = Math.max(resultY + 23, criteriaY + 73);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("Evaluator Scores", 14, evaluatorsY);
  doc.setFillColor(241, 245, 249);
  doc.rect(14, evaluatorsY + 3, 182, 6, "F");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("EVALUATOR", 17, evaluatorsY + 7);
  doc.text("DATE", 115, evaluatorsY + 7);
  doc.text("SCORE", 151, evaluatorsY + 7, { align: "right" });
  doc.text("PERCENTAGE", 174, evaluatorsY + 7, { align: "right" });
  doc.text("RESULT", 193, evaluatorsY + 7, { align: "right" });
  let evaluatorY = evaluatorsY + 14;
  summary.evaluations.slice(0, 8).forEach((evaluation) => {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(
      englishValue(
        evaluation.evaluatorName,
        `Employee ${evaluation.evaluatorEmployeeId ?? ""}`,
      ),
      17,
      evaluatorY,
    );
    doc.text(evaluation.evaluationDate, 115, evaluatorY);
    doc.text(evaluation.totalScore.toFixed(2), 151, evaluatorY, {
      align: "right",
    });
    doc.text(`${evaluation.percentage.toFixed(2)}%`, 174, evaluatorY, {
      align: "right",
    });
    doc.setFont("helvetica", "bold");
    doc.setTextColor(
      evaluation.result === "Pass" ? 22 : 220,
      evaluation.result === "Pass" ? 163 : 38,
      evaluation.result === "Pass" ? 74 : 38,
    );
    doc.text(evaluation.result, 193, evaluatorY, { align: "right" });
    doc.setDrawColor(226, 232, 240);
    doc.line(14, evaluatorY + 2, 196, evaluatorY + 2);
    evaluatorY += 6;
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Consolidated Evaluation ID: ${summary.id}`, 14, 287);
  doc.text("Page 1 of 1", 196, 287, { align: "right" });
  return doc;
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(user))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = request.nextUrl.searchParams.get("id");
  const summaryId = request.nextUrl.searchParams.get("summaryId");
  if (summaryId) {
    const summaries = await getEvaluationSummaries();
    const summary = summaries.find((item) => item.id === summaryId);
    if (!summary)
      return NextResponse.json(
        { error: "Consolidated evaluation not found" },
        { status: 404 },
      );

    const buffer = createConsolidatedReport(summary).output("arraybuffer");
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=consolidated-evaluation-${summary.recipient?.employeeId ?? summary.recipientId}-${summary.evaluationYear}-round-${summary.evaluationRound}.pdf`,
      },
    });
  }
  const results = await getEvaluationResults();
  const target = id
    ? results.find((evaluation) => evaluation.id === id)
    : results[0];

  if (!target) {
    return NextResponse.json({ error: "No evaluation found" }, { status: 404 });
  }

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.setProperties({
    title: `Trainer Evaluation Report - ${target.id}`,
    subject: "Nanyang Trainer Certification Evaluation",
    author: "Nanyang",
  });

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 24, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(255, 255, 255);
  doc.text("Nanyang Trainer Certification Evaluation Form", 105, 15.5, {
    align: "center",
  });

  const recipientEmployeeId = target.recipient?.employeeId ?? "Not available";
  const recipientName = englishValue(
    target.recipient?.recipientName,
    `Employee ${recipientEmployeeId}`,
  );
  const evaluatorName = englishValue(
    target.evaluatorName,
    `Employee ${target.evaluatorEmployeeId ?? "Not available"}`,
  );
  const department =
    departmentNames[target.bu] ??
    englishValue(target.bu, `Department ${target.buCode ?? "Not available"}`);
  const metadata = [
    ["Evaluation Recipient", recipientName],
    ["Employee ID", recipientEmployeeId],
    [
      "Evaluation Topic",
      englishValue(target.topicName, "Trainer Certification"),
    ],
    [
      "Department / BU",
      `${department}${target.buCode ? ` / ${target.buCode}` : ""}`,
    ],
    ["Evaluator", evaluatorName],
    [
      "Date / Round",
      `${target.evaluationDate}${target.evaluationRound ? ` / ${target.evaluationRound}` : ""}`,
    ],
  ];

  doc.setFontSize(8.5);
  metadata.forEach(([label, value], index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = column === 0 ? 14 : 108;
    const metadataY = 33 + row * 8;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text(`${label}:`, x, metadataY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(doc.splitTextToSize(value, 58), x + 31, metadataY);
  });

  let y = 61;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Evaluation Summary", 14, y);
  y += 6;

  doc.setFillColor(241, 245, 249);
  doc.rect(14, y - 4.2, 182, 7, "F");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("EVALUATION ITEM", 17, y);
  doc.text("OBTAINED", 137, y, { align: "right" });
  doc.text("FULL SCORE", 164, y, { align: "right" });
  doc.text("AVERAGE / 5", 193, y, { align: "right" });
  y += 6;

  doc.setFontSize(8.5);
  const totalActual = target.categorySummary.reduce(
    (sum, category) => sum + category.actualScore,
    0,
  );
  const totalFull = target.categorySummary.reduce(
    (sum, category) => sum + category.fullScore,
    0,
  );
  target.categorySummary.forEach((category, index) => {
    const criticalFailure = category.isCritical && category.average < 3;
    if (criticalFailure) {
      doc.setFillColor(254, 242, 242);
      doc.rect(14, y - 4, 182, 6, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(`${index + 1}  ${getReportCategoryName(category)}`, 17, y);
    doc.text(category.actualScore.toFixed(1), 137, y, { align: "right" });
    doc.text(category.fullScore.toFixed(0), 164, y, { align: "right" });
    if (criticalFailure) doc.setTextColor(220, 38, 38);
    doc.setFont("helvetica", "bold");
    doc.text(category.average.toFixed(2), 193, y, { align: "right" });
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y + 2, 196, y + 2);
    y += 6;
  });

  doc.setFillColor(248, 250, 252);
  doc.rect(14, y - 4, 182, 13, "F");
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text("Total", 17, y);
  doc.text(totalActual.toFixed(1), 137, y, { align: "right" });
  doc.text(totalFull.toFixed(0), 164, y, { align: "right" });
  y += 7;
  doc.text("Overall Average", 17, y);
  doc.setFontSize(10);
  doc.text(`${target.totalScore.toFixed(2)} / 5`, 193, y, { align: "right" });

  const sectionY = y + 13;
  doc.setFontSize(11);
  doc.text("Passing Criteria", 14, sectionY);
  const criteria = getPassingCriteria(
    target.totalScore,
    target.categorySummary,
  );
  doc.setFontSize(8);
  criteria.forEach((criterion, index) => {
    const criterionY = sectionY + 8 + index * 7;
    drawCheckbox(doc, 14, criterionY, criterion.passed);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    doc.text(criterion.label, 21, criterionY);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(
      criterion.passed ? 22 : 220,
      criterion.passed ? 163 : 38,
      criterion.passed ? 74 : 38,
    );
    doc.text(criterion.actual.toFixed(2), 103, criterionY, { align: "right" });
  });

  const resultY = sectionY + 43;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Result", 14, resultY);
  doc.setFontSize(9);
  drawCheckbox(doc, 14, resultY + 8, target.result === "Pass");
  doc.text("Pass", 21, resultY + 8);
  drawCheckbox(doc, 46, resultY + 8, target.result === "Fail");
  doc.text("Fail", 53, resultY + 8);

  doc.setFontSize(11);
  doc.text("Competency Profile", 151, sectionY, { align: "center" });
  drawRadarChart(doc, target.categorySummary, 151, sectionY + 38, 25);

  const commentY = Math.max(resultY + 21, sectionY + 73);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Comments", 14, commentY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const comment = target.comment
    ? englishValue(
        target.comment,
        "The original comment contains non-English text and is available in the application.",
      )
    : "No comment";
  const commentLines = doc.splitTextToSize(comment, 178) as string[];
  doc.text(commentLines.slice(0, 3), 14, commentY + 8);
  doc.setDrawColor(203, 213, 225);
  for (let line = 0; line < 3; line += 1) {
    doc.line(14, commentY + 10 + line * 7, 196, commentY + 10 + line * 7);
  }

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Evaluation ID: ${target.id}`, 14, 287);
  doc.text("Page 1 of 1", 196, 287, { align: "right" });

  const buffer = doc.output("arraybuffer");
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=evaluation-${target.id}.pdf`,
    },
  });
}
