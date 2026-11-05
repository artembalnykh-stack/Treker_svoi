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
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Flag,
  Loader2,
  Pencil,
  Play,
  Plus,
  Sparkles,
} from "lucide-react";

import { TaskDialog } from "@/components/board/task-dialog";
import { Avatar } from "@/components/ui/avatar";
import { Toast, type ToastData } from "@/components/ui/toast";
import { StatusIcon } from "@/components/ui/task-icons";
import { moveTask } from "@/app/actions/tasks";
import {
  PRIORITY_META,
  STATUS_META,
  type TaskStatusValue,
} from "@/lib/constants";
import { pluralize } from "@/lib/dates";
import type { BoardTaskView, ParticipantView } from "@/lib/types";

type OptimisticAction =
  | { type: "status"; id: string; status: TaskStatusValue }
  | { type: "remove"; id: string };

export function SimpleBoard({
  tasks,
  participants,
  actorName,
}: {
  tasks: BoardTaskView[];
  participants: ParticipantView[];
  actorName: string | null;
}) {
  const router = useRouter();
  const [items, applyChange] = useOptimistic(
    tasks,
    (current, action: OptimisticAction) => {
      if (action.type === "remove") {
        return current.filter((task) => task.id !== action.id);
      }
      return current.map((task) =>
        task.id === action.id ? { ...task, status: action.status } : task,
      );
    },
  );
  const [index, setIndex] = useState(0);
  const [dialog, setDialog] = useState<
    { mode: "create" } | { mode: "edit"; taskId: string } | null
  >(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [busy, startBusy] = useTransition();

  const dismissToast = useCallback(() => setToast(null), []);
  const showToast = useCallback(
    (tone: ToastData["tone"], message: string) => {
      setToast({ id: Date.now(), tone, message });
    },
    [],
  );

  const safeIndex = items.length === 0 ? 0 : Math.min(index, items.length - 1);
  const current = items[safeIndex];
  const dialogTask =
    dialog?.mode === "edit"
      ? items.find((task) => task.id === dialog.taskId)
      : undefined;

  const runMove = (
    task: BoardTaskView,
    status: TaskStatusValue,
    remove = false,
  ) => {
    startBusy(async () => {
      if (remove) {
        applyChange({ type: "remove", id: task.id });
      } else {
        applyChange({ type: "status", id: task.id, status });
      }

      const result = await moveTask(task.id, status);
      if (!result.ok) {
        showToast("error", result.message ?? "Не удалось сохранить.");
        return;
      }
      if (status === "DONE") {
        showToast("success", "Готово. Хорошая работа.");
      }
      router.refresh();
    });
  };

  const handleSaved = (message: string) => {
    setDialog(null);
    showToast("success", message);
    router.refresh();
  };

  return (
    <div className="mx-auto w-full max-w-[46rem]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex items-center gap-2 text-[0.95rem] font-bold text-ink-soft">
          <Sparkles size={18} className="text-terracotta" aria-hidden="true" />
          {items.length === 0
            ? "Открытых дел нет"
            : `Осталось ${items.length} ${pluralize(items.length, ["дело", "дела", "дел"])}`}
        </p>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setDialog({ mode: "create" })}
        >
          <Plus size={19} aria-hidden="true" />
          Добавить дело
        </button>
      </div>

      {current ? (
        <>
          <p className="mb-2 text-center text-[0.78rem] font-semibold text-muted">
            Дело {safeIndex + 1} из {items.length}
          </p>

          <article
            key={current.id}
            className="surface relative overflow-hidden p-5 sm:p-8"
          >
            <div
              className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-sage-soft/60 blur-2xl"
              aria-hidden="true"
            />
            <div className="relative">
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge badge-neutral gap-1.5 px-2.5 py-1 text-[0.75rem]">
                  <StatusIcon status={current.status} size={14} />
                  {STATUS_META[current.status].label}
                </span>
                {current.priority === "IMPORTANT" && (
                  <span className="badge badge-terracotta gap-1.5 px-2.5 py-1 text-[0.75rem]">
                    <Flag size={13} aria-hidden="true" />
                    {PRIORITY_META.IMPORTANT.label}
                  </span>
                )}
              </div>

              <h2 className="mt-4 text-[clamp(1.55rem,5vw,2.15rem)] font-extrabold leading-[1.12] tracking-[-0.035em] text-ink">
                {current.title}
              </h2>

              {current.description && (
                <p className="mt-3 max-w-[38rem] text-[1rem] leading-relaxed text-ink-soft/90">
                  {current.description}
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-[0.92rem] font-semibold">
                {current.dueLabel && (
                  <span
                    className={`inline-flex items-center gap-2 ${
                      current.dueTone === "overdue"
                        ? "text-terracotta-dark"
                        : "text-muted"
                    }`}
                  >
                    <CalendarDays size={18} aria-hidden="true" />
                    {current.dueLabel}
                  </span>
                )}
                <span className="inline-flex items-center gap-2 text-ink-soft">
                  {current.assignee ? (
                    <>
                      <Avatar participant={current.assignee} size={34} />
                      {current.assignee.name}
                    </>
                  ) : (
                    <>
                      <Avatar
                        participant={{
                          name: "Без ответственного",
                          color: "sand",
                          initials: "?",
                        }}
                        size={34}
                      />
                      Без ответственного
                    </>
                  )}
                </span>
              </div>

              <div className="mt-6 grid gap-2.5 sm:grid-cols-[1fr_auto]">
                <button
                  type="button"
                  className="btn btn-sage min-h-[4rem] w-full text-[1.1rem]"
                  onClick={() => runMove(current, "DONE", true)}
                  disabled={busy}
                >
                  {busy ? (
                    <Loader2 size={22} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Check size={24} strokeWidth={2.6} aria-hidden="true" />
                  )}
                  Готово
                </button>
                {current.status === "TODO" && (
                  <button
                    type="button"
                    className="btn btn-secondary min-h-[4rem] w-full px-5 text-[1rem] sm:w-auto"
                    onClick={() => runMove(current, "IN_PROGRESS")}
                    disabled={busy}
                  >
                    <Play size={20} aria-hidden="true" />
                    В работу
                  </button>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  className="btn btn-ghost min-h-12"
                  onClick={() =>
                    setDialog({ mode: "edit", taskId: current.id })
                  }
                >
                  <Pencil size={18} aria-hidden="true" />
                  Изменить
                </button>
                <Link href="/" className="btn btn-ghost min-h-12">
                  <ArrowLeft size={18} aria-hidden="true" />
                  На доску
                </Link>
              </div>
            </div>
          </article>

          {items.length > 1 && (
            <div className="mt-4 flex items-center justify-between gap-2">
              <button
                type="button"
                className="btn btn-secondary min-h-[3.4rem]"
                onClick={() => setIndex((value) => Math.max(0, value - 1))}
                disabled={safeIndex === 0 || busy}
              >
                <ChevronLeft size={20} aria-hidden="true" />
                Предыдущее
              </button>
              <button
                type="button"
                className="btn btn-secondary min-h-[3.4rem]"
                onClick={() =>
                  setIndex((value) => Math.min(items.length - 1, value + 1))
                }
                disabled={safeIndex >= items.length - 1 || busy}
              >
                Следующее
                <ChevronRight size={20} aria-hidden="true" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="surface p-6 text-center sm:p-10">
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-sage-soft text-sage-deep">
            <CircleCheck size={38} aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-[1.7rem] font-extrabold tracking-[-0.04em]">
            На сегодня всё
          </h2>
          <p className="mx-auto mt-2 max-w-[24rem] text-[0.95rem] leading-relaxed text-muted">
            Открытых дел не осталось. Можно выдохнуть, заварить чай или добавить
            что-то новое — без спешки.
          </p>
          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
            <button
              type="button"
              className="btn btn-sage min-h-[3.4rem]"
              onClick={() => setDialog({ mode: "create" })}
            >
              <Plus size={19} aria-hidden="true" />
              Добавить дело
            </button>
            <Link href="/" className="btn btn-secondary min-h-[3.4rem]">
              <ArrowLeft size={19} aria-hidden="true" />
              На доску
            </Link>
          </div>
        </div>
      )}

      {dialog && (dialog.mode === "create" || dialogTask) && (
        <TaskDialog
          key={dialog.mode === "edit" ? dialogTask?.id : "create"}
          mode={dialog.mode}
          task={dialog.mode === "edit" ? dialogTask : undefined}
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
