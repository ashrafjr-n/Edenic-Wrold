import type { CSSProperties } from "react";
import Image from "next/image";
import { Gamepad2, Hourglass } from "lucide-react";
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

type ClayVars = CSSProperties & { "--clay-edge"?: string };

/**
 * Discover's Play door while Play is being built: NOT a link. The home
 * page's path panels' recipe (`PathsSection`): a `.clay` panel in one
 * colour (Bloo's sky), the felt cloud (`play-cloud.png`) bedded into its
 * right side with `.panel-art`, the name and its line at the top left —
 * and where those panels have their white button, a "Coming soon" sign
 * (`.discover-soon`: white clay, an hourglass in a sky-blue dot). Nothing
 * on it moves. When Play opens, the sign becomes the panel's button.
 */
export function PlayDoor({ title, subtitle, soon, dir, className = "", style }: PlayDoorProps) {
  return (
    <div
      aria-disabled
      className={`clay relative isolate flex min-h-48 flex-[2] basis-0 flex-col items-start overflow-hidden rounded-[1.75rem] p-6 sm:p-8 lg:p-10 ${className}`}
      style={{ backgroundColor: "#5aaee8", "--clay-edge": "#2f78b8", ...style } as ClayVars}
    >
      {/* A phone's short card: bedded in at the foot, as on the home panels.
          A tall wide-screen card: big, in the middle of the right side. */}
      <div className="panel-art pointer-events-none absolute inset-y-0 right-0 -z-10 w-[62%] sm:bottom-[12%] sm:top-[20%] sm:w-[96%]">
        <Image src={playCloud} alt="" fill sizes="(min-width: 640px) 36vw, 62vw" className="object-contain object-bottom sm:object-right" />
      </div>
      <Cloud size="sm" variant={2} className="absolute right-[8%] top-[12%] -z-10 opacity-90" style={{ "--cloud-w": "3.6rem" } as CSSProperties} />
      <Cloud size="sm" variant={3} className="absolute right-[30%] top-[24%] -z-10 opacity-75" style={{ "--cloud-w": "2.6rem" } as CSSProperties} />

      <h2 dir={dir} className="flex items-center gap-2.5 text-3xl font-bold text-white sm:text-4xl">
        <Gamepad2 className="h-8 w-8 sm:h-9 sm:w-9" strokeWidth={2.25} />
        {title}
      </h2>
      <p dir={dir} className="mt-2 max-w-[17rem] text-base font-semibold leading-relaxed text-white/90 sm:text-lg">
        {subtitle}
      </p>

      <span dir={dir} className="discover-soon mt-auto">
        <span aria-hidden className="discover-soon-icon">
          <Hourglass className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
        </span>
        {soon}
      </span>
    </div>
  );
}
