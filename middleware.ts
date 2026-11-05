import { NextResponse, type NextRequest } from "next/server";

import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "@/lib/constants";
import { createSessionToken } from "@/lib/session-token";

export function middleware(request: NextRequest) {
  const existingToken = request.cookies.get(SESSION_COOKIE)?.value;

  if (existingToken) {
    return NextResponse.next();
  }

  const token = createSessionToken();
  request.cookies.set(SESSION_COOKIE, token);

  const response = NextResponse.next({ request });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Все страницы, кроме статики и healthcheck.
     * Middleware выдаёт изолированной демо-сессии её собственный ключ.
     */
    "/((?!api/health|_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|robots.txt).*)",
  ],
};
