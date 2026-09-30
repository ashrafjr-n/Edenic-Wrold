"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Lightbulb } from "lucide-react";
import { SHAPES } from "@/data/shapes";
import { format } from "@/lib/format-dict";
import { lessonCue } from "@/lib/cue";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { itemKey, useProgress } from "@/store/progress";
import type { Dictionary } from "@/lib/dictionaries/en";
import type { LessonDef, Question, ShapeId } from "@/types/course";
import type { StrokePoint } from "@/types/stroke";
import { BackRow } from "@/components/ui/back-button";
import { AgainButton, NextButton } from "@/components/ui/morph-button";
import { Button3D } from "@/components/ui/button-3d";
import { TaskChip, TaskPanel, type TaskKind } from "./task-chip";
import type { StaticImageData } from "next/image";
import type { TaskDemoDef } from "./task-demo";
import { FindShapes } from "./find-shapes";
import { ReelVideo } from "./reel-video";
import { PickQuestion } from "./pick-question";
import { CountGive } from "./count-give";
import { TraceQuestion } from "./trace-question";
import { WordCard } from "./word-card";
import { SpellWord, type SpellWordHandle } from "./spell-word";
import { SortShapes } from "./sort-shapes";
import { LessonDone } from "./lesson-done";
import { LessonAbout } from "./lesson-about";

/* Green is every "Next" (direct request); the course's own colour (Shapes'
   yellow) is every other way onward (Your turn, Help, the reel's buttons) — a lesson wears two heroes only, the
   character's pink and the course colour, so no blue button here. */
const GO_TONE = {
  face: "var(--color-go)",
  edge: "var(--color-go-dark)",
  text: "#fff",
};

/** The desktop's three columns — the task, the board, the lesson — shared
    by the reel and the steps, so the frame never moves between them. */
const WIDE_GRID =
  "lg:max-w-7xl lg:pt-4 lg:grid-cols-[13rem_minmax(0,1fr)_13rem] lg:grid-rows-1 lg:gap-x-6 xl:grid-cols-[17rem_minmax(0,1fr)_17rem] xl:gap-x-8";

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
    case "sort":
      return { kind: "sort" };
    case "count":
      return { kind: "count", target: q.item.word };
    case "pick": {
      const shape = q.ask.vars?.shape;
      return { kind: "pick", target: shape === undefined ? undefined : String(shape) };
    }
  }
}

/** How a step is played, for the task button's popup — only the steps a
    shape lesson is made of have one. The spelling demo deals with the
    board's own seed, so it shows the very letters the child sees. */
function demoFor(q: Question, accent: string, seed: string): TaskDemoDef | undefined {
  switch (q.type) {
    case "word":
      return { kind: "listen", shape: q.shape };
    case "trace":
      return { kind: "draw", shape: q.shape, accent };
    case "spell":
      return { kind: "build", word: q.word, seed };
    case "find":
      return { kind: "find", scene: q.scene, shape: q.shape };
    case "sort":
      return { kind: "sort", item: q.items[0] };
    case "pick": {
      const answer = q.options[q.answer];
      const shapes = q.options.flatMap((face) => (face.kind === "shape" ? [face.shape] : []));
      return q.word && answer.kind === "shape" && shapes.length === q.options.length
        ? { kind: "pick", word: q.word, options: shapes, answer: answer.shape }
        : undefined;
    }
    default:
      return undefined;
  }
}

/** The shapes a lesson is about, for the done screen: what it traces and
    finds, and the right answers of its picks. */
