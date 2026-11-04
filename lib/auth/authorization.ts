import { auth } from "@/lib/auth/auth";
import type { Role } from "@/lib/types";

export type CurrentUser = {
  employeeId: string;
  name: string;
  email: string | null;
  role: Role;
};

export function matchesEvaluatorIdentity(
  evaluator: { employeeId: string; email?: string | null },
  evaluation: {
    evaluatorEmployeeId?: string | null;
    evaluatorEmail?: string | null;
  },
): boolean {
  return (
    evaluation.evaluatorEmployeeId?.toLowerCase() ===
      evaluator.employeeId.toLowerCase() ||
    (Boolean(evaluator.email) &&
      evaluation.evaluatorEmail?.toLowerCase() === evaluator.email?.toLowerCase())
  );
}

/** Returns a server-signed session identity for use by server-side route handlers. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  const sessionUser = session?.user;
  const employeeId = sessionUser?.employeeId?.trim();
  const role = sessionUser?.role;

  if (
    !sessionUser ||
    !employeeId ||
    (role !== "Admin" && role !== "Developer" && role !== "Evaluator")
  )
    return null;

  return {
    employeeId,
    name: sessionUser.name?.trim() || employeeId,
    email: sessionUser.email ?? null,
    role
  };
}

export function isAdmin(user: CurrentUser): boolean {
  return user.role === "Admin" || user.role === "Developer";
}

export function isDeveloper(user: CurrentUser): boolean {
  return user.role === "Developer";
}

/** Cookie-authenticated mutation requests must come from this application's origin. */
export function hasSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(request.url);

    if (originUrl.origin === requestUrl.origin) return true;

    // In development, Next.js can build request.url with its internal host
    // (usually localhost) even when the user opens the app via a LAN IP or
    // another local hostname. The Host header remains the browser-visible
    // destination, so it is the correct same-origin fallback.
    const requestHost = request.headers.get("host");
    return Boolean(requestHost) && originUrl.host === requestHost && originUrl.protocol === requestUrl.protocol;
  } catch {
    return false;
  }
}
