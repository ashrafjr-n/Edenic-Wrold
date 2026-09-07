"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import type { Dictionary } from "@/lib/dictionaries/en";
import { dirFor } from "@/lib/format-dict";
import { usePageTransition } from "@/store/page-transition";
import novaPoint from "../../../public/assets/activity-page/trial/nova/nova-point.png";
import novaTalk from "../../../public/assets/activity-page/trial/nova/nova-talk.png";

type BubbleVars = CSSProperties & { "--bubble-ink"?: string };

/** `hello` → she introduces herself, with a Skip chip. `start` → she points
    at the first stop and there is no button at all: the cloud she is
    pointing at is the thing to press. `done` → she is gone for this visit. */
type Beat = "hello" | "start" | "done";

/**
 * Nova, life size, welcoming a child onto the Edenic Trail.
 *
 * **Two beats, and a tap anywhere moves between them** — `hello` (she says
 * who she is, with a Skip chip) then `start` (she points up the sky at the
 * first stop, with NO button, because the glowing first cloud is the thing
 * she is pointing at). Skip on the first beat goes straight to the second
 * rather than skipping her altogether: the pointing IS the guidance, and a
 * child who taps Skip still needs to be told where to go.
 *
 * **She is sized and cropped the way `PinkiLean` is** — the numbers lesson's
 * own life-size guide — because that composition is already paid for, and
 * every line of it is load-bearing here too:
 *
 * - **An absolutely positioned layer that costs the page no height.** In
 *   flow, a figure this size pushes the very thing she points at off the
 *   screen; out of flow she is free to be big.
 * - **Sized by the HEIGHT of the viewport, never its width** (`h-[46%]`,
 *   `sm:h-[58%]`). A width share makes her a different figure on every
 *   screen; a height share holds her steady. `w-auto max-w-none` is what
 *   lets her be wider than her box — Tailwind's preflight caps images at
 *   `max-width: 100%`, which would squash her back inside it.
 * - **`pointer-events-none` on her and the bubble**, so the tap-anywhere
 *   catcher underneath answers every tap wherever it lands.
 * - **Three separate animated properties that compose** — the entrance
 *   animates `translate`, the idle breathe animates `transform`, and the
 *   lean is `rotate`. None may be rewritten as a hand-built `transform`.
 *
 * **`fixed`, not absolute in the sky.** The sky is two viewports tall; she
 * belongs to the screen, not to a point on the map.
 *
 * **She waits for the cloud transition to finish** (`usePageTransition`) —
 * arriving from the Play card, the drift is still covering the screen for
 * about a second, and a welcome nobody sees is not a welcome. On a direct
 * visit `active` is already false and she arrives at once.
 */
