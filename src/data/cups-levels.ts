import type { StaticImageData } from "next/image";
import cup from "../../public/assets/play/cups/cup.png";
import carrot from "../../public/assets/learn/nova/fruits/things/carrot.png";
import broccoli from "../../public/assets/learn/nova/fruits/things/broccoli.png";
import potato from "../../public/assets/learn/nova/fruits/things/potato.png";
import tomato from "../../public/assets/learn/nova/fruits/things/tomato.png";
import pepper from "../../public/assets/learn/nova/fruits/things/pepper.png";

/** Nova's cup, upside down — rendered by `tools/picnic-scene` (`cup`). No
    shadow: the table draws one that stays down when the cup is lifted. */
export const CUP: StaticImageData = cup;

/** One level of Nova's Cups: the vegetable that hides (English, and its
    picture — the Vegetables course's own), and how hard the cups move:
    `swaps` swaps of `swapMs` each. */
export interface CupsLevel {
  value: number;
  word: string;
  picture: StaticImageData;
  swaps: number;
  swapMs: number;
}

/** Five levels, the course's five vegetables in its order, each a swap
    more and a little faster than the one before — level 1 is the medium
    pace the lesson step had been tuned to for 5–9-year-olds, slower. */
export const CUPS_LEVELS: CupsLevel[] = [
  { value: 1, word: "carrot", picture: carrot, swaps: 3, swapMs: 760 },
  { value: 2, word: "broccoli", picture: broccoli, swaps: 4, swapMs: 700 },
  { value: 3, word: "potato", picture: potato, swaps: 5, swapMs: 640 },
  { value: 4, word: "tomato", picture: tomato, swaps: 6, swapMs: 590 },
  { value: 5, word: "pepper", picture: pepper, swaps: 7, swapMs: 540 },
];
