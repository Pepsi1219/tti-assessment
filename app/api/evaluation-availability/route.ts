import { NextResponse } from "next/server";
import {
  getCurrentUser,
  hasSameOrigin,
  isAdmin,
} from "@/lib/auth/authorization";
import { getRepository } from "@/lib/repositories";
import { evaluationAvailabilityPayloadSchema } from "@/lib/validation/api";

/** Public so an unopened form can show its closed page before sign-in. */
export async function GET() {
  return NextResponse.json(
    { isOpen: await getRepository().isEvaluationOpen() },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function PATCH(request: Request) {
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

  const payload = evaluationAvailabilityPayloadSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success)
    return NextResponse.json(
      { error: "isOpen must be a boolean" },
      { status: 400 },
    );

  await getRepository().setEvaluationOpen(payload.data.isOpen);
  return NextResponse.json({ isOpen: payload.data.isOpen });
}
