"use client";

import { useState } from "react";
import { ArrowRight, Pencil, RotateCcw, SkipForward } from "lucide-react";
import type { Character } from "@/types/character";
import type { NumberItem } from "@/types/number-item";
import { Button3D } from "@/components/ui/button-3d";
import { buildNumberChoices } from "@/lib/number-choices";
import { NumberVideo } from "./number-video";
import { TraceBoard } from "./trace-board";
import { NumberQuiz } from "./number-quiz";
import { Celebration } from "./celebration";
import { StarReward } from "./star-reward";

/* Green is the "you got it, carry on" button and nothing else, so it never
   appears on a step the child has not passed. Blue stays the ordinary primary
   action — the character's own pink is not used for either, because the ground
   here IS the character's colour and a pink button vanishes into it. */
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

/** Watch → trace → pick from three → pick from five → stars. One loop per
    number, identical every time, so a child under ten learns the rhythm once
    and never has to work out what a new screen wants. */
type Stage = "watch" | "trace" | "pickThree" | "pickFive" | "done";

const EASY_CHOICES = 3;
const HARD_CHOICES = 5;

interface NumberJourneyProps {
  item: NumberItem;
  character: Character;
  /** Where "Next Number" goes: the next number, or back to the number list. */
  nextHref: string;
  isLast: boolean;
}

