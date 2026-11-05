import { revalidatePath } from "next/cache";

export function revalidateBoard() {
  for (const path of ["/", "/participants", "/summary", "/simple"]) {
    revalidatePath(path);
  }
}
