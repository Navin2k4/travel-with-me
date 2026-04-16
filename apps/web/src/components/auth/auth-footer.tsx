import Image from "next/image";
import brandText from "@/travelwithmetext.png";

export function AuthFooter() {
  return (
    <footer className="mt-8 border-t border-border/60 bg-background/60">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-center sm:flex-row sm:text-left">
        <div className="rounded-2xl border border-border p-2">
          <h1 className="text-2xl font-semibold leading-tight text-foreground md:text-3xl"><span className="text-primary">Tra</span>vel With<span className="text-primary"> Me</span></h1>
        </div>
        <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card/80 px-4 py-2 text-xs text-muted-foreground backdrop-blur-md">
          <div className="uppercase tracking-widest text-primary">© {new Date().getFullYear()} Travel With Me. All rights reserved.</div>
          <div>Made with love for smarter group travel.</div>
        </div>
      </div>
    </footer>
  );
}
