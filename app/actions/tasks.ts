"use server";

import type { Prisma, TaskStatus } from "@prisma/client";

import {
  STATUS_META,
  STATUS_ORDER,
  type TaskStatusValue,
} from "@/lib/constants";
import { revalidateBoard } from "@/lib/revalidate";
import { prisma } from "@/lib/prisma";
import { getBoardContext } from "@/lib/session";
import type { ActionState, ActionResult } from "@/lib/types";
import { parseTaskForm } from "@/lib/validation";

function actorSnapshot(actor: { id: string; name: string } | null) {
  return {
    actorId: actor?.id ?? null,
    actorName: actor?.name ?? null,
  };
}

function databaseError(action: string) {
  console.error(`[svoi] Не удалось выполнить действие: ${action}`);
  return {
    ok: false as const,
    message:
      "Не удалось сохранить изменения. Проверьте соединение и попробуйте ещё раз.",
  };
}

export async function createTask(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { board, participants, actor } = await getBoardContext();
  const { values, fieldErrors } = parseTaskForm(formData, {
    withStatus: false,
  });

  if (!values) {
    return {
      ok: false,
      message: "Проверьте поля формы.",
      fieldErrors,
    };
  }

  const assignee = values.assigneeId
    ? participants.find((item) => item.id === values.assigneeId)
    : null;

  if (values.assigneeId && !assignee) {
    return {
      ok: false,
      message: "Выбранный участник не найден на этой доске.",
      fieldErrors: { assigneeId: "Выберите участника из списка" },
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          boardId: board.id,
          title: values.title,
          description: values.description,
          status: "TODO",
          priority: values.priority,
          dueDate: values.dueDate,
          assigneeId: assignee?.id ?? null,
        },
      });

      const events: Prisma.TaskEventCreateManyInput[] = [
        {
          boardId: board.id,
          taskId: task.id,
          taskTitle: task.title,
          type: "CREATED",
          detail: "Задача появилась на доске",
          ...actorSnapshot(actor),
        },
      ];

      if (assignee) {
        events.push({
          boardId: board.id,
          taskId: task.id,
          taskTitle: task.title,
          type: "ASSIGNED",
          detail: `Ответственный: ${assignee.name}`,
          ...actorSnapshot(actor),
        });
      }

      await tx.taskEvent.createMany({ data: events });
    });

    revalidateBoard();
    return {
      ok: true,
      message: "Задача создана и ждёт в «К выполнению».",
      nonce: Date.now(),
    };
  } catch {
    return databaseError("createTask");
  }
}

