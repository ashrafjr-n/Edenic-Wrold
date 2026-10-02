import type { SceneItem, Target } from "@/types/course";

/** Whether a thing is what a Find looks for, or belongs in a Sort box. */
export function isTarget(item: SceneItem, target: Target): boolean {
  return "shape" in target ? item.shape === target.shape : item.color === target.color;
}

