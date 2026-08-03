import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { getEvaluationResults } from "@/lib/services/evaluation-service";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  const results = await getEvaluationResults();
  const target = id ? results.find((r) => r.id === id) : results[0];

  if (!target) {
    return NextResponse.json({ error: "No evaluation found" }, { status: 404 });
  }

  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(18);
  doc.setTextColor(37, 99, 235);
  doc.text("Nanyang Trainer Certification", 20, y);
  y += 8;
  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139);
  doc.text("Evaluation Report", 20, y);
  y += 15;

  doc.setDrawColor(226, 232, 240);
  doc.line(20, y, 190, y);
  y += 10;

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);

  const addField = (label: string, value: string) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, 80, y);
    y += 7;
  };

  addField("Trainer Name", target.trainer?.trainerName ?? "—");
  addField("Employee ID", target.trainer?.employeeId ?? "—");
  addField("Business Unit", target.bu);
  addField("Evaluator", target.evaluatorName);
  addField("Date", target.evaluationDate);

  y += 5;
  doc.setDrawColor(226, 232, 240);
  doc.line(20, y, 190, y);
  y += 10;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Score Summary", 20, y);
  y += 10;

  doc.setFontSize(11);
  addField("Total Score", `${target.totalScore.toFixed(2)} / 5`);
  addField("Percentage", `${target.percentage}%`);

  const resultColor = target.result === "Pass" ? [34, 197, 94] : [239, 68, 68];
  doc.setTextColor(resultColor[0], resultColor[1], resultColor[2]);
  doc.setFont("helvetica", "bold");
  doc.text(`Result: ${target.result}`, 20, y);
  y += 12;

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Category Summary", 20, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Category", 20, y);
  doc.text("Score", 140, y);
  doc.text("Critical", 170, y);
  y += 2;
  doc.setDrawColor(226, 232, 240);
  doc.line(20, y, 190, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  target.categorySummary.forEach((cat) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    const scoreColor = cat.isCritical && cat.average < 3 ? [239, 68, 68] : [15, 23, 42];
    doc.setTextColor(15, 23, 42);
    doc.text(cat.categoryName.substring(0, 40), 20, y);
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.text(cat.average.toFixed(2), 140, y);
    doc.setTextColor(15, 23, 42);
    doc.text(cat.isCritical ? "Yes" : "No", 170, y);
    y += 7;
  });

  if (target.comment) {
    y += 5;
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Comment", 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(target.comment, 170);
    doc.text(lines, 20, y);
  }

  const buf = doc.output("arraybuffer");

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=evaluation-${target.id}.pdf`
    }
  });
}
