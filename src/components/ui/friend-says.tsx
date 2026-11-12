"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { usePageTransition } from "@/store/page-transition";

type BubbleVars = CSSProperties & { "--bubble-ink"?: string };

interface FriendSaysProps {
  /** The friend's own picture — a friend is never built, only shown. */
  picture: StaticImageData;
  /** Their identity colour (`var(--color-pinki)`…): a whisper of it in the bubble. */
  ink: string;
  /** What they say, one bubble a tap; after the last they step aside. */
  lines: readonly string[];
  /** The chip that sends them off at once. */
  skipLabel: string;
  dir: "rtl" | "ltr";
  onDone: () => void;
}

/**
 * **How a friend speaks to the child** (kept from Nova's welcome on the old
 * `/trail`, 2026-11-12, on request: "the friends are to speak this way"): life
 * size at the screen's edge, cropped by it, a white clay bubble beside them,
 * and a tap ANYWHERE moves them on — line by line, then away (`onDone`).
 * Silent until the audio lands; the bubble is the voice.
 *
 * What is load-bearing, all of it learnt on Nova's:
 *
 * - **A fixed layer that costs the page no height**, `z-10`: UNDER the header
 *   and the bottom nav (`z-30`), so the tap-anywhere catcher never swallows a
 *   tap meant for the site's chrome and the friend never covers the nav. A
 *   page's back button (`z-20`) out-ranks it too.
 * - **Sized by the viewport's HEIGHT, never its width** — a width share makes
 *   a different figure on every screen. `w-auto max-w-none` lets her be wider
 *   than her box (preflight caps images at `max-width: 100%`).
 * - **Three animated properties that compose**: the entrance animates
 *   `translate`, the idle breathe `transform`, the lean is `rotate`. None may
 *   be rewritten as one hand-built `transform`.
 * - **The bubble is the site's own white clay** (`card card-clay-white
 *   speech-clay`), its tail two shrinking discs of the same material stepping
 *   towards the friend — never a border, a mask or a scalloped cloud.
 *   `--bubble-ink` is the friend's colour and must stay an inline value.
 * - **The page holds still while they are there** (`useScrollLock`), and they
 *   wait for a cloud transition to clear before arriving.
 * - Their feet stand ON the phone's bottom nav, never under it (the bar's
 *   height + the safe area + a cushion for the lean's bounding box).
 */
export function FriendSays({ picture, ink, lines, skipLabel, dir, onDone }: FriendSaysProps) {
  const transitionActive = usePageTransition((state) => state.active);
  const [at, setAt] = useState(0);
  const [shown, setShown] = useState(false);

  useScrollLock(shown);

  const next = () => (at < lines.length - 1 ? setAt(at + 1) : onDone());

  useEffect(() => {
    if (!shown) return;
    /* Keyboard parity with the tap-anywhere catcher: never a dead end. */
    const onKey = (event: KeyboardEvent) => {
      if (!["Escape", "Enter", " "].includes(event.key)) return;
      event.preventDefault();
      if (at < lines.length - 1) setAt(at + 1);
      else onDone();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shown, at, lines.length, onDone]);

  useEffect(() => {
    if (transitionActive || shown) return;
    /* A breath after the clouds clear, so they arrive onto the page. */
    const timer = window.setTimeout(() => setShown(true), 260);
    return () => window.clearTimeout(timer);
  }, [transitionActive, shown]);

  if (!shown) return null;

  return (
    <div className="fixed inset-0 z-10 overflow-hidden" onClick={next} role="presentation">
      {/* Anchored to the friend, never to the page's far edge; narrow, so
          `text-balance` has lines to even out; allowed to lie over them on a
          phone, where they are as wide as the screen. From `sm` it stands to
          their left (they are about nine tenths as wide as they are tall). */}
      <div
        className="anim-fade-up pointer-events-none absolute bottom-[50%] left-1 z-10 w-[64%] max-w-[15.5rem] sm:bottom-[44%] sm:left-auto sm:right-[min(calc(2%_+_46svh),calc(100%_-_21rem))] sm:w-[20rem] sm:max-w-none"
        style={{ "--bubble-ink": ink } as BubbleVars}
      >
        <div className="relative">
          <p
            key={at}
            dir={dir}
            className="card card-clay-white speech-clay anim-fade-up text-balance px-5 py-4 text-center text-base font-semibold leading-snug text-[var(--color-ink)] sm:px-6 sm:py-4.5 sm:text-lg"
          >
            {lines[at]}
          </p>
          <span
            aria-hidden
            className="card card-clay-white card-pill speech-clay absolute right-[-1.9rem] top-[64%] h-[1.5rem] w-[1.5rem] sm:right-[-2.2rem] sm:h-[1.75rem] sm:w-[1.75rem]"
          />
          <span
            aria-hidden
            className="card card-clay-white card-pill speech-clay absolute right-[-3.4rem] top-[93%] h-[0.9rem] w-[0.9rem] sm:right-[-3.9rem] sm:h-[1.05rem] sm:w-[1.05rem]"
          />
        </div>

        {/* A real button (keyboard), `Button3D`'s classes by hand as on the
            clay-white chips: its face is pinned pale, so its ink is too. */}
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDone();
          }}
          className="btn3d btn3d--calm btn3d--clay-white pointer-events-auto mt-4 px-5 py-2 text-sm sm:mt-5 sm:px-6 sm:py-2.5 sm:text-base"
          style={{ "--btn-text": "var(--color-ink-fixed)" } as CSSProperties}
        >
          <span dir={dir}>{skipLabel}</span>
        </button>
      </div>

      {/* Cropped by the right edge — the crop is the design, and they enter
          from the edge that makes it. */}
      <span
        aria-hidden
        className="anim-pinki-lean-in pointer-events-none absolute bottom-[calc(4rem+0.9rem+env(safe-area-inset-bottom))] -right-[16%] h-[52%] rotate-[-3deg] sm:-bottom-[2%] sm:right-[2%] sm:h-[58%]"
      >
        <span className="anim-breathe relative block h-full w-auto">
          <Image
            src={picture}
            alt=""
            /* The PAINTED size, not the file's: it drives the srcset. */
            width={Math.round((440 * picture.width) / picture.height)}
            height={440}
            preload
            className="h-full w-auto max-w-none object-contain"
          />
        </span>
      </span>
    </div>
  );
}
