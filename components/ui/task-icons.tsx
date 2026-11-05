import {
  ArrowLeftRight,
  Circle,
  CircleCheck,
  Pencil,
  Plus,
  Timer,
  Trash2,
  UserCheck,
  type LucideIcon,
} from "lucide-react";

import type { TaskEventTypeValue, TaskStatusValue } from "@/lib/constants";

const STATUS_ICONS: Record<TaskStatusValue, LucideIcon> = {
  TODO: Circle,
  IN_PROGRESS: Timer,
  DONE: CircleCheck,
};

const EVENT_ICONS: Record<TaskEventTypeValue, LucideIcon> = {
  CREATED: Plus,
  UPDATED: Pencil,
  ASSIGNED: UserCheck,
  MOVED: ArrowLeftRight,
  DELETED: Trash2,
};

export function StatusIcon({
  status,
  size = 16,
  className = "",
}: {
  status: TaskStatusValue;
  size?: number;
  className?: string;
}) {
  const Icon = STATUS_ICONS[status];
  return <Icon size={size} className={className} aria-hidden="true" />;
}

export function EventTypeIcon({
  type,
  size = 15,
  className = "",
}: {
  type: TaskEventTypeValue;
  size?: number;
  className?: string;
}) {
  const Icon = EVENT_ICONS[type];
  return <Icon size={size} className={className} aria-hidden="true" />;
}
