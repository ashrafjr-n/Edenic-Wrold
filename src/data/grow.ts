import type { GrowScene } from "@/types/course";
import ground from "../../public/assets/learn/nova/fruits/grow/ground.webp";
import carrotAbove from "../../public/assets/learn/nova/fruits/grow/carrot/above.webp";
import carrotBelow from "../../public/assets/learn/nova/fruits/grow/carrot/below.webp";
import potatoAbove from "../../public/assets/learn/nova/fruits/grow/potato/above.webp";
import potatoBelow from "../../public/assets/learn/nova/fruits/grow/potato/below.webp";
import tomatoAbove from "../../public/assets/learn/nova/fruits/grow/tomato/above.webp";
import tomatoBelow from "../../public/assets/learn/nova/fruits/grow/tomato/below.webp";
import pepperAbove from "../../public/assets/learn/nova/fruits/grow/pepper/above.webp";
import pepperBelow from "../../public/assets/learn/nova/fruits/grow/pepper/below.webp";
import broccoliAbove from "../../public/assets/learn/nova/fruits/grow/broccoli/above.webp";
import broccoliBelow from "../../public/assets/learn/nova/fruits/grow/broccoli/below.webp";

/* Growing Nova's vegetables (2026-10-24) — the Vegetables lessons' third
   step. Each food rendered at 32 moments of its growth (`tools/picnic-scene`,
   `render.cjs grow carrot potato tomato pepper broccoli`, then `crop.py
   grow`, whose numbers these are): the soil cut open (the same for all
   five) and, per food, two sheets of frames — what grows above the soil
   (it sways about its `foot`, % of its cell) and what grows under it —
   each frame only what the plant adds to the soil. `box`es are % of the
   frame; `emerge` is when the shoot breaks the soil; `veg` where the
   vegetable is at the end (% of the frame). */

const GROUND = { src: ground, box: [0.45, 42.909, 99.099, 56.606] } as const;

/** The frame's width over its height — every food's is the same. */
export const GROW_RATIO = 1.077;

export const GROW_SCENES = {
  carrot: {
    ground: GROUND,
    frames: 32,
    cols: 8,
    above: { src: carrotAbove, cell: [356, 254], box: [30.518, 16.97, 47.185, 36.242], foot: [41.289, 90.548] },
    below: { src: carrotBelow, cell: [179, 252], box: [38.964, 52.727, 23.761, 36.0] },
    emerge: 0.1,
    veg: [50.0, 68.987],
  },
  potato: {
    ground: GROUND,
    frames: 32,
    cols: 8,
    above: { src: potatoAbove, cell: [371, 255], box: [29.167, 16.485, 49.099, 36.364], foot: [42.431, 91.58] },
    below: { src: potatoBelow, cell: [446, 285], box: [21.396, 53.091, 59.122, 40.606] },
    emerge: 0.1,
    veg: [61.441, 79.747],
  },
  tomato: {
    ground: GROUND,
    frames: 32,
    cols: 8,
    above: { src: tomatoAbove, cell: [396, 371], box: [27.14, 0.242, 52.477, 52.97], foot: [43.562, 93.533] },
    below: { src: tomatoBelow, cell: [134, 222], box: [40.541, 52.727, 17.793, 31.636] },
    emerge: 0.1,
    veg: [56.644, 30.053],
  },
  pepper: {
    ground: GROUND,
    frames: 32,
    cols: 8,
    above: { src: pepperAbove, cell: [325, 339], box: [31.644, 3.273, 43.018, 48.364], foot: [42.67, 96.175] },
    below: { src: pepperBelow, cell: [125, 210], box: [41.441, 52.97, 16.554, 29.939] },
    emerge: 0.1,
    veg: [51.847, 40.667],
  },
  broccoli: {
    ground: GROUND,
    frames: 32,
    cols: 8,
    above: { src: broccoliAbove, cell: [375, 235], box: [25.0, 19.636, 49.662, 33.576], foot: [50.34, 89.798] },
    below: { src: broccoliBelow, cell: [176, 211], box: [39.527, 52.727, 23.311, 30.061] },
    emerge: 0.1,
    veg: [50.0, 32.093],
  },
} satisfies Record<string, GrowScene>;
