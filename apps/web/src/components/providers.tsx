"use client";

import { ClickSoundProvider } from "./click-sound-provider";
import { Toaster } from "./ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ClickSoundProvider>{children}</ClickSoundProvider>
      <Toaster richColors />
    </>
  );
}
