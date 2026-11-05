"use client";

import { useEffect } from "react";
import { CircleAlert, CircleCheck, X } from "lucide-react";

export type ToastData = {
  id: number;
  tone: "success" | "error";
  message: string;
};

export function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastData;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timeout = window.setTimeout(
      onDismiss,
      toast.tone === "error" ? 6000 : 4000,
    );
    return () => window.clearTimeout(timeout);
  }, [toast.id, toast.tone, onDismiss]);

  const Icon = toast.tone === "error" ? CircleAlert : CircleCheck;

  return (
    <div
      className="toast"
      data-tone={toast.tone}
      role={toast.tone === "error" ? "alert" : "status"}
    >
      <Icon size={20} aria-hidden="true" />
      <p className="min-w-0 flex-1">{toast.message}</p>
      <button
        type="button"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg hover:bg-black/5"
        onClick={onDismiss}
        aria-label="Закрыть сообщение"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
