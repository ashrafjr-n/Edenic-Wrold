import { KITCHEN_FRAMES } from "@/data/veg-garden";
import type { Kitchen } from "@/types/course";
import pinki from "../../public/assets/friends/pinki.png";
import pinkiCheer from "../../public/assets/learn-with-pinki/pinki/pinki-celebrate.png";

/** The kitchen — Basket Time, the Vegetables lessons' last step (the
    user's design, 2026-11-01: Find It! merged into it; in Nova's cottage,
    played in the room, since 2026-11-05). A wooden counter with the five
    vegetables among a blender, a bottle of milk, a wedge of cheese and a
    bulb of garlic, a basket on it, and Pinki behind it — her picture, never
    3D. One render for all five lessons, in two frames (`render.cjs veg`, then
    `crop.py veg`); items run back to front, so a nearer one lies over a
    farther. */
export const KITCHEN: Kitchen = {
  friend: { picture: pinki, cheer: pinkiCheer },
  ...KITCHEN_FRAMES,
};
