import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret-change-in-production-abc123"
);

async function getSession(req: NextRequest) {
  // NextAuth v5 在生产环境使用 __Secure- 前缀
  const token =
    req.cookies.get("__Secure-authjs.session-token")?.value ||
    req.cookies.get("authjs.session-token")?.value;

  if (!token) return null;

  try {
    const verified = await jwtVerify(token, AUTH_SECRET);
    return verified.payload;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const session = await getSession(req);
  const isLoggedIn = !!session;
  const { pathname } = req.nextUrl;

  const protectedPaths = [
    "/write",
    "/translate",
    "/history",
    "/check",
    "/notes",
    "/practice",
    "/settings",
  ];

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && (pathname === "/auth/login" || pathname === "/auth/register")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
