"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav } from "@/data/nav";

/** The only reason this is a Client Component is `usePathname` for the active
    pill. It's split out of `Header` so the header itself — logo, chrome, CTA —
    stays on the server. */
export function MainNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="card card-pill flex items-center gap-1 p-1.5"
    >
      {mainNav.map(({ label, href }) => {
        if (!href) {
          return (
            <span
              key={label}
              aria-disabled="true"
              className="flex cursor-default items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-[var(--color-locked-text)] sm:px-5"
            >
              {label}
              <span className="rounded-full bg-[var(--color-locked)] px-1.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide">
                Soon
              </span>
            </span>
          );
        }

        /* "/" would otherwise prefix-match every route on the site. */
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);

        return (
          <Link
            key={label}
            href={href}
            aria-current={active ? "page" : undefined}
            /* Active is a purple clay pill; the rest are bare text on the white
               chip, so exactly one thing in the nav carries color. */
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors sm:px-5 ${
              active
                ? "clay bg-[var(--brand)] text-white [--clay-edge:var(--brand-dark)]"
                : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
