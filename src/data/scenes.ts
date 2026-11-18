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
import heartsGround from "../../public/assets/learn/pinki/shapes/find/hearts/ground.jpg";
import hearts_cookie from "../../public/assets/learn/pinki/shapes/find/hearts/cookie.png";
import hearts_box from "../../public/assets/learn/pinki/shapes/find/hearts/box.png";
import hearts_donut from "../../public/assets/learn/pinki/shapes/find/hearts/donut.png";
import hearts_pillow from "../../public/assets/learn/pinki/shapes/find/hearts/pillow.png";
import hearts_toast from "../../public/assets/learn/pinki/shapes/find/hearts/toast.png";
import hearts_lollipop from "../../public/assets/learn/pinki/shapes/find/hearts/lollipop.png";
import hearts_cheese from "../../public/assets/learn/pinki/shapes/find/hearts/cheese.png";
import diamondsGround from "../../public/assets/learn/pinki/shapes/find/diamonds/ground.jpg";
import diamonds_kite from "../../public/assets/learn/pinki/shapes/find/diamonds/kite.png";
import diamonds_cookie from "../../public/assets/learn/pinki/shapes/find/diamonds/cookie.png";
import diamonds_plate from "../../public/assets/learn/pinki/shapes/find/diamonds/plate.png";
import diamonds_pillow from "../../public/assets/learn/pinki/shapes/find/diamonds/pillow.png";
import diamonds_book from "../../public/assets/learn/pinki/shapes/find/diamonds/book.png";
import diamonds_sign from "../../public/assets/learn/pinki/shapes/find/diamonds/sign.png";
import diamonds_cheese from "../../public/assets/learn/pinki/shapes/find/diamonds/cheese.png";
import ovalsGround from "../../public/assets/learn/pinki/shapes/find/ovals/ground.jpg";
import ovals_egg from "../../public/assets/learn/pinki/shapes/find/ovals/egg.png";
import ovals_football from "../../public/assets/learn/pinki/shapes/find/ovals/football.png";
import ovals_cookie from "../../public/assets/learn/pinki/shapes/find/ovals/cookie.png";
import ovals_mirror from "../../public/assets/learn/pinki/shapes/find/ovals/mirror.png";
import ovals_toast from "../../public/assets/learn/pinki/shapes/find/ovals/toast.png";
import ovals_melon from "../../public/assets/learn/pinki/shapes/find/ovals/melon.png";
import ovals_pizza from "../../public/assets/learn/pinki/shapes/find/ovals/pizza.png";
/* Pinki's picnics, one per shape lesson: a blanket on the grass, seen
   almost from above so a circle stays a circle. Each is rendered by
   `tools/picnic-scene` (`render.cjs <name>` then `crop.py <name>`); the boxes
   are what `crop.py` printed, as % of the 4:5 scene. Every scene has four
   things of its shape and a few clearly different ones. */

/** The circles' picnic: a pink striped blanket. */
export const picnic: Scene = {
  background: picnicGround,
  items: [
    { id: "plate", src: plate, word: "plate", shape: "circle", box: [15.5, 9.84, 27.8, 20.72], hit: [16.1, 10.64, 25.6, 19.44] },
    { id: "donut", src: donut, word: "donut", shape: "circle", box: [59.4, 9.28, 26.6, 19.92], hit: [60.0, 10.4, 23.8, 18.32] },
    { id: "cookie", src: cookie, word: "cookie", shape: "circle", box: [60.0, 50.48, 24.4, 18.48], hit: [60.6, 51.2, 22.6, 17.2] },
    { id: "ball", src: ball, word: "ball", shape: "circle", box: [61.7, 66.4, 25.1, 18.0], hit: [62.3, 68.56, 19.2, 15.36] },
    { id: "toast", src: toast, word: "toast", shape: "square", box: [16.0, 49.44, 25.2, 19.04], hit: [16.6, 50.24, 23.0, 17.76] },
    { id: "cheese", src: cheese, word: "cheese", shape: "triangle", box: [57.9, 29.04, 21.8, 20.16], hit: [58.5, 30.0, 19.1, 18.64] },
    { id: "book", src: book, word: "book", shape: "rectangle", box: [16.9, 67.2, 25.5, 22.32], hit: [17.5, 68.16, 22.8, 20.88] },
    { id: "kite", src: kite, word: "kite", shape: "diamond", box: [20.4, 35.52, 30.3, 10.48], hit: [21.0, 36.0, 29.1, 9.52] },
  ],
};

