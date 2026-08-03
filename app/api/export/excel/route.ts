import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getEvaluationResults } from "@/lib/services/evaluation-service";

export async function GET() {
  const results = await getEvaluationResults();

  const rows = results.map((r) => ({
    "Trainer Name": r.trainer?.trainerName ?? "",
    "Employee ID": r.trainer?.employeeId ?? "",
    "Business Unit": r.bu,
    "Evaluator": r.evaluatorName,
    "Evaluator Email": r.evaluatorEmail,
    "Evaluation Date": r.evaluationDate,
    "Total Score": r.totalScore,
    "Percentage": r.percentage,
    "Result": r.result,
    ...Object.fromEntries(
      r.categorySummary.map((cat) => [cat.categoryName, cat.average])
    ),
    "Comment": r.comment
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);

  const colWidths = Object.keys(rows[0] ?? {}).map((key) => ({
    wch: Math.max(key.length, 15)
  }));
  ws["!cols"] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, "Evaluations");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=nanyang-trainer-evaluations.xlsx"
    }
  });
}
