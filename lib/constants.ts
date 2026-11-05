export const SESSION_COOKIE = "svoi_demo";
export const ACTOR_COOKIE = "svoi_actor";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 дней

export const MAX_PARTICIPANTS = 10;
export const MIN_PARTICIPANTS = 1;
export const MAX_TITLE_LENGTH = 120;
export const MAX_DESCRIPTION_LENGTH = 1000;
export const MAX_NAME_LENGTH = 40;

export type TaskStatusValue = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriorityValue = "NORMAL" | "IMPORTANT";
export type TaskEventTypeValue =
  | "CREATED"
  | "UPDATED"
  | "ASSIGNED"
  | "MOVED"
  | "DELETED";

export const STATUS_ORDER: TaskStatusValue[] = [
  "TODO",
  "IN_PROGRESS",
  "DONE",
];

export const STATUS_META: Record<
  TaskStatusValue,
  { label: string; shortLabel: string; hint: string }
> = {
  TODO: {
    label: "К выполнению",
    shortLabel: "К выполнению",
    hint: "Спокойно ждёт своего часа",
  },
  IN_PROGRESS: {
    label: "В работе",
    shortLabel: "В работе",
    hint: "Уже в чьих-то заботливых руках",
  },
  DONE: {
    label: "Готово",
    shortLabel: "Готово",
    hint: "Можно выдохнуть",
  },
};

export const PRIORITY_META: Record<
  TaskPriorityValue,
  { label: string; hint: string }
> = {
  NORMAL: {
    label: "Обычная",
    hint: "Обычное дело, без спешки",
  },
  IMPORTANT: {
    label: "Важная",
    hint: "Хорошо бы не забыть",
  },
};

export type ParticipantColor =
  | "sage"
  | "terracotta"
  | "ochre"
  | "plum"
  | "blue"
  | "olive"
  | "clay"
  | "teal"
  | "rose"
  | "sand";

export const PARTICIPANT_COLORS: ParticipantColor[] = [
  "sage",
  "terracotta",
  "ochre",
  "plum",
  "blue",
  "olive",
  "clay",
  "teal",
  "rose",
  "sand",
];

export const COLOR_STYLES: Record<
  ParticipantColor,
  { background: string; foreground: string; border: string; dot: string }
> = {
  sage: {
    background: "#E2EEE4",
    foreground: "#2F5A3C",
    border: "#C8DDCC",
    dot: "#4A7C59",
  },
  terracotta: {
    background: "#F7E1D8",
    foreground: "#8C3D24",
    border: "#EBC7B9",
    dot: "#A94A2E",
  },
  ochre: {
    background: "#F6EACB",
    foreground: "#6A4C0E",
    border: "#E8D6A8",
    dot: "#9A741C",
  },
  plum: {
    background: "#EDDFEA",
    foreground: "#65365A",
    border: "#DCC5D6",
    dot: "#7C4A70",
  },
  blue: {
    background: "#DDE9EC",
    foreground: "#2F5560",
    border: "#C5DBE0",
    dot: "#3E6F7C",
  },
  olive: {
    background: "#E8EBD7",
    foreground: "#4D5724",
    border: "#D5DABC",
    dot: "#65712F",
  },
  clay: {
    background: "#F1E3D9",
    foreground: "#6B4030",
    border: "#E2CDBE",
    dot: "#86563F",
  },
  teal: {
    background: "#DCECE7",
    foreground: "#2E5750",
    border: "#C3DED7",
    dot: "#3E7268",
  },
  rose: {
    background: "#F4DFE2",
    foreground: "#7A3441",
    border: "#E8C8CD",
    dot: "#954B5B",
  },
  sand: {
    background: "#EFE8DC",
    foreground: "#5C4C37",
    border: "#E0D5C3",
    dot: "#756044",
  },
};

export function getColorStyle(color: string) {
  return (
    COLOR_STYLES[color as ParticipantColor] ?? COLOR_STYLES.sage
  );
}
