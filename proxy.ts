import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/automations",
  "/campaigns",
  "/inbox",
  "/overview",
  "/logs",
  "/settings",
  "/diagnostics",
];

function hasSessionCookie(request: NextRequest): boolean {
  return (
    request.cookies.has("authjs.session-token") ||
    request.cookies.has("__Secure-authjs.session-token") ||
    request.cookies.has("next-auth.session-token") ||
    request.cookies.has("__Secure-next-auth.session-token")
  );
}

// Limite de tentativas de login por IP, em memória (uma instância só no
// Railway). Sem isso qualquer um poderia disparar links mágicos sem parar
// pro e-mail permitido, ou martelar o endpoint de verificação.
const WINDOW_MS = 15 * 60 * 1000;
const LIMITS: Array<{ test: (p: string) => boolean; max: number }> = [
  { test: (p) => p === "/login" || p.startsWith("/api/auth/signin"), max: 5 },
  { test: (p) => p.startsWith("/api/auth/callback"), max: 20 },
];
const hits = new Map<string, number[]>();

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "desconhecido";
}

function isRateLimited(request: NextRequest, pathname: string): boolean {
  const rule = LIMITS.find((l) => l.test(pathname));
  if (!rule) return false;
  const key = `${rule.max}:${clientIp(request)}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= rule.max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }
  return false;
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (request.method === "POST" && isRateLimited(request, pathname)) {
    return NextResponse.json(
      { success: false, error: "Muitas tentativas. Aguarde alguns minutos e tente de novo." },
      { status: 429, headers: { "Retry-After": "900" } }
    );
  }

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isLogin = pathname === "/login";
  const isAuthenticated = hasSessionCookie(request);

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLogin && isAuthenticated && request.method === "GET") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/automations/:path*",
    "/campaigns/:path*",
    "/inbox/:path*",
    "/overview/:path*",
    "/logs/:path*",
    "/settings/:path*",
    "/diagnostics/:path*",
    "/login",
    "/api/auth/:path*",
  ],
};
