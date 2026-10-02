import type { Scene } from "@/types/course";
import fruitsGround from "../../public/assets/learn/nova/fruits/find/fruits/ground.jpg";
import fruits_apple1 from "../../public/assets/learn/nova/fruits/find/fruits/apple1.png";
import fruits_banana1 from "../../public/assets/learn/nova/fruits/find/fruits/banana1.png";
import fruits_orange1 from "../../public/assets/learn/nova/fruits/find/fruits/orange1.png";
import fruits_grapes1 from "../../public/assets/learn/nova/fruits/find/fruits/grapes1.png";
import fruits_orange2 from "../../public/assets/learn/nova/fruits/find/fruits/orange2.png";
import fruits_grapes2 from "../../public/assets/learn/nova/fruits/find/fruits/grapes2.png";
import fruits_apple2 from "../../public/assets/learn/nova/fruits/find/fruits/apple2.png";
import fruits_banana2 from "../../public/assets/learn/nova/fruits/find/fruits/banana2.png";
import fruits_banana3 from "../../public/assets/learn/nova/fruits/find/fruits/banana3.png";
import fruits_apple3 from "../../public/assets/learn/nova/fruits/find/fruits/apple3.png";
import fruits_grapes3 from "../../public/assets/learn/nova/fruits/find/fruits/grapes3.png";
import fruits_orange3 from "../../public/assets/learn/nova/fruits/find/fruits/orange3.png";
import veggiesGround from "../../public/assets/learn/nova/fruits/find/veggies/ground.jpg";
import veggies_carrot1 from "../../public/assets/learn/nova/fruits/find/veggies/carrot1.png";
import veggies_broccoli1 from "../../public/assets/learn/nova/fruits/find/veggies/broccoli1.png";
import veggies_corn1 from "../../public/assets/learn/nova/fruits/find/veggies/corn1.png";
import veggies_potato1 from "../../public/assets/learn/nova/fruits/find/veggies/potato1.png";
import veggies_corn2 from "../../public/assets/learn/nova/fruits/find/veggies/corn2.png";
import veggies_potato2 from "../../public/assets/learn/nova/fruits/find/veggies/potato2.png";
import veggies_carrot2 from "../../public/assets/learn/nova/fruits/find/veggies/carrot2.png";
import veggies_broccoli2 from "../../public/assets/learn/nova/fruits/find/veggies/broccoli2.png";
import veggies_broccoli3 from "../../public/assets/learn/nova/fruits/find/veggies/broccoli3.png";
import veggies_carrot3 from "../../public/assets/learn/nova/fruits/find/veggies/carrot3.png";
import veggies_potato3 from "../../public/assets/learn/nova/fruits/find/veggies/potato3.png";
import veggies_corn3 from "../../public/assets/learn/nova/fruits/find/veggies/corn3.png";
import seasonsGround from "../../public/assets/learn/nova/seasons/find/seasons/ground.jpg";
import seasons_flower1 from "../../public/assets/learn/nova/seasons/find/seasons/flower1.png";
import seasons_icecream1 from "../../public/assets/learn/nova/seasons/find/seasons/icecream1.png";
import seasons_orangeleaf1 from "../../public/assets/learn/nova/seasons/find/seasons/orangeleaf1.png";
import seasons_snowman1 from "../../public/assets/learn/nova/seasons/find/seasons/snowman1.png";
import seasons_orangeleaf2 from "../../public/assets/learn/nova/seasons/find/seasons/orangeleaf2.png";
import seasons_snowman2 from "../../public/assets/learn/nova/seasons/find/seasons/snowman2.png";
import seasons_flower2 from "../../public/assets/learn/nova/seasons/find/seasons/flower2.png";
import seasons_icecream2 from "../../public/assets/learn/nova/seasons/find/seasons/icecream2.png";
import seasons_icecream3 from "../../public/assets/learn/nova/seasons/find/seasons/icecream3.png";
import seasons_flower3 from "../../public/assets/learn/nova/seasons/find/seasons/flower3.png";
import seasons_snowman3 from "../../public/assets/learn/nova/seasons/find/seasons/snowman3.png";
import seasons_orangeleaf3 from "../../public/assets/learn/nova/seasons/find/seasons/orangeleaf3.png";