export function TrailIntro({ dict }: { dict: Dictionary }) {
  const transitionActive = usePageTransition((state) => state.active);
  const [beat, setBeat] = useState<Beat>("hello");
  const [shown, setShown] = useState(false);
  const dir = dirFor(dict.locale);

  useEffect(() => {
    if (!shown || beat === "done") return;
    /* Keyboard parity with the tap-anywhere catcher: Escape, Enter and Space
       all move her on, so she is never a dead end for a child (or a tester)
       driving the page from a keyboard. */
    const onKey = (event: KeyboardEvent) => {
      if (!["Escape", "Enter", " "].includes(event.key)) return;
      setBeat((current) => (current === "hello" ? "start" : "done"));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shown, beat]);

  useEffect(() => {
    if (transitionActive || shown) return;
    /* A breath after the drift clears, so she arrives onto the sky rather
       than out from behind the last cloud of the transition. */
    const timer = window.setTimeout(() => setShown(true), 260);
    return () => window.clearTimeout(timer);
  }, [transitionActive, shown]);

  if (!shown || beat === "done") return null;

  const pointing = beat === "start";

  return (
    /* The catcher. `fixed inset-0` so "tap anywhere" means anywhere, and
       above the header's own `z-20` so a tap on the header counts too —
       she is only two taps long, and a tap that quietly did nothing would
       be the worse trade. */
    <div
      className="fixed inset-0 z-30 overflow-hidden"
      onClick={() => setBeat(pointing ? "done" : "start")}
      role="presentation"
    >
      <div
        /* **Anchored to Nova, not to the page's edge.** It sat in a
           `justify-between` row along the bottom for a round, which pinned it
           to the far left corner with her at the far right and a tail
           pointing across an empty screen at nothing. The bubble belongs
           beside the character speaking, so it is positioned against the
           same edge she is: its right edge lands where her body starts, and
           `--left`'s tail (biased low, toward where a face actually is)
           points straight at her.

           Her own colour on the ring and tail — `--bubble-ink` falls back to
           Pinki, whose journey the bubble was built for. */
        className={`anim-fade-up pointer-events-none absolute bottom-[40%] right-[38%] z-10 w-[58%] sm:w-[30%] ${
          /* The pointing beat needs MORE clearance from her at desktop
             widths: her raised finger reaches further left and higher than
             her waving hand does, and at the greeting beat's placement the
             bubble's tail landed straight over the fingertip — hiding the
             one thing that beat exists to show. Measured against the pose,
             not guessed. The phone needs no such shift: she is much wider
             than the screen there, so the bubble already sits well clear
             above her arm. */
          pointing ? "sm:bottom-[46%] sm:right-[32%]" : "sm:bottom-[36%] sm:right-[26%]"
        }`}
        style={{ "--bubble-ink": "var(--color-nova)" } as BubbleVars}
      >
        <div>
          <p
            dir={dir}
            className="speech-bubble speech-bubble--left px-4 py-3 text-sm font-semibold leading-snug text-[var(--color-ink)] sm:px-5 sm:py-3.5 sm:text-base"
          >
            {pointing ? dict.trail.introStart : dict.trail.introHello}
          </p>

          {/* Only on the first beat. On the second the first cloud is the
              one thing to press, and a chip beside it would compete with
              exactly the thing she is pointing at. */}
          {!pointing && (
            <button
              type="button"
              /* A real button, not a styled span: it is the one control on
                 the first beat and has to be reachable by keyboard. Its
                 click bubbles to the catcher, which is what advances her —
                 no second handler to keep in step. */
              className="btn3d btn3d--calm btn3d--clay-white pointer-events-auto mt-3 px-5 py-2 text-sm sm:mt-4 sm:px-6 sm:py-2.5 sm:text-base"
              /* `--btn-text` has to be set by hand here, exactly as
                 `TrailCta` sets it: these are `Button3D`'s classes without
                 `Button3D`, and it is the component that normally turns a
                 tone into these variables — left unset the label rendered
                 invisible on the white face. `--color-ink-fixed`, not
                 `--color-ink`: `.btn3d--clay-white`'s face is pinned pale in
                 both themes, so its text must be too. */
              style={{ "--btn-text": "var(--color-ink-fixed)" } as CSSProperties}
            >
              <span dir={dir}>{dict.trail.introSkip}</span>
            </button>
          )}
        </div>
      </div>

      {/* Cropped by the right edge the way the numbers lesson crops Pinki —
          the crop is the design, and she enters from the edge that makes it. */}
      <span
        aria-hidden
        className="anim-pinki-lean-in pointer-events-none absolute -bottom-[2%] -right-[14%] h-[46%] rotate-[-3deg] sm:-right-[6%] sm:h-[58%]"
      >
        {/* BOTH poses mount, and the beat crossfades between them. Swapping
            one element's `src` flashes an empty box while the second file
            loads — she would blink out at the exact moment she raises her
            hand. The hidden one still loads, so the swap is instant. The
            wrapper keeps the breathe so the two never drift apart. */}
        <span className="anim-breathe relative block h-full w-auto">
          {[
            { src: novaTalk, on: !pointing },
            { src: novaPoint, on: pointing },
          ].map((pose, index) => (
            <Image
              key={index}
              src={pose.src}
              alt=""
              /* The PAINTED size, not the file's 463x539: `next/image` builds
                 its srcset from these, so the file's own numbers make it
                 serve a needlessly large image. */
              width={378}
              height={440}
              preload
              className={`h-full w-auto max-w-none object-contain transition-opacity duration-300 ${
                index === 0 ? "" : "absolute inset-0"
              } ${pose.on ? "opacity-100" : "opacity-0"}`}
            />
          ))}
        </span>
      </span>
    </div>
  );
}
