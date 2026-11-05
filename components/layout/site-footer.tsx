import { Heart } from "lucide-react";

import { LogoMark } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="mt-14 border-t border-line/80 bg-paper-soft/55">
      <div className="container-app flex flex-col gap-4 py-7 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5">
          <LogoMark size={30} />
          <div>
            <p className="text-[0.85rem] font-bold text-ink">
              «Свои» — забота, которая не теряется
            </p>
            <p className="mt-0.5 text-[0.75rem] leading-relaxed text-muted">
              Демо-проект. Имена, задачи и история вымышлены и не относятся к
              реальным людям. Данные вашей доски изолированы.
            </p>
          </div>
        </div>
        <p className="flex items-center gap-1.5 text-[0.72rem] font-semibold text-muted">
          Сделано с заботой
          <Heart size={13} aria-hidden="true" className="text-terracotta" />
          для портфолио
        </p>
      </div>
    </footer>
  );
}
