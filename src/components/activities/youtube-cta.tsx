import type { CSSProperties } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
/* The three friends each holding a play button, on a near-white background
   that blends straight into `.card` — no crop, no overlay needed.

   A STATIC import, not a `/public` path: a static import is content-hashed
   into its URL, so replacing the file on disk changes the URL and every cache
   misses (see `ui/logo.tsx`). */
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

/** The activities page's opening CTA: a card pointing at our YouTube
    channel. Deliberately compact — the picture is capped well below the
    card's own width and the padding is tight, so it reads as an invitation
    rather than the page's centrepiece. External link, so a plain `<a>` styled with the same `.btn3d`
    clay recipe `Button3D` uses internally — `Button3D` only renders an
    internal `next/link`, with no `target`/`rel`, so this is hand-rolled the
    same way `SocialLinks` hand-rolls its own external chips. */
export function YoutubeCta({ className = "" }: { className?: string }) {
  return (
    <div className={`card relative overflow-hidden p-4 sm:p-6 ${className}`}>
      <div className="relative mx-auto aspect-[3/2] w-full max-w-sm sm:max-w-md">
        <Image
          src={ctaArt}
          alt="Pinki, Nova and Bloo each holding a red play button"
          fill
          sizes="(min-width: 640px) 28rem, 100vw"
          priority
          className="object-contain"
        />
      </div>

      <div className="mt-4 flex justify-center sm:mt-5">
        <a
          href={YOUTUBE_HREF}
          target="_blank"
          rel="noreferrer noopener"
          className="btn3d px-7 py-3.5 text-base sm:px-8 sm:text-lg"
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
      </div>
    </div>
  );
}
