"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  CircleAlert,
  Flag,
  History,
  Loader2,
  Trash2,
  X,
} from "lucide-react";

import { createTask, deleteTask, updateTask } from "@/app/actions/tasks";
import { EventTypeIcon, StatusIcon } from "@/components/ui/task-icons";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_TITLE_LENGTH,
  PRIORITY_META,
  STATUS_META,
  STATUS_ORDER,
} from "@/lib/constants";
import type {
  ActionState,
  BoardTaskView,
  ParticipantView,
} from "@/lib/types";

const INITIAL_STATE: ActionState = { ok: false };

export function TaskDialog({
  mode,
  task,
  participants,
  actorName,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  task?: BoardTaskView;
  participants: ParticipantView[];
  actorName: string | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const closingRef = useRef(false);
  const onSavedRef = useRef(onSaved);
  onSavedRef.current = onSaved;

  const action = mode === "create" ? createTask : updateTask;
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletePending, startDelete] = useTransition();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    closingRef.current = false;
    if (!dialog.open) dialog.showModal();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => titleRef.current?.focus(), 60);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      closingRef.current = true;
      if (dialog.open) dialog.close();
    };
  }, []);

  useEffect(() => {
    if (state.ok && state.nonce) {
      onSavedRef.current(state.message ?? "Сохранено.");
    }
  }, [state.ok, state.nonce, state.message]);

  const closeDialog = () => {
    closingRef.current = true;
    dialogRef.current?.close();
    onClose();
  };

  const handleDelete = () => {
    if (!task) return;
    setDeleteError(null);
    startDelete(async () => {
      const result = await deleteTask(task.id);
      if (!result.ok) {
        setDeleteError(result.message ?? "Не удалось удалить задачу.");
        return;
      }
      onSavedRef.current(result.message ?? "Задача удалена.");
    });
  };

  return (
    <dialog
      ref={dialogRef}
      className="app-dialog"
      aria-labelledby="task-dialog-title"
      onClose={() => {
        if (!closingRef.current) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) closeDialog();
      }}
    >
      <div className="flex max-h-[inherit] flex-col">
        <div className="wave-pattern h-2 w-full" aria-hidden="true" />
        <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-4 sm:px-7">
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-sage-dark">
              {mode === "create" ? "Новое дело" : "Задача"}
            </p>
            <h2
              id="task-dialog-title"
              className="mt-1 text-[1.45rem] font-extrabold tracking-[-0.03em]"
            >
              {mode === "create" ? "Добавить задачу" : "Редактировать задачу"}
            </h2>
            {actorName && (
              <p className="mt-1 text-[0.78rem] font-medium text-muted">
                Действие сохранится от имени{" "}
                <span className="font-bold text-ink-soft">{actorName}</span>
              </p>
            )}
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={closeDialog}
            aria-label="Закрыть"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <form
          action={formAction}
          aria-busy={pending}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="dialog-scroll flex-1 px-5 pb-5 sm:px-7">
            {state.message && !state.ok && (
              <div
                className="mb-4 flex items-start gap-2 rounded-xl border border-terracotta/35 bg-terracotta-soft px-3 py-2.5 text-[0.82rem] font-semibold leading-snug text-terracotta-dark"
                role="alert"
              >
                <CircleAlert size={18} aria-hidden="true" />
                <span>{state.message}</span>
              </div>
            )}

            {mode === "edit" && task && (
              <input type="hidden" name="id" value={task.id} />
            )}

            <div className="grid gap-4">
              <div className="field">
                <label className="field-label" htmlFor="task-title">
                  Название
                  <span className="text-terracotta-dark" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  ref={titleRef}
                  id="task-title"
                  name="title"
                  className="input"
                  type="text"
                  required
                  maxLength={MAX_TITLE_LENGTH}
                  defaultValue={task?.title ?? ""}
                  placeholder="Например, купить продукты к ужину"
                  aria-invalid={state.fieldErrors?.title ? "true" : undefined}
                  aria-describedby={
                    state.fieldErrors?.title ? "task-title-error" : undefined
                  }
                />
                {state.fieldErrors?.title && (
                  <p className="field-error" id="task-title-error">
                    {state.fieldErrors.title}
                  </p>
                )}
              </div>

              <div className="field">
                <label className="field-label" htmlFor="task-description">
                  Описание
                  <span className="field-optional">необязательно</span>
                </label>
                <textarea
                  id="task-description"
                  name="description"
                  className="input"
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  defaultValue={task?.description ?? ""}
                  placeholder="Короткая заметка, чтобы ничего не держать в голове"
                  aria-invalid={
                    state.fieldErrors?.description ? "true" : undefined
                  }
                />
                {state.fieldErrors?.description && (
                  <p className="field-error">
                    {state.fieldErrors.description}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="field">
                  <label className="field-label" htmlFor="task-due-date">
                    Срок
                    <span className="field-optional">необязательно</span>
                  </label>
                  <input
                    id="task-due-date"
                    name="dueDate"
                    className="input"
                    type="date"
                    defaultValue={task?.dueDateIso ?? ""}
                    aria-invalid={
                      state.fieldErrors?.dueDate ? "true" : undefined
                    }
                  />
                  {state.fieldErrors?.dueDate && (
                    <p className="field-error">{state.fieldErrors.dueDate}</p>
                  )}
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="task-assignee">
                    Ответственный
                    <span className="field-optional">необязательно</span>
                  </label>
                  <select
                    id="task-assignee"
                    name="assigneeId"
                    className="input"
                    defaultValue={task?.assignee?.id ?? ""}
                    aria-invalid={
                      state.fieldErrors?.assigneeId ? "true" : undefined
                    }
                  >
                    <option value="">Без ответственного</option>
                    {participants.map((participant) => (
                      <option key={participant.id} value={participant.id}>
                        {participant.name}
                      </option>
                    ))}
                  </select>
                  {state.fieldErrors?.assigneeId && (
                    <p className="field-error">
                      {state.fieldErrors.assigneeId}
                    </p>
                  )}
                </div>
              </div>

              <fieldset className="grid gap-2">
                <legend className="field-label mb-0.5">Приоритет</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(["NORMAL", "IMPORTANT"] as const).map((priority) => (
                    <label key={priority} className="relative block">
                      <input
                        type="radio"
                        name="priority"
                        value={priority}
                        defaultChecked={
                          (task?.priority ?? "NORMAL") === priority
                        }
                        className="peer sr-only"
                      />
                      <span className="flex min-h-[3.3rem] cursor-pointer items-center gap-2.5 rounded-xl border border-line bg-white/65 px-3 py-2 transition-colors peer-checked:border-sage peer-checked:bg-sage-soft/70 peer-focus-visible:ring-4 peer-focus-visible:ring-sage/20 hover:border-line-strong">
                        <span
                          className={`grid h-8 w-8 place-items-center rounded-lg ${
                            priority === "IMPORTANT"
                              ? "bg-terracotta-soft text-terracotta-dark"
                              : "bg-paper-deep text-ink-soft"
                          }`}
                        >
                          <Flag
                            size={15}
                            strokeWidth={2.3}
                            aria-hidden="true"
                          />
                        </span>
                        <span>
                          <span className="block text-[0.85rem] font-bold text-ink">
                            {PRIORITY_META[priority].label}
                          </span>
                          <span className="block text-[0.72rem] leading-snug text-muted">
                            {PRIORITY_META[priority].hint}
                          </span>
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {mode === "edit" && (
                <fieldset className="grid gap-2">
                  <legend className="field-label mb-0.5">Статус</legend>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {STATUS_ORDER.map((status) => (
                      <label key={status} className="relative block">
                        <input
                          type="radio"
                          name="status"
                          value={status}
                          defaultChecked={(task?.status ?? "TODO") === status}
                          className="peer sr-only"
                        />
                        <span className="flex min-h-[3rem] cursor-pointer items-center gap-2 rounded-xl border border-line bg-white/65 px-2.5 py-2 text-[0.8rem] font-bold text-ink-soft transition-colors peer-checked:border-sage peer-checked:bg-sage-soft/70 peer-checked:text-sage-deep peer-focus-visible:ring-4 peer-focus-visible:ring-sage/20 hover:border-line-strong">
                          <StatusIcon status={status} size={15} />
                          {STATUS_META[status].label}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              {mode === "edit" && task && (
                <details className="surface-muted group mt-1 overflow-hidden">
                  <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-3.5 py-2.5 text-[0.82rem] font-bold text-ink-soft">
                    <History size={16} aria-hidden="true" />
                    История задачи
                    <span className="badge badge-neutral ml-auto">
                      {task.events.length}
                    </span>
                  </summary>
                  <div className="border-t border-line/80 px-3.5 py-3">
                    {task.events.length === 0 ? (
                      <p className="text-[0.8rem] text-muted">
                        Пока без событий.
                      </p>
                    ) : (
                      <ol className="grid gap-2.5">
                        {task.events.map((event) => (
                          <li
                            key={event.id}
                            className="flex items-start gap-2.5"
                          >
                            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-paper-deep text-ink-soft">
                              <EventTypeIcon type={event.type} size={13} />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-[0.78rem] font-bold leading-snug text-ink-soft">
                                {event.label}
                                {event.detail ? `: ${event.detail}` : ""}
                              </span>
                              <span className="block text-[0.7rem] leading-snug text-muted">
                                {event.actorName
                                  ? `${event.actorName} · `
                                  : ""}
                                {event.createdLabel}
                              </span>
                            </span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>

          <div className="border-t border-line bg-paper-soft/55 px-5 py-3.5 sm:px-7">
            {deleteError && (
              <p
                className="mb-2 text-[0.8rem] font-semibold text-terracotta-dark"
                role="alert"
              >
                {deleteError}
              </p>
            )}

            {deleteConfirm && task ? (
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <p className="min-w-0 flex-1 text-[0.8rem] font-semibold leading-snug text-ink-soft">
                  Удалить «{task.title}»? Запись об удалении останется в истории
                  доски.
                </p>
                <div className="flex gap-2 sm:shrink-0">
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={handleDelete}
                    disabled={deletePending}
                  >
                    {deletePending ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <Trash2 size={16} aria-hidden="true" />
                    )}
                    Удалить
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setDeleteConfirm(false)}
                    disabled={deletePending}
                  >
                    Оставить
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={pending}
                >
                  {pending && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  {pending
                    ? "Сохраняем…"
                    : mode === "create"
                      ? "Создать задачу"
                      : "Сохранить изменения"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeDialog}
                  disabled={pending}
                >
                  Отмена
                </button>
                {mode === "edit" && (
                  <button
                    type="button"
                    className="btn btn-ghost ml-auto text-terracotta-dark hover:bg-terracotta-soft"
                    onClick={() => setDeleteConfirm(true)}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                    Удалить
                  </button>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
    </dialog>
  );
}
