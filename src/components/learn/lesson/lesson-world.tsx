"use client";

import { useEffect, useEffectEvent, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { useWide } from "@/lib/use-wide";
import type { LessonWorld } from "@/types/course";

/** A still that replaces another (a restart, reduced motion, a clip that
    would not play) fades in this long — kept in step with `.world-fade`. */
const FADE_MS = 450;
/** A clip that has not ended this long after its own length has stalled:
    the camera is put where it was going. */
const STALL_MS = 1500;

interface LessonWorldViewProps {
  world: LessonWorld;
  /** Where the camera is, or is going: the step after the reel it stands
      for (0 = the first). -1 during the reel: the entry waits, its first
      frame showing. */
  station: number;
  /** The camera has arrived at `station` — its step may show. */
  onArrive: () => void;
}

/** The world's frame as a `fixed` cover box: the picture's own aspect,
    covering the whole (large) viewport — what a Find in it lays its things
    over (`.world-cover`). */
export function worldCover(wide: boolean): CSSProperties {
  return { "--world-ar": wide ? 16 / 9 : 9 / 16 } as CSSProperties;
}

/**
 * A lesson's world behind its steps (2026-11-02, Pinki's Shapes first —
 * `edenic-plan.md` Phase 7): the still of where the camera stands for the
 * step, and, when the step changes, the camera's move there — a clip,
 * rendered in the world, its last frame that step's still. The next move
 * is always loaded already, so a step's end goes straight into it.
 *
 * Out of focus behind a step that needs the child's attention; for a step
 * played IN the world (a Find) the clip pulls focus and the step lays its
 * things over the same frame. A walk opens on the flower of the step just
 * done blooming; the lesson's end is one more station — the camera rising
 * over the path in bloom. Reduced motion, a stall or a refused play: the
 * next still fades in instead. Fixed to the whole viewport under the page
 * (`-z-[5]`, over the classroom's wall), never over the header.
 */
export function LessonWorldView({ world, station, onArrive }: LessonWorldViewProps) {
  const wide = useWide();
  const frame = wide ? "landscape" : "portrait";
  /* The still under the clips: the last station the camera reached. */
  const [shown, setShown] = useState(-1);
  /* The clip on top (its index = the station it goes to): the one playing,
     then — ended on its last frame, which IS the station — until the next
     one plays. None after a jump: the still shows. */
  const [top, setTop] = useState<number | null>(0);
  const videos = useRef(new Map<number, HTMLVideoElement>());
  const last = useRef(-1);
  const lastFrame = useRef(frame);
  /* The station the camera last got to. */
  const reached = useRef(-1);
  const stall = useRef<number | undefined>(undefined);

  const arrive = (at: number) => {
    window.clearTimeout(stall.current);
    reached.current = at;
    setShown(at);
    onArrive();
  };
  /* The same, from inside the effect below (its timers and its refused play). */
  const arriveLater = useEffectEvent(arrive);

  /* A new station: walk there if it is the next one along (or the entry);
     otherwise — a restart — it fades in. Turned on its side (or the frame
     first settling, as the page hydrates) halfway through a move: the
     move again, in the frame now showing; after it, that frame's still. */
  useEffect(() => {
    const from = last.current;
    const turned = lastFrame.current !== frame;
    last.current = station;
    lastFrame.current = frame;
    if (station < 0 || (station === from && !turned)) return;
    const walking = station === from + 1 || (station === from && reached.current !== station);
    const video = videos.current.get(station);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!walking || !video || still) {
      setTop(null);
      setShown(station);
      const timer = window.setTimeout(() => arriveLater(station), FADE_MS);
      return () => window.clearTimeout(timer);
    }
    setTop(station);
    video.currentTime = 0;
    video.play().catch(() => {
      setTop(null);
      arriveLater(station);
    });
    const length = Number.isFinite(video.duration) ? video.duration * 1000 : 2600;
    stall.current = window.setTimeout(() => arriveLater(station), length + STALL_MS);
    return () => window.clearTimeout(stall.current);
  }, [station, frame]);

  /* During the reel (again, after Play again) the entry's first frame waits. */
  const onTop = station < 0 ? 0 : top;
  const stillAt = world.stations[shown];
  /* The clips kept in the page: the one on top and the next one, loading.
     Before the entry its first frame is on top (behind the reel on a wide
     screen). */
  const mounted = [...new Set([onTop ?? -1, station, station + 1])].filter((i) => i >= 0 && i < world.moves.length && world.moves[i]);

  return (
    <div className="world-frame -z-[5]" aria-hidden>
      <div className="world-cover" style={worldCover(wide)}>
        {stillAt && (
          <Image
            key={`${frame}-${shown}`}
            src={stillAt[frame]}
            alt=""
            fill
            preload={shown === 0}
            sizes="100vw"
            className="world-fade object-cover"
          />
        )}
        {mounted.map((i) => (
          <video
            key={`${frame}-${i}`}
            ref={(element) => {
              if (element) videos.current.set(i, element);
              else videos.current.delete(i);
            }}
            src={world.moves[i]?.[frame]}
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            onEnded={() => i === station && arrive(i)}
            onError={() => {
              if (i !== onTop) return;
              setTop(null);
              setShown(i);
              if (i === station) arrive(i);
            }}
            className={`absolute inset-0 h-full w-full object-cover ${i === onTop ? "" : "opacity-0"}`}
          />
        ))}
      </div>
    </div>
  );
}
