import { Logo } from "@/components/logo";
import { NavLinks } from "@/components/layout/nav-links";
import { ParticipantSwitcher } from "@/components/layout/participant-switcher";
import { ResetDemoButton } from "@/components/layout/reset-demo-button";
import { toParticipantView } from "@/lib/queries";
import { getBoardContext } from "@/lib/session";

export async function AppHeader() {
  const { participants, actor } = await getBoardContext();
  const participantViews = participants.map(toParticipantView);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/88 backdrop-blur-md">
      <div className="container-app">
        <div className="flex min-h-[4.4rem] items-center gap-3">
          <Logo />
          <span className="mx-1 hidden h-8 w-px bg-line lg:block" aria-hidden="true" />
          <span className="badge badge-neutral hidden lg:inline-flex">
            демо-доска
          </span>

          <div className="ml-auto flex items-center gap-2">
            <ParticipantSwitcher
              participants={participantViews}
              actorId={actor?.id ?? null}
            />
            <ResetDemoButton />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-line/70 py-1.5">
          <NavLinks />
          <span className="hidden text-[0.68rem] font-semibold tracking-[0.04em] text-muted xl:block">
            без регистрации · данные только ваши
          </span>
        </div>
      </div>
    </header>
  );
}
