import type { CSSProperties } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { Cloud } from "@/components/ui/cloud";
import bloo from "../../../public/assets/friends/bloo.png";

interface PlayDoorProps {
  /** The games' own card pictures, in `/play`'s order; the middle one leads. */
  games: readonly StaticImageData[];
  title: string;
  subtitle: string;
  /** The sign at the foot ("Let's play"). */
  go: string;
  dir: "rtl" | "ltr";
  className?: string;
  style?: CSSProperties;
}

type ClayVars = CSSProperties & { "--clay-edge": string };

/**
 * Discover's Play door (2026-11-19): the whole card is the link to `/play`.
 * Watch's recipe in Bloo's sky: a sky-blue clay panel, the name and its line
 * at the top, the three games' own pictures fanned in the middle like a hand
 * of white-rimmed cards (the one in the middle on top), Bloo standing by
 * them, two still clay clouds, and the white "Let's play" sign at the foot.
 * On hover the fan opens a little; the card and Bloo never move.
 */
export function PlayDoor({ games, title, subtitle, go, dir, className = "", style }: PlayDoorProps) {
  const [left, middle, right] = games;
  return (
    <Link
      href="/play"
      className={`discover-door clay group relative isolate flex min-h-64 flex-1 basis-0 flex-col items-start overflow-hidden rounded-[1.75rem] p-5 lg:flex-[2] sm:p-8 lg:p-10 ${className}`}
      style={{ backgroundColor: "#5aaee8", "--clay-edge": "#2f78b8", ...style } as ClayVars}
    >
      <Cloud size="sm" variant={2} className="absolute right-[8%] top-[9%] -z-10 opacity-90" style={{ "--cloud-w": "3.6rem" } as CSSProperties} />
      <Cloud size="sm" variant={3} className="absolute right-[30%] top-[19%] -z-10 opacity-75 max-sm:hidden" style={{ "--cloud-w": "2.6rem" } as CSSProperties} />

      <span dir={dir} className="text-3xl font-bold text-white sm:text-5xl">
        {title}
      </span>
      <span dir={dir} className="mt-1 text-base font-semibold text-white/90 sm:mt-2 sm:text-lg">
        {subtitle}
      </span>

      <span className="discover-stage">
        <span aria-hidden className="discover-hand">
          {[left, right, middle].map((art, i) => (
            <span key={art.src} className={`discover-hand-card discover-hand-card--${["left", "right", "middle"][i]}`}>
              <Image src={art} alt="" fill placeholder="blur" sizes="(min-width: 640px) 18rem, 50vw" className="object-cover" />
            </span>
          ))}
          <Image src={bloo} alt="" sizes="(min-width: 640px) 12rem, 6rem" className="discover-friend discover-friend--bloo" />
        </span>
      </span>

      <span dir={dir} className="discover-soon">
        <span aria-hidden className="discover-soon-icon">
          <Play className="ms-0.5 h-4 w-4 fill-current sm:h-5 sm:w-5" strokeWidth={2.5} />
        </span>
        {go}
      </span>
    </Link>
  );
}
