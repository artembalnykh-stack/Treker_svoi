import type { Prisma, TaskPriority, TaskStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { addDays, todayUtc } from "@/lib/dates";
import {
  PARTICIPANT_COLORS,
  STATUS_META,
  type TaskEventTypeValue,
} from "@/lib/constants";

type SeedParticipant = {
  name: string;
  color: string;
};

const SEED_PARTICIPANTS: SeedParticipant[] = [
  { name: "Анна", color: "sage" },
  { name: "Пётр", color: "terracotta" },
  { name: "Мария", color: "ochre" },
];

type SeedEvent = {
  type: TaskEventTypeValue;
  detail: string | null;
  actorName: string;
  daysAgo: number;
  hour: number;
};

type SeedTask = {
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueOffset: number | null;
  assigneeName: string | null;
  completedDaysAgo: number | null;
  createdDaysAgo: number;
  events: SeedEvent[];
};

function event(
  type: TaskEventTypeValue,
  actorName: string,
  daysAgo: number,
  detail: string | null = null,
  hour = 10,
): SeedEvent {
  return { type, detail, actorName, daysAgo, hour };
}

const movedDetail = (from: TaskStatus, to: TaskStatus) =>
  `${STATUS_META[from].label} → ${STATUS_META[to].label}`;

const SEED_TASKS: SeedTask[] = [
  {
    title: "Купить продукты к ужину",
    description: "Молоко, овощи, хлеб и что-нибудь к чаю.",
    status: "TODO",
    priority: "IMPORTANT",
    dueOffset: 1,
    assigneeName: "Анна",
    completedDaysAgo: null,
    createdDaysAgo: 1,
    events: [
      event("CREATED", "Анна", 1, "Задача появилась на доске", 9),
      event("ASSIGNED", "Анна", 1, "Ответственный: Анна", 9),
    ],
  },
  {
    title: "Оплатить интернет",
    description: null,
    status: "TODO",
    priority: "NORMAL",
    dueOffset: 3,
    assigneeName: "Пётр",
    completedDaysAgo: null,
    createdDaysAgo: 2,
    events: [
      event("CREATED", "Пётр", 2, "Задача появилась на доске", 12),
      event("ASSIGNED", "Пётр", 2, "Ответственный: Пётр", 12),
    ],
  },
  {
    title: "Позвонить в сервисный центр",
    description: "Уточнить, когда приедет мастер по установке полки.",
    status: "TODO",
    priority: "NORMAL",
    dueOffset: -1,
    assigneeName: null,
    completedDaysAgo: null,
    createdDaysAgo: 4,
    events: [event("CREATED", "Мария", 4, "Задача появилась на доске", 16)],
  },
  {
    title: "Разобрать полку с фотографиями",
    description: "Отобрать кадры для семейного альбома и подписать их.",
    status: "IN_PROGRESS",
    priority: "NORMAL",
    dueOffset: 5,
    assigneeName: "Анна",
    completedDaysAgo: null,
    createdDaysAgo: 3,
    events: [
      event("CREATED", "Анна", 3, "Задача появилась на доске", 11),
      event("ASSIGNED", "Анна", 3, "Ответственный: Анна", 11),
      event("MOVED", "Анна", 2, movedDetail("TODO", "IN_PROGRESS"), 19),
    ],
  },
  {
    title: "Записать рецепт бабушкиного пирога",
    description: "Пока помним все пропорции — в семейную тетрадь рецептов.",
    status: "IN_PROGRESS",
    priority: "NORMAL",
    dueOffset: null,
    assigneeName: "Мария",
    completedDaysAgo: null,
    createdDaysAgo: 2,
    events: [
      event("CREATED", "Мария", 2, "Задача появилась на доске", 10),
      event("ASSIGNED", "Мария", 2, "Ответственный: Мария", 10),
      event("MOVED", "Мария", 1, movedDetail("TODO", "IN_PROGRESS"), 18),
    ],
  },
  {
    title: "Забронировать столик на субботу",
    description: "Уютное кафе рядом с парком, на четверых, к 18:00.",
    status: "DONE",
    priority: "IMPORTANT",
    dueOffset: -1,
    assigneeName: "Пётр",
    completedDaysAgo: 1,
    createdDaysAgo: 5,
    events: [
      event("CREATED", "Пётр", 5, "Задача появилась на доске", 13),
      event("ASSIGNED", "Пётр", 5, "Ответственный: Пётр", 13),
      event("MOVED", "Пётр", 3, movedDetail("TODO", "IN_PROGRESS"), 17),
      event("MOVED", "Пётр", 1, movedDetail("IN_PROGRESS", "DONE"), 20),
    ],
  },
  {
    title: "Полить цветы на балконе",
    description: null,
    status: "DONE",
    priority: "NORMAL",
    dueOffset: -2,
    assigneeName: "Мария",
    completedDaysAgo: 2,
    createdDaysAgo: 4,
    events: [
      event("CREATED", "Мария", 4, "Задача появилась на доске", 8),
      event("ASSIGNED", "Мария", 4, "Ответственный: Мария", 8),
      event("MOVED", "Мария", 2, movedDetail("TODO", "DONE"), 9),
    ],
  },
  {
    title: "Написать список дел на выходные",
    description: "Тихо, без спешки: три-четыре приятных пункта.",
    status: "DONE",
    priority: "NORMAL",
    dueOffset: null,
    assigneeName: "Анна",
    completedDaysAgo: 0,
    createdDaysAgo: 1,
    events: [
      event("CREATED", "Анна", 1, "Задача появилась на доске", 8),
      event("ASSIGNED", "Анна", 1, "Ответственный: Анна", 8),
      event("MOVED", "Анна", 0, movedDetail("TODO", "DONE"), 7),
    ],
  },
];

function timestamp(daysAgo: number, hour: number): Date {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  date.setUTCHours(hour, 0, 0, 0);
  return date;
}

function dueDate(offset: number | null): Date | null {
  if (offset === null) return null;
  return addDays(todayUtc(), offset);
}

async function seedContent(
  tx: Prisma.TransactionClient,
  boardId: string,
  participants: Array<{ id: string; name: string }>,
) {
  const byName = new Map(participants.map((p) => [p.name, p]));

  for (const seed of SEED_TASKS) {
    const assignee = seed.assigneeName
      ? (byName.get(seed.assigneeName) ?? null)
      : null;
    const completedAt =
      seed.completedDaysAgo === null
        ? null
        : timestamp(seed.completedDaysAgo, 12);

    const task = await tx.task.create({
      data: {
        boardId,
        title: seed.title,
        description: seed.description,
        status: seed.status,
        priority: seed.priority,
        dueDate: dueDate(seed.dueOffset),
        assigneeId: assignee?.id ?? null,
        completedAt,
        createdAt: timestamp(seed.createdDaysAgo, 7),
        updatedAt: completedAt ?? timestamp(seed.createdDaysAgo, 8),
      },
    });

    await tx.taskEvent.createMany({
      data: seed.events.map((item) => {
        const actor = byName.get(item.actorName);
        return {
          boardId,
          taskId: task.id,
          taskTitle: seed.title,
          type: item.type,
          detail: item.detail,
          actorId: actor?.id ?? null,
          actorName: item.actorName,
          createdAt: timestamp(item.daysAgo, item.hour),
        };
      }),
    });
  }
}

export async function createDemoBoard(sessionToken: string) {
  return prisma.$transaction(
    async (tx) => {
      const board = await tx.board.create({
        data: {
          sessionToken,
          participants: {
            create: SEED_PARTICIPANTS.map((participant) => ({
              name: participant.name,
              color: participant.color,
            })),
          },
        },
        include: { participants: true },
      });

      await seedContent(tx, board.id, board.participants);
      return board;
    },
    { timeout: 20_000 },
  );
}

export async function resetDemoBoard(
  boardId: string,
  mode: "reseed" | "clear",
) {
  return prisma.$transaction(
    async (tx) => {
      const board = await tx.board.findUnique({
        where: { id: boardId },
        include: { participants: { orderBy: { createdAt: "asc" } } },
      });
      if (!board) throw new Error("BOARD_NOT_FOUND");

      await tx.taskEvent.deleteMany({ where: { boardId } });
      await tx.task.deleteMany({ where: { boardId } });

      let participants = board.participants;

      if (mode === "reseed") {
        await tx.participant.deleteMany({ where: { boardId } });
        participants = await Promise.all(
          SEED_PARTICIPANTS.map((participant) =>
            tx.participant.create({
              data: {
                boardId,
                name: participant.name,
                color: participant.color,
              },
            }),
          ),
        );
        await seedContent(tx, boardId, participants);
      } else if (participants.length === 0) {
        participants = [
          await tx.participant.create({
            data: {
              boardId,
              name: "Анна",
              color: PARTICIPANT_COLORS[0],
            },
          }),
        ];
      }

      await tx.board.update({
        where: { id: boardId },
        data: { updatedAt: new Date() },
      });

      return participants;
    },
    { timeout: 20_000 },
  );
}
