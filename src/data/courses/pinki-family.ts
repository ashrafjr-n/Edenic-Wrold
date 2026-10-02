import type { StaticImageData } from "next/image";
import type { Face, LessonDef, PersonId } from "@/types/course";
import { familyRoom } from "@/data/family-scene";
import mom from "../../../public/assets/learn/pinki/family/mom.png";
import dad from "../../../public/assets/learn/pinki/family/dad.png";
import sister from "../../../public/assets/learn/pinki/family/sister.png";
import brother from "../../../public/assets/learn/pinki/family/brother.png";
import baby from "../../../public/assets/learn/pinki/family/baby.png";
import grandma from "../../../public/assets/learn/pinki/family/grandma.png";
import grandpa from "../../../public/assets/learn/pinki/family/grandpa.png";

/** Each person's picture, and their name as Pinki says it ("Mom") — the
    taught word is the same in lower case. In teaching order. */
const PEOPLE: Record<PersonId, { picture: StaticImageData; name: string }> = {
  mom: { picture: mom, name: "Mom" },
  dad: { picture: dad, name: "Dad" },
  sister: { picture: sister, name: "Sister" },
  brother: { picture: brother, name: "Brother" },
  baby: { picture: baby, name: "Baby" },
  grandma: { picture: grandma, name: "Grandma" },
  grandpa: { picture: grandpa, name: "Grandpa" },
};
const ORDER = Object.keys(PEOPLE) as PersonId[];

const face = (who: PersonId): Face => ({ kind: "picture", src: PEOPLE[who].picture, word: who });

/** Two others to choose between: the ones met most recently first, then
    ones still to come. */
function othersFor(who: PersonId): PersonId[] {
  const at = ORDER.indexOf(who);
  return [...ORDER.slice(0, at).reverse(), ...ORDER.slice(at + 1)].slice(0, 2);
}

/**
 * One person, one lesson (`edenic-plan.md` §5): watch the reel, meet them
 * (their picture and word), build the word, pick them out of three, then
 * find them in the family's living room.
 */
function personLesson(who: PersonId, n: number): LessonDef {
  const { picture, name } = PEOPLE[who];
  return {
    reel: `/assets/learn/pinki/family/reels/${n}.mp4`,
    cover: [picture],
    questions: [
      { type: "word", ask: { key: "thisIsPerson", vars: { person: name } }, word: who, picture },
      { type: "spell", ask: { key: "spell", vars: { word: who } }, word: who },
      { type: "pick", ask: { key: "whoIs", vars: { person: name } }, word: who, options: [who, ...othersFor(who)].map(face), answer: 0 },
      { type: "find", ask: { key: "findPerson", vars: { person: name } }, target: { person: who }, scene: familyRoom },
    ],
  };
}

/** Pinki · My Family. Titles live in `dict.lessons.family.items`. The reels
    are placeholders until the real clips replace them under the same names
    (`/assets/learn/pinki/family/reels/<n>.mp4`). Each person is a chibi
    clay figure rendered by `tools/picnic-scene` (`member:<who>`). */
export const pinkiFamily: LessonDef[] = [
  ...ORDER.map((who, i) => personLesson(who, i + 1)),
  /* The review, no reel: two people named by their word, the family lined
     up oldest first, then two words spelled from the picture alone. */
  {
    cover: [mom, dad, sister, brother],
    questions: [
      { type: "pick", ask: { key: "whoIs", vars: { person: "Grandma" } }, word: "grandma", options: [face("mom"), face("grandma"), face("sister"), face("grandpa")], answer: 1 },
      { type: "pick", ask: { key: "whoIs", vars: { person: "Brother" } }, word: "brother", options: [face("dad"), face("baby"), face("brother"), face("sister")], answer: 2 },
      { type: "order", ask: { key: "orderAge" }, items: [face("grandpa"), face("dad"), face("brother"), face("baby")] },
      { type: "spell", ask: { key: "spellPerson" }, word: "dad", picture: dad },
      { type: "spell", ask: { key: "spellPerson" }, word: "baby", picture: baby },
    ],
  },
];
