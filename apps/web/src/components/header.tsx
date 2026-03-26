import Link from "next/link";
import type { Route } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { logoutUserAction } from "@/lib/actions/auth";
import { getCurrentUser } from "@/lib/auth/session";
import { DEFAULT_USER_AVATAR_URL } from "@/lib/constants";
import brandMain from "@/travelwithmemain.png";


export default async function Header() {
  const user = await getCurrentUser();
  const links = [
    { to: "/", label: "Dashboard" },
    { to: "/invite", label: "Invite" },
  ] as const;

  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <Link href={"/" as Route} className="inline-flex items-center">
            <Image src={brandMain} alt="Travel With Me" className="h-9 w-auto object-contain" priority />
          </Link>
          <nav className="flex gap-2">
            {links.map(({ to, label }) => {
              return (
                <Link key={to} href={to as Route}>
                  <Button variant="ghost" size="sm">
                    {label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {!user ? (
            <>
              <Link href={"/login" as Route}>
                <Button variant="outline" size="sm">Login</Button>
              </Link>
              <Link href={"/signup" as Route}>
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 rounded border px-2 py-1">
                <img
                  src={user.avatar || DEFAULT_USER_AVATAR_URL}
                  alt={user.name}
                  className="h-7 w-7 rounded-full object-cover"
                />
                <span className="text-xs">{user.name}</span>
              </div>
              <Link href={"/profile" as Route}>
                <Button variant="outline" size="sm">Profile</Button>
              </Link>
              <form action={logoutUserAction}>
                <Button type="submit" size="sm">Logout</Button>
              </form>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
