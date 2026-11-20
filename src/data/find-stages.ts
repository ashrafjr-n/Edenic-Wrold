import type { StaticImageData } from "next/image";
import { FIND_PLACES, type FindPlace } from "./find-places";
import gardenBackWide from "../../public/assets/play/find/garden/landscape/back.jpg";
import gardenMidWide from "../../public/assets/play/find/garden/landscape/mid.webp";
import gardenFrontWide from "../../public/assets/play/find/garden/landscape/front.webp";
import gardenFlowerWide from "../../public/assets/play/find/garden/landscape/flower.webp";
import gardenLeafWide from "../../public/assets/play/find/garden/landscape/leaf.webp";
import gardenBack from "../../public/assets/play/find/garden/portrait/back.jpg";
import gardenMid from "../../public/assets/play/find/garden/portrait/mid.webp";
import gardenFront from "../../public/assets/play/find/garden/portrait/front.webp";
import gardenFlower from "../../public/assets/play/find/garden/portrait/flower.webp";
import gardenLeaf from "../../public/assets/play/find/garden/portrait/leaf.webp";
import gardenPhoto from "../../public/assets/play/find/garden/photo.jpg";
import gardenPlace from "../../public/assets/play/find/garden/place.jpg";
import farmBackWide from "../../public/assets/play/find/farm/landscape/back.jpg";
import farmMidWide from "../../public/assets/play/find/farm/landscape/mid.webp";
import farmFrontWide from "../../public/assets/play/find/farm/landscape/front.webp";
import farmCatWide from "../../public/assets/play/find/farm/landscape/cat.webp";
import farmDogWide from "../../public/assets/play/find/farm/landscape/dog.webp";
import farmBack from "../../public/assets/play/find/farm/portrait/back.jpg";
import farmMid from "../../public/assets/play/find/farm/portrait/mid.webp";
import farmFront from "../../public/assets/play/find/farm/portrait/front.webp";
import farmCat from "../../public/assets/play/find/farm/portrait/cat.webp";
import farmDog from "../../public/assets/play/find/farm/portrait/dog.webp";
import farmPhoto from "../../public/assets/play/find/farm/photo.jpg";
import farmPlace from "../../public/assets/play/find/farm/place.jpg";
import kitchenCarrotIcon from "../../public/assets/play/find/kitchen/carrot-icon.webp";
import kitchenBroccoliIcon from "../../public/assets/play/find/kitchen/broccoli-icon.webp";
import gardenFlowerIcon from "../../public/assets/play/find/garden/flower-icon.webp";
import gardenLeafIcon from "../../public/assets/play/find/garden/leaf-icon.webp";
import farmCatIcon from "../../public/assets/play/find/farm/cat-icon.webp";
import farmDogIcon from "../../public/assets/play/find/farm/dog-icon.webp";
import shapesBackWide from "../../public/assets/play/find/shapes/landscape/back.jpg";
import shapesMidWide from "../../public/assets/play/find/shapes/landscape/mid.webp";
import shapesFrontWide from "../../public/assets/play/find/shapes/landscape/front.webp";
import shapesHeartWide from "../../public/assets/play/find/shapes/landscape/heart.webp";
import shapesDiamondWide from "../../public/assets/play/find/shapes/landscape/diamond.webp";
import shapesBack from "../../public/assets/play/find/shapes/portrait/back.jpg";
import shapesMid from "../../public/assets/play/find/shapes/portrait/mid.webp";
import shapesFront from "../../public/assets/play/find/shapes/portrait/front.webp";
import shapesHeart from "../../public/assets/play/find/shapes/portrait/heart.webp";
import shapesDiamond from "../../public/assets/play/find/shapes/portrait/diamond.webp";
import shapesHeartIcon from "../../public/assets/play/find/shapes/heart-icon.webp";
import shapesDiamondIcon from "../../public/assets/play/find/shapes/diamond-icon.webp";
import shapesPhoto from "../../public/assets/play/find/shapes/photo.jpg";
import shapesPlace from "../../public/assets/play/find/shapes/place.jpg";
import kitchenBackWide from "../../public/assets/play/find/kitchen/landscape/back.jpg";
import kitchenBroccoliWide from "../../public/assets/play/find/kitchen/landscape/broccoli.webp";
import kitchenCarrotWide from "../../public/assets/play/find/kitchen/landscape/carrot.webp";
import kitchenFrontWide from "../../public/assets/play/find/kitchen/landscape/front.webp";
import kitchenMidWide from "../../public/assets/play/find/kitchen/landscape/mid.webp";
import kitchenBack from "../../public/assets/play/find/kitchen/portrait/back.jpg";
import kitchenBroccoli from "../../public/assets/play/find/kitchen/portrait/broccoli.webp";
import kitchenCarrot from "../../public/assets/play/find/kitchen/portrait/carrot.webp";
import kitchenFront from "../../public/assets/play/find/kitchen/portrait/front.webp";
import kitchenMid from "../../public/assets/play/find/kitchen/portrait/mid.webp";
import kitchenPhoto from "../../public/assets/play/find/kitchen/photo.jpg";
import kitchenPlace from "../../public/assets/play/find/kitchen/place.jpg";

