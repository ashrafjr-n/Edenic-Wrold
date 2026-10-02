import type { Scene } from "@/types/course";
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

/* Nova's Find scene — rendered by `tools/picnic-scene` (`render.cjs
   seasons` → `crop.py`), the same grass, light and clay as Pinki's
   picnics. Each thing's `group` (its season) is what a Sort box or a
   season's Find takes. */

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
