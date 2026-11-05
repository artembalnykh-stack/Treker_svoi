import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";

import { ParticipantsManager } from "@/components/participants/participants-manager";
import { getParticipantStats, toParticipantView } from "@/lib/queries";
import { getBoardContext } from "@/lib/session";

export const metadata: Metadata = {
  title: "Участники",
  description:
    "Демонстрационные профили доски «Свои»: добавление, удаление и выбор активного участника.",
};

export default async function ParticipantsPage() {
  const { board, participants, actor } = await getBoardContext();
  const stats = await getParticipantStats(board.id);

  return (
    <div className="container-narrow">
      <div className="mb-5">
        <Link
          href="/"
          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg text-[0.78rem] font-bold text-muted transition-colors hover:text-sage-deep"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          К доске
        </Link>
        <h1 className="mt-2 text-[clamp(1.6rem,3.6vw,2.1rem)] font-extrabold leading-tight tracking-[-0.04em]">
          Участники
        </h1>
        <p className="mt-1.5 max-w-[40rem] text-[0.9rem] leading-relaxed text-muted">
          До 10 демонстрационных профилей на доске. Выберите, от чьего имени
          действовать, — это влияет на историю задач и фильтр на доске.
        </p>
      </div>

      <div className="mb-4 flex items-start gap-2 rounded-xl border border-line bg-paper-soft/65 px-3.5 py-2.5">
        <Info
          size={16}
          className="mt-0.5 shrink-0 text-sage-dark"
          aria-hidden="true"
        />
        <p className="text-[0.78rem] leading-relaxed text-muted">
          Участники — не аккаунты и не реальные пользователи. Это часть
          демонстрации: можно свободно придумывать имена и роли.
        </p>
      </div>

      <ParticipantsManager
        participants={participants.map(toParticipantView)}
        stats={stats}
        actorId={actor?.id ?? null}
      />
    </div>
  );
}
