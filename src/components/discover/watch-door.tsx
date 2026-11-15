import type { CSSProperties } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";

interface WatchDoorProps {
  /** The episodes' stills, newest first; the first leads, the next two fan out behind it. */
  stills: readonly StaticImageData[];
  alt: string;
  title: string;
  subtitle: string;
  badge: string;
  dir: "rtl" | "ltr";
  className?: string;
  style?: CSSProperties;
}

/**
 * Discover's Watch door: the whole card is the link. A cinema card —
 * the newest episode's still blurred and shaded over the whole card, and in the
 * middle the episodes' own stills, sharp and whole, fanned like a stack of
 * tickets with the newest on top under a frosted play button; a "New episodes"
 * chip above, the name and its line below. On hover the fan opens a little and
 * the play button swells; the card itself never moves.
 */
export function WatchDoor({ stills, alt, title, subtitle, badge, dir, className = "", style }: WatchDoorProps) {
  const [lead, ...behind] = stills;
  return (
    <Link href="/watch" className={`discover-door discover-door--watch group relative flex min-h-48 flex-[3] basis-0 flex-col overflow-hidden ${className}`} style={style}>
      <Image src={lead} alt="" fill sizes="(min-width: 640px) 25vw, 50vw" className="discover-backdrop object-cover" />
      <span aria-hidden className="discover-shade absolute inset-0" />
      <span aria-hidden className="discover-grain absolute inset-0" />

      <span className="relative z-10 flex justify-center px-4 pt-4 sm:px-6 sm:pt-6">
        <span dir={dir} className="clay discover-chip discover-chip--new"
          style={{ "--clay-edge": "var(--accent-dark)" } as CSSProperties}>
          {badge}
        </span>
      </span>

      <span className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-6 py-3 [container-type:size]">
        <span className="discover-fan relative aspect-video w-[min(86cqw,152cqh,30rem)]">
          {behind.slice(0, 2).map((still, i) => (
            <span key={still.src} aria-hidden className={`discover-still discover-still--${i + 1} absolute inset-0`}>
              <Image src={still} alt="" fill sizes="(min-width: 640px) 24rem, 80vw" className="object-cover" />
            </span>
          ))}
          <span className="discover-still absolute inset-0">
            <Image src={lead} alt={alt} fill preload sizes="(min-width: 640px) 30rem, 86vw" className="object-cover" />
          </span>
          <span aria-hidden className="discover-play absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full sm:h-20 sm:w-20">
            <Play className="ms-1 h-7 w-7 fill-current sm:h-9 sm:w-9" strokeWidth={2} />
          </span>
        </span>
      </span>

      <span className="relative z-10 flex flex-col items-start gap-1 px-5 pb-5 sm:px-7 sm:pb-7">
        <span dir={dir} className="text-4xl font-bold text-white sm:text-5xl">
          {title}
        </span>
        <span dir={dir} className="text-base font-semibold text-white/85 sm:text-lg">
          {subtitle}
        </span>
      </span>
    </Link>
  );
}
