import type { GrowScene } from "@/types/course";
import ground from "../../public/assets/learn/nova/fruits/grow/ground.png";
import seed from "../../public/assets/learn/nova/fruits/grow/seed.png";
import carrotRoots from "../../public/assets/learn/nova/fruits/grow/carrot/roots.png";
import carrotRoot from "../../public/assets/learn/nova/fruits/grow/carrot/root.png";
import carrotTops from "../../public/assets/learn/nova/fruits/grow/carrot/tops.png";
import potatoRunners from "../../public/assets/learn/nova/fruits/grow/potato/runners.png";
import potatoTuber0 from "../../public/assets/learn/nova/fruits/grow/potato/tuber0.png";
import potatoTuber1 from "../../public/assets/learn/nova/fruits/grow/potato/tuber1.png";
import potatoTuber2 from "../../public/assets/learn/nova/fruits/grow/potato/tuber2.png";
import potatoTops from "../../public/assets/learn/nova/fruits/grow/potato/tops.png";
import tomatoRoots from "../../public/assets/learn/nova/fruits/grow/tomato/roots.png";
import tomatoTops from "../../public/assets/learn/nova/fruits/grow/tomato/tops.png";
import tomatoFruit0Flower from "../../public/assets/learn/nova/fruits/grow/tomato/fruit0-flower.png";
import tomatoFruit0Green from "../../public/assets/learn/nova/fruits/grow/tomato/fruit0-green.png";
import tomatoFruit0Ripe from "../../public/assets/learn/nova/fruits/grow/tomato/fruit0-ripe.png";
import tomatoFruit1Flower from "../../public/assets/learn/nova/fruits/grow/tomato/fruit1-flower.png";
import tomatoFruit1Green from "../../public/assets/learn/nova/fruits/grow/tomato/fruit1-green.png";
import tomatoFruit1Ripe from "../../public/assets/learn/nova/fruits/grow/tomato/fruit1-ripe.png";
import tomatoFruit2Flower from "../../public/assets/learn/nova/fruits/grow/tomato/fruit2-flower.png";
import tomatoFruit2Green from "../../public/assets/learn/nova/fruits/grow/tomato/fruit2-green.png";
import tomatoFruit2Ripe from "../../public/assets/learn/nova/fruits/grow/tomato/fruit2-ripe.png";
import pepperRoots from "../../public/assets/learn/nova/fruits/grow/pepper/roots.png";
import pepperTops from "../../public/assets/learn/nova/fruits/grow/pepper/tops.png";
import pepperFruit0Flower from "../../public/assets/learn/nova/fruits/grow/pepper/fruit0-flower.png";
import pepperFruit0Green from "../../public/assets/learn/nova/fruits/grow/pepper/fruit0-green.png";
import pepperFruit0Ripe from "../../public/assets/learn/nova/fruits/grow/pepper/fruit0-ripe.png";
import pepperFruit1Flower from "../../public/assets/learn/nova/fruits/grow/pepper/fruit1-flower.png";
import pepperFruit1Green from "../../public/assets/learn/nova/fruits/grow/pepper/fruit1-green.png";
import pepperFruit1Ripe from "../../public/assets/learn/nova/fruits/grow/pepper/fruit1-ripe.png";
import broccoliRoots from "../../public/assets/learn/nova/fruits/grow/broccoli/roots.png";
import broccoliTops from "../../public/assets/learn/nova/fruits/grow/broccoli/tops.png";
import broccoliHead from "../../public/assets/learn/nova/fruits/grow/broccoli/head.png";
import broccoliFront from "../../public/assets/learn/nova/fruits/grow/broccoli/front.png";

/* Growing Nova's vegetables (2026-10-24) — the Vegetables lessons' third
   step. One render per food (`tools/picnic-scene`, `render.cjs grow carrot
   potato tomato pepper broccoli`, then `crop.py grow`, whose numbers these
   are): the soil cut open, the same for all five, and each part of the
   plant alone — where it lies (`box`, % of the frame), the point it grows
   from (`from`, % of its own box) and when, as the knob goes from 0 to 1:
   it `grows` from nothing, `shows` (a ripe color over the green) or
   `fades` (the seed under the sprout, a flower under its fruit). In
   drawing order. */

const GROUND = { src: ground, box: [0.0, 47.9, 100.0, 52.1] } as const;

/** The frame's width over its height — every food's is the same. */
export const GROW_RATIO = 1.0057;

