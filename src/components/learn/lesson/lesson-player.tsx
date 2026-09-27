"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { SHAPES } from "@/data/shapes";
import { format } from "@/lib/format-dict";
import { lessonCue } from "@/lib/cue";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { itemKey, useProgress } from "@/store/progress";
import type { Dictionary } from "@/lib/dictionaries/en";
import type { LessonDef, Question } from "@/types/course";
import type { Locale } from "@/types/locale";
import type { PinkiPose } from "@/types/pinki";
import { BackRow } from "@/components/ui/back-button";
import { AgainButton, NextButton } from "@/components/ui/morph-button";
import { LessonCoach } from "./lesson-coach";
import { ReelVideo } from "./reel-video";
import { PickQuestion } from "./pick-question";
import { CountGive } from "./count-give";
import { TraceQuestion } from "./trace-question";
import { LessonDone } from "./lesson-done";

/* Green is "you passed this, carry on"; blue is the ordinary way onward. */
const GO_TONE = { face: "var(--color-go)", edge: "var(--color-go-dark)", text: "#fff" };
const BRAND_TONE = { face: "var(--brand)", edge: "var(--brand-dark)", text: "#fff" };

/** Kept in step with `.stage-swap--out`'s 0.2s in `globals.css`. */
const STEP_LEAVE_MS = 200;

/** The store needs a star count > 0 for "done". Nothing on the site shows
    stars; fewer of them is how a later review could find a shaky lesson. */
function starsFor(mistakes: number): number {
  if (mistakes <= 1) return 3;
  if (mistakes <= 4) return 2;
  return 1;
}

type Step = { kind: "watch" } | { kind: "question"; question: Question; index: number };

interface LessonPlayerProps {
  lesson: LessonDef;
  characterId: string;
  /** The course id — `shapes` in `/learn/pinki/shapes/1`. */
  courseId: string;
  /** 1-based lesson number. */
  n: number;
  courseName: string;
  /** This lesson's and the next lesson's titles (none after the last). */
  title: string;
  nextTitle?: string;
  /** Art behind the reel while it loads. */
  image: string;
  /** The character's colour — the lesson wears it. */
  tone: { face: string; edge: string };
  dict: Dictionary;
  locale: Locale;
  dir: "rtl" | "ltr";
}

/**
 * One lesson: the reel (when there is one), five questions, then "done". Each
 * question only reports `onSolved` / `onMiss`; Pinki's line, the progress bar
 * and the way onward live here, in three fixed bands (see the return).
 *
 * The first question is Pinki's to show: a Pick's answer glows while she
 * points, a Count's basket glows, and a Trace always starts with her drawing
 * it. Then it is the child's turn.
 */
