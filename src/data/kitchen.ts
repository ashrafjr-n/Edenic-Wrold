import type { Kitchen } from "@/types/course";
import pinki from "../../public/assets/friends/pinki.png";
import pinkiCheer from "../../public/assets/learn-with-pinki/pinki/pinki-celebrate.png";
import lGround from "../../public/assets/learn/nova/fruits/kitchen/landscape/ground.jpg";
import lCounter from "../../public/assets/learn/nova/fruits/kitchen/landscape/counter.png";
import lBasket from "../../public/assets/learn/nova/fruits/kitchen/landscape/basket.png";
import lBasketRim from "../../public/assets/learn/nova/fruits/kitchen/landscape/basket-rim.png";
import lBlender from "../../public/assets/learn/nova/fruits/kitchen/landscape/blender.png";
import lMilk from "../../public/assets/learn/nova/fruits/kitchen/landscape/milk.png";
import lTomato from "../../public/assets/learn/nova/fruits/kitchen/landscape/tomato.png";
import lPepper from "../../public/assets/learn/nova/fruits/kitchen/landscape/pepper.png";
import lPotato from "../../public/assets/learn/nova/fruits/kitchen/landscape/potato.png";
import lCheese from "../../public/assets/learn/nova/fruits/kitchen/landscape/cheese.png";
import lBroccoli from "../../public/assets/learn/nova/fruits/kitchen/landscape/broccoli.png";
import lCarrot from "../../public/assets/learn/nova/fruits/kitchen/landscape/carrot.png";
import lGarlic from "../../public/assets/learn/nova/fruits/kitchen/landscape/garlic.png";
import pGround from "../../public/assets/learn/nova/fruits/kitchen/portrait/ground.jpg";
import pCounter from "../../public/assets/learn/nova/fruits/kitchen/portrait/counter.png";
import pBasket from "../../public/assets/learn/nova/fruits/kitchen/portrait/basket.png";
import pBasketRim from "../../public/assets/learn/nova/fruits/kitchen/portrait/basket-rim.png";
import pBlender from "../../public/assets/learn/nova/fruits/kitchen/portrait/blender.png";
import pMilk from "../../public/assets/learn/nova/fruits/kitchen/portrait/milk.png";
import pGarlic from "../../public/assets/learn/nova/fruits/kitchen/portrait/garlic.png";
import pTomato from "../../public/assets/learn/nova/fruits/kitchen/portrait/tomato.png";
import pPotato from "../../public/assets/learn/nova/fruits/kitchen/portrait/potato.png";
import pPepper from "../../public/assets/learn/nova/fruits/kitchen/portrait/pepper.png";
import pCheese from "../../public/assets/learn/nova/fruits/kitchen/portrait/cheese.png";
import pBroccoli from "../../public/assets/learn/nova/fruits/kitchen/portrait/broccoli.png";
import pCarrot from "../../public/assets/learn/nova/fruits/kitchen/portrait/carrot.png";

/** The kitchen — Basket Time, the Vegetables lessons' last step (the
    user's design, 2026-11-01: Find It! merged into it). A wooden counter
    with the five vegetables among a blender, a bottle of milk, a wedge of
    cheese and a bulb of garlic, a basket on it, and Pinki behind it — her
    picture, never 3D. One render for all five lessons, in two frames
    (`render.cjs kitchen`, then `crop.py kitchen`, whose numbers these
    are); items run back to front, so a nearer one lies over a farther. */
