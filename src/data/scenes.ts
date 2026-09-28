import type { Scene } from "@/types/course";
import picnicGround from "../../public/assets/learn/pinki/shapes/find/picnic.jpg";
import plate from "../../public/assets/learn/pinki/shapes/find/plate.png";
import donut from "../../public/assets/learn/pinki/shapes/find/donut.png";
import cookie from "../../public/assets/learn/pinki/shapes/find/cookie.png";
import ball from "../../public/assets/learn/pinki/shapes/find/ball.png";
import toast from "../../public/assets/learn/pinki/shapes/find/toast.png";
import cheese from "../../public/assets/learn/pinki/shapes/find/cheese.png";
import book from "../../public/assets/learn/pinki/shapes/find/book.png";
import kite from "../../public/assets/learn/pinki/shapes/find/kite.png";

import squaresGround from "../../public/assets/learn/pinki/shapes/find/squares/ground.jpg";
import squares_toast from "../../public/assets/learn/pinki/shapes/find/squares/toast.png";
import squares_gift from "../../public/assets/learn/pinki/shapes/find/squares/gift.png";
import squares_cracker from "../../public/assets/learn/pinki/shapes/find/squares/cracker.png";
import squares_dice from "../../public/assets/learn/pinki/shapes/find/squares/dice.png";
import squares_donut from "../../public/assets/learn/pinki/shapes/find/squares/donut.png";
import squares_cheese from "../../public/assets/learn/pinki/shapes/find/squares/cheese.png";
import squares_orange from "../../public/assets/learn/pinki/shapes/find/squares/orange.png";
import trianglesGround from "../../public/assets/learn/pinki/shapes/find/triangles/ground.jpg";
import triangles_cheese from "../../public/assets/learn/pinki/shapes/find/triangles/cheese.png";
import triangles_pizza from "../../public/assets/learn/pinki/shapes/find/triangles/pizza.png";
import triangles_sandwich from "../../public/assets/learn/pinki/shapes/find/triangles/sandwich.png";
import triangles_flag from "../../public/assets/learn/pinki/shapes/find/triangles/flag.png";
import triangles_cookie from "../../public/assets/learn/pinki/shapes/find/triangles/cookie.png";
import triangles_toast from "../../public/assets/learn/pinki/shapes/find/triangles/toast.png";
import triangles_book from "../../public/assets/learn/pinki/shapes/find/triangles/book.png";
import rectanglesGround from "../../public/assets/learn/pinki/shapes/find/rectangles/ground.jpg";
import rectangles_book from "../../public/assets/learn/pinki/shapes/find/rectangles/book.png";
import rectangles_chocolate from "../../public/assets/learn/pinki/shapes/find/rectangles/chocolate.png";
import rectangles_juice from "../../public/assets/learn/pinki/shapes/find/rectangles/juice.png";
import rectangles_ruler from "../../public/assets/learn/pinki/shapes/find/rectangles/ruler.png";
import rectangles_plate from "../../public/assets/learn/pinki/shapes/find/rectangles/plate.png";
import rectangles_cheese from "../../public/assets/learn/pinki/shapes/find/rectangles/cheese.png";
import rectangles_donut from "../../public/assets/learn/pinki/shapes/find/rectangles/donut.png";
/* Pinki's picnics, one per shape lesson: a blanket on the grass, seen
   almost from above so a circle stays a circle. Each is rendered by
   `tools/picnic-scene` (`render.cjs <name>` then `crop.py <name>`); the boxes
   are what `crop.py` printed, as % of the 4:5 scene. Every scene has four
   things of its shape and a few clearly different ones. */

/** The circles' picnic: a pink striped blanket. */
export const picnic: Scene = {
  background: picnicGround,
  items: [
    { id: "plate", src: plate, word: "plate", shape: "circle", box: [11.6, 22.08, 34.3, 25.6], hit: [12.2, 22.88, 31.9, 24.32] },
    { id: "donut", src: donut, word: "donut", shape: "circle", box: [60.1, 24.16, 26.6, 19.92], hit: [60.7, 25.28, 23.9, 18.32] },
    { id: "cookie", src: cookie, word: "cookie", shape: "circle", box: [60.8, 55.2, 24.4, 18.48], hit: [61.4, 56.0, 22.5, 17.12] },
    { id: "ball", src: ball, word: "ball", shape: "circle", box: [69.4, 73.12, 29.3, 21.04], hit: [70.0, 75.6, 22.5, 18.08] },
    { id: "toast", src: toast, word: "toast", shape: "square", box: [15.2, 54.8, 25.2, 19.04], hit: [15.8, 55.6, 23.0, 17.68] },
    { id: "cheese", src: cheese, word: "cheese", shape: "triangle", box: [36.8, 39.76, 21.8, 20.16], hit: [37.4, 40.72, 19.1, 18.64] },
    { id: "book", src: book, word: "book", shape: "rectangle", box: [5.5, 74.16, 28.2, 24.72], hit: [6.1, 75.2, 25.3, 23.12] },
    { id: "kite", src: kite, word: "kite", shape: null, box: [28.6, 4.24, 39.3, 13.44], hit: [29.2, 4.8, 38.1, 12.4] },
  ],
};

