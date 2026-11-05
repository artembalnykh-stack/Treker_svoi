"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  RotateCcw,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import { resetDemo } from "@/app/actions/board";

export function ResetDemoButton() {
  const [dialog, setDialog] = useState<HTMLDialogElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const open = () => {
    setError(null);
    dialog?.showModal();
  };

  const close = () => {
    dialog?.close();
  };

  const run = (mode: "reseed" | "clear") => {
    setError(null);
    startTransition(async () => {
      const result = await resetDemo(mode);
      if (!result.ok) {
        setError(result.message ?? "Не удалось сбросить доску.");
        return;
      }

      close();
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost btn-icon"
        onClick={open}
        aria-label="Сбросить демо-доску"
        title="Сбросить демо-доску"
      >
        <RotateCcw size={18} strokeWidth={2.2} aria-hidden="true" />
      </button>

      <dialog
        ref={setDialog}
        className="app-dialog"
        aria-labelledby="reset-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <div className="wave-pattern h-2 w-full" aria-hidden="true" />
        <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-4 sm:px-7">
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-terracotta-dark">
              Только ваша доска
            </p>
            <h2
              id="reset-title"
              className="mt-1 text-[1.45rem] font-extrabold tracking-[-0.03em]"
            >
              Начать заново?
            </h2>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={close}
            aria-label="Закрыть"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="px-5 pb-5 sm:px-7 sm:pb-7">
          <p className="max-w-[32rem] text-[0.9rem] leading-relaxed text-muted">
            Это затронет только вашу изолированную демо-доску. Другие
            посетители ничего не заметят.
          </p>

          <div className="mt-4 grid gap-2.5">
            <button
              type="button"
              className="surface flex min-h-[4.6rem] w-full items-start gap-3 p-3.5 text-left transition-colors hover:border-sage/50 hover:bg-sage-soft/30"
              onClick={() => run("reseed")}
              disabled={pending}
            >
              <span className="empty-illustration h-10 w-10 shrink-0">
                <Sparkles size={18} aria-hidden="true" />
              </span>
              <span className="grid gap-0.5">
                <span className="text-[0.92rem] font-bold text-ink">
                  Собрать с примерами
                </span>
                <span className="text-[0.8rem] leading-snug text-muted">
                  Вернуть участников, примеры задач и историю. Удобно для
                  повторной демонстрации.
                </span>
              </span>
            </button>

            <button
              type="button"
              className="surface flex min-h-[4.6rem] w-full items-start gap-3 p-3.5 text-left transition-colors hover:border-terracotta/50 hover:bg-terracotta-soft/30"
              onClick={() => run("clear")}
              disabled={pending}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-terracotta-soft text-terracotta-dark">
                <Trash2 size={18} aria-hidden="true" />
              </span>
              <span className="grid gap-0.5">
                <span className="text-[0.92rem] font-bold text-ink">
                  Очистить задачи
                </span>
                <span className="text-[0.8rem] leading-snug text-muted">
                  Оставить участников, но убрать все задачи и историю. Начать с
                  чистого листа.
                </span>
              </span>
            </button>
          </div>

          {error && (
            <p
              className="mt-3 rounded-xl border border-terracotta/35 bg-terracotta-soft px-3 py-2 text-[0.82rem] font-semibold text-terracotta-dark"
              role="alert"
            >
              {error}
            </p>
          )}

          {pending && (
            <p
              className="mt-3 flex items-center gap-2 text-[0.82rem] font-semibold text-sage-dark"
              role="status"
            >
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              Собираем доску…
            </p>
          )}

          <p className="mt-3 text-[0.75rem] leading-snug text-muted">
            Отменить нельзя, но можно снова выбрать «Собрать с примерами».
          </p>
        </div>
      </dialog>
    </>
  );
}
