"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";
import { STAR_FLIGHT } from "@/lib/chest-run";
import { playSfx } from "@/lib/cue";
import { format } from "@/lib/format-dict";
import type { Dictionary } from "@/lib/dictionaries/en";
import { chestStarKey, useProgress } from "@/store/progress";
import chestStar from "../../../public/assets/learn/chest-star.png";
import emptyStar from "../../../public/assets/learn/star-empty.png";

interface StarPodProps {
  characterId: string;
  /** The friend's courses, in order: one slot (one chest star) each. */
  courses: readonly { id: string; name: string }[];
  labels: Pick<Dictionary["characterHub"], "stars" | "starEarned" | "starMissing">;
}

/** Which stars the pod has already shown arriving (localStorage, per browser). */
const SEEN = "edenic-stars-seen";
/** A star earned before this page: shown arriving once the page has come in. */
const ARRIVE_MS = 900;
/** A star earned ON this page (the chest just opened): after it has come up
    out of the chest (`CourseWorld`'s 1.3 s, then its rise). */
const LIVE_MS = 3200;
/** How long the pod stays open by itself before it shuts. */
const SHUT_MS = 2600;
/** The new star pops into its slot once the slots are out (`.star-pod-star--new`). */
const POP_MS = 350;
/** The plate and its slots have sprung out (`lang-pop`): the slot is where it stays. */
const FAN_MS = 600;

function readSeen(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SEEN) ?? "[]");
  } catch {
    return [];
  }
}

function writeSeen(keys: string[]) {
  try {
    localStorage.setItem(SEEN, JSON.stringify(keys));
  } catch {}
}

/**
 * The friend's stars, under the back button (a child of its `BackRow`, so it
 * slides away with it): a white clay chip, "1/2", that opens like the
 * language switcher into one clay slot per course — a pale clay star, or the
 * gold one its chest gave. A star the pod has not shown yet opens it by
 * itself: the star pops into its slot, then the pod shuts.
 */
export function StarPod({ characterId, courses, labels }: StarPodProps) {
  const items = useProgress((state) => state.items);
  const hydrated = useProgress((state) => state.hydrated);
  const [open, setOpen] = useState(false);
  const [fresh, setFresh] = useState<string[]>([]);
  /* The star just given on this page, flying from over the chest into its
     slot: hidden until the slot is measured (`style` = where it starts). */
  const [flight, setFlight] = useState<{ key: string; style?: CSSProperties } | null>(null);
  const atArrival = useRef<string[] | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  /* Shown arriving in place: the star pops into its slot (the one over a chest, if any, goes). */
  function pop(keys: string[]) {
    window.dispatchEvent(new Event(STAR_FLIGHT));
    setFresh(keys);
    window.setTimeout(() => playSfx("star"), POP_MS);
  }

  const keys = courses.map((course) => chestStarKey(characterId, course.id));
  const earned = keys.filter((key) => hydrated && items[key]);
  const earnedList = earned.join(" ");

  useEffect(() => {
    if (!hydrated) return;
    const now = earnedList ? earnedList.split(" ") : [];
    atArrival.current ??= now;
    const seen = readSeen();
    const unseen = now.filter((key) => !seen.includes(key));
    if (!unseen.length) return;
    const early = unseen.every((key) => atArrival.current?.includes(key));
    const timer = window.setTimeout(
      () => {
        writeSeen([...seen, ...unseen]);
        setOpen(true);
        const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!early && !still && unseen.length === 1 && document.querySelector(".chest-star")) setFlight({ key: unseen[0] });
        else pop(unseen);
      },
      early ? ARRIVE_MS : LIVE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [hydrated, earnedList]);

  /* The slots out: from the star over the chest to its slot. */
  useEffect(() => {
    if (!flight || flight.style) return;
    const timer = window.setTimeout(() => {
      const from = document.querySelector(".chest-star")?.getBoundingClientRect();
      const to = wrapperRef.current?.querySelector(`[data-slot="${flight.key}"] img`)?.getBoundingClientRect();
      if (!from || !to?.width) {
        setFlight(null);
        pop([flight.key]);
        return;
      }
      setFlight({
        key: flight.key,
        style: {
          "--fly-x": `${from.left + from.width / 2 - (to.left + to.width / 2)}px`,
          "--fly-y": `${from.top + from.height / 2 - (to.top + to.height / 2)}px`,
          "--fly-s": from.width / to.width,
        } as CSSProperties,
      });
      window.dispatchEvent(new Event(STAR_FLIGHT));
    }, FAN_MS);
    return () => window.clearTimeout(timer);
  }, [flight]);

  useEffect(() => {
    if (!fresh.length) return;
    const timer = window.setTimeout(() => {
      setOpen(false);
      setFresh([]);
      setFlight(null);
    }, SHUT_MS);
    return () => window.clearTimeout(timer);
  }, [fresh]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const count = format(labels.stars, { n: earned.length, total: courses.length });

  return (
    /* Under the back button; on a desktop beside it, where under it is the board's corner. */
    <div
      ref={wrapperRef}
      className="star-pod absolute left-6 top-full mt-3 flex items-center gap-2.5 sm:left-8 lg:left-[6.25rem] lg:top-0 lg:mt-0"
    >
      <Button3D
        tone={{ face: "var(--surface)", text: "var(--color-ink-fixed)" }}
        variant="calm"
        aria-label={count}
        aria-expanded={open}
        onClick={() => {
          setOpen((value) => !value);
          setFresh([]);
          setFlight(null);
        }}
        className="btn3d--clay-white h-12 shrink-0 gap-1.5 px-4 text-lg font-bold sm:h-14 sm:px-5 sm:text-xl"
      >
        <Star className="star-pod-icon h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} />
        <span aria-hidden dir="ltr">
          {earned.length}/{courses.length}
        </span>
      </Button3D>

      {open && (
        <div className="star-pod-fan flex items-center gap-2">
          {courses.map((course, index) => {
            const has = earned.includes(keys[index]);
            const flying = flight?.key === keys[index] ? flight : null;
            return (
              <span
                key={course.id}
                role="img"
                aria-label={format(has ? labels.starEarned : labels.starMissing, { name: course.name })}
                data-slot={keys[index]}
                className="star-pod-slot"
                style={{ animationDelay: `${0.08 + index * 0.06}s` }}
              >
                <Image src={emptyStar} alt="" sizes="40px" className="star-pod-star" />
                {has && (!flying || flying.style) && (
                  <Image
                    src={chestStar}
                    alt=""
                    sizes="40px"
                    style={flying?.style}
                    onAnimationEnd={
                      flying
                        ? () => {
                            playSfx("star");
                            setFresh([flying.key]);
                          }
                        : undefined
                    }
                    className={`star-pod-star ${flying ? "star-pod-star--fly" : fresh.includes(keys[index]) ? "star-pod-star--new" : ""}`}
                  />
                )}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
