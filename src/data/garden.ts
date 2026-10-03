import type { Garden } from "@/types/course";
import appleGround from "../../public/assets/learn/nova/fruits/garden/apple/ground.jpg";
import appleItem from "../../public/assets/learn/nova/fruits/garden/apple/item.png";
import appleFront from "../../public/assets/learn/nova/fruits/garden/apple/front.png";
import appleRim from "../../public/assets/learn/nova/fruits/garden/apple/rim.png";
import bananaGround from "../../public/assets/learn/nova/fruits/garden/banana/ground.jpg";
import bananaItem from "../../public/assets/learn/nova/fruits/garden/banana/item.png";
import bananaFront from "../../public/assets/learn/nova/fruits/garden/banana/front.png";
import bananaRim from "../../public/assets/learn/nova/fruits/garden/banana/rim.png";
import orangeGround from "../../public/assets/learn/nova/fruits/garden/orange/ground.jpg";
import orangeItem from "../../public/assets/learn/nova/fruits/garden/orange/item.png";
import orangeFront from "../../public/assets/learn/nova/fruits/garden/orange/front.png";
import orangeRim from "../../public/assets/learn/nova/fruits/garden/orange/rim.png";
import grapesGround from "../../public/assets/learn/nova/fruits/garden/grapes/ground.jpg";
import grapesItem from "../../public/assets/learn/nova/fruits/garden/grapes/item.png";
import grapesFront from "../../public/assets/learn/nova/fruits/garden/grapes/front.png";
import grapesRim from "../../public/assets/learn/nova/fruits/garden/grapes/rim.png";
import carrotGround from "../../public/assets/learn/nova/fruits/garden/carrot/ground.jpg";
import carrotItem from "../../public/assets/learn/nova/fruits/garden/carrot/item.png";
import carrotFront from "../../public/assets/learn/nova/fruits/garden/carrot/front.png";
import carrotRim from "../../public/assets/learn/nova/fruits/garden/carrot/rim.png";
import broccoliGround from "../../public/assets/learn/nova/fruits/garden/broccoli/ground.jpg";
import broccoliItem from "../../public/assets/learn/nova/fruits/garden/broccoli/item.png";
import broccoliFront from "../../public/assets/learn/nova/fruits/garden/broccoli/front.png";
import broccoliRim from "../../public/assets/learn/nova/fruits/garden/broccoli/rim.png";
import cornGround from "../../public/assets/learn/nova/fruits/garden/corn/ground.jpg";
import cornItem from "../../public/assets/learn/nova/fruits/garden/corn/item.png";
import cornFront from "../../public/assets/learn/nova/fruits/garden/corn/front.png";
import cornRim from "../../public/assets/learn/nova/fruits/garden/corn/rim.png";
import potatoGround from "../../public/assets/learn/nova/fruits/garden/potato/ground.jpg";
import potatoItem from "../../public/assets/learn/nova/fruits/garden/potato/item.png";
import potatoFront from "../../public/assets/learn/nova/fruits/garden/potato/front.png";
import potatoRim from "../../public/assets/learn/nova/fruits/garden/potato/rim.png";

/* Nova's garden — where each food of the Fruits course is picked (pulled
   up), one render each (`tools/picnic-scene`, `render.cjs harvest <food>`,
   then `crop.py harvest-<food>`, whose numbers these are): a tree for the
   apples and oranges, a banana plant, a vine on an arbour, a bed for the
   carrots, broccoli and potatoes, corn stalks. */