/* Nova's Find scenes — rendered by `tools/picnic-scene` (`render.cjs
   fruits|veggies|seasons` → `crop.py`), the same grass, light and clay as
   Pinki's picnics. Each thing's `word` is what a Find for one kind matches
   (every apple); its `group` is what a Sort box or a season's Find takes. */

/** Three each of apple, banana, orange and grapes, in a 4x3 grid on a blanket. */
export const fruitPicnic: Scene = {
  background: fruitsGround,
  items: [
    { id: "apple1", src: fruits_apple1, word: "apple", shape: null, group: "fruit", box: [9.4, 24.16, 17.8, 13.04], hit: [10.0, 25.52, 14.3, 11.2] },
    { id: "banana1", src: fruits_banana1, word: "banana", shape: null, group: "fruit", box: [30.1, 22.16, 19.7, 9.92], hit: [30.7, 23.6, 15.3, 8.0] },
    { id: "orange1", src: fruits_orange1, word: "orange", shape: null, group: "fruit", box: [53.1, 25.36, 14.1, 10.24], hit: [53.7, 26.8, 10.4, 8.32] },
    { id: "grapes1", src: fruits_grapes1, word: "grapes", shape: null, group: "fruit", box: [72.7, 19.36, 15.6, 13.84], hit: [73.3, 20.24, 12.7, 12.48] },
    { id: "orange2", src: fruits_orange2, word: "orange", shape: null, group: "fruit", box: [14.8, 43.28, 14.1, 10.16], hit: [15.4, 44.64, 10.4, 8.32] },
    { id: "grapes2", src: fruits_grapes2, word: "grapes", shape: null, group: "fruit", box: [35.1, 35.68, 15.6, 14.8], hit: [35.7, 37.12, 11.1, 12.88] },
    { id: "apple2", src: fruits_apple2, word: "apple", shape: null, group: "fruit", box: [54.6, 42.0, 17.9, 13.04], hit: [55.2, 43.28, 14.3, 11.28] },
    { id: "banana2", src: fruits_banana2, word: "banana", shape: null, group: "fruit", box: [75.6, 41.76, 16.4, 7.92], hit: [76.2, 43.04, 14.6, 6.16] },
    { id: "banana3", src: fruits_banana3, word: "banana", shape: null, group: "fruit", box: [9.1, 58.32, 19.6, 9.6], hit: [9.7, 59.6, 15.8, 7.84] },
    { id: "apple3", src: fruits_apple3, word: "apple", shape: null, group: "fruit", box: [30.2, 59.84, 17.8, 13.04], hit: [30.8, 61.12, 14.3, 11.28] },
    { id: "grapes3", src: fruits_grapes3, word: "grapes", shape: null, group: "fruit", box: [52.0, 54.8, 15.7, 14.0], hit: [52.6, 55.84, 12.5, 12.48] },
    { id: "orange3", src: fruits_orange3, word: "orange", shape: null, group: "fruit", box: [73.9, 61.12, 14.1, 10.16], hit: [74.5, 62.48, 10.4, 8.32] },
  ],
};

