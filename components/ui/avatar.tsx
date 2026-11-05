import type { CSSProperties } from "react";

import { getColorStyle } from "@/lib/constants";
import type { ParticipantView } from "@/lib/types";

export function Avatar({
  participant,
  size = 32,
  className = "",
}: {
  participant: Pick<ParticipantView, "name" | "color" | "initials">;
  size?: number;
  className?: string;
}) {
  const color = getColorStyle(participant.color);
  const style = {
    "--avatar-bg": color.background,
    "--avatar-fg": color.foreground,
    "--avatar-border": color.border,
    width: size,
    height: size,
    fontSize: Math.max(10, size * 0.34),
  } as CSSProperties;

  return (
    <span
      className={`avatar ${className}`}
      style={style}
      aria-hidden="true"
      title={participant.name}
    >
      {participant.initials}
    </span>
  );
}

export function UnassignedAvatar({ size = 32 }: { size?: number }) {
  return (
    <span
      className="avatar border-dashed border-line-strong bg-paper-soft text-muted"
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.32) }}
      aria-hidden="true"
    >
      ?
    </span>
  );
}
