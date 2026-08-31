"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav } from "@/data/nav";

/* Flat PNGs, not lucide — `.icon-mask` (globals.css) masks each one to
   `currentColor`, so they still recolor with the surrounding text the way
   every other icon on the site does, instead of shipping fixed-color art. */
const ICON_SRC = {
  Home: "/assets/png/home.png",
  Learn: "/assets/png/learn.png",
  Activities: "/assets/png/activity.png",
} as const;

/** App-style bottom tab bar — phone only (`sm:hidden`). Mirrors `MainNav`'s
    items (same `mainNav` data, same active/locked rules) but fixed to the
    viewport bottom instead of sitting in the header, the way a native app
    places its primary navigation. Chrome (logo, language, dark mode, join)
    stays in the top header on every breakpoint; only Home/Learn/Activities
    move down here on a phone — see `MainNav`, hidden below `sm`. */
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
              <span aria-hidden className="icon-mask h-5 w-5" style={iconStyle} />
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
            className={`flex h-16 flex-col items-center justify-center gap-0.5 text-[0.6875rem] font-semibold transition-colors ${
              active
                ? "text-[var(--brand)]"
                : "text-[var(--color-ink-soft)] hover:text-[var(--brand)]"
            }`}
          >
            <span
              aria-hidden
              className="icon-mask h-5 w-5 transition-colors"
              style={iconStyle}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
