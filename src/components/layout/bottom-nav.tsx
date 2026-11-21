"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavActive, mainNav } from "@/data/nav";
import type { Dictionary } from "@/lib/dictionaries/en";

/* Flat PNGs, not lucide — `.icon-mask` (globals.css) masks each one to
   `currentColor`, so `.nav-tab`'s own color rules (blue at rest, pink for
   the current page) drive the icon exactly like they'd drive an inline SVG.
   Keyed by the nav item's stable `id`, not its translated `label` — a label
   swap must never break this lookup. Watch (a television) and Play (a game
   controller) are Phosphor's filled glyphs (MIT), rendered to 512 px alpha. */
const ICON_SRC = {
  home: "/assets/nav-icons/home.png",
  learn: "/assets/nav-icons/learn.png",
  watch: "/assets/nav-icons/watch.png",
  play: "/assets/nav-icons/play.png",
} as const;

/* One optical size for all four, MEASURED from each PNG's alpha box rather
   than eyeballed: home 512×512 (a solid square), learn 512×392, watch 512×492
   (the television, nearly square), play 512×375 (the controller). Each scale
   is `512 / (the glyph's own longest side)` — 100% for all but the two
   near-square glyphs, home and watch, which take a 92% optical trim: a
   full-bleed square silhouette reads heavier than a wide flat one at the same
   width. All four boxes are centred in their canvas, so `.icon-mask`'s
   `mask-position: center` puts them on one level.

   **Re-measure this table if any of these PNGs is replaced.** Set on BOTH
   `maskSize`/`WebkitMaskSize`: inline styles aren't run through Lightning
   CSS's auto-prefixing, unlike `.icon-mask` itself. */
const ICON_SCALE: Record<keyof typeof ICON_SRC, string> = {
  home: "92%",
  learn: "100%",
  watch: "92%",
  play: "100%",
};

const iconVar = (id: keyof typeof ICON_SRC) =>
  ({
    "--icon-src": `url(${ICON_SRC[id]})`,
    maskSize: ICON_SCALE[id],
    WebkitMaskSize: ICON_SCALE[id],
  }) as CSSProperties;

/** App-style bottom tab bar — phone only (`sm:hidden`). Carries `MainNav`'s
    items (same `mainNav` data, same locked rules) but fixed to the viewport
    bottom instead of sitting in the header, the way a native app places its
    primary navigation. Home, Learn, Watch and Play move down here on a
    phone — see `MainNav`, hidden below `sm`. There is no Profile tab: once
    accounts exist, the header's Join button turns into the profile button.
    The rest of the chrome (logo, language, dark mode, join) stays in the top
    header on every breakpoint.

    `dict` is passed down from `layout.tsx` since a Client Component can't
    call `getDictionary()` itself.

    Every tab reads blue+grain by default; the CURRENT page's tab is pink
    with lighter grain (`.nav-tab--current`, `globals.css`) — driven by the
    same `pathname`-derived `active` boolean that sets `aria-current`, not by
    `:hover`/`:active` (this bar is phone-only, where hover doesn't exist and
    a touch's `:active` state doesn't persist once the finger lifts, so a
    CSS-interaction-driven version snapped back to blue right after landing
    on the new page — see `globals.css` for the fuller story). */
export function BottomNav({ dict }: { dict: Dictionary }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label={dict.nav.mainAriaLabel}
      /* `z-30`, moved up with the header — see its comment for why `z-20`
         was not enough. The two are one tier of site chrome. */
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 bg-[var(--surface)] pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_20px_-16px_rgb(var(--shadow-hue)/45%)] sm:hidden"
    >
      {mainNav.map((item) => {
        const { id, href } = item;
        const label = dict.nav[id];
        const iconStyle = iconVar(id);

        if (!href) {
          return (
            <span
              key={id}
              aria-disabled="true"
              className="flex h-16 cursor-default flex-col items-center justify-center gap-0.5 text-[var(--color-locked-text)]"
            >
              {/* Blue+grain like the two real tabs, on direct request — the
                  "Soon" badge and grey label are what still say "not yet",
                  so the icon itself can stay visually consistent with the
                  other two. Never turns pink: there is nothing to press. */}
              <span
                aria-hidden
                className="icon-mask icon-mask-grain h-7 w-7"
                style={{ ...iconStyle, color: "var(--brand)" } as CSSProperties}
              />
              <span className="text-[0.6875rem] font-semibold">{label}</span>
              <span className="rounded-full bg-[var(--color-locked)] px-1.5 py-px text-[0.5rem] font-bold uppercase tracking-wide">
                {dict.nav.soon}
              </span>
            </span>
          );
        }

        const active = isNavActive(item, pathname);

        return (
          <Link
            key={id}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`nav-tab flex h-16 flex-col items-center justify-center gap-0.5 text-[0.6875rem] font-semibold ${
              active ? "nav-tab--current" : ""
            }`}
          >
            <span
              aria-hidden
              className="icon-mask icon-mask-grain h-7 w-7"
              style={iconStyle}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
