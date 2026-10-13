import "server-only";
import { redirect } from "next/navigation";
import { isOwner } from "@/lib/auth";

/** Server-side authorization for every admin page (middleware is only the first gate). */
export async function guard() {
  if (!(await isOwner())) redirect("/admin/login");
}
