import { cache } from "react";
import { Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ACTOR_COOKIE, SESSION_COOKIE } from "@/lib/constants";
import { createDemoBoard } from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";

type BoardWithParticipants = Prisma.BoardGetPayload<{
  include: { participants: true };
}>;

async function findBoard(sessionToken: string) {
  return prisma.board.findUnique({
    where: { sessionToken },
    include: {
      participants: { orderBy: { createdAt: "asc" } },
    },
  });
}

function isUniqueConflict(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

async function findOrCreateBoard(
  sessionToken: string,
): Promise<BoardWithParticipants> {
  const existing = await findBoard(sessionToken);
  if (existing) return existing;

  try {
    return await createDemoBoard(sessionToken);
  } catch (error) {
    // Два параллельных запроса могли одновременно создать доску.
    if (isUniqueConflict(error)) {
      const board = await findBoard(sessionToken);
      if (board) return board;
    }
    throw error;
  }
}

/**
 * Единая точка доступа к текущей демо-доске.
 * Все дальнейшие запросы обязаны фильтровать данные по board.id.
 */
export const getBoardContext = cache(async () => {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionToken) {
    // Страховка на случай, если middleware не выполнился.
    redirect("/api/session");
  }

  const board = await findOrCreateBoard(sessionToken);
  const requestedActorId = cookieStore.get(ACTOR_COOKIE)?.value;
  const actor =
    board.participants.find((item) => item.id === requestedActorId) ??
    board.participants[0] ??
    null;

  return {
    sessionToken,
    board,
    participants: board.participants,
    actor,
  };
});

export async function getActorForMutation() {
  const context = await getBoardContext();
  return { ...context, actorId: context.actor?.id ?? null };
}
