import type { StaticImageData } from "next/image";
import type { LessonDef } from "@/types/course";
import mom from "../../../public/assets/learn/pinki/family/mom.png";
import dad from "../../../public/assets/learn/pinki/family/dad.png";
import sister from "../../../public/assets/learn/pinki/family/sister.png";
import brother from "../../../public/assets/learn/pinki/family/brother.png";
import baby from "../../../public/assets/learn/pinki/family/baby.png";
import grandma from "../../../public/assets/learn/pinki/family/grandma.png";
import grandpa from "../../../public/assets/learn/pinki/family/grandpa.png";

/** One person, one lesson — not written yet, so no steps. */
const person = (picture: StaticImageData): LessonDef => ({ cover: [picture], questions: [] });

/** Pinki · My Family: one person a lesson, then a review wearing four of
    them. Titles live in `dict.lessons.family.items`. The faces are
    Microsoft Fluent Emoji 3D (MIT), medium skin tone. */
export const pinkiFamily: LessonDef[] = [
  person(mom),
  person(dad),
  person(sister),
  person(brother),
  person(baby),
  person(grandma),
  person(grandpa),
  { cover: [mom, dad, sister, brother], questions: [] },
];
