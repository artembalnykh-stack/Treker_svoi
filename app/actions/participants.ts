"use server";

import { cookies } from "next/headers";

import {
  ACTOR_COOKIE,
  MAX_PARTICIPANTS,
  MIN_PARTICIPANTS,
  PARTICIPANT_COLORS,
  SESSION_MAX_AGE,
} from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { revalidateBoard } from "@/lib/revalidate";
import { getBoardContext } from "@/lib/session";
import type { ActionState, ActionResult } from "@/lib/types";
import { parseParticipantForm } from "@/lib/validation";

export async function addParticipant(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { board } = await getBoardContext();
  const { name, fieldErrors } = parseParticipantForm(formData);

  if (!name) {
    return {
      ok: false,
      message: "Проверьте имя участника.",
      fieldErrors,
    };
  }

  try {
    const outcome = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT "id" FROM "Board" WHERE "id" = ${board.id} FOR UPDATE`;

      const currentParticipants = await tx.participant.findMany({
        where: { boardId: board.id },
        select: { name: true, color: true },
      });

      if (currentParticipants.length >= MAX_PARTICIPANTS) {
        return { kind: "limit" as const };
      }

      if (
        currentParticipants.some(
          (item) =>
            item.name.toLocaleLowerCase("ru") === name.toLocaleLowerCase("ru"),
        )
      ) {
        return { kind: "duplicate" as const };
      }

      const usedColors = new Set(currentParticipants.map((item) => item.color));
      const color =
        PARTICIPANT_COLORS.find((item) => !usedColors.has(item)) ??
        PARTICIPANT_COLORS[
          currentParticipants.length % PARTICIPANT_COLORS.length
        ];

      await tx.participant.create({
        data: {
          boardId: board.id,
          name,
          color,
        },
      });

      return { kind: "added" as const };
    });

    if (outcome.kind === "limit") {
      return {
        ok: false,
        message: `На доске уже ${MAX_PARTICIPANTS} участников — это максимум. Удалите одного, чтобы добавить нового.`,
      };
    }

    if (outcome.kind === "duplicate") {
      return {
        ok: false,
        message: "Участник с таким именем уже есть на доске.",
        fieldErrors: { name: "Выберите другое имя" },
      };
    }

    revalidateBoard();
    return {
      ok: true,
      message: `${name} теперь на доске. Можно назначать задачи.`,
      nonce: Date.now(),
    };
  } catch {
    console.error("[svoi] Не удалось добавить участника");
    return {
      ok: false,
      message: "Не удалось добавить участника. Попробуйте ещё раз.",
    };
  }
}

export async function deleteParticipant(
  participantId: string,
): Promise<ActionResult> {
  const { board, actor } = await getBoardContext();

  try {
    const outcome = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT "id" FROM "Board" WHERE "id" = ${board.id} FOR UPDATE`;

      const participants = await tx.participant.findMany({
        where: { boardId: board.id },
        orderBy: { createdAt: "asc" },
      });

      if (participants.length <= MIN_PARTICIPANTS) {
        return { kind: "minimum" as const };
      }

      const participant = participants.find(
        (item) => item.id === participantId,
      );
      if (!participant) {
        return { kind: "missing" as const };
      }

      await tx.participant.delete({ where: { id: participant.id } });

      return {
        kind: "deleted" as const,
        participant,
        remaining: participants.filter((item) => item.id !== participant.id),
      };
    });

    if (outcome.kind === "minimum") {
      return {
        ok: false,
        message: "На доске должен остаться хотя бы один участник.",
      };
    }

    if (outcome.kind === "missing") {
      return { ok: false, message: "Участник не найден на этой доске." };
    }

    if (actor?.id === outcome.participant.id) {
      const nextActor = outcome.remaining[0];
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
    }

    revalidateBoard();
    return {
      ok: true,
      message: `${outcome.participant.name} удалён(а). Задачи остались на доске без ответственного.`,
    };
  } catch {
    console.error("[svoi] Не удалось удалить участника");
    return {
      ok: false,
      message: "Не удалось удалить участника. Попробуйте ещё раз.",
    };
  }
}