export const GARDENS = {
  apple: {
    ground: appleGround,
    item: appleItem,
    items: [{ box: [21.2, 21.76, 20.1, 13.76], hit: [21.8, 22.24, 18.9, 12.8], tilt: -8 }, { box: [58.7, 22.32, 20.1, 13.84], hit: [59.3, 22.8, 18.9, 12.88], tilt: 6 }, { box: [9.5, 37.04, 20.0, 13.76], hit: [10.1, 37.52, 18.8, 12.8], tilt: 4 }, { box: [40.0, 36.4, 20.0, 13.76], hit: [40.6, 36.88, 18.8, 12.8], tilt: -5 }, { box: [70.5, 37.6, 20.0, 13.84], hit: [71.1, 38.08, 18.8, 12.88], tilt: 9 }],
    pivot: "top",
    front: { src: appleFront, box: [59.0, 64.56, 39.8, 27.84] },
    rim: { src: appleRim, box: [59.0, 64.56, 39.8, 27.84] },
    basket: [60.53, 76.22, 36.75, 6.11],
  },
  banana: {
    ground: bananaGround,
    item: bananaItem,
    items: [{ box: [21.8, 52.32, 14.6, 19.68], hit: [22.4, 52.8, 13.4, 18.72], tilt: 22 }, { box: [34.3, 51.36, 14.6, 19.68], hit: [34.9, 51.84, 13.4, 18.72], tilt: 11 }, { box: [46.8, 51.04, 14.6, 19.6], hit: [47.4, 51.52, 13.4, 18.64], tilt: 0 }, { box: [59.3, 51.36, 14.6, 19.68], hit: [59.9, 51.84, 13.4, 18.56], tilt: -11 }, { box: [71.8, 52.32, 14.6, 19.68], hit: [72.4, 52.8, 13.4, 18.72], tilt: -22 }],
    pivot: "top",
    front: { src: bananaFront, box: [59.0, 64.8, 39.8, 27.92] },
    rim: { src: bananaRim, box: [59.0, 64.8, 39.8, 27.92] },
    basket: [60.53, 76.48, 36.75, 6.11],
  },
  orange: {
    ground: orangeGround,
    item: orangeItem,
    items: [{ box: [21.9, 19.84, 18.7, 15.84], hit: [22.5, 20.32, 17.5, 14.88], tilt: 6 }, { box: [59.4, 20.4, 18.7, 15.84], hit: [60.0, 20.88, 17.5, 14.88], tilt: -8 }, { box: [10.1, 35.12, 18.8, 15.84], hit: [10.7, 35.6, 17.6, 14.88], tilt: -4 }, { box: [40.6, 34.48, 18.8, 15.84], hit: [41.2, 34.96, 17.6, 14.88], tilt: 7 }, { box: [71.1, 35.68, 18.8, 15.84], hit: [71.7, 36.16, 17.6, 14.88], tilt: -6 }],
    pivot: "top",
    front: { src: orangeFront, box: [59.0, 64.56, 39.8, 27.84] },
    rim: { src: orangeRim, box: [59.0, 64.56, 39.8, 27.84] },
    basket: [60.53, 76.22, 36.75, 6.11],
  },
  grapes: {
    ground: grapesGround,
    item: grapesItem,
    items: [{ box: [17.2, 17.28, 17.2, 16.8], hit: [17.8, 17.76, 16.0, 15.84], tilt: 5 }, { box: [41.4, 17.28, 17.2, 16.8], hit: [42.0, 17.76, 16.0, 15.84], tilt: -4 }, { box: [65.6, 17.28, 17.2, 16.8], hit: [66.2, 17.76, 16.0, 15.84], tilt: 6 }, { box: [28.9, 43.6, 17.2, 16.72], hit: [29.5, 44.08, 16.0, 15.76], tilt: -6 }, { box: [53.9, 43.6, 17.2, 16.72], hit: [54.5, 44.08, 16.0, 15.76], tilt: 4 }],
    pivot: "top",
    front: { src: grapesFront, box: [59.0, 66.64, 39.8, 27.84] },
    rim: { src: grapesRim, box: [59.0, 66.64, 39.8, 27.84] },
    basket: [60.53, 78.32, 36.75, 6.11],
  },
  carrot: {
    ground: carrotGround,
    item: carrotItem,
    items: [{ box: [9.2, 45.92, 15.8, 33.84], hit: [9.8, 46.4, 14.6, 20.72], tilt: 0 }, { box: [25.6, 45.92, 15.8, 33.84], hit: [26.2, 46.4, 14.6, 20.72], tilt: 0 }, { box: [42.0, 45.92, 15.8, 33.84], hit: [42.6, 46.4, 14.6, 20.72], tilt: 0 }, { box: [58.4, 45.92, 15.9, 33.84], hit: [59.0, 46.4, 14.7, 20.72], tilt: 0 }, { box: [74.8, 45.92, 15.9, 33.84], hit: [75.4, 46.4, 14.7, 20.72], tilt: 0 }],
    pivot: "top",
    front: { src: carrotFront, box: [3.7, 65.28, 93.8, 34.16] },
    rim: { src: carrotRim, box: [61.9, 74.32, 35.6, 25.12] },
    basket: [63.28, 81.26, 32.81, 10.68],
  },
  broccoli: {
    ground: broccoliGround,
    item: broccoliItem,
    items: [{ box: [8.1, 56.96, 18.4, 18.0], hit: [8.7, 57.44, 17.2, 9.68], tilt: 0 }, { box: [24.5, 56.96, 18.4, 18.0], hit: [25.1, 57.44, 17.2, 9.68], tilt: 0 }, { box: [40.9, 56.96, 18.4, 18.0], hit: [41.5, 57.44, 17.2, 9.68], tilt: 0 }, { box: [57.3, 56.96, 18.4, 18.0], hit: [57.9, 57.44, 17.2, 9.68], tilt: 0 }, { box: [73.7, 56.96, 18.4, 18.0], hit: [74.3, 57.44, 17.2, 9.68], tilt: 0 }],
    pivot: "top",
    front: { src: broccoliFront, box: [3.7, 65.28, 93.8, 34.16] },
    rim: { src: broccoliRim, box: [61.9, 74.32, 35.6, 25.12] },
    basket: [63.28, 81.26, 32.81, 10.68],
  },
  corn: {
    ground: cornGround,
    item: cornItem,
    items: [{ box: [19.2, 48.56, 10.7, 13.92], hit: [19.8, 49.04, 9.5, 12.96], tilt: 18 }, { box: [6.1, 30.24, 10.6, 13.92], hit: [6.7, 30.72, 9.4, 12.96], tilt: -18 }, { box: [52.0, 38.8, 10.7, 13.92], hit: [52.6, 39.28, 9.5, 12.96], tilt: 18 }, { box: [38.9, 21.68, 10.6, 13.92], hit: [39.5, 22.16, 9.4, 12.96], tilt: -18 }, { box: [70.9, 44.88, 10.7, 13.92], hit: [71.5, 45.36, 9.5, 12.96], tilt: -18 }],
    pivot: "bottom",
    front: { src: cornFront, box: [59.0, 67.28, 39.8, 27.84] },
    rim: { src: cornRim, box: [59.0, 67.28, 39.8, 27.84] },
    basket: [60.53, 78.93, 36.75, 6.11],
  },
  potato: {
    ground: potatoGround,
    item: potatoItem,
    items: [{ box: [7.4, 58.32, 19.2, 14.88], hit: [8.9, 58.8, 17.0, 8.32], tilt: 0 }, { box: [23.8, 58.32, 19.2, 14.88], hit: [25.3, 58.8, 17.0, 8.32], tilt: 0 }, { box: [40.2, 58.32, 19.2, 14.88], hit: [41.7, 58.8, 17.0, 8.32], tilt: 0 }, { box: [56.6, 58.32, 19.2, 14.88], hit: [58.1, 58.8, 17.0, 8.32], tilt: 0 }, { box: [73.0, 58.32, 19.2, 14.88], hit: [74.5, 58.8, 17.0, 8.32], tilt: 0 }],
    pivot: "top",
    front: { src: potatoFront, box: [3.7, 65.28, 93.8, 34.16] },
    rim: { src: potatoRim, box: [61.9, 74.32, 35.6, 25.12] },
    basket: [63.28, 81.26, 32.81, 10.68],
  },
} satisfies Record<string, Garden>;
