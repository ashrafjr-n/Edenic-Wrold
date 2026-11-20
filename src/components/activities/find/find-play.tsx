"use client";

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Check, ChevronLeft, ChevronRight, Search, Sparkles } from "lucide-react";
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
type Spot = { box: readonly number[]; leaf: readonly number[] };

/** The room slides this much slower than the counter; the near things `kFront` faster. */
const K_BACK = 0.55;
/** Never less than this much to look round: a wide, short screen shows the layers taller. */
const MIN_LOOK = 0.15;
/** A tap moves less than this, px; a drag more. */
const TAP_PX = 10;
/** The near layer counts as in the way where its picture is this opaque (0–255). */
const COVERED = 140;
/** The hints, from the hunt's start and again after each find, for what is
    still hidden: it stirs (and rustles, the nearest) every `WIGGLE_MS`
    (`find-stir`'s period); then twinkles; then the arrow to the nearest
    pulses; then they glow. */
const WIGGLE_MS = 5000;
const SPARKLE_MS = 10000;
const POINT_MS = 15000;
const GLOW_MS = 22000;
const TICK_MS = 250;
/** A find: it jumps, then flies into its slot on the list (`.find-fly`). */
const POP_MS = 450;
const FLY_MS = 750;
/** All found: a beat, the flash and the photo, the photo off to the album, Nova. */
const PHOTO_MS = 550;
const AWAY_MS = PHOTO_MS + 2100;
const TALK_MS = AWAY_MS + 800;

type Phase = "intro" | "play" | "photo" | "away" | "talk" | "done";

interface FindPlayProps {
  stage: FindStage;
  place: Place;
  words: Dictionary["findGame"];
  again: string;
  next: string;
  dir: "rtl" | "ltr";
}

interface Frame {
  w: number;
  h: number;
  /** The middle layer's width. */
  midW: number;
  /** How far the camera can move each way from the middle, px. */
  reach: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const ease = (t: number) => 1 - (1 - t) ** 3;
const NO_HINT = { stir: false, sparkle: false, point: 0, glow: false };

/**
 * One stage of Find: a place seen through a camera, in three depth layers
 * (the room, the counter, the near things before the lens) that slide at
 * their own speeds as the child drags to look round — a parallax, so the
 * near things pass in front of what is behind them, and what is hidden is
 * peeked out from behind them. Two things to find, three in a harder stage,
 * shown on Nova's list in the back row (tap one to hear its word). Visual
 * first: they stir, twinkle, the arrow to the nearest pulses, at last they
 * glow; the rustle (from its side of the screen) is only an extra. Each find
 * jumps and flies into its slot, which gets a green tick; all found, a flash
 * and the photo of them together, off to the album, then Nova cheers. Arrow
 * buttons and the arrow keys look round too; each thing is a button for a
 * keyboard.
 */
export function FindPlay({ stage, place, words, again, next, dir }: FindPlayProps) {
  const done = useProgress((state) => state.hydrated && Boolean(state.items[findKey(stage.n)]));
  const complete = useProgress((state) => state.complete);
  const hydrated = useProgress((state) => state.hydrated);
  /* A wide screen's frame, or a phone's (taller, a near table below). */
  const wide = useWide();
  const art = stage.art[wide ? "landscape" : "portrait"];
  const shape: Shape = place[wide ? "landscape" : "portrait"];
  const spot = (thing: string) => (shape.things as Record<string, Spot>)[thing];

  const boxRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const thingRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const slotRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const frame = useRef<Frame>({ w: 0, h: 0, midW: 0, reach: 0 });
  /* Where the camera stands: -reach … reach from the middle. */
  const dx = useRef(0);
  const glide = useRef(0);
  const frontAlpha = useRef<{ data: Uint8ClampedArray; w: number; h: number } | null>(null);
  const timers = useRef<number[]>([]);
  const rippleId = useRef(0);

  const [chosen, setPhase] = useState<Phase | null>(null);
  /* The first time, Nova asks; a stage already found starts straight in. */
  const phase: Phase | null = chosen ?? (!hydrated ? null : done ? "play" : "intro");
  const [loaded, setLoaded] = useState(0);
  /* Found: `taken` the moment it is tapped (it jumps, then flies), `got` once in its slot. */
  const [taken, setTaken] = useState<string[]>([]);
  const [got, setGot] = useState<string[]>([]);
  const [flights, setFlights] = useState<{ thing: string; style: CSSProperties }[]>([]);
  const [hint, setHint] = useState(NO_HINT);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
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
    frame.current = { w, h, midW, reach: Math.max(0, (midW - w) / 2) };
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

  /* A smooth move of the camera to `to` (the arrows, the keys, a swipe's glide). */
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

  /* How far each still-hidden thing is from the middle of the view (-1 left … 1 right). */
  const hiding = stage.things.filter((thing) => !taken.includes(thing));
  const sideOf = (thing: string) => {
    const rect = thingRefs.current[thing]?.getBoundingClientRect();
    const box = boxRef.current?.getBoundingClientRect();
    if (!rect || !box) return 0;
    return (rect.left + rect.width / 2 - (box.left + box.width / 2)) / (box.width / 2);
  };
  const nearest = () => hiding.reduce<string | null>((best, thing) => (best === null || Math.abs(sideOf(thing)) < Math.abs(sideOf(best)) ? thing : best), null);

  /* ---- A find ---- */
  const find = (thing: string) => {
    if (phase !== "play" || taken.includes(thing)) return;
    const left = hiding.length - 1;
    setTaken((list) => [...list, thing]);
    setHint(NO_HINT);
    playSfx("found", stage.things.length - 1 - left);
    void playCue(lessonCue.word(thing));
    /* After its jump: from where it is to its slot on the list. */
    later(POP_MS, () => {
      const from = thingRefs.current[thing]?.querySelector("img")?.getBoundingClientRect();
      const to = slotRefs.current[thing]?.querySelector("img")?.getBoundingClientRect();
      if (from && to) {
        setFlights((list) => [
          ...list,
          {
            thing,
            style: {
              left: from.left,
              top: from.top,
              width: from.width,
              height: from.height,
              "--dx": `${to.left - from.left}px`,
              "--dy": `${to.top - from.top}px`,
              "--s": to.width / from.width,
            } as CSSProperties,
          },
        ]);
      }
      playSfx("whoosh");
    });
    later(POP_MS + FLY_MS, () => {
      setFlights((list) => list.filter((f) => f.thing !== thing));
      setGot((list) => [...list, thing]);
      playSfx("plop");
    });
    if (left > 0) return;
    /* The last one: the photo of them together. */
    const end = POP_MS + FLY_MS;
    later(end + PHOTO_MS, () => {
      setPhase("photo");
      playSfx("snap");
    });
    later(end + AWAY_MS, () => {
      setPhase("away");
      complete(findKey(stage.n), 1);
    });
    later(end + TALK_MS, () => setPhase("talk"));
  };

  /* ---- Dragging, tapping, the wheel, the keys ---- */
  const drag = useRef<{ id: number; x: number; y: number; at: number; moved: boolean; v: number; last: [number, number] } | null>(null);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (phase !== "play" || (event.target as HTMLElement).closest("[data-find-ui]")) return;
    cancelAnimationFrame(glide.current);
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, at: dx.current, moved: false, v: 0, last: [event.clientX, performance.now()] };
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

