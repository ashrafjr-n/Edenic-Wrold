"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Play, SkipForward } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";
import { Loader } from "@/components/ui/loader";

/** Kept in step with `.morph-btn__icon`'s 0.55s turn in `globals.css`: the
    Skip button finishes its spin before the lesson moves on. */
const SKIP_SPIN_MS = 520;

/** The loader always comes first (direct request: "loading, THEN the
    video") — at least this long, however fast the clip arrives. */
const LOADER_MS = 1200;

interface ReelVideoProps {
  src: string;
  /** Names the clip for a screen reader. */
  label: string;
  /** Art shown in the clip's place if it cannot load. */
  image: string;
  /** "Loading…", read out while the clip loads. */
  loadingLabel: string;
  skipLabel: string;
  /** Names the big Play button shown when the browser refuses autoplay. */
  playLabel: string;
  /** Skip and Play wear the course's colour. */
  tone: { face: string; edge: string; text: string };
  /** The reel ended, or the child skipped it. Called once. */
  onDone: () => void;
}

/**
 * A lesson's reel, filling the whole stage: edge to edge on a phone (header
 * above, bottom nav below, the back button floating over it), a tall 9:16
 * frame under the back row from `sm` up. It plays once and hands on by
 * itself when it ends; the round Skip button in the bottom-right corner
 * spins, then does the same.
 *
 * Positioned against `<main>` (`absolute inset-0`), so it covers exactly the
 * space between the chrome whatever the viewport. A desktop is the
 * exception: there it sits in the lesson's middle column, on the board the
 * steps after it play on, with the watch and lesson panels either side.
 */
export function ReelVideo({ src, label, image, loadingLabel, skipLabel, playLabel, tone, onDone }: ReelVideoProps) {
  const video = useRef<HTMLVideoElement>(null);
  const done = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  const [spinning, setSpinning] = useState(false);
  /* The browser refused to start the reel even muted (Low Power Mode, data
     saver, an autoplay policy): a big Play button asks for the one tap. */
  const [blocked, setBlocked] = useState(false);
  /* The loader first — for `LOADER_MS` AND until the clip can play — and
     only then the clip, fading in (no movement) and starting from its
     first frame. A clip that fails shows the lesson's art instead. */
  const [waited, setWaited] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [failed, setFailed] = useState(false);
  const ready = waited && canPlay;

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    const wait = window.setTimeout(() => setWaited(true), LOADER_MS);
    /* Ready (or broken) before React was listening: no event will come. */
    const el = video.current;
    if (el?.error) setFailed(true);
    else if (el && el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) setCanPlay(true);
    return () => window.clearTimeout(wait);
  }, []);

  /* A browser may refuse autoplay WITH sound; play it muted then rather than
     leave a still frame. If even that is refused, show the Play button. */
  useEffect(() => {
    const el = video.current;
    if (!ready || !el) return;
    el.play().catch(() => {
      el.muted = true;
      return el.play().catch(() => setBlocked(true));
    });
  }, [ready]);

  const play = () => {
    const el = video.current;
    if (!el) return;
    el.muted = false;
    setBlocked(false);
    el.play().catch(() => setBlocked(true));
  };

  const finish = () => {
    if (done.current) return;
    done.current = true;
    onDone();
  };

  const skip = () => {
    if (spinning) return;
    setSpinning(true);
    video.current?.pause();
    timer.current = window.setTimeout(finish, SKIP_SPIN_MS);
  };

  return (
    <div className="absolute inset-0 flex justify-center sm:px-8 sm:pb-6 sm:pt-24 lg:relative lg:inset-auto lg:min-h-0 lg:flex-1 lg:p-0">
      {/* Desktop: the frame stands on the open stage every step after it
          plays on. */}
      <div className="lesson-board contents lg:flex lg:w-full lg:justify-center lg:p-5">
        <div className="relative h-full w-full overflow-hidden bg-[var(--surface)] sm:aspect-[9/16] sm:w-auto sm:max-w-full sm:rounded-[1.75rem] sm:shadow-[0_20px_44px_-18px_rgb(var(--shadow-hue)/0.34)]">
          {failed && (
            <Image
              src={image}
              alt=""
              fill
              sizes="(min-width: 640px) 28rem, 100vw"
              className="select-none object-contain p-12 opacity-90"
            />
          )}
          {!ready && !failed && (
            <span className="absolute inset-0 flex items-center justify-center">
              <Loader label={loadingLabel} />
            </span>
          )}

          <video
            ref={video}
            src={src}
            playsInline
            preload="auto"
            aria-label={label}
            onEnded={finish}
            onCanPlay={() => setCanPlay(true)}
            onError={() => setFailed(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}
          />

          {blocked && (
            <span className="absolute inset-0 flex items-center justify-center">
              <Button3D
                tone={tone}
                onClick={play}
                aria-label={playLabel}
                className="anim-pop-in h-24 w-24 sm:h-28 sm:w-28"
              >
                <Play className="ms-1.5 h-11 w-11 fill-current" strokeWidth={2.5} />
              </Button3D>
            </span>
          )}

          {/* The wrapper places it: `.btn3d` is unlayered and sets
              `position: relative`, which would beat an `absolute` utility. */}
          <span className="absolute bottom-5 right-5 sm:bottom-6 sm:right-6">
            <Button3D
              tone={tone}
              onClick={skip}
              aria-label={skipLabel}
              className="lesson-onward h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]"
            >
              <span className="morph-btn__icon" style={{ rotate: spinning ? "360deg" : "0deg" }}>
                <SkipForward className="h-7 w-7 fill-current" strokeWidth={2.5} />
              </span>
            </Button3D>
          </span>
        </div>
      </div>
    </div>
  );
}
