"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronDown, Loader2, Users } from "lucide-react";

import { selectParticipant } from "@/app/actions/session";
import { Avatar } from "@/components/ui/avatar";
import type { ParticipantView } from "@/lib/types";

export function ParticipantSwitcher({
  participants,
  actorId,
}: {
  participants: ParticipantView[];
  actorId: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const actor = participants.find((item) => item.id === actorId) ?? null;

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        rootRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const choose = (participant: ParticipantView) => {
    setError(null);
    startTransition(async () => {
      const result = await selectParticipant(participant.id);
      if (!result.ok) {
        setError(result.message ?? "Не удалось переключить участника.");
        return;
      }

      setOpen(false);
      if (pathname === "/") {
        router.push(`/?participant=${participant.id}`);
      } else {
        router.refresh();
      }
    });
  };

  if (!actor) {
    return (
      <span className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-line bg-paper-soft px-3 text-sm font-semibold text-muted">
        <Users size={18} aria-hidden="true" />
        Нет участников
      </span>
    );
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="flex min-h-12 items-center gap-2.5 rounded-xl border border-line bg-white/75 px-2.5 py-1.5 text-left transition-colors hover:border-sage/45 hover:bg-white"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Активный участник: ${actor.name}. Изменить`}
        onClick={() => setOpen((value) => !value)}
      >
        <Avatar participant={actor} size={32} />
        <span className="hidden flex-col leading-tight sm:flex">
          <span className="text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-muted">
            Действуете как
          </span>
          <span className="max-w-[8rem] truncate text-[0.86rem] font-bold text-ink">
            {actor.name}
          </span>
        </span>
        <span className="text-[0.84rem] font-bold text-ink sm:hidden">
          {actor.name}
        </span>
        {pending ? (
          <Loader2
            size={16}
            className="animate-spin text-sage-dark"
            aria-hidden="true"
          />
        ) : (
          <ChevronDown
            size={16}
            className="text-muted transition-transform"
            style={{ transform: open ? "rotate(180deg)" : undefined }}
            aria-hidden="true"
          />
        )}
      </button>

      {open && (
        <div
          className="popover absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[19rem] p-2"
          role="menu"
          aria-label="Выбрать активного участника"
        >
          <p className="px-2 pb-1.5 pt-1 text-[0.72rem] font-semibold uppercase tracking-[0.07em] text-muted">
            От чьего имени действовать
          </p>
          <div className="grid gap-0.5">
            {participants.map((participant) => {
              const selected = participant.id === actor.id;
              return (
                <button
                  key={participant.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  className="menu-item"
                  onClick={() => choose(participant)}
                  disabled={pending}
                >
                  <Avatar participant={participant} size={30} />
                  <span className="min-w-0 flex-1 truncate">
                    {participant.name}
                  </span>
                  {selected && (
                    <Check
                      size={17}
                      className="text-sage-dark"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 border-t border-line px-2 pb-1 pt-2 text-[0.72rem] leading-snug text-muted">
            На доске останутся задачи выбранного участника. Вернуть всех можно
            кнопкой «Вся семья».
          </p>
          {error && (
            <p className="mt-1 rounded-lg bg-terracotta-soft px-2 py-1.5 text-[0.75rem] font-semibold text-terracotta-dark">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
