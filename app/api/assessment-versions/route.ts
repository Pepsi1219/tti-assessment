import { NextResponse } from "next/server";
import {
  getCurrentUser,
  hasSameOrigin,
  isAdmin,
} from "@/lib/auth/authorization";
import { getRepository } from "@/lib/repositories";
import {
  assessmentVersionPayloadSchema,
  publishAssessmentVersionPayloadSchema,
} from "@/lib/validation/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(user))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json(await getRepository().getAssessmentVersions(), {
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(user))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasSameOrigin(request))
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 },
    );

  const body = (await request.json().catch(() => null)) as
    | { action?: unknown; version?: unknown }
    | null;
  if (body?.action !== "saveDraft" && body?.action !== "publish")
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  const payloadSchema = body.action === "publish"
    ? publishAssessmentVersionPayloadSchema
    : assessmentVersionPayloadSchema;
  const payload = payloadSchema.safeParse(body.version);
  if (!payload.success)
    return NextResponse.json(
      {
        error: "Invalid assessment version data",
        details: payload.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );

  const repo = getRepository();
  const versions = await repo.getAssessmentVersions();
  const existing = payload.data.id
    ? versions.find((item) => item.id === payload.data.id)
    : undefined;
  if (payload.data.id && !existing)
    return NextResponse.json(
      { error: "Assessment version not found" },
      { status: 404 },
    );
  if (existing?.status === "Published")
    return NextResponse.json(
      { error: "Published versions are immutable. Create a new version." },
      { status: 409 },
    );

  const now = new Date().toISOString();
  const versionNumber =
    existing?.version ??
    Math.max(
      0,
      ...versions
        .filter((item) => item.name === payload.data.name)
        .map((item) => item.version),
    ) + 1;
  const version = {
    ...payload.data,
    id: existing?.id ?? `assessment-${crypto.randomUUID()}`,
    version: versionNumber,
    status: body.action === "publish" ? "Published" as const : "Draft" as const,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    ...(body.action === "publish" ? { publishedAt: now } : {}),
  };
  await repo.upsertAssessmentVersion(version);
  return NextResponse.json(version);
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(user))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasSameOrigin(request))
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 },
    );

  const id = new URL(request.url).searchParams.get("id")?.trim();
  if (!id || id.length > 200)
    return NextResponse.json(
      { error: "A valid assessment version ID is required" },
      { status: 400 },
    );

  const result = await getRepository().deleteAssessmentVersion(id);
  if (result === "not-found")
    return NextResponse.json(
      { error: "Assessment version not found" },
      { status: 404 },
    );
  if (result === "in-use")
    return NextResponse.json(
      { error: "Assessment version is in use" },
      { status: 409 },
    );

  return NextResponse.json({ ok: true });
}