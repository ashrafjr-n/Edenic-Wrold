import type { RevealScene } from "@/types/course";
import apple0 from "../../public/assets/learn/nova/fruits/grow/apple/0.png";
import apple1 from "../../public/assets/learn/nova/fruits/grow/apple/1.png";
import apple2 from "../../public/assets/learn/nova/fruits/grow/apple/2.png";
import apple3 from "../../public/assets/learn/nova/fruits/grow/apple/3.png";
import apple4 from "../../public/assets/learn/nova/fruits/grow/apple/4.png";
import banana0 from "../../public/assets/learn/nova/fruits/grow/banana/0.png";
import banana1 from "../../public/assets/learn/nova/fruits/grow/banana/1.png";
import banana2 from "../../public/assets/learn/nova/fruits/grow/banana/2.png";
import banana3 from "../../public/assets/learn/nova/fruits/grow/banana/3.png";
import banana4 from "../../public/assets/learn/nova/fruits/grow/banana/4.png";
import orange0 from "../../public/assets/learn/nova/fruits/grow/orange/0.png";
import orange1 from "../../public/assets/learn/nova/fruits/grow/orange/1.png";
import orange2 from "../../public/assets/learn/nova/fruits/grow/orange/2.png";
import orange3 from "../../public/assets/learn/nova/fruits/grow/orange/3.png";
import orange4 from "../../public/assets/learn/nova/fruits/grow/orange/4.png";
import grapes0 from "../../public/assets/learn/nova/fruits/grow/grapes/0.png";
import grapes1 from "../../public/assets/learn/nova/fruits/grow/grapes/1.png";
import grapes2 from "../../public/assets/learn/nova/fruits/grow/grapes/2.png";
import grapes3 from "../../public/assets/learn/nova/fruits/grow/grapes/3.png";
import grapes4 from "../../public/assets/learn/nova/fruits/grow/grapes/4.png";
import carrot0 from "../../public/assets/learn/nova/fruits/grow/carrot/0.png";
import carrot1 from "../../public/assets/learn/nova/fruits/grow/carrot/1.png";
import carrot2 from "../../public/assets/learn/nova/fruits/grow/carrot/2.png";
import carrot3 from "../../public/assets/learn/nova/fruits/grow/carrot/3.png";
import carrot4 from "../../public/assets/learn/nova/fruits/grow/carrot/4.png";
import broccoli0 from "../../public/assets/learn/nova/fruits/grow/broccoli/0.png";
import broccoli1 from "../../public/assets/learn/nova/fruits/grow/broccoli/1.png";
import broccoli2 from "../../public/assets/learn/nova/fruits/grow/broccoli/2.png";
import broccoli3 from "../../public/assets/learn/nova/fruits/grow/broccoli/3.png";
import broccoli4 from "../../public/assets/learn/nova/fruits/grow/broccoli/4.png";
import corn0 from "../../public/assets/learn/nova/fruits/grow/corn/0.png";
import corn1 from "../../public/assets/learn/nova/fruits/grow/corn/1.png";
import corn2 from "../../public/assets/learn/nova/fruits/grow/corn/2.png";
import corn3 from "../../public/assets/learn/nova/fruits/grow/corn/3.png";
import corn4 from "../../public/assets/learn/nova/fruits/grow/corn/4.png";
import potato0 from "../../public/assets/learn/nova/fruits/grow/potato/0.png";
import potato1 from "../../public/assets/learn/nova/fruits/grow/potato/1.png";
import potato2 from "../../public/assets/learn/nova/fruits/grow/potato/2.png";
import potato3 from "../../public/assets/learn/nova/fruits/grow/potato/3.png";
import potato4 from "../../public/assets/learn/nova/fruits/grow/potato/4.png";

/* Nova's garden — rendered by `tools/picnic-scene` (`render.cjs grow`
   → `crop.py grow`, which prints the spots): each food's seed in its
   island's soil, then one frame per tap (its sprout, a young plant, the
   plant grown and in flower, the food on it — a root pulled up). All eight
   are cut on one box, so the islands match. */

/** Each food growing from its seed, tap by tap — by its English word. */
export const GROW_SCENES: Record<string, RevealScene> = {
  apple: { frames: [apple0, apple1, apple2, apple3, apple4], spots: [[50, 73.82], [50, 66.43], [50, 51.24], [60.51, 45.99]] },
  banana: { frames: [banana0, banana1, banana2, banana3, banana4], spots: [[50, 73.82], [50, 66.43], [50, 52.42], [50, 46.02]] },
  orange: { frames: [orange0, orange1, orange2, orange3, orange4], spots: [[50, 73.82], [50, 66.43], [50, 51.24], [60.51, 45.99]] },
  grapes: { frames: [grapes0, grapes1, grapes2, grapes3, grapes4], spots: [[25.57, 72.57], [25.57, 65.19], [26.95, 48.71], [50.46, 38.45]] },
  carrot: { frames: [carrot0, carrot1, carrot2, carrot3, carrot4], spots: [[50, 73.82], [50, 66.43], [50, 58.64], [50, 70.01]] },
  broccoli: { frames: [broccoli0, broccoli1, broccoli2, broccoli3, broccoli4], spots: [[50, 73.82], [50, 66.43], [50, 61.95], [50, 59.56]] },
  corn: { frames: [corn0, corn1, corn2, corn3, corn4], spots: [[61.52, 71.74], [61.52, 64.35], [38.48, 50.64], [66.13, 39.22]] },
  potato: { frames: [potato0, potato1, potato2, potato3, potato4], spots: [[50, 73.82], [50, 66.43], [50, 58.18], [50, 74.15]] },
};
