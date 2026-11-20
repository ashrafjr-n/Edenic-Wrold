/* Written by `tools/picnic-scene/crop.py find` — do not edit by hand.
   Each Find place's layers: the middle layer's width ÷ height (`aMid`), how
   much faster the near layer slides (`kFront`; it is that much wider), the
   thing's box on the middle layer [x, y, w, h] % and its leaves' spot on
   its own picture [x, y] %. */
export const FIND_PLACES = {
  kitchen: { aMid: 2.7, kFront: 1.5, thing: [68.86, 59.0, 8.3, 18.42], leaf: [18.5, 8.3] },
} as const;

export type FindPlace = keyof typeof FIND_PLACES;
