import type { StaticImageData } from "next/image";
import type { ColorId, Face, SortBin } from "@/types/course";
import red from "../../public/assets/learn/pinki/colors/pots/red.png";
import blue from "../../public/assets/learn/pinki/colors/pots/blue.png";
import yellow from "../../public/assets/learn/pinki/colors/pots/yellow.png";
import green from "../../public/assets/learn/pinki/colors/pots/green.png";
import orange from "../../public/assets/learn/pinki/colors/pots/orange.png";
import purple from "../../public/assets/learn/pinki/colors/pots/purple.png";
import pink from "../../public/assets/learn/pinki/colors/pots/pink.png";
import brown from "../../public/assets/learn/pinki/colors/pots/brown.png";
import black from "../../public/assets/learn/pinki/colors/pots/black.png";
import white from "../../public/assets/learn/pinki/colors/pots/white.png";
import empty from "../../public/assets/learn/pinki/colors/pots/empty.png";
import redBalloon from "../../public/assets/learn/pinki/colors/balloons/red.png";
import blueBalloon from "../../public/assets/learn/pinki/colors/balloons/blue.png";
import yellowBalloon from "../../public/assets/learn/pinki/colors/balloons/yellow.png";
import greenBalloon from "../../public/assets/learn/pinki/colors/balloons/green.png";
import orangeBalloon from "../../public/assets/learn/pinki/colors/balloons/orange.png";
import purpleBalloon from "../../public/assets/learn/pinki/colors/balloons/purple.png";
import pinkBalloon from "../../public/assets/learn/pinki/colors/balloons/pink.png";
import brownBalloon from "../../public/assets/learn/pinki/colors/balloons/brown.png";
import blackBalloon from "../../public/assets/learn/pinki/colors/balloons/black.png";
import whiteBalloon from "../../public/assets/learn/pinki/colors/balloons/white.png";

/** A pot with no color yet, in plain grey clay — a color still to learn. */
export const EMPTY_POT = empty;

interface ColorDef {
  /** A paint pot of this color — how the course SHOWS a color: on the word
      card, as the Paint step's buttons, on the sort boxes and done screen.
      Rendered by `tools/picnic-scene` with the same paint as the things. */
  pot: StaticImageData;
  /** A party balloon of this color (the Pop step). */
  balloon: StaticImageData;
  /** The color as clay (a sort box), its shaded edge, and the text on it. */
  face: string;
  edge: string;
  text: string;
  /** Its clay letters — the color word written in the color itself. */
  letter: { face: string; edge: string };
}

const INK = "var(--color-ink-fixed)";

/** The ten taught colors. These are content, not theme: red is red in dark
    mode too. Kept close to the paint the pictures were rendered with. */
const color = (pot: StaticImageData, balloon: StaticImageData, face: string, edge: string, text = "#fff", letterEdge = edge): ColorDef => ({
  pot,
  balloon,
  face,
  edge,
  text,
  letter: { face, edge: letterEdge },
});

export const COLORS: Record<ColorId, ColorDef> = {
  red: color(red, redBalloon, "#ee4645", "#b52a2c"),
  blue: color(blue, blueBalloon, "#3f86e8", "#2a5fae"),
  yellow: color(yellow, yellowBalloon, "#ffd31a", "#c99a00", INK),
  green: color(green, greenBalloon, "#4fbf5a", "#2f8a3a"),
  orange: color(orange, orangeBalloon, "#ff8c2e", "#c45f10"),
  purple: color(purple, purpleBalloon, "#9257de", "#6334a8"),
  pink: color(pink, pinkBalloon, "#ff86c2", "#cc5591"),
  brown: color(brown, brownBalloon, "#96592f", "#643814"),
  /* Black letters follow the theme (`--color-letter-black`): black on the
     dark card would disappear. */
  black: { ...color(black, blackBalloon, "#3a3640", "#1b1820"), letter: { face: "var(--color-letter-black)", edge: "var(--color-letter-black-edge)" } },
  /* White letters on a white card are read by their edge — a deeper one. */
  white: color(white, whiteBalloon, "#ffffff", "#c5cbd8", INK, "#8f98ab"),
};

/** The order the course teaches them: the primaries, what they make, then
    the rest. */
export const COLOR_ORDER: ColorId[] = ["red", "blue", "yellow", "green", "orange", "purple", "pink", "brown", "black", "white"];

/** A color as something to look at: its paint pot. */
export const potFace = (color: ColorId): Face => ({ kind: "picture", src: COLORS[color].pot, word: color });

/** A Sort box for a color, in that color's own clay. */
export const colorBin = (color: ColorId): SortBin => {
  const { face, edge, text } = COLORS[color];
  return { target: { color }, word: color, face: potFace(color), tone: { face, edge, text } };
};