export const GROW_SCENES = {
  carrot: {
    ground: GROUND,
    parts: [
      { src: carrotRoots, box: [43.69, 53.23, 13.06, 12.57], from: [48.28, 1.94], grows: [0.06, 0.45] },
      { src: seed, box: [45.27, 56.74, 9.46, 7.36], from: [50.0, 50.05], fades: [0.03, 0.14] },
      { src: carrotRoot, box: [38.85, 52.21, 22.3, 37.03], from: [50.0, 3.41], grows: [0.22, 1] },
      { src: carrotTops, box: [27.59, 18.01, 44.26, 36.58], from: [50.64, 96.95], grows: [0.08, 0.62] },
    ],
  },
  potato: {
    ground: GROUND,
    parts: [
      { src: potatoRunners, box: [32.43, 53.11, 35.92, 29.45], from: [48.9, 1.21], grows: [0.06, 0.45] },
      { src: seed, box: [45.27, 56.74, 9.46, 7.36], from: [50.0, 50.05], fades: [0.03, 0.14] },
      { src: potatoTuber0, box: [18.58, 62.51, 24.32, 18.35], from: [49.49, 51.41], grows: [0.4, 0.8] },
      { src: potatoTuber1, box: [40.88, 75.08, 22.97, 16.99], from: [49.36, 51.48], grows: [0.5, 0.9] },
      { src: potatoTuber2, box: [60.59, 62.17, 19.26, 15.63], from: [50.47, 50.8], grows: [0.6, 1.0] },
      { src: potatoTops, box: [28.94, 17.33, 42.12, 37.15], from: [50.0, 97.3], grows: [0.08, 0.62] },
    ],
  },
  tomato: {
    ground: GROUND,
    parts: [
      { src: tomatoRoots, box: [40.2, 53.23, 20.5, 19.37], from: [47.8, 1.26], grows: [0.06, 0.45] },
      { src: seed, box: [45.27, 56.74, 9.46, 7.36], from: [50.0, 50.05], fades: [0.03, 0.14] },
      { src: tomatoTops, box: [25.0, 0.0, 50.9, 54.93], from: [49.12, 97.35], grows: [0.08, 0.62] },
      { src: tomatoFruit0Flower, box: [32.32, 14.04, 13.63, 13.36], from: [48.43, 31.97], grows: [0.42, 0.54], fades: [0.62, 0.7] },
      { src: tomatoFruit0Green, box: [32.32, 14.04, 13.63, 13.36], from: [48.43, 21.35], grows: [0.6, 0.86] },
      { src: tomatoFruit0Ripe, box: [32.32, 14.04, 13.63, 13.36], from: [48.43, 21.35], grows: [0.6, 0.86], shows: [0.84, 1] },
      { src: tomatoFruit1Flower, box: [54.84, 20.95, 13.63, 13.48], from: [48.43, 32.03], grows: [0.47, 0.59], fades: [0.67, 0.75] },
      { src: tomatoFruit1Green, box: [54.84, 20.95, 13.63, 13.48], from: [48.43, 21.49], grows: [0.65, 0.91] },
      { src: tomatoFruit1Ripe, box: [54.84, 20.95, 13.63, 13.48], from: [48.43, 21.49], grows: [0.65, 0.91], shows: [0.84, 1] },
      { src: tomatoFruit2Flower, box: [34.12, 29.78, 13.63, 13.36], from: [48.76, 31.82], grows: [0.52, 0.64], fades: [0.72, 0.8] },
      { src: tomatoFruit2Green, box: [34.12, 29.78, 13.63, 13.36], from: [48.76, 21.19], grows: [0.7, 0.96] },
      { src: tomatoFruit2Ripe, box: [34.12, 29.78, 13.63, 13.36], from: [48.76, 21.19], grows: [0.7, 0.96], shows: [0.84, 1] },
    ],
  },
  pepper: {
    ground: GROUND,
    parts: [
      { src: pepperRoots, box: [40.65, 53.23, 19.48, 18.35], from: [47.98, 1.33], grows: [0.06, 0.45] },
      { src: seed, box: [45.27, 56.74, 9.46, 7.36], from: [50.0, 50.05], fades: [0.03, 0.14] },
      { src: pepperTops, box: [28.83, 6.34, 43.02, 48.47], from: [49.21, 97.23], grows: [0.08, 0.62] },
      { src: pepperFruit0Flower, box: [32.21, 25.37, 16.55, 21.52], from: [46.12, 18.52], grows: [0.42, 0.54], fades: [0.62, 0.7] },
      { src: pepperFruit0Green, box: [32.21, 25.37, 16.55, 21.52], from: [46.12, 30.51], grows: [0.6, 0.86] },
      { src: pepperFruit0Ripe, box: [32.21, 25.37, 16.55, 21.52], from: [46.12, 30.51], grows: [0.6, 0.86], shows: [0.84, 1] },
      { src: pepperFruit1Flower, box: [50.9, 21.74, 16.89, 21.74], from: [60.27, 18.15], grows: [0.47, 0.59], fades: [0.67, 0.75] },
      { src: pepperFruit1Green, box: [50.9, 21.74, 16.89, 21.74], from: [60.27, 30.01], grows: [0.65, 0.91] },
      { src: pepperFruit1Ripe, box: [50.9, 21.74, 16.89, 21.74], from: [60.27, 30.01], grows: [0.65, 0.91], shows: [0.84, 1] },
    ],
  },
  broccoli: {
    ground: GROUND,
    parts: [
      { src: broccoliRoots, box: [40.2, 53.23, 20.5, 19.37], from: [47.8, 1.26], grows: [0.06, 0.45] },
      { src: seed, box: [45.27, 56.74, 9.46, 7.36], from: [50.0, 50.05], fades: [0.03, 0.14] },
      { src: broccoliTops, box: [30.18, 28.54, 39.53, 28.31], from: [50.14, 88.06], grows: [0.08, 0.62] },
      { src: broccoliHead, box: [32.32, 16.65, 35.14, 39.3], from: [50.32, 81.72], grows: [0.5, 1] },
      { src: broccoliFront, box: [39.86, 41.0, 20.16, 14.95], from: [50.28, 83.45], grows: [0.08, 0.62] },
    ],
  },
} satisfies Record<string, GrowScene>;
