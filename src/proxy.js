import { NextResponse } from "next/server.js";
import { verifySessionToken } from "./lib/auth.js";

/**
 * Next.js 16 Proxy Convention for Route-Level Authorization
 * Protects privileged routes (/admin) by verifying user authentication and role.
 */
export const config = {
  matcher: ["/admin/:path*"],
};

export async function proxy(request) {
  const url = request.nextUrl || new URL(request.url);
  const pathname = url.pathname;

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
      return NextResponse.redirect(loginUrl);
    }

    // 4. Authenticated but unauthorized -> redirect to /forbidden
    if (userRole !== "admin") {
      return NextResponse.redirect(new URL("/forbidden", request.url));
    }
  }

  return NextResponse.next();
}

export default proxy;
