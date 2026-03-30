import Image from "next/image";
import brandText from "@/travelwithmetext.png";

export function AuthFooter() {
  return (
    <footer className="mt-8 border-t-[4px] border-white/20 bg-transparent">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 text-center sm:flex-row sm:text-left">
        <div className="bg-white/50 backdrop-blur-md p-2 rounded-2xl border-[3px] border-white/80 shadow-sm">
          <Image src={brandText} alt="Travel With Me" className="h-6 w-auto object-contain drop-shadow-sm" />
        </div>
        <div className="text-xs font-bold text-[#393E46]/80 flex flex-col gap-1 bg-white/50 backdrop-blur-md px-4 py-2 rounded-2xl border-[3px] border-white/80 shadow-sm">
          <div className="uppercase tracking-widest text-[#00ADB5]">© {new Date().getFullYear()} Travel With Me. All rights reserved.</div>
          <div>Made with love for smarter group travel.</div>
        </div>
      </div>
    </footer>
  );
}
