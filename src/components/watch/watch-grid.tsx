"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import { ChevronDown, Clapperboard, Music, Play, X } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";
import { format } from "@/lib/format-dict";
import type { LessonId } from "@/types/lesson";
import pinki from "../../../public/assets/friends/pinki.png";
import type { WatchClip, WatchCourse, WatchEpisode, WatchSong } from "@/data/watch";

interface WatchGridProps {
  episodes: readonly WatchEpisode[];
  songs: readonly WatchSong[];
  courses: readonly WatchCourse[];
  clips: readonly WatchClip[];
  words: {
    episodesTitle: string;
    reelsTitle: string;
    songsTitle: string;
    songAria: string;
    filterAll: string;
    filterAria: string;
    clipAria: string;
    episodeAria: string;
    latestEpisode: string;
    watchNow: string;
    more: string;
    close: string;
    showEpisode: string;
  };
  dir: "rtl" | "ltr";
}

type Playing =
  | { kind: "episode"; item: WatchEpisode }
  | { kind: "song"; item: WatchSong }
  | { kind: "clip"; item: WatchClip };

/** How long each episode stays in the hero before the next fades in. */
const HERO_MS = 6000;

/** Short videos shown at first, and added by each press of "More" (8 fills
    2, 4 and — with the sidebar — 4 columns evenly). */
const PAGE = 8;

/** Songs shown at first, and added by each press of "More" (6 fills 2 and 3 columns evenly). */
const SONG_PAGE = 6;

/** A fresh random order — only ever called after mount, never while the
    server renders, so the two can't disagree. */
