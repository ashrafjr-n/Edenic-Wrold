import type { CSSProperties } from "react";
import Image, { type StaticImageData } from "next/image";
import { Play } from "lucide-react";
import novaYoutube from "../../../public/assets/activity-page/youtube-CTA/nova-youtube.png";
import blooYoutube from "../../../public/assets/activity-page/youtube-CTA/bloo-youtube.png";
import pinkiYoutube from "../../../public/assets/activity-page/youtube-CTA/pinki-youtube.png";

type ButtonVars = CSSProperties & {
  "--btn-face"?: string;
  "--btn-edge"?: string;
  "--btn-text"?: string;
};

/** Same channel URL `YoutubeCta` used before it — see `data/socials.ts`. */
const YOUTUBE_HREF = "https://www.youtube.com/@EdenicWorld-kids";

/** Seconds each mascot owns before the next one takes its turn. Also the
    `.mascot-slide`/`.mascot-cta-pop` keyframes' unit: both run on one
    `SEGMENT * MASCOTS.length` loop, and staggering only `animation-delay`
    (0, 6, 12s) is what keeps the three in lockstep with no JS driving state —
    same technique `IntroIcons`' staggered delays use, for a looping cycle
    instead of a one-shot entrance. */
const SEGMENT_SECONDS = 6;

const MASCOTS: { id: string; name: string; image: StaticImageData }[] = [
  { id: "nova", name: "Nova", image: novaYoutube },
  { id: "bloo", name: "Bloo", image: blooYoutube },
  { id: "pinki", name: "Pinki", image: pinkiYoutube },
];

/**
 * The Activities page's YouTube CTA, now a small floating widget instead of
 * a full-width banner: Nova, Bloo and Pinki each take a turn sliding in from
 * the right in the bottom corner, holding a "Watch Now" chip that pops up
 * above them once they've settled, before both fade out for the next friend.
 *
 * Fixed to the viewport (not the page flow) so it stays reachable while
 * scrolling. The bottom offset clears `BottomNav` on a phone (`sm:hidden`,
 * fixed at `bottom-0`); from `sm` there's no bottom bar to clear.
 */
export function MascotYoutubeCta() {
  return (
    <div className="pointer-events-none fixed right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 sm:right-6 sm:bottom-6">
      <div className="relative h-28 w-28 sm:h-36 sm:w-36">
        {MASCOTS.map((mascot, index) => (
          <div key={mascot.id} className="mascot-slot absolute inset-0">
            <div
              className="mascot-avatar absolute inset-0"
              style={{ animationDelay: `${index * SEGMENT_SECONDS}s` }}
            >
              <Image
                src={mascot.image}
                alt={`${mascot.name} holding the YouTube play button`}
                fill
                sizes="144px"
                className="object-contain drop-shadow-[0_10px_18px_rgb(var(--shadow-hue)/35%)]"
              />
            </div>

            <a
              href={YOUTUBE_HREF}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`Watch ${mascot.name} on YouTube`}
              className="mascot-watch-btn btn3d pointer-events-auto absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-1.5 text-xs sm:-top-3 sm:px-4 sm:py-2 sm:text-sm"
              style={
                {
                  animationDelay: `${index * SEGMENT_SECONDS}s`,
                  "--btn-face": "#ff0033",
                  "--btn-edge": "#c40027",
                  "--btn-text": "#fff",
                } as ButtonVars
              }
            >
              <Play className="h-3 w-3 fill-current sm:h-4 sm:w-4" strokeWidth={2} />
              Watch Now
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
