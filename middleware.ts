import { NextRequest, NextResponse } from "next/server";

const publicPagePaths = new Set([
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
]);

function isPublicPath(pathname: string) {
  if (pathname.startsWith("/api/auth/")) {
    return true;
  }

  return publicPagePaths.has(pathname);
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  if (token || isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const loginUrl = new URL("/login", request.url);
  const destination = `${pathname}${search}`;

  if (destination !== "/login") {
    loginUrl.searchParams.set("callbackUrl", destination);
  }

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
