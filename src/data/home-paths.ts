import { GraduationCap, Shapes } from "lucide-react";
import type { HomePath } from "@/types/home-path";

/** Purple then pink: the two hero colors, side by side, which is the one place
    on the site they appear at full strength together. */
export const homePaths: HomePath[] = [
  {
    title: "Learn",
    description:
      "Pick a friend and work through their lessons — a short video, the shape itself, then tracing and a few questions.",
    Icon: GraduationCap,
    action: "Start learning",
    href: "/learn",
    face: "var(--brand)",
    edge: "var(--brand-dark)",
  },
  {
    title: "Activities",
    description:
      "Trace letters with a finger, match the shapes, find the odd one out — small hands-on practice after every lesson.",
    Icon: Shapes,
    action: "Coming soon",
    face: "var(--accent)",
    edge: "var(--accent-dark)",
  },
];
