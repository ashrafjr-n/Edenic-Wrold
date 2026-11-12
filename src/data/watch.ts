import { courseLessons } from "@/data/courses";
import { lessonsByCharacter } from "@/data/lessons";
import type { LessonId } from "@/types/lesson";
import type { Dictionary } from "@/lib/dictionaries/en";

/** The YouTube series, newest first. A new episode = one line here: its
    video id and its title exactly as on the channel. */
export const EPISODES = [{ id: "S0-dQzksqmY", title: "Edenic World Episode-1 ( English version)" }] as const;

export interface WatchEpisode {
  id: string;
  title: string;
  /** YouTube's own thumbnail (`images.remotePatterns` allows the host). */
  poster: string;
}

export const watchEpisodes: WatchEpisode[] = EPISODES.map(({ id, title }) => ({
  id,
  title,
  poster: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
}));

export interface WatchClip {
  /** Unique: the video's path. */
  src: string;
  /** The poster beside every reel: `<word>.jpg` next to `<word>.mp4`. */
  poster: string;
  title: string;
  courseId: LessonId;
}

export interface WatchCourse {
  id: LessonId;
  name: string;
}

/** `/watch`'s short videos: every lesson's reel — the ones the lessons open
    with, nothing new to make — in hub order. Their courses are the filters. */
export function watchClips(dict: Dictionary): { courses: WatchCourse[]; clips: WatchClip[] } {
  const courses = Object.values(lessonsByCharacter)
    .flat()
    .map(({ id }) => ({ id, name: dict.lessons[id].name }));
  const clips = courses.flatMap(({ id }) =>
    courseLessons[id].flatMap((lesson, i) =>
      lesson.reel
        ? [{ src: lesson.reel, poster: lesson.reel.replace(/\.mp4$/, ".jpg"), title: dict.lessons[id].items[i], courseId: id }]
        : [],
    ),
  );
  return { courses, clips };
}
