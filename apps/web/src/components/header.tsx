import Link from "next/link";
import type { Route } from "next";
import Image from "next/image";
import { logoutUserAction } from "@/lib/actions/auth";
import { getCurrentUser } from "@/lib/auth/session";
import { DEFAULT_USER_AVATAR_URL } from "@/lib/constants";
import brandMain from "@/travelwithmemain.png";
import { Button } from "./ui/button";

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

        <div className="flex items-center gap-3">
          {!user ? (
            <div className="flex items-center gap-2">
              <Link href={"/login" as Route}>
                <button className="rounded-full border border-border bg-secondary px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-secondary-foreground transition-colors hover:bg-secondary/80">
                  Login
                </button>
              </Link>
              <Link href={"/signup" as Route}>
                <button className="rounded-full border border-border bg-primary px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90">
                  Sign Up
                </button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href={"/profile" as Route} className="group flex items-center gap-2 rounded-full border border-border bg-card px-1.5 py-1.5 transition-colors hover:bg-accent">
                <img
                  src={user.avatar || DEFAULT_USER_AVATAR_URL}
                  alt={user.name}
                  className="h-7 w-7 rounded-full border border-border object-cover"
                />
                <span className="pr-3 text-xs font-semibold uppercase tracking-wider text-card-foreground hidden sm:inline-block">{user.name}</span>
              </Link>
              <form action={logoutUserAction}>
                <Button
                    type="submit"
                    className="rounded-full border border-border bg-primary px-4 py-1.5 text-xs font-semibold uppercase tracking-wider  transition-colors hover:bg-secondary/80"
                >
                  Logout
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
