"use client";

import {
  useCallback,
  useOptimistic,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GripVertical,
  Plus,
  Smartphone,
  Sparkles,
  Users,
  X,
} from "lucide-react";

import { BoardColumn } from "@/components/board/board-column";
import { TaskDialog } from "@/components/board/task-dialog";
import { Avatar } from "@/components/ui/avatar";
import { Toast, type ToastData } from "@/components/ui/toast";
import { moveTask } from "@/app/actions/tasks";
import {
  STATUS_ORDER,
  type TaskStatusValue,
} from "@/lib/constants";
import { pluralize } from "@/lib/dates";
import type { BoardTaskView, ParticipantView } from "@/lib/types";

type DialogState =
  | { mode: "create" }
  | { mode: "edit"; taskId: string }
  | null;

export function BoardView({
  tasks,
  participants,
  actorName,
  filter,
  allTasksCount,
}: {
  tasks: BoardTaskView[];
  participants: ParticipantView[];
  actorName: string | null;
  filter: ParticipantView | null;
  allTasksCount: number;
}) {
  const router = useRouter();
  const [dialog, setDialog] = useState<DialogState>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const [optimisticTasks, applyMove] = useOptimistic(
    tasks,
    (current, payload: { id: string; status: TaskStatusValue }) =>
      current.map((task) =>
        task.id === payload.id ? { ...task, status: payload.status } : task,
      ),
  );

  const dismissToast = useCallback(() => setToast(null), []);

  const showToast = useCallback(
    (tone: ToastData["tone"], message: string) => {
      setToast({ id: Date.now(), tone, message });
    },
    [],
  );

  const grouped = {
    TODO: optimisticTasks.filter((task) => task.status === "TODO"),
    IN_PROGRESS: optimisticTasks.filter(
      (task) => task.status === "IN_PROGRESS",
    ),
    DONE: optimisticTasks.filter((task) => task.status === "DONE"),
  };

  const handleMove = (taskId: string, status: TaskStatusValue) => {
    const task = optimisticTasks.find((item) => item.id === taskId);
    if (!task || task.status === status) return;
    setDraggingId(null);

    startTransition(async () => {
      applyMove({ id: taskId, status });
      const result = await moveTask(taskId, status);
      if (!result.ok) {
        showToast("error", result.message ?? "Не удалось изменить статус.");
        return;
      }
      if (status === "DONE") {
        showToast(
          "success",
          result.message ?? "Готово. Задача отмечена выполненной.",
        );
      }
      router.refresh();
    });
  };

  const dialogTask =
    dialog?.mode === "edit"
      ? optimisticTasks.find((task) => task.id === dialog.taskId)
      : undefined;

  const showDialog =
    dialog?.mode === "create" || (dialog?.mode === "edit" && dialogTask);

  const handleSaved = (message: string) => {
    setDialog(null);
    showToast("success", message);
    router.refresh();
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {filter ? (
            <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-sage/30 bg-sage-soft/65 py-1 pl-1.5 pr-1.5 text-[0.8rem] font-bold text-sage-deep">
              <Avatar participant={filter} size={28} />
              Только {filter.name}
              <Link
                href="/"
                className="grid h-8 w-8 place-items-center rounded-full transition-colors hover:bg-sage/15"
                aria-label="Показать задачи всей семьи"
              >
                <X size={15} aria-hidden="true" />
              </Link>
            </span>
          ) : (
            <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white/60 px-3.5 text-[0.8rem] font-bold text-ink-soft">
              <Users size={16} aria-hidden="true" />
              Вся семья
            </span>
          )}

          <span className="text-[0.78rem] font-medium text-muted">
            {optimisticTasks.length}{" "}
            {pluralize(optimisticTasks.length, [
              "задача",
              "задачи",
              "задач",
            ])}
            {actorName ? ` · действуете как ${actorName}` : ""}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <p className="hidden items-center gap-1.5 text-[0.72rem] text-muted lg:flex">
            <GripVertical size={14} aria-hidden="true" />
            Перетащите карточку или смените статус в ней
          </p>
          <p className="flex items-center gap-1.5 text-[0.72rem] text-muted lg:hidden">
            <Smartphone size={14} aria-hidden="true" />
            Статус меняется в карточке
          </p>
          <button
            type="button"
            className="btn btn-primary btn-sm sm:min-h-12 sm:px-4"
            onClick={() => setDialog({ mode: "create" })}
          >
            <Plus size={18} strokeWidth={2.4} aria-hidden="true" />
            Новая задача
          </button>
        </div>
      </div>

      {allTasksCount === 0 && (
        <div className="surface relative mb-4 flex flex-col items-start gap-3 overflow-hidden p-4 sm:flex-row sm:items-center sm:p-5">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-sage-soft text-sage-dark">
            <Sparkles size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[0.95rem] font-extrabold text-ink">
              На доске пока тихо
            </p>
            <p className="mt-0.5 text-[0.82rem] leading-snug text-muted">
              Начните с одного небольшого дела — его всегда можно передвинуть
              или переписать.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setDialog({ mode: "create" })}
          >
            Создать первую
          </button>
        </div>
      )}

      {filter && optimisticTasks.length === 0 && allTasksCount > 0 && (
        <div className="surface-muted mb-4 flex flex-col items-start gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.84rem] leading-snug text-ink-soft">
            У {filter.name} пока нет задач в этом фильтре. Это не ошибка — можно
            посмотреть всю семью.
          </p>
          <Link href="/" className="btn btn-secondary btn-sm">
            <Users size={15} aria-hidden="true" />
            Вся семья
          </Link>
        </div>
      )}

      <div className="kanban-scroll scrollbar-soft">
        {STATUS_ORDER.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            tasks={grouped[status]}
            draggingId={draggingId}
            onMove={handleMove}
            onOpen={(taskId) => setDialog({ mode: "edit", taskId })}
            onCreate={
              status === "TODO"
                ? () => setDialog({ mode: "create" })
                : undefined
            }
            onDragStart={setDraggingId}
            onDragEnd={() => setDraggingId(null)}
          />
        ))}
      </div>

      {showDialog && (
        <TaskDialog
          key={dialog?.mode === "edit" ? dialogTask?.id : "create"}
          mode={dialog?.mode === "edit" ? "edit" : "create"}
          task={dialog?.mode === "edit" ? dialogTask : undefined}
          participants={participants}
          actorName={actorName}
          onClose={() => setDialog(null)}
          onSaved={handleSaved}
        />
      )}

      {toast && <Toast toast={toast} onDismiss={dismissToast} />}
    </div>
  );
}
