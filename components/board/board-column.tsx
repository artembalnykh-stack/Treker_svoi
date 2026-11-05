"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { TaskCard } from "@/components/board/task-card";
import { StatusIcon } from "@/components/ui/task-icons";
import {
  STATUS_META,
  type TaskStatusValue,
} from "@/lib/constants";
import type { BoardTaskView } from "@/lib/types";

const statusStyles: Record<
  TaskStatusValue,
  { icon: string; accent: string; empty: string }
> = {
  TODO: {
    icon: "bg-paper-deep text-ink-soft",
    accent: "bg-line-strong",
    empty: "Пока всё под контролем. Новые дела появятся здесь.",
  },
  IN_PROGRESS: {
    icon: "bg-ochre-soft text-ochre-ink",
    accent: "bg-ochre-soft",
    empty: "Ничего не в работе. Самое время выбрать дело по душе.",
  },
  DONE: {
    icon: "bg-sage-soft text-sage-deep",
    accent: "bg-sage-soft",
    empty: "Здесь будет видно, что уже получилось.",
  },
};

export function BoardColumn({
  status,
  tasks,
  draggingId,
  onMove,
  onOpen,
  onCreate,
  onDragStart,
  onDragEnd,
}: {
  status: TaskStatusValue;
  tasks: BoardTaskView[];
  draggingId: string | null;
  onMove: (taskId: string, status: TaskStatusValue) => void;
  onOpen: (taskId: string) => void;
  onCreate?: () => void;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
}) {
  const [over, setOver] = useState(false);
  const meta = STATUS_META[status];
  const styles = statusStyles[status];
  const headingId = `column-${status}`;

  return (
    <section
      className="column-drop flex min-h-[19rem] flex-col p-2 sm:min-h-[22rem]"
      data-over={over ? "true" : "false"}
      aria-labelledby={headingId}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        if (!over) setOver(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setOver(false);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        const taskId =
          event.dataTransfer.getData("text/plain") || draggingId;
        if (taskId) onMove(taskId, status);
      }}
    >
      <header className="flex items-center gap-2.5 px-1 pb-3 pt-1">
        <span
          className={`grid h-9 w-9 place-items-center rounded-xl ${styles.icon}`}
        >
          <StatusIcon status={status} size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h2
              id={headingId}
              className="truncate text-[0.94rem] font-extrabold tracking-[-0.015em] text-ink"
            >
              {meta.label}
            </h2>
            <span
              className="badge badge-neutral px-1.5 py-0 text-[0.68rem]"
              aria-label={`Задач: ${tasks.length}`}
            >
              {tasks.length}
            </span>
          </div>
          <p className="hidden text-[0.68rem] leading-tight text-muted sm:block">
            {meta.hint}
          </p>
        </div>
        {onCreate && (
          <button
            type="button"
            className="btn btn-ghost btn-icon btn-sm"
            onClick={onCreate}
            aria-label={`Добавить задачу в «${meta.label}»`}
            title="Добавить задачу"
          >
            <Plus size={18} aria-hidden="true" />
          </button>
        )}
      </header>

      <div className="grid flex-1 content-start gap-2.5">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            dragging={draggingId === task.id}
            onOpen={() => onOpen(task.id)}
            onMove={(nextStatus) => onMove(task.id, nextStatus)}
            onDragStart={() => onDragStart(task.id)}
            onDragEnd={onDragEnd}
          />
        ))}

        {tasks.length === 0 && (
          <div className="flex min-h-[9rem] flex-col items-center justify-center rounded-xl border border-dashed border-line-strong/90 bg-paper-soft/35 px-4 py-5 text-center">
            <span className={`mb-2 h-1 w-9 rounded-full ${styles.accent}`} />
            <p className="max-w-[15rem] text-[0.78rem] leading-snug text-muted">
              {styles.empty}
            </p>
            {onCreate && (
              <button
                type="button"
                className="btn btn-secondary btn-sm mt-3"
                onClick={onCreate}
              >
                <Plus size={15} aria-hidden="true" />
                Добавить
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
