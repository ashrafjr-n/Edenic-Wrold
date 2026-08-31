"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav } from "@/data/nav";

/* Flat PNGs, not lucide — `.icon-mask` (globals.css) masks each one to
   `currentColor`, so `.nav-tab`'s own color rules (blue at rest, pink for
   the current page) drive the icon exactly like they'd drive an inline SVG. */
const ICON_SRC = {
  Home: "/assets/png/home.png",
  Learn: "/assets/png/learn.png",
  Activities: "/assets/png/activity.png",
} as const;

/** App-style bottom tab bar — phone only (`sm:hidden`). Mirrors `MainNav`'s
    items (same `mainNav` data, same locked rules) but fixed to the viewport
    bottom instead of sitting in the header, the way a native app places its
    primary navigation. Chrome (logo, language, dark mode, join) stays in the
    top header on every breakpoint; only Home/Learn/Activities move down here
    on a phone — see `MainNav`, hidden below `sm`.

    Every tab reads blue+grain by default; the CURRENT page's tab is pink
    with lighter grain (`.nav-tab--current`, `globals.css`) — driven by the
    same `pathname`-derived `active` boolean that sets `aria-current`, not by
    `:hover`/`:active` (this bar is phone-only, where hover doesn't exist and
    a touch's `:active` state doesn't persist once the finger lifts, so a
    CSS-interaction-driven version snapped back to blue right after landing
    on the new page — see `globals.css` for the fuller story). */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 bg-[var(--surface)] pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_20px_-16px_rgb(var(--shadow-hue)/45%)] sm:hidden"
    >
      {mainNav.map(({ label, href }) => {
        const iconStyle = {
          "--icon-src": `url(${ICON_SRC[label as keyof typeof ICON_SRC]})`,
        } as CSSProperties;

        if (!href) {
          return (
            <span
              key={label}
              aria-disabled="true"
              className="flex h-16 cursor-default flex-col items-center justify-center gap-0.5 text-[var(--color-locked-text)]"
            >
              {/* Blue+grain like the two real tabs, on direct request — the
                  "Soon" badge and grey label are what still say "not yet",
                  so the icon itself can stay visually consistent with the
                  other two. Never turns pink: there is nothing to press. */}
              <span
                aria-hidden
                className="icon-mask icon-mask-grain h-5 w-5"
                style={{ ...iconStyle, color: "var(--brand)" } as CSSProperties}
              />
              <span className="text-[0.6875rem] font-semibold">{label}</span>
              <span className="rounded-full bg-[var(--color-locked)] px-1.5 py-px text-[0.5rem] font-bold uppercase tracking-wide">
                Soon
              </span>
            </span>
          );
        }

        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);

        return (
          <Link
            key={label}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`nav-tab flex h-16 flex-col items-center justify-center gap-0.5 text-[0.6875rem] font-semibold ${
              active ? "nav-tab--current" : ""
            }`}
          >
            <span
              aria-hidden
              className="icon-mask icon-mask-grain h-5 w-5"
              style={iconStyle}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
