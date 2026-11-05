import { z } from "zod";

import {
  MAX_DESCRIPTION_LENGTH,
  MAX_NAME_LENGTH,
  MAX_TITLE_LENGTH,
} from "@/lib/constants";
import { parseDateInput } from "@/lib/dates";

const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Введите название задачи")
    .max(
      MAX_TITLE_LENGTH,
      `Название — не больше ${MAX_TITLE_LENGTH} символов`,
    ),
  description: z
    .string()
    .trim()
    .max(
      MAX_DESCRIPTION_LENGTH,
      `Описание — не больше ${MAX_DESCRIPTION_LENGTH} символов`,
    )
    .transform((value) => value || null),
  dueDate: z
    .string()
    .transform((value, ctx) => {
      if (!value) return null;
      const parsed = parseDateInput(value);
      if (!parsed) {
        ctx.addIssue({
          code: "custom",
          message: "Проверьте дату: формат ГГГГ-ММ-ДД",
        });
        return z.NEVER;
      }
      return parsed;
    }),
  priority: z.enum(["NORMAL", "IMPORTANT"]),
  assigneeId: z
    .string()
    .transform((value) => value || null)
    .nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
});

const participantFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Введите имя участника")
    .max(MAX_NAME_LENGTH, `Имя — не больше ${MAX_NAME_LENGTH} символов`),
});

export type TaskFormValues = {
  title: string;
  description: string | null;
  dueDate: Date | null;
  priority: "NORMAL" | "IMPORTANT";
  assigneeId: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
};

export function parseTaskForm(
  formData: FormData,
  options: { withStatus: boolean },
): {
  values: TaskFormValues | null;
  fieldErrors: Record<string, string>;
} {
  const rawStatus = String(formData.get("status") ?? "");

  const result = taskFormSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    dueDate: String(formData.get("dueDate") ?? ""),
    priority: String(formData.get("priority") ?? "NORMAL"),
    assigneeId: String(formData.get("assigneeId") ?? ""),
    status: options.withStatus && rawStatus ? rawStatus : "TODO",
  });

  if (!result.success) {
    return { values: null, fieldErrors: collectFieldErrors(result.error) };
  }

  return { values: result.data, fieldErrors: {} };
}

export function parseParticipantForm(formData: FormData): {
  name: string | null;
  fieldErrors: Record<string, string>;
} {
  const result = participantFormSchema.safeParse({
    name: String(formData.get("name") ?? ""),
  });

  if (!result.success) {
    return { name: null, fieldErrors: collectFieldErrors(result.error) };
  }

  return { name: result.data.name, fieldErrors: {} };
}

function collectFieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}
