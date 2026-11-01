import type { Scene } from "@/types/course";
import ground from "../../public/assets/learn/nova/fruits/find/kitchen/ground.jpg";
import blender from "../../public/assets/learn/nova/fruits/find/kitchen/blender.png";
import milk from "../../public/assets/learn/nova/fruits/find/kitchen/milk.png";
import garlic from "../../public/assets/learn/nova/fruits/find/kitchen/garlic.png";
import carrot from "../../public/assets/learn/nova/fruits/find/kitchen/carrot.png";
import broccoli from "../../public/assets/learn/nova/fruits/find/kitchen/broccoli.png";
import tomato from "../../public/assets/learn/nova/fruits/find/kitchen/tomato.png";
import cheese from "../../public/assets/learn/nova/fruits/find/kitchen/cheese.png";
import potato from "../../public/assets/learn/nova/fruits/find/kitchen/potato.png";
import pepper from "../../public/assets/learn/nova/fruits/find/kitchen/pepper.png";
import egg from "../../public/assets/learn/nova/fruits/find/kitchen/egg.png";
import egg2 from "../../public/assets/learn/nova/fruits/find/kitchen/egg2.png";

/** Nova's kitchen counter — Find It!, the Vegetables lessons' last step
    (the user's design, 2026-11-01): the five vegetables among a blender,
    a bottle of milk, a wedge of cheese, a bulb of garlic and two eggs, on
    warm wood under a tiled wall. One render for all five lessons
    (`render.cjs kitchen`, then `crop.py kitchen
    public/assets/learn/nova/fruits/find`, whose numbers these are); each
    lesson finds its own vegetable (its `group`). */
export const KITCHEN: Scene = {
  background: ground,
  items: [
    { id: "blender", src: blender, word: "blender", shape: null, box: [11.3, 10.72, 30.9, 26.32], hit: [11.9, 11.2, 21.0, 25.36] },
    { id: "milk", src: milk, word: "milk", shape: null, box: [46.7, 17.36, 16.9, 15.12], hit: [47.3, 17.84, 11.7, 14.16] },
    { id: "garlic", src: garlic, word: "garlic", shape: null, box: [72.1, 25.04, 19.3, 13.04], hit: [72.7, 25.52, 15.5, 11.12] },
    { id: "carrot", src: carrot, word: "carrot", shape: null, group: "carrot", box: [19.5, 37.6, 29.0, 14.0], hit: [20.1, 38.08, 24.8, 10.48] },
    { id: "broccoli", src: broccoli, word: "broccoli", shape: null, group: "broccoli", box: [66.4, 36.0, 26.6, 17.12], hit: [67.0, 36.48, 19.0, 15.68] },
    { id: "tomato", src: tomato, word: "tomato", shape: null, group: "tomato", box: [41.4, 48.56, 20.9, 13.92], hit: [42.0, 49.04, 16.5, 11.92] },
    { id: "cheese", src: cheese, word: "cheese", shape: null, box: [7.1, 54.8, 22.1, 15.2], hit: [7.7, 55.28, 17.8, 14.24] },
    { id: "potato", src: potato, word: "potato", shape: null, group: "potato", box: [70.6, 58.96, 20.9, 13.6], hit: [71.2, 59.44, 15.3, 10.8] },
    { id: "pepper", src: pepper, word: "pepper", shape: null, group: "pepper", box: [15.1, 64.24, 21.2, 14.96], hit: [15.7, 64.72, 15.1, 12.0] },
    { id: "egg", src: egg, word: "egg", shape: null, box: [50.5, 72.32, 12.6, 7.68], hit: [51.1, 72.8, 9.7, 6.16] },
    { id: "egg2", src: egg2, word: "egg", shape: null, box: [58.4, 75.12, 12.2, 8.0], hit: [59.0, 75.6, 9.3, 6.4] },
  ],
};
