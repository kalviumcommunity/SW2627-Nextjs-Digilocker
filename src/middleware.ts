import { NextResponse } from "next/server.js";
import type { NextRequest } from "next/server.js";

const protectedPaths = [
  { pattern: /^\/dashboard/, protected: true },
  { pattern: /^\/documents/, protected: true },
];

const publicPaths = [
  { pattern: /^\/login/, protected: false },
  { pattern: /^\/register/, protected: false },
  { pattern: /^\/api\/share/, protected: false },
  { pattern: /^\/$/, protected: false },
  { pattern: /^\/_next/, protected: false },
  { pattern: /^\/favicon\.ico/, protected: false },
];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const authEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED === "true";

  // Skip middleware if auth is not enabled
  if (!authEnabled) {
    return NextResponse.next();
  }

  // Check if this is a public path that doesn't require authentication
  for (const publicPath of publicPaths) {
    if (publicPath.pattern.test(pathname)) {
      return NextResponse.next();
    }
  }

  // Check if this is a protected path
  const isProtected = protectedPaths.some((route) => route.pattern.test(pathname));
  if (!isProtected) {
    return NextResponse.next();
  }

  // Check for session cookie on protected routes
  // Note: Full session verification happens server-side; Edge Runtime doesn't support Node.js crypto
  const sessionCookie = request.cookies.get("digilocker-session");

  if (!sessionCookie || !sessionCookie.value) {
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
