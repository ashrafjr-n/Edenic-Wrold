import type { StaticImageData } from "next/image";
import type { Container, Maker, SceneRect } from "@/types/course";
import basket from "../../public/assets/learn/nova/fruits/props/basket.png";
import blender from "../../public/assets/learn/nova/fruits/props/blender.png";
import bowl from "../../public/assets/learn/nova/fruits/props/bowl.png";
import pot from "../../public/assets/learn/nova/fruits/props/pot.png";

/* Nova's market — the things her Fruits & Vegetables steps happen in,
   rendered by `tools/picnic-scene` (`basket`, `bowl`, `soupPot`,
   `blender`) in the same clay as everything else. */

/** What a Shop fills. */
export const CONTAINERS: Record<Container, StaticImageData> = { basket, bowl, pot };

/** What a Make fills, empty, and where what goes in lies in that picture —
    the jar's inside, the pot's mouth (% of the picture, measured off the
    renders: where the full one differs from the empty one). */
export const MAKERS: Record<Maker, { empty: StaticImageData; inside: SceneRect }> = {
  blender: { empty: blender, inside: [11, 21, 44, 45] },
  pot: { empty: pot, inside: [8.4, 10.6, 68.8, 44.8] },
};
