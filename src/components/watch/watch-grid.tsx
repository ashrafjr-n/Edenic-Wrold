"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Play, X } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";
import { format } from "@/lib/format-dict";
import type { LessonId } from "@/types/lesson";
import type { WatchClip, WatchCourse, WatchEpisode } from "@/data/watch";

interface WatchGridProps {
  episodes: readonly WatchEpisode[];
  courses: readonly WatchCourse[];
  clips: readonly WatchClip[];
  words: {
    episodesTitle: string;
    reelsTitle: string;
    filterAll: string;
    filterAria: string;
    clipAria: string;
    episodeAria: string;
    close: string;
  };
  dir: "rtl" | "ltr";
}

type Playing = { kind: "episode"; item: WatchEpisode } | { kind: "clip"; item: WatchClip };

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

/** The round clay play badge on every tile. */
const PlayBadge = () => (
  <span
    aria-hidden
    className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[var(--accent)] shadow-lg"
  >
    <Play className="ms-0.5 h-7 w-7 fill-current" strokeWidth={2} />
  </span>
);

/**
 * `/watch`: the episodes first (YouTube, one card each), then the short
 * videos — the lessons' reels — under filter chips: "All" in a random order
 * (reshuffled each time it is picked), or one course in its lesson order.
 * Whatever is tapped plays in a native `<dialog>` that mounts its player only
 * while open, so a closed one never loads or keeps playing.
 */
export function WatchGrid({ episodes, courses, clips, words, dir }: WatchGridProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [playing, setPlaying] = useState<Playing | null>(null);
  const [filter, setFilter] = useState<LessonId | "all">("all");
  const [order, setOrder] = useState<readonly WatchClip[]>(clips);

  /* After mount, so the server's fixed order and the first client render agree. */
  useEffect(() => {
    const timer = setTimeout(() => setOrder(shuffled(clips)));
    return () => clearTimeout(timer);
  }, [clips]);

  const pick = (next: LessonId | "all") => {
    setFilter(next);
    if (next === "all") setOrder(shuffled(clips));
  };
  const shown = filter === "all" ? order : clips.filter((clip) => clip.courseId === filter);

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
        className={`shrink-0 cursor-pointer whitespace-nowrap rounded-full px-5 py-2.5 text-lg font-bold transition-colors ${
          on ? "bg-[var(--brand)] text-white" : "bg-[var(--surface)] text-[var(--color-ink)]"
        }`}
        style={{ boxShadow: on ? "0 3px 0 var(--brand-dark)" : "0 3px 0 rgb(var(--shadow-hue) / 18%)" }}
      >
        <span dir={dir}>{label}</span>
      </button>
    );
  };

  return (
    <>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <section className="flex flex-col gap-4">
          <h2 dir={dir} className="text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
            {words.episodesTitle}
          </h2>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {episodes.map((episode) => (
              <li key={episode.id}>
                <button
                  type="button"
                  onClick={() => play({ kind: "episode", item: episode })}
                  aria-label={format(words.episodeAria, { title: episode.title })}
                  className="card card-lift relative block aspect-video w-full cursor-pointer overflow-hidden"
                >
                  <Image src={episode.poster} alt="" fill sizes="(min-width: 1024px) 24rem, (min-width: 640px) 45vw, 100vw" className="object-cover" />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-10 text-start text-lg font-bold text-white" dir="ltr">
                    {episode.title}
                  </span>
                  <PlayBadge />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <h2 dir={dir} className="text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
            {words.reelsTitle}
          </h2>
          <div role="group" aria-label={words.filterAria} className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
            {chip("all", words.filterAll)}
            {courses.map((course) => chip(course.id, course.name))}
          </div>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
            {shown.map((clip) => (
              <li key={clip.src}>
                <button
                  type="button"
                  onClick={() => play({ kind: "clip", item: clip })}
                  aria-label={format(words.clipAria, { title: clip.title })}
                  className="card card-lift relative block aspect-[9/16] w-full cursor-pointer overflow-hidden"
                >
                  <Image src={clip.poster} alt="" fill sizes="(min-width: 1024px) 14rem, (min-width: 640px) 30vw, 45vw" className="object-cover" />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-10 text-center text-xl font-bold text-white" dir="ltr">
                    {clip.title}
                  </span>
                  <PlayBadge />
                </button>
              </li>
            ))}
          </ul>
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
          playing?.kind === "episode" ? "w-[min(60rem,calc(100%-2rem))]" : "w-[min(24rem,calc(100%-2.5rem))]"
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
