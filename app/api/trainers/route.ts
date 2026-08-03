import { NextResponse } from "next/server";
import { getRepository } from "@/lib/repositories";

export async function GET() {
  return NextResponse.json(await getRepository().getTrainers());
}

export async function POST(request: Request) {
  const payload = await request.json();
  const now = new Date().toISOString();
  const trainer = await getRepository().upsertTrainer({
    id: payload.id ?? `t-${Date.now()}`,
    employeeId: payload.employeeId,
    trainerName: payload.trainerName,
    bu: payload.bu,
    status: payload.status ?? "Active",
    createdAt: payload.createdAt ?? now,
    updatedAt: now
  });
  return NextResponse.json(trainer);
}
