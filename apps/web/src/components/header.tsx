import Link from "next/link";
import type { Route } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import { DEFAULT_USER_AVATAR_URL } from "@/lib/constants";
import { Show, SignOutButton, UserAvatar } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { UserMenuButton } from "@/components/auth/user-menu-button";
import { dark } from "@clerk/ui/themes";

export default async function Header() {
  const user = await getCurrentUser();
  const links = [
    { to: "/", label: "Dashboard" },
    { to: "/invite", label: "Invite" },
  ] as const;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href={"/" as Route} className="inline-flex text-2xl font-bold items-center transition-transform hover:-translate-y-0.5 hover:drop-shadow-md">
            TraMe
          </Link>

          <nav className="hidden sm:flex items-center gap-2">
            {links.map(({ to, label }) => {
              return (
                <Link
                  key={to}
                  href={to as Route}
                  className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Show when="signed-in">
            <Link href={"/profile" as Route}>
              <UserAvatar />
            </Link>
            <div className="bg-primary text-sm px-2 py-1 text-black rounded-full border border-border p-1">
              <SignOutButton
                redirectUrl="/login"
              >
                Sign Out
              </SignOutButton>
            </div>
          </Show>
        </div>
      </div>
    </header>
  );
}
