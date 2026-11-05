"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CircleAlert,
  Loader2,
  Plus,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";

import {
  addParticipant,
  deleteParticipant,
} from "@/app/actions/participants";
import { selectParticipant } from "@/app/actions/session";
import { Avatar } from "@/components/ui/avatar";
import { Toast, type ToastData } from "@/components/ui/toast";
import {
  MAX_NAME_LENGTH,
  MAX_PARTICIPANTS,
  MIN_PARTICIPANTS,
} from "@/lib/constants";
import { pluralize } from "@/lib/dates";
import type {
  ActionState,
  ParticipantStats,
  ParticipantView,
} from "@/lib/types";

const INITIAL_STATE: ActionState = { ok: false };

export function ParticipantsManager({
  participants,
  stats,
  actorId,
}: {
  participants: ParticipantView[];
  stats: Record<string, ParticipantStats>;
  actorId: string | null;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    addParticipant,
    INITIAL_STATE,
  );
  const [toast, setToast] = useState<ToastData | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectPendingId, setSelectPendingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [, startSelect] = useTransition();
  const [deletePending, startDelete] = useTransition();

  const dismissToast = useCallback(() => setToast(null), []);
  const atLimit = participants.length >= MAX_PARTICIPANTS;
  const lastParticipant = participants.length <= MIN_PARTICIPANTS;

  useEffect(() => {
    if (!state.ok || !state.nonce) return;
    formRef.current?.reset();
    setToast({
      id: Date.now(),
      tone: "success",
      message: state.message ?? "Участник добавлен.",
    });
    router.refresh();
  }, [state.ok, state.nonce, state.message, router]);

  const makeActive = (participant: ParticipantView) => {
    setActionError(null);
    setSelectPendingId(participant.id);
    startSelect(async () => {
      const result = await selectParticipant(participant.id);
      setSelectPendingId(null);
      if (!result.ok) {
        setActionError(result.message ?? "Не удалось переключиться.");
        return;
      }
      setToast({
        id: Date.now(),
        tone: "success",
        message: `Теперь действуете как ${participant.name}.`,
      });
      router.refresh();
    });
  };

  const remove = (participant: ParticipantView) => {
    setActionError(null);
    startDelete(async () => {
      const result = await deleteParticipant(participant.id);
      if (!result.ok) {
        setActionError(result.message ?? "Не удалось удалить участника.");
        return;
      }
      setDeletingId(null);
      setToast({
        id: Date.now(),
        tone: "success",
        message: result.message ?? "Участник удалён.",
      });
      router.refresh();
    });
  };

  return (
    <div className="grid gap-5">
      <section className="surface relative overflow-hidden p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-[1rem] font-extrabold tracking-[-0.02em]">
              <UserPlus size={18} className="text-sage-dark" aria-hidden="true" />
              Добавить участника
            </h2>
            <p className="mt-1 max-w-[34rem] text-[0.8rem] leading-relaxed text-muted">
              Демонстрационный профиль внутри вашей доски. Не указывайте имена
              реальных людей — здесь для всех всё вымышленное.
            </p>
          </div>
          <span className="badge badge-neutral shrink-0 self-start">
            {participants.length} из {MAX_PARTICIPANTS}
          </span>
        </div>

        {atLimit ? (
          <div
            className="mt-3 flex items-start gap-2 rounded-xl border border-ochre-ink/25 bg-ochre-soft px-3 py-2.5 text-[0.82rem] font-semibold leading-snug text-ochre-ink"
            role="status"
          >
            <CircleAlert size={18} aria-hidden="true" />
            На доске уже {MAX_PARTICIPANTS} участников — это максимум. Удалите
            одного, чтобы добавить нового.
          </div>
        ) : (
          <form ref={formRef} action={formAction} className="mt-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="min-w-0 flex-1">
                <label className="sr-only" htmlFor="participant-name">
                  Имя участника
                </label>
                <input
                  id="participant-name"
                  name="name"
                  className="input"
                  type="text"
                  required
                  maxLength={MAX_NAME_LENGTH}
                  placeholder="Например, Оля"
                  aria-invalid={state.fieldErrors?.name ? "true" : undefined}
                  aria-describedby={
                    state.fieldErrors?.name ? "participant-name-error" : undefined
                  }
                />
                {state.fieldErrors?.name && (
                  <p className="field-error mt-1" id="participant-name-error">
                    {state.fieldErrors.name}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="btn btn-sage sm:w-auto"
                disabled={pending}
              >
                {pending ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Plus size={18} aria-hidden="true" />
                )}
                {pending ? "Добавляем…" : "Добавить"}
              </button>
            </div>
            {state.message && !state.ok && (
              <p
                className="mt-2 rounded-lg bg-terracotta-soft px-3 py-2 text-[0.8rem] font-semibold text-terracotta-dark"
                role="alert"
              >
                {state.message}
              </p>
            )}
          </form>
        )}

        {actionError && (
          <p
            className="mt-2 rounded-lg bg-terracotta-soft px-3 py-2 text-[0.8rem] font-semibold text-terracotta-dark"
            role="alert"
          >
            {actionError}
          </p>
        )}
      </section>

      <section aria-labelledby="participants-title">
        <div className="mb-2.5 flex items-end justify-between gap-3">
          <div>
            <h2
              id="participants-title"
              className="text-[1.05rem] font-extrabold tracking-[-0.02em]"
            >
              На доске
            </h2>
            <p className="text-[0.78rem] text-muted">
              Нажмите «Действовать как», чтобы выполнять задачи от имени
              человека.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[0.74rem] font-semibold text-muted">
            <Users size={14} aria-hidden="true" />
            {participants.length}{" "}
            {pluralize(participants.length, [
              "профиль",
              "профиля",
              "профилей",
            ])}
          </span>
        </div>

        <ul className="grid gap-2.5 sm:grid-cols-2">
          {participants.map((participant) => {
            const itemStats = stats[participant.id] ?? {
              openCount: 0,
              completedThisWeek: 0,
            };
            const isActive = participant.id === actorId;
            const isDeleting = deletingId === participant.id;

            return (
              <li
                key={participant.id}
                className={`surface flex flex-col gap-3 p-3.5 transition-colors sm:p-4 ${
                  isActive ? "border-sage/45 bg-sage-soft/25" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar participant={participant} size={46} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="truncate text-[0.95rem] font-extrabold text-ink">
                        {participant.name}
                      </h3>
                      {isActive && (
                        <span className="badge badge-sage gap-1">
                          <Check size={11} aria-hidden="true" />
                          активный
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[0.73rem] font-medium text-muted">
                      {itemStats.openCount}{" "}
                      {pluralize(itemStats.openCount, [
                        "дело",
                        "дела",
                        "дел",
                      ])}{" "}
                      в работе · {itemStats.completedThisWeek} готово за неделю
                    </p>
                  </div>
                </div>

                {isDeleting ? (
                  <div className="rounded-xl border border-terracotta/30 bg-terracotta-soft/45 p-2.5">
                    <p className="text-[0.78rem] font-semibold leading-snug text-terracotta-dark">
                      Удалить {participant.name}? Задачи останутся на доске без
                      ответственного.
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => remove(participant)}
                        disabled={deletePending}
                      >
                        {deletePending ? (
                          <Loader2
                            size={15}
                            className="animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <Trash2 size={15} aria-hidden="true" />
                        )}
                        Удалить
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setDeletingId(null)}
                        disabled={deletePending}
                      >
                        Оставить
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-1.5 border-t border-line/70 pt-2.5">
                    {isActive ? (
                      <span className="inline-flex min-h-10 items-center gap-1.5 px-1 text-[0.76rem] font-bold text-sage-deep">
                        <Check size={15} aria-hidden="true" />
                        Вы действуете как {participant.name}
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => makeActive(participant)}
                        disabled={selectPendingId !== null}
                      >
                        {selectPendingId === participant.id ? (
                          <Loader2
                            size={15}
                            className="animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <UserPlus size={15} aria-hidden="true" />
                        )}
                        Действовать как
                      </button>
                    )}

                    <button
                      type="button"
                      className="btn btn-ghost btn-sm ml-auto text-terracotta-dark hover:bg-terracotta-soft"
                      onClick={() => setDeletingId(participant.id)}
                      disabled={lastParticipant}
                      title={
                        lastParticipant
                          ? "На доске должен остаться хотя бы один участник"
                          : `Удалить ${participant.name}`
                      }
                    >
                      <Trash2 size={15} aria-hidden="true" />
                      <span className="sr-only">
                        Удалить участника {participant.name}
                      </span>
                      Удалить
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {lastParticipant && (
          <p className="mt-2 text-[0.74rem] leading-snug text-muted">
            На доске всегда остаётся хотя бы один участник — так задачам есть
            кому быть назначенными.
          </p>
        )}
      </section>

      {toast && <Toast toast={toast} onDismiss={dismissToast} />}
    </div>
  );
}
