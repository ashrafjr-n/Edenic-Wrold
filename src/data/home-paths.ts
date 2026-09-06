import type { HomePath } from "@/types/home-path";

/** Purple then pink: the two hero colors, side by side, which is the one place
    on the site they appear at full strength together.

    Each panel's art is chosen to already sit in its panel's hue — the book
    scene is violet, the cotton-candy cloud is pink — so once `.panel-art` fades
    it into the fill there's no seam to hide.

    The Learn panel's fill is hardcoded rather than `var(--brand)` on purpose:
    `--brand` moved from purple to sky blue site-wide, but this one panel was
    kept purple deliberately, so it can't follow the token.

    `title`/`description`/`action` are translated content — see
    `dict.homePaths` in the dictionaries, not this file. */
export const homePaths: HomePath[] = [
  {
    id: "learn",
    art: { src: "/assets/learn.jpg", fit: "cover" },
    href: "/learn",
    face: "#6d55e0",
    edge: "#4a34b0",
  },
  {
    id: "play",
    art: { src: "/assets/icons/cloud.png", fit: "contain" },
    href: "/play",
    face: "var(--accent)",
    edge: "var(--accent-dark)",
  },
];
