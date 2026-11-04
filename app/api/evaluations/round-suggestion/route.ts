import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/authorization";
import { getRepository } from "@/lib/repositories";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const searchParams = new URL(request.url).searchParams;
  const topicId = searchParams.get("topicId")?.trim();
  const buCode = searchParams.get("buCode")?.trim();
  const bu = searchParams.get("bu")?.trim();
  if (!topicId || (!buCode && !bu) || topicId.length > 200)
    return NextResponse.json(
      { error: "A course and exactly one business unit value are required." },
      { status: 400 },
    );

  try {
    const latestRound = await getRepository().getLatestEvaluationRound(topicId, {
      ...(buCode ? { buCode } : { bu }),
    });
    return NextResponse.json(
      { latestRound: latestRound ?? null },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("Unable to load evaluation round suggestion", error);
    return NextResponse.json(
      { error: "Unable to load the latest evaluation round." },
      { status: 500 },
    );
  }
}