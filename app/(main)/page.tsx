import type { Metadata } from "next";
import { CalendarDays, Sparkles } from "lucide-react";

import { BoardView } from "@/components/board/board-view";
import { Avatar } from "@/components/ui/avatar";
import { formatTodayLabel, pluralize } from "@/lib/dates";
import { getBoardTasks, toParticipantView } from "@/lib/queries";
import { getBoardContext } from "@/lib/session";

export const metadata: Metadata = {
  title: "Демо-доска",
  description:
    "Канбан семейных дел: три статуса, участники, сроки и приоритеты. Демо без регистрации.",
};

export default async function BoardPage({
  searchParams,
}: {
  searchParams: Promise<{ participant?: string | string[] }>;
}) {
  const params = await searchParams;
  const { board, participants, actor } = await getBoardContext();
  const allTasks = await getBoardTasks(board.id);

  const requestedFilter =
    typeof params.participant === "string" ? params.participant : null;
  const filterParticipant =
    participants.find((item) => item.id === requestedFilter) ?? null;
  const filter = filterParticipant
    ? toParticipantView(filterParticipant)
    : null;

  const visibleTasks = filter
    ? allTasks.filter((task) => task.assignee?.id === filter.id)
    : allTasks;

  return (
    <div className="container-app">
      <section className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-[42rem]">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-sage/25 bg-sage-soft/55 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.09em] text-sage-deep">
            <Sparkles size={12} aria-hidden="true" />
            Демо-доска · без регистрации
          </p>
          <h1 className="mt-2.5 text-[clamp(1.75rem,4vw,2.45rem)] font-extrabold leading-[1.08] tracking-[-0.045em] text-ink">
            {filter ? (
              <>
                Дела: <span className="text-sage-dark">{filter.name}</span>
              </>
            ) : (
              <>
                Дела семьи,{" "}
                <span className="relative whitespace-nowrap text-sage-dark">
                  без спешки
                  <span
                    className="absolute -bottom-0.5 left-0 h-[0.16em] w-full rounded-full bg-terracotta/45"
                    aria-hidden="true"
                  />
                </span>
              </>
            )}
          </h1>
          <p className="mt-2 max-w-[37rem] text-[0.92rem] leading-relaxed text-muted">
            Три спокойные колонки и понятные карточки. Перетащите задачу на
            компьютере или смените статус прямо в карточке на телефоне — всё
            сохранится.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="surface inline-flex min-h-12 items-center gap-2.5 px-3.5 py-2">
            <CalendarDays
              size={17}
              className="text-sage-dark"
              aria-hidden="true"
            />
            <span className="text-[0.8rem] font-bold text-ink-soft first-letter:uppercase">
              {formatTodayLabel()}
            </span>
          </div>
          <div className="surface inline-flex min-h-12 items-center gap-2 px-3.5 py-2">
            <span className="flex -space-x-1.5" aria-hidden="true">
              {participants.slice(0, 4).map((participant) => (
                <Avatar
                  key={participant.id}
                  participant={toParticipantView(participant)}
                  size={25}
                  className="ring-2 ring-paper"
                />
              ))}
            </span>
            <span className="text-[0.76rem] font-semibold text-muted">
              {participants.length}{" "}
              {pluralize(participants.length, [
                "участник",
                "участника",
                "участников",
              ])}
            </span>
          </div>
        </div>
      </section>

      <BoardView
        tasks={visibleTasks}
        participants={participants.map(toParticipantView)}
        actorName={actor?.name ?? null}
        filter={filter}
        allTasksCount={allTasks.length}
      />
    </div>
  );
}
