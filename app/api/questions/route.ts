import { NextResponse } from "next/server";
import { getCurrentUser, hasSameOrigin, isAdmin } from "@/lib/auth/authorization";
import { getRepository } from "@/lib/repositories";
import { questionPayloadSchema } from "@/lib/validation/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const repo = getRepository();
  const [categories, questions] = await Promise.all([repo.getCategories(), repo.getQuestions()]);
  return NextResponse.json({ categories, questions }, {
    headers: { "Cache-Control": "private, no-store" }
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });

  const payload = questionPayloadSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success) return NextResponse.json({ error: "Invalid question data" }, { status: 400 });

  const repo = getRepository();
  const categories = await repo.getCategories();
  if (!categories.some((category) => category.id === payload.data.categoryId)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const question = await repo.upsertQuestion({
    id: payload.data.id ?? `q-${crypto.randomUUID()}`,
    categoryId: payload.data.categoryId,
    questionText: payload.data.questionText,
    options: payload.data.options,
    weight: payload.data.weight,
    maxScore: payload.data.maxScore,
    isActive: payload.data.isActive
  });
  return NextResponse.json(question);
}
