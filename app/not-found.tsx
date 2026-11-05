import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

import { LogoMark } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="surface w-full max-w-[30rem] p-6 text-center sm:p-8">
        <LogoMark size={38} />
        <span className="mx-auto mt-4 grid h-12 w-12 place-items-center rounded-full bg-sage-soft text-sage-deep">
          <Search size={21} aria-hidden="true" />
        </span>
        <h1 className="mt-3 text-[1.5rem] font-extrabold tracking-[-0.03em]">
          Такой страницы нет
        </h1>
        <p className="mt-2 text-[0.88rem] leading-relaxed text-muted">
          Возможно, ссылка устарела. Ваша демо-доска на месте — вернитесь к
          делам.
        </p>
        <Link href="/" className="btn btn-primary mt-5">
          <ArrowLeft size={18} aria-hidden="true" />
          К демо-доске
        </Link>
      </div>
    </div>
  );
}
