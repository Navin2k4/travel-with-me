"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

type ChromeShellProps = {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
};

export function ChromeShell({ header, footer, children }: ChromeShellProps) {
  const pathname = usePathname();
  const isTripStoryPage = /^\/trips\/[^/]+\/story$/.test(pathname);

  return (
    <>
      {!isTripStoryPage ? header : null}
      <div>{children}</div>
      {!isTripStoryPage ? footer : null}
    </>
  );
}
