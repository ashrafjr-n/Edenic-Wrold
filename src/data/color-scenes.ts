import type { Scene } from "@/types/course";
import redGround from "../../public/assets/learn/pinki/colors/find/red/ground.jpg";
import red_apple from "../../public/assets/learn/pinki/colors/find/red/apple.png";
import red_ladybug from "../../public/assets/learn/pinki/colors/find/red/ladybug.png";
import red_cherries from "../../public/assets/learn/pinki/colors/find/red/cherries.png";
import red_strawberry from "../../public/assets/learn/pinki/colors/find/red/strawberry.png";
import red_fish from "../../public/assets/learn/pinki/colors/find/red/fish.png";
import red_banana from "../../public/assets/learn/pinki/colors/find/red/banana.png";
import red_pear from "../../public/assets/learn/pinki/colors/find/red/pear.png";
import yellowGround from "../../public/assets/learn/pinki/colors/find/yellow/ground.jpg";
import yellow_banana from "../../public/assets/learn/pinki/colors/find/yellow/banana.png";
import yellow_star from "../../public/assets/learn/pinki/colors/find/yellow/star.png";
import yellow_lemon from "../../public/assets/learn/pinki/colors/find/yellow/lemon.png";
import yellow_cheese from "../../public/assets/learn/pinki/colors/find/yellow/cheese.png";
import yellow_frog from "../../public/assets/learn/pinki/colors/find/yellow/frog.png";
import yellow_apple from "../../public/assets/learn/pinki/colors/find/yellow/apple.png";
import yellow_fish from "../../public/assets/learn/pinki/colors/find/yellow/fish.png";
import purpleGround from "../../public/assets/learn/pinki/colors/find/purple/ground.jpg";
import purple_grapes from "../../public/assets/learn/pinki/colors/find/purple/grapes.png";
import purple_gift from "../../public/assets/learn/pinki/colors/find/purple/gift.png";
import purple_eggplant from "../../public/assets/learn/pinki/colors/find/purple/eggplant.png";
import purple_book from "../../public/assets/learn/pinki/colors/find/purple/book.png";
import purple_orange from "../../public/assets/learn/pinki/colors/find/purple/orange.png";
import purple_carrot from "../../public/assets/learn/pinki/colors/find/purple/carrot.png";
import purple_strawberry from "../../public/assets/learn/pinki/colors/find/purple/strawberry.png";
import pinkGround from "../../public/assets/learn/pinki/colors/find/pink/ground.jpg";
import pink_donut from "../../public/assets/learn/pinki/colors/find/pink/donut.png";
import pink_flower from "../../public/assets/learn/pinki/colors/find/pink/flower.png";
import pink_cupcake from "../../public/assets/learn/pinki/colors/find/pink/cupcake.png";
import pink_icecream from "../../public/assets/learn/pinki/colors/find/pink/icecream.png";
import pink_cookie from "../../public/assets/learn/pinki/colors/find/pink/cookie.png";
import pink_teddy from "../../public/assets/learn/pinki/colors/find/pink/teddy.png";
import pink_lemon from "../../public/assets/learn/pinki/colors/find/pink/lemon.png";
import whiteGround from "../../public/assets/learn/pinki/colors/find/white/ground.jpg";
import white_egg from "../../public/assets/learn/pinki/colors/find/white/egg.png";
import white_sheep from "../../public/assets/learn/pinki/colors/find/white/sheep.png";
import white_milk from "../../public/assets/learn/pinki/colors/find/white/milk.png";
import white_dice from "../../public/assets/learn/pinki/colors/find/white/dice.png";
import white_hat from "../../public/assets/learn/pinki/colors/find/white/hat.png";
import white_chocolate from "../../public/assets/learn/pinki/colors/find/white/chocolate.png";
import white_apple from "../../public/assets/learn/pinki/colors/find/white/apple.png";

/* Pinki's Colors picnics, one per lesson: four things of the lesson's color
   among a few of other colors. Rendered by `tools/picnic-scene`
   (`render.cjs <name>` then `crop.py <name> public/assets/learn/pinki/colors/find`);
   the boxes are what `crop.py` printed, as % of the 4:5 scene. */

