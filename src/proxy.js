import { NextResponse } from "next/server.js";
import { randomUUID } from "node:crypto";
import { verifySessionToken } from "./lib/auth.js";
import { applySecurityHeaders, getRequestTraceId } from "./lib/headers.js";

/**
 * Next.js 16 Proxy Convention for Route-Level Authorization and Security Headers
 * - Enforces authentication and RBAC for privileged routes
 * - Injects OWASP security response headers across all responses
 * - Establishes and propagates end-to-end request trace correlation IDs
 */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

function enhanceResponse(response, traceId, isPrivate = false) {
  if (response?.headers?.set) {
    if (traceId) {
      response.headers.set("x-trace-id", traceId);
    }
    applySecurityHeaders(response, { noCache: isPrivate });
  }
  return response;
}

export async function proxy(request) {
  const url = request.nextUrl || new URL(request.url);
  const pathname = url.pathname;
  const traceId = (await getRequestTraceId(request)) || randomUUID();

  const authEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED === "true";
  const isVaultRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/documents");
  const isPrivate = isVaultRoute || pathname.startsWith("/admin") || pathname.startsWith("/api/");

  if (authEnabled && isVaultRoute) {
    const sessionCookie = request.cookies?.get?.("digilocker-session");
    if (!sessionCookie?.value) {
      return enhanceResponse(NextResponse.redirect(new URL("/login", request.url)), traceId, isPrivate);
    }
  }

  if (pathname.startsWith("/admin")) {
    let isAuthenticated = false;
    let userRole = null;

    // 1. Check NextAuth (Auth.js) session
    try {
      const { auth } = await import("./auth.js");
      const session = await auth();
      if (session?.user) {
        isAuthenticated = true;
        userRole = session.user.role || "user";
      }
    } catch {
      // Graceful fallback when outside NextAuth request context
    }

    // 2. Fallback to custom digilocker-session cookie
    if (!isAuthenticated) {
      const rawCookie = request.cookies?.get?.("digilocker-session");
      const cookieValue = typeof rawCookie === "object" ? rawCookie?.value : rawCookie;
      if (cookieValue) {
        const verified = verifySessionToken(cookieValue);
        if (verified) {
          isAuthenticated = true;
          userRole = verified.role || "user";
        }
      }
    }

    // 3. Unauthenticated -> redirect to /login
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return enhanceResponse(NextResponse.redirect(loginUrl), traceId, isPrivate);
    }

    // 4. Authenticated but unauthorized -> redirect to /forbidden
    if (userRole !== "admin") {
      return enhanceResponse(NextResponse.redirect(new URL("/forbidden", request.url)), traceId, isPrivate);
    }
  }

  const response = NextResponse.next();
  return enhanceResponse(response, traceId, isPrivate);
}

export default proxy;
