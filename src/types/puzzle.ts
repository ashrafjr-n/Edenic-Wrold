import type { StaticImageData } from "next/image";

/** The picture a stage rebuilds. */
export interface PuzzlePicture {
  /** A **static import**, not a `/public` path string, and that matters: a
      static import is content-hashed into its URL, so replacing the file on
      disk changes the URL and every cache — the browser's and Next's image
      optimizer's — misses and refetches. A plain public path keeps the same
      URL forever, which is why a repainted picture appears not to update
      (see `ui/logo.tsx`, which hit this first). It also carries the file's
      real pixel size, so the board's aspect ratio and the pieces' crop can
      never drift out of step with the artwork. */
  image: StaticImageData;
  /** What the finished picture shows — the board's accessible name. */
  alt: string;
}

/** How a stage's picture is cut up. Per stage, not global: later stages get
    harder by adding pieces. */
export interface PuzzleGrid {
  cols: number;
  rows: number;
}

export interface PuzzleStage {
  /** 1–15. Also the URL segment under `/activities/puzzle`. */
  value: number;
  /** Undefined until that stage's art exists. A stage with no picture stays
      locked in the grid however much the child has finished — nothing in the
      chrome should lead to a page that cannot be played. */
  picture?: PuzzlePicture;
  /** Only meaningful alongside a `picture`. */
  grid?: PuzzleGrid;
}
