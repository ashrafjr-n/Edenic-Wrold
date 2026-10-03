import type { StaticImageData } from "next/image";
import type { Maker, SceneRect } from "@/types/course";
import blender from "../../public/assets/learn/nova/fruits/props/blender.png";
import pot from "../../public/assets/learn/nova/fruits/props/pot.png";

/* Nova's market — the things her Fruits & Vegetables review happens in,
   rendered by `tools/picnic-scene` (`soupPot`, `blender`) in the same clay
   as everything else. */

/** What a Make fills, empty, and where what goes in lies in that picture —
    the jar's inside, the pot's mouth (% of the picture, measured off the
    renders: where the full one differs from the empty one). */
export const MAKERS: Record<Maker, { empty: StaticImageData; inside: SceneRect }> = {
  blender: { empty: blender, inside: [11, 21, 44, 45] },
  pot: { empty: pot, inside: [8.4, 10.6, 68.8, 44.8] },
};
