import type { HomePath } from "@/types/home-path";

/** Purple then pink: the two hero colors, side by side, which is the one place
    on the site they appear at full strength together.

    Each panel's art is chosen to already sit in its panel's hue — the book
    scene is violet, the cotton-candy cloud is pink — so once `.panel-art` fades
    it into the fill there's no seam to hide.

    The Learn panel's fill is hardcoded rather than `var(--brand)` on purpose:
    `--brand` moved from purple to sky blue site-wide, but this one panel was
    kept purple deliberately, so it can't follow the token. */
export const homePaths: HomePath[] = [
  {
    title: "Learn",
    description:
      "Pick a friend and work through their lessons — a short video, the shape itself, then tracing and a few questions.",
    art: { src: "/assets/learn.jpg", fit: "cover" },
    action: "Start learning",
    href: "/learn",
    face: "#6d55e0",
    edge: "#4a34b0",
  },
  {
    title: "Activities",
    description:
      "Trace letters with a finger, match the shapes, find the odd one out — small hands-on practice after every lesson.",
    art: { src: "/assets/icons/cloud.png", fit: "contain" },
    action: "Coming soon",
    face: "var(--accent)",
    edge: "var(--accent-dark)",
  },
];
