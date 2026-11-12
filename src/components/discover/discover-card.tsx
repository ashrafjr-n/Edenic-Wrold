import type { CSSProperties } from "react";
import Image, { type StaticImageData } from "next/image";
import type { LucideIcon } from "lucide-react";
import { Button3D, type ButtonTone } from "@/components/ui/button-3d";

interface DiscoverCardProps {
  art: StaticImageData;
  alt: string;
  /** Keeps the subject of a wide picture inside the tall crop a phone gives it. */
  artPosition: string;
  /** The two tokens the wash mixes, 55/45, and the clay button's colours. */
  wash: readonly [string, string];
  tone: ButtonTone;
  href: string;
  label: string;
  icon: LucideIcon;
  dir: "rtl" | "ltr";
  className?: string;
  style?: CSSProperties;
}

/**
 * A door on `/discover` — the Play page's card recipe (full-bleed picture, a
 * 55/45 wash of two existing tokens, one clay `Button3D` centred) without its
 * `16:9`: it takes whatever height its row gives it, so two of them fill the
 * page on a phone with no scroll and no gap.
 */
export function DiscoverCard({ art, alt, artPosition, wash, tone, href, label, icon: Icon, dir, className = "", style }: DiscoverCardProps) {
  return (
    <div className={`card relative min-h-48 flex-1 basis-0 overflow-hidden ${className}`} style={style}>
      <Image
        src={art}
        alt={alt}
        dir={dir}
        fill
        sizes="(min-width: 640px) 50vw, 100vw"
        className="object-cover"
        style={{ objectPosition: artPosition }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `linear-gradient(160deg, color-mix(in srgb, ${wash[0]} 55%, transparent) 0%, color-mix(in srgb, ${wash[1]} 45%, transparent) 100%)`,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <Button3D tone={tone} href={href} className="px-8 py-4 text-lg sm:px-10 sm:py-5 sm:text-xl">
          <Icon className="h-6 w-6" strokeWidth={2.25} />
          <span dir={dir}>{label}</span>
        </Button3D>
      </div>
    </div>
  );
}
