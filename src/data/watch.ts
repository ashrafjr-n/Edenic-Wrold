import type { StaticImageData } from "next/image";
import { courseLessons } from "@/data/courses";
import { lessonsByCharacter } from "@/data/lessons";
import { puzzleStages } from "@/data/puzzles";
import type { LessonId } from "@/types/lesson";
import type { Dictionary } from "@/lib/dictionaries/en";
import episode1 from "../../public/assets/watch/episode-1.webp";
import episode2 from "../../public/assets/watch/episode-2.webp";
import episode3 from "../../public/assets/watch/episode-3.webp";

/** The YouTube series, newest first. A new episode = one line here: its
    video id and its title exactly as on the channel. */
const EPISODES: readonly { id: string; title: string; poster?: StaticImageData }[] = [
  { id: "ZulDqDkCN4w", title: "Edenic World - Episode 3 {English Version}", poster: episode3 },
  { id: "JBYQuKUrk9g", title: "Edenic World Episode-2 | English version 💕", poster: episode2 },
  { id: "S0-dQzksqmY", title: "Edenic World Episode-1 ( English version)", poster: episode1 },
];

/** The episodes' own stills, newest first — the first is on Discover's Watch TV. */
export const watchStills: StaticImageData[] = EPISODES.flatMap(({ poster }) => (poster ? [poster] : []));

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

export interface WatchSong {
  src: string;
  /** The frame its puzzle picture was cut from, 1280 × 720, next to the video. */
  poster: string;
  /** Song n is puzzle n's song, so a child who just finished puzzle 3 finds it as 3. */
  n: number;
}

/** `/watch`'s songs: the series' songs the puzzles were cut from, in puzzle
    order. */
export const watchSongs: WatchSong[] = puzzleStages.flatMap((stage, i) =>
  stage.picture ? [{ src: stage.picture.song, poster: stage.picture.song.replace(/\.mp4$/, ".jpg"), n: i + 1 }] : [],
);

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
