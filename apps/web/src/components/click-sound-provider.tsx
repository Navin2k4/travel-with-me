"use client";

import { useEffect } from "react";
import useSound from "use-sound";

const interactiveSelector = [
  "a[href]",
  "button",
  "summary",
  "[role='button']",
  "[role='menuitem']",
  "[role='option']",
  "[role='tab']",
  "[role='checkbox']",
  "[role='switch']",
  "[data-click-sound='true']",
].join(", ");

function isDisabled(element: HTMLElement) {
  if (element.matches("[aria-disabled='true'], [data-disabled='true']")) {
    return true;
  }

  if ("disabled" in element && typeof element.disabled === "boolean") {
    return element.disabled;
  }

  const disabledAncestor = element.closest<HTMLElement>(
    "button:disabled, [aria-disabled='true'], [data-disabled='true']"
  );

  return Boolean(disabledAncestor);
}

export function ClickSoundProvider({ children }: { children: React.ReactNode }) {
  const [playClickSound] = useSound("/button_click_effect.wav", {
    interrupt: true,
  });

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      // Buttons already play their own sound via ui/button.tsx.
      if (target.closest("[data-slot='button']")) return;
      if (target.closest("[data-no-click-sound='true']")) return;

      const interactiveElement = target.closest<HTMLElement>(interactiveSelector);
      if (!interactiveElement || isDisabled(interactiveElement)) return;

      playClickSound();
    };

    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [playClickSound]);

  return children;
}
