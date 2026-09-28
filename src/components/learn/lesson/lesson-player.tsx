"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Lightbulb } from "lucide-react";
import { SHAPES } from "@/data/shapes";
import { format } from "@/lib/format-dict";
import { lessonCue } from "@/lib/cue";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { itemKey, useProgress } from "@/store/progress";
import type { Dictionary } from "@/lib/dictionaries/en";
import type { LessonDef, Question, ShapeId } from "@/types/course";
import type { StrokePoint } from "@/types/stroke";
import type { Locale } from "@/types/locale";
import { BackRow } from "@/components/ui/back-button";
import { AgainButton, NextButton } from "@/components/ui/morph-button";
import { Button3D } from "@/components/ui/button-3d";
import { TaskChip, type TaskKind } from "./task-chip";
import { FindShapes } from "./find-shapes";
import { ReelVideo } from "./reel-video";
import { PickQuestion } from "./pick-question";
import { CountGive } from "./count-give";
import { TraceQuestion } from "./trace-question";
import { WordCard } from "./word-card";
import { SpellWord, type SpellWordHandle } from "./spell-word";
import { LessonDone } from "./lesson-done";

/* Green is "you passed this, carry on"; blue is the ordinary way onward. */
const GO_TONE = {
  face: "var(--color-go)",
  edge: "var(--color-go-dark)",
  text: "#fff",
};
const BRAND_TONE = {
  face: "var(--brand)",
  edge: "var(--brand-dark)",
  text: "#fff",
};

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

/** What the task chip shows for a step: its kind (icon + colour) and the
    English word the step is about. */
function taskFor(q: Question, showing: boolean): { kind: TaskKind; target?: string } {
  if (showing) return { kind: "watch" };
  switch (q.type) {
    case "word":
      return { kind: "listen" };
    case "trace":
      return { kind: "draw", target: q.shape };
    case "spell":
      return { kind: "build" };
    case "find":
      return { kind: "find", target: `${q.shape}s` };
    case "count":
      return { kind: "count", target: q.item.word };
    case "pick": {
      const shape = q.ask.vars?.shape;
      return { kind: "pick", target: shape === undefined ? undefined : String(shape) };
    }
  }
}

/** The shapes a lesson is about, for the done screen: what it traces and
    finds, and the right answers of its picks. */
