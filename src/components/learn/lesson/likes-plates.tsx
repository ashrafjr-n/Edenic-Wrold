"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import { ThumbsDown, ThumbsUp, type LucideIcon } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";
import { Celebration } from "@/components/ui/celebration";
import { format } from "@/lib/format-dict";
import { lessonCue } from "@/lib/cue";
import type { Face } from "@/types/course";
import { CueButton } from "./cue-button";
import { FaceView } from "./face";

/** How long a thing takes to fly onto its plate. */
const FLY_MS = 460;

type Choice = "like" | "dislike";

/** The two plates: their English label and their thumb. */
const PLATES: Record<Choice, { label: string; Icon: LucideIcon; tone: { face: string; edge: string; text: string } }> = {
  like: { label: "I like", Icon: ThumbsUp, tone: { face: "var(--color-go)", edge: "var(--color-go-dark)", text: "#fff" } },
  dislike: { label: "I don't like", Icon: ThumbsDown, tone: { face: "var(--accent)", edge: "var(--accent-dark)", text: "#fff" } },
};

/** "apples, grapes and corn". */
const listOf = (words: string[]) => (words.length < 2 ? words.join("") : `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`);

interface LikesPlatesProps {
  items: { face: Face; things: string }[];
  /** "I like it" / "I don't like it" — the thumbs' names for a screen reader. */
  likeAria: string;
  dislikeAria: string;
  /** "Hear {word}" — each sentence's speaker. */
  hearLabel: string;
  onSolved: () => void;
}

/**
 * Do you like it? One thing at a time: thumbs up, and it hops onto the "I
 * like" plate as the sentence comes up — "I like apples." — thumbs down,
 * and onto the other plate — "I don't like corn." Nothing is wrong here:
 * the child's own taste is the answer, and the two sentences are what is
 * learned. At the end both plates jump and say it all: "I like apples and
 * grapes."
 */
