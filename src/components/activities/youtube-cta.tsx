import type { CSSProperties } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
/* The three friends each holding a play button, cut out of its background —
   the card that used to frame it is gone, so the art has to sit on the page's
   own ground with nothing behind it. The soft contact shadows survived the
   cut as translucent grey, which is what keeps the friends standing on the
   page rather than floating over it.

   A STATIC import, not a `/public` path: a static import is content-hashed
   into its URL, so replacing the file on disk changes the URL and every cache
   misses (see `ui/logo.tsx`). It also carries the file's real pixel size, so
   the picture keeps its own proportions with no `aspect-*` box to drift out
   of step with it. */
import ctaArt from "../../../public/assets/activity-page/youtube-CTA/activity-youtube-CTA.png";

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
 * The activities page's opening CTA: one button pointing at our YouTube
 * channel, and the three friends under it.
 *
 * **No `.card`, and that is deliberate** — this is the one place on the site
 * where rendered art stands on the page with no container at all, because a
 * frame around a cut-out picture is a box around nothing. It is also why the
 * art is trimmed to its own content: the empty margin the render came with
 * was invisible inside a card and would be dead height without one.
 *
 * External link, so a plain `<a>` styled with the same `.btn3d` clay recipe
 * `Button3D` uses internally — `Button3D` only renders an internal
 * `next/link`, with no `target`/`rel`, so this is hand-rolled the same way
 * `SocialLinks` hand-rolls its own external chips.
 */
export function YoutubeCta({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Above the picture, not under it — the page opens on the thing to
          tap, and the friends holding their play buttons then read as the
          picture explaining it rather than as art with a caption. */}
      <a
        href={YOUTUBE_HREF}
        target="_blank"
        rel="noreferrer noopener"
        className="btn3d mb-3 px-7 py-3.5 text-base sm:mb-4 sm:px-8 sm:text-lg"
        style={
          {
            "--btn-face": "#ff0033",
            "--btn-edge": "#c40027",
            "--btn-text": "#fff",
          } as ButtonVars
        }
      >
        <Play className="h-5 w-5 fill-current" strokeWidth={2} />
        Watch Now
      </a>

      <Image
        src={ctaArt}
        alt="Pinki, Nova and Bloo each holding a red play button"
        sizes="(min-width: 640px) 34rem, 92vw"
        preload
        className="h-auto w-full max-w-[22rem] sm:max-w-[34rem]"
      />
    </div>
  );
}
