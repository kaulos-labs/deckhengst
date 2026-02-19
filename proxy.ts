import { type NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "deckhengst_auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const password = process.env.DECK_PASSWORD;

  // If no password set, allow all
  if (!password) {
    return NextResponse.next();
  }

  // Allow login page and static assets
  if (pathname === "/login" || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Check auth cookie
  const authCookie = request.cookies.get(AUTH_COOKIE);
  if (authCookie?.value === password) {
    return NextResponse.next();
  }

  // Redirect to login
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
