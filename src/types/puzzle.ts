/** The picture a stage rebuilds, and the intrinsic size the board's aspect
    ratio and every piece's crop are measured against. */
export interface PuzzlePicture {
  src: string;
  width: number;
  height: number;
  /** What the finished picture shows — the board's accessible name. */
  alt: string;
}

export interface PuzzleStage {
  /** 1–9. Also the URL segment under `/activities/puzzle`. */
  value: number;
  /** Undefined until that stage's art exists. A stage with no picture stays
      locked in the grid however much the child has finished — nothing in the
      chrome should lead to a page that cannot be played. */
  picture?: PuzzlePicture;
}
