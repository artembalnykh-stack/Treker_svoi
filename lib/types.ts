import type {
  TaskEventTypeValue,
  TaskPriorityValue,
  TaskStatusValue,
} from "@/lib/constants";

export type ParticipantView = {
  id: string;
  name: string;
  color: string;
  initials: string;
};

export type TaskEventView = {
  id: string;
  type: TaskEventTypeValue;
  label: string;
  detail: string | null;
  actorName: string | null;
  createdLabel: string;
  createdAtIso: string;
};

export type BoardTaskView = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatusValue;
  priority: TaskPriorityValue;
  dueDateIso: string | null;
  dueLabel: string | null;
  dueTone: "overdue" | "soon" | "normal" | "done";
  assignee: ParticipantView | null;
  createdAtLabel: string;
  isOverdue: boolean;
  events: TaskEventView[];
};

export type ParticipantStats = {
  openCount: number;
  completedThisWeek: number;
};

export type WeekSummaryRow = {
  participant: ParticipantView | null;
  count: number;
  completedTitles: string[];
};

export type WeekSummary = {
  weekStart: Date;
  weekEnd: Date;
  weekLabel: string;
  total: number;
  rows: WeekSummaryRow[];
  completedTasks: Array<{
    id: string;
    title: string;
    assigneeName: string | null;
    completedLabel: string;
  }>;
};

export type BoardEventView = {
  id: string;
  type: TaskEventTypeValue;
  taskTitle: string;
  taskId: string | null;
  label: string;
  detail: string | null;
  actorName: string | null;
  createdLabel: string;
};

export type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  nonce?: number;
};

export type ActionResult = {
  ok: boolean;
  message?: string;
  redirectTo?: string;
};

export type {
  TaskEventTypeValue,
  TaskPriorityValue,
  TaskStatusValue,
};
