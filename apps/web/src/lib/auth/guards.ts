import { redirect } from "next/navigation";
import type { Route } from "next";
import { getCurrentUser } from "@/lib/auth/session";

export async function requireUser(nextPath?: string) {
  const user = await getCurrentUser();
  if (!user) {
    const query = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
    redirect((`/login${query}`) as Route);
  }
  return user;
}
