"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Pencil, RotateCcw, SkipForward, Unlock } from "lucide-react";
import type { Character } from "@/types/character";
import type { NumberItem } from "@/types/number-item";
import { JOURNEY_STAGES, WORKING_STAGES } from "@/types/number-journey";
import type { JourneyStage } from "@/types/number-journey";
import { scriptFor } from "@/data/number-script";
import { buildNumberChoices } from "@/lib/number-choices";
import { itemKey, useProgress } from "@/store/progress";
import { Button3D } from "@/components/ui/button-3d";
import { NumberVideo } from "./number-video";
import { PinkiGuide } from "./pinki-guide";
import { StageDots } from "./stage-dots";
import { SayItButton } from "./say-it-button";
import { StrokeDemo } from "./stroke-demo";
import { TraceBoard } from "./trace-board";
import { NumberQuiz } from "./number-quiz";
import { AppleGive } from "./apple-give";
import { BalloonPop } from "./balloon-pop";
import { Celebration } from "./celebration";
import { StarReward } from "./star-reward";

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

const WHITE_TONE = {
  face: "var(--surface)",
  text: "var(--color-ink)",
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
  /** The number list — the way out at any point. */
  lessonHref: string;
  nextValue?: number;
}

export function NumberJourney({
  item,
  character,
  lessonId,
  nextHref,
  lessonHref,
  nextValue,
}: NumberJourneyProps) {
  const { value, videoId, strokes } = item;
  const { accent, accentDark } = character;
  const script = scriptFor(value);

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

  /* Pinki's pose and line for the stage on screen. Derived here rather than
     inline in the markup so each stage below is only its own content. */
  const guide: { pose: "speak" | "pen" | "celebrate"; line: string } =
    stage === "discover"
      ? { pose: "speak", line: script.discover }
      : stage === "demo"
        ? { pose: "pen", line: script.strokeHint }
        : stage === "trace"
          ? {
              pose: "pen",
              line: traceMissed ? script.traceMiss : script.traceInvite,
            }
          : stage === "find"
            ? {
                pose: "speak",
                line: pickMissed ? script.findMiss : script.find,
              }
            : stage === "count"
              ? {
                  pose: appleGiven ? "celebrate" : "speak",
                  line: pickMissed
                    ? script.findMiss
                    : appleGiven
                      ? script.countHow
                      : script.count,
                }
              : stage === "game"
                ? {
                    pose: "speak",
                    line: pickMissed ? script.findMiss : script.game,
                  }
                : { pose: "celebrate", line: script.celebrate };

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-6 sm:gap-8">
      {stage !== "celebrate" && (
        <StageDots
          current={stageIndex}
          total={WORKING_STAGES.length}
          accent={accent}
        />
      )}

      {/* Pinki opens every stage. She is the through-line that makes seven
          screens read as one journey rather than seven exercises. */}
      <PinkiGuide
        pose={guide.pose}
        line={guide.line}
        size={stage === "celebrate" ? "lg" : "sm"}
      />

      {stage === "discover" && (
        <div className="anim-rise-in flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
          {videoId && <NumberVideo videoId={videoId} value={value} />}

          <div className="flex flex-col items-center gap-4 sm:gap-6">
            {/* The word, then the button that will speak it. Placed and
                timed now so adding audio later changes no layout. */}
            <p className="text-center text-sm font-semibold text-[var(--color-ink-soft)] sm:text-base">
              Can you say it?
            </p>

            <SayItButton
              word={script.word}
              accent={accent}
              accentDark={accentDark}
            />

            <div className="flex items-center gap-3">
              <Button3D
                tone={BRAND_TONE}
                onClick={advance}
                className="px-7 py-3 text-base sm:px-8 sm:text-lg"
              >
                <Pencil className="h-5 w-5" strokeWidth={2.75} />
                Let&apos;s draw
              </Button3D>

              {/* Skip is a plain white chip, never greyed or shrunken — a
                  child who has watched enough is not doing anything wrong. */}
              <Button3D
                variant="calm"
                tone={WHITE_TONE}
                onClick={advance}
                className="btn3d--clay-white px-5 py-3 text-sm sm:text-base"
              >
                Skip
                <SkipForward
                  className="h-4 w-4 fill-current text-[var(--color-ink-soft)]"
                  strokeWidth={1.5}
                />
              </Button3D>
            </div>
          </div>
        </div>
      )}

      {stage === "demo" && (
        <>
          <div className="card anim-rise-in aspect-square w-full max-w-[15rem] p-5 sm:max-w-[18rem] sm:p-6">
            <StrokeDemo strokes={strokes} accent={accent} />
          </div>

          <Button3D
            tone={GO_TONE}
            onClick={advance}
            className="anim-fade-up px-8 py-3 text-base sm:px-10 sm:text-lg"
          >
            My turn!
            <ArrowRight className="h-5 w-5" strokeWidth={2.75} />
          </Button3D>
        </>
      )}

      {stage === "trace" && (
        <>
          <div className="card anim-rise-in relative aspect-square w-full max-w-[15rem] p-5 sm:max-w-[18rem] sm:p-6">
            <TraceBoard
              key={attempt}
              strokes={strokes}
              accent={accent}
              minCoverage={
                TRACE_COVERAGE[
                  Math.min(traceAttempt, TRACE_COVERAGE.length - 1)
                ]
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

          <div className="anim-fade-up flex items-center gap-3 sm:gap-4">
            <Button3D
              variant="calm"
              tone={WHITE_TONE}
              onClick={retryTrace}
              className="btn3d--clay-white px-6 py-3 text-sm sm:text-base"
            >
              <RotateCcw
                className="h-4 w-4 text-[var(--color-ink-soft)]"
                strokeWidth={2.75}
              />
              Try Again
            </Button3D>

            {solved && (
              <Button3D
                tone={GO_TONE}
                onClick={advance}
                className="px-8 py-3 text-base sm:px-10 sm:text-lg"
              >
                Next
                <ArrowRight className="h-5 w-5" strokeWidth={2.75} />
              </Button3D>
            )}
          </div>
        </>
      )}

      {stage === "find" && (
        <>
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

          {solved && (
            <Button3D
              tone={GO_TONE}
              onClick={advance}
              className="anim-fade-up px-8 py-3 text-base sm:px-10 sm:text-lg"
            >
              Next
              <ArrowRight className="h-5 w-5" strokeWidth={2.75} />
            </Button3D>
          )}
        </>
      )}

      {stage === "count" && (
        <>
          {/* Two beats, because the point of this stage is the LINK: hand over
              one apple, then say what "one apple" is called. Giving alone
              teaches nothing about the numeral; asking alone teaches nothing
              about quantity. */}
          {!appleGiven ? (
            <div className="anim-rise-in">
              <AppleGive
                key={`apples-${attempt}`}
                target={value}
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
          )}

          {solved && (
            <Button3D
              tone={GO_TONE}
              onClick={advance}
              className="anim-fade-up px-8 py-3 text-base sm:px-10 sm:text-lg"
            >
              Next
              <ArrowRight className="h-5 w-5" strokeWidth={2.75} />
            </Button3D>
          )}
        </>
      )}

      {stage === "game" && (
        <>
          <div className="anim-rise-in relative">
            <BalloonPop
              key={`pop-${attempt}`}
              choices={popChoices}
              answer={value}
              onCorrect={() => setSolved(true)}
              onMiss={pickMiss}
            />
            {solved && <Celebration />}
          </div>

          {solved && (
            <Button3D
              tone={GO_TONE}
              onClick={advance}
              className="anim-fade-up px-8 py-3 text-base sm:px-10 sm:text-lg"
            >
              See my stars!
              <ArrowRight className="h-5 w-5" strokeWidth={2.75} />
            </Button3D>
          )}
        </>
      )}

      {stage === "celebrate" && (
        <>
          <p className="anim-fade-up text-center text-xl font-bold text-[var(--color-ink)] sm:text-2xl">
            Number {value} complete!
          </p>

          <div className="relative">
            <StarReward stars={stars} />
            <Celebration />
          </div>

          {/* The unlock is the payoff for the whole journey, so it is stated
              in words rather than left for the child to notice on the list. */}
          {nextValue && (
            <p
              className="anim-pop-in flex items-center gap-2 text-base font-bold sm:text-lg"
              style={{ color: "var(--color-go-dark)", animationDelay: "0.6s" }}
            >
              <Unlock className="h-5 w-5" strokeWidth={2.75} />
              Number {nextValue} unlocked!
            </p>
          )}

          <div className="anim-fade-up flex items-center gap-3 sm:gap-4">
            <Button3D
              variant="calm"
              tone={WHITE_TONE}
              onClick={restart}
              className="btn3d--clay-white px-6 py-3 text-sm sm:text-base"
            >
              <RotateCcw
                className="h-4 w-4 text-[var(--color-ink-soft)]"
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
        </>
      )}

      {/* Nothing on this page is a dead end: a child who wanders can always
          get back to the numbers without hunting for the chrome. */}
      {stage !== "celebrate" && (
        <Link
          href={lessonHref}
          className="text-xs font-semibold text-[var(--color-ink-soft)] underline-offset-4 hover:underline sm:text-sm"
        >
          Back to numbers
        </Link>
      )}
    </div>
  );
}
