import { NextRequest, NextResponse } from "next/server";

type RateBucket = { windowStart: number; count: number };

// This is intentionally process-local: it adds a cheap first line of defense
// without creating more Firestore reads/writes for every request. A shared
// edge/WAF limit should still be configured for multi-instance deployments.
const buckets = new Map<string, RateBucket>();
const WINDOW_MS = 60_000;
const MAX_BODY_BYTES = 128 * 1024;

function clientKey(request: NextRequest): string {
  // Prefer identity supplied by the deployment proxy. The proxy must overwrite
  // these headers; on a direct self-hosted deployment, configure that at the
  // reverse proxy instead of trusting client-supplied values.
  return (
    request.headers.get("x-vercel-forwarded-for")?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ||
    "unknown"
  );
}

function limitFor(pathname: string, method: string): number {
  if (pathname.startsWith("/api/auth/")) return 12;
  if (method === "GET" || method === "HEAD") return 120;
  return 30;
}

function prune(now: number) {
  if (buckets.size < 5_000) return;
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart >= WINDOW_MS) buckets.delete(key);
  }
}

export function middleware(request: NextRequest) {
  const now = Date.now();
  const pathname = request.nextUrl.pathname;
  // Keep one bucket per client and API class so rotating endpoints cannot
  // multiply the allowed traffic against the backend.
  const key = `${clientKey(request)}:${pathname.startsWith("/api/auth/") ? "auth" : "api"}`;
  const limit = limitFor(pathname, request.method);
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.windowStart >= WINDOW_MS) {
    buckets.set(key, { windowStart: now, count: 1 });
  } else {
    bucket.count += 1;
    if (bucket.count > limit) {
      const retryAfter = Math.max(
        1,
        Math.ceil((bucket.windowStart + WINDOW_MS - now) / 1000),
      );
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "Cache-Control": "no-store",
            "X-RateLimit-Limit": String(limit),
          },
        },
      );
    }
  }

  prune(now);

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (
    ["POST", "PUT", "PATCH"].includes(request.method) &&
    contentLength > MAX_BODY_BYTES
  ) {
    return NextResponse.json(
      { error: "Request body is too large." },
      { status: 413, headers: { "Cache-Control": "no-store" } },
    );
  }

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", String(limit));
  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
