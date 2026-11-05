"use server";

import { cookies } from "next/headers";

import { ACTOR_COOKIE, SESSION_MAX_AGE } from "@/lib/constants";
import { resetDemoBoard } from "@/lib/demo-data";
import { revalidateBoard } from "@/lib/revalidate";
import { getBoardContext } from "@/lib/session";
import type { ActionResult } from "@/lib/types";

export async function resetDemo(
  mode: "reseed" | "clear",
): Promise<ActionResult> {
  if (mode !== "reseed" && mode !== "clear") {
    return { ok: false, message: "Неизвестный вариант сброса." };
  }

  const { board } = await getBoardContext();

  try {
    const participants = await resetDemoBoard(board.id, mode);
    const nextActor = participants[0];

    if (nextActor) {
      const cookieStore = await cookies();
      cookieStore.set(ACTOR_COOKIE, nextActor.id, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: SESSION_MAX_AGE,
      });
    }

    revalidateBoard();
    return {
      ok: true,
      message:
        mode === "reseed"
          ? "Демо-доска собрана заново: участники и примеры задач на месте."
          : "Задачи очищены. Участники и их настройки остались.",
    };
  } catch {
    console.error("[svoi] Не удалось сбросить демо-доску");
    return {
      ok: false,
      message: "Не удалось сбросить доску. Попробуйте ещё раз.",
    };
  }
}
