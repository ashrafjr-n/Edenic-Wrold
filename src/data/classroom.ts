import type { StaticImageData } from "next/image";
import type { LessonId } from "@/types/lesson";
import courseShapes from "../../public/assets/learn/pinki/classroom/course-shapes.png";
import courseColors from "../../public/assets/learn/pinki/classroom/course-colors.png";

/** The one clear 3D thing each of Pinki's courses wears on its box on her
    board (2026-10-14): a tower of toy blocks for Shapes, a painter's
    palette for Colors — rendered by `tools/picnic-scene` (`ITEMS.shapeBlocks`,
    `ITEMS.palette`). */
export const classroomModels: Partial<Record<LessonId, StaticImageData>> = {
  shapes: courseShapes,
  colors: courseColors,
};
