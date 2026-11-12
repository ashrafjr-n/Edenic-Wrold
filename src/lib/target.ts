import type { Target, Thing } from "@/types/course";

/** Whether a thing is what a Find looks for. */
export function isTarget(item: Thing, target: Target): boolean {
  if ("shape" in target) return item.shape === target.shape;
  return item.color === target.color;
}

