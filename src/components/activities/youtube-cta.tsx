import type { CSSProperties } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
/* A real photograph now, not a cut-out — it arrived with its own soft pastel
   background (sky, clouds, ground), so a `.card` frame around it reads as an
   ordinary photo card instead of a box around nothing. This replaced the
   RGBA cut-out (`activity-youtube-CTA.png`) the earlier version stood on the
   page with no container at all — that convention is retired along with it,
   see the Activities conventions.

   A STATIC import, not a `/public` path: a static import is content-hashed
   into its URL, so replacing the file on disk changes the URL and every cache
   misses (see `ui/logo.tsx`). It also carries the file's real pixel size. */
import ctaArt from "../../../public/assets/activity-page/youtube-CTA/youtube.jpg";

type ButtonVars = CSSProperties & {
  "--btn-face"?: string;
  "--btn-edge"?: string;
  "--btn-text"?: string;
};

/** Same channel URL as the footer/home social row (`data/socials.ts`) —
    plain link rather than a shared lookup, matching how other one-off content
    (the hero's own image/copy) is hardcoded directly in its component. */
const YOUTUBE_HREF = "https://www.youtube.com/@EdenicWorld-kids";

/**
 * The activities page's opening CTA: a short, wide banner card of the three
 * friends, with "Watch Now" sitting over the picture on the right.
 *
 * **A full-bleed `.card` now**, on direct request, once the art itself
 * stopped being a cut-out: normal card width, a deliberately SHORT height
 * (`aspect-[5/2]`) rather than the tall `3:2` the cut-out used to run at —
 * "make the card narrow along its height." The photo is cropped top and
 * bottom to fit that band (`object-cover` + a tuned `object-position`), never
 * squeezed — the three friends and their feet on the ground stay fully in
 * frame; a plain centred crop that seemed reasonable on paper cut them off at
 * the ankles when actually checked in the browser (a 3:1 band did that; 5:2
 * is the shortest ratio that still clears their feet).
 *
 * The button moved from ABOVE the picture to OVER it, on the right — smaller
 * than it was (this used to be the page's biggest single CTA) because the
 * picture is doing more of the selling now. It needs no scrim behind it: the
 * photo's right side is pale sky and a light shape, plenty of contrast for a
 * solid red clay button.
 *
 * External link, so a plain `<a>` styled with the same `.btn3d` clay recipe
 * `Button3D` uses internally — `Button3D` only renders an internal
 * `next/link`, with no `target`/`rel`, so this is hand-rolled the same way
 * `SocialLinks` hand-rolls its own external chips.
 */
export function YoutubeCta({ className = "" }: { className?: string }) {
  return (
    <div
      className={`card relative aspect-[5/2] overflow-hidden ${className}`}
    >
      <Image
        src={ctaArt}
        alt="Pinki, Nova and Bloo dancing together"
        fill
        sizes="(min-width: 1024px) 80rem, 100vw"
        preload
        className="object-cover object-[50%_42%]"
      />

      <div className="absolute inset-0 flex items-center justify-end pr-4 sm:pr-8">
        <a
          href={YOUTUBE_HREF}
          target="_blank"
          rel="noreferrer noopener"
          className="btn3d px-4 py-2 text-sm sm:px-6 sm:py-2.5 sm:text-base"
          style={
            {
              "--btn-face": "#ff0033",
              "--btn-edge": "#c40027",
              "--btn-text": "#fff",
            } as ButtonVars
          }
        >
          <Play className="h-4 w-4 fill-current sm:h-5 sm:w-5" strokeWidth={2} />
          Watch Now
        </a>
      </div>
    </div>
  );
}
