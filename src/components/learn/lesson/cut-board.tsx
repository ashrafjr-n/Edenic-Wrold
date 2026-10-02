"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import Image, { type StaticImageData } from "next/image";
import { Slice } from "lucide-react";
import { Celebration } from "@/components/ui/celebration";
import { MARKET_BOARD } from "@/data/market";
import { format } from "@/lib/format-dict";
import { lessonCue } from "@/lib/cue";
import { ClayWord } from "./clay-word";
import { CueButton } from "./cue-button";

/** How far along the line the knife has to go to cut (of the line). */
const CUT_AT = 0.8;
/** Below this the finger never really moved — a tap: the knife cuts by itself. */
const TAP_PX = 8;
/** The knife's own slide, on a tap or a key. Kept with `duration-500`. */
const SLIDE_MS = 500;

interface CutBoardProps {
  word: string;
  /** The thing whole, and cut open. */
  picture: StaticImageData;
  inside: StaticImageData;
  /** "Cut the {word}" — the knife's name for a screen reader. */
  knifeAria: string;
  /** "Hear {word}" — the speaker's name. */
  hearLabel: string;
  onSolved: () => void;
}

/**
 * Cut it open: the thing on Nova's cutting board, a dotted line across it
 * and a knife at the line's start. Drag the knife along the line — or tap
 * it, or press it with a key, and it slides across by itself — and the
 * thing splits, its two halves sliding apart as the inside drops in. Then
 * its word and speaker. Nothing to get wrong: the doing is the learning.
 */
export function CutBoard({ word, picture, inside, knifeAria, hearLabel, onSolved }: CutBoardProps) {
  const [cut, setCut] = useState(false);
  const [sliding, setSliding] = useState(false);
  const [drag, setDrag] = useState<{ from: number; x: number } | null>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const lineWidth = () => lineRef.current?.getBoundingClientRect().width ?? 1;

  const open = () => {
    if (cut) return;
    setDrag(null);
    setCut(true);
    onSolved();
  };

  /** A tap or a key: the knife goes across on its own, then cuts. */
  const slide = () => {
    if (cut || sliding) return;
    setSliding(true);
    timer.current = window.setTimeout(open, SLIDE_MS);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (cut || sliding) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ from: event.clientX, x: 0 });
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    const x = Math.min(Math.max(event.clientX - drag.from, 0), lineWidth());
    if (x >= lineWidth() * CUT_AT) open();
    else setDrag({ ...drag, x });
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (drag.x < TAP_PX) slide();
    /* Let go short of the end: the knife slides back to the start. */
    setDrag(null);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    slide();
  };

  /* The knife rides the line (as a share of it, or the finger's px); it
     only animates when it is not under the finger. */
  const knifeAt = cut || sliding ? "100%" : drag ? `${drag.x}px` : "0%";

  return (
    <div className="flex w-full flex-col items-center gap-5 sm:gap-7 lg:gap-6">
      {/* The board: the thing on it, the line across it, the knife. The
          taught content reads left to right — the knife never mirrors. */}
      <div dir="ltr" className="relative aspect-[1.75] w-full max-w-[min(26rem,62svh)] sm:max-w-[min(30rem,52svh)] lg:max-w-[min(38rem,calc((var(--stage-h)-9rem)*1.75))]">
        <Image src={MARKET_BOARD} alt="" fill preload sizes="(min-width: 1024px) 38rem, 26rem" className="pointer-events-none select-none object-contain" />

        {/* The thing on the slab (the board's left 80%), whole, then in two
            halves sliding apart as the inside drops in. */}
        <div className="absolute inset-y-[12%] left-[10%] w-[62%]">
          {cut ? (
            <>
              {(["inset(0 50% 0 0)", "inset(0 0 0 50%)"] as const).map((clip, i) => (
                <span
                  key={clip}
                  className="cut-half absolute inset-0"
                  style={{ clipPath: clip, "--apart": i === 0 ? "-14%" : "14%" } as CSSProperties}
                >
                  <Image src={picture} alt="" fill sizes="(min-width: 1024px) 24rem, 16rem" className="select-none object-contain" />
                </span>
              ))}
              <span className="cut-inside absolute inset-[-6%]">
                <Image src={inside} alt={word} fill preload sizes="(min-width: 1024px) 26rem, 17rem" className="select-none object-contain" />
              </span>
              <Celebration />
            </>
          ) : (
            <span className="absolute inset-0">
              <Image src={picture} alt={word} fill preload sizes="(min-width: 1024px) 24rem, 16rem" className="select-none object-contain" />
              {/* Inside, fetched now, so it is ready the moment it is cut. */}
              <Image src={inside} alt="" width={8} height={8} loading="eager" sizes="(min-width: 1024px) 26rem, 17rem" className="hidden" />
            </span>
          )}

          {/* The line, and the knife riding it. */}
          {!cut && (
            <div ref={lineRef} className="absolute inset-x-[-4%] top-1/2 h-0">
              <span aria-hidden className="cut-line absolute inset-x-0 top-0 -translate-y-1/2" />
              <span
                className={`absolute top-0 -translate-y-1/2 ${drag ? "" : "transition-[left] duration-500 ease-in-out"}`}
                style={{ left: knifeAt }}
              >
                <button
                  type="button"
                  aria-label={format(knifeAria, { word })}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={() => setDrag(null)}
                  onKeyDown={onKeyDown}
                  /* `touch-action: none` or a drag scrolls the page instead. */
                  className={`clay -ml-[1.6rem] flex h-[3.2rem] w-[3.2rem] touch-none select-none items-center justify-center rounded-full focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[var(--page-accent-color)] sm:-ml-8 sm:h-16 sm:w-16 ${
                    drag ? "cursor-grabbing" : sliding ? "" : "anim-breathe cursor-grab"
                  }`}
                  style={
                    {
                      backgroundColor: "var(--page-accent-color)",
                      color: "var(--page-accent-ink, #fff)",
                      "--clay-edge": "var(--page-accent-edge)",
                    } as CSSProperties
                  }
                >
                  <Slice className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.75} />
                </button>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* The word, once it is open — a slot of its own height either way. */}
      <div className="flex h-[min(6rem,12svh)] items-center justify-center">
        {cut && (
          <div className="flex items-center gap-4 sm:gap-6">
            <CueButton cue={lessonCue.word(word)} label={format(hearLabel, { word })} size="lg" />
            <ClayWord word={word} size="sm" />
          </div>
        )}
      </div>
    </div>
  );
}
