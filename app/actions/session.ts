"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import {
  ACTOR_COOKIE,
  SESSION_MAX_AGE,
} from "@/lib/constants";
import { getBoardContext } from "@/lib/session";
import type { ActionResult } from "@/lib/types";

export async function selectParticipant(
  participantId: string,
): Promise<ActionResult> {
  const { participants } = await getBoardContext();
  const participant = participants.find((item) => item.id === participantId);

  if (!participant) {
    return { ok: false, message: "Участник не найден на этой доске." };
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTOR_COOKIE, participant.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  revalidatePath("/", "layout");
  return { ok: true, message: `Теперь действуете как ${participant.name}.` };
}