export async function updateTask(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { board, participants, actor } = await getBoardContext();
  const taskId = String(formData.get("id") ?? "");

  if (!taskId) {
    return { ok: false, message: "Задача не найдена." };
  }

  const task = await prisma.task.findFirst({
    where: { id: taskId, boardId: board.id },
  });

  if (!task) {
    return {
      ok: false,
      message: "Задача не найдена. Возможно, её уже удалили.",
    };
  }

  const { values, fieldErrors } = parseTaskForm(formData, {
    withStatus: true,
  });

  if (!values) {
    return {
      ok: false,
      message: "Проверьте поля формы.",
      fieldErrors,
    };
  }

  const assignee = values.assigneeId
    ? participants.find((item) => item.id === values.assigneeId)
    : null;

  if (values.assigneeId && !assignee) {
    return {
      ok: false,
      message: "Выбранный участник не найден на этой доске.",
      fieldErrors: { assigneeId: "Выберите участника из списка" },
    };
  }

  const changedFields: string[] = [];
  if (task.title !== values.title) changedFields.push("название");
  if ((task.description ?? null) !== values.description) {
    changedFields.push("описание");
  }
  if ((task.dueDate?.getTime() ?? null) !== (values.dueDate?.getTime() ?? null)) {
    changedFields.push("срок");
  }
  if (task.priority !== values.priority) changedFields.push("приоритет");

  const statusChanged = task.status !== values.status;
  const assigneeChanged = (task.assigneeId ?? null) !== (values.assigneeId ?? null);

  if (!statusChanged && !assigneeChanged && changedFields.length === 0) {
    return {
      ok: true,
      message: "Всё уже сохранено.",
      nonce: Date.now(),
    };
  }

  const nextCompletedAt =
    values.status === "DONE" ? (task.completedAt ?? new Date()) : null;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.task.update({
        where: { id: task.id },
        data: {
          title: values.title,
          description: values.description,
          status: values.status,
          priority: values.priority,
          dueDate: values.dueDate,
          assigneeId: assignee?.id ?? null,
          completedAt: nextCompletedAt,
        },
      });

      const events: Prisma.TaskEventCreateManyInput[] = [];

      if (assigneeChanged) {
        events.push({
          boardId: board.id,
          taskId: task.id,
          taskTitle: values.title,
          type: "ASSIGNED",
          detail: assignee
            ? `Ответственный: ${assignee.name}`
            : "Задача осталась без ответственного",
          ...actorSnapshot(actor),
        });
      }

      if (statusChanged) {
        events.push({
          boardId: board.id,
          taskId: task.id,
          taskTitle: values.title,
          type: "MOVED",
          detail: `${STATUS_META[task.status as TaskStatusValue].label} → ${STATUS_META[values.status].label}`,
          ...actorSnapshot(actor),
        });
      }

      if (changedFields.length > 0) {
        events.push({
          boardId: board.id,
          taskId: task.id,
          taskTitle: values.title,
          type: "UPDATED",
          detail: `Изменено: ${changedFields.join(", ")}`,
          ...actorSnapshot(actor),
        });
      }

      if (events.length > 0) {
        await tx.taskEvent.createMany({ data: events });
      }
    });

    revalidateBoard();
    return {
      ok: true,
      message: statusChanged && values.status === "DONE"
        ? "Отлично, задача в «Готово»."
        : "Изменения сохранены.",
      nonce: Date.now(),
    };
  } catch {
    return databaseError("updateTask");
  }
}

export async function deleteTask(taskId: string): Promise<ActionResult> {
  const { board, actor } = await getBoardContext();
  const task = await prisma.task.findFirst({
    where: { id: taskId, boardId: board.id },
  });

  if (!task) {
    return { ok: false, message: "Задача не найдена." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.taskEvent.create({
        data: {
          boardId: board.id,
          taskId: task.id,
          taskTitle: task.title,
          type: "DELETED",
          detail: "Задача удалена",
          ...actorSnapshot(actor),
        },
      });
      await tx.task.delete({ where: { id: task.id } });
    });

    revalidateBoard();
    return { ok: true, message: "Задача удалена." };
  } catch {
    return databaseError("deleteTask");
  }
}

export async function moveTask(
  taskId: string,
  status: TaskStatusValue,
): Promise<ActionResult> {
  if (!STATUS_ORDER.includes(status)) {
    return { ok: false, message: "Неизвестный статус задачи." };
  }

  const { board, actor } = await getBoardContext();
  const task = await prisma.task.findFirst({
    where: { id: taskId, boardId: board.id },
  });

  if (!task) {
    return {
      ok: false,
      message: "Задача не найдена. Возможно, её уже удалили.",
    };
  }

  if (task.status === status) {
    return { ok: true };
  }

  const nextCompletedAt =
    status === "DONE" ? (task.completedAt ?? new Date()) : null;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.task.update({
        where: { id: task.id },
        data: {
          status: status as TaskStatus,
          completedAt: nextCompletedAt,
        },
      });
      await tx.taskEvent.create({
        data: {
          boardId: board.id,
          taskId: task.id,
          taskTitle: task.title,
          type: "MOVED",
          detail: `${STATUS_META[task.status as TaskStatusValue].label} → ${STATUS_META[status].label}`,
          ...actorSnapshot(actor),
        },
      });
    });

    revalidateBoard();
    return {
      ok: true,
      message:
        status === "DONE"
          ? "Готово. Задача отмечена выполненной."
          : `Задача перемещена в «${STATUS_META[status].label}».`,
    };
  } catch {
    return databaseError("moveTask");
  }
}
