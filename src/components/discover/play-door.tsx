import type { CSSProperties } from "react";
import Image from "next/image";
import { Gamepad2 } from "lucide-react";
import { Cloud } from "@/components/ui/cloud";
import playCloud from "../../../public/assets/discover/play-cloud.png";

interface PlayDoorProps {
  title: string;
  subtitle: string;
  soon: string;
  dir: "rtl" | "ltr";
  className?: string;
  style?: CSSProperties;
}

/**
 * Discover's Play door while Play is being built: NOT a link — a sky
 * card with the old Play card's own felt cloud (`play-cloud.png`, once
 * `trail-cloud.png`) floating in the middle, small clay clouds drifting at the
 * sides, the name over it and a "Coming soon" chip. Three rows — the words, the
 * cloud taking all the height that is left, a little air — so it reads on a short
 * phone card and a tall desktop one alike. When Play opens, this becomes a `<Link>`.
 */
export function PlayDoor({ title, subtitle, soon, dir, className = "", style }: PlayDoorProps) {
  return (
    <div aria-disabled className={`discover-door discover-door--play relative flex min-h-48 flex-1 basis-0 flex-col overflow-hidden ${className}`} style={style}>
      <span aria-hidden className="discover-grain absolute inset-0" />
      <Cloud size="sm" variant={2} className="discover-drift absolute left-[5%] top-[46%] opacity-90" style={{ "--cloud-w": "4.5rem" } as CSSProperties} />
      <Cloud size="sm" variant={3} className="discover-drift absolute right-[6%] top-[58%] opacity-80" style={{ "--cloud-w": "3.6rem", animationDelay: "-3s" } as CSSProperties} />
      <Cloud size="sm" className="discover-drift absolute right-[16%] top-[36%] opacity-70" style={{ "--cloud-w": "2.8rem", animationDelay: "-6s" } as CSSProperties} />

      <div className="relative z-10 flex flex-col items-center px-6 pt-4 text-center sm:pt-6">
        <span dir={dir} className="discover-chip">
          {soon}
        </span>
        <h2 dir={dir} className="mt-3 flex items-center gap-2.5 text-4xl font-bold text-white drop-shadow-[0_3px_0_rgb(30_80_150/35%)] sm:mt-4 sm:text-5xl">
          <Gamepad2 className="h-9 w-9 sm:h-11 sm:w-11" strokeWidth={2.25} />
          {title}
        </h2>
        <p dir={dir} className="mt-1.5 text-base font-semibold text-white/90 sm:text-lg">
          {subtitle}
        </p>
      </div>

      <div className="discover-cloud relative mx-auto my-3 min-h-0 w-[88%] flex-1 sm:my-6">
        <Image src={playCloud} alt="" fill sizes="(min-width: 640px) 40vw, 90vw" className="object-contain" />
      </div>
    </div>
  );
}
