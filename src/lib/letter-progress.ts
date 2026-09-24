import { letterNodes } from "@/data/letter-items";
import type { LetterId, LetterNode } from "@/types/letter-item";

/** Where a node on the Letters map stands for this child. */
export type LetterNodeState = "done" | "current" | "locked";

/**
 * Every node's state, in map order, from a "has this node been finished?"
 * test. Pure, so the map and the session read the same rule, and callable
 * from anywhere (the store's reader passes it in).
 *
 * One path, one node at a time: a node opens when the one before it is done
 * — a unit's checkpoint included, so unit 2 waits for unit 1's challenge.
 * So there is only ever one unfinished open node, `current`; a finished node
 * stays open for replay.
 */
export function letterNodeStates(
  isDone: (node: LetterNode) => boolean,
): LetterNodeState[] {
  return letterNodes.map((node, index) => {
    if (isDone(node)) return "done";
    const previous = letterNodes[index - 1];
    return previous && !isDone(previous) ? "locked" : "current";
  });
}

/** The node after `id` on the map — where "Next" leads once it is done. */
export function nextLetterNode(id: string): LetterNode | undefined {
  const index = letterNodes.findIndex((node) => node.id === id);
  return index === -1 ? undefined : letterNodes[index + 1];
}

/** How a letter reads on screen, as a capital: the map, Pinki's lines. */
export function letterLabel(id: LetterId): string {
  return id.toUpperCase();
}