/** The reds' picnic: a cream blanket with a sky-blue gingham. */
export const redThings: Scene = {
  background: redGround,
  items: [
    { id: "apple", src: red_apple, word: "apple", shape: null, color: "red", box: [17.3, 25.28, 23.2, 16.96], hit: [17.9, 26.88, 18.8, 14.88] },
    { id: "ladybug", src: red_ladybug, word: "ladybug", shape: null, color: "red", box: [64.4, 28.16, 20.4, 12.88], hit: [65.0, 29.12, 17.7, 11.44] },
    { id: "cherries", src: red_cherries, word: "cherries", shape: null, color: "red", box: [62.6, 48.16, 19.8, 16.56], hit: [63.2, 49.28, 16.5, 14.96] },
    { id: "strawberry", src: red_strawberry, word: "strawberry", shape: null, color: "red", box: [5.4, 80.8, 19.4, 13.52], hit: [6.0, 82.48, 14.7, 11.36] },
    { id: "fish", src: red_fish, word: "fish", shape: null, color: "blue", box: [35.3, 37.76, 27.4, 13.44], hit: [35.9, 39.04, 22.8, 11.68] },
    { id: "banana", src: red_banana, word: "banana", shape: null, color: "yellow", box: [72.9, 77.44, 23.5, 10.4], hit: [73.5, 78.16, 21.2, 9.2] },
    { id: "pear", src: red_pear, word: "pear", shape: null, color: "green", box: [31.9, 5.84, 18.0, 14.24], hit: [32.5, 7.68, 13.4, 11.92] },
  ],
};

/** The yellows' picnic: the blue striped blanket. */
export const yellowThings: Scene = {
  background: yellowGround,
  items: [
    { id: "banana", src: yellow_banana, word: "banana", shape: null, color: "yellow", box: [15.6, 24.64, 25.7, 11.04], hit: [16.2, 25.44, 23.4, 9.76] },
    { id: "star", src: yellow_star, word: "star", shape: null, color: "yellow", box: [59.6, 24.8, 26.5, 20.48], hit: [60.2, 25.76, 23.8, 18.96] },
    { id: "lemon", src: yellow_lemon, word: "lemon", shape: null, color: "yellow", box: [61.7, 56.72, 24.4, 12.4], hit: [62.3, 58.24, 20.7, 10.4] },
    { id: "cheese", src: yellow_cheese, word: "cheese", shape: null, color: "yellow", box: [2.8, 82.72, 30.4, 15.44], hit: [3.4, 83.68, 27.6, 14.0] },
    { id: "frog", src: yellow_frog, word: "frog", shape: null, color: "green", box: [41.0, 43.36, 19.2, 14.08], hit: [41.6, 44.64, 16.4, 12.24] },
    { id: "apple", src: yellow_apple, word: "apple", shape: null, color: "red", box: [74.6, 78.0, 20.8, 15.2], hit: [75.2, 79.44, 16.8, 13.28] },
    { id: "fish", src: yellow_fish, word: "fish", shape: null, color: "blue", box: [27.3, 0.0, 23.1, 10.08], hit: [27.9, 0.56, 20.5, 9.04] },
  ],
};

