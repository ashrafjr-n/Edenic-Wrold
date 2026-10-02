import type { SceneItem, Target } from "@/types/course";

/** Whether a thing is what a Find looks for, or belongs in a Sort box. */
export function isTarget(item: SceneItem, target: Target): boolean {
  if ("shape" in target) return item.shape === target.shape;
  if ("color" in target) return item.color === target.color;
  return item.person === target.person;
}

