import type { Locale } from "./locale";

/** What the `count` stage does for a given number. Apples-in-a-basket is only
    one of four: it stops making sense past a target of 3 (there are only 3
    items in the tray), so numbers past that get an entirely different
    mini-activity instead of a different icon. */
export type CountActivityKind = "give" | "complete" | "path" | "color";

/** Hand Pinki `itemLabel`s until she has as many as the number. */
export interface GiveActivity {
  kind: "give";
  /** Same clay-render style as the rest of `assets/icons`. */
  icon: string;
  /** Singular word for the item, per locale — Pinki's script and the tray's
      aria-labels read the active one rather than translating at render time.
      ONE record rather than an `itemLabelAr`/`itemLabelKu` pair of fields:
      `Record<Locale, …>` makes the compiler ask for the new string the moment
      a locale is added, which a parallel optional field never would. Only the
      English entry is ever pluralized (`scriptForEn`); the others are used
      as-is, see `ku.ts`/`ar.ts` on unmodelled number agreement. */
  itemLabel: Record<Locale, string>;
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

/** The numeral is an empty outline; colour it in. */
export interface ColorActivity {
  kind: "color";
}

export type CountActivityConfig =
  | GiveActivity
  | CompleteActivity
  | PathActivity
  | ColorActivity;
