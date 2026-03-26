import Image from "next/image";
import brandText from "@/travelwithmetext.png";

export function AuthFooter() {
  return (
    <footer className="mt-6 border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-2 py-4 text-center sm:flex-row sm:text-left">
        <Image src={brandText} alt="Travel With Me" className="h-6 w-auto object-contain" />
        <div className="text-xs text-black/70">
          <div>© {new Date().getFullYear()} Travel With Me. All rights reserved.</div>
          <div>Made with love for smarter group travel.</div>
        </div>
      </div>
    </footer>
  );
}
