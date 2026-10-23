import type { StaticImageData } from "next/image";
import type { SceneRect } from "@/types/course";
import pot from "../../public/assets/learn/nova/fruits/props/pot.png";

/* Nova's market — the things her Vegetables course happens in, rendered
   by `tools/picnic-scene` (`soupPot`) in the same clay as everything
   else. (Her cup went with the cups game to /play, 2026-10-23.) */

/** What a Make fills — Nova's soup pot — empty, and where what goes in
    lies in that picture: its mouth (% of the picture, measured off the
    renders: where the full one differs from the empty one). Her blender
    went with the fruits (2026-10-12). */
export const POT: { empty: StaticImageData; inside: SceneRect } = { empty: pot, inside: [8.4, 10.6, 68.8, 44.8] };
