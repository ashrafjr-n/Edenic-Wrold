"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import type { Dictionary } from "@/lib/dictionaries/en";
import { dirFor } from "@/lib/format-dict";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { usePageTransition } from "@/store/page-transition";
import novaPoint from "../../../public/assets/activity-page/trial/nova/nova-point.png";
import novaTalk from "../../../public/assets/activity-page/trial/nova/nova-talk.png";

type BubbleVars = CSSProperties & { "--bubble-ink"?: string };

/** `hello` → she introduces herself, with a Skip chip and a tap-anywhere
    catcher over the page. `start` → she points at the first stop **and
    stays there**: no button, no catcher, nothing to dismiss her. That is
    the resting state of this page until the first stage exists to walk
    into — at which point tapping that cloud becomes what moves her on. */
type Beat = "hello" | "start";

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

  /* **The page holds still while she is on it.** She is `fixed`, so the sky
     scrolls out from under her — a child flicking at her sees the map slide
     away while she stays put, which reads as the page slipping rather than
     as scrolling. Since the pointing beat is this page's resting state, that
     means the trail does not scroll yet at all; the lock lifts on its own the
     day she is dismissed by walking into the first stage. */
  useScrollLock(shown);

  useEffect(() => {
    if (!shown || beat === "start") return;
    /* Keyboard parity with the tap-anywhere catcher: Escape, Enter and Space
       all move her on, so she is never a dead end for a child (or a tester)
       driving the page from a keyboard. */
    const onKey = (event: KeyboardEvent) => {
      if (!["Escape", "Enter", " "].includes(event.key)) return;
      setBeat("start");
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

  if (!shown) return null;

  const pointing = beat === "start";

  return (
    /* **`z-10`, UNDER the header and the bottom nav** (both `z-20`), on
       direct request: the tap-anywhere catcher covers the page but must
       never swallow a tap meant for the site's own chrome, and Nova herself
       must never cover the bottom nav. Sitting below them does both at once
       — no header height to hardcode and keep in step, and the nav paints
       over her rather than the other way round.

       **The catcher only exists while she is greeting.** Once she is
       pointing there is nothing left to advance, so the whole layer goes
       `pointer-events-none` and the page underneath — the back button
       included — is fully usable again with her still standing there. */
    <div
      className={`fixed inset-0 z-10 overflow-hidden ${pointing ? "pointer-events-none" : ""}`}
      onClick={pointing ? undefined : () => setBeat("start")}
      role="presentation"
    >
      <div
        /* **Anchored to Nova, not to the page's edge.** It sat in a
           `justify-between` row along the bottom for a round, which pinned it
           to the far left corner with her at the far right and a tail
           pointing across an empty screen at nothing. The bubble belongs
           beside the character speaking, so it is positioned against the
           same edge she is, with the cloud's two tail puffs stepping down
           off its bottom-right corner toward her.

           **Deliberately narrow, and capped.** A wide box gives
           `text-balance` nothing to balance — the line simply fits, and the
           result is the one long stripe of text this replaced. At this width
           every one of the three languages breaks over two or three lines,
           which is what makes it read as a spoken block rather than a
           caption.

           **From `sm` up it TRACKS HER, with the same `svh` term her own
           offset carries** (`76.5% - 10.2svh`): once she moves a third of the
           screen left to aim at the first stop, a bubble pinned to a fixed
           percentage of the width would have been left sitting on her chest.
           The `min(..., 100% - 21rem)` is a floor, not a second opinion — on
           a small tablet the tracking value would push the 20rem bubble past
           the left edge and clip its first word. The pointing beat also drops
           from 58% to 48% there: she is beside the bubble now rather than
           behind it, so it no longer has to ride above her head, and at 58%
           it would have covered the very stop she is pointing at.

           Her own colour on the ring and the tint at its foot —
           `--bubble-ink` falls back to Pinki, whose journey the bubble was
           built for. */
        className={`anim-fade-up pointer-events-none absolute left-1 z-10 w-[64%] max-w-[15.5rem] sm:left-auto sm:w-[20rem] sm:max-w-none ${
          /* **It is allowed to lie OVER her**, on direct request — what
             matters is that it reads as her speaking, not that it clears
             her silhouette. That freedom is what makes a phone work at all
             at this size: she is wider than the screen there, so there is
             no space beside her to put it in, and a bubble squeezed into
             what is left would be three words to a line.

             **The pointing beat rides much higher, at every width.** On
             the greeting beat she is waving, so a bubble across her chest
             is fine; on the pointing beat she has stepped forward and her
             head fills the middle of the screen, and at the greeting's
             height the bubble lay straight over her face — one eye and her
             raised hand both under it (screenshotted at 390x844). It goes
             up until its bottom edge clears her horns, which puts it in the
             band of open sky between the first cloud and the top of her
             head. It also steps further right at desktop widths, where her
             raised finger reaches higher and further left than her waving
             hand and the tail would otherwise land across the fingertip —
             hiding the one thing that beat exists to show. */
          pointing
            ? "bottom-[60%] sm:bottom-[48%] sm:right-[min(calc(79.5%_-_10.2svh),calc(100%_-_21rem))]"
            : "bottom-[50%] sm:bottom-[46%] sm:right-[min(calc(80.5%_-_10.2svh),calc(100%_-_21rem))]"
        }`}
        style={{ "--bubble-ink": "var(--color-nova)" } as BubbleVars}
      >
        <div>
          {/* **The site's own white clay, not a bubble shape of its own.**
              `.card .card-clay-white` is the material every white chrome
              surface here is made of — inner top highlight, inner bottom
              shade, one wide soft drop shadow — and `.speech-clay` adds the
              single thing a card doesn't have: a whisper of Nova's lavender
              in the face, so the bubble doesn't read as one more of the
              white stage clouds behind it. **No border, no outline, no
              mask.** A lavender-ringed, scalloped cloud silhouette was built
              here first and cut on direct request; 122 lines of mask
              geometry became one line of reuse.

              **The tail is two shrinking clay discs stepping out of the
              bubble's RIGHT edge, biased low** — the direction
              `.speech-bubble--left`'s triangle pointed, because Nova stands
              to the right of the bubble at every width and in every locale
              (the layout never mirrors). They are the same three classes as
              the bubble plus `.card-pill`, so they are literally the same
              material rather than a lookalike, and they can never drift from
              it. `.card-pill` is what rounds them: `.card` sets
              `border-radius` and is UNLAYERED, so a Tailwind `rounded-full`
              would silently lose to it. */}
          <div className="relative">
            <p
              dir={dir}
              /* `text-balance` is what "spread it over the lines, don't run
                 it out in one" actually is — the browser evens the lines out
                 itself, so a short Kurdish line and a long Arabic one both
                 come out as a block rather than one long line plus an
                 orphan. Centred, because the bubble is symmetrical and has
                 no strong edge for ragged text to hang off. */
              className="card card-clay-white speech-clay text-balance px-5 py-4 text-center text-base font-semibold leading-snug text-[var(--color-ink)] sm:px-6 sm:py-4.5 sm:text-lg"
            >
              {pointing ? dict.trail.introStart : dict.trail.introHello}
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
              className="btn3d btn3d--calm btn3d--clay-white pointer-events-auto mt-4 px-5 py-2 text-sm sm:mt-5 sm:px-6 sm:py-2.5 sm:text-base"
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
        /* **She is placed so her POINTING FINGER lands on the first stop, and
           that placement is geometry, not taste.** Her raised arm is drawn at
           a fixed angle — about 32 degrees left of vertical, measured off the
           PNG's own alpha (fingertip at 24,118 of 463x539) plus the -3deg
           lean — so the only way to aim it is to move her until the first
           cloud sits on that line. Moving her UP or DOWN cannot do it: the
           cloud sits almost straight above her hand, and lifting her enough
           to swing the line onto it (+100px on a phone) leaves her floating
           off the bottom nav with her hand behind her own bubble. **The fix
           is horizontal, and it points opposite ways at the two ends** — on a
           phone her hand is already near the left edge and has to move RIGHT;
           on a desktop she is a right-edge figure and has to move LEFT, by
           roughly a third of the screen.

           **`sm` and up is a `calc`, not a breakpoint ladder, because the
           right offset depends on the viewport's ASPECT rather than its
           width.** The stop sits at 23.5% of the WIDTH (its lane) while she
           is sized off the HEIGHT (`h-[68%]`), so a portrait tablet and a
           landscape one of the same width need opposite values — 1024x1366
           wants her cropped by the right edge exactly as today, 1024x768
           wants her a quarter of the screen further left. Solving
           "fingertip x = lane x + tan(32deg) * (fingertip y - stop y)" for
           the offset gives `76.5% - 69.5svh`, one declaration that is correct
           at every ratio. **It carries `79.5%` rather than that `76.5%`** —
           a later direct request moved her a touch further left at every
           width; the aim has enough margin on a wide screen to absorb it and
           still land on the stop. Verified pointing at the stop at 768x1024,
           820x1180, 1024x1366, 1024x768, 1180x820, 1280x800, 1366x768,
           1440x900 and 1920x1080, with no width where she runs off the LEFT
           edge. `svh` and never `vh`/`dvh`, like every other viewport unit on
           the site.

           **The phone GESTURES at the stop rather than striking it, and that
           is the deliberate end of the trade.** `-right-[34%]` was the value
           that actually put the line on the cloud, and the same later request
           to move her left brought it back to `-28%`: her face returns to the
           screen and the line now passes ~14px outside the stop's left edge
           at 390 (38px at 430), which is the state Pinki's stick is already
           in on the numbers picker. The other end of the range is `-38%`,
           which aims dead centre and takes her second eye off the screen —
           on the one screen where she is wider than the viewport, the crop
           costs more than the last few degrees of aim.

           **Her feet stand ON the bottom nav's top edge, not under it**
           (`calc(4rem + env(safe-area-inset-bottom))` — the same reserve
           `body` keeps for that bar, safe area included). She ran past the
           bottom of the screen for a round and the nav sat across her legs.
           From `sm` the bar is gone, so she goes back to a hair below the
           edge. The extra `0.9rem` over the bar's own height is the LEAN's
           doing: a rotated element's bounding box is the axis-aligned box of
           the rotated shape, so at `-3°` she reaches about 10px lower than
           her own height says (measured) and would clip the bar's top edge
           without it.

           Sized by the VIEWPORT's height, never its width — a width share
           makes her a different figure on every screen. The phone number is
           capped by the first cloud rather than by taste: any taller and her
           head reaches the stop she is pointing at. */
        className="anim-pinki-lean-in pointer-events-none absolute bottom-[calc(4rem+0.9rem+env(safe-area-inset-bottom))] -right-[28%] h-[56%] rotate-[-3deg] sm:-bottom-[2%] sm:right-[calc(79.5%_-_69.5svh)] sm:h-[68%]"
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
