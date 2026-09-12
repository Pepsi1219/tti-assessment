import { NextResponse } from "next/server";
import { getCurrentUser, hasSameOrigin, isAdmin } from "@/lib/auth/authorization";
import { getRepository } from "@/lib/repositories";
import { trainerPayloadSchema } from "@/lib/validation/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json(await getRepository().getTrainers(), {
    headers: { "Cache-Control": "private, no-store" }
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });

  const payload = trainerPayloadSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success) return NextResponse.json({ error: "Invalid trainer data" }, { status: 400 });

  const now = new Date().toISOString();
  const trainer = await getRepository().upsertTrainer({
    id: payload.data.id ?? `t-${crypto.randomUUID()}`,
    employeeId: payload.data.employeeId,
    trainerName: payload.data.trainerName,
    bu: payload.data.bu,
    status: payload.data.status ?? "Active",
    createdAt: payload.data.createdAt ?? now,
    updatedAt: now
  });
  return NextResponse.json(trainer);
}
