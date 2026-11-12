import type { Basket } from "@/types/course";
import basket from "../../public/assets/learn/nova/fruits/garden/basket.png";
import basketRim from "../../public/assets/learn/nova/fruits/garden/basket-rim.png";

/** Nova's basket (`tools/picnic-scene`: `render.cjs basket`, then `crop.py
    basket`, whose numbers these are) — the one Basket Time's demo fills. */
export const BASKET: Basket = { src: basket, rim: basketRim, mouth: [3.66, 25.5, 92.69, 46.03] };