/** The squares' picnic: a mint blanket with cream bands. */
export const squares: Scene = {
  background: squaresGround,
  items: [
    { id: "toast", src: squares_toast, word: "toast", shape: "square", box: [14.7, 25.92, 24.6, 18.56], hit: [15.3, 26.72, 22.5, 17.28] },
    { id: "gift", src: squares_gift, word: "gift", shape: "square", box: [62.9, 23.68, 24.9, 19.36], hit: [63.5, 25.36, 19.9, 17.2] },
    { id: "cracker", src: squares_cracker, word: "cracker", shape: "square", box: [61.8, 55.52, 22.3, 16.96], hit: [62.4, 56.16, 20.5, 15.84] },
    { id: "dice", src: squares_dice, word: "dice", shape: "square", box: [6.7, 77.76, 20.7, 16.08], hit: [7.3, 79.68, 15.1, 13.68] },
    { id: "donut", src: squares_donut, word: "donut", shape: "circle", box: [15.6, 53.92, 26.6, 19.84], hit: [16.2, 54.96, 23.8, 18.32] },
    { id: "cheese", src: squares_cheese, word: "cheese", shape: "triangle", box: [37.0, 46.64, 29.1, 13.84], hit: [37.6, 47.6, 26.4, 12.4] },
    { id: "orange", src: squares_orange, word: "orange", shape: "circle", box: [76.7, 78.0, 20.7, 14.88], hit: [77.3, 79.84, 15.7, 12.56] },
  ],
};

/** The triangles' picnic: a sky-blue striped blanket. */
export const triangles: Scene = {
  background: trianglesGround,
  items: [
    { id: "cheese", src: triangles_cheese, word: "cheese", shape: "triangle", box: [14.7, 28.16, 27.2, 16.88], hit: [15.3, 29.12, 24.4, 15.36] },
    { id: "pizza", src: triangles_pizza, word: "pizza", shape: "triangle", box: [59.0, 24.8, 24.5, 20.96], hit: [59.6, 25.52, 22.5, 19.68] },
    { id: "sandwich", src: triangles_sandwich, word: "sandwich", shape: "triangle", box: [12.2, 50.32, 24.5, 25.92], hit: [12.8, 51.84, 20.0, 23.84] },
    { id: "flag", src: triangles_flag, word: "flag", shape: "triangle", box: [61.3, 3.28, 20.7, 17.92], hit: [61.9, 3.84, 19.1, 16.88] },
    { id: "cookie", src: triangles_cookie, word: "cookie", shape: "circle", box: [60.8, 55.2, 24.4, 18.48], hit: [61.4, 56.0, 22.5, 17.12] },
    { id: "toast", src: triangles_toast, word: "toast", shape: "square", box: [39.2, 41.6, 22.4, 17.04], hit: [39.8, 42.4, 20.4, 15.76] },
    { id: "book", src: triangles_book, word: "book", shape: "rectangle", box: [2.9, 75.44, 25.5, 22.32], hit: [3.5, 76.4, 22.7, 20.88] },
  ],
};

/** The rectangles' picnic: a round sunny-yellow blanket. */
export const rectangles: Scene = {
  background: rectanglesGround,
  items: [
    { id: "book", src: rectangles_book, word: "book", shape: "rectangle", box: [18.4, 23.28, 27.4, 24.4], hit: [19.0, 24.32, 24.5, 22.88] },
    { id: "chocolate", src: rectangles_chocolate, word: "chocolate", shape: "rectangle", box: [58.0, 25.84, 23.3, 22.16], hit: [58.6, 26.48, 21.0, 21.04] },
    { id: "juice", src: rectangles_juice, word: "juice box", shape: "rectangle", box: [62.7, 51.92, 20.3, 19.84], hit: [63.3, 54.24, 14.0, 16.96] },
    { id: "ruler", src: rectangles_ruler, word: "ruler", shape: "rectangle", box: [14.8, 5.76, 30.1, 8.48], hit: [15.4, 6.32, 28.6, 7.44] },
    { id: "plate", src: rectangles_plate, word: "plate", shape: "circle", box: [14.7, 53.2, 29.4, 21.92], hit: [15.3, 54.0, 27.2, 20.64] },
    { id: "cheese", src: rectangles_cheese, word: "cheese", shape: "triangle", box: [48.6, 39.36, 17.9, 22.4], hit: [49.2, 40.24, 15.2, 20.96] },
    { id: "donut", src: rectangles_donut, word: "donut", shape: "circle", box: [72.6, 76.4, 26.6, 19.92], hit: [73.2, 77.44, 23.9, 18.4] },
  ],
};