/** The squares' picnic: a mint blanket with cream bands. */
export const squares: Scene = {
  background: squaresGround,
  items: [
    { id: "toast", src: squares_toast, word: "toast", shape: "square", box: [16.3, 11.6, 24.6, 18.64], hit: [16.9, 12.4, 22.4, 17.28] },
    { id: "gift", src: squares_gift, word: "gift", shape: "square", box: [61.3, 9.36, 25.0, 19.52], hit: [61.9, 11.04, 19.9, 17.28] },
    { id: "cracker", src: squares_cracker, word: "cracker", shape: "square", box: [61.8, 50.24, 22.3, 16.88], hit: [62.4, 50.8, 20.5, 15.84] },
    { id: "dice", src: squares_dice, word: "dice", shape: "square", box: [21.5, 68.32, 20.7, 16.08], hit: [22.1, 70.24, 15.1, 13.68] },
    { id: "donut", src: squares_donut, word: "donut", shape: "circle", box: [14.8, 48.56, 26.7, 19.84], hit: [15.4, 49.6, 23.9, 18.32] },
    { id: "cheese", src: squares_cheese, word: "cheese", shape: "triangle", box: [36.2, 37.12, 29.1, 13.92], hit: [36.8, 38.08, 26.5, 12.4] },
    { id: "orange", src: squares_orange, word: "orange", shape: "circle", box: [62.6, 68.56, 20.8, 14.88], hit: [63.2, 70.4, 15.7, 12.56] },
  ],
};

/** The triangles' picnic: a sky-blue striped blanket. */
export const triangles: Scene = {
  background: trianglesGround,
  items: [
    { id: "cheese", src: triangles_cheese, word: "cheese", shape: "triangle", box: [15.4, 13.92, 27.2, 16.88], hit: [16.0, 14.88, 24.5, 15.36] },
    { id: "pizza", src: triangles_pizza, word: "pizza", shape: "triangle", box: [58.2, 9.92, 24.5, 20.96], hit: [58.8, 10.64, 22.5, 19.76] },
    { id: "sandwich", src: triangles_sandwich, word: "sandwich", shape: "triangle", box: [12.2, 42.8, 23.3, 24.56], hit: [12.8, 44.24, 19.0, 22.56] },
    { id: "flag", src: triangles_flag, word: "flag", shape: "triangle", box: [68.3, 71.12, 20.7, 18.0], hit: [68.9, 71.68, 19.2, 16.88] },
    { id: "cookie", src: triangles_cookie, word: "cookie", shape: "circle", box: [60.8, 49.92, 24.4, 18.48], hit: [61.4, 50.64, 22.5, 17.2] },
    { id: "toast", src: triangles_toast, word: "toast", shape: "square", box: [39.2, 31.52, 22.5, 17.04], hit: [39.8, 32.24, 20.4, 15.76] },
    { id: "book", src: triangles_book, word: "book", shape: "rectangle", box: [19.9, 69.04, 24.2, 21.12], hit: [20.5, 70.0, 21.5, 19.68] },
  ],
};

/** The rectangles' picnic: a round sunny-yellow blanket. */
export const rectangles: Scene = {
  background: rectanglesGround,
  items: [
    { id: "book", src: rectangles_book, word: "book", shape: "rectangle", box: [18.4, 9.04, 27.4, 24.32], hit: [19.0, 10.0, 24.5, 22.88] },
    { id: "chocolate", src: rectangles_chocolate, word: "chocolate", shape: "rectangle", box: [58.0, 10.96, 23.3, 22.16], hit: [58.6, 11.6, 21.0, 21.04] },
    { id: "juice", src: rectangles_juice, word: "juice box", shape: "rectangle", box: [64.3, 47.2, 20.2, 19.76], hit: [64.9, 49.44, 13.9, 16.96] },
    { id: "ruler", src: rectangles_ruler, word: "ruler", shape: "rectangle", box: [36.7, 37.2, 26.8, 7.68], hit: [37.3, 37.76, 25.4, 6.64] },
    { id: "plate", src: rectangles_plate, word: "plate", shape: "circle", box: [15.5, 47.36, 26.1, 19.52], hit: [16.1, 48.08, 24.0, 18.32] },
    { id: "cheese", src: rectangles_cheese, word: "cheese", shape: "triangle", box: [33.1, 68.64, 16.8, 20.96], hit: [33.7, 69.52, 14.2, 19.6] },
    { id: "donut", src: rectangles_donut, word: "donut", shape: "circle", box: [55.5, 66.4, 26.5, 19.84], hit: [56.1, 67.44, 23.8, 18.32] },
  ],
};

