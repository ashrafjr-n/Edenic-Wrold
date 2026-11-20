import type { StaticImageData } from "next/image";
import { FIND_PLACES, type FindPlace } from "./find-places";
import kitchenBackWide from "../../public/assets/play/find/kitchen/landscape/back.jpg";
import kitchenCarrotWide from "../../public/assets/play/find/kitchen/landscape/carrot.webp";
import kitchenFrontWide from "../../public/assets/play/find/kitchen/landscape/front.webp";
import kitchenMidWide from "../../public/assets/play/find/kitchen/landscape/mid.webp";
import kitchenBack from "../../public/assets/play/find/kitchen/portrait/back.jpg";
import kitchenCarrot from "../../public/assets/play/find/kitchen/portrait/carrot.webp";
import kitchenFront from "../../public/assets/play/find/kitchen/portrait/front.webp";
import kitchenMid from "../../public/assets/play/find/kitchen/portrait/mid.webp";
import kitchenPhoto from "../../public/assets/play/find/kitchen/photo.jpg";
import kitchenPlace from "../../public/assets/play/find/kitchen/place.jpg";

/** One frame of a Find place (`tools/picnic-scene/crop.py find`): the room,
    the counter, the near things before the lens and the thing to find. */
export interface FindLayers {
  back: StaticImageData;
  mid: StaticImageData;
  front: StaticImageData;
  thing: StaticImageData;
}

/** A stage's pictures: its place in both frames (a wide screen's and a
    phone's), the album's photo of the thing and its small picture of the place. */
export interface FindArt {
  landscape: FindLayers;
  portrait: FindLayers;
  photo: StaticImageData;
  place: StaticImageData;
}

/** One stage of Play's Find: a place, the one thing hidden in it (a taught
    English word, `public/assets/audio/words/<thing>.mp3`), its pictures and
    its layers' shape (`FIND_PLACES`). */
export interface FindStage {
  n: number;
  place: FindPlace;
  thing: string;
  art: FindArt;
}

/** The album's pages: nine stages (the user, 2026-11-20). Built one at a
    time; the ones not here yet show "Coming soon". */
export const FIND_STAGE_COUNT = 9;

export const FIND_STAGES: readonly FindStage[] = [
  {
    n: 1,
    place: "kitchen",
    thing: "carrot",
    art: {
      landscape: { back: kitchenBackWide, mid: kitchenMidWide, front: kitchenFrontWide, thing: kitchenCarrotWide },
      portrait: { back: kitchenBack, mid: kitchenMid, front: kitchenFront, thing: kitchenCarrot },
      photo: kitchenPhoto,
      place: kitchenPlace,
    },
  },
];

export const findStage = (n: number) => FIND_STAGES.find((stage) => stage.n === n);

export const placeOf = (stage: FindStage) => FIND_PLACES[stage.place];
