import type { Basket, Garden } from "@/types/course";
import basket from "../../public/assets/learn/nova/fruits/garden/basket.png";
import basketRim from "../../public/assets/learn/nova/fruits/garden/basket-rim.png";
import vegetablesGround from "../../public/assets/learn/nova/fruits/garden/vegetables/ground.jpg";
import vegetablesFront from "../../public/assets/learn/nova/fruits/garden/vegetables/front.png";
import vegetablesCarrot from "../../public/assets/learn/nova/fruits/garden/vegetables/carrot.png";
import vegetablesTomato from "../../public/assets/learn/nova/fruits/garden/vegetables/tomato.png";
import vegetablesPotato from "../../public/assets/learn/nova/fruits/garden/vegetables/potato.png";

/* Nova's pantry — where the Vegetables review's exams are picked (2026-11-06:
   it was her garden's beds before the whole course moved into her kitchen):
   three crates side by side, one render (`tools/picnic-scene`, `render.cjs
   harvest vegetables`, then `crop.py harvest-vegetables`, whose numbers these
   are): a crate of carrots, one of tomatoes, one of potatoes. Beside it, the
   basket (`render.cjs basket`, then `crop.py basket`). */

export const BASKET: Basket = { src: basket, rim: basketRim, mouth: [3.66, 25.5, 92.69, 46.03] };

export const GARDENS = {
  vegetables: {
    ground: vegetablesGround,
    foods: { carrot: vegetablesCarrot, tomato: vegetablesTomato, potato: vegetablesPotato },
    items: [{ food: "carrot", box: [3.17, 44.82, 7.92, 33.39], hit: [3.67, 45.89, 6.92, 27.5], tilt: 0 }, { food: "carrot", box: [10.33, 44.82, 7.92, 33.39], hit: [10.83, 45.89, 6.92, 27.5], tilt: 0 }, { food: "carrot", box: [17.5, 44.82, 7.83, 33.39], hit: [18.0, 45.89, 6.83, 27.5], tilt: 0 }, { food: "carrot", box: [24.67, 44.82, 7.83, 33.39], hit: [25.17, 45.89, 6.83, 27.5], tilt: 0 }, { food: "tomato", box: [38.67, 63.75, 6.92, 14.29], hit: [39.17, 64.82, 5.92, 12.14], tilt: -6 }, { food: "tomato", box: [47.25, 64.46, 6.92, 14.29], hit: [47.75, 65.54, 5.92, 11.61], tilt: 5 }, { food: "tomato", box: [54.83, 63.75, 6.83, 14.29], hit: [55.33, 64.82, 5.83, 12.14], tilt: 7 }, { food: "tomato", box: [46.67, 53.57, 6.83, 14.46], hit: [47.17, 54.64, 5.83, 12.32], tilt: -4 }, { food: "potato", box: [66.92, 59.64, 11.17, 18.39], hit: [67.67, 60.71, 9.92, 14.82], tilt: 0 }, { food: "potato", box: [76.58, 60.71, 11.17, 18.21], hit: [77.08, 61.79, 10.17, 13.75], tilt: 0 }, { food: "potato", box: [86.33, 59.64, 11.08, 18.39], hit: [86.83, 60.71, 9.75, 14.82], tilt: 0 }],
    front: { src: vegetablesFront, box: [2.33, 62.86, 95.33, 23.04] },
    basket: BASKET,
  },
} satisfies Record<string, Garden>;
