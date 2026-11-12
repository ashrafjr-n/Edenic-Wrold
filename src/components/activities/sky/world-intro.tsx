"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Clapperboard, SkipForward } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";
import { useWide } from "@/lib/use-wide";

/** The worlds whose entry scene this device has seen. */
const SEEN = "edenic-sky-intros";
/** Kept in step with `.world-intro`'s fade in `globals.css`. */
const FADE_MS = 600;

function seen(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SEEN) ?? "[]");
  } catch {
    return [];
  }
}

interface WorldIntroProps {
  world: string;
  /** The rendered clip in each frame, played by path. */
  video: { landscape: string; portrait: string };
  skipLabel: string;
  replayLabel: string;
}

/**
 * A Sky Trail world's entry scene (2026-11-12): a rendered clip over the whole
 * screen the first time the child comes to the world (the night's: a star
 * falls and is gone in the clouds, the camera comes down to the first cloud —
 * its last frame is where the page opens). Skip any time; it plays once per
 * device, then a round button beside the back button plays it again.
 *
 * Under the header and the bottom nav (`z-[15]`), over the world; portalled to
 * `body`, since the button lives in the animated back row and an animated
 * ancestor would become the overlay's containing block. Reduced motion: never
 * plays by itself.
 */
export function WorldIntro({ world, video, skipLabel, replayLabel }: WorldIntroProps) {
  const wide = useWide();
  const [playing, setPlaying] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const timer = useRef(0);

  /* The page holds still while it plays — locked on `<html>`, as `CourseWorld` locks
     it: a lock on `body` breaks the sticky header once the page is scrolled down
     (the night opens at its nearest cloud, at the bottom of the page). */
  useEffect(() => {
    if (!playing) return;
    const page = document.documentElement;
    const was = page.style.overflow;
    page.style.overflow = "hidden";
    return () => {
      page.style.overflow = was;
    };
  }, [playing]);

  /* The first visit plays it: read once, after mount (storage is the client's). */
  useEffect(() => {
    if (seen().includes(world) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const start = window.setTimeout(() => setPlaying(true), 0);
    return () => window.clearTimeout(start);
  }, [world]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const end = () => {
    if (leaving) return;
    try {
      localStorage.setItem(SEEN, JSON.stringify([...new Set([...seen(), world])]));
    } catch {
      /* Storage off: it plays again next visit. Nothing is lost. */
    }
    setLeaving(true);
    timer.current = window.setTimeout(() => {
      setPlaying(false);
      setLeaving(false);
    }, FADE_MS);
  };

  return (
    <>
      <Button3D
        variant="calm"
        tone={{ face: "var(--surface)", text: "var(--color-ink-fixed)" }}
        onClick={() => setPlaying(true)}
        aria-label={replayLabel}
        className="btn3d--clay-white h-12 w-12 !p-0 sm:h-14 sm:w-14"
      >
        <Clapperboard className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} />
      </Button3D>
      {playing &&
        createPortal(
          <div className="world-intro" data-leaving={leaving || undefined}>
            <video
              key={wide ? "landscape" : "portrait"}
              src={wide ? video.landscape : video.portrait}
              autoPlay
              muted
              playsInline
              onEnded={end}
              onError={end}
              className="world-intro-clip"
            />
            <Button3D
              tone={{ face: "var(--surface)", text: "var(--color-ink-fixed)" }}
              onClick={end}
              aria-label={skipLabel}
              className="btn3d--clay-white world-intro-skip"
            >
              <SkipForward className="h-6 w-6" strokeWidth={2.5} />
            </Button3D>
          </div>,
          document.body,
        )}
    </>
  );
}
