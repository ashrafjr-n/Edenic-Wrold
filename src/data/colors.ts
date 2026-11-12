import type { StaticImageData } from "next/image";
import type { ColorId, Face } from "@/types/course";
import red from "../../public/assets/learn/pinki/colors/dots/red.png";
import blue from "../../public/assets/learn/pinki/colors/dots/blue.png";
import yellow from "../../public/assets/learn/pinki/colors/dots/yellow.png";
import green from "../../public/assets/learn/pinki/colors/dots/green.png";
import orange from "../../public/assets/learn/pinki/colors/dots/orange.png";
import purple from "../../public/assets/learn/pinki/colors/dots/purple.png";
import pink from "../../public/assets/learn/pinki/colors/dots/pink.png";
import brown from "../../public/assets/learn/pinki/colors/dots/brown.png";
import black from "../../public/assets/learn/pinki/colors/dots/black.png";
import white from "../../public/assets/learn/pinki/colors/dots/white.png";
import empty from "../../public/assets/learn/pinki/colors/dots/empty.png";

/** A dot with no color yet, plain grey — a color still to learn. */
export const EMPTY_DOT = empty;

interface ColorDef {
  /** A plain dot of this color (2026-11-05, on request) — how the course
      SHOWS a color: its stop on the board, Mix's sum. */
  dot: StaticImageData;
  /** The color itself, as paint. */
  face: string;
  /** Its clay letters — the color word written in the color itself. */
  letter: { face: string; edge: string };
}

/** The ten taught colors. These are content, not theme: red is red in dark
    mode too. Kept close to the paint the pictures were rendered with. */
const color = (dot: StaticImageData, face: string, edge: string): ColorDef => ({ dot, face, letter: { face, edge } });

export const COLORS: Record<ColorId, ColorDef> = {
  red: color(red, "#ee4645", "#b52a2c"),
  blue: color(blue, "#3f86e8", "#2a5fae"),
  yellow: color(yellow, "#ffd31a", "#c99a00"),
  green: color(green, "#4fbf5a", "#2f8a3a"),
  orange: color(orange, "#ff8c2e", "#c45f10"),
  purple: color(purple, "#9257de", "#6334a8"),
  pink: color(pink, "#ff86c2", "#cc5591"),
  brown: color(brown, "#96592f", "#643814"),
  /* Black letters follow the theme (`--color-letter-black`): black on the
     dark card would disappear. */
  black: { ...color(black, "#3a3640", "#1b1820"), letter: { face: "var(--color-letter-black)", edge: "var(--color-letter-black-edge)" } },
  /* White letters on a white card are read by their edge — a deeper one. */
  white: color(white, "#ffffff", "#8f98ab"),
};

/** The order the course teaches them: the primaries, what they make, then
    the rest. */
export const COLOR_ORDER: ColorId[] = ["red", "blue", "yellow", "green", "orange", "purple", "pink", "brown", "black", "white"];

/** A color as something to look at: its dot. */
export const dotFace = (color: ColorId): Face => ({ kind: "picture", src: COLORS[color].dot, word: color });
