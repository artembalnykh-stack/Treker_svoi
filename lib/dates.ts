import type { TaskStatusValue } from "@/lib/constants";

const DAY_MS = 24 * 60 * 60 * 1000;

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const weekdayFormatter = new Intl.DateTimeFormat("ru-RU", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const monthFormatter = new Intl.DateTimeFormat("ru-RU", {
  month: "long",
  timeZone: "UTC",
});

const timeFormatter = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

const fullFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

export function todayUtc(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

export function startOfWeek(date = new Date()): Date {
  const today = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = today.getUTCDay(); // 0 — воскресенье
  const diff = day === 0 ? 6 : day - 1;
  return addDays(today, -diff);
}

export function endOfWeek(date = new Date()): Date {
  return addDays(startOfWeek(date), 6);
}

export function parseDateInput(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

export function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

export function formatWeekdayDate(date: Date): string {
  return weekdayFormatter.format(date);
}

export function formatWeekRange(start: Date): string {
  const end = addDays(start, 6);
  const sameMonth =
    start.getUTCMonth() === end.getUTCMonth() &&
    start.getUTCFullYear() === end.getUTCFullYear();
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();

  if (sameMonth) {
    const month = monthFormatter.format(end);
    return `${start.getUTCDate()}–${end.getUTCDate()} ${month}`;
  }

  if (sameYear) {
    return `${formatDate(start)} — ${formatDate(end)}`;
  }

  return `${formatDate(start)} ${start.getUTCFullYear()} — ${formatDate(end)} ${end.getUTCFullYear()}`;
}

export function getDuePresentation(
  date: Date | null,
  status: TaskStatusValue,
): {
  label: string | null;
  tone: "overdue" | "soon" | "normal" | "done";
  isOverdue: boolean;
} {
  if (!date) return { label: null, tone: "normal", isOverdue: false };

  if (status === "DONE") {
    return { label: formatDate(date), tone: "done", isOverdue: false };
  }

  const today = todayUtc();
  const due = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const diff = Math.round((due.getTime() - today.getTime()) / DAY_MS);

  if (diff < 0) {
    return {
      label: `Просрочено · ${formatDate(date)}`,
      tone: "overdue",
      isOverdue: true,
    };
  }
  if (diff === 0) {
    return { label: "Сегодня", tone: "soon", isOverdue: false };
  }
  if (diff === 1) {
    return { label: "Завтра", tone: "soon", isOverdue: false };
  }
  if (diff < 7) {
    return {
      label: formatWeekdayDate(date),
      tone: "normal",
      isOverdue: false,
    };
  }
  return { label: formatDate(date), tone: "normal", isOverdue: false };
}

export function formatEventTime(date: Date): string {
  const today = todayUtc();
  const eventDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const diff = Math.round((eventDay.getTime() - today.getTime()) / DAY_MS);
  const time = timeFormatter.format(date);

  if (diff === 0) return `сегодня в ${time}`;
  if (diff === -1) return `вчера в ${time}`;
  return `${formatDate(date)} в ${time}`;
}

export function formatFullDateTime(date: Date): string {
  return fullFormatter.format(date);
}

export function pluralize(
  count: number,
  forms: [string, string, string],
): string {
  const abs = Math.abs(count) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (last > 1 && last < 5) return forms[1];
  if (last === 1) return forms[0];
  return forms[2];
}

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

const todayLongFormatter = new Intl.DateTimeFormat("ru-RU", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

export function formatTodayLabel(): string {
  return todayLongFormatter.format(todayUtc());
}
