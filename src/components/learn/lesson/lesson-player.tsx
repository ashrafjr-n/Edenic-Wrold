"use client";

import type { ReactNode } from "react";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Lightbulb } from "lucide-react";
import { SHAPES } from "@/data/shapes";
import { COLORS } from "@/data/colors";
import { format } from "@/lib/format-dict";
import { lessonCue } from "@/lib/cue";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { itemKey, useProgress } from "@/store/progress";
import type { Dictionary } from "@/lib/dictionaries/en";
import type { LessonDef } from "@/types/course";
import type { StrokePoint } from "@/types/stroke";
import { BackRow } from "@/components/ui/back-button";
import { AgainButton, NextButton } from "@/components/ui/morph-button";
import { Button3D } from "@/components/ui/button-3d";
import { TaskChip, TaskPanel } from "./task-chip";
import type { StaticImageData } from "next/image";
import { demoFor, lessonFaces, starsFor, taskFor, type Step } from "./lesson-steps";
import { FindShapes } from "./find-shapes";
import { ReelVideo } from "./reel-video";
import { PickQuestion } from "./pick-question";
import { TraceQuestion } from "./trace-question";
import { WordCard } from "./word-card";
import { SpellWord, type SpellWordHandle } from "./spell-word";
import { SortShapes } from "./sort-shapes";
import { PaintColors } from "./paint-colors";
import { PopBalloons } from "./pop-balloons";
import { OrderLine } from "./order-line";
import { MakeFood } from "./make-food";
import { LikesPlates } from "./likes-plates";
import { FillWord } from "./fill-word";
import { HarvestPick } from "./harvest-pick";
import { SeasonChange } from "./season-change";
import { TrainOrder } from "./train-order";
import { LessonDone } from "./lesson-done";
import { LessonAbout } from "./lesson-about";
import { StepTrail } from "./step-trail";

/* Green is every "Next" (direct request); the course's own colour (Pinki's
   pink, for her courses) is every other way onward (Your turn, Help, the
   reel's buttons) — a lesson wears two heroes only, the character's colour
   and the course colour, so no blue button here. */
const GO_TONE = {
  face: "var(--color-go)",
  edge: "var(--color-go-dark)",
  text: "#fff",
};

/** Kept in step with `.stage-swap--out`'s 0.2s in `globals.css`. */
const STEP_LEAVE_MS = 200;

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
  /** The next lesson teaches one shape — its button says "Next shape". */
  nextIsShape?: boolean;
  /** Art behind the reel while it loads. */
  image: string;
  /** The character's colour — the lesson wears it. */
  tone: { face: string; edge: string };
  /** The course's colour: every "onward" button that is not green. `ink`
      is what sits on it (white, or ink on Nova's gold). */
  courseTone: { face: string; edge: string; ink: string };
  /** Every lesson's cover in this course — the tablet/desktop lesson card. */
  covers: readonly (readonly StaticImageData[])[];
  dict: Dictionary;
  dir: "rtl" | "ltr";
}

/**
 * One lesson: the reel (when there is one), its steps, then "done". A Shapes
 * lesson is reel → word → trace → spell → find (`edenic-plan.md` §5). Each step only
 * reports `onSolved` / `onMiss`; the task chip (in the back row) and the way
 * onward live here (see the return). The reel is the
 * exception: it fills the whole stage and has no bands at all (on a desktop
 * it takes the board's column, between the same two panels as the steps).
 *
 * The first question is shown before it is asked: a Pick's answer glows,
 * and a Trace always starts with the shape drawing itself. Then it is the
 * child's turn.
 */
