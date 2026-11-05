import Link from "next/link";

export function LogoMark({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M29.9 8.1a15.5 15.5 0 1 0 0 23.8"
        stroke="#4A7C59"
        strokeWidth="4.4"
        strokeLinecap="round"
      />
      <path
        d="M28.8 14.2a8.6 8.6 0 1 0 0 11.6"
        stroke="#E07A5F"
        strokeWidth="3.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({
  href = "/",
  compact = false,
}: {
  href?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2.5 rounded-xl"
      aria-label="Свои — на главную"
    >
      <LogoMark size={compact ? 34 : 40} />
      <span className="flex flex-col leading-none">
        <span className="text-[1.35rem] font-extrabold tracking-[-0.04em] text-ink">
          Свои
        </span>
        {!compact && (
          <span className="mt-1 hidden text-[0.62rem] font-semibold tracking-[0.06em] text-muted sm:block">
            забота, которая не теряется
          </span>
        )}
      </span>
    </Link>
  );
}
