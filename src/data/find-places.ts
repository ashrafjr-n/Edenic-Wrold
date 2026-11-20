/* Written by `tools/picnic-scene/crop.py find` — do not edit by hand.
   Each Find place's layers: how much faster the near layer slides
   (`kFront`; it is that much wider), and per frame the middle layer's
   width ÷ height (`aMid`), and each hidden thing's box on it [x, y, w, h] %
   and its tip (the top of what shows) on its own picture [x, y] %. */
export const FIND_PLACES = {
  kitchen: {
    kFront: 1.5,
    landscape: {
      aMid: 2.7,
      things: {
        carrot: { box: [68.86, 59.0, 8.3, 18.42], tip: [27.8, 8.3] },
        broccoli: { box: [8.83, 56.42, 11.23, 21.42], tip: [34.3, 7.9] },
      },
    },
    portrait: {
      aMid: 1.7,
      things: {
        carrot: { box: [68.97, 55.58, 8.53, 12.0], tip: [28.4, 9.5] },
        broccoli: { box: [8.38, 54.0, 11.47, 13.83], tip: [34.2, 8.4] },
      },
    },
  },
  garden: {
    kFront: 1.5,
    landscape: {
      aMid: 2.7,
      things: {
        flower: { box: [10.09, 40.42, 17.04, 37.5], tip: [29.9, 7.1] },
        leaf: { box: [84.14, 46.5, 7.44, 31.08], tip: [62.8, 7.3] },
      },
    },
    portrait: {
      aMid: 1.7,
      things: {
        flower: { box: [9.61, 43.75, 17.35, 24.17], tip: [30.2, 7.7] },
        leaf: { box: [84.41, 47.67, 7.6, 20.0], tip: [62.6, 8.1] },
      },
    },
  },
  farm: {
    kFront: 1.5,
    landscape: {
      aMid: 2.7,
      things: {
        cat: { box: [21.64, 44.67, 8.24, 16.83], tip: [58.8, 9.0] },
        dog: { box: [77.53, 52.08, 8.61, 28.08], tip: [52.8, 7.8] },
      },
    },
    portrait: {
      aMid: 1.7,
      things: {
        cat: { box: [21.27, 46.5, 8.48, 10.92], tip: [58.6, 10.6] },
        dog: { box: [77.75, 51.17, 8.87, 18.17], tip: [52.2, 8.8] },
      },
    },
  },
  shapes: {
    kFront: 1.5,
    landscape: {
      aMid: 2.7,
      things: {
        heart: { box: [79.63, 55.33, 9.41, 22.83], tip: [42.6, 8.2] },
        diamond: { box: [18.15, 43.42, 6.6, 19.17], tip: [37.6, 8.2] },
      },
    },
    portrait: {
      aMid: 1.7,
      things: {
        heart: { box: [79.85, 53.33, 9.66, 14.67], tip: [43.0, 8.8] },
        diamond: { box: [17.84, 45.67, 6.76, 12.5], tip: [36.7, 9.3] },
      },
    },
  },
} as const;

export type FindPlace = keyof typeof FIND_PLACES;
