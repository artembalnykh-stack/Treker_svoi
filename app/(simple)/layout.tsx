import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Logo } from "@/components/logo";
import { getBoardContext } from "@/lib/session";

export default async function SimpleLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await getBoardContext();

  return (
    <div className="simple-shell flex min-h-dvh flex-col">
      <header className="border-b border-line/80 bg-paper/85 backdrop-blur-md">
        <div className="container-narrow flex min-h-[4.6rem] items-center justify-between gap-3 py-2">
          <div className="flex items-center gap-3">
            <Logo href="/simple" compact />
            <span className="badge badge-sage hidden sm:inline-flex">
              простой вид
            </span>
          </div>
          <Link href="/" className="btn btn-secondary">
            <ArrowLeft size={18} aria-hidden="true" />
            Обычный вид
          </Link>
        </div>
      </header>

      <main id="main-content" className="flex-1 pb-10 pt-7 sm:pt-10">
        {children}
      </main>

      <footer className="border-t border-line/80 py-4">
        <div className="container-narrow">
          <p className="text-[0.75rem] leading-relaxed text-muted">
            Простой вид меняет только оформление. Данные и правила задач
            остаются прежними. Это демо — имена и задачи вымышлены.
          </p>
        </div>
      </footer>
    </div>
  );
}