function lessonShapes(lesson: LessonDef): ShapeId[] {
  const shapes = lesson.questions.flatMap((q): ShapeId[] => {
    if (q.type === "trace" || q.type === "find") return [q.shape];
    if (q.type === "sort") return q.items.flatMap((item) => (item.shape ? [item.shape] : []));
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
  /** Every lesson's title in this course — the desktop lesson list. */
  titles?: readonly string[];
  /** The next lesson teaches one shape — its button says "Next shape". */
  nextIsShape?: boolean;
  /** Art behind the reel while it loads. */
  image: string;
  /** The character's colour — the lesson wears it. */
  tone: { face: string; edge: string };
  /** The course's colour: every "onward" button that is not green. */
  courseTone: { face: string; edge: string };
  /** Every lesson's cover in this course — the tablet/desktop lesson card. */
  covers: readonly (readonly StaticImageData[])[];
  dict: Dictionary;
  dir: "rtl" | "ltr";
}

/**
 * One lesson: the reel (when there is one), its steps, then "done". A Shapes
 * lesson is reel → word → trace → spell (`edenic-plan.md` §5). Each step only
 * reports `onSolved` / `onMiss`; the task chip (in the back row) and the way
 * onward live here (see the return). The reel is the
 * exception: it fills the whole stage and has no bands at all (on a desktop
 * it takes the board's column, between the same two panels as the steps).
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
  titles,
  nextIsShape = false,
  image,
  tone,
  courseTone,
  covers,
  dict,
  dir,
}: LessonPlayerProps) {
  const onward = { ...courseTone, text: "#fff" };
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

  /* Enter goes on (a keyboard, on a desktop): with nothing focused, it presses
     the step's way onward — every forward button wears `lesson-onward`. A
     focused control keeps its own Enter, and Start over / Help are never
     pressed this way. */
  const onEnter = useEffectEvent((event: KeyboardEvent) => {
    if (event.key !== "Enter" || event.repeat || leaving) return;
    if (document.activeElement && document.activeElement !== document.body) return;
    if (document.querySelector("dialog[open]")) return;
    const onward = document.querySelector<HTMLElement>("main .lesson-onward");
    if (!onward) return;
    event.preventDefault();
    onward.click();
  });

  useEffect(() => {
    window.addEventListener("keydown", onEnter);
    return () => window.removeEventListener("keydown", onEnter);
  }, []);

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
  /* The same task, docked beside the step on a tablet and a desktop. */
  let panel: ReactNode = null;
  /* Deals the step's board — and the build demo, so both show one order. */
  const seed =
    step?.kind === "question"
      ? `${characterId}.${courseId}.${n}.${step.index}.${round}.${showing ? "demo" : "play"}`
      : "";
  if (!finished && step.kind === "question") {
    const q = step.question;
    const { kind, target } = taskFor(q, showing);
    const how = showing ? undefined : demoFor(q, tone.face, seed);
    const label = format(dict.asks[q.ask.key], q.ask.vars ?? {});
    const verb = dict.tasks[kind];
    task = (
      <TaskChip
        key={`${step.index}-${kind}`}
        kind={kind}
        verb={verb}
        target={target}
        label={label}
        demo={how}
        closeLabel={lines.close}
        tone={courseTone}
        dir={dir}
      />
    );
    panel = (
      <TaskPanel
        key={`panel-${step.index}-${kind}`}
        kind={kind}
        verb={verb}
        target={target}
        label={label}
        demo={how}
        tone={courseTone}
        dir={dir}
        className="anim-fade-up hidden sm:flex lg:col-start-1 lg:row-start-1 lg:self-stretch"
      />
    );
  }

  /* What this lesson is — beside the steps from `sm`, and beside the reel
     on a desktop. */
  const about = (className: string) => (
    <LessonAbout
      courseName={courseName}
      title={title}
      titles={titles}
      lockedLabel={dict.lessonPicker.lockedLessonAria}
      doneLabel={lines.lessonDone}
      covers={covers}
      index={n - 1}
      characterId={characterId}
      courseId={courseId}
      tone={courseTone}
      dir={dir}
      className={className}
    />
  );

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
        {/* Onward goes BACK to the course page first: its path plays the
            step from this stop to the next, then opens the next lesson
            (`LessonPath`'s `advanceFrom`). */}
        <NextButton
          label={nextTitle ? (nextIsShape ? lines.nextShape : lines.nextLesson) : lines.finish}
          tone={GO_TONE}
          href={nextTitle ? `${coursePath}?from=${n}` : coursePath}
          dir={dir}
          className="lesson-onward"
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
        tone={onward}
        onDone={advance}
      />
    );
  } else if (step.kind === "question") {
    const q = step.question;

    if (q.type === "pick") {
      body = (
        <PickQuestion
          key={seed}
          show={q.show}
          word={q.word}
          options={q.options}
          answer={q.answer}
          seed={seed}
          demo={showing}
          onSolved={onSolved}
          onMiss={onMiss}
        />
      );
      action = showing ? (
        <NextButton label={lines.yourTurn} tone={onward} onPress={endDemo} dir={dir} className="lesson-onward" />
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
      action = <NextButton label={lines.next} tone={GO_TONE} onPress={advance} dir={dir} className="lesson-onward" />;
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
              tone={onward}
              onClick={() => spell.current?.help()}
              className="anim-pop-in h-12 gap-2 px-6 text-base font-bold lg:h-14 lg:px-7"
            >
              <Lightbulb className="h-5 w-5 fill-current" strokeWidth={2} />
              <span dir={dir}>{lines.help}</span>
            </Button3D>
          </div>
        );
      }
    } else if (q.type === "sort") {
      body = (
        <SortShapes key={seed} items={q.items} seed={seed} binAria={lines.sortBin} onSolved={onSolved} onMiss={onMiss} />
      );
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
        <NextButton label={lines.yourTurn} tone={onward} onPress={() => setBoard(true)} dir={dir} className="lesson-onward" />
      );
    }
    if (solved) action = <NextButton label={lines.next} tone={GO_TONE} onPress={advance} dir={dir} className="lesson-onward" />;
  }

  return (
    <>
      {/* The chrome row: out to the course, and what to do on this step —
          the round task button, centred between the back button and a
          spacer of its own width. A desktop has no task button: the task
          panel beside the step already shows the same how-to, always open. */}
      <BackRow href={coursePath} label={format(lines.backTo, { lessonName: courseName })}>
        <div className="flex min-w-0 flex-1 justify-center lg:hidden">{task}</div>
        <span aria-hidden className="h-12 w-12 shrink-0 sm:h-14 sm:w-14 lg:hidden" />
      </BackRow>
      {/* After the back row (it must be `<main>`'s first child): the page's
          heading, for a screen reader — the lesson's name is
          on screen as art and panels, never as one line of text. */}
      <h1 dir={dir} className="sr-only">
        {courseName}: {title}
      </h1>

      {/* Two bands, always in the same places: the step filling — and centred
          in — whatever height is left, and the way onward in a fixed-height
          slot at the bottom, so nothing jumps when the button appears. On a
          phone the slot stands a little clear of the tab bar (`pb`) — the
          same lift on every step, so every button sits in one spot. */}
      {step?.kind === "watch" ? (
        <div
          key={`${round}-${at}`}
          className={`stage-swap absolute inset-0 lg:static lg:mx-auto lg:grid lg:w-full lg:flex-1 lg:px-8 ${WIDE_GRID} ${
            leaving ? "stage-swap--out" : ""
          }`}
        >
          {body}
          {/* Desktop: the reel keeps the frame the steps will use — what
              this step is on the left (no demo: the eye, big). */}
          <TaskPanel
            kind="watch"
            verb={dict.tasks.watch}
            label={format(lines.reelAbout, { title })}
            tone={courseTone}
            dir={dir}
            className="anim-fade-up hidden lg:col-start-1 lg:row-start-1 lg:flex lg:self-stretch"
          />
          {about("anim-fade-up hidden lg:col-start-3 lg:row-start-1 lg:flex lg:self-stretch")}
        </div>
      ) : (
        /* Phone: `contents` — no box of its own, the step is laid out exactly
           as it always was. Tablet: the task and the lesson side by side
           above the step. Desktop: three columns of one height — the task
           (its how-to playing) on the left, the step on the course-coloured
           board in the middle, the course's lessons on the right. The done
           screen has neither panel; its board spans all three columns. */
        <div
          className={`contents sm:mx-auto sm:grid sm:w-full sm:max-w-3xl sm:flex-1 sm:grid-cols-2 sm:grid-rows-[auto_1fr] sm:gap-x-5 sm:px-8 sm:pt-6 ${WIDE_GRID}`}
        >
          {panel}
          {!finished && about("anim-fade-up hidden sm:flex lg:col-start-3 lg:row-start-1 lg:self-stretch")}
          {/* The desktop board: stays put while the steps swap on it. */}
          <div
            className={`lesson-board contents lg:row-start-1 lg:flex lg:min-w-0 lg:flex-col ${
              finished ? "lg:col-span-3 lg:col-start-1" : "lg:col-start-2"
            } ${solved && !leaving ? "lesson-board--solved" : ""}`}
            style={{ "--board-tone": courseTone.face } as CSSProperties}
          >
            <div
              key={`${round}-${at}-${demo}`}
              className={`stage-swap mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-6 pb-[min(2.5rem,4svh)] pt-5 sm:col-span-2 sm:row-start-2 sm:px-0 sm:pb-0 sm:pt-4 lg:max-w-none lg:px-6 lg:pb-3 lg:pt-2 xl:px-8 ${
                leaving ? "stage-swap--out" : ""
              }`}
            >
              <div className="flex w-full flex-1 flex-col items-center justify-center py-4 sm:py-6 lg:py-3 [@media(max-height:700px)]:py-2">
                {body}
              </div>
              <div className="flex h-16 shrink-0 items-center justify-center sm:h-20">{action}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
