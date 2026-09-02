/** One picture a pair is made of. Two cards carry the same face; finding both
    is the whole game. */
export interface MemoryFace {
  id: string;
  /** Public path to the render. */
  src: string;
  /** The card's accessible name — a child using a screen reader has to be
      able to tell two open cards apart by more than "image". */
  label: string;
}

export interface MemoryLevel {
  value: number;
  /** Pairs, so the deck is twice this. 3 → 6 cards, 8 → 16. */
  pairs: number;
  /** Columns the board lays out in. Picked per level so the rows come out
      even — a ragged last row reads as a mistake rather than a layout. */
  cols: number;
  /** The comfortable time, in seconds. Running past it costs a star and
      NOTHING else: the clock never ends the game (see `scoreLevel`). */
  seconds: number;
  /** Face ids this level is cut from — exactly `pairs` of them. Which faces,
      not just how many, is half the difficulty: the early levels take
      obviously different pictures, the last ones take sets that look alike. */
  faces: string[];
}
