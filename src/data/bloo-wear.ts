import type { StaticImageData } from "next/image";
import type { Weather } from "@/types/course";
import sunglasses from "../../public/assets/learn/bloo/weather/wear/sunglasses.png";
import sunhat from "../../public/assets/learn/bloo/weather/wear/sunhat.png";
import umbrella from "../../public/assets/learn/bloo/weather/wear/umbrella.png";
import rainhat from "../../public/assets/learn/bloo/weather/wear/rainhat.png";
import kite from "../../public/assets/learn/bloo/weather/wear/kite.png";
import pinwheel from "../../public/assets/learn/bloo/weather/wear/pinwheel.png";
import beanie from "../../public/assets/learn/bloo/weather/wear/beanie.png";
import scarf from "../../public/assets/learn/bloo/weather/wear/scarf.png";

/** What a child needs for each weather — two things each, sorted into the
    weathers in the Weather review (three are hats to tell apart). `word`
    is English, the picture's name. */
export const WEAR: Record<Weather, readonly [{ word: string; src: StaticImageData }, { word: string; src: StaticImageData }]> = {
  sunny: [
    { word: "sunglasses", src: sunglasses },
    { word: "sun hat", src: sunhat },
  ],
  rainy: [
    { word: "umbrella", src: umbrella },
    { word: "rain hat", src: rainhat },
  ],
  windy: [
    { word: "kite", src: kite },
    { word: "pinwheel", src: pinwheel },
  ],
  snowy: [
    { word: "scarf", src: scarf },
    { word: "winter hat", src: beanie },
  ],
};
