import type { CSSProperties } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import pinki from "../../../public/assets/friends/pinki.png";

interface WatchDoorProps {
  /** The newest episode's still — on the TV's screen. */
  still: StaticImageData;
  alt: string;
  title: string;
  subtitle: string;
  badge: string;
  go: string;
  dir: "rtl" | "ltr";
  className?: string;
  style?: CSSProperties;
}

type ClayVars = CSSProperties & { "--clay-edge": string };

/**
 * Discover's Watch door (2026-11-19): the whole card is the link to `/watch`.
 * A pink clay panel (grain from `.clay`) with the name and its line at the
 * top, a white clay TV in the middle — the newest episode on its screen
 * under a frosted play button, "New episodes" stuck on its corner, Pinki
 * standing at its side — and the white "Watch now" sign at the foot. The
 * TV is sized by the middle row (`container-type: size`), so it fills a
 * tall desktop card and fits a short phone one. On hover the TV leans and
 * the play button swells; the card and Pinki never move.
 */
export function WatchDoor({ still, alt, title, subtitle, badge, go, dir, className = "", style }: WatchDoorProps) {
  return (
    <Link
      href="/watch"
      className={`discover-door clay group relative isolate flex min-h-64 flex-1 basis-0 flex-col overflow-hidden rounded-[1.75rem] p-5 lg:flex-[3] sm:p-8 lg:p-10 ${className}`}
      style={{ backgroundColor: "var(--accent)", "--clay-edge": "var(--accent-dark)", ...style } as ClayVars}
    >
      <span dir={dir} className="text-3xl font-bold text-white sm:text-5xl">
        {title}
      </span>
      <span dir={dir} className="mt-1 text-base font-semibold text-white/90 sm:mt-2 sm:text-lg">
        {subtitle}
      </span>

      <span className="discover-stage">
        <span className="discover-tv">
          <span aria-hidden className="discover-tv-antenna">
            <span />
            <span />
          </span>
          <span className="discover-tv-screen">
            <Image src={still} alt={alt} fill preload placeholder="blur" sizes="(min-width: 640px) 34rem, 80vw" className="object-cover" />
            <span aria-hidden className="discover-play">
              <Play className="ms-1 h-[42%] w-[42%] fill-current" strokeWidth={2} />
            </span>
          </span>
          <span dir={dir} className="discover-sticker">
            {badge}
          </span>
          <Image src={pinki} alt="" sizes="(min-width: 640px) 12rem, 6rem" className="discover-friend discover-friend--pinki" />
        </span>
      </span>

      <span dir={dir} className="discover-soon">
        <span aria-hidden className="discover-soon-icon" style={{ "--dot": "var(--accent)" } as CSSProperties}>
          <Play className="ms-0.5 h-4 w-4 fill-current sm:h-5 sm:w-5" strokeWidth={2.5} />
        </span>
        {go}
      </span>
    </Link>
  );
}
