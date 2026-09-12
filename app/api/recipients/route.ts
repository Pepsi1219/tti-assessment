import { NextResponse } from "next/server";
import { getCurrentUser, hasSameOrigin, isAdmin } from "@/lib/auth/authorization";
import { getRepository } from "@/lib/repositories";
import { recipientPayloadSchema } from "@/lib/validation/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json(await getRepository().getRecipients(), {
    headers: { "Cache-Control": "private, no-store" }
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });

  const payload = recipientPayloadSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success) return NextResponse.json({ error: "Invalid recipient data" }, { status: 400 });

  const repo = getRepository();
  const now = new Date().toISOString();
  const existing = payload.data.id
    ? (await repo.getRecipients()).find((item) => item.id === payload.data.id)
    : undefined;
  const recipient = await repo.upsertRecipient({
    id: payload.data.id ?? `recipient-${crypto.randomUUID()}`,
    employeeId: payload.data.employeeId,
    recipientName: payload.data.recipientName,
    bu: payload.data.bu,
    buCode: payload.data.buCode,
    status: payload.data.status ?? "Active",
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  });

  return NextResponse.json(recipient);
}
