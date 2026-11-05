import type { Metadata } from "next";

import { SimpleBoard } from "@/components/simple/simple-board";
import { getBoardTasks, toParticipantView } from "@/lib/queries";
import { getBoardContext } from "@/lib/session";

export const metadata: Metadata = {
  title: "Простой вид",
  description:
    "Упрощённый доступный вид демо-доски «Свои»: крупный текст, одна задача и заметные кнопки.",
};

export default async function SimplePage() {
  const { board, participants, actor } = await getBoardContext();
  const allTasks = await getBoardTasks(board.id);
  const openTasks = allTasks.filter((task) => task.status !== "DONE");

  return (
    <div className="container-narrow">
      <header className="mx-auto mb-5 max-w-[46rem] text-center sm:mb-6">
        <p className="inline-flex items-center gap-1.5 rounded-full border border-sage/25 bg-sage-soft/55 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.09em] text-sage-deep">
          Простой вид
        </p>
        <h1 className="mt-2.5 text-[clamp(1.7rem,4.2vw,2.3rem)] font-extrabold leading-[1.1] tracking-[-0.045em]">
          Одно дело за раз
        </h1>
        <p className="mx-auto mt-2 max-w-[34rem] text-[0.92rem] leading-relaxed text-muted">
          Крупный текст, заметные кнопки и ничего лишнего. Режим включается
          вручную и не меняет правила задач.
        </p>
      </header>

      <SimpleBoard
        tasks={openTasks}
        participants={participants.map(toParticipantView)}
        actorName={actor?.name ?? null}
      />
    </div>
  );
}
