import type { StaticImageData } from "next/image";
import { FIND_PLACES, type FindPlace } from "./find-places";
import kitchenBack from "../../public/assets/play/find/kitchen/back.jpg";
import kitchenCarrot from "../../public/assets/play/find/kitchen/carrot.webp";
import kitchenFront from "../../public/assets/play/find/kitchen/front.webp";
import kitchenMid from "../../public/assets/play/find/kitchen/mid.webp";
import kitchenPhoto from "../../public/assets/play/find/kitchen/photo.jpg";
import kitchenPlace from "../../public/assets/play/find/kitchen/place.jpg";

/** A Find stage's pictures (`tools/picnic-scene/crop.py find`): the room,
    the counter, the near things before the lens, the thing to find, the
    album's photo of it and the album's small picture of the place. */
export interface FindArt {
  back: StaticImageData;
  mid: StaticImageData;
  front: StaticImageData;
  thing: StaticImageData;
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
    art: { back: kitchenBack, mid: kitchenMid, front: kitchenFront, thing: kitchenCarrot, photo: kitchenPhoto, place: kitchenPlace },
  },
];

export const findStage = (n: number) => FIND_STAGES.find((stage) => stage.n === n);

export const placeOf = (stage: FindStage) => FIND_PLACES[stage.place];
