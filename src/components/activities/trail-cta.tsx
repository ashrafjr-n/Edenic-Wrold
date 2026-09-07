"use client";

import type { CSSProperties, MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Footprints } from "lucide-react";
import type { Dictionary } from "@/lib/dictionaries/en";
import { dirFor } from "@/lib/format-dict";
import { TRAIL_COVER_MS, usePageTransition } from "@/store/page-transition";
import trailCloud from "../../../public/assets/activity-page/trial/trial-cloude.png";

type ClayVars = CSSProperties & { "--clay-edge"?: string };

/**
 * The Play page's lead card: the way into the Edenic Trail.
 *
 * **The WHOLE card is the link, not just the button inside it.** It renders
 * as one `<Link>` rather than an `<article>` with a `Button3D` inside — an
 * `<a>` cannot contain another interactive descendant (another link, or a
 * button), so the CTA pill is a plain `<span>` carrying the exact
 * classes/CSS variables `Button3D` would have set, not the component itself.
 * Keep it that way if this is ever touched again: swapping the span back for
 * a real `Button3D` nests two links and is invalid HTML, not just a style
 * regression.
 *
 * **Composition: text, then the button, then a big cloud bleeding off the
 * card's own edges.** The button sits in normal flow, comfortably clear of
 * the cloud below it — an earlier round centred the CTA ON TOP of the cloud
 * (absolute over a small fixed-height scene), which read well at that size
 * but couldn't scale: making the cloud bigger meant the button either grew
 * with it (turning the pill into a giant chip) or stayed put and buried
 * itself in the middle of the artwork. Direct request: make the cloud big
 * and let the CARD grow to fit it, rather than shrinking the cloud to fit a
 * fixed button position.
 *
 * **An invisible spacer (`aria-hidden`, zero content) reserves the vertical
 * gap between the button and the card's bottom edge** — the cloud itself is
 * absolutely positioned and plays no part in the card's own height, so
 * without this the card would size itself to the text and button alone and
 * the (much taller) cloud would ride up over both. The spacer's height is
 * tuned to roughly the cloud's own rendered height at each breakpoint —
 * **resize the cloud's `w-*` classes and shrink this in step**, or the card
 * grows taller than the (now smaller) cloud actually needs.
 *
 * **The cloud is deliberately BIGGER than the card is tall enough to show
 * whole, and that's the point, not a bug.** It's centred and anchored to the
 * card's bottom edge, wider than the padded content column, and allowed to
 * bleed past the card's own left/right/bottom edges — `overflow-hidden` on
 * the card is what crops it. Staying big matters more than staying whole, on
 * direct request.
 *
 * **The art is a static import**, not a `/public` path: a static import is
 * content-hashed into its URL, so repainting the file on disk actually busts
 * the cache — the same trap `ui/logo.tsx` and the two game cards document.
 * No `.panel-art` fade here — the PNG already has a transparent ground, so
 * the card's own fill shows through it with no seam to hide.
 *
 * **The fill is `--color-bloo-dark`, a CHARACTER token, deliberately not
 * `--brand`.** `--brand` and `--accent` are both raised lighter in dark mode
 * for legibility as text elsewhere, and a lighter face is exactly where white
 * type on a panel washes out (the trap the header's own dark-mode rule
 * documents). Character tokens don't move with the theme, so this panel is
 * the same blue and the same contrast in both.
 *
 * **The CTA carries a lucide `Footprints`** — a step back from `Compass`,
 * which read as generic rather than "trail". Footprints are the literal
 * thing this page is named after (a path you walk one step at a time) and
 * nothing else on the site uses them. Its text is `--color-ink-fixed`, not
 * `--color-ink`: that face is pinned pale in both themes while `--color-ink`
 * flips light in dark mode, which would leave pale on pale.
 *
 * **`"use client"` for exactly one reason: the cloud-veil transition.** A
 * plain left-click is intercepted (`preventDefault` + `router.push` after
 * the veil has had time to cover the screen — see
 * `PageTransitionOverlay`/`usePageTransition`); a modified click (new tab,
 * middle click, etc.) is left alone so the browser's own handling still
 * applies. Still renders as a real `<Link>`, not a `<button>` — it keeps
 * its `href`, its prefetch, and works with JS disabled (a disabled click
 * handler just falls through to the normal navigation).
 */
export function TrailCta({
  dict,
  className = "",
  style,
}: {
  dict: Dictionary;
  className?: string;
  style?: CSSProperties;
}) {
  const dir = dirFor(dict.locale);
  const router = useRouter();
  const startTransition = usePageTransition((state) => state.start);
  const transitionActive = usePageTransition((state) => state.active);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      transitionActive
    ) {
      return;
    }
    event.preventDefault();
    startTransition();
    window.setTimeout(() => router.push("/trail"), TRAIL_COVER_MS);
  }

  return (
    <Link
      href="/trail"
      onClick={handleClick}
      className={`clay group relative flex flex-col items-center overflow-hidden rounded-[2rem] p-8 text-center sm:p-10 lg:p-12 ${className}`}
      style={
        {
          backgroundColor: "var(--color-bloo-dark)",
          "--clay-edge": "var(--brand-dark)",
          ...style,
        } as ClayVars
      }
    >
      {/* Both lines carry `dir`: the title is a Latin brand name that must not
          be reordered inside an Arabic or Kurdish sentence, and the description
          ends on a bidi-neutral full stop, which takes the paragraph's LTR
          direction and jumps to the far right without one — see `dirFor`. */}
      <h2
        dir={dir}
        className="text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl"
      >
        {dict.trail.title}
      </h2>

      <p
        dir={dir}
        className="mt-3 max-w-md text-base leading-relaxed text-white/85"
      >
        {dict.trail.description}
      </p>

      {/* White clay on a saturated panel: a coloured pill disappears on one.
          This is `Button3D`'s own `calm` + `.btn3d--clay-white` output,
          hand-copied onto a `<span>` — see the file doc comment for why it
          can't be the component itself here. In normal flow, well clear of
          the cloud bled in below it. */}
      <span
        className="btn3d btn3d--calm btn3d--clay-white relative z-10 mt-6 whitespace-nowrap px-6 py-3 text-base sm:mt-8 sm:px-7 sm:py-3.5 sm:text-lg"
        style={
          {
            "--btn-face": "var(--surface)",
            "--btn-edge": "var(--surface)",
            "--btn-text": "var(--color-ink-fixed)",
          } as CSSProperties
        }
      >
        <Footprints className="h-5 w-5" strokeWidth={2.25} />
        <span dir={dir}>{dict.trail.cta}</span>
      </span>

      {/* Pure spacer — reserves the gap under the button so the (bigger,
          absolutely positioned) cloud below never has to sit under it. */}
      <div aria-hidden className="mt-6 h-24 w-full sm:mt-8 sm:h-32 lg:h-40" />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[-10%] bottom-[-6%] flex justify-center sm:inset-x-[-6%] lg:inset-x-[-4%]"
      >
        <Image
          src={trailCloud}
          /* Decorative — the panel's own heading names it. */
          alt=""
          className="h-auto w-[22rem] select-none transition-transform duration-500 ease-out group-hover:scale-110 sm:w-[28rem] lg:w-[33rem]"
        />
      </div>
    </Link>
  );
}
