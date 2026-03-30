import { SignupForm } from "@/components/auth/signup-form";
import { getCurrentUser } from "@/lib/auth/session";
import type { Route } from "next";
import Image from "next/image";
import { CalendarDotsIcon, MapPinAreaIcon, MoneyIcon, UsersThreeIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { redirect } from "next/navigation";
import brandText from "@/travelwithmetext.png";

type Props = {
  searchParams: Promise<{ invite?: string; next?: string }>;
};

export default async function SignupPage({ searchParams }: Props) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect((params.next || "/") as Route);

  return (
    <main className="min-h-[calc(100vh-56px)] w-full relative flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-[#FFB703] to-[#FB8500] overflow-hidden">
      {/* Soft backdrop lighting */}
      <div className="absolute top-10 right-10 w-[30vh] h-[30vh] bg-white/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[40vh] h-[40vh] bg-[#71C9CE]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.2fr_1fr] bg-white/30 backdrop-blur-2xl rounded-[3rem] p-6 text-[#393E46] sm:p-10 border-[6px] border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
        
        <section className="grid gap-6">
          <div className="space-y-4">
            <Image src={brandText} alt="Travel With Me" className="h-20 w-auto object-contain drop-shadow-md" priority />
            <div className="text-4xl md:text-5xl font-black tracking-tighter drop-shadow-sm leading-tight uppercase font-sans">
              Start your shared <br/><span className="text-white drop-shadow-md">travel workspace</span>
            </div>
            <div className="max-w-xl text-lg font-bold text-[#393E46]/80 bg-white/50 p-5 rounded-3xl border-[3px] border-white shadow-inner">
              Create your account to plan trips with richer details, split spends fairly, and keep everyone coordinated.
            </div>
          </div>
          
          <div className="grid gap-4 text-sm sm:grid-cols-2 mt-4">
            <div className="rounded-3xl border-[4px] border-white bg-white/80 p-5 shadow-[0_6px_15px_rgba(0,0,0,0.05)] transition-transform hover:-translate-y-1">
              <div className="mb-2 inline-flex items-center gap-2 font-black text-[#00ADB5] uppercase tracking-wider text-base">
                <CalendarDotsIcon size={24} weight="fill" />
                Structured Setup
              </div>
              <p className="font-bold text-slate-500 leading-relaxed">Add start point, dates, status, and transport details from day one.</p>
            </div>
            <div className="rounded-3xl border-[4px] border-white bg-white/80 p-5 shadow-[0_6px_15px_rgba(0,0,0,0.05)] transition-transform hover:-translate-y-1">
              <div className="mb-2 inline-flex items-center gap-2 font-black text-[#00ADB5] uppercase tracking-wider text-base">
                <UsersThreeIcon size={24} weight="fill" />
                People-First
              </div>
              <p className="font-bold text-slate-500 leading-relaxed">Add people you traveled with quickly and discover others by search.</p>
            </div>
            <div className="rounded-3xl border-[4px] border-white bg-white/80 p-5 shadow-[0_6px_15px_rgba(0,0,0,0.05)] transition-transform hover:-translate-y-1">
              <div className="mb-2 inline-flex items-center gap-2 font-black text-[#00ADB5] uppercase tracking-wider text-base">
                <MoneyIcon size={24} weight="fill" />
                Accurate Settlements
              </div>
              <p className="font-bold text-slate-500 leading-relaxed">Track who paid, preview splits, and auto-generate who owes whom.</p>
            </div>
            <div className="rounded-3xl border-[4px] border-white bg-white/80 p-5 shadow-[0_6px_15px_rgba(0,0,0,0.05)] transition-transform hover:-translate-y-1">
              <div className="mb-2 inline-flex items-center gap-2 font-black text-[#00ADB5] uppercase tracking-wider text-base">
                <MapPinAreaIcon size={24} weight="fill" />
                Place Journal
              </div>
              <p className="font-bold text-slate-500 leading-relaxed">Store visited places with media and ratings so memories stay organized.</p>
            </div>
          </div>
        </section>

        <div className="grid gap-4 relative">
          <SignupForm inviteToken={params.invite} nextPath={params.next} />
          <p className="text-center font-bold text-white drop-shadow-sm text-base">
            Already have an account?{" "}
            <Link
              href={`/login${params.invite ? `?invite=${encodeURIComponent(params.invite)}` : ""}` as Route}
              className="text-[#393E46] underline decoration-2 underline-offset-4 hover:text-white transition-colors"
            >
              Login
            </Link>
          </p>
        </div>
        
      </div>
    </main>
  );
}