export function LessonPlayer({
  lesson,
  characterId,
  courseId,
  n,
  courseName,
  title,
  nextTitle,
  image,
  tone,
  dict,
  locale,
  dir,
}: LessonPlayerProps) {
  const complete = useProgress((state) => state.complete);
  const lines = dict.lessonPlayer;

  const steps: Step[] = [
    ...(lesson.reel ? [{ kind: "watch" as const }] : []),
    ...lesson.questions.map((question, index) => ({ kind: "question" as const, question, index })),
  ];

  const [round, setRound] = useState(0);
  const [at, setAt] = useState(0);
  const [solved, setSolved] = useState(false);
  const [missed, setMissed] = useState(false);
  const [board, setBoard] = useState(false);
  const [demo, setDemo] = useState(true);
  const [mistakes, setMistakes] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const leaveTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(leaveTimer.current), []);

  const step = steps[at];
  const finished = at >= steps.length;
  const question = step?.kind === "question" ? step.question : undefined;
  const first = step?.kind === "question" && step.index === 0;
  /* Pinki's turn on the first question — only while the child has not been
     handed it yet. A Trace's demo is its own (the pen draws before the board). */
  const showing = first && demo && question?.type === "pick";

  useScrollLock(question?.type === "trace" && board);

  /* Recorded when "done" is reached, not on Next: closing the tab on the
     done screen must not lose the lesson. */
  useEffect(() => {
    if (finished) complete(itemKey(characterId, courseId, n), starsFor(mistakes));
  }, [finished, complete, characterId, courseId, n, mistakes]);

  const go = (change: () => void) => {
    setLeaving(true);
    window.clearTimeout(leaveTimer.current);
    leaveTimer.current = window.setTimeout(() => {
      change();
      setSolved(false);
      setMissed(false);
      setBoard(false);
      setLeaving(false);
    }, STEP_LEAVE_MS);
  };

  const advance = () => go(() => setAt((value) => value + 1));
  const restart = () =>
    go(() => {
      setAt(0);
      setMistakes(0);
      setDemo(true);
      setRound((value) => value + 1);
    });
  const endDemo = () => go(() => setDemo(false));

  const onSolved = () => {
    setSolved(true);
    setMissed(false);
  };
  const onMiss = () => {
    setMissed(true);
    setMistakes((count) => count + 1);
  };

  /* ---- Pinki's line and pose ---- */
  const say = (key: keyof Dictionary["lessonPlayer"], pose: PinkiPose) => ({
    pose,
    line: lines[key],
    cue: lessonCue.line(locale, characterId, key),
  });
  const ask = (q: Question, index: number, pose: PinkiPose) => ({
    pose,
    line: format(dict.asks[q.ask.key], q.ask.vars ?? {}),
    cue: lessonCue.ask(locale, characterId, courseId, n, index),
  });

  let coach: { pose: PinkiPose; line: string; cue: string };
  if (finished) coach = say("done", "celebrate");
  else if (step.kind === "watch") coach = say("watch", "speak");
  else if (solved) coach = say("great", "celebrate");
  else if (step.question.type === "trace") {
    coach = !board
      ? say("traceWatch", "pen")
      : missed
        ? say("traceMiss", "pen")
        : ask(step.question, step.index, "pen");
  } else if (showing) coach = say("watchMe", "stick");
  else if (missed) coach = say("lookAgain", "think");
  else coach = ask(step.question, step.index, step.question.type === "count" ? "stick" : "think");

  /* ---- The step itself, and the way onward ---- */
  const coursePath = `/learn/${characterId}/${courseId}`;
  let body: ReactNode = null;
  let action: ReactNode = null;

  if (finished) {
    body = (
      <LessonDone
        title={lines.lessonDone}
        unlocked={nextTitle ? format(lines.unlocked, { title: nextTitle }) : undefined}
        dir={dir}
      />
    );
    action = (
      <div className="flex items-center gap-3 sm:gap-4">
        <AgainButton label={lines.playAgain} onPress={restart} dir={dir} />
        <NextButton
          label={nextTitle ? lines.nextLesson : lines.finish}
          tone={GO_TONE}
          href={nextTitle ? `${coursePath}/${n + 1}` : coursePath}
          dir={dir}
        />
      </div>
    );
  } else if (step.kind === "watch" && lesson.reel) {
    body = <ReelVideo src={lesson.reel} image={image} label={format(lines.reelAbout, { title })} />;
    action = <NextButton label={lines.next} tone={BRAND_TONE} onPress={advance} dir={dir} />;
  } else if (step.kind === "question") {
    const q = step.question;
    const seed = `${characterId}.${courseId}.${n}.${step.index}.${round}.${showing ? "demo" : "play"}`;

    if (q.type === "pick") {
      body = (
        <PickQuestion
          key={seed}
          show={q.show}
          options={q.options}
          answer={q.answer}
          seed={seed}
          demo={showing}
          onSolved={onSolved}
          onMiss={onMiss}
        />
      );
      action = showing ? (
        <NextButton label={lines.yourTurn} tone={BRAND_TONE} onPress={endDemo} dir={dir} />
      ) : null;
    } else if (q.type === "count") {
      body = (
        <CountGive
          key={seed}
          target={q.target}
          icon={q.item.src}
          itemLabel={q.item.word}
          dict={lines}
          dir={dir}
          highlightTarget={first}
          onGiven={onSolved}
        />
      );
    } else {
      body = (
        <TraceQuestion
          key={seed}
          strokes={SHAPES[q.shape].strokes}
          accent={tone.face}
          dict={lines}
          dir={dir}
          onBoard={() => setBoard(true)}
          onSolved={onSolved}
          onMiss={onMiss}
        />
      );
    }
    if (solved) action = <NextButton label={lines.next} tone={GO_TONE} onPress={advance} dir={dir} />;
  }

  const progressShare = Math.min(1, (at + (solved ? 1 : 0)) / steps.length);

  return (
    <>
      {/* The chrome row: out to the course, and how far through the lesson
          the child is — a filling bar, centred between the back button and a
          spacer of its own width. */}
      <BackRow href={coursePath} label={format(lines.backTo, { lessonName: courseName })}>
        <div className="flex flex-1 justify-center">
          {!finished && (
            <div
              className="puzzle-progress-track w-full max-w-2xl"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progressShare * 100)}
              aria-label={format(lines.stepOf, { current: at + 1, total: steps.length })}
            >
              <span
                className="puzzle-progress-fill transition-[width] duration-500 ease-out"
                style={
                  {
                    width: `${progressShare * 100}%`,
                    "--bar-face": tone.face,
                    "--bar-edge": tone.edge,
                  } as CSSProperties
                }
              />
            </div>
          )}
        </div>
        <span aria-hidden className="h-12 w-12 shrink-0 sm:h-14 sm:w-14" />
      </BackRow>

      {/* Three bands, always in the same places: Pinki's line at the top, the
          step filling — and centred in — whatever height is left, and the
          way onward in a fixed-height slot at the bottom, so nothing jumps
          when the button appears. */}
      <div
        key={`${round}-${at}-${demo}`}
        className={`stage-swap mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-6 pt-5 sm:px-8 sm:pt-7 ${
          leaving ? "stage-swap--out" : ""
        }`}
      >
        <LessonCoach
          pose={coach.pose}
          line={coach.line}
          cue={coach.cue}
          listenLabel={lines.listen}
          dir={dir}
        />
        <div className="flex w-full flex-1 flex-col items-center justify-center py-5 sm:py-6">
          {body}
        </div>
        <div className="flex h-16 shrink-0 items-center justify-center sm:h-20">{action}</div>
      </div>
    </>
  );
}
