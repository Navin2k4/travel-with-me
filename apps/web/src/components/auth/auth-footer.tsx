import Image from "next/image";
import brandText from "@/travelwithmetext.png";

export function AuthFooter() {
  return (
    <footer className="mt-8 border-t border-border/60 bg-background/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 text-center sm:flex-row sm:text-left">
        <div className="rounded-2xl border border-border bg-white p-2 backdrop-blur-md">
          <Image src={brandText} alt="Travel With Me" className="h-6 w-auto object-contain" />
        </div>
        <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card/80 px-4 py-2 text-xs text-muted-foreground backdrop-blur-md">
          <div className="uppercase tracking-widest text-primary">© {new Date().getFullYear()} Travel With Me. All rights reserved.</div>
          <div>Made with love for smarter group travel.</div>
        </div>
      </div>
    </footer>
  );
}