export function NumberJourney({
  item,
  character,
  nextHref,
  isLast,
}: NumberJourneyProps) {
  const { value, videoId, strokes } = item;
  const { accent } = character;

  /* An item whose short has not been produced yet opens straight on the
     tracing step — better than a frame with nothing in it. */
  const firstStage: Stage = videoId ? "watch" : "trace";

  const [stage, setStage] = useState<Stage>(firstStage);
  /* One flag across every stage: false means "still working", true means
     "passed, here is the confetti and the green button". Kept beside `stage`
     rather than doubling the stage list. */
  const [solved, setSolved] = useState(false);
  const [stars, setStars] = useState(0);
  /* Bumping this remounts the board and the quizzes, which is how a restart
     clears them — their state lives inside them, not up here. */
  const [attempt, setAttempt] = useState(0);

  const easyChoices = buildNumberChoices(value, EASY_CHOICES);
  const hardChoices = buildNumberChoices(value, HARD_CHOICES);

  const goTo = (next: Stage) => {
    setSolved(false);
    setStage(next);
  };

  /* Wipes the board without leaving the tracing step. The full `restart`
     below is the end-of-number "Again", which goes back to the video. */
  const retryTrace = () => {
    setStars(0);
    setSolved(false);
    setAttempt((count) => count + 1);
  };

  const restart = () => {
    setStars(0);
    setSolved(false);
    setAttempt((count) => count + 1);
    setStage(firstStage);
  };

  const heading =
    stage === "watch"
      ? `This is number ${value}`
      : stage === "trace"
        ? solved
          ? "You traced it!"
          : "Now trace it!"
        : stage === "done"
          ? "Great job!"
          : solved
            ? "That's the one!"
            : `Which one is ${value}?`;

  const quizStage = stage === "pickThree" || stage === "pickFive";

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-6 sm:gap-8">
      <h1 className="anim-fade-up text-center text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
        {heading}
      </h1>

      {stage === "watch" && videoId && (
        /* The video and its two buttons side by side from `sm` up: the frame
           is as tall as the viewport allows, so stacking would push the
           buttons off the bottom on a laptop. */
        <div className="anim-rise-in flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8">
          <NumberVideo videoId={videoId} value={value} />

          <div className="flex items-center gap-3 sm:flex-col sm:items-stretch sm:gap-4">
            <Button3D
              tone={BRAND_TONE}
              onClick={() => goTo("trace")}
              className="px-7 py-3 text-base sm:px-8 sm:text-lg"
            >
              <Pencil className="h-5 w-5" strokeWidth={2.75} />
              Try
            </Button3D>

            {/* Same destination as Try — one is "I have watched enough", the
                other is "let me draw". Both were asked for, and a child who
                wants out of the video should not have to read to find the
                way on. */}
            <Button3D
              variant="calm"
              tone={WHITE_TONE}
              onClick={() => goTo("trace")}
              className="btn3d--clay-white px-6 py-3 text-sm sm:text-base"
            >
              Skip
              <SkipForward
                className="h-4 w-4 fill-current text-[var(--color-ink-soft)] sm:h-5 sm:w-5"
                strokeWidth={1.5}
              />
            </Button3D>
          </div>
        </div>
      )}

      {stage === "trace" && (
        /* `relative` so the celebration bursts from the board's own centre. */
        <div className="card anim-rise-in relative aspect-square w-full max-w-[16rem] p-5 sm:max-w-[19rem] sm:p-6">
          <TraceBoard
            key={attempt}
            strokes={strokes}
            accent={accent}
            onFinish={(earned) => {
              setStars(earned);
              setSolved(true);
            }}
            locked={solved}
          />
          {solved && <Celebration />}
        </div>
      )}

      {quizStage && (
        <div className="anim-rise-in relative">
          <NumberQuiz
            key={`${stage}-${attempt}`}
            choices={stage === "pickThree" ? easyChoices : hardChoices}
            answer={value}
            solved={solved}
            onCorrect={() => {
              /* The hard round is the last thing, so passing it goes straight
                 to the stars — they replace the challenge rather than sitting
                 behind one more button. */
              if (stage === "pickFive") {
                setStage("done");
                setSolved(true);
                return;
              }
              setSolved(true);
            }}
          />
          {solved && <Celebration />}
        </div>
      )}

      {stage === "done" && (
        <div className="relative">
          <StarReward stars={stars} />
          <Celebration />
        </div>
      )}

      {/* The green button only ever exists once a step is passed — that is
          the whole signal. Nothing is disabled-but-visible any more; a dead
          green button next to an unfinished challenge read as broken.
          "Try Again" stays on the tracing step throughout, so a child who
          scribbles can always wipe the board. */}
      {(stage === "trace" || (quizStage && solved)) && (
        <div className="anim-fade-up flex items-center gap-3 sm:gap-4">
          {stage === "trace" && (
            <Button3D
              variant="calm"
              tone={WHITE_TONE}
              onClick={retryTrace}
              className="btn3d--clay-white px-6 py-3 text-sm sm:text-base"
            >
              <RotateCcw
                className="h-4 w-4 text-[var(--color-ink-soft)] sm:h-5 sm:w-5"
                strokeWidth={2.75}
              />
              Try Again
            </Button3D>
          )}

          {solved && (
            <Button3D
              tone={GO_TONE}
              onClick={() => goTo(stage === "trace" ? "pickThree" : "pickFive")}
              className="px-8 py-3 text-base sm:px-10 sm:text-lg"
            >
              Next
              <ArrowRight className="h-5 w-5" strokeWidth={2.75} />
            </Button3D>
          )}
        </div>
      )}

      {stage === "done" && (
        <div className="anim-fade-up flex items-center gap-3 sm:gap-4">
          <Button3D
            variant="calm"
            tone={WHITE_TONE}
            onClick={restart}
            className="btn3d--clay-white px-6 py-3 text-sm sm:text-base"
          >
            <RotateCcw
              className="h-4 w-4 text-[var(--color-ink-soft)] sm:h-5 sm:w-5"
              strokeWidth={2.75}
            />
            Again
          </Button3D>

          <Button3D
            tone={GO_TONE}
            href={nextHref}
            className="px-8 py-3 text-base sm:px-10 sm:text-lg"
          >
            {isLast ? "Finish" : "Next Number"}
            <ArrowRight className="h-5 w-5" strokeWidth={2.75} />
          </Button3D>
        </div>
      )}
    </div>
  );
}