/** The hearts' picnic: a cream blanket with sky-blue checks. */
export const hearts: Scene = {
  background: heartsGround,
  items: [
    { id: "cookie", src: hearts_cookie, word: "cookie", shape: "heart", box: [14.8, 12.4, 26.7, 19.6], hit: [15.4, 13.2, 24.5, 18.24] },
    { id: "box", src: hearts_box, word: "box", shape: "heart", box: [57.9, 9.44, 31.5, 22.56], hit: [58.5, 10.64, 27.7, 20.88] },
    { id: "donut", src: hearts_donut, word: "donut", shape: "circle", box: [38.7, 30.56, 24.0, 18.0], hit: [39.3, 31.6, 21.4, 16.48] },
    { id: "pillow", src: hearts_pillow, word: "pillow", shape: "heart", box: [15.9, 48.88, 24.9, 18.32], hit: [16.5, 49.92, 22.2, 16.8] },
    { id: "toast", src: hearts_toast, word: "toast", shape: "square", box: [60.3, 48.64, 25.7, 19.44], hit: [60.9, 49.44, 23.5, 18.16] },
    { id: "lollipop", src: hearts_lollipop, word: "lollipop", shape: "heart", box: [15.2, 69.12, 29.8, 17.28], hit: [15.8, 70.0, 28.4, 15.84] },
    { id: "cheese", src: hearts_cheese, word: "cheese", shape: "triangle", box: [58.0, 73.2, 27.8, 15.12], hit: [58.6, 74.16, 25.2, 13.68] },
  ],
};

/** The diamonds' picnic: a plain lilac blanket. */
export const diamonds: Scene = {
  background: diamondsGround,
  items: [
    { id: "kite", src: diamonds_kite, word: "kite", shape: "diamond", box: [21.3, 9.84, 14.7, 25.12], hit: [21.9, 10.4, 13.0, 24.08] },
    { id: "cookie", src: diamonds_cookie, word: "cookie", shape: "diamond", box: [63.1, 10.88, 18.5, 19.12], hit: [63.7, 11.6, 16.3, 17.92] },
    { id: "plate", src: diamonds_plate, word: "plate", shape: "circle", box: [38.2, 32.64, 24.4, 18.16], hit: [38.8, 33.28, 22.4, 17.04] },
    { id: "pillow", src: diamonds_pillow, word: "pillow", shape: "diamond", box: [17.0, 45.52, 21.5, 20.96], hit: [17.6, 46.24, 19.5, 19.76] },
    { id: "book", src: diamonds_book, word: "book", shape: "rectangle", box: [61.7, 47.84, 23.4, 20.8], hit: [62.3, 48.72, 20.7, 19.44] },
    { id: "sign", src: diamonds_sign, word: "sign", shape: "diamond", box: [20.3, 69.68, 19.1, 19.92], hit: [20.9, 70.24, 17.6, 18.88] },
    { id: "cheese", src: diamonds_cheese, word: "cheese", shape: "triangle", box: [68.9, 66.72, 17.9, 22.32], hit: [69.5, 67.6, 15.2, 20.96] },
  ],
};

/** The ovals' picnic: blue stripes; its round cookie is no oval. */
export const ovals: Scene = {
  background: ovalsGround,
  items: [
    { id: "egg", src: ovals_egg, word: "egg", shape: "oval", box: [19.7, 10.72, 19.9, 17.6], hit: [20.3, 12.16, 15.7, 15.68] },
    { id: "football", src: ovals_football, word: "football", shape: "oval", box: [64.6, 10.56, 17.0, 17.36], hit: [65.2, 11.84, 13.3, 15.6] },
    { id: "cookie", src: ovals_cookie, word: "cookie", shape: "circle", box: [38.1, 30.88, 24.4, 18.48], hit: [38.7, 31.6, 22.6, 17.2] },
    { id: "mirror", src: ovals_mirror, word: "mirror", shape: "oval", box: [16.9, 50.48, 27.9, 13.28], hit: [17.5, 51.12, 26.2, 12.16] },
    { id: "toast", src: ovals_toast, word: "toast", shape: "square", box: [60.5, 48.88, 25.2, 19.04], hit: [61.1, 49.68, 23.1, 17.68] },
    { id: "melon", src: ovals_melon, word: "watermelon", shape: "oval", box: [21.5, 69.12, 19.1, 17.52], hit: [22.1, 70.56, 15.1, 15.6] },
    { id: "pizza", src: ovals_pizza, word: "pizza", shape: "triangle", box: [58.1, 66.96, 23.3, 20.0], hit: [58.7, 67.68, 21.3, 18.72] },
  ],
};
