/** What the `count` stage does for a given number. Apples-in-a-basket is only
    one of four: it stops making sense past a target of 3 (there are only 3
    items in the tray), so numbers past that get an entirely different
    mini-activity instead of a different icon. */
export type CountActivityKind = "give" | "complete" | "path" | "reveal";

/** Hand Pinki `itemLabel`s until she has as many as the number. */
export interface GiveActivity {
  kind: "give";
  /** Same clay-render style as the rest of `assets/icons`. */
  icon: string;
  /** Singular word for the item (pluralized wherever it's spoken). */
  itemLabel: string;
}

/** The numeral is missing one piece; drag it back into place. */
export interface CompleteActivity {
  kind: "complete";
}

/** A winding path of neighbouring numbers; drag Pinki toward this one. */
export interface PathActivity {
  kind: "path";
  /** The numbers shown along the path, in order. Must contain the number
      this activity belongs to, at (or near) the middle. */
  numbers: readonly number[];
}

/** The numeral is hidden under a grid; swipe or tap it clear. */
export interface RevealActivity {
  kind: "reveal";
}

export type CountActivityConfig =
  | GiveActivity
  | CompleteActivity
  | PathActivity
  | RevealActivity;