function lessonShapes(lesson: LessonDef): ShapeId[] {
  const shapes = lesson.questions.flatMap((q): ShapeId[] => {
    if (q.type === "trace" || q.type === "find") return [q.shape];
    if (q.type === "pick") {
      const answer = q.options[q.answer];
      return answer.kind === "shape" ? [answer.shape] : [];
    }
    return [];
  });
  return [...new Set(shapes)];
}

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
 * One lesson: the reel (when there is one), its steps, then "done". A Shapes
 * lesson is reel → word → trace → spell (`edenic-plan.md` §5). Each step only
 * reports `onSolved` / `onMiss`; the task chip (in the back row) and the way
 * onward live here (see the return). The reel is the
 * exception: it fills the whole stage and has no bands at all.
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
    ...lesson.questions.map((question, index) => ({
      kind: "question" as const,
      question,
      index,
    })),
  ];

  const [round, setRound] = useState(0);
  const [at, setAt] = useState(0);
  const [solved, setSolved] = useState(false);
  /* Misses on THIS step — Help on the spelling board waits for the second. */
  const [stepMisses, setStepMisses] = useState(0);
  /* Letters in the spelling board's spaces — "Start over" shows then. */
  const [spelling, setSpelling] = useState(false);
  const [board, setBoard] = useState(false);
  const [demo, setDemo] = useState(true);
  const [mistakes, setMistakes] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const leaveTimer = useRef<number | undefined>(undefined);
  const spell = useRef<SpellWordHandle>(null);
  /* The child's passing trace, kept for the done screen. */
  const [drawing, setDrawing] = useState<StrokePoint[] | undefined>(undefined);

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
      setStepMisses(0);
      setSpelling(false);
      setBoard(false);
      setLeaving(false);
    }, STEP_LEAVE_MS);
  };

  const advance = () => go(() => setAt((value) => value + 1));
  const restart = () =>
    go(() => {
      setAt(0);
      setMistakes(0);
      setDrawing(undefined);
      setDemo(true);
      setRound((value) => value + 1);
    });
  const endDemo = () => go(() => setDemo(false));

  const onSolved = () => setSolved(true);
  const onMiss = () => {
    setStepMisses((count) => count + 1);
    setMistakes((count) => count + 1);
  };

  /* ---- The task chip: what to do on this step ---- */
  let task: ReactNode = null;
  if (!finished && step.kind === "question") {
    const q = step.question;
    const { kind, target } = taskFor(q, showing);
    task = (
      <TaskChip
        key={`${step.index}-${kind}`}
        kind={kind}
        verb={dict.tasks[kind]}
        target={target}
        label={format(dict.asks[q.ask.key], q.ask.vars ?? {})}
        cue={lessonCue.ask(locale, characterId, courseId, n, step.index)}
        dir={dir}
      />
    );
  }

  /* ---- The step itself, and the way onward ---- */
  const coursePath = `/learn/${characterId}/${courseId}`;
  let body: ReactNode = null;
  let action: ReactNode = null;

  if (finished) {
    body = (
      <LessonDone
        title={lines.lessonDone}
        word={lesson.questions.find((q) => q.type === "word")?.word}
        shapes={lessonShapes(lesson)}
        drawing={drawing}
        accent={tone.face}
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
    body = (
      <ReelVideo
        src={lesson.reel}
        image={image}
        label={format(lines.reelAbout, { title })}
        skipLabel={lines.skip}
        playLabel={lines.playReel}
        onDone={advance}
      />
    );
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
    } else if (q.type === "word") {
      body = (
        <WordCard
          word={q.word}
          shape={q.shape}
          cue={lessonCue.word(q.word)}
          label={format(lines.hearWord, { word: q.word })}
        />
      );
      action = <NextButton label={lines.next} tone={BRAND_TONE} onPress={advance} dir={dir} />;
    } else if (q.type === "spell") {
      body = (
        <SpellWord
          key={seed}
          ref={spell}
          word={q.word}
          seed={seed}
          letterAria={lines.letterAria}
          hint
          onSolved={onSolved}
          onMiss={onMiss}
          onStarted={setSpelling}
        />
      );
      /* "Start over" whenever a letter is in, so one wrong first tap never
         has to be undone letter by letter. */
      const startOver =
        spelling && !solved ? (
          <AgainButton label={lines.startOver} onPress={() => spell.current?.reset()} dir={dir} />
        ) : null;
      action = startOver;
      /* Offered from the SECOND full-but-wrong word (the first just sends the
         misplaced letters home), in the Next button's place, and it stays —
         the child can keep trying without ever pressing it. */
      if (stepMisses >= 2 && !solved) {
        action = (
          <div className="flex items-center gap-3">
            {startOver}
            <Button3D
              tone={BRAND_TONE}
              onClick={() => spell.current?.help()}
              className="anim-pop-in h-12 gap-2 px-6 text-base font-bold"
            >
              <Lightbulb className="h-5 w-5 fill-current" strokeWidth={2} />
              <span dir={dir}>{lines.help}</span>
            </Button3D>
          </div>
        );
      }
    } else if (q.type === "find") {
      body = (
        <FindShapes
          key={seed}
          scene={q.scene}
          shape={q.shape}
          itemAria={lines.findItemAria}
          onSolved={onSolved}
          onMiss={onMiss}
        />
      );
    } else {
      body = (
        <TraceQuestion
          key={seed}
          strokes={SHAPES[q.shape].strokes}
          accent={tone.face}
          reward={SHAPES[q.shape].thing}
          dict={lines}
          board={board}
          onSolved={(stroke) => {
            setDrawing(stroke);
            onSolved();
          }}
          onMiss={onMiss}
        />
      );
      action = board ? null : (
        <NextButton label={lines.yourTurn} tone={BRAND_TONE} onPress={() => setBoard(true)} dir={dir} />
      );
    }
    if (solved) action = <NextButton label={lines.next} tone={GO_TONE} onPress={advance} dir={dir} />;
  }

  return (
    <>
      {/* The chrome row: out to the course, and what to do on this step —
          the task chip, centred between the back button and a spacer of its
          own width (the spacer yields its room on a phone, where the longest
          chips — "هەلبژێرە rectangle" — need it). */}
      <BackRow href={coursePath} label={format(lines.backTo, { lessonName: courseName })}>
        <div className="flex min-w-0 flex-1 justify-center">{task}</div>
        <span aria-hidden className="hidden h-14 w-14 shrink-0 sm:block" />
      </BackRow>

      {/* Two bands, always in the same places: the step filling — and centred
          in — whatever height is left, and the way onward in a fixed-height
          slot at the bottom, so nothing jumps when the button appears. On a
          phone the slot stands a little clear of the tab bar (`pb`) — the
          same lift on every step, so every button sits in one spot. */}
      {step?.kind === "watch" ? (
        <div
          key={`${round}-${at}`}
          className={`stage-swap absolute inset-0 ${leaving ? "stage-swap--out" : ""}`}
        >
          {body}
        </div>
      ) : (
        <div
          key={`${round}-${at}-${demo}`}
          className={`stage-swap mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-6 pb-[min(2.5rem,4svh)] pt-5 sm:px-8 sm:pb-0 sm:pt-7 ${
            leaving ? "stage-swap--out" : ""
          }`}
        >
          <div className="flex w-full flex-1 flex-col items-center justify-center py-4 sm:py-6 [@media(max-height:700px)]:py-2">
            {body}
          </div>
          <div className="flex h-16 shrink-0 items-center justify-center sm:h-20">{action}</div>
        </div>
      )}
    </>
  );
}
