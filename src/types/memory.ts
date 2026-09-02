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
  /** Pairs, so the deck is twice this. 2 → 4 cards, 10 → 20. */
  pairs: number;
  /** Columns the board lays out in. Picked per level so the rows come out
      even — a ragged last row reads as a mistake rather than a layout — AND
      so the block stays roughly as tall as it is wide. Ten cards in one
      5 × 2 line read as a ribbon, not as a board. */
  cols: number;
  /** The comfortable time, in seconds. Running past it costs NOTHING: the
      clock empties, goes quiet, and the board stays playable. */
  seconds: number;
  /** Face ids this level is cut from — exactly `pairs` of them. Which faces,
      not just how many, is half the difficulty: the early levels take
      obviously different pictures, the last ones take sets that look alike. */
  faces: string[];
}
