import { NextResponse } from "next/server";
import { getRepository } from "@/lib/repositories";

export async function GET() {
  const repo = getRepository();
  const [categories, questions] = await Promise.all([repo.getCategories(), repo.getQuestions()]);
  return NextResponse.json({ categories, questions });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const question = await getRepository().upsertQuestion({
    id: payload.id ?? `q-${Date.now()}`,
    categoryId: payload.categoryId,
    questionText: payload.questionText,
    options: payload.options ?? [],
    weight: Number(payload.weight ?? 1),
    maxScore: Number(payload.maxScore ?? 5),
    isActive: Boolean(payload.isActive ?? true)
  });
  return NextResponse.json(question);
}