/** Three each of carrot, broccoli, corn and potato, in a 4x3 grid on a blanket. */
export const vegetablePicnic: Scene = {
  background: veggiesGround,
  items: [
    { id: "carrot1", src: veggies_carrot1, word: "carrot", shape: null, group: "vegetable", box: [0.0, 30.16, 19.1, 6.72], hit: [0.0, 31.04, 17.3, 5.36] },
    { id: "broccoli1", src: veggies_broccoli1, word: "broccoli", shape: null, group: "vegetable", box: [24.5, 23.2, 17.6, 9.76], hit: [25.1, 24.48, 13.7, 8.0] },
    { id: "corn1", src: veggies_corn1, word: "corn", shape: null, group: "vegetable", box: [46.0, 29.04, 16.4, 9.68], hit: [46.6, 30.32, 13.0, 7.92] },
    { id: "potato1", src: veggies_potato1, word: "potato", shape: null, group: "vegetable", box: [71.3, 25.92, 18.3, 10.0], hit: [71.9, 27.12, 15.0, 8.32] },
    { id: "corn2", src: veggies_corn2, word: "corn", shape: null, group: "vegetable", box: [6.4, 46.24, 17.4, 8.48], hit: [7.0, 47.44, 14.0, 6.8] },
    { id: "potato2", src: veggies_potato2, word: "potato", shape: null, group: "vegetable", box: [33.7, 43.52, 16.9, 10.64], hit: [34.3, 44.72, 13.6, 8.96] },
    { id: "carrot2", src: veggies_carrot2, word: "carrot", shape: null, group: "vegetable", box: [40.5, 46.96, 23.8, 6.24], hit: [41.1, 47.92, 21.3, 4.8] },
    { id: "broccoli2", src: veggies_broccoli2, word: "broccoli", shape: null, group: "vegetable", box: [70.3, 45.92, 17.1, 10.0], hit: [70.9, 47.2, 13.2, 8.24] },
    { id: "broccoli3", src: veggies_broccoli3, word: "broccoli", shape: null, group: "vegetable", box: [3.5, 59.44, 17.7, 9.84], hit: [4.1, 60.64, 13.7, 8.16] },
    { id: "carrot3", src: veggies_carrot3, word: "carrot", shape: null, group: "vegetable", box: [18.1, 66.0, 21.9, 9.04], hit: [18.7, 66.88, 19.4, 7.68] },
    { id: "potato3", src: veggies_potato3, word: "potato", shape: null, group: "vegetable", box: [50.5, 61.6, 18.2, 10.0], hit: [51.1, 62.8, 14.9, 8.32] },
    { id: "corn3", src: veggies_corn3, word: "corn", shape: null, group: "vegetable", box: [65.3, 63.84, 17.5, 8.32], hit: [65.9, 65.04, 14.1, 6.64] },
  ],
};

/** Three things for each season: flowers (spring), ice creams (summer), orange leaves (fall), snowmen (winter), in a 4x3 grid on a blanket. */
export const seasonPicnic: Scene = {
  background: seasonsGround,
  items: [
    { id: "flower1", src: seasons_flower1, word: "flower", shape: null, group: "spring", box: [10.2, 26.56, 14.4, 10.88], hit: [10.8, 27.12, 12.8, 9.76] },
    { id: "icecream1", src: seasons_icecream1, word: "ice cream", shape: null, group: "summer", box: [22.8, 23.76, 17.9, 8.56], hit: [23.4, 24.96, 15.0, 6.88] },
    { id: "orangeleaf1", src: seasons_orangeleaf1, word: "leaf", shape: null, group: "fall", box: [53.1, 25.68, 12.4, 12.72], hit: [53.7, 26.24, 10.8, 11.68] },
    { id: "snowman1", src: seasons_snowman1, word: "snowman", shape: null, group: "winter", box: [69.2, 20.48, 28.6, 15.76], hit: [69.8, 23.92, 19.8, 11.84] },
    { id: "orangeleaf2", src: seasons_orangeleaf2, word: "leaf", shape: null, group: "fall", box: [16.0, 42.72, 10.3, 14.24], hit: [16.6, 43.28, 8.7, 13.2] },
    { id: "snowman2", src: seasons_snowman2, word: "snowman", shape: null, group: "winter", box: [32.2, 38.32, 25.9, 15.76], hit: [32.8, 41.44, 17.2, 12.16] },
    { id: "flower2", src: seasons_flower2, word: "flower", shape: null, group: "spring", box: [55.2, 44.64, 14.6, 10.4], hit: [55.8, 45.2, 13.1, 9.28] },
    { id: "icecream2", src: seasons_icecream2, word: "ice cream", shape: null, group: "summer", box: [68.6, 47.76, 17.2, 8.8], hit: [69.2, 48.8, 14.3, 7.28] },
    { id: "icecream3", src: seasons_icecream3, word: "ice cream", shape: null, group: "summer", box: [1.5, 60.24, 18.4, 8.48], hit: [2.1, 61.36, 15.5, 6.88] },
    { id: "flower3", src: seasons_flower3, word: "flower", shape: null, group: "spring", box: [31.3, 62.16, 13.7, 11.04], hit: [31.9, 62.72, 12.1, 9.92] },
    { id: "snowman3", src: seasons_snowman3, word: "snowman", shape: null, group: "winter", box: [48.5, 56.08, 28.4, 15.84], hit: [49.1, 59.6, 19.6, 11.84] },
    { id: "orangeleaf3", src: seasons_orangeleaf3, word: "leaf", shape: null, group: "fall", box: [75.2, 60.48, 10.0, 14.48], hit: [75.8, 61.04, 8.4, 13.44] },
  ],
};
