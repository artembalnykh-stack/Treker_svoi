"use client";

import {
  ArrowLeftRight,
  CalendarDays,
  ChevronDown,
  Flag,
  Pencil,
} from "lucide-react";

import { Avatar, UnassignedAvatar } from "@/components/ui/avatar";
import { StatusIcon } from "@/components/ui/task-icons";
import {
  PRIORITY_META,
  STATUS_META,
  STATUS_ORDER,
  type TaskStatusValue,
} from "@/lib/constants";
import type { BoardTaskView } from "@/lib/types";

const dueToneClasses: Record<BoardTaskView["dueTone"], string> = {
  overdue: "text-terracotta-dark",
  soon: "text-ochre-ink",
  normal: "text-muted",
  done: "text-muted",
};

export function TaskCard({
  task,
  onOpen,
  onMove,
  onDragStart,
  onDragEnd,
  dragging = false,
}: {
  task: BoardTaskView;
  onOpen: () => void;
  onMove: (status: TaskStatusValue) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  dragging?: boolean;
}) {
  const isDone = task.status === "DONE";
  const isImportant = task.priority === "IMPORTANT";

  return (
    <article
      className="task-card group"
      data-important={isImportant}
      data-dragging={dragging ? "true" : "false"}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", task.id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      aria-label={`Задача «${task.title}»`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <span className="badge badge-neutral gap-1">
            <StatusIcon status={task.status} size={12} />
            {STATUS_META[task.status].shortLabel}
          </span>
          {isImportant && (
            <span className="badge badge-terracotta gap-1">
              <Flag size={11} strokeWidth={2.4} aria-hidden="true" />
              {PRIORITY_META.IMPORTANT.label}
            </span>
          )}
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-icon btn-sm -mr-1 -mt-1 shrink-0 opacity-70 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          onClick={onOpen}
          aria-label={`Редактировать задачу «${task.title}»`}
        >
          <Pencil size={16} strokeWidth={2.1} aria-hidden="true" />
        </button>
      </div>

      <button
        type="button"
        className="mt-1.5 block w-full rounded-lg text-left"
        onClick={onOpen}
      >
        <span
          className={`block text-[0.97rem] font-bold leading-snug tracking-[-0.012em] text-ink ${
            isDone ? "text-ink-soft" : ""
          }`}
        >
          {task.title}
        </span>
      </button>

      {task.description && (
        <p className="mt-1 line-clamp-2 text-[0.79rem] leading-snug text-muted">
          {task.description}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.75rem] font-semibold">
        {task.dueLabel && (
          <span
            className={`inline-flex items-center gap-1.5 ${dueToneClasses[task.dueTone]}`}
          >
            <CalendarDays size={13} strokeWidth={2.1} aria-hidden="true" />
            {task.dueLabel}
          </span>
        )}
        <span className="inline-flex min-w-0 items-center gap-1.5 text-muted">
          {task.assignee ? (
            <>
              <Avatar participant={task.assignee} size={22} />
              <span className="truncate">{task.assignee.name}</span>
            </>
          ) : (
            <>
              <UnassignedAvatar size={22} />
              <span className="truncate">Без ответственного</span>
            </>
          )}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-line/75 pt-2.5">
        <span className="inline-flex items-center gap-1 text-[0.66rem] font-bold uppercase tracking-[0.07em] text-muted">
          <ArrowLeftRight size={12} aria-hidden="true" />
          статус
        </span>
        <div className="status-select">
          <select
            value={task.status}
            aria-label={`Статус задачи «${task.title}»`}
            onChange={(event) =>
              onMove(event.target.value as TaskStatusValue)
            }
          >
            {STATUS_ORDER.map((status) => (
              <option key={status} value={status}>
                {STATUS_META[status].label}
              </option>
            ))}
          </select>
          <ChevronDown size={15} aria-hidden="true" />
        </div>
      </div>
    </article>
  );
}