export function LikesPlates({ items, likeAria, dislikeAria, hearLabel, onSolved }: LikesPlatesProps) {
  const [chosen, setChosen] = useState<Choice[]>([]);
  const [flying, setFlying] = useState(false);
  const [said, setSaid] = useState<string | null>(null);
  const thingRef = useRef<HTMLSpanElement>(null);
  const plateRefs = useRef(new Map<Choice, HTMLDivElement>());
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const at = chosen.length;
  const done = at === items.length;
  const onPlate = (choice: Choice) => items.filter((_, i) => chosen[i] === choice);

  const choose = (choice: Choice) => {
    if (done || flying) return;
    const { things } = items[at];
    setSaid(choice === "like" ? `I like ${things}.` : `I don't like ${things}.`);
    const thing = thingRef.current;
    const plate = plateRefs.current.get(choice);
    if (thing && plate) {
      const from = thing.getBoundingClientRect();
      const to = plate.getBoundingClientRect();
      thing.animate(
        [
          { translate: "0px 0px", scale: "1" },
          { translate: `${to.left + to.width / 2 - (from.left + from.width / 2)}px ${to.top + to.height / 2 - (from.top + from.height / 2)}px`, scale: "0.35" },
        ],
        { duration: FLY_MS, easing: "cubic-bezier(0.5, 0, 0.75, 0.4)", fill: "forwards" },
      );
    }
    setFlying(true);
    timer.current = window.setTimeout(() => {
      setFlying(false);
      setChosen((list) => [...list, choice]);
      if (at + 1 === items.length) onSolved();
    }, FLY_MS);
  };

  /* At the end, what the child said about it all. */
  const summary = done
    ? (["like", "dislike"] as const)
        .map((choice) => ({ choice, words: onPlate(choice).map((item) => item.things) }))
        .filter(({ words }) => words.length > 0)
        .map(({ choice, words }) => `${PLATES[choice].label} ${listOf(words)}.`)
    : [];
  const lines = done ? summary : said ? [said] : [];

  return (
    /* Phone and tablet: one column. Desktop: the thing, its sentence and
       the thumbs on the left, the two plates stacked on the right. */
    <div className="flex w-full max-w-md flex-col items-center gap-3 sm:max-w-lg sm:gap-5 lg:grid lg:max-w-3xl lg:grid-cols-2 lg:items-center lg:gap-x-12 [@media(max-height:700px)]:gap-2">
      <div className="flex flex-col items-center gap-3 sm:gap-5 lg:gap-4 [@media(max-height:700px)]:gap-2">
        {/* The thing being asked about. */}
        <div className="card card-clay-white card-bare-lg relative flex aspect-square w-[min(8.5rem,13svh)] items-center justify-center sm:w-[min(11rem,17svh)] lg:w-[min(11rem,calc(var(--stage-h)*0.3))]">
          {done ? (
            <Celebration />
          ) : (
            <span key={at} ref={thingRef} className="anim-pop-in relative z-20 flex h-full w-full items-center justify-center">
              <FaceView face={items[at].face} size="tile" />
            </span>
          )}
        </div>

        {/* The sentence(s) — English, with their speakers. One slot height. */}
        <div dir="ltr" className="flex min-h-[min(5rem,9svh)] flex-col items-center justify-center gap-1.5 lg:min-h-[min(5rem,calc(var(--stage-h)*0.18))]">
          {lines.map((line) => (
            <p key={line} className="anim-pop-in flex items-center gap-2.5 text-xl font-bold text-[var(--color-ink)] sm:text-2xl lg:text-3xl">
              <CueButton cue={lessonCue.sentence(line)} label={format(hearLabel, { word: line })} size="sm" />
              {line}
            </p>
          ))}
        </div>

        {/* The thumbs. */}
        {!done && (
          <div className="flex items-center gap-6 sm:gap-8">
            {(["like", "dislike"] as const).map((choice) => {
              const { Icon, tone } = PLATES[choice];
              return (
                <Button3D
                  key={choice}
                  tone={tone}
                  onClick={() => choose(choice)}
                  aria-label={choice === "like" ? likeAria : dislikeAria}
                  className="h-14 w-14 sm:h-20 sm:w-20 lg:h-16 lg:w-16"
                >
                  <Icon className="h-7 w-7 sm:h-10 sm:w-10 lg:h-8 lg:w-8" strokeWidth={2.5} />
                </Button3D>
              );
            })}
          </div>
        )}
      </div>

      {/* The two plates, filling up. Labels are taught English. */}
      <div dir="ltr" className="grid w-full grid-cols-2 gap-4 sm:gap-6 lg:w-[min(18rem,calc(var(--stage-h)*0.75))] lg:grid-cols-1 lg:justify-self-center lg:gap-4">
        {(["like", "dislike"] as const).map((choice, p) => {
          const { label, Icon, tone } = PLATES[choice];
          return (
            <div key={choice} className="flex flex-col items-center gap-1.5">
              <div
                ref={(el) => {
                  if (el) plateRefs.current.set(choice, el);
                }}
                key={done ? `${choice}.done` : choice}
                className={`plate relative flex aspect-[2/1] w-full items-center justify-center [@media(max-height:700px)]:aspect-[5/2] ${done ? "anim-jump" : ""}`}
                style={done ? { animationDelay: `${p * 0.12}s` } : undefined}
              >
                <span className="flex h-[70%] items-center justify-center -space-x-[6%]">
                  {onPlate(choice).map(({ face }) =>
                    face.kind === "picture" ? (
                      <span key={face.word} className="anim-pop-in relative block aspect-square h-full">
                        <Image src={face.src} alt={face.word} fill sizes="4rem" className="object-contain" />
                      </span>
                    ) : null,
                  )}
                </span>
              </div>
              <span className="flex items-center gap-1.5 text-base font-bold sm:text-lg" style={{ color: tone.edge } as CSSProperties}>
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.75} />
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
