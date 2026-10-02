import type { StaticImageData } from "next/image";
import type { Container } from "@/types/course";
import bag from "../../public/assets/learn/nova/fruits/props/bag.png";
import board from "../../public/assets/learn/nova/fruits/props/board.png";
import basket from "../../public/assets/learn/nova/fruits/props/basket.png";
import bowl from "../../public/assets/learn/nova/fruits/props/bowl.png";
import pot from "../../public/assets/learn/nova/fruits/props/pot.png";

/* Nova's market — the things her Fruits & Vegetables steps happen in,
   rendered by `tools/picnic-scene` (`bag`, `board`, `basket`, `bowl`,
   `pot`) in the same clay as everything else. */

/** The bag a thing comes out of (What's in the bag?). */
export const MARKET_BAG: StaticImageData = bag;

/** The board a thing is cut open on, seen from above. */
export const MARKET_BOARD: StaticImageData = board;

/** What a Shop fills. */
export const CONTAINERS: Record<Container, StaticImageData> = { basket, bowl, pot };
