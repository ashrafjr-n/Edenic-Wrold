import type { Basket, Garden } from "@/types/course";
import basket from "../../public/assets/learn/nova/fruits/garden/basket.png";
import basketRim from "../../public/assets/learn/nova/fruits/garden/basket-rim.png";
import vegetablesGround from "../../public/assets/learn/nova/fruits/garden/vegetables/ground.jpg";
import vegetablesFront from "../../public/assets/learn/nova/fruits/garden/vegetables/front.png";
import vegetablesCarrot from "../../public/assets/learn/nova/fruits/garden/vegetables/carrot.png";
import vegetablesTomato from "../../public/assets/learn/nova/fruits/garden/vegetables/tomato.png";
import vegetablesPotato from "../../public/assets/learn/nova/fruits/garden/vegetables/potato.png";

/* Nova's garden — where the Fruits review's exams are picked: three plants
   side by side, one render each (`tools/picnic-scene`, `render.cjs harvest
   <garden>`, then `crop.py harvest-<garden>`, whose numbers these are): a
   carrot bed, a tomato plant and a potato bed (the fruits' garden went
   with the fruits, 2026-10-12). Beside it, the basket (`render.cjs
   basket`, then `crop.py basket`). */

const BASKET: Basket = { src: basket, rim: basketRim, mouth: [3.66, 25.5, 92.69, 46.03] };

export const GARDENS = {
  vegetables: {
    ground: vegetablesGround,
    foods: { carrot: vegetablesCarrot, tomato: vegetablesTomato, potato: vegetablesPotato },
    items: [{ food: "carrot", box: [2.58, 61.16, 7.58, 25.65], hit: [3.08, 62.03, 6.58, 17.1], tilt: 0 }, { food: "carrot", box: [10.08, 61.16, 7.5, 25.65], hit: [10.58, 62.03, 6.5, 17.1], tilt: 0 }, { food: "carrot", box: [17.5, 61.16, 7.58, 25.65], hit: [18.0, 62.03, 6.58, 17.1], tilt: 0 }, { food: "carrot", box: [24.92, 61.16, 7.58, 25.65], hit: [25.42, 62.03, 6.58, 17.1], tilt: 0 }, { food: "tomato", box: [40.92, 58.99, 6.58, 11.16], hit: [41.42, 59.86, 5.58, 9.42], tilt: -6 }, { food: "tomato", box: [52.08, 61.45, 6.58, 11.16], hit: [52.58, 62.32, 5.58, 9.42], tilt: 5 }, { food: "tomato", box: [42.5, 71.59, 6.58, 11.16], hit: [43.0, 72.46, 5.58, 9.42], tilt: 7 }, { food: "tomato", box: [52.33, 73.62, 6.58, 11.16], hit: [52.83, 74.49, 5.58, 9.42], tilt: -4 }, { food: "potato", box: [66.75, 62.03, 11.25, 18.99], hit: [67.25, 62.9, 10.25, 16.23], tilt: 0 }, { food: "potato", box: [76.92, 62.03, 11.25, 18.99], hit: [77.42, 62.9, 10.25, 16.23], tilt: 0 }, { food: "potato", box: [87.0, 62.03, 11.25, 18.99], hit: [87.5, 62.9, 10.25, 16.23], tilt: 0 }],
    front: { src: vegetablesFront, box: [1.0, 77.39, 98.0, 15.51] },
    basket: BASKET,
  },
} satisfies Record<string, Garden>;
