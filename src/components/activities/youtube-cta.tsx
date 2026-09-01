import type { CSSProperties } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

type ButtonVars = CSSProperties & {
  "--btn-face"?: string;
  "--btn-edge"?: string;
  "--btn-text"?: string;
};

/** The three friends each holding a play button, on a near-white background
    that blends straight into `.card` — no crop, no overlay needed. */
const IMAGE_SRC = "/assets/activity-page/youtube-CTA/activity-youtube-CTA.png";

/** Same channel URL as the footer/home social row (`data/socials.ts`) —
    plain link rather than a shared lookup, matching how other one-off content
    (the hero's own image/copy) is hardcoded directly in its component. */
const YOUTUBE_HREF = "https://www.youtube.com/@EdenicWorld-kids";

/** The activities page's opening CTA: a big card pointing at our YouTube
    channel. External link, so a plain `<a>` styled with the same `.btn3d`
    clay recipe `Button3D` uses internally — `Button3D` only renders an
    internal `next/link`, with no `target`/`rel`, so this is hand-rolled the
    same way `SocialLinks` hand-rolls its own external chips. */
export function YoutubeCta({ className = "" }: { className?: string }) {
  return (
    <div className={`card relative overflow-hidden p-6 sm:p-10 ${className}`}>
      <div className="relative mx-auto aspect-[3/2] w-full max-w-2xl">
        <Image
          src={IMAGE_SRC}
          alt="Pinki, Nova and Bloo each holding a red play button"
          fill
          sizes="(min-width: 640px) 42rem, 100vw"
          priority
          className="object-contain"
        />
      </div>

      <div className="mt-6 flex justify-center sm:mt-8">
        <a
          href={YOUTUBE_HREF}
          target="_blank"
          rel="noreferrer noopener"
          className="btn3d px-8 py-4 text-lg sm:px-10 sm:text-xl"
          style={
            {
              "--btn-face": "#ff0033",
              "--btn-edge": "#c40027",
              "--btn-text": "#fff",
            } as ButtonVars
          }
        >
          <Play className="h-6 w-6 fill-current" strokeWidth={2} />
          Watch Now
        </a>
      </div>
    </div>
  );
}
