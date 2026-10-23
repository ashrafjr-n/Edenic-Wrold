import type { CSSProperties } from "react";
import type { StaticImageData } from "next/image";
import type { CharacterId } from "@/types/character";
import type { LessonId } from "@/types/lesson";
import courseShapes from "../../public/assets/learn/pinki/classroom/course-shapes.png";
import courseColors from "../../public/assets/learn/pinki/classroom/course-colors.png";
import pinkiWall from "../../public/assets/learn/pinki/classroom/portrait.jpg";
import pinkiWallWide from "../../public/assets/learn/pinki/classroom/landscape.jpg";
import pinkiDesk from "../../public/assets/learn/pinki/classroom/portrait-desk.png";
import pinkiDeskWide from "../../public/assets/learn/pinki/classroom/landscape-desk.png";
import pinkiWithStick from "../../public/assets/learn-with-pinki/pinki/pinki-with-a-stick.png";
import pinkiCelebrate from "../../public/assets/learn-with-pinki/pinki/pinki-celebrate.png";

/** A picture in both frames — the one that fits the screen shows. */
export interface Framed {
  portrait: StaticImageData;
  landscape: StaticImageData;
}

/** A friend's classroom (2026-10-14 Pinki's; Nova's and Bloo's
    2026-10-23): the same board, chalk, paper sheets and loader for every
    friend — one way to learn — in a room of their own. */
export interface Classroom {
  /** The room round the board, sharp — `render.cjs classroom <id>` →
      `crop.py classroom <id>`. */
  wall: Framed;
  /** The class's chairs in front, blurred. */
  desk: Framed;
  /** The friend at the board's right, a stick raised up-left to it — the
      same 502×497 frame for every friend, so they all stand in one spot. */
  teacher: StaticImageData;
  /** The friend once every lesson is learned, and on a lesson's done screen. */
  cheer: StaticImageData;
  /** Their chalk: what is learned, the next lesson's ring, the stars. */
  chalk: { accent: string; glow: string };
}

export const CLASSROOMS: Partial<Record<CharacterId, Classroom>> = {
  pinki: {
    wall: { portrait: pinkiWall, landscape: pinkiWallWide },
    desk: { portrait: pinkiDesk, landscape: pinkiDeskWide },
    teacher: pinkiWithStick,
    cheer: pinkiCelebrate,
    chalk: { accent: "#ffb0d4", glow: "#ff9ec8" },
  },
};

/** The friend's chalk, for the `<main>` of every page in their classroom. */
export function classroomStyle({ chalk }: Classroom): CSSProperties {
  return { "--chalk-accent": chalk.accent, "--chalk-glow": chalk.glow } as CSSProperties;
}

/** The one clear 3D thing each course wears on its sheet on the board
    (2026-10-14): a tower of toy blocks for Shapes, a painter's palette for
    Colors — rendered by `tools/picnic-scene` (`ITEMS.shapeBlocks`,
    `ITEMS.palette`). A course without one wears its first cover. */
export const classroomModels: Partial<Record<LessonId, StaticImageData>> = {
  shapes: courseShapes,
  colors: courseColors,
};
