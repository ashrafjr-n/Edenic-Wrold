import type { CSSProperties } from "react";
import { socialLinks } from "@/data/socials";

type BrandVars = CSSProperties & { "--social-brand"?: string };

/** Round white chips, one per platform. At rest they're the same white-card
    material as everything else on the ground; the platform's own color only
    appears on hover, so a row of them never competes with the characters. */
export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap items-center gap-3 ${className}`}>
      {socialLinks.map(({ label, href, Icon, brand }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={label}
            title={label}
            className="card group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full text-[var(--color-ink)] transition-[color,translate] duration-200 hover:-translate-y-0.5 hover:text-white"
            style={{ "--social-brand": brand } as BrandVars}
          >
            <span
              aria-hidden
              className="absolute inset-0 bg-[var(--social-brand)] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            />
            <Icon className="relative h-5 w-5" size={20} />
          </a>
        </li>
      ))}
    </ul>
  );
}