/** One frame of a Find place (`tools/picnic-scene/crop.py find`): the room,
    the counter, the near things before the lens and each thing to find. */
export interface FindLayers {
  back: StaticImageData;
  mid: StaticImageData;
  front: StaticImageData;
  things: Record<string, StaticImageData>;
}

/** A stage's pictures: its place in both frames (a wide screen's and a
    phone's), each thing whole (the list's, the photo's and the album's
    picture of it — in the place it may be half hidden), the album's photo of
    what was found and its small picture of the place. */
export interface FindArt {
  landscape: FindLayers;
  portrait: FindLayers;
  icons: Record<string, StaticImageData>;
  photo: StaticImageData;
  place: StaticImageData;
}

/** One stage of Play's Find: a place and what is hidden in it — two
    things, three in a harder stage (the user, 2026-11-20), each a taught
    English word (`public/assets/audio/words/<thing>.mp3`) — with its
    pictures and its layers' shape (`FIND_PLACES`). */
export interface FindStage {
  n: number;
  place: FindPlace;
  /** Whose world it is: they ask and cheer (their picture, `FriendSays`). */
  friend: "pinki" | "nova" | "bloo";
  things: readonly string[];
  art: FindArt;
}

/** The album's pages: nine stages (the user, 2026-11-20). Built one at a
    time; the ones not here yet show "Coming soon". */
export const FIND_STAGE_COUNT = 9;

export const FIND_STAGES: readonly FindStage[] = [
  {
    n: 1,
    place: "kitchen",
    friend: "nova",
    things: ["carrot", "broccoli"],
    art: {
      landscape: { back: kitchenBackWide, mid: kitchenMidWide, front: kitchenFrontWide, things: { carrot: kitchenCarrotWide, broccoli: kitchenBroccoliWide } },
      portrait: { back: kitchenBack, mid: kitchenMid, front: kitchenFront, things: { carrot: kitchenCarrot, broccoli: kitchenBroccoli } },
      icons: { carrot: kitchenCarrotIcon, broccoli: kitchenBroccoliIcon },
      photo: kitchenPhoto,
      place: kitchenPlace,
    },
  },
  {
    n: 2,
    place: "garden",
    friend: "nova",
    things: ["flower", "leaf"],
    art: {
      landscape: { back: gardenBackWide, mid: gardenMidWide, front: gardenFrontWide, things: { flower: gardenFlowerWide, leaf: gardenLeafWide } },
      portrait: { back: gardenBack, mid: gardenMid, front: gardenFront, things: { flower: gardenFlower, leaf: gardenLeaf } },
      icons: { flower: gardenFlowerIcon, leaf: gardenLeafIcon },
      photo: gardenPhoto,
      place: gardenPlace,
    },
  },
  {
    n: 3,
    place: "farm",
    friend: "bloo",
    things: ["cat", "dog"],
    art: {
      landscape: { back: farmBackWide, mid: farmMidWide, front: farmFrontWide, things: { cat: farmCatWide, dog: farmDogWide } },
      portrait: { back: farmBack, mid: farmMid, front: farmFront, things: { cat: farmCat, dog: farmDog } },
      icons: { cat: farmCatIcon, dog: farmDogIcon },
      photo: farmPhoto,
      place: farmPlace,
    },
  },
  {
    n: 4,
    place: "shapes",
    friend: "pinki",
    things: ["heart", "diamond"],
    art: {
      landscape: { back: shapesBackWide, mid: shapesMidWide, front: shapesFrontWide, things: { heart: shapesHeartWide, diamond: shapesDiamondWide } },
      portrait: { back: shapesBack, mid: shapesMid, front: shapesFront, things: { heart: shapesHeart, diamond: shapesDiamond } },
      icons: { heart: shapesHeartIcon, diamond: shapesDiamondIcon },
      photo: shapesPhoto,
      place: shapesPlace,
    },
  },
];

export const findStage = (n: number) => FIND_STAGES.find((stage) => stage.n === n);

export const placeOf = (stage: FindStage) => FIND_PLACES[stage.place];
