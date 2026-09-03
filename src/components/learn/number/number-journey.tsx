"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { ArrowRight, RotateCcw, Unlock } from "lucide-react";
import type { Character } from "@/types/character";
import type { NumberItem } from "@/types/number-item";
import { JOURNEY_STAGES, WORKING_STAGES } from "@/types/number-journey";
import type { JourneyStage } from "@/types/number-journey";
import { scriptFor } from "@/data/number-script";
import { countActivityFor } from "@/data/count-activities";
import { buildNumberChoices } from "@/lib/number-choices";
import { itemKey, useProgress } from "@/store/progress";
import { Button3D } from "@/components/ui/button-3d";
import { NumberVideo } from "./number-video";
import { Numeral } from "./numeral";
import { PinkiGuide } from "./pinki-guide";
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

  /* Pinki's pose and line for the stage on screen. Derived here rather than
     inline in the markup so each stage below is only its own content. */
  const guide: { pose: "speak" | "pen" | "celebrate"; line: string } =
    stage === "discover"
      ? { pose: "speak", line: script.discover }
      : stage === "reveal"
        ? { pose: "speak", line: script.reveal }
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
                ? countActivity.kind === "give"
                  ? {
                      pose: appleGiven ? "celebrate" : "speak",
                      line: pickMissed
                        ? script.findMiss
                        : appleGiven
                          ? script.countHow
                          : script.count,
                    }
                  : countActivity.kind === "complete"
                    ? { pose: "pen", line: pickMissed ? script.traceMiss : script.count }
                    : countActivity.kind === "color"
                      ? { pose: "pen", line: script.count }
                      : { pose: "speak", line: script.count }
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

      {/* Pinki opens every stage. She is the through-line that makes every
          screen read as one journey rather than a string of exercises. */}
      <PinkiGuide
        pose={guide.pose}
        line={guide.line}
        size={stage === "celebrate" ? "lg" : "sm"}
      />

      {stage === "discover" && (
        <div className="anim-rise-in flex w-full flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-10 lg:gap-14">
          {/* This stage is the reel and nothing else — saying the word and
              seeing the numeral are their own stage right after. It's the
              hero of this screen from `sm` up: much bigger, with the buttons
              moved beside it instead of underneath, so nothing competes with
              it and nothing caps its height. */}
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
      )}

      {stage === "reveal" && (
        <div className="anim-rise-in flex flex-col items-center gap-6 sm:gap-8">
          <Numeral value={value} image={image} sizeClass="h-32 w-32 sm:h-44 sm:w-44" />

          <div className="flex flex-col items-center gap-4 sm:gap-6">
            {/* The word, then the button that will speak it. Placed and
                timed now so adding audio later changes no layout. */}
            <p className="text-center text-sm font-semibold text-[var(--color-ink-soft)] sm:text-base">
              Can you say it?
            </p>

            <SayItButton word={script.word} />
          </div>

          <Button3D
            tone={BRAND_TONE}
            onClick={advance}
            className="px-8 py-3 text-base sm:px-10 sm:text-lg"
          >
            Next
            <ArrowRight className="h-5 w-5" strokeWidth={2.75} />
          </Button3D>
        </div>
      )}

      {stage === "demo" && (
        <>
          <div className="card anim-rise-in aspect-square w-full max-w-[15rem] p-5 sm:max-w-[18rem] sm:p-6">
            <StrokeDemo strokes={strokes} accent={accent} />
          </div>

          <Button3D
            tone={BRAND_TONE}
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
              {/* `--color-ink-soft-fixed`, not `--color-ink-soft`: this icon
                  rides inside a `.btn3d--clay-white` button, pinned pale
                  regardless of theme (globals.css) — `--color-ink-soft`
                  itself flips light in dark mode, for the same body-text
                  reason `--color-ink` does. */}
              <RotateCcw
                className="h-4 w-4 text-[var(--color-ink-soft-fixed)]"
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
          {countActivity.kind === "give" ? (
            /* Two beats, because the point of this activity is the LINK: hand
               over the item, then say what that many of it is called. Giving
               alone teaches nothing about the numeral; asking alone teaches
               nothing about quantity. */
            !appleGiven ? (
              <div className="anim-rise-in">
                <AppleGive
                  key={`give-${attempt}`}
                  target={value}
                  icon={countActivity.icon}
                  itemLabel={countActivity.itemLabel}
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
          {/* No sibling `<Celebration>` here, unlike the other stages — the
              balloons keep drifting even after a win, so a burst centred on
              this wrapper would land away from the popped balloon.
              `BalloonPop` bursts its own confetti from the balloon itself. */}
          <div className="anim-rise-in relative">
            <BalloonPop
              key={`pop-${attempt}`}
              choices={popChoices}
              answer={value}
              onCorrect={() => setSolved(true)}
              onMiss={pickMiss}
            />
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
              in words rather than left for the child to notice on the list —
              a green clay pill, not plain colored text, so it reads as its
              own small reward next to the stars instead of a caption. */}
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
              <Unlock className="h-5 w-5 text-white sm:h-6 sm:w-6" strokeWidth={2.75} />
              <span className="text-base font-bold text-white sm:text-lg">
                Number {nextValue} unlocked!
              </span>
            </div>
          )}

          <div className="anim-fade-up flex items-center gap-3 sm:gap-4">
            <Button3D
              variant="calm"
              tone={WHITE_TONE}
              onClick={restart}
              className="btn3d--clay-white px-6 py-3 text-sm sm:text-base"
            >
              {/* `--color-ink-soft-fixed`, not `--color-ink-soft`: this icon
                  rides inside a `.btn3d--clay-white` button, pinned pale
                  regardless of theme (globals.css) — `--color-ink-soft`
                  itself flips light in dark mode, for the same body-text
                  reason `--color-ink` does. */}
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
        </>
      )}
    </div>
  );
}