/** The purples' picnic: the mint blanket. */
export const purpleThings: Scene = {
  background: purpleGround,
  items: [
    { id: "grapes", src: purple_grapes, word: "grapes", shape: null, color: "purple", box: [18.6, 19.28, 19.5, 17.36], hit: [19.2, 20.32, 16.5, 15.84] },
    { id: "gift", src: purple_gift, word: "gift", shape: null, color: "purple", box: [62.6, 24.16, 23.8, 18.48], hit: [63.2, 25.84, 18.9, 16.32] },
    { id: "eggplant", src: purple_eggplant, word: "eggplant", shape: null, color: "purple", box: [51.6, 53.12, 25.5, 13.6], hit: [52.2, 54.48, 21.6, 11.76] },
    { id: "book", src: purple_book, word: "book", shape: null, color: "purple", box: [5.8, 76.16, 24.2, 21.04], hit: [6.4, 77.04, 21.5, 19.68] },
    { id: "orange", src: purple_orange, word: "orange", shape: null, color: "orange", box: [42.3, 41.6, 18.8, 13.44], hit: [42.9, 43.28, 14.2, 11.28] },
    { id: "carrot", src: purple_carrot, word: "carrot", shape: null, color: "orange", box: [64.4, 85.6, 21.2, 9.6], hit: [65.0, 86.4, 18.8, 8.32] },
    { id: "strawberry", src: purple_strawberry, word: "strawberry", shape: null, color: "red", box: [31.9, 7.6, 16.2, 11.84], hit: [32.5, 8.96, 12.1, 10.0] },
  ],
};

/** The pinks' picnic: the round yellow blanket. */
export const pinkThings: Scene = {
  background: pinkGround,
  items: [
    { id: "donut", src: pink_donut, word: "donut", shape: null, color: "pink", box: [19.3, 25.92, 25.3, 18.96], hit: [19.9, 26.96, 22.7, 17.44] },
    { id: "flower", src: pink_flower, word: "flower", shape: null, color: "pink", box: [59.5, 30.16, 19.0, 12.96], hit: [60.1, 30.72, 17.3, 11.92] },
    { id: "cupcake", src: pink_cupcake, word: "cupcake", shape: null, color: "pink", box: [62.5, 55.52, 18.7, 13.04], hit: [63.1, 56.96, 14.4, 11.12] },
    { id: "icecream", src: pink_icecream, word: "ice cream", shape: null, color: "pink", box: [0.0, 84.56, 20.5, 11.04], hit: [0.0, 85.76, 17.7, 9.36] },
    { id: "cookie", src: pink_cookie, word: "cookie", shape: null, color: "brown", box: [17.0, 55.2, 24.4, 18.56], hit: [17.6, 56.0, 22.6, 17.12] },
    { id: "teddy", src: pink_teddy, word: "teddy", shape: null, color: "brown", box: [73.0, 67.84, 21.0, 18.32], hit: [73.6, 69.04, 16.9, 16.64] },
    { id: "lemon", src: pink_lemon, word: "lemon", shape: null, color: "yellow", box: [30.3, 2.96, 23.0, 11.84], hit: [30.9, 4.4, 19.5, 9.92] },
  ],
};

/** The whites' picnic: a plain lilac blanket, so white things show. */
export const whiteThings: Scene = {
  background: whiteGround,
  items: [
    { id: "egg", src: white_egg, word: "egg", shape: null, color: "white", box: [12.6, 28.08, 20.5, 14.32], hit: [13.2, 29.84, 15.4, 12.08] },
    { id: "sheep", src: white_sheep, word: "sheep", shape: null, color: "white", box: [63.3, 26.48, 24.7, 12.8], hit: [63.9, 28.08, 19.3, 10.72] },
    { id: "milk", src: white_milk, word: "milk", shape: null, color: "white", box: [57.1, 56.32, 20.8, 11.36], hit: [57.7, 57.6, 16.9, 9.6] },
    { id: "dice", src: white_dice, word: "dice", shape: null, color: "white", box: [9.0, 77.2, 20.7, 16.0], hit: [9.6, 79.04, 15.1, 13.68] },
    { id: "hat", src: white_hat, word: "hat", shape: null, color: "black", box: [36.7, 40.0, 23.8, 17.52], hit: [37.3, 42.24, 17.3, 14.8] },
    { id: "chocolate", src: white_chocolate, word: "chocolate", shape: null, color: "brown", box: [72.0, 75.6, 23.3, 23.28], hit: [72.6, 76.32, 21.2, 22.0] },
    { id: "apple", src: white_apple, word: "apple", shape: null, color: "red", box: [31.6, 1.28, 20.9, 15.28], hit: [32.2, 2.8, 16.8, 13.28] },
  ],
};
