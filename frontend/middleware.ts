import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/auth/login", "/auth/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }
  const token = request.cookies.get("auth_token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
