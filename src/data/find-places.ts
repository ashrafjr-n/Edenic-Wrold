/* Written by `tools/picnic-scene/crop.py find` — do not edit by hand.
   Each Find place's layers: how much faster the near layer slides
   (`kFront`; it is that much wider), and per frame the middle layer's
   width ÷ height (`aMid`), and each hidden thing's box on it [x, y, w, h] %
   and its leaves' spot on its own picture [x, y] %. */
export const FIND_PLACES = {
  kitchen: {
    kFront: 1.5,
    landscape: {
      aMid: 2.7,
      things: {
        carrot: { box: [68.86, 59.0, 8.3, 18.42], leaf: [18.5, 8.3] },
        broccoli: { box: [8.83, 56.42, 11.88, 21.42], leaf: [32.7, 7.9] },
      },
    },
    portrait: {
      aMid: 1.7,
      things: {
        carrot: { box: [68.97, 55.58, 8.53, 12.0], leaf: [18.9, 9.5] },
        broccoli: { box: [8.38, 54.0, 12.11, 13.83], leaf: [32.7, 8.4] },
      },
    },
  },
} as const;

export type FindPlace = keyof typeof FIND_PLACES;
