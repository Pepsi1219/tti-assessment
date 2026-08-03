import { NextResponse } from "next/server";
import { getEvaluationResults, submitEvaluation } from "@/lib/services/evaluation-service";

export async function GET() {
  return NextResponse.json(await getEvaluationResults());
}

export async function POST(request: Request) {
  return NextResponse.json(await submitEvaluation(await request.json()));
}
