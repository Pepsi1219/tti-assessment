import { NextResponse } from "next/server";
import {
  getCurrentUser,
  hasSameOrigin,
  isAdmin,
} from "@/lib/auth/authorization";
import { getRepository } from "@/lib/repositories";
import { evaluatorPayloadSchema } from "@/lib/validation/api";

/** Public, minimal directory used only to let an evaluator select their own name. */
export async function GET(request: Request) {
  const includeInactive =
    new URL(request.url).searchParams.get("includeInactive") === "1";
  if (includeInactive) {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!isAdmin(user))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const evaluators = (await getRepository().getEvaluators())
    .filter((evaluator) => includeInactive || evaluator.status !== "Inactive")
    .map((user) =>
      includeInactive
        ? user
        : { id: user.id, name: user.name, employeeId: user.employeeId },
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json(evaluators, {
    headers: {
      // This directory is intentionally public for the login selector. A
      // short browser cache prevents refreshes from becoming Firestore reads.
      "Cache-Control": includeInactive
        ? "private, no-store"
        : "public, max-age=60, stale-while-revalidate=300",
    },
  });
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(currentUser))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasSameOrigin(request))
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 },
    );

  const payload = evaluatorPayloadSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!payload.success)
    return NextResponse.json(
      { error: "Invalid evaluator data" },
      { status: 400 },
    );

  const repo = getRepository();
  const [users, evaluators] = await Promise.all([
    repo.getUsers(),
    repo.getEvaluators(),
  ]);
  const existing = payload.data.id
    ? evaluators.find((evaluator) => evaluator.id === payload.data.id)
    : undefined;
  if (payload.data.id && !existing) {
    return NextResponse.json({ error: "Evaluator not found" }, { status: 404 });
  }

  const hasDuplicateEmployeeId = [...users, ...evaluators].some(
    (account) =>
      account.id !== payload.data.id &&
      account.employeeId.toLowerCase() === payload.data.employeeId.toLowerCase(),
  );
  if (hasDuplicateEmployeeId) {
    return NextResponse.json(
      { error: "Employee ID is already in use" },
      { status: 409 },
    );
  }

  const now = new Date().toISOString();
  const evaluator = await repo.upsertEvaluator({
    id: payload.data.id ?? `evaluator-${crypto.randomUUID()}`,
    employeeId: payload.data.employeeId,
    name: payload.data.name,
    email: payload.data.email,
    role: "Evaluator",
    status: payload.data.status ?? "Active",
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  });

  return NextResponse.json(evaluator);
}

export async function DELETE(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(currentUser))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasSameOrigin(request))
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 },
    );

  const id = new URL(request.url).searchParams.get("id");
  if (!id)
    return NextResponse.json(
      { error: "Evaluator ID is required" },
      { status: 400 },
    );

  const evaluator = (await getRepository().getEvaluators()).find(
    (item) => item.id === id,
  );
  if (!evaluator)
    return NextResponse.json({ error: "Evaluator not found" }, { status: 404 });

  await getRepository().deleteEvaluator(id);
  return NextResponse.json({ ok: true });
}
