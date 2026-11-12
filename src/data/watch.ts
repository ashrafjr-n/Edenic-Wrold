import { courseLessons } from "@/data/courses";
import { lessonsByCharacter } from "@/data/lessons";
import type { Dictionary } from "@/lib/dictionaries/en";

export interface WatchClip {
  /** Unique: the video's path. */
  src: string;
  /** The poster beside every reel: `<word>.jpg` next to `<word>.mp4`. */
  poster: string;
  title: string;
}

export interface WatchSection {
  courseId: string;
  courseName: string;
  clips: WatchClip[];
}

/** `/watch`: every lesson's reel, grouped by course in hub order — the same
    videos the lessons open with, nothing new to make. */
export function watchSections(dict: Dictionary): WatchSection[] {
  return Object.values(lessonsByCharacter)
    .flat()
    .map(({ id }) => ({
      courseId: id,
      courseName: dict.lessons[id].name,
      clips: courseLessons[id].flatMap((lesson, i) =>
        lesson.reel
          ? [{ src: lesson.reel, poster: lesson.reel.replace(/\.mp4$/, ".jpg"), title: dict.lessons[id].items[i] }]
          : [],
      ),
    }));
}
