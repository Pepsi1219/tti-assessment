import { NextResponse } from "next/server";
import { getCurrentUser, hasSameOrigin, isDeveloper } from "@/lib/auth/authorization";
import { getRepository } from "@/lib/repositories";
import { adminPagePermissionsSchema } from "@/lib/validation/api";

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    { pages: await getRepository().getAdminPagePermissions() },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDeveloper(currentUser)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  const payload = adminPagePermissionsSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!payload.success) {
    return NextResponse.json({ error: "Invalid page permissions" }, { status: 400 });
  }

  await getRepository().setAdminPagePermissions(payload.data.pages);
  return NextResponse.json({ pages: payload.data.pages });
}
