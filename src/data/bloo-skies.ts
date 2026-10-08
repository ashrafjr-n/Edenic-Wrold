import type { Gesture, Weather, WeatherScene } from "@/types/course";
import sunny0 from "../../public/assets/learn/bloo/weather/make/sunny/frame0.png";
import sunnyCloud0 from "../../public/assets/learn/bloo/weather/make/sunny/sky0.png";
import sunnyCloud1 from "../../public/assets/learn/bloo/weather/make/sunny/sky1.png";
import sunnyCloud2 from "../../public/assets/learn/bloo/weather/make/sunny/sky2.png";
import rainy0 from "../../public/assets/learn/bloo/weather/make/rainy/frame0.png";
import rainy1 from "../../public/assets/learn/bloo/weather/make/rainy/frame1.png";
import rainy2 from "../../public/assets/learn/bloo/weather/make/rainy/frame2.png";
import rainy3 from "../../public/assets/learn/bloo/weather/make/rainy/frame3.png";
import rainyCloud from "../../public/assets/learn/bloo/weather/make/rainy/sky0.png";
import windy0 from "../../public/assets/learn/bloo/weather/make/windy/frame0.png";
import windy1 from "../../public/assets/learn/bloo/weather/make/windy/frame1.png";
import windy2 from "../../public/assets/learn/bloo/weather/make/windy/frame2.png";
import windy3 from "../../public/assets/learn/bloo/weather/make/windy/frame3.png";
import windyCloud from "../../public/assets/learn/bloo/weather/make/windy/sky0.png";
import snowy0 from "../../public/assets/learn/bloo/weather/make/snowy/frame0.png";
import snowy1 from "../../public/assets/learn/bloo/weather/make/snowy/frame1.png";
import snowy2 from "../../public/assets/learn/bloo/weather/make/snowy/frame2.png";
import snowy3 from "../../public/assets/learn/bloo/weather/make/snowy/frame3.png";
import snowyCloud from "../../public/assets/learn/bloo/weather/make/snowy/sky0.png";
import drop from "../../public/assets/learn/bloo/weather/bits/drop.png";
import flake from "../../public/assets/learn/bloo/weather/bits/flake.png";
import leaf from "../../public/assets/learn/bloo/weather/bits/leaf.png";
import leaf2 from "../../public/assets/learn/bloo/weather/bits/leaf2.png";
import swirl from "../../public/assets/learn/bloo/weather/bits/swirl.png";
import sparkle from "../../public/assets/learn/bloo/weather/bits/sparkle.png";

/** Each weather as it is made by hand — rendered by `tools/picnic-scene`
    (`render.cjs weathersteps`), every frame and sky layer cut on one box
    by `crop.py weathersteps`, which printed the boxes (% of the picture).
    Rain: tap the cloud; sun: push its three clouds away; wind: swipe
    across the sky; snow: shake the cloud. */
export const WEATHER_MAKING: Record<Weather, { gesture: Gesture; scene: WeatherScene }> = {
  sunny: {
    gesture: "push",
    scene: {
      frames: [sunny0],
      sky: [
        { src: sunnyCloud0, box: [39.57, 10.59, 36.33, 22.86] },
        { src: sunnyCloud1, box: [64.39, 8.92, 34.53, 21.75] },
        { src: sunnyCloud2, box: [51.08, 24.54, 38.13, 23.98] },
      ],
      bits: [sparkle],
    },
  },
  rainy: {
    gesture: "tap",
    scene: { frames: [rainy0, rainy1, rainy2, rainy3], sky: [{ src: rainyCloud, box: [19.96, 1.86, 59.35, 31.04] }], bits: [drop] },
  },
  windy: {
    gesture: "swipe",
    scene: { frames: [windy0, windy1, windy2, windy3], sky: [{ src: windyCloud, box: [1.08, 3.35, 52.52, 27.51] }], bits: [swirl, leaf, leaf2] },
  },
  snowy: {
    gesture: "shake",
    scene: { frames: [snowy0, snowy1, snowy2, snowy3], sky: [{ src: snowyCloud, box: [19.42, 1.12, 57.01, 29.93] }], bits: [flake] },
  },
};
