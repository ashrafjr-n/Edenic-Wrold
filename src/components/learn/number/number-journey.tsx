"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Pencil, RotateCcw } from "lucide-react";
import type { Character } from "@/types/character";
import type { NumberItem } from "@/types/number-item";
import { Button3D } from "@/components/ui/button-3d";
import { NumberVideo } from "./number-video";
import { TraceBoard } from "./trace-board";
import { StarReward } from "./star-reward";

/** Watch → draw → celebrate. One small loop per number, repeated identically
    nine times, so a child under ten learns the rhythm once. */
type Stage = "watch" | "trace" | "reward";

interface NumberJourneyProps {
  item: NumberItem;
  character: Character;
  /** Where "Next" goes: the next number, or the lesson hub after the last. */
  nextHref: string;
  isLast: boolean;
}

export function NumberJourney({
  item,
  character,
  nextHref,
  isLast,
}: NumberJourneyProps) {
  const { value, image, videoId, strokes } = item;
  const { accent, accentDark } = character;

  /* An item whose short has not been produced yet opens straight on the
     tracing step — better than a frame with nothing in it. */
  const firstStage: Stage = videoId ? "watch" : "trace";
  const [stage, setStage] = useState<Stage>(firstStage);
  const [stars, setStars] = useState(0);
  /* Bumping this remounts the board, which is how "Try Again" clears it —
     the strokes live inside the board, so there is nothing to reset here. */
  const [attempt, setAttempt] = useState(0);

  const retry = () => {
    setStars(0);
    setAttempt((count) => count + 1);
    setStage("trace");
  };

  const heading =
    stage === "watch"
      ? `This is number ${value}`
      : stage === "trace"
        ? "Now trace it!"
        : "Great job!";

  return (
    <div className="flex w-full flex-1 flex-col items-center gap-6 sm:gap-8">
      <h1 className="anim-fade-up text-center text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
        {heading}
      </h1>

      {/* The numeral and its video sit side by side from `sm` up and stack on
          a phone. Stacked at every width the pair ran well past the fold on a
          laptop, and a child should not have to scroll to find the video the
          page just told them about. */}
      <div className="flex w-full flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center sm:gap-8">
        {/* One fixed-size board for every step, so the numeral, the dotted
            guide and the drawing all land in exactly the same place and the
            page never jumps between steps. */}
        <div className="card anim-rise-in relative aspect-square w-full max-w-[15rem] shrink-0 p-5 sm:max-w-[17rem] sm:p-6">
          {stage === "watch" ? (
            <Image
              src={image}
              alt={`The number ${value}`}
              width={414}
              height={600}
              priority
              className="h-full w-full object-contain drop-shadow-[0_18px_24px_rgba(92,78,190,0.22)]"
            />
          ) : (
            <TraceBoard
              key={attempt}
              strokes={strokes}
              accent={accent}
              onFinish={(earned) => {
                setStars(earned);
                setStage("reward");
              }}
              locked={stage === "reward"}
            />
          )}
        </div>

        {stage === "watch" && videoId && (
          <NumberVideo
            videoId={videoId}
            posterImage={image}
            value={value}
            accent={accent}
            accentDark={accentDark}
          />
        )}
      </div>

      {/* The child moves on when they are ready. Detecting the end of the
          short would mean loading YouTube's IFrame API — another script from
          another origin on a children's page — to save one tap. */}
      {stage === "watch" && videoId && (
        <Button3D
          tone={{ face: accent, edge: accentDark, text: "#fff" }}
          onClick={() => setStage("trace")}
          className="anim-fade-up px-7 py-3 text-base sm:px-8 sm:text-lg"
        >
          <Pencil className="h-5 w-5" strokeWidth={2.75} />
          Now trace it!
        </Button3D>
      )}

      {stage === "reward" && <StarReward stars={stars} />}

      {/* Always both buttons, always in the same place — "Next" is simply
          dead until the stars arrive. A button that appears out of nowhere is
          harder for a small child to find than one that was always there. */}
      {stage !== "watch" && (
        <div className="anim-fade-up flex items-center gap-3 sm:gap-4">
          {/* The label colour has to come through `tone.text`, not a Tailwind
              `text-*` class: `.btn3d` sets `color` unlayered, so a utility on
              the same element loses and the label renders white on white. */}
          <Button3D
            variant="calm"
            tone={{ face: "var(--surface)", text: "var(--color-ink)" }}
            onClick={retry}
            className="btn3d--clay-white px-6 py-3 text-sm sm:text-base"
          >
            <RotateCcw
              className="h-4 w-4 text-[var(--color-ink-soft)] sm:h-5 sm:w-5"
              strokeWidth={2.75}
            />
            Try Again
          </Button3D>

          <Button3D
            tone={{ face: accent, edge: accentDark, text: "#fff" }}
            href={stage === "reward" ? nextHref : undefined}
            disabled={stage !== "reward"}
            className="px-7 py-3 text-base sm:px-8 sm:text-lg"
          >
            {isLast ? "Finish" : "Next"}
            <ArrowRight className="h-5 w-5" strokeWidth={2.75} />
          </Button3D>
        </div>
      )}
    </div>
  );
}
