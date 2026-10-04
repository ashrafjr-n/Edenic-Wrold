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
    items: [{ food: "apple", box: [4.33, 33.77, 12.17, 18.41], hit: [4.83, 34.64, 11.17, 16.67], tilt: -8 }, { food: "apple", box: [17.92, 34.64, 12.08, 18.41], hit: [18.42, 35.51, 11.08, 16.67], tilt: 6 }, { food: "apple", box: [4.17, 54.06, 12.08, 18.26], hit: [4.67, 54.93, 11.08, 16.52], tilt: 4 }, { food: "apple", box: [17.67, 53.19, 12.17, 18.26], hit: [18.17, 54.06, 11.17, 16.52], tilt: -5 }, { food: "banana", box: [37.83, 49.57, 8.33, 23.91], hit: [38.33, 50.43, 7.33, 22.17], tilt: 14 }, { food: "banana", box: [44.83, 48.12, 8.33, 23.77], hit: [45.33, 48.99, 7.33, 22.03], tilt: 0 }, { food: "banana", box: [51.75, 49.57, 8.42, 23.91], hit: [52.25, 50.43, 7.42, 22.17], tilt: -14 }, { food: "orange", box: [70.5, 31.88, 11.08, 20.43], hit: [71.0, 32.75, 10.08, 18.7], tilt: 6 }, { food: "orange", box: [84.08, 32.75, 11.0, 20.43], hit: [84.58, 33.62, 10.0, 18.7], tilt: -8 }, { food: "orange", box: [77.25, 52.32, 11.08, 20.43], hit: [77.75, 53.19, 10.08, 18.7], tilt: 4 }],
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
