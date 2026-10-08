import type { Basket, Garden } from "@/types/course";
import basket from "../../public/assets/learn/nova/fruits/garden/basket.png";
import basketRim from "../../public/assets/learn/nova/fruits/garden/basket-rim.png";
import fruitsGround from "../../public/assets/learn/nova/fruits/garden/fruits/ground.jpg";
import fruitsApple from "../../public/assets/learn/nova/fruits/garden/fruits/apple.png";
import fruitsBanana from "../../public/assets/learn/nova/fruits/garden/fruits/banana.png";
import fruitsOrange from "../../public/assets/learn/nova/fruits/garden/fruits/orange.png";
import vegetablesGround from "../../public/assets/learn/nova/fruits/garden/vegetables/ground.jpg";
import vegetablesFront from "../../public/assets/learn/nova/fruits/garden/vegetables/front.png";
import vegetablesCarrot from "../../public/assets/learn/nova/fruits/garden/vegetables/carrot.png";
import vegetablesBanana from "../../public/assets/learn/nova/fruits/garden/vegetables/banana.png";
import vegetablesPotato from "../../public/assets/learn/nova/fruits/garden/vegetables/potato.png";

/* Nova's garden — where the Fruits review's exams are picked: three plants
   side by side, one render each (`tools/picnic-scene`, `render.cjs harvest
   <garden>`, then `crop.py harvest-<garden>`, whose numbers these are). An
   apple tree, a banana plant and an orange tree; and a carrot bed, the
   banana plant and a potato bed. Beside both, the one basket
   (`render.cjs basket`, then `crop.py basket`). */

const BASKET: Basket = { src: basket, rim: basketRim, mouth: [3.66, 25.5, 92.69, 46.03] };

export const GARDENS = {
  fruits: {
    ground: fruitsGround,
    foods: { apple: fruitsApple, banana: fruitsBanana, orange: fruitsOrange },
    items: [{ food: "apple", box: [5.0,  34.06,  10.83,  18.7], hit: [5.5,  34.93,  9.83,  16.96], tilt: -8 }, { food: "apple", box: [18.58,  34.93,  10.75,  18.7], hit: [19.08,  35.8,  9.75,  16.96], tilt: 6 }, { food: "apple", box: [4.83,  55.07,  10.75,  18.84], hit: [5.33,  55.94,  9.75,  17.1], tilt: 4 }, { food: "apple", box: [18.33,  54.2,  10.83,  18.84], hit: [18.83,  55.07,  9.83,  17.1], tilt: -5 }, { food: "banana", box: [37.92,  48.7,  8.83,  25.36], hit: [38.42,  49.57,  7.83,  23.62], tilt: 14 }, { food: "banana", box: [44.83,  47.1,  8.92,  25.36], hit: [45.33,  47.97,  7.92,  23.62], tilt: 0 }, { food: "banana", box: [51.83,  48.7,  8.92,  25.36], hit: [52.33,  49.57,  7.92,  23.62], tilt: -14 }, { food: "orange", box: [70.25,  32.75,  11.58,  20.43], hit: [70.75,  33.62,  10.58,  18.7], tilt: 6 }, { food: "orange", box: [83.83,  33.62,  11.5,  20.43], hit: [84.33,  34.49,  10.5,  18.7], tilt: -8 }, { food: "orange", box: [77.0,  53.19,  11.58,  20.43], hit: [77.5,  54.06,  10.58,  18.7], tilt: 4 }],
    basket: BASKET,
  },
  vegetables: {
    ground: vegetablesGround,
    foods: { carrot: vegetablesCarrot, banana: vegetablesBanana, potato: vegetablesPotato },
    items: [{ food: "carrot", box: [2.75, 54.64, 7.25, 33.33], hit: [3.25, 55.51, 6.25, 23.62], tilt: 0 }, { food: "carrot", box: [10.17, 54.64, 7.25, 33.33], hit: [10.67, 55.51, 6.25, 23.62], tilt: 0 }, { food: "carrot", box: [17.58, 54.64, 7.25, 33.33], hit: [18.08, 55.51, 6.25, 23.62], tilt: 0 }, { food: "carrot", box: [25.08, 54.64, 7.25, 33.33], hit: [25.58, 55.51, 6.25, 23.62], tilt: 0 }, { food: "banana", box: [37.58, 50.58, 8.5, 23.91], hit: [38.08, 51.45, 7.5, 22.17], tilt: 14 }, { food: "banana", box: [44.67, 49.13, 8.58, 23.91], hit: [45.17, 50.0, 7.58, 22.17], tilt: 0 }, { food: "banana", box: [51.83, 50.58, 8.5, 23.91], hit: [52.33, 51.45, 7.5, 22.17], tilt: -14 }, { food: "potato", box: [66.5, 64.64, 11.42, 19.57], hit: [67.0, 65.51, 10.42, 13.91], tilt: 0 }, { food: "potato", box: [76.58, 64.64, 11.5, 19.57], hit: [77.08, 65.51, 10.5, 13.62], tilt: 0 }, { food: "potato", box: [86.67, 64.64, 11.5, 19.57], hit: [87.17, 65.51, 10.5, 13.62], tilt: 0 }],
    front: { src: vegetablesFront, box: [1.0, 77.39, 98.0, 15.51] },
    basket: BASKET,
  },
} satisfies Record<string, Garden>;