export function LessonPlayer({
  lesson,
  characterId,
  courseId,
  n,
  courseName,
  title,
  nextTitle,
  nextIsShape = false,
  image,
  tone,
  courseTone,
  covers,
  dict,
  dir,
}: LessonPlayerProps) {
  const onward = { face: courseTone.face, edge: courseTone.edge, text: courseTone.ink };
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
  /* The demo's turn on the first question — only while the child has not been
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
    /* Phone/tablet and desktop each render their own copy of the buttons;
       the hidden one has no box. */
    const onward = [...document.querySelectorAll<HTMLElement>("main .lesson-onward")].find(
      (button) => button.offsetParent !== null,
    );
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
  /* The same task, docked beside the step on a tablet. */
  let panel: ReactNode = null;
  /* And as the current stop of the desktop's step trail. */
  let current: ReactNode = null;
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
        className="anim-fade-up hidden sm:flex lg:hidden"
      />
    );
    current = task;
  } else if (!finished && step.kind === "watch") {
    current = (
      <TaskChip
        kind="watch"
        verb={dict.tasks.watch}
        label={format(lines.reelAbout, { title })}
        closeLabel={lines.close}
        tone={courseTone}
        dir={dir}
      />
    );
  }

  const kinds = steps.map((s) => (s.kind === "watch" ? "watch" : taskFor(s.question, false).kind));

  /* ---- The step itself, and the way onward ---- */
  const coursePath = `/learn/${characterId}/${courseId}`;
  let body: ReactNode = null;
  /* Phone and tablet: the one slot under the step. */
  let action: ReactNode = null;
  /* Desktop: the button row — the ways back (Play again, Start over, Help)
     first, the way onward last. */
  let footStart: ReactNode = null;
  let footEnd: ReactNode = null;

  if (finished) {
    body = (
      <LessonDone
        title={lines.lessonDone}
        words={lesson.questions.flatMap((q) =>
          q.type === "word" ? [{ word: q.word, tone: q.color && COLORS[q.color].letter }] : [],
        )}
        faces={lessonFaces(lesson)}
        drawing={drawing}
        accent={tone.face}
        dir={dir}
      />
    );
    const again = <AgainButton label={lines.playAgain} onPress={restart} dir={dir} />;
    /* Onward goes straight on to the next lesson (direct request
       2026-10-02) — the course page is only for coming back; after the
       last lesson it is where Finish goes. */
    const onwardDone = (
      <NextButton
        label={nextTitle ? (nextIsShape ? lines.nextShape : lines.nextLesson) : lines.finish}
        tone={GO_TONE}
        href={nextTitle ? `${coursePath}/${n + 1}` : coursePath}
        dir={dir}
        className="lesson-onward"
      />
    );
    action = (
      <div className="flex items-center gap-3 sm:gap-4">
        {again}
        {onwardDone}
      </div>
    );
    footStart = again;
    footEnd = onwardDone;
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
          plain={q.plain}
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
    } else if (q.type === "word") {
      body = (
        <WordCard
          word={q.word}
          shape={q.shape}
          picture={q.picture}
          tone={q.color && COLORS[q.color].letter}
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
          tone={q.color && COLORS[q.color].letter}
          picture={q.picture}
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
      footStart = startOver;
      /* Offered from the SECOND full-but-wrong word (the first just sends the
         misplaced letters home), in the Next button's place, and it stays —
         the child can keep trying without ever pressing it. */
      if (stepMisses >= 2 && !solved) {
        const help = (
          <Button3D
            tone={onward}
            onClick={() => spell.current?.help()}
            className="anim-pop-in h-12 gap-2 px-6 text-base font-bold lg:h-14 lg:px-7"
          >
            <Lightbulb className="h-5 w-5 fill-current" strokeWidth={2} />
            <span dir={dir}>{lines.help}</span>
          </Button3D>
        );
        action = (
          <div className="flex items-center gap-3">
            {startOver}
            {help}
          </div>
        );
        footStart = (
          <>
            {startOver}
            {help}
          </>
        );
      }
    } else if (q.type === "sort") {
      body = (
        <SortShapes key={seed} items={q.items} bins={q.bins} seed={seed} binAria={lines.sortBin} onSolved={onSolved} onMiss={onMiss} />
      );
    } else if (q.type === "paint") {
      body = <PaintColors key={seed} rounds={q.rounds} pots={q.pots} potAria={lines.potAria} onSolved={onSolved} onMiss={onMiss} />;
    } else if (q.type === "pop") {
      body = (
        <PopBalloons key={seed} color={q.color} others={q.others} seed={seed} balloonAria={lines.balloonAria} onSolved={onSolved} onMiss={onMiss} />
      );
    } else if (q.type === "order") {
      body = <OrderLine key={seed} items={q.items} seed={seed} itemAria={lines.findItemAria} onSolved={onSolved} onMiss={onMiss} />;
    } else if (q.type === "make") {
      body = (
        <MakeFood
          key={seed}
          list={q.list}
          stall={q.stall}
          into={q.into}
          full={q.full}
          serve={q.serve}
          seed={seed}
          itemAria={lines.findItemAria}
          hearLabel={lines.hearWord}
          onSolved={onSolved}
          onMiss={onMiss}
        />
      );
    } else if (q.type === "likes") {
      body = <LikesPlates key={seed} items={q.items} likeAria={lines.likeAria} dislikeAria={lines.dislikeAria} hearLabel={lines.hearWord} onSolved={onSolved} />;
    } else if (q.type === "fill") {
      body = <FillWord key={seed} word={q.word} picture={q.picture} letterAria={lines.letterAria} hearLabel={lines.hearWord} onSolved={onSolved} />;
    } else if (q.type === "change") {
      body = (
        <SeasonChange
          key={seed}
          word={q.word}
          scene={q.scene}
          spotLabel={format(lines.seasonSpotAria, { season: q.word })}
          hearLabel={lines.hearWord}
          onSolved={onSolved}
        />
      );
    } else if (q.type === "train") {
      body = <TrainOrder key={seed} engine={q.engine} wagons={q.wagons} seed={seed} itemAria={lines.findItemAria} onSolved={onSolved} onMiss={onMiss} />;
    } else if (q.type === "harvest") {
      body = <HarvestPick key={seed} order={q.order} garden={q.garden} itemAria={lines.findItemAria} hearLabel={lines.hearWord} onSolved={onSolved} onMiss={onMiss} />;
    } else if (q.type === "find") {
      body = (
        <FindShapes
          key={seed}
          scene={q.scene}
          target={q.target}
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
    if (q.type !== "spell") footEnd = action;
    if (solved) {
      action = <NextButton label={lines.next} tone={GO_TONE} onPress={advance} dir={dir} className="lesson-onward" />;
      footStart = null;
      footEnd = action;
    }
  }

  return (
    <>
      {/* The chrome row: out to the course, and what to do on this step.
          Phone and tablet: the round task button, centred between the back
          button and a spacer of its own width. Desktop: the lesson's steps
          as a trail in the middle of the page, the current one being that
          same round button. */}
      <BackRow href={coursePath} label={format(lines.backTo, { lessonName: courseName })}>
        <div className="flex min-w-0 flex-1 justify-center lg:hidden">{task}</div>
        <span aria-hidden className="h-12 w-12 shrink-0 sm:h-14 sm:w-14 lg:hidden" />
        <div className="hidden lg:absolute lg:left-1/2 lg:flex lg:-translate-x-1/2">
          <StepTrail kinds={kinds} at={at} current={current} tone={courseTone} />
        </div>
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
          same lift on every step, so every button sits in one spot. A
          desktop moves the way onward into the footer bar instead. */}
      {step?.kind === "watch" ? (
        <div
          key={`${round}-${at}`}
          className={`stage-swap absolute inset-0 lg:static lg:mx-auto lg:flex lg:w-full lg:max-w-5xl lg:flex-1 lg:flex-col lg:px-8 lg:py-4 ${
            leaving ? "stage-swap--out" : ""
          }`}
        >
          {body}
        </div>
      ) : (
        /* Phone: `contents` — no box of its own, the step is laid out exactly
           as it always was. Tablet: the task and the lesson side by side
           above the step. Desktop: an open stage — no board, no card — as
           wide as the page's content column. */
        <div className="contents sm:mx-auto sm:grid sm:w-full sm:max-w-3xl sm:flex-1 sm:grid-cols-2 sm:grid-rows-[auto_1fr] sm:gap-x-5 sm:px-8 sm:pt-6 lg:flex lg:max-w-5xl lg:flex-col lg:py-4">
          {panel}
          {!finished && (
            <LessonAbout
              courseName={courseName}
              title={title}
              covers={covers}
              index={n - 1}
              tone={courseTone}
              dir={dir}
              className="anim-fade-up hidden sm:flex lg:hidden"
            />
          )}
          {/* The desktop stage: stays put while the steps swap on it. */}
          <div className="lesson-board contents lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
            <div
              key={`${round}-${at}-${demo}`}
              className={`stage-swap mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-6 pb-[min(2.5rem,4svh)] pt-5 sm:col-span-2 sm:row-start-2 sm:px-0 sm:pb-0 sm:pt-4 lg:max-w-none lg:p-6 ${
                leaving ? "stage-swap--out" : ""
              }`}
            >
              <div className="flex w-full flex-1 flex-col items-center justify-center py-4 sm:py-6 lg:py-3 [@media(max-height:700px)]:py-2">
                {body}
              </div>
              {/* On the done screen the buttons sit higher (direct request) —
                  closer to what was just learned. */}
              <div className={`flex h-16 shrink-0 items-center justify-center sm:h-20 lg:hidden ${finished ? "mb-[min(4.5rem,8svh)]" : ""}`}>
                {action}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop: the button row, on every step — centred under the stage,
          the ways back first and the way onward last. Keyed like the stage,
          so a pressed (collapsed) Next never carries over into the next
          step's button. */}
      <div
        key={`${round}-${at}-${demo}`}
        className={`mx-auto hidden h-24 w-full max-w-5xl items-center justify-center gap-4 px-8 lg:flex ${finished ? "lg:mb-[min(4rem,7svh)]" : ""}`}
      >
        {footStart}
        {footEnd}
      </div>
    </>
  );
}
