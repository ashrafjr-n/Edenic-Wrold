"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";
import { ArrowRight, RotateCcw, Unlock } from "lucide-react";
import type { Character } from "@/types/character";
import type { NumberItem } from "@/types/number-item";
import { JOURNEY_STAGES, WORKING_STAGES } from "@/types/number-journey";
import type { JourneyStage } from "@/types/number-journey";
import { scriptFor } from "@/data/number-script";
import { countActivityFor } from "@/data/count-activities";
import { guideFor, pointsAtTarget } from "@/data/number-guide";
import { buildNumberChoices } from "@/lib/number-choices";
import { itemKey, useProgress } from "@/store/progress";
import { Button3D } from "@/components/ui/button-3d";
import type { ButtonTone } from "@/components/ui/button-3d";
import { NumberVideo } from "./number-video";
import { Numeral } from "./numeral";
import { PinkiGuide } from "./pinki-guide";
import { PinkiLean } from "./pinki-lean";
import { StageDots } from "./stage-dots";
import { SayItButton } from "./say-it-button";
import { StrokeDemo } from "./stroke-demo";
import { TraceBoard } from "./trace-board";
import { NumberQuiz } from "./number-quiz";
import { AppleGive } from "./apple-give";
import { NumberComplete } from "./number-complete";
import { NumberPath } from "./number-path";
import { NumberColor } from "./number-color";
import { BalloonPop } from "./balloon-pop";
import { Celebration } from "@/components/ui/celebration";
import { StarReward } from "@/components/ui/star-reward";

/* Green is the "you got it, carry on" button and nothing else, so it never
   appears on a step the child has not passed. Blue is the ordinary primary
   action. The character's own pink is used for neither: the ground here IS
   her colour, and a pink button vanishes into it. */
const GO_TONE = {
  face: "var(--color-go)",
  edge: "var(--color-go-dark)",
  text: "#fff",
} as const;

const BRAND_TONE = {
  face: "var(--brand)",
  edge: "var(--brand-dark)",
  text: "#fff",
} as const;

/* `--color-ink-fixed`, not `--color-ink`: the button this pairs with wears
   `.btn3d--clay-white`, which is pinned pale in dark mode (globals.css), so
   its text has to stay fixed dark too — `--color-ink` itself flips light
   there. */
const WHITE_TONE = {
  face: "var(--surface)",
  text: "var(--color-ink-fixed)",
} as const;

const FIND_CHOICES = 3;
const COUNT_CHOICES = 3;
const POP_CHOICES = 5;

/** How much of the numeral has to be covered, per attempt. It falls with every
    miss so a child who is struggling always gets through — the third attempt
    accepts more or less anything drawn on the numeral. */
const TRACE_COVERAGE = [0.55, 0.42, 0.25];

/** Stars are for the WHOLE journey, awarded once at the end. Mistakes across
    every stage are counted, not scored per step, so the final tally means "how
    did that go" rather than "how neat was your handwriting". */
function starsFor(mistakes: number): number {
  if (mistakes <= 1) return 3;
  if (mistakes <= 4) return 2;
  return 1;
}

interface NumberJourneyProps {
  item: NumberItem;
  character: Character;
  lessonId: string;
  /** Where the journey goes next: the following number, or the number list. */
  nextHref: string;
  nextValue?: number;
}

