import type { Face, LessonDef, Question, Target } from "@/types/course";
import type { TaskKind } from "./task-chip";
import type { TaskDemoDef } from "./task-demo";

/* The lesson player's pure helpers: what a step is, and what the task
   button, its demo and the done screen read off a question. */

/** The store needs a star count > 0 for "done". Nothing on the site shows
    stars; fewer of them is how a later review could find a shaky lesson. */
export function starsFor(mistakes: number): number {
  if (mistakes <= 1) return 3;
  if (mistakes <= 4) return 2;
  return 1;
}

/** The word on a Find's task chip: "circles", "red", "spring". */
function findLabel(target: Target): string {
  if ("shape" in target) return `${target.shape}s`;
  if ("color" in target) return target.color;
  return target.group;
}

export type Step = { kind: "watch" } | { kind: "question"; question: Question; index: number };

/** What the task chip shows for a step: its kind (icon + colour) and the
    English word the step is about. */
export function taskFor(q: Question, showing: boolean): { kind: TaskKind; target?: string } {
  if (showing) return { kind: "watch" };
  switch (q.type) {
    case "word":
      return { kind: "listen" };
    case "trace":
      return { kind: "draw", target: q.shape };
    case "spell":
      return { kind: "build" };
    case "find":
      return { kind: "find", target: findLabel(q.target) };
    case "sort":
      return { kind: "sort" };
    case "paint":
      return { kind: "paint" };
    case "pop":
      return { kind: "pop", target: q.color };
    case "order":
      return { kind: "order" };
    case "make":
      return { kind: q.into === "blender" ? "juice" : "cook", target: q.list.length === 1 ? q.list[0] : undefined };
    case "likes":
      return { kind: "like" };
    case "cups":
      return { kind: "cups", target: q.word };
    case "feed":
      return { kind: "feed", target: q.word };
    case "dress":
      return { kind: "dress", target: q.word };
    case "weather":
      return { kind: "weather", target: q.word };
    case "harvest":
      return { kind: "harvest" };
    case "change":
      return { kind: "change", target: q.word };
    case "pick": {
      const named = q.ask.vars?.shape ?? q.ask.vars?.color;
      return { kind: "pick", target: named === undefined ? undefined : String(named) };
    }
  }
}

/** How a step is played, for the task button's popup. The spelling demo
    deals with the board's own seed, so it shows the very letters the child
    sees. A Pick of pictures with nothing above it (no word, no sum) has none. */
export function demoFor(q: Question, accent: string, seed: string): TaskDemoDef | undefined {
  switch (q.type) {
    case "word":
      return {
        kind: "listen",
        face: q.picture ? { kind: "picture", src: q.picture, word: q.word } : q.shape ? { kind: "shape", shape: q.shape } : undefined,
      };
    case "trace":
      return { kind: "draw", shape: q.shape, accent };
    case "spell":
      return { kind: "build", word: q.word, seed };
    case "find":
      return { kind: "find", scene: q.scene, target: q.target };
    case "sort":
      return { kind: "sort", item: q.items[0], bins: q.bins };
    case "paint":
      return { kind: "paint", round: q.rounds[0], pots: q.pots };
    case "pop":
      return { kind: "pop", color: q.color, others: q.others };
    case "order":
      return { kind: "order", items: q.items, seed };
    case "make":
      return { kind: "make", list: q.list, stall: q.stall, into: q.into, seed };
    case "likes":
      return { kind: "like", face: q.items[0].face };
    case "cups":
      return { kind: "cups", picture: q.picture };
    case "feed":
      return { kind: "feed", picture: q.picture, food: q.food, mouth: q.mouth };
    case "dress":
      return { kind: "dress", wear: q.wear[0] };
    case "weather":
      return { kind: "weather", gesture: q.gesture, scene: q.scene };
    case "harvest":
      return { kind: "harvest", garden: q.garden, line: q.order[0] };
    case "change":
      return { kind: "change", scene: q.scene };
    case "pick":
      return q.word || q.show ? { kind: "pick", word: q.word, plain: q.plain, show: q.show, options: q.options, answer: q.answer } : undefined;
    default:
      return undefined;
  }
}

/** What a lesson was about, for the done screen: the shapes it traces,
    finds and sorts, and the pictures it names (a color's pot) — on the word
    card, in a pick's answer, or to spell from. Each once. */
export function lessonFaces(lesson: LessonDef): Face[] {
  const faces = lesson.questions.flatMap((q): Face[] => {
    if (q.type === "trace") return [{ kind: "shape", shape: q.shape }];
    if (q.type === "find" && "shape" in q.target) return [{ kind: "shape", shape: q.target.shape }];
    if (q.type === "sort") return q.items.flatMap((item): Face[] => (item.shape ? [{ kind: "shape", shape: item.shape }] : []));
    if (q.type === "pick") {
      const answer = q.options[q.answer];
      return answer.kind === "text" ? [] : [answer];
    }
    if ((q.type === "word" || q.type === "spell") && q.picture) return [{ kind: "picture", src: q.picture, word: q.word }];
    return [];
  });
  const key = (face: Face) => (face.kind === "shape" ? face.shape : face.kind === "picture" ? face.src.src : face.text);
  return faces.filter((face, i) => faces.findIndex((other) => key(other) === key(face)) === i);
}
