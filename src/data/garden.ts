import type { Garden } from "@/types/course";
import fruitsGround from "../../public/assets/learn/nova/fruits/garden/fruits/ground.jpg";
import fruitsFront from "../../public/assets/learn/nova/fruits/garden/fruits/front.png";
import fruitsRim from "../../public/assets/learn/nova/fruits/garden/fruits/rim.png";
import fruitsApple from "../../public/assets/learn/nova/fruits/garden/fruits/apple.png";
import fruitsBanana from "../../public/assets/learn/nova/fruits/garden/fruits/banana.png";
import fruitsOrange from "../../public/assets/learn/nova/fruits/garden/fruits/orange.png";
import vegetablesGround from "../../public/assets/learn/nova/fruits/garden/vegetables/ground.jpg";
import vegetablesFront from "../../public/assets/learn/nova/fruits/garden/vegetables/front.png";
import vegetablesRim from "../../public/assets/learn/nova/fruits/garden/vegetables/rim.png";
import vegetablesCarrot from "../../public/assets/learn/nova/fruits/garden/vegetables/carrot.png";
import vegetablesBanana from "../../public/assets/learn/nova/fruits/garden/vegetables/banana.png";
import vegetablesPotato from "../../public/assets/learn/nova/fruits/garden/vegetables/potato.png";

/* Nova's garden — where the Fruits review's exams are picked: three plants
   side by side and ONE basket, one render each (`tools/picnic-scene`,
   `render.cjs harvest <garden>`, then `crop.py harvest-<garden>`, whose
   numbers these are). An apple tree, a banana plant and an orange tree;
   and a carrot bed, the banana plant and a potato bed. */

export const GARDENS = {
  fruits: {
    ground: fruitsGround,
    foods: { apple: fruitsApple, banana: fruitsBanana, orange: fruitsOrange },
    items: [{ food: "apple", box: [4.33, 29.25, 12.17, 15.75], hit: [4.83, 30.0, 11.17, 14.25], tilt: -8 }, { food: "apple", box: [17.92, 30.0, 12.08, 15.75], hit: [18.42, 30.75, 11.08, 14.25], tilt: 6 }, { food: "apple", box: [4.17, 46.62, 12.08, 15.75], hit: [4.67, 47.38, 11.08, 14.25], tilt: 4 }, { food: "apple", box: [17.67, 45.88, 12.17, 15.75], hit: [18.17, 46.62, 11.17, 14.25], tilt: -5 }, { food: "banana", box: [37.83, 42.88, 8.33, 20.5], hit: [38.33, 43.62, 7.33, 19.0], tilt: 14 }, { food: "banana", box: [44.83, 41.5, 8.33, 20.62], hit: [45.33, 42.25, 7.33, 19.12], tilt: 0 }, { food: "banana", box: [51.75, 42.88, 8.42, 20.5], hit: [52.25, 43.62, 7.42, 19.0], tilt: -14 }, { food: "orange", box: [70.5, 27.62, 11.08, 17.5], hit: [71.0, 28.38, 10.08, 16.0], tilt: 6 }, { food: "orange", box: [84.08, 28.38, 11.0, 17.5], hit: [84.58, 29.12, 10.0, 16.0], tilt: -8 }, { food: "orange", box: [77.25, 45.25, 11.08, 17.5], hit: [77.75, 46.0, 10.08, 16.0], tilt: 4 }],
    front: { src: fruitsFront, box: [40.42, 67.0, 19.17, 25.25] },
    rim: { src: fruitsRim, box: [40.42, 67.0, 19.17, 25.25] },
    basket: [41.25, 76.96, 17.5, 6.35],
  },
  vegetables: {
    ground: vegetablesGround,
    foods: { carrot: vegetablesCarrot, banana: vegetablesBanana, potato: vegetablesPotato },
    items: [{ food: "carrot", box: [2.75, 47.25, 7.25, 28.62], hit: [3.25, 48.0, 6.25, 20.25], tilt: 0 }, { food: "carrot", box: [10.17, 47.25, 7.25, 28.62], hit: [10.67, 48.0, 6.25, 20.25], tilt: 0 }, { food: "carrot", box: [17.58, 47.25, 7.25, 28.62], hit: [18.08, 48.0, 6.25, 20.25], tilt: 0 }, { food: "carrot", box: [25.08, 47.25, 7.25, 28.62], hit: [25.58, 48.0, 6.25, 20.25], tilt: 0 }, { food: "banana", box: [37.58, 43.62, 8.5, 20.75], hit: [38.08, 44.38, 7.5, 19.25], tilt: 14 }, { food: "banana", box: [44.67, 42.38, 8.58, 20.62], hit: [45.17, 43.12, 7.58, 19.12], tilt: 0 }, { food: "banana", box: [51.83, 43.62, 8.5, 20.75], hit: [52.33, 44.38, 7.5, 19.25], tilt: -14 }, { food: "potato", box: [66.5, 55.88, 11.42, 16.75], hit: [67.0, 56.62, 10.42, 11.88], tilt: 0 }, { food: "potato", box: [76.58, 55.88, 11.5, 16.75], hit: [77.08, 56.62, 10.5, 11.62], tilt: 0 }, { food: "potato", box: [86.67, 55.88, 11.5, 16.75], hit: [87.17, 56.62, 10.5, 11.75], tilt: 0 }],
    front: { src: vegetablesFront, box: [1.0, 66.75, 98.0, 30.0] },
    rim: { src: vegetablesRim, box: [40.25, 70.88, 19.5, 25.87] },
    basket: [41.06, 79.92, 17.87, 8.28],
  },
} satisfies Record<string, Garden>;
