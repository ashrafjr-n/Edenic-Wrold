"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav, profileNav } from "@/data/nav";

/* Flat PNGs, not lucide — `.icon-mask` (globals.css) masks each one to
   `currentColor`, so `.nav-tab`'s own color rules (blue at rest, pink for
   the current page) drive the icon exactly like they'd drive an inline SVG. */
const ICON_SRC = {
  Home: "/assets/png/home.png",
  Learn: "/assets/png/learn.png",
  Activities: "/assets/png/activity.png",
  Profile: "/assets/png/profile.png",
} as const;

/* One optical size for all four, MEASURED from each PNG rather than eyeballed.
   The four glyphs fill their shared 512×512 canvas by very different amounts —
   home 512×512 (a solid square), learn 512×392, activity 512×376, profile
   342×428 — so `.icon-mask`'s plain `mask-size: contain` renders four
   different sizes out of one 28×28 box. Each scale below is `512 / (the
   glyph's own longest side)`, which fits every glyph to the same square, and
   home then takes a 92% optical trim on top of that: a full-bleed square
   silhouette reads noticeably heavier than a wide flat one at identical
   width.

   All four bounding boxes are centred in their canvas (verified), so
   `.icon-mask`'s `mask-position: center` is what puts them on the same level
   — nothing here needs to offset them.

   **Re-measure this table if any of these PNGs is replaced.** It is
   calibrated to the current files, and the previous version of it had gone
   stale against exactly that. Set on BOTH `maskSize`/`WebkitMaskSize`:
   inline styles aren't run through Lightning CSS's auto-prefixing, unlike
   `.icon-mask` itself. */
const ICON_SCALE: Record<keyof typeof ICON_SRC, string> = {
  Home: "92%",
  Learn: "100%",
  Activities: "100%",
  Profile: "120%",
};

const iconVar = (label: keyof typeof ICON_SRC) =>
  ({
    "--icon-src": `url(${ICON_SRC[label]})`,
    maskSize: ICON_SCALE[label],
    WebkitMaskSize: ICON_SCALE[label],
  }) as CSSProperties;

/** App-style bottom tab bar — phone only (`sm:hidden`). Carries `MainNav`'s
    items (same `mainNav` data, same locked rules) but fixed to the viewport
    bottom instead of sitting in the header, the way a native app places its
    primary navigation. Home/Learn/Activities move down here on a phone — see
    `MainNav`, hidden below `sm` — and a fourth **Profile** tab joins them,
    which is the one thing on this bar `MainNav` has no counterpart for: it
    comes from `profileNav`, not `mainNav`, precisely so it stays out of the
    header and the footer. The rest of the chrome (logo, language, dark mode,
    join) stays in the top header on every breakpoint.

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
      className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 bg-[var(--surface)] pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_20px_-16px_rgb(var(--shadow-hue)/45%)] sm:hidden"
    >
      {mainNav.map(({ label, href }) => {
        const iconStyle = iconVar(label as keyof typeof ICON_SRC);

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
                className="icon-mask icon-mask-grain h-7 w-7"
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
              className="icon-mask icon-mask-grain h-7 w-7"
              style={iconStyle}
            />
            {label}
          </Link>
        );
      })}

      {/* Profile: chrome with no destination, the same pattern the header's
          "Join Edenic World" follows — there is no profile until someone
          signs in, and the sign-in flow is a later phase. So it is a `<span>`,
          not a `<Link>`, and it does nothing at all when pressed.

          It deliberately does NOT take the "Soon" treatment the locked
          `mainNav` branch above uses: that badge is for a SECTION of the site
          that has no page yet, while this is a control that will act on the
          child's own account. It wears `.nav-tab` so the icon and label read
          exactly like a resting tab, and it can never take
          `.nav-tab--current` — there is no page it could be "on". */}
      <span
        aria-disabled="true"
        className="nav-tab flex h-16 cursor-default flex-col items-center justify-center gap-0.5 text-[0.6875rem] font-semibold"
      >
        <span
          aria-hidden
          className="icon-mask icon-mask-grain h-7 w-7"
          style={iconVar("Profile")}
        />
        {profileNav.label}
      </span>
    </nav>
  );
}
