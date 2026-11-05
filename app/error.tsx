"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, Sprout } from "lucide-react";

import { LogoMark } from "@/components/logo";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[svoi] Ошибка страницы:", error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="surface w-full max-w-[32rem] p-6 text-center sm:p-8">
        <div className="mx-auto flex items-center justify-center gap-1">
          <LogoMark size={40} />
        </div>
        <span className="mx-auto mt-4 grid h-12 w-12 place-items-center rounded-full bg-ochre-soft text-ochre-ink">
          <Sprout size={22} aria-hidden="true" />
        </span>
        <h1 className="mt-3 text-[1.5rem] font-extrabold tracking-[-0.03em]">
          Что-то пошло не так
        </h1>
        <p className="mt-2 text-[0.88rem] leading-relaxed text-muted">
          Мы не смогли показать доску. Это демо — ваши данные никуда не
          пропали. Попробуйте обновить страницу.
        </p>
        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          <button type="button" className="btn btn-primary" onClick={reset}>
            <RotateCcw size={18} aria-hidden="true" />
            Попробовать снова
          </button>
          <Link href="/" className="btn btn-secondary">
            На главную
          </Link>
        </div>
        {error.digest && (
          <p className="mt-4 text-[0.7rem] text-muted">
            Код ошибки: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
