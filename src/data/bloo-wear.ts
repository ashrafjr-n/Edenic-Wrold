import type { Wear, Weather } from "@/types/course";
import bloo from "../../public/assets/friends/bloo.png";
import horns from "../../public/assets/learn/bloo/weather/bloo-horns.png";
import sunglasses from "../../public/assets/learn/bloo/weather/wear/sunglasses.png";
import sunhat from "../../public/assets/learn/bloo/weather/wear/sunhat.png";
import umbrella from "../../public/assets/learn/bloo/weather/wear/umbrella.png";
import rainhat from "../../public/assets/learn/bloo/weather/wear/rainhat.png";
import kite from "../../public/assets/learn/bloo/weather/wear/kite.png";
import pinwheel from "../../public/assets/learn/bloo/weather/wear/pinwheel.png";
import beanie from "../../public/assets/learn/bloo/weather/wear/beanie.png";
import scarf from "../../public/assets/learn/bloo/weather/wear/scarf.png";

/** Bloo as he is dressed: his own picture, and his horns cut out of it
    (`crop.py horns`), laid over a hat so they come through it. */
export const BLOO = { picture: bloo, horns };

/** What Bloo wears for each weather, [the one waiting on his left, the one
    on his right] — each beside the side of him it goes on. Where each lies
    was fitted on his picture (`tools/picnic-scene` renders them from the
    front): its middle and width in % of his picture, turned with his head
    (he leans ~12°). The umbrella's crook and the kite's string end in his
    raised hand, the pinwheel in the one on his hip. */
export const WEAR: Record<Weather, readonly [Wear, Wear]> = {
  sunny: [
    { word: "sunglasses", src: sunglasses, at: [51.5, 37, 62], turn: 12.6, layer: "front" },
    { word: "sun hat", src: sunhat, at: [62, 8, 72], turn: 12, layer: "head" },
  ],
  rainy: [
    { word: "umbrella", src: umbrella, at: [22, 4, 78], turn: 14, layer: "behind" },
    { word: "rain hat", src: rainhat, at: [62, 9, 66], turn: 12, layer: "head" },
  ],
  windy: [
    { word: "kite", src: kite, at: [-17, -12, 26], turn: -14, layer: "behind", string: [-14, -8, 13, 27] },
    { word: "pinwheel", src: pinwheel, at: [92, 48, 28], turn: 4, layer: "front" },
  ],
  snowy: [
    { word: "scarf", src: scarf, at: [49, 64, 70], turn: 10, layer: "front" },
    { word: "winter hat", src: beanie, at: [61, 10, 50], turn: 12, layer: "head" },
  ],
};
