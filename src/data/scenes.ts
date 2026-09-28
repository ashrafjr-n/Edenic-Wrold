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

/** Pinki's picnic: a blanket on the grass, seen almost from above so a
    circle stays a circle. Rendered by `tools/picnic-scene` — the boxes below
    are what its `crop.py` printed, as % of the 4:5 scene. */
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
