import type { CSSProperties } from "react";
import { socialLinks } from "@/data/socials";

type BrandVars = CSSProperties & {
  "--social-brand"?: string;
  "--social-ink"?: string;
};

/** Round chips, one per platform, each in its own brand color with the site's
    grain over it (`.social-chip`). They used to be white at rest and only took
    the color on hover — reversed on request, so the row is colored now and
    hover just darkens the fill.

    The chips don't move on hover — the darkening is the whole cue, matching
    every other button on the site. */
export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap items-center gap-3 ${className}`}>
      {socialLinks.map(({ label, href, Icon, brand, ink }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={label}
            title={label}
            className="card card-pill social-chip flex h-12 w-12 items-center justify-center"
            style={
              { "--social-brand": brand, "--social-ink": ink ?? "#fff" } as BrandVars
            }
          >
            {/* The icon reads `currentColor`, which `.social-chip` sets from
                `--social-ink`. */}
            <Icon className="h-5 w-5" size={20} />
          </a>
        </li>
      ))}
    </ul>
  );
}
