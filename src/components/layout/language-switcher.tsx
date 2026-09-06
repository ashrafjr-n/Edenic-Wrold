"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";
import { setLocale } from "@/lib/set-locale";
import type { Dictionary } from "@/lib/dictionaries/en";
import type { Locale } from "@/types/locale";

interface LanguageSwitcherProps {
  dict: Dictionary;
  locale: Locale;
}

/** Each language wearing its OWN script, short enough to live inside a 44px
    circle. That is what lets the fan work with no labels at all: a reader
    finds their language by recognising the letters, not by reading a list.
    The full name still reaches a screen reader through `aria-label`. */
const SHORT: Record<Locale, string> = {
  en: "EN",
  ar: "ع",
  ku: "ک",
};

/** Order matters twice over: it is the reading order, and the fan lays the
    FIRST one closest to the chip and staggers outward from there. */
const ORDER: Locale[] = ["en", "ar", "ku"];

/** How far apart the circles start, in seconds — small enough that the three
    read as one gesture rather than three separate arrivals. */
const STAGGER = 0.06;

/**
 * The header's language chip, and the fan of circles it opens.
 *
 * **Not a dropdown panel.** Pressing the chip sends out one more circle per
 * language, each the same size and material as the chip itself: to the LEFT
 * of it from `sm` up, and DOWNWARDS on a phone, where the chip is already
 * near the right edge and there is no room beside it. They spring out of the
 * chip, staggered, and the active one is the only filled one — see
 * `.lang-orb` in `globals.css` for the motion and why it uses
 * `animation-fill-mode: backwards`.
 *
 * This replaced a `.card` popover listing the three languages as rows. The
 * chrome it sits in is a row of circular clay chips, and a rectangular panel
 * dropping out of one of them read as a browser menu bolted onto the design
 * rather than part of it.
 *
 * Switching writes the locale to a cookie (`setLocale`, a Server Action —
 * `cookies().set` there always carries `path: "/"`, unlike a client-side
 * `document.cookie`, which defaults to the CURRENT path and would leave the
 * cookie invisible to Server Components rendering any other route) and then
 * `router.refresh()`s so every Server Component re-reads it. Only site
 * chrome and Pinki's speech switch language; the taught content (numbers,
 * letters, colors) never does — see CLAUDE.md's language switcher
 * conventions.
 */
export function LanguageSwitcher({ dict, locale }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const choose = async (next: Locale) => {
    setOpen(false);
    if (next === locale) return;
    await setLocale(next);
    router.refresh();
  };

  const NAME: Record<Locale, string> = {
    en: dict.header.english,
    ar: dict.header.arabic,
    ku: dict.header.kurdish,
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Button3D
        tone={{ face: "var(--accent)", edge: "var(--accent-dark)", text: "#fff" }}
        aria-label={dict.header.changeLanguage}
        aria-expanded={open}
        className="btn3d--icon-accent h-11 w-11 shrink-0"
        onClick={() => setOpen((value) => !value)}
      >
        {/* A quarter turn while the fan is out — the chip acknowledges the
            press without becoming a different control. `rotate` is its own
            property in Tailwind v4, so it composes with `.btn3d`'s own
            press `translate` instead of fighting it. */}
        <Languages
          className={`h-5 w-5 transition-transform duration-300 ${open ? "rotate-90" : ""}`}
          strokeWidth={2.25}
        />
      </Button3D>

      {open && (
        <div
          role="menu"
          aria-label={dict.header.chooseLanguage}
          /* Phone: straight down from the chip. From `sm`: out to its left,
             `flex-row-reverse` so the FIRST language is the one nearest the
             chip and the fan reads outward in DOM order, matching the
             stagger below. */
          className="absolute left-1/2 top-full z-30 mt-2.5 flex -translate-x-1/2 flex-col items-center gap-2.5 sm:left-auto sm:right-full sm:top-1/2 sm:mr-2.5 sm:mt-0 sm:-translate-y-1/2 sm:translate-x-0 sm:flex-row-reverse"
        >
          {ORDER.map((id, index) => {
            const active = id === locale;

            return (
              <Button3D
                key={id}
                role="menuitemradio"
                aria-checked={active}
                aria-label={NAME[id]}
                title={NAME[id]}
                onClick={() => choose(id)}
                tone={
                  active
                    ? { face: "var(--accent)", edge: "var(--accent-dark)", text: "#fff" }
                    : { face: "var(--surface)", text: "var(--color-ink-fixed)" }
                }
                variant={active ? "playful" : "calm"}
                /* The chosen language wears the chip's own accent; the rest
                   are white clay. `.btn3d--clay-white` is the site's white
                   chrome material — `calm` alone reads as a flat sticker
                   beside a grained accent circle. */
                className={`lang-orb h-11 w-11 shrink-0 text-base font-bold ${
                  active ? "btn3d--icon-accent" : "btn3d--clay-white lang-orb--rest"
                }`}
                style={{ animationDelay: `${index * STAGGER}s` }}
              >
                <span aria-hidden>{SHORT[id]}</span>
              </Button3D>
            );
          })}
        </div>
      )}
    </div>
  );
}
