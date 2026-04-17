import Link from "next/link";
import { redirect } from "next/navigation";
import type { Route } from "next";
import {
  CalendarDotsIcon,
  MapPinAreaIcon,
  MoneyIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/dist/ssr";
import { SignIn } from "@clerk/nextjs";
import { getCurrentUser } from "@/lib/auth/session";
import Image from "next/image";
import { MoneyManageComponent } from "@/components/landing/MoneyManageComponent";
import { MockTripsLanding } from "@/components/landing/MockTripsLanding";
import { CtoLanding } from "@/components/landing/CtoLanding";

type Props = {
  searchParams: Promise<{ invite?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect((params.next || "/") as Route);

  return (
    <section className="relative w-full bg-[#050505] items-center justify-center py-8 overflow-hidden">
      {/* Optional faint background glow here */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#b4f039]/5 rounded-full blur-[128px] pointer-events-none" />
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10">

        {/* Left Column: Text & CTA */}
        <div className="flex flex-col items-start text-left">
          <span className="text-gray-400 text-xs font-semibold tracking-widest uppercase mb-6 ">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white  leading-[1.1]">
              <span className="text-primary">Tra</span>vel With<span className="text-primary"> Me</span>
            </h1>
          </span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
            The ultimate <br className="hidden lg:block" />
            workspace for <br className="hidden lg:block" />
            <span className="text-[#b4f039]">group travel.</span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg lg:text-xl max-w-xl mb-10 leading-relaxed font-medium">
            Collaboratively plan trips, track group expenses, and document places together, all in one place. Say goodbye to chaotic spreadsheets.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button className="bg-[#b4f039] text-black px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide hover:bg-[#a0d832] transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#b4f039] focus:ring-offset-[#0a0a0a]">
              Start Planning Your Trip
            </button>
          </div>
        </div>

        {/* Right Column: Mockup */}
        <div className="relative w-full rounded-2xl items-center justify-center overflow-hidden flex flex-col md:flex-row min-h-[500px]">

          <SignIn
            routing="path"
            path="/login"
            signUpUrl={`/signup${params.invite ? `?invite=${encodeURIComponent(params.invite)}` : ""}`}
            forceRedirectUrl={params.next || "/"}
            fallbackRedirectUrl={params.next || "/"}
          />

        </div>
      </div>
      <MockTripsLanding />
      <MoneyManageComponent />
      <CtoLanding />
    </section>
  );
}
