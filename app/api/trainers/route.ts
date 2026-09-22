import { NextResponse } from "next/server";

/** @deprecated Evaluator records are managed through `/api/evaluators`. */
export function GET() {
  return NextResponse.json(
    { error: "This endpoint has moved to /api/evaluators." },
    { status: 410 },
  );
}
