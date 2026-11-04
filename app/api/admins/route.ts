import { NextResponse } from "next/server";
import {
  getCurrentUser,
  hasSameOrigin,
  isDeveloper,
} from "@/lib/auth/authorization";
import { getRepository } from "@/lib/repositories";
import { adminPayloadSchema } from "@/lib/validation/api";

async function requireDeveloper(request?: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser)
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!isDeveloper(currentUser))
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  if (request && !hasSameOrigin(request))
    return {
      error: NextResponse.json(
        { error: "Invalid request origin" },
        { status: 403 },
      ),
    };
  return { currentUser };
}

export async function GET() {
  const access = await requireDeveloper();
  if (access.error) return access.error;

  return NextResponse.json(await getRepository().getUsers(), {
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function POST(request: Request) {
  const access = await requireDeveloper(request);
  if (access.error) return access.error;

  const payload = adminPayloadSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!payload.success)
    return NextResponse.json({ error: "Invalid administrator data" }, { status: 400 });

  const repository = getRepository();
  const [admins, evaluators] = await Promise.all([
    repository.getUsers(),
    repository.getEvaluators(),
  ]);
  const existing = payload.data.id
    ? admins.find((admin) => admin.id === payload.data.id)
    : undefined;
  if (payload.data.id && !existing)
    return NextResponse.json({ error: "Administrator not found" }, { status: 404 });

  const duplicateEmployeeId = [...admins, ...evaluators].some(
    (account) =>
      account.id !== payload.data.id &&
      account.employeeId.toLowerCase() === payload.data.employeeId.toLowerCase(),
  );
  if (duplicateEmployeeId)
    return NextResponse.json(
      { error: "Employee ID is already in use" },
      { status: 409 },
    );

  const now = new Date().toISOString();
  const nextRole = payload.data.role ?? existing?.role ?? "Admin";
  if (
    existing?.role === "Developer" &&
    existing.status !== "Inactive" &&
    (nextRole !== "Developer" || payload.data.status === "Inactive") &&
    admins.filter((admin) => admin.role === "Developer" && admin.status !== "Inactive").length <= 1
  )
    return NextResponse.json(
      { error: "At least one active Developer account must remain." },
      { status: 409 },
    );
  const admin = await repository.upsertUser({
    id: payload.data.id ?? `admin-${crypto.randomUUID()}`,
    employeeId: payload.data.employeeId,
    name: payload.data.name,
    email: payload.data.email,
    role: nextRole,
    status: payload.data.status ?? "Active",
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  });
  return NextResponse.json(admin);
}

export async function DELETE(request: Request) {
  const access = await requireDeveloper(request);
  if (access.error) return access.error;

  const id = new URL(request.url).searchParams.get("id")?.trim();
  if (!id)
    return NextResponse.json(
      { error: "Administrator ID is required" },
      { status: 400 },
    );

  const repository = getRepository();
  const admin = (await repository.getUsers()).find((item) => item.id === id);
  if (!admin)
    return NextResponse.json({ error: "Administrator not found" }, { status: 404 });
  if (
    admin.role === "Developer" &&
    admin.status !== "Inactive" &&
    (await repository.getUsers()).filter(
      (item) => item.role === "Developer" && item.status !== "Inactive",
    ).length <= 1
  )
    return NextResponse.json(
      { error: "At least one active Developer account must remain." },
      { status: 409 },
    );
  if (admin.employeeId.toLowerCase() === access.currentUser.employeeId.toLowerCase())
    return NextResponse.json(
      { error: "You cannot delete the account currently signed in." },
      { status: 409 },
    );

  await repository.deleteUser(id);
  return NextResponse.json({ ok: true });
}
