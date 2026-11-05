import type { Prisma, TaskEventType, TaskStatus } from "@prisma/client";

import {
  STATUS_META,
  type TaskEventTypeValue,
  type TaskPriorityValue,
  type TaskStatusValue,
} from "@/lib/constants";
import {
  endOfWeek,
  formatEventTime,
  formatWeekRange,
  getDuePresentation,
  getInitials,
  startOfWeek,
} from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import type {
  BoardEventView,
  BoardTaskView,
  ParticipantStats,
  ParticipantView,
  TaskEventView,
  WeekSummary,
} from "@/lib/types";

export const EVENT_LABELS: Record<TaskEventTypeValue, string> = {
  CREATED: "Задача создана",
  UPDATED: "Задача изменена",
  ASSIGNED: "Смена ответственного",
  MOVED: "Изменён статус",
  DELETED: "Задача удалена",
};

type TaskWithRelations = Prisma.TaskGetPayload<{
  include: { assignee: true; events: true };
}>;

export function toParticipantView(participant: {
  id: string;
  name: string;
  color: string;
}): ParticipantView {
  return {
    id: participant.id,
    name: participant.name,
    color: participant.color,
    initials: getInitials(participant.name),
  };
}

function toEventView(event: {
  id: string;
  type: TaskEventType;
  detail: string | null;
  actorName: string | null;
  createdAt: Date;
}): TaskEventView {
  const type = event.type as TaskEventTypeValue;
  return {
    id: event.id,
    type,
    label: EVENT_LABELS[type],
    detail: event.detail,
    actorName: event.actorName,
    createdLabel: formatEventTime(event.createdAt),
    createdAtIso: event.createdAt.toISOString(),
  };
}

function toTaskView(task: TaskWithRelations): BoardTaskView {
  const status = task.status as TaskStatusValue;
  const due = getDuePresentation(task.dueDate, status);

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status,
    priority: task.priority as TaskPriorityValue,
    dueDateIso: task.dueDate ? task.dueDate.toISOString().slice(0, 10) : null,
    dueLabel: due.label,
    dueTone: due.tone,
    isOverdue: due.isOverdue,
    assignee: task.assignee ? toParticipantView(task.assignee) : null,
    createdAtLabel: formatEventTime(task.createdAt),
    events: task.events.map(toEventView),
  };
}

function sortTasks(a: TaskWithRelations, b: TaskWithRelations): number {
  if (a.status === "DONE" && b.status === "DONE") {
    return (
      (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0)
    );
  }

  if (a.priority !== b.priority) {
    return a.priority === "IMPORTANT" ? -1 : 1;
  }

  const aDue = a.dueDate?.getTime() ?? Number.POSITIVE_INFINITY;
  const bDue = b.dueDate?.getTime() ?? Number.POSITIVE_INFINITY;
  if (aDue !== bDue) return aDue - bDue;

  return b.createdAt.getTime() - a.createdAt.getTime();
}

export async function getBoardTasks(boardId: string): Promise<BoardTaskView[]> {
  const tasks = await prisma.task.findMany({
    where: { boardId },
    include: {
      assignee: true,
      events: {
        orderBy: { createdAt: "desc" },
        take: 30,
      },
    },
  });

  return [...tasks].sort(sortTasks).map(toTaskView);
}

export async function getTasksByStatus(boardId: string, status: TaskStatus) {
  const tasks = await getBoardTasks(boardId);
  return tasks.filter((task) => task.status === status);
}

export async function getParticipantStats(
  boardId: string,
): Promise<Record<string, ParticipantStats>> {
  const weekStart = startOfWeek();
  const tasks = await prisma.task.findMany({
    where: { boardId },
    select: {
      assigneeId: true,
      status: true,
      completedAt: true,
    },
  });

  const stats: Record<string, ParticipantStats> = {};
  for (const task of tasks) {
    if (!task.assigneeId) continue;
    const item = (stats[task.assigneeId] ??= {
      openCount: 0,
      completedThisWeek: 0,
    });
    if (task.status !== "DONE") item.openCount += 1;
    if (task.completedAt && task.completedAt >= weekStart) {
      item.completedThisWeek += 1;
    }
  }
  return stats;
}

export async function getWeekSummary(boardId: string): Promise<WeekSummary> {
  const weekStart = startOfWeek();
  const weekEnd = endOfWeek();
  const nextWeekStart = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [participants, completed] = await Promise.all([
    prisma.participant.findMany({
      where: { boardId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.task.findMany({
      where: {
        boardId,
        status: "DONE",
        completedAt: { gte: weekStart, lt: nextWeekStart },
      },
      include: { assignee: true },
      orderBy: { completedAt: "desc" },
    }),
  ]);

  const byParticipant = new Map<
    string,
    { count: number; titles: string[] }
  >();
  let unassignedCount = 0;
  const unassignedTitles: string[] = [];

  for (const task of completed) {
    if (!task.assigneeId) {
      unassignedCount += 1;
      unassignedTitles.push(task.title);
      continue;
    }
    const row = byParticipant.get(task.assigneeId) ?? {
      count: 0,
      titles: [],
    };
    row.count += 1;
    row.titles.push(task.title);
    byParticipant.set(task.assigneeId, row);
  }

  const rows: WeekSummary["rows"] = participants.map((participant) => {
    const row = byParticipant.get(participant.id);
    return {
      participant: toParticipantView(participant),
      count: row?.count ?? 0,
      completedTitles: row?.titles ?? [],
    };
  });

  if (unassignedCount > 0) {
    rows.push({
      participant: null,
      count: unassignedCount,
      completedTitles: unassignedTitles,
    });
  }

  return {
    weekStart,
    weekEnd,
    weekLabel: formatWeekRange(weekStart),
    total: completed.length,
    rows,
    completedTasks: completed.map((task) => ({
      id: task.id,
      title: task.title,
      assigneeName: task.assignee?.name ?? null,
      completedLabel: task.completedAt
        ? formatEventTime(task.completedAt)
        : "—",
    })),
  };
}

export async function getRecentBoardEvents(
  boardId: string,
  take = 30,
): Promise<BoardEventView[]> {
  const events = await prisma.taskEvent.findMany({
    where: { boardId },
    orderBy: { createdAt: "desc" },
    take,
  });

  return events.map((event) => {
    const type = event.type as TaskEventTypeValue;
    return {
      id: event.id,
      type,
      taskTitle: event.taskTitle,
      taskId: event.taskId,
      label: EVENT_LABELS[type],
      detail: event.detail,
      actorName: event.actorName,
      createdLabel: formatEventTime(event.createdAt),
    };
  });
}

export function getStatusLabel(status: TaskStatusValue): string {
  return STATUS_META[status].label;
}
