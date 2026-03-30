import Link from "next/link";
import { redirect } from "next/navigation";
import type { Route } from "next";
import Image from "next/image";
import { CalendarDotsIcon, MapPinAreaIcon, MoneyIcon, UsersThreeIcon } from "@phosphor-icons/react/dist/ssr";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth/session";
import brandText from "@/travelwithmetext.png";

type Props = {
  searchParams: Promise<{ invite?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect((params.next || "/") as Route);

  return (
    <main className="min-h-[calc(100vh-56px)] w-full relative flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-[#FFB703] to-[#FB8500] overflow-hidden">
      {/* Soft backdrop lighting */}
      <div className="absolute top-10 left-10 w-[30vh] h-[30vh] bg-white/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[40vh] h-[40vh] bg-[#00ADB5]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.2fr_1fr] bg-white/30 backdrop-blur-2xl rounded-[3rem] p-6 text-[#393E46] sm:p-10 border-[6px] border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
        
        <section className="grid gap-6">
          <div className="space-y-4">
            <Image src={brandText} alt="Travel With Me" className="h-20 w-auto object-contain drop-shadow-md" priority />
            <div className="text-4xl md:text-5xl font-black tracking-tighter drop-shadow-sm leading-tight uppercase font-sans">
              Plan, Track & Settle <br/><span className="text-white drop-shadow-md">Group Travel</span>
            </div>
            <div className="max-w-xl text-lg font-bold text-[#393E46]/80 bg-white/50 p-5 rounded-3xl border-[3px] border-white shadow-inner">
              Continue your trip workspace with live status tracking, smarter split calculations, and place-based memories.
            </div>
          </div>
          
          <div className="grid gap-4 text-sm sm:grid-cols-2 mt-4">
            <div className="rounded-3xl border-[4px] border-white bg-white/80 p-5 shadow-[0_6px_15px_rgba(0,0,0,0.05)] transition-transform hover:-translate-y-1">
              <div className="mb-2 inline-flex items-center gap-2 font-black text-[#00ADB5] uppercase tracking-wider text-base">
                <CalendarDotsIcon size={24} weight="fill" />
                Trip Lifecycle
              </div>
              <p className="font-bold text-slate-500 leading-relaxed">Move trips from planning to started, ongoing, and ended with clear visibility.</p>
            </div>
            <div className="rounded-3xl border-[4px] border-white bg-white/80 p-5 shadow-[0_6px_15px_rgba(0,0,0,0.05)] transition-transform hover:-translate-y-1">
              <div className="mb-2 inline-flex items-center gap-2 font-black text-[#00ADB5] uppercase tracking-wider text-base">
                <MoneyIcon size={24} weight="fill" />
                Expense Engine
              </div>
              <p className="font-bold text-slate-500 leading-relaxed">Split by equal, exact amount, percentage, or shares and preview before saving.</p>
            </div>
            <div className="rounded-3xl border-[4px] border-white bg-white/80 p-5 shadow-[0_6px_15px_rgba(0,0,0,0.05)] transition-transform hover:-translate-y-1">
              <div className="mb-2 inline-flex items-center gap-2 font-black text-[#00ADB5] uppercase tracking-wider text-base">
                <MapPinAreaIcon size={24} weight="fill" />
                Visited Places
              </div>
              <p className="font-bold text-slate-500 leading-relaxed">Capture photos, notes, and ratings per person for each place in your timeline.</p>
            </div>
            <div className="rounded-3xl border-[4px] border-white bg-white/80 p-5 shadow-[0_6px_15px_rgba(0,0,0,0.05)] transition-transform hover:-translate-y-1">
              <div className="mb-2 inline-flex items-center gap-2 font-black text-[#00ADB5] uppercase tracking-wider text-base">
                <UsersThreeIcon size={24} weight="fill" />
                Safe Collaboration
              </div>
              <p className="font-bold text-slate-500 leading-relaxed">Use invite links, join requests, and creator approval to control access.</p>
            </div>
          </div>
        </section>

        <div className="grid gap-4 relative">
          <LoginForm inviteToken={params.invite} nextPath={params.next} />
          <p className="text-center font-bold text-white drop-shadow-sm text-base">
            New here?{" "}
            <Link
              href={`/signup${params.invite ? `?invite=${encodeURIComponent(params.invite)}` : ""}` as Route}
              className="text-[#393E46] underline decoration-2 underline-offset-4 hover:text-white transition-colors"
            >
              Create an account
            </Link>
          </p>
        </div>
        
      </div>
    </main>
  );
}