export const KITCHEN: Kitchen = {
  friend: { picture: pinki, cheer: pinkiCheer },
  landscape: {
    ground: lGround,
    counter: { src: lCounter, box: [0.0, 57.4, 100.0, 42.6] },
    friend: [63.36, 20.59, 35.34, 49.93],
    basket: { src: lBasket, rim: lBasketRim, mouth: [3.34, 23.09, 78.11, 48.51], box: [74.19, 58.3, 22.25, 26.9] },
    items: [
    { id: "blender", src: lBlender, word: "blender", shape: null, box: [5.06, 36.5, 18.44, 31.2], hit: [5.44, 37.1, 12.25, 30.0] },
    { id: "milk", src: lMilk, word: "milk", shape: null, box: [18.62, 47.2, 10.19, 18.2], hit: [19.0, 47.8, 6.81, 17.0] },
    { id: "tomato", src: lTomato, word: "tomato", shape: null, group: "tomato", box: [33.0, 48.7, 13.19, 17.2], hit: [33.38, 49.3, 10.25, 15.3] },
    { id: "pepper", src: lPepper, word: "pepper", shape: null, group: "pepper", box: [48.81, 48.7, 12.94, 16.7], hit: [49.19, 49.3, 9.44, 14.7] },
    { id: "potato", src: lPotato, word: "potato", shape: null, group: "potato", box: [62.12, 49.3, 13.12, 15.7], hit: [62.5, 49.9, 9.38, 12.9] },
    { id: "cheese", src: lCheese, word: "cheese", shape: null, box: [4.81, 69.7, 13.94, 16.5], hit: [5.19, 70.3, 11.06, 15.3] },
    { id: "broccoli", src: lBroccoli, word: "broccoli", shape: null, group: "broccoli", box: [22.19, 58.6, 16.69, 22.1], hit: [22.56, 59.2, 11.69, 20.5] },
    { id: "carrot", src: lCarrot, word: "carrot", shape: null, group: "carrot", box: [31.56, 67.0, 19.19, 16.3], hit: [31.94, 67.6, 16.5, 12.9] },
    { id: "garlic", src: lGarlic, word: "garlic", shape: null, box: [60.69, 67.1, 11.31, 15.4], hit: [61.06, 67.7, 8.94, 13.5] },
    ],
  },
  portrait: {
    ground: pGround,
    counter: { src: pCounter, box: [0.0, 53.04, 100.0, 46.96] },
    friend: [54.05, 30.27, 47.3, 27.18],
    basket: { src: pBasket, rim: pBasketRim, mouth: [3.64, 8.87, 77.79, 69.48], box: [65.4, 72.69, 32.1, 17.33] },
    items: [
    { id: "blender", src: pBlender, word: "blender", shape: null, box: [5.3, 42.09, 26.1, 20.48], hit: [5.9, 42.54, 17.3, 19.58] },
    { id: "milk", src: pMilk, word: "milk", shape: null, box: [24.3, 48.54, 14.5, 11.85], hit: [24.9, 48.99, 9.6, 10.95] },
    { id: "garlic", src: pGarlic, word: "garlic", shape: null, box: [39.7, 52.51, 16.2, 9.83], hit: [40.3, 52.96, 12.7, 8.63] },
    { id: "tomato", src: pTomato, word: "tomato", shape: null, group: "tomato", box: [5.5, 63.02, 19.6, 11.4], hit: [6.1, 63.47, 15.2, 10.2] },
    { id: "potato", src: pPotato, word: "potato", shape: null, group: "potato", box: [27.5, 62.72, 19.6, 10.5], hit: [28.1, 63.17, 14.0, 9.23] },
    { id: "pepper", src: pPepper, word: "pepper", shape: null, group: "pepper", box: [49.2, 62.27, 19.2, 11.93], hit: [49.8, 62.72, 14.0, 10.73] },
    { id: "cheese", src: pCheese, word: "cheese", shape: null, box: [72.3, 62.64, 20.7, 12.98], hit: [72.9, 63.09, 16.4, 12.08] },
    { id: "broccoli", src: pBroccoli, word: "broccoli", shape: null, group: "broccoli", box: [5.5, 71.64, 24.9, 14.7], hit: [6.1, 72.09, 17.4, 13.58] },
    { id: "carrot", src: pCarrot, word: "carrot", shape: null, group: "carrot", box: [17.7, 78.24, 28.6, 10.35], hit: [18.3, 78.69, 24.5, 9.0] },
    ],
  },
};
