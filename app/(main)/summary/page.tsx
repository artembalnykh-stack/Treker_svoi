import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarRange,
  CircleCheck,
  History,
  Sparkles,
} from "lucide-react";

import { Avatar, UnassignedAvatar } from "@/components/ui/avatar";
import { EventTypeIcon } from "@/components/ui/task-icons";
import { pluralize } from "@/lib/dates";
import {
  getRecentBoardEvents,
  getWeekSummary,
} from "@/lib/queries";
import { getBoardContext } from "@/lib/session";

export const metadata: Metadata = {
  title: "Итоги недели",
  description:
    "Недельная сводка завершённых задач по участникам демо-доски «Свои».",
};

export default async function SummaryPage() {
  const { board } = await getBoardContext();
  const [summary, events] = await Promise.all([
    getWeekSummary(board.id),
    getRecentBoardEvents(board.id, 30),
  ]);

  const maxCount = Math.max(1, ...summary.rows.map((row) => row.count));
  const hasCompleted = summary.total > 0;

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
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[clamp(1.6rem,3.6vw,2.1rem)] font-extrabold leading-tight tracking-[-0.04em]">
              Итоги недели
            </h1>
            <p className="mt-1.5 max-w-[38rem] text-[0.9rem] leading-relaxed text-muted">
              Спокойный взгляд на то, что уже получилось. Считаем задачи,
              отмеченные готовыми с понедельника.
            </p>
          </div>
          <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white/65 px-3.5 text-[0.78rem] font-bold text-ink-soft">
            <CalendarRange size={16} className="text-sage-dark" aria-hidden="true" />
            {summary.weekLabel}
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
        <div className="grid gap-4">
          <section className="surface relative overflow-hidden p-5 sm:p-6">
            <div
              className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-sage-soft/70 blur-2xl"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-12 right-14 h-28 w-28 rounded-full bg-terracotta-soft/60 blur-2xl"
              aria-hidden="true"
            />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-sage-dark">
                  Завершено за неделю
                </p>
                <p className="mt-1 flex items-baseline gap-2">
                  <span className="text-[3.4rem] font-extrabold leading-none tracking-[-0.07em] text-ink">
                    {summary.total}
                  </span>
                  <span className="text-[0.9rem] font-bold text-muted">
                    {pluralize(summary.total, [
                      "задача",
                      "задачи",
                      "задач",
                    ])}
                  </span>
                </p>
              </div>

              <div className="max-w-[16rem]">
                <p className="flex items-center gap-1.5 text-[0.82rem] font-bold text-ink-soft">
                  <Sparkles size={15} className="text-terracotta" aria-hidden="true" />
                  {hasCompleted
                    ? "Каждый вклад важен"
                    : "Своя скорость — это нормально"}
                </p>
                <p className="mt-1 text-[0.78rem] leading-relaxed text-muted">
                  {hasCompleted
                    ? "Не гонка, а тихая общая забота. Отметьте следующее дело, когда будет удобно."
                    : "На этой неделе ещё нет отмеченных задач. Можно начать с одного маленького дела."}
                </p>
              </div>
            </div>
          </section>

          <section className="surface p-4 sm:p-5" aria-labelledby="by-people">
            <div className="flex items-baseline justify-between gap-3">
              <h2
                id="by-people"
                className="text-[1rem] font-extrabold tracking-[-0.02em]"
              >
                Вклад участников
              </h2>
              <span className="text-[0.72rem] font-semibold text-muted">
                {summary.weekLabel}
              </span>
            </div>

            <ul className="mt-3.5 grid gap-3">
              {summary.rows.map((row) => {
                const percent =
                  row.count > 0
                    ? Math.max(8, Math.round((row.count / maxCount) * 100))
                    : 0;
                const key = row.participant?.id ?? "unassigned";
                return (
                  <li key={key}>
                    <div className="flex items-center gap-2.5">
                      {row.participant ? (
                        <Avatar participant={row.participant} size={34} />
                      ) : (
                        <UnassignedAvatar size={34} />
                      )}
                      <span className="min-w-0 flex-1 truncate text-[0.84rem] font-bold text-ink-soft">
                        {row.participant?.name ?? "Без ответственного"}
                      </span>
                      <span className="text-[0.78rem] font-extrabold tabular-nums text-ink">
                        {row.count}
                      </span>
                    </div>
                    <div
                      className="summary-bar-track mt-1.5 ml-[2.75rem]"
                      role="img"
                      aria-label={`${row.participant?.name ?? "Без ответственного"}: ${row.count} ${pluralize(row.count, ["задача", "задачи", "задач"])}`}
                    >
                      <div
                        className="summary-bar-fill"
                        style={{
                          width: `${percent}%`,
                          animationDelay: "80ms",
                        }}
                      />
                    </div>
                    {row.completedTitles.length > 0 && (
                      <p className="ml-[2.75rem] mt-1 truncate text-[0.7rem] text-muted">
                        {row.completedTitles.join(" · ")}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="surface p-4 sm:p-5" aria-labelledby="completed-list">
            <h2
              id="completed-list"
              className="flex items-center gap-2 text-[1rem] font-extrabold tracking-[-0.02em]"
            >
              <CircleCheck size={18} className="text-sage-dark" aria-hidden="true" />
              Что получилось
            </h2>

            {summary.completedTasks.length === 0 ? (
              <div className="mt-3 flex items-start gap-3 rounded-xl border border-dashed border-line-strong bg-paper-soft/40 p-3.5">
                <span className="empty-illustration h-10 w-10 shrink-0">
                  <Sparkles size={17} aria-hidden="true" />
                </span>
                <p className="text-[0.8rem] leading-relaxed text-muted">
                  Пока пусто. Отметьте задачу готовой на доске — она появится
                  здесь и в сводке по участникам.
                </p>
              </div>
            ) : (
              <ul className="mt-2 divide-y divide-line/70">
                {summary.completedTasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-start gap-2.5 py-2.5"
                  >
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sage-soft text-sage-deep">
                      <CircleCheck size={14} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[0.82rem] font-bold leading-snug text-ink-soft">
                        {task.title}
                      </p>
                      <p className="text-[0.7rem] text-muted">
                        {task.assigneeName ?? "Без ответственного"} ·{" "}
                        {task.completedLabel}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="surface flex max-h-[42rem] flex-col overflow-hidden lg:sticky lg:top-32">
          <div className="flex items-center gap-2 border-b border-line/80 px-4 py-3 sm:px-5">
            <History size={18} className="text-sage-dark" aria-hidden="true" />
            <h2 className="text-[1rem] font-extrabold tracking-[-0.02em]">
              История доски
            </h2>
            <span className="badge badge-neutral ml-auto">{events.length}</span>
          </div>

          {events.length === 0 ? (
            <p className="px-4 py-5 text-[0.8rem] leading-relaxed text-muted">
              Пока без событий. Создайте задачу или меняйте статусы — здесь
              появится спокойная хроника.
            </p>
          ) : (
            <ol className="scrollbar-soft flex-1 overflow-y-auto px-4 py-3 sm:px-5">
              {events.map((event) => (
                <li key={event.id} className="flex gap-2.5 py-2">
                  <span
                    className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                      event.type === "DELETED"
                        ? "bg-terracotta-soft text-terracotta-dark"
                        : "bg-paper-deep text-ink-soft"
                    }`}
                  >
                    <EventTypeIcon type={event.type} size={14} />
                  </span>
                  <div className="min-w-0 flex-1 border-b border-line/60 pb-2.5 last:border-0 last:pb-0">
                    <p className="text-[0.78rem] font-bold leading-snug text-ink-soft">
                      {event.label}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[0.75rem] leading-snug text-muted">
                      «{event.taskTitle}»
                      {event.detail ? ` · ${event.detail}` : ""}
                    </p>
                    <p className="mt-0.5 text-[0.68rem] text-muted">
                      {event.actorName ? `${event.actorName} · ` : ""}
                      {event.createdLabel}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}

          <p className="border-t border-line/70 px-4 py-2.5 text-[0.68rem] leading-snug text-muted sm:px-5">
            В истории только основные события: создание, изменение,
            назначение, смена статуса и удаление.
          </p>
        </aside>
      </div>
    </div>
  );
}
