import type { StaticImageData } from "next/image";
import { courseLessons } from "@/data/courses";
import { lessonsByCharacter } from "@/data/lessons";
import type { LessonId } from "@/types/lesson";
import type { Dictionary } from "@/lib/dictionaries/en";
import episode1 from "../../public/assets/watch/episode-1.webp";

/** The YouTube series, newest first. A new episode = one line here: its
    video id and its title exactly as on the channel. */
export const EPISODES: readonly { id: string; title: string; poster?: StaticImageData }[] = [
  { id: "S0-dQzksqmY", title: "Edenic World Episode-1 ( English version)", poster: episode1 },
];

export interface WatchEpisode {
  id: string;
  title: string;
  /** Our own picture when an episode has one, else YouTube's thumbnail
      (`images.remotePatterns` allows the host). */
  poster: StaticImageData | string;
}

export const watchEpisodes: WatchEpisode[] = EPISODES.map(({ id, title, poster }) => ({
  id,
  title,
  poster: poster ?? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
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

/** `/watch`'s short videos: every lesson's reel (and its mid-lesson reel, the
    weather's) — the ones the lessons play, nothing new to make — in hub order. Their courses are the filters. */
export function watchClips(dict: Dictionary): { courses: WatchCourse[]; clips: WatchClip[] } {
  const courses = Object.values(lessonsByCharacter)
    .flat()
    .map(({ id }) => ({ id, name: dict.lessons[id].name }));
  const clipFor = (src: string, title: string, courseId: LessonId): WatchClip => ({
    src,
    poster: src.replace(/\.mp4$/, ".jpg"),
    title,
    courseId,
  });
  const clips = courses.flatMap(({ id }) =>
    courseLessons[id].flatMap((lesson, i) => {
      const title = dict.lessons[id].items[i];
      /* A season lesson's title is "Spring · Rainy": its first reel is the
         season, its `midReel` the weather — two videos, one name each. */
      const [first, second] = title.split(" · ");
      return [
        ...(lesson.reel ? [clipFor(lesson.reel, first, id)] : []),
        ...(lesson.midReel ? [clipFor(lesson.midReel.src, second ?? first, id)] : []),
      ];
    }),
  );
  return { courses, clips };
}
