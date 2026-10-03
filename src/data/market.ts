import type { StaticImageData } from "next/image";
import type { Container } from "@/types/course";
import basket from "../../public/assets/learn/nova/fruits/props/basket.png";
import bowl from "../../public/assets/learn/nova/fruits/props/bowl.png";
import pot from "../../public/assets/learn/nova/fruits/props/pot.png";

/* Nova's market — the things her Fruits & Vegetables steps happen in,
   rendered by `tools/picnic-scene` (`basket`, `bowl`, `pot`) in the same
   clay as everything else. */

/** What a Shop fills. */
export const CONTAINERS: Record<Container, StaticImageData> = { basket, bowl, pot };
