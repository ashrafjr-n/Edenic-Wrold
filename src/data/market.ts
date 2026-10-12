import type { StaticImageData } from "next/image";
import type { SceneRect } from "@/types/course";
import pot from "../../public/assets/learn/nova/fruits/props/pot.png";
import cup from "../../public/assets/learn/nova/fruits/props/cup.png";

/* Nova's market — the things her Vegetables course happens in, rendered
   by `tools/picnic-scene` (`soupPot`, `cup`) in the same clay as
   everything else. */

/** Nova's cup, upside down — the lessons' cups game hides the food under
    one of three. No shadow: the table draws one that stays down when the
    cup is lifted. */
export const CUP: StaticImageData = cup;

/** What a Make fills — Nova's soup pot — empty, and where what goes in
    lies in that picture: its mouth (% of the picture, measured off the
    renders: where the full one differs from the empty one). Her blender
    went with the fruits (2026-10-12). */
export const POT: { empty: StaticImageData; inside: SceneRect } = { empty: pot, inside: [8.4, 10.6, 68.8, 44.8] };
