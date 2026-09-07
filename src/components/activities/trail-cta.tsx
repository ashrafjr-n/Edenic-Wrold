import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Compass } from "lucide-react";
import type { Dictionary } from "@/lib/dictionaries/en";
import { dirFor } from "@/lib/format-dict";
import trailCloud from "../../../public/assets/activity-page/trial/trial-cloude.png";

type ClayVars = CSSProperties & { "--clay-edge"?: string };

/**
 * The Play page's lead card: the way into the Edenic Trail.
 *
 * **The WHOLE card is the link now, not just the button inside it.** It
 * renders as one `<Link>` rather than an `<article>` with a `Button3D` inside
 * — an `<a>` cannot contain another interactive descendant (another link, or
 * a button), so the CTA pill below is a plain `<span>` carrying the exact
 * classes/CSS variables `Button3D` would have set, not the component itself.
 * Keep it that way if this is ever touched again: swapping the span back for
 * a real `Button3D` nests two links and is invalid HTML, not just a style
 * regression.
 *
 * **Composition: text on top, then the cloud with the CTA laid over it.**
 * Heading and description are centred at the top of the panel; below them a
 * fixed-height scene holds the cloud PNG anchored to the scene's bottom edge
 * (`object-bottom`) with the CTA centred over the scene as a whole — since
 * the cloud doesn't fill the scene's full height, the centre point lands in
 * the cloud's own upper body, which is what reads as the button sitting on
 * the cloud rather than beside it. **`whitespace-nowrap` on the pill is
 * load-bearing on a phone** — the scene box is narrower than the CTA's own
 * text there, and a wrapped two-line pill grows tall enough to sit almost
 * entirely above the cloud instead of on it. The pill is centred by absolute
 * `inset-0` + `m-auto`, which lets it overflow the scene box's own width
 * without being reflowed or clipped (nothing here sets `overflow-hidden`
 * except the outer card, which is far wider).
 *
 * **The art is a static import**, not a `/public` path: a static import is
 * content-hashed into its URL, so repainting the file on disk actually busts
 * the cache — the same trap `ui/logo.tsx` and the two game cards document.
 * No `.panel-art` fade here any more — the PNG already has a transparent
 * ground, so the card's own fill shows through it with no seam to hide.
 *
 * **The fill is `--color-bloo-dark`, a CHARACTER token, deliberately not
 * `--brand`.** `--brand` and `--accent` are both raised lighter in dark mode
 * for legibility as text elsewhere, and a lighter face is exactly where white
 * type on a panel washes out (the trap the header's own dark-mode rule
 * documents). Character tokens don't move with the theme, so this panel is
 * the same blue and the same contrast in both.
 *
 * **The CTA carries a lucide `Compass`**, not the `Footprints` the numbers
 * journey and this card's own earlier version used — chosen for the same
 * "adventure" idea without repeating an icon another part of the site already
 * owns. Its text is `--color-ink-fixed`, not `--color-ink`: that face is
 * pinned pale in both themes while `--color-ink` flips light in dark mode,
 * which would leave pale on pale.
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

  return (
    <Link
      href="/trail"
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

      {/* The scene: cloud anchored to the bottom, CTA centred over the whole
          box. Fixed height (not the image's own aspect ratio) is what lets
          the CTA's centre point land inside the cloud's upper body instead
          of in the empty space object-contain leaves above a shorter image. */}
      <div className="relative mt-6 h-32 w-56 sm:mt-8 sm:h-40 sm:w-72 lg:h-44 lg:w-80">
        <Image
          src={trailCloud}
          /* Decorative — the panel's own heading names it. */
          alt=""
          fill
          sizes="(min-width: 1024px) 20rem, (min-width: 640px) 18rem, 14rem"
          className="object-contain object-bottom transition-transform duration-500 ease-out group-hover:scale-110"
        />

        {/* White clay on a saturated panel: a coloured pill disappears on
            one. This is `Button3D`'s own `calm` + `.btn3d--clay-white`
            output, hand-copied onto a `<span>` — see the file doc comment
            for why it can't be the component itself here. */}
        <span
          className="btn3d btn3d--calm btn3d--clay-white absolute inset-0 m-auto h-fit w-fit whitespace-nowrap px-6 py-3 text-base sm:px-7 sm:py-3.5 sm:text-lg"
          style={
            {
              "--btn-face": "var(--surface)",
              "--btn-edge": "var(--surface)",
              "--btn-text": "var(--color-ink-fixed)",
            } as CSSProperties
          }
        >
          <Compass className="h-5 w-5" strokeWidth={2.25} />
          <span dir={dir}>{dict.trail.cta}</span>
        </span>
      </div>
    </Link>
  );
}
