import { KITCHEN_FRAMES } from "@/data/veg-kitchen";
import type { Kitchen } from "@/types/course";
import nova from "../../public/assets/friends/nova.png";

/** The kitchen — Basket Time, the Vegetables lessons' last step (the
    user's design, 2026-11-01: Find It! merged into it; the whole course is in
    this kitchen since 2026-11-06). A wooden counter with the five
    vegetables among a blender, a bottle of milk, a wedge of cheese and a
    bulb of garlic, a basket on it, and Nova behind it (it was Pinki by mistake until 2026-11-06) — her picture, never
    3D. One render for all five lessons, in two frames (`render.cjs veg`, then
    `crop.py veg`); items run back to front, so a nearer one lies over a
    farther. */
export const KITCHEN: Kitchen = {
  friend: { picture: nova, cheer: nova },
  ...KITCHEN_FRAMES,
};
