"use client";

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { Camera, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { BackRow } from "@/components/ui/back-button";
import { Button3D } from "@/components/ui/button-3d";
import { FriendSays } from "@/components/ui/friend-says";
import { AgainButton, NextButton } from "@/components/ui/morph-button";
import { CLASSROOMS } from "@/data/classroom";
import type { FindStage } from "@/data/find-stages";
import type { FIND_PLACES } from "@/data/find-places";
import { lessonCue, playCue, playSfx } from "@/lib/cue";
import { format } from "@/lib/format-dict";
import type { Dictionary } from "@/lib/dictionaries/en";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { useWide } from "@/lib/use-wide";
import { findKey, useProgress } from "@/store/progress";

type Place = (typeof FIND_PLACES)[keyof typeof FIND_PLACES];
type Shape = Place["landscape"] | Place["portrait"];

/** The room slides this much slower than the counter; the near things `kFront` faster. */
const K_BACK = 0.55;
/** Never less than this much to look round: a wide, short screen shows the layers taller. */
const MIN_LOOK = 0.15;
/** A tap moves less than this, px; a drag more. */
const TAP_PX = 10;
/** The near layer counts as in the way where its picture is this opaque (0–255). */
const COVERED = 140;
/** The hints, from when the hunt starts: the thing stirs (and rustles) every
    `WIGGLE_MS` (`find-stir`'s period); then twinkles; then the arrow its way pulses; then it glows. */
const WIGGLE_MS = 5000;
const SPARKLE_MS = 10000;
const POINT_MS = 15000;
const GLOW_MS = 22000;
/** Found: it pops, the camera frames it, the flash, the photo, the photo into the album. */
const FLASH_MS = 700;
const PHOTO_MS = FLASH_MS + 250;
const FLY_MS = PHOTO_MS + 1700;
const TALK_MS = FLY_MS + 900;

type Phase = "intro" | "play" | "found" | "photo" | "fly" | "talk" | "done";

interface FindPlayProps {
  stage: FindStage;
  place: Place;
  total: number;
  words: Dictionary["findGame"];
  again: string;
  next: string;
  dir: "rtl" | "ltr";
}

interface Frame {
  w: number;
  h: number;
  /** The layers' height, and the middle layer's width. */
  l: number;
  midW: number;
  /** How far the camera can move each way from the middle, px. */
  reach: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const ease = (t: number) => 1 - (1 - t) ** 3;

/**
 * One stage of Find: a place seen through a camera, in three depth layers
 * (the room, the counter, the near things before the lens) that slide at
 * their own speeds as the child drags to look round — a parallax, so the
 * near things pass in front of what is behind them, and the thing to find
 * is peeked out from behind one. Visual first: it stirs, twinkles, the
 * arrow its way pulses, at last it glows; its rustle (from its side of the
 * screen) is only an extra. Found: it pops, the camera frames it, a flash,
 * and its photo flies into the album (the chip in the back row), then Nova
 * cheers. Arrow buttons and the arrow keys look round too; the thing itself
 * is a button for a keyboard.
 */
export function FindPlay({ stage, place, total, words, again, next, dir }: FindPlayProps) {
  const done = useProgress((state) => state.hydrated && Boolean(state.items[findKey(stage.n)]));
  const photos = useProgress((state) =>
    state.hydrated ? Object.keys(state.items).filter((key) => key.startsWith("find.")).length : 0,
  );
  const complete = useProgress((state) => state.complete);
  const hydrated = useProgress((state) => state.hydrated);
  const thing = stage.thing;
  /* A wide screen's frame, or a phone's (taller, a near table below). */
  const wide = useWide();
  const art = stage.art[wide ? "landscape" : "portrait"];
  const shape: Shape = place[wide ? "landscape" : "portrait"];
  const say = (line: string) => format(line, { thing });

  const boxRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const thingRef = useRef<HTMLButtonElement>(null);
  const frame = useRef<Frame>({ w: 0, h: 0, l: 0, midW: 0, reach: 0 });
  /* Where the camera stands: -reach … reach from the middle. */
  const dx = useRef(0);
  const glide = useRef(0);
  const frontAlpha = useRef<{ data: Uint8ClampedArray; w: number; h: number } | null>(null);
  const timers = useRef<number[]>([]);

  const [chosen, setPhase] = useState<Phase | null>(null);
  /* The first time, Nova asks; a stage already found starts straight in. */
  const phase: Phase | null = chosen ?? (!hydrated ? null : done ? "play" : "intro");
  const [loaded, setLoaded] = useState(0);
  const [hint, setHint] = useState({ stir: false, sparkle: false, point: 0, glow: false });
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [flight, setFlight] = useState<CSSProperties | null>(null);
  const [round, setRound] = useState(0);

  useScrollLock(true);
  const later = (ms: number, run: () => void) => timers.current.push(window.setTimeout(run, ms));
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  /* ---- The camera ---- */
  const paint = useCallback(() => {
    const { w, midW, reach } = frame.current;
    const at = clamp(dx.current, -reach, reach);
    dx.current = at;
    const lay = (el: HTMLDivElement | null, width: number, k: number) => {
      if (el) el.style.transform = `translate3d(${(w - width) / 2 - k * at}px, 0, 0)`;
    };
    lay(backRef.current, midW, K_BACK);
    lay(midRef.current, midW, 1);
    lay(frontRef.current, midW * place.kFront, place.kFront);
  }, [place.kFront]);

  const measure = useCallback(() => {
    const box = boxRef.current;
    if (!box) return;
    const { width: w, height: h } = box.getBoundingClientRect();
    const l = Math.max(h, w / (shape.aMid * (1 - MIN_LOOK)));
    const midW = shape.aMid * l;
    frame.current = { w, h, l, midW, reach: Math.max(0, (midW - w) / 2) };
    const top = (h - l) * 0.6;
    const size = (el: HTMLDivElement | null, width: number) => {
      if (!el) return;
      el.style.width = `${width}px`;
      el.style.height = `${l}px`;
      el.style.top = `${top}px`;
    };
    size(backRef.current, midW);
    size(midRef.current, midW);
    size(frontRef.current, midW * place.kFront);
    paint();
  }, [shape.aMid, place.kFront, paint]);

  useEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    if (boxRef.current) observer.observe(boxRef.current);
    return () => observer.disconnect();
  }, [measure]);

  /* A smooth move of the camera to `to` (the arrows, the keys, framing the find). */
  const moveTo = useCallback(
    (to: number, ms = 650) => {
      cancelAnimationFrame(glide.current);
      const from = dx.current;
      const target = clamp(to, -frame.current.reach, frame.current.reach);
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const start = performance.now();
      const step = (now: number) => {
        const t = still ? 1 : Math.min(1, (now - start) / ms);
        dx.current = from + (target - from) * ease(t);
        paint();
        if (t < 1) glide.current = requestAnimationFrame(step);
      };
      glide.current = requestAnimationFrame(step);
    },
    [paint],
  );
  const look = (side: -1 | 1) => moveTo(dx.current + side * frame.current.w * 0.55);

  /* The near layer's picture, small, to know where it is in the way. */
  const readFront = (img: HTMLImageElement) => {
    const probe = new window.Image();
    probe.onload = () => {
      const w = 512;
      const h = Math.round((w * probe.naturalHeight) / probe.naturalWidth);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) return;
      context.drawImage(probe, 0, 0, w, h);
      frontAlpha.current = { data: context.getImageData(0, 0, w, h).data, w, h };
    };
    probe.src = img.currentSrc || img.src;
  };

  const coveredAt = (x: number, y: number) => {
    const alpha = frontAlpha.current;
    const box = frontRef.current?.getBoundingClientRect();
    if (!alpha || !box) return false;
    const px = Math.floor(((x - box.left) / box.width) * alpha.w);
    const py = Math.floor(((y - box.top) / box.height) * alpha.h);
    if (px < 0 || py < 0 || px >= alpha.w || py >= alpha.h) return false;
    return alpha.data[(py * alpha.w + px) * 4 + 3] > COVERED;
  };

  /* ---- Found ---- */
  const found = () => {
    if (phase !== "play") return;
    setPhase("found");
    setHint({ stir: false, sparkle: false, point: 0, glow: false });
    playSfx("found");
    void playCue(lessonCue.word(thing));
    /* The camera frames it: the thing to the middle of the screen. */
    const rect = thingRef.current?.getBoundingClientRect();
    const box = boxRef.current?.getBoundingClientRect();
    if (rect && box) moveTo(dx.current + (rect.left + rect.width / 2 - (box.left + box.width / 2)), 600);
    later(FLASH_MS, () => {
      setPhase("photo");
      playSfx("snap");
    });
    later(FLY_MS, () => {
      /* Into the album: from the middle of the stage to the chip. */
      const chip = document.querySelector("[data-find-album]")?.getBoundingClientRect();
      const stageBox = boxRef.current?.getBoundingClientRect();
      if (chip && stageBox) {
        setFlight({
          "--to-x": `${chip.left + chip.width / 2 - (stageBox.left + stageBox.width / 2)}px`,
          "--to-y": `${chip.top + chip.height / 2 - (stageBox.top + stageBox.height / 2)}px`,
        } as CSSProperties);
      }
      setPhase("fly");
      playSfx("whoosh");
    });
    later(FLY_MS + 700, () => {
      complete(findKey(stage.n), 1);
      playSfx("plop");
    });
    later(TALK_MS, () => setPhase("talk"));
  };

  /* ---- Dragging, tapping, the wheel, the keys ---- */
  const drag = useRef<{ id: number; x: number; y: number; at: number; t: number; moved: boolean; v: number; last: [number, number] } | null>(null);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (phase !== "play" || (event.target as HTMLElement).closest("[data-find-ui]")) return;
    cancelAnimationFrame(glide.current);
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, at: dx.current, t: performance.now(), moved: false, v: 0, last: [event.clientX, performance.now()] };
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== event.pointerId) return;
    const off = event.clientX - d.x;
    if (Math.abs(off) > TAP_PX || Math.abs(event.clientY - d.y) > TAP_PX) d.moved = true;
    if (!d.moved) return;
    const now = performance.now();
    const [lx, lt] = d.last;
    if (now > lt) d.v = 0.8 * d.v + 0.2 * ((event.clientX - lx) / (now - lt));
    d.last = [event.clientX, now];
    dx.current = d.at - off;
    paint();
  };
  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== event.pointerId) return;
    drag.current = null;
    if (d.moved) {
      /* Let go mid-swipe: it glides on and slows. */
      moveTo(dx.current - d.v * 260, 700);
      return;
    }
    tap(event.clientX, event.clientY);
  };

  const tap = (x: number, y: number) => {
    const rect = thingRef.current?.getBoundingClientRect();
    const pad = rect ? Math.min(rect.width, rect.height) * 0.12 : 0;
    const onThing = rect && x >= rect.left - pad && x <= rect.right + pad && y >= rect.top - pad && y <= rect.bottom + pad;
    if (onThing && !coveredAt(x, y)) {
      found();
      return;
    }
    const box = boxRef.current?.getBoundingClientRect();
    if (!box) return;
    playSfx("tap");
    const id = performance.now();
    setRipples((list) => [...list.slice(-3), { id, x: x - box.left, y: y - box.top }]);
    later(700, () => setRipples((list) => list.filter((r) => r.id !== id)));
  };

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const onWheel = (event: WheelEvent) => {
      if (phase !== "play") return;
      event.preventDefault();
      cancelAnimationFrame(glide.current);
      dx.current += Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      paint();
    };
    box.addEventListener("wheel", onWheel, { passive: false });
    return () => box.removeEventListener("wheel", onWheel);
  }, [phase, paint]);

  /* ---- The hints: seen first, heard as an extra ---- */
  useEffect(() => {
    if (phase !== "play") return;
    const start = performance.now();
    const side = () => {
      const rect = thingRef.current?.getBoundingClientRect();
      const box = boxRef.current?.getBoundingClientRect();
      if (!rect || !box) return 0;
      return clamp((rect.left + rect.width / 2 - (box.left + box.width / 2)) / (box.width / 2), -1, 1);
    };
    const tick = window.setInterval(() => {
      const t = performance.now() - start;
      setHint({ stir: t >= WIGGLE_MS, sparkle: t >= SPARKLE_MS, point: t >= POINT_MS ? (side() < 0 ? -1 : 1) : 0, glow: t >= GLOW_MS });
    }, 250);
    const rustle = window.setInterval(() => playSfx("rustle", undefined, { pan: side(), volume: 0.55 }), WIGGLE_MS);
    return () => {
      window.clearInterval(tick);
      window.clearInterval(rustle);
    };
  }, [phase, round]);

  const replay = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    setFlight(null);
    setRipples([]);
    setHint({ stir: false, sparkle: false, point: 0, glow: false });
    dx.current = 0;
    paint();
    setRound((r) => r + 1);
    setPhase("play");
  };

  const ready = loaded >= 3;
  const hunting = phase === "play";
  const shown = phase === "found" || phase === "photo" || phase === "fly";
  const thingBox = { left: `${shape.thing[0]}%`, top: `${shape.thing[1]}%`, width: `${shape.thing[2]}%`, height: `${shape.thing[3]}%` };
  const counted = Math.min(total, photos);

  return (
    <>
      <BackRow href="/play/find" label={words.backToAlbum}>
        <span className="flex items-center gap-2.5 sm:gap-3">
          <Button3D
            tone={{ face: "var(--surface)", text: "var(--color-ink-fixed)" }}
            variant="calm"
            aria-label={say(words.hearAria)}
            onClick={() => void playCue(lessonCue.word(thing))}
            data-sfx="none"
            className="btn3d--clay-white h-12 shrink-0 gap-2 ps-2 pe-4 text-base font-bold sm:h-14 sm:text-lg"
          >
            <Image src={art.thing} alt="" sizes="40px" className="h-9 w-9 object-contain sm:h-10 sm:w-10" />
            <span dir={dir}>{format(words.ask, { thing })}</span>
          </Button3D>
          <Link
            href="/play/find"
            data-find-album
            aria-label={format(words.albumAria, { n: counted, total })}
            className={`discover-chip find-album-chip ${phase === "talk" || phase === "done" ? "find-album-chip--got" : ""}`}
          >
            <Camera className="h-6 w-6" strokeWidth={2.4} aria-hidden />
            <span aria-hidden dir="ltr">
              {counted}/{total}
            </span>
          </Link>
        </span>
      </BackRow>

      <div
        ref={boxRef}
        role="group"
        aria-label={say(words.sceneAria)}
        tabIndex={0}
        onKeyDown={(event) => {
          if (phase !== "play") return;
          if (event.key === "ArrowLeft") look(-1);
          if (event.key === "ArrowRight") look(1);
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (drag.current = null)}
        className={`find-stage ${ready ? "find-stage--ready" : ""} ${phase !== null && phase !== "intro" && phase !== "play" ? "find-stage--found" : ""}`}
      >
        {/* The layers wait for the client: only it knows the screen's frame (the server answers portrait). */}
        <div ref={backRef} className="find-layer" aria-hidden>
          {hydrated && <Image key={`b${wide}`} src={art.back} alt="" fill placeholder="blur" sizes="(orientation: portrait) 330vw, 160vw" onLoad={() => setLoaded((n) => n + 1)} />}
        </div>
        <div ref={midRef} className="find-layer">
          {hydrated && <Image key={`m${wide}`} src={art.mid} alt="" fill sizes="(orientation: portrait) 330vw, 160vw" onLoad={() => setLoaded((n) => n + 1)} />}
          <button
            ref={thingRef}
            type="button"
            data-find-ui
            aria-label={thing}
            tabIndex={hunting ? 0 : -1}
            onClick={(event) => {
              /* A pointer's tap is judged by the stage (in the way or not); this is the keyboard's. */
              if (event.detail === 0) found();
            }}
            className={`find-thing ${shown ? "find-thing--found" : ""} ${hint.glow ? "find-thing--glow" : ""}`}
            style={thingBox}
          >
            <Image
              src={art.thing}
              alt=""
              fill
              sizes="(orientation: portrait) 40vw, 16vw"
              className={`find-thing-pic ${hunting && hint.stir ? "find-thing-pic--stir" : ""}`}
            />
            {hunting && hint.sparkle && (
              <span className="find-twinkle" style={{ left: `${shape.leaf[0]}%`, top: `${shape.leaf[1]}%` }} aria-hidden>
                <Sparkles strokeWidth={2.2} />
              </span>
            )}
          </button>
        </div>
        <div ref={frontRef} className="find-layer find-layer--front" aria-hidden>
          {hydrated && (
            <Image
              key={`f${wide}`}
              src={art.front}
              alt=""
              fill
              sizes="(orientation: portrait) 250vw, 120vw"
              onLoad={(event) => {
                readFront(event.currentTarget);
                setLoaded((n) => n + 1);
              }}
            />
          )}
        </div>

        {ripples.map((r) => (
          <span key={r.id} className="find-ripple" style={{ left: r.x, top: r.y }} aria-hidden />
        ))}

        {/* Looking round without dragging: the arrows (never mirrored — they move the picture). */}
        {hunting && (
          <>
            <Button3D
              data-find-ui
              tone={{ face: "var(--surface)", text: "var(--color-ink-fixed)" }}
              variant="calm"
              aria-label={words.lookLeft}
              onClick={() => look(-1)}
              className={`btn3d--clay-white find-look find-look--left ${hint.point === -1 ? "find-look--point" : ""}`}
            >
              <ChevronLeft className="h-8 w-8" strokeWidth={3} />
            </Button3D>
            <Button3D
              data-find-ui
              tone={{ face: "var(--surface)", text: "var(--color-ink-fixed)" }}
              variant="calm"
              aria-label={words.lookRight}
              onClick={() => look(1)}
              className={`btn3d--clay-white find-look find-look--right ${hint.point === 1 ? "find-look--point" : ""}`}
            >
              <ChevronRight className="h-8 w-8" strokeWidth={3} />
            </Button3D>
          </>
        )}

        {phase === "photo" || phase === "fly" ? <span className="find-flash" aria-hidden /> : null}
        {(phase === "photo" || phase === "fly") && (
          <figure className={`find-photo ${phase === "fly" ? "find-photo--fly" : ""}`} style={flight ?? undefined}>
            <Image src={stage.art.photo} alt="" sizes="(orientation: portrait) 60vw, 22vw" className="find-photo-pic" />
            <figcaption>{thing}</figcaption>
          </figure>
        )}

        {phase === "done" && (
          <div className="find-done" data-find-ui>
            <AgainButton label={again} onPress={replay} dir={dir} />
            <NextButton label={next} href={`/play/find?photo=${stage.n}`} dir={dir} />
          </div>
        )}
      </div>

      {(phase === "intro" || phase === "talk") &&
        createPortal(
          <FriendSays
            key={phase}
            picture={CLASSROOMS.nova.cheer}
            ink="var(--color-nova)"
            lines={phase === "intro" ? [say(words.intro1), words.intro2] : [say(words.found1), words.found2]}
            skipLabel={words.letsGo}
            dir={dir}
            onDone={() => setPhase(phase === "intro" ? "play" : "done")}
          />,
          document.body,
        )}
    </>
  );
}
