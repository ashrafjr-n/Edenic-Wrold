import type { StaticImageData } from "next/image";
import type { Maker, SceneRect } from "@/types/course";
import blender from "../../public/assets/learn/nova/fruits/props/blender.png";
import pot from "../../public/assets/learn/nova/fruits/props/pot.png";
import cup from "../../public/assets/learn/nova/fruits/props/cup.png";

/* Nova's market — the things her Fruits & Vegetables course happens in,
   rendered by `tools/picnic-scene` (`soupPot`, `blender`, `cup`) in the
   same clay as everything else. */

/** Nova's cup, upside down — the lessons' cups game hides the food under
    one of three. No shadow: the table draws one that stays down when the
    cup is lifted. */
export const CUP: StaticImageData = cup;

/** What a Make fills, empty, and where what goes in lies in that picture —
    the jar's inside, the pot's mouth (% of the picture, measured off the
    renders: where the full one differs from the empty one). */
export const MAKERS: Record<Maker, { empty: StaticImageData; inside: SceneRect }> = {
  blender: { empty: blender, inside: [11, 21, 44, 45] },
  pot: { empty: pot, inside: [8.4, 10.6, 68.8, 44.8] },
};
