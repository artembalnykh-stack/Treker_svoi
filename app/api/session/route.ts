import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "@/lib/constants";
import { createSessionToken } from "@/lib/session-token";

export const dynamic = "force-dynamic";

/**
 * Запасной вход, если cookie ещё не установлена (например, middleware
 * пропустил запрос). Создаёт новую изолированную демо-сессию.
 */
export async function GET(request: Request) {
  const cookieStore = await cookies();
  let token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    token = createSessionToken();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
  }

  return NextResponse.redirect(new URL("/", request.url));
}