export function NumberJourney({
  item,
  character,
  lessonId,
  nextHref,
  nextValue,
}: NumberJourneyProps) {
  const { value, image, videoId, strokes } = item;
  const { accent } = character;
  const script = scriptFor(value);
  const countActivity = countActivityFor(value);

  const [stage, setStage] = useState<JourneyStage>("discover");
  /* One flag across every stage: false is "still working", true is "passed —
     here is the confetti and the green button". Reset on every move. */
  const [solved, setSolved] = useState(false);
  /* Every wrong pick, wrong pop and missed trace attempt, across the whole
     journey. The only input to the final star count. */
  const [mistakes, setMistakes] = useState(0);
  const [traceAttempt, setTraceAttempt] = useState(0);
  const [traceMissed, setTraceMissed] = useState(false);
  const [pickMissed, setPickMissed] = useState(false);
  /* The count stage has two beats: hand over the apple, then say how many. */
  const [appleGiven, setAppleGiven] = useState(false);
  /* Bumping this remounts whichever interactive stage is on screen, which is
     how a retry clears it — that state lives inside the stage, not up here. */
  const [attempt, setAttempt] = useState(0);

  const complete = useProgress((state) => state.complete);
  const stars = starsFor(mistakes);

  /* Recorded when the celebration is reached, not when "Next" is pressed: the
     child has finished the number by then, and closing the tab on the star
     screen should not lose it. */
  useEffect(() => {
    if (stage !== "celebrate") return;
    complete(itemKey(character.id, lessonId, value), stars);
  }, [stage, complete, character.id, lessonId, value, stars]);

  const stageIndex = JOURNEY_STAGES.indexOf(stage);
  const findChoices = buildNumberChoices(value, FIND_CHOICES);
  const countChoices = buildNumberChoices(value, COUNT_CHOICES);
  const popChoices = buildNumberChoices(value, POP_CHOICES);

  const advance = () => {
    setSolved(false);
    setTraceMissed(false);
    setPickMissed(false);
    setStage(JOURNEY_STAGES[stageIndex + 1]);
  };

  const miss = () => setMistakes((count) => count + 1);

  const pickMiss = () => {
    setPickMissed(true);
    miss();
  };

  const retryTrace = () => {
    setTraceAttempt((count) => count + 1);
    setTraceMissed(false);
    /* Resetting `solved` is what makes the board live again: it is passed
       down as `locked`, so pressing "Try Again" AFTER passing the trace used
       to remount a board that was frozen on arrival — the child could not
       draw a single line and the only way out was "Next". */
    setSolved(false);
    setAttempt((count) => count + 1);
  };

  const restart = () => {
    setStage("discover");
    setSolved(false);
    setMistakes(0);
    setTraceAttempt(0);
    setTraceMissed(false);
    setPickMissed(false);
    setAppleGiven(false);
    setAttempt((count) => count + 1);
  };

  /* Pinki's whole appearance for the stage on screen — how big she is, what
     she is doing and what she says. Resolved by `data/number-guide.ts` rather
     than by a branch here: this was a forty-line nested ternary in the middle
     of the component, and her size in particular has to have exactly one
     answer, or the stage that asks for her and the component that draws her
     can drift apart. */
  const guide = guideFor(stage, script, {
    countKind: countActivity.kind,
    appleGiven,
    traceMissed,
    pickMissed,
  });

  /* Only meaningful where she is actually pointing — see `pointsAtTarget`. */
  const marksTarget = pointsAtTarget(guide);

  /* Each stage is TWO pieces, not one block of markup: the thing the child
     works on, and the buttons that move them along. They are split because
     `lead` puts the buttons under Pinki's speech bubble, in the column her
     crop leaves free on the left, while the activity stays above her — so the
     two halves land in different places on the screen and cannot be one
     fragment. Built above the return, per stage, rather than branched inside
     the markup. */
  const nextButton = (label: string, tone: ButtonTone) => (
    <Button3D
      tone={tone}
      onClick={advance}
      className="px-8 py-3 text-base sm:px-10 sm:text-lg"
    >
      {label}
      <ArrowRight className="h-5 w-5" strokeWidth={2.75} />
    </Button3D>
  );

  let body: ReactNode = null;
  let actions: ReactNode = null;

  if (stage === "discover") {
    /* **The button sits BESIDE the reel from `sm` up, never underneath it**,
       and it stays inside `body` for exactly that reason — the split into
       body/actions exists so `lead` can move buttons under Pinki's bubble,
       and this stage is `aside`, so it keeps the row it already had. Stacking
       them capped the video's height to leave room below, which fought the
       whole point of this stage; moving the button to the side is what
       removed that ceiling. */
    body = (
      <div className="anim-rise-in flex w-full flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-10 lg:gap-14">
        {videoId && (
          <NumberVideo videoId={videoId} value={value} image={image} />
        )}

        <div className="flex items-center gap-3 sm:flex-col sm:items-stretch sm:gap-4">
          <Button3D
            tone={BRAND_TONE}
            onClick={advance}
            className="px-7 py-3 text-base sm:px-9 sm:py-4 sm:text-lg"
          >
            Next
            <ArrowRight className="h-5 w-5" strokeWidth={2.75} />
          </Button3D>
        </div>
      </div>
    );
  } else if (stage === "reveal") {
    /* The numeral alone, and bigger than it was: it is the whole subject of
       this stage, and it used to sit tight under the stage dots sharing its
       screen with the say-it button. The top margin is what pushes it clear
       of them. */
    body = (
      <div className="anim-rise-in mt-3 sm:mt-6">
        <Numeral
          value={value}
          image={image}
          sizeClass="h-36 w-36 sm:h-52 sm:w-52"
        />
      </div>
    );
    /* Both of the things the child can press, stacked in ONE column beside
       Pinki rather than split across the screen — the gold say-it button
       under her line, and the way onward under that. Placed and timed now so
       adding audio later changes no layout. */
    actions = (
      <div className="flex flex-col items-start gap-3 sm:gap-4">
        <p className="text-sm font-semibold text-[var(--color-ink-soft)] sm:text-base">
          Can you say it?
        </p>

        <SayItButton word={script.word} />

        {nextButton("Next", BRAND_TONE)}
      </div>
    );
  } else if (stage === "demo") {
    body = (
      <div className="card anim-rise-in aspect-square w-full max-w-[13rem] p-4 sm:max-w-[16rem] sm:p-6">
        <StrokeDemo strokes={strokes} accent={accent} />
      </div>
    );
    /* Pushed down off the bubble so there is a clear band between Pinki's
       line and the one thing to press here — it sat tight under the bubble
       with her leaning across it. */
    actions = <div className="mt-2 sm:mt-4">{nextButton("My turn!", BRAND_TONE)}</div>;
  } else if (stage === "trace") {
    body = (
      /* Much larger than the demo card it follows, and the centre of its own
         screen: Pinki is off this stage entirely, so the whole column is the
         board's. This is the one thing the child does with their hand, and it
         was the smallest object on the page. */
      <div className="card anim-rise-in relative aspect-square w-full max-w-[17rem] p-4 sm:max-w-[24rem] sm:p-6">
        <TraceBoard
          key={attempt}
          strokes={strokes}
          accent={accent}
          minCoverage={
            TRACE_COVERAGE[Math.min(traceAttempt, TRACE_COVERAGE.length - 1)]
          }
          onFinish={() => setSolved(true)}
          onMiss={() => {
            setTraceMissed(true);
            setTraceAttempt((count) => count + 1);
            miss();
          }}
          locked={solved}
        />
        {solved && <Celebration />}
      </div>
    );
    actions = (
      <div className="anim-fade-up flex items-center gap-2 sm:gap-3">
        <Button3D
          variant="calm"
          tone={WHITE_TONE}
          onClick={retryTrace}
          className="btn3d--clay-white px-4 py-2.5 text-sm sm:px-6 sm:py-3 sm:text-base"
        >
          {/* `--color-ink-soft-fixed`, not `--color-ink-soft`: this icon rides
              inside a `.btn3d--clay-white` button, pinned pale regardless of
              theme (globals.css) — `--color-ink-soft` itself flips light in
              dark mode, for the same body-text reason `--color-ink` does. */}
          <RotateCcw
            className="h-4 w-4 text-[var(--color-ink-soft-fixed)]"
            strokeWidth={2.75}
          />
          Try Again
        </Button3D>

        {solved && nextButton("Next", GO_TONE)}
      </div>
    );
  } else if (stage === "find") {
    body = (
      <div className="anim-rise-in relative">
        <NumberQuiz
          key={`find-${attempt}`}
          choices={findChoices}
          answer={value}
          solved={solved}
          onCorrect={() => setSolved(true)}
          onWrong={pickMiss}
        />
        {solved && <Celebration />}
      </div>
    );
    actions = solved ? nextButton("Next", GO_TONE) : null;
  } else if (stage === "count") {
    body =
      countActivity.kind === "give" ? (
        /* Two beats, because the point of this activity is the LINK: hand over
           the item, then say what that many of it is called. Giving alone
           teaches nothing about the numeral; asking alone teaches nothing
           about quantity. */
        !appleGiven ? (
          <div className="anim-rise-in">
            <AppleGive
              key={`give-${attempt}`}
              target={value}
              icon={countActivity.icon}
              itemLabel={countActivity.itemLabel}
              highlightTarget={marksTarget}
              onGiven={() => setAppleGiven(true)}
            />
          </div>
        ) : (
          <div className="anim-rise-in relative">
            <NumberQuiz
              key={`count-${attempt}`}
              choices={countChoices}
              answer={value}
              solved={solved}
              onCorrect={() => setSolved(true)}
              onWrong={pickMiss}
            />
            {solved && <Celebration />}
          </div>
        )
      ) : countActivity.kind === "complete" ? (
        <div className="anim-rise-in relative">
          <NumberComplete
            key={`complete-${attempt}`}
            value={value}
            image={image}
            highlightTarget={marksTarget}
            onFinish={() => setSolved(true)}
            onMiss={pickMiss}
          />
          {solved && <Celebration />}
        </div>
      ) : countActivity.kind === "path" ? (
        <div className="anim-rise-in relative">
          <NumberPath
            key={`path-${attempt}`}
            numbers={countActivity.numbers}
            target={value}
            accent={accent}
            onFinish={() => setSolved(true)}
          />
          {solved && <Celebration />}
        </div>
      ) : (
        <div className="anim-rise-in relative">
          <NumberColor
            key={`color-${attempt}`}
            value={value}
            image={image}
            strokes={strokes}
            accent={accent}
            onFinish={() => setSolved(true)}
          />
          {solved && <Celebration />}
        </div>
      );
    actions = solved ? nextButton("Next", GO_TONE) : null;
  } else if (stage === "game") {
    body = (
      /* No sibling `<Celebration>` here, unlike the other stages — the
         balloons keep drifting even after a win, so a burst centred on this
         wrapper would land away from the popped balloon. `BalloonPop` bursts
         its own confetti from the balloon itself. */
      <div className="anim-rise-in relative">
        <BalloonPop
          key={`pop-${attempt}`}
          choices={popChoices}
          answer={value}
          onCorrect={() => setSolved(true)}
          onMiss={pickMiss}
        />
      </div>
    );
    actions = solved ? nextButton("See my stars!", GO_TONE) : null;
  } else {
    body = (
      <>
        <p className="anim-fade-up text-center text-xl font-bold text-[var(--color-ink)] sm:text-2xl">
          Number {value} complete!
        </p>

        <div className="relative">
          <StarReward stars={stars} />
          <Celebration />
        </div>

        {/* The unlock is the payoff for the whole journey, so it is stated in
            words rather than left for the child to notice on the list — a
            green clay pill, not plain colored text, so it reads as its own
            small reward next to the stars instead of a caption. */}
        {nextValue && (
          <div
            className="clay anim-pop-in flex items-center gap-2 rounded-full px-5 py-2.5 sm:gap-2.5 sm:px-6 sm:py-3"
            style={
              {
                backgroundColor: "var(--color-go)",
                "--clay-edge": "var(--color-go-dark)",
                animationDelay: "0.6s",
              } as CSSProperties
            }
          >
            <Unlock
              className="h-5 w-5 text-white sm:h-6 sm:w-6"
              strokeWidth={2.75}
            />
            <span className="text-base font-bold text-white sm:text-lg">
              Number {nextValue} unlocked!
            </span>
          </div>
        )}
      </>
    );
    actions = (
      <div className="anim-fade-up flex items-center gap-3 sm:gap-4">
        <Button3D
          variant="calm"
          tone={WHITE_TONE}
          onClick={restart}
          className="btn3d--clay-white px-6 py-3 text-sm sm:text-base"
        >
          <RotateCcw
            className="h-4 w-4 text-[var(--color-ink-soft-fixed)]"
            strokeWidth={2.75}
          />
          Again
        </Button3D>

        <Button3D
          tone={GO_TONE}
          href={nextHref}
          className="px-8 py-3 text-base sm:px-10 sm:text-lg"
        >
          {nextValue ? `Number ${nextValue}` : "Finish"}
          <ArrowRight className="h-5 w-5" strokeWidth={2.75} />
        </Button3D>
      </div>
    );
  }

  const lead = guide.presence === "lead";
  /* `find` is the one stage that centres her: the child is choosing between
     numerals laid across the width, so she stands behind the choice rather
     than leaning in from one side of it. Every other `lead` stage keeps the
     right-edge crop. */
  const leanPlacement = stage === "find" ? "journeyCenter" : "journey";

  return (
    /* `relative` anchors both out-of-flow guides — `lead`'s life-size Pinki
       and `aside`'s corner one — against this column, so neither costs the
       stage any height. **No `overflow-hidden` here**: `lead` deliberately
       runs past the right edge, and the route's `<main>` carries
       `overflow-x-hidden` to stop that widening the document.

       `lead` stacks from the TOP on a phone, so the activity keeps the upper
       half of the screen and Pinki fills the lower one beneath it. From `sm`
       it centres again: a desktop column is much taller than its content, and
       pinning that content to the top there left a large dead band between it
       and the bottom-anchored Pinki. Every other presence centres at all
       widths. */
    <div
      className={`relative flex w-full flex-1 flex-col items-center gap-4 sm:gap-6 ${
        lead ? "justify-start sm:justify-center" : "justify-center"
      }`}
    >
      {stage !== "celebrate" && (
        <StageDots
          current={stageIndex}
          total={WORKING_STAGES.length}
          accent={accent}
        />
      )}

      {/* Pinki is on every stage, but WHERE she sits in the column is part of
          what her presence means. `lead` comes after the activity, because she
          is the lower half of the screen and her bubble carries the stage's
          buttons with it; `hero` and `aside` come before it, unchanged. */}
      {!lead && (
        <PinkiGuide
          pose={guide.pose}
          line={guide.line}
          presence={guide.presence}
        />
      )}

      {body}

      {/* Life size, and positioned against THIS column rather than against the
          bubble row below — she is sized as a share of its height, and it is
          the box whose right edge crops her. Rendered here for that reason
          alone; `data/number-guide.ts` still decides whether she appears. */}
      {lead && <PinkiLean pose={guide.pose} placement={leanPlacement} />}

      {lead ? (
        <PinkiGuide
          pose={guide.pose}
          line={guide.line}
          presence={guide.presence}
        >
          {actions}
        </PinkiGuide>
      ) : (
        actions
      )}
    </div>
  );
}
