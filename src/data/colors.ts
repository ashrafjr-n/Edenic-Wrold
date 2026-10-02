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

interface ColorDef {
  /** A paint pot of this color — how the course SHOWS a color: on the word
      card, as the Paint step's buttons, on the sort boxes and done screen.
      Rendered by `tools/picnic-scene` with the same paint as the things. */
  pot: StaticImageData;
  /** The color as clay (a sort box), its shaded edge, and the text on it. */
  face: string;
  edge: string;
  text: string;
}

const INK = "var(--color-ink-fixed)";

/** The ten taught colors. These are content, not theme: red is red in dark
    mode too. Kept close to the paint the pictures were rendered with. */
export const COLORS: Record<ColorId, ColorDef> = {
  red: { pot: red, face: "#ee4645", edge: "#b52a2c", text: "#fff" },
  blue: { pot: blue, face: "#3f86e8", edge: "#2a5fae", text: "#fff" },
  yellow: { pot: yellow, face: "#ffd31a", edge: "#c99a00", text: INK },
  green: { pot: green, face: "#4fbf5a", edge: "#2f8a3a", text: "#fff" },
  orange: { pot: orange, face: "#ff8c2e", edge: "#c45f10", text: "#fff" },
  purple: { pot: purple, face: "#9257de", edge: "#6334a8", text: "#fff" },
  pink: { pot: pink, face: "#ff86c2", edge: "#cc5591", text: "#fff" },
  brown: { pot: brown, face: "#96592f", edge: "#643814", text: "#fff" },
  black: { pot: black, face: "#3a3640", edge: "#1b1820", text: "#fff" },
  white: { pot: white, face: "#ffffff", edge: "#c5cbd8", text: INK },
};

/** A color as something to look at: its paint pot. */
export const potFace = (color: ColorId): Face => ({ kind: "picture", src: COLORS[color].pot, word: color });

/** A Sort box for a color, in that color's own clay. */
export const colorBin = (color: ColorId): SortBin => {
  const { face, edge, text } = COLORS[color];
  return { target: { color }, word: color, face: potFace(color), tone: { face, edge, text } };
};
