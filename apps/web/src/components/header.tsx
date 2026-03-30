import Link from "next/link";
import type { Route } from "next";
import Image from "next/image";
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
    <header className="sticky top-0 z-50 w-full border-b-[4px] border-[#393E46] bg-white/95 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href={"/" as Route} className="inline-flex items-center transition-transform hover:-translate-y-0.5 hover:drop-shadow-md">
            <Image src={brandMain} alt="Travel With Me" className="h-10 w-auto object-contain" priority />
          </Link>
          <nav className="hidden sm:flex items-center gap-2">
            {links.map(({ to, label }) => {
              return (
                <Link 
                  key={to} 
                  href={to as Route}
                  className="rounded-full px-4 py-2 font-black text-[#393E46] uppercase tracking-wider text-xs transition-colors hover:bg-[#00ADB5]/10 hover:text-[#00ADB5]"
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
                <button className="rounded-full border-[3px] border-[#393E46] bg-[#EEEEEE] px-4 py-1.5 font-black text-[#393E46] uppercase tracking-wider text-xs transition-transform hover:-translate-y-1 active:translate-y-0 shadow-[0_4px_0_#393E46] active:shadow-none">
                  Login
                </button>
              </Link>
              <Link href={"/signup" as Route}>
                <button className="rounded-full border-[3px] border-[#393E46] bg-[#00ADB5] px-4 py-1.5 font-black text-white uppercase tracking-wider text-xs transition-transform hover:-translate-y-1 active:translate-y-0 shadow-[0_4px_0_#393E46] active:shadow-none">
                  Sign Up
                </button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href={"/profile" as Route} className="group flex items-center gap-2 rounded-full border-[3px] border-[#393E46] bg-white px-1.5 py-1.5 shadow-[0_3px_0_#393E46] transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-none">
                <img
                  src={user.avatar || DEFAULT_USER_AVATAR_URL}
                  alt={user.name}
                  className="h-7 w-7 rounded-full border-2 border-[#393E46] object-cover group-hover:border-[#00ADB5] transition-colors"
                />
                <span className="text-xs font-black uppercase text-[#393E46] tracking-wider pr-3 hidden sm:inline-block">{user.name}</span>
              </Link>
              <form action={logoutUserAction}>
                <button 
                  type="submit" 
                  className="rounded-full border-[3px] border-[#393E46] bg-[#EEEEEE] px-4 py-2 font-black text-[#393E46] uppercase tracking-wider text-xs transition-transform hover:-translate-y-1 active:translate-y-0 shadow-[0_4px_0_#393E46] active:shadow-none"
                >
                  Logout
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