  /* A tap finds what it lands on — unless a near thing is in the way there. */
  const tap = (x: number, y: number) => {
    const hit = hiding.find((thing) => {
      const rect = thingRefs.current[thing]?.getBoundingClientRect();
      if (!rect) return false;
      const pad = Math.min(rect.width, rect.height) * 0.12;
      return x >= rect.left - pad && x <= rect.right + pad && y >= rect.top - pad && y <= rect.bottom + pad;
    });
    if (hit && !coveredAt(x, y)) {
      find(hit);
      return;
    }
    const box = boxRef.current?.getBoundingClientRect();
    if (!box) return;
    playSfx("tap");
    const id = ++rippleId.current;
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

  /* ---- The hints: seen first, heard as an extra; afresh after each find ---- */
  useEffect(() => {
    if (phase !== "play" || !hiding.length) return;
    /* Counted in ticks (TICK_MS each) from the hunt's start or the last find. */
    let t = 0;
    const tick = window.setInterval(() => {
      t += TICK_MS;
      const goal = nearest();
      const side = goal ? sideOf(goal) : 0;
      setHint({ stir: t >= WIGGLE_MS, sparkle: t >= SPARKLE_MS, point: t >= POINT_MS ? (side < 0 ? -1 : 1) : 0, glow: t >= GLOW_MS });
    }, TICK_MS);
    const rustle = window.setInterval(() => {
      const goal = nearest();
      if (goal) playSfx("rustle", undefined, { pan: clamp(sideOf(goal), -1, 1), volume: 0.55 });
    }, WIGGLE_MS);
    return () => {
      window.clearInterval(tick);
      window.clearInterval(rustle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `nearest`/`sideOf` read refs; a find (`taken`) restarts the hints.
  }, [phase, round, taken.length]);

  const replay = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    setTaken([]);
    setGot([]);
    setFlights([]);
    setRipples([]);
    setHint(NO_HINT);
    dx.current = 0;
    paint();
    setRound((r) => r + 1);
    setPhase("play");
  };

  const ready = loaded >= 3;
  const hunting = phase === "play";
  const ended = phase === "photo" || phase === "away" || phase === "talk" || phase === "done";

  return (
    <>
      <BackRow href="/play/find" label={words.backToAlbum}>
        {/* Nova's list: a magnifier, then a slot per thing to find — its picture,
            its word on a tap; a green tick once it is found. */}
        <span role="list" aria-label={words.listAria} className="find-list">
          <span aria-hidden className="find-list-glass">
            <Search strokeWidth={3} />
          </span>
          {stage.things.map((thing) => {
            const has = got.includes(thing);
            return (
              <button
                key={thing}
                type="button"
                role="listitem"
                data-sfx="none"
                aria-label={format(has ? words.slotFoundAria : words.slotAria, { thing })}
                onClick={() => void playCue(lessonCue.word(thing))}
                className={`find-slot ${has ? "find-slot--got" : ""}`}
              >
                <span
                  ref={(el) => {
                    slotRefs.current[thing] = el;
                  }}
                  className="find-slot-pic"
                >
                  <Image src={art.things[thing]} alt="" sizes="48px" />
                </span>
                {has && (
                  <span className="find-slot-tick" aria-hidden>
                    <Check strokeWidth={4} />
                  </span>
                )}
              </button>
            );
          })}
        </span>
      </BackRow>

      <div
        ref={boxRef}
        role="group"
        aria-label={words.sceneAria}
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
        className={`find-stage ${ready ? "find-stage--ready" : ""} ${ended ? "find-stage--found" : ""}`}
      >
        {/* The layers wait for the client: only it knows the screen's frame (the server answers portrait). */}
        <div ref={backRef} className="find-layer" aria-hidden>
          {hydrated && <Image key={`b${wide}`} src={art.back} alt="" fill placeholder="blur" sizes="(orientation: portrait) 330vw, 160vw" onLoad={() => setLoaded((n) => n + 1)} />}
        </div>
        <div ref={midRef} className="find-layer">
          {hydrated && <Image key={`m${wide}`} src={art.mid} alt="" fill sizes="(orientation: portrait) 330vw, 160vw" onLoad={() => setLoaded((n) => n + 1)} />}
          {stage.things.map((thing) => {
            const { box, leaf } = spot(thing);
            const out = taken.includes(thing);
            const flying = out && (got.includes(thing) || flights.some((f) => f.thing === thing));
            return (
              <button
                key={thing}
                ref={(el) => {
                  thingRefs.current[thing] = el;
                }}
                type="button"
                data-find-ui
                aria-label={thing}
                tabIndex={hunting && !out ? 0 : -1}
                onClick={(event) => {
                  /* A pointer's tap is judged by the stage (in the way or not); this is the keyboard's. */
                  if (event.detail === 0) find(thing);
                }}
                className={`find-thing ${out ? "find-thing--found" : ""} ${flying ? "find-thing--gone" : ""} ${hunting && !out && hint.glow ? "find-thing--glow" : ""}`}
                style={{ left: `${box[0]}%`, top: `${box[1]}%`, width: `${box[2]}%`, height: `${box[3]}%` }}
              >
                <Image src={art.things[thing]} alt="" fill sizes="(orientation: portrait) 40vw, 16vw" className={`find-thing-pic ${hunting && !out && hint.stir ? "find-thing-pic--stir" : ""}`} />
                {hunting && !out && hint.sparkle && (
                  <span className="find-twinkle" style={{ left: `${leaf[0]}%`, top: `${leaf[1]}%` }} aria-hidden>
                    <Sparkles strokeWidth={2.2} />
                  </span>
                )}
              </button>
            );
          })}
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

        {phase === "photo" && <span className="find-flash" aria-hidden />}
        {(phase === "photo" || phase === "away") && (
          <figure className={`find-photo ${phase === "away" ? "find-photo--away" : ""}`}>
            <Image src={stage.art.photo} alt="" sizes="(orientation: portrait) 60vw, 22vw" className="find-photo-pic" />
            <figcaption>
              {stage.things.map((thing) => (
                <Image key={thing} src={art.things[thing]} alt="" sizes="40px" className="find-photo-thing" />
              ))}
            </figcaption>
          </figure>
        )}

        {phase === "done" && (
          <div className="find-done" data-find-ui>
            <AgainButton label={again} onPress={replay} dir={dir} />
            <NextButton label={next} href={`/play/find?photo=${stage.n}`} dir={dir} />
          </div>
        )}
      </div>

      {flights.length > 0 &&
        createPortal(
          flights.map(({ thing, style }) => (
            <span key={thing} className="find-fly" style={style} aria-hidden>
              <Image src={art.things[thing]} alt="" fill sizes="(orientation: portrait) 40vw, 16vw" />
            </span>
          )),
          document.body,
        )}

      {(phase === "intro" || phase === "talk") &&
        createPortal(
          <FriendSays
            key={phase}
            picture={CLASSROOMS.nova.cheer}
            ink="var(--color-nova)"
            lines={phase === "intro" ? [words.intro1, words.intro2] : [words.found1, words.found2]}
            skipLabel={words.letsGo}
            dir={dir}
            onDone={() => setPhase(phase === "intro" ? "play" : "done")}
          />,
          document.body,
        )}
    </>
  );
}