function shuffled<T>(list: readonly T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const PlayBadge = ({ size = "h-14 w-14", icon = "h-7 w-7" }: { size?: string; icon?: string }) => (
  <span
    aria-hidden
    className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[var(--accent)] shadow-lg transition-transform group-hover:scale-110 ${size}`}
  >
    <Play className={`ms-0.5 fill-current ${icon}`} strokeWidth={2} />
  </span>
);

/** The clay dot before a section's name (`.clay-dot`, in the section's colour). */
const SectionDot = ({ icon, dot }: { icon: ReactNode; dot: string }) => (
  <span aria-hidden className="clay-dot shrink-0" style={{ "--dot": dot } as CSSProperties}>
    {icon}
  </span>
);

/**
 * `/watch` (a top-level tab since 2026-11-21, so no back button). Episodes lead: ONE hero (picture + a pink clay panel with Pinki, its title and one
 * Watch-now button, side by side from `lg`) through which every episode passes,
 * newest first, one every `HERO_MS` — the pictures cross-fade, the panel's
 * words fade up, a dot per episode fills as it stays. It holds
 * while hovered, focused or a video is open, never moves for reduced motion,
 * and a dot jumps to its episode. Then the short videos — the lessons' reels: a filter (chips
 * in a scrolling row on a phone, a sticky side list from `lg`), "All" in a
 * random order reshuffled each time it is picked, 8 at a time with a More
 * button. Between the two, the songs (2026-11-19): the series' songs the
 * puzzles were cut from, in puzzle order: white clay cards, the frame in a
 * rounded window, the song's name under it — six at a time with a More button. Whatever is tapped plays in a native `<dialog>` that mounts its
 * player only while open.
 */
export function WatchGrid({ episodes, songs, courses, clips, words, dir }: WatchGridProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [playing, setPlaying] = useState<Playing | null>(null);
  const [filter, setFilter] = useState<LessonId | "all">("all");
  const [order, setOrder] = useState<readonly WatchClip[]>(clips);
  const [count, setCount] = useState(PAGE);
  const [songCount, setSongCount] = useState(SONG_PAGE);

  /* After mount, so the server's fixed order and the first client render agree. */
  useEffect(() => {
    const timer = setTimeout(() => setOrder(shuffled(clips)));
    return () => clearTimeout(timer);
  }, [clips]);

  const pick = (next: LessonId | "all") => {
    setFilter(next);
    setCount(PAGE);
    if (next === "all") setOrder(shuffled(clips));
  };
  const list = filter === "all" ? order : clips.filter((clip) => clip.courseId === filter);
  const shown = list.slice(0, count);

  const play = (next: Playing) => {
    setPlaying(next);
    dialog.current?.showModal();
  };

  const chip = (id: LessonId | "all", label: string) => {
    const on = filter === id;
    return (
      <button
        key={id}
        type="button"
        onClick={() => pick(id)}
        aria-pressed={on}
        className={`shrink-0 cursor-pointer whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-bold transition-colors lg:rounded-2xl lg:px-4 lg:py-2.5 lg:text-start lg:text-base ${
          on ? "bg-[var(--brand)] text-white" : "bg-[var(--surface)] text-[var(--color-ink)] hover:bg-[var(--brand-soft)]"
        }`}
        style={{ boxShadow: on ? "0 2px 0 var(--brand-dark)" : "0 2px 0 rgb(var(--shadow-hue) / 16%)" }}
      >
        <span dir={dir}>{label}</span>
      </button>
    );
  };

  const [at, setAt] = useState(0);
  const [still, setStill] = useState(false);
  const [hovered, setHovered] = useState(false);
  const hero = episodes[at];

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStill(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  /* The next episode after `HERO_MS` — re-armed whenever the episode changes,
     so a dot pressed by hand gets its full time too. */
  useEffect(() => {
    if (episodes.length < 2 || still || hovered || playing) return;
    const timer = setTimeout(() => setAt((i) => (i + 1) % episodes.length), HERO_MS);
    return () => clearTimeout(timer);
  }, [at, episodes.length, still, hovered, playing]);

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 lg:gap-16">
        <section aria-label={words.episodesTitle} className="flex flex-col gap-5">
          <div
            className="watch-hero card grid overflow-hidden lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]"
            style={{ "--hero-ms": `${HERO_MS}ms` } as CSSProperties}
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
            onFocus={() => setHovered(true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setHovered(false);
            }}
          >
            <button
              type="button"
              onClick={() => play({ kind: "episode", item: hero })}
              aria-label={format(words.episodeAria, { title: hero.title })}
              className="group relative block aspect-video w-full cursor-pointer overflow-hidden"
            >
              <span aria-hidden className="img-wait" />
              {episodes.map((episode, i) => (
                <Image
                  key={episode.id}
                  src={episode.poster}
                  alt=""
                  fill
                  preload={i === 0}
                  /* Our own stills blur in; a YouTube thumbnail (a URL) has none. */
                  placeholder={typeof episode.poster === "string" ? "empty" : "blur"}
                  sizes="(min-width: 1280px) 46rem, (min-width: 1024px) 60vw, 100vw"
                  className="watch-slide object-cover"
                  data-on={i === at || undefined}
                />
              ))}
              <PlayBadge size="h-16 w-16 sm:h-20 sm:w-20" icon="h-8 w-8 sm:h-10 sm:w-10" />
            </button>
            <div
              className="watch-panel clay relative isolate flex flex-col items-start justify-center gap-4 overflow-hidden p-5 pe-28 sm:p-8 sm:pe-40 lg:pe-8"
            >
              <Image src={pinki} alt="" sizes="(min-width: 640px) 12rem, 7rem" className="watch-panel-pinki" />
              <div key={hero.id} className="anim-rise-in flex flex-col items-start gap-4">
                <span dir={dir} className="clay-chip watch-panel-chip">
                  {at === 0 ? words.latestEpisode : words.episodesTitle}
                </span>
                <p dir="ltr" className="min-h-[2lh] text-start text-2xl font-bold leading-tight text-white sm:text-3xl">
                  {hero.title}
                </p>
              </div>
              <Button3D
                tone={{ face: "#fff", text: "var(--color-ink-fixed)" }}
                onClick={() => play({ kind: "episode", item: hero })}
                className="btn3d--clay-white px-7 py-3 text-lg"
              >
                <Play className="h-5 w-5 fill-current text-[#f2569b]" strokeWidth={2.5} />
                <span dir={dir}>{words.watchNow}</span>
              </Button3D>
              {episodes.length > 1 && (
                <div className="mt-1 flex items-center gap-2">
                  {episodes.map((episode, i) => (
                    <button
                      key={episode.id}
                      type="button"
                      onClick={() => setAt(i)}
                      aria-label={format(words.showEpisode, { n: episodes.length - i })}
                      aria-current={i === at || undefined}
                      className={`relative h-2.5 cursor-pointer overflow-hidden rounded-full bg-white/35 transition-[width] duration-500 ${i === at ? "w-10" : "w-2.5 hover:bg-white/60"}`}
                    >
                      {i === at && <span key={`${episode.id}-${hovered}-${Boolean(playing)}`} aria-hidden className={`absolute inset-0 rounded-full bg-white ${still ? "" : "watch-dot-fill"}`} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section aria-label={words.songsTitle} className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10">
          <h2 dir={dir} className="flex items-center gap-3 text-2xl font-bold text-[var(--color-ink)] sm:text-3xl lg:sticky lg:top-28 lg:self-start lg:text-2xl">
            <SectionDot icon={<Music className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />} dot="var(--accent)" />
            {words.songsTitle}
          </h2>

          <div className="flex flex-col items-center gap-8">
            <ul className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
              {songs.slice(0, songCount).map((song) => (
                <li key={song.src}>
                  <button
                    type="button"
                    onClick={() => play({ kind: "song", item: song })}
                    aria-label={format(words.songAria, { title: song.title })}
                    className="card card-clay-white card-lift card-lift--still watch-song group flex h-full w-full cursor-pointer flex-col gap-2 p-2 text-start sm:gap-2.5 sm:p-2.5"
                  >
                    <span className="watch-song-window">
                      <span aria-hidden className="img-wait" />
                      <Image src={song.poster} alt="" fill sizes="(min-width: 1280px) 20rem, (min-width: 640px) 30vw, 45vw" className="object-cover" />
                      <PlayBadge size="h-11 w-11 sm:h-12 sm:w-12" icon="h-5 w-5 sm:h-6 sm:w-6" />
                    </span>
                    <span dir="ltr" className="px-1.5 pb-1 text-[0.95rem] font-bold leading-snug text-[var(--color-ink)] sm:px-2 sm:text-lg">
                      {song.title}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {songCount < songs.length && (
              <Button3D tone={{ face: "var(--brand)", edge: "var(--brand-dark)", text: "#fff" }} onClick={() => setSongCount(songCount + SONG_PAGE)} className="px-8 py-3 text-lg">
                <span dir={dir}>{words.more}</span>
                <ChevronDown className="h-5 w-5" strokeWidth={3} />
              </Button3D>
            )}
          </div>
        </section>

        <section aria-label={words.reelsTitle} className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10">
          <div className="flex flex-col gap-3 lg:sticky lg:top-28 lg:self-start">
            <h2 dir={dir} className="flex items-center gap-3 text-2xl font-bold text-[var(--color-ink)] sm:text-3xl lg:text-2xl">
              <SectionDot icon={<Clapperboard className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />} dot="var(--brand)" />
              {words.reelsTitle}
            </h2>
            <div role="group" aria-label={words.filterAria} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1.5 sm:mx-0 sm:flex-wrap sm:px-0 lg:flex-col lg:gap-2">
              {chip("all", words.filterAll)}
              {courses.map((course) => chip(course.id, course.name))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-8">
            <ul className="grid w-full grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
              {shown.map((clip) => (
                <li key={clip.src}>
                  <button
                    type="button"
                    onClick={() => play({ kind: "clip", item: clip })}
                    aria-label={format(words.clipAria, { title: clip.title })}
                    className="card card-lift card-lift--still group relative block aspect-[9/16] w-full cursor-pointer overflow-hidden"
                  >
                    <span aria-hidden className="img-wait" />
                    <Image src={clip.poster} alt="" fill sizes="(min-width: 1280px) 15rem, (min-width: 1024px) 18vw, (min-width: 640px) 22vw, 45vw" className="object-cover" />
                    <span dir="ltr" className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-10 text-center text-lg font-bold text-white">
                      {clip.title}
                    </span>
                    <PlayBadge size="h-12 w-12" icon="h-6 w-6" />
                  </button>
                </li>
              ))}
            </ul>
            {count < list.length && (
              <Button3D tone={{ face: "var(--brand)", edge: "var(--brand-dark)", text: "#fff" }} onClick={() => setCount(count + PAGE)} className="px-8 py-3 text-lg">
                <span dir={dir}>{words.more}</span>
                <ChevronDown className="h-5 w-5" strokeWidth={3} />
              </Button3D>
            )}
          </div>
        </section>
      </div>

      <dialog
        ref={dialog}
        aria-label={playing?.item.title}
        onClose={() => setPlaying(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
        className={`m-auto overflow-visible bg-transparent p-0 backdrop:bg-[rgb(var(--shadow-hue)/65%)] ${
          playing && playing.kind !== "clip" ? "w-[min(60rem,calc(100%-2rem))]" : "w-[min(24rem,calc(100%-2.5rem))]"
        }`}
      >
        {playing && (
          <div className="card card-clay-white anim-pop-in relative p-3">
            {playing.kind === "episode" ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${playing.item.id}?autoplay=1&rel=0`}
                title={playing.item.title}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                className="aspect-video w-full rounded-2xl bg-black"
              />
            ) : playing.kind === "song" ? (
              <video
                key={playing.item.src}
                src={playing.item.src}
                poster={playing.item.poster}
                controls
                autoPlay
                playsInline
                className="aspect-video max-h-[78svh] w-full rounded-2xl bg-black object-contain"
              />
            ) : (
              <video
                key={playing.item.src}
                src={playing.item.src}
                poster={playing.item.poster}
                controls
                autoPlay
                playsInline
                className="aspect-[9/16] max-h-[78svh] w-full rounded-2xl bg-black object-contain"
              />
            )}
            <span className="absolute end-5 top-5">
              <Button3D
                tone={{ face: "var(--accent)", edge: "var(--accent-dark)", text: "#fff" }}
                onClick={() => dialog.current?.close()}
                aria-label={words.close}
                className="h-11 w-11"
              >
                <X className="h-5 w-5" strokeWidth={3} />
              </Button3D>
            </span>
          </div>
        )}
      </dialog>
    </>
  );
}
