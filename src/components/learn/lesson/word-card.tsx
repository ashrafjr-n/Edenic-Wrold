import Image, { type StaticImageData } from "next/image";
import type { ShapeId } from "@/types/course";
import { CueButton } from "./cue-button";
import { ClayWord, type LetterTone } from "./clay-word";
import { FaceView } from "./face";

interface WordCardProps {
  word: string;
  /** The shape the word names, drawn above it — word and shape together. */
  shape?: ShapeId;
  /** Or a picture of what it names — a color's paint pot. */
  picture?: StaticImageData;
  /** One tone for all its letters — a color word in its own color. */
  tone?: LetterTone;
  /** The word's own clip — `lessonCue.word`. */
  cue: string;
  /** Names the speaker for a screen reader ("Hear circle"). */
  label: string;
}

/**
 * Meet the word: one big gold speaker (the word's clip, once audio lands),
 * the shape itself, and the English word under it in clay letters — so the
 * word is learned as the name OF something, not as letters on their own.
 * Nothing to get right here; the lesson's Next is the way on.
 */
export function WordCard({ word, shape, picture, tone, cue, label }: WordCardProps) {
  return (
    /* Desktop: side by side — the shape big on the left, the speaker above
       the word on the right. The two wrappers are `contents` below `lg`, so
       the phone's column is exactly what it was. */
    <div className="card card-clay-white card-bare-lg flex w-full max-w-xl flex-col items-center gap-4 px-6 py-6 sm:gap-7 sm:py-10 lg:grid lg:w-auto lg:max-w-none lg:grid-cols-[auto_auto] lg:grid-rows-2 lg:items-center lg:gap-x-16 lg:gap-y-6 lg:px-16 lg:py-12 [@media(max-height:700px)]:gap-2 [@media(max-height:700px)]:py-2.5">
      <span className="contents lg:col-start-2 lg:row-start-1 lg:flex lg:items-end lg:justify-center lg:self-end">
        <CueButton cue={cue} label={label} size="xl" invite />
      </span>
      {(shape || picture) && (
        <span
          className="anim-pop-in relative flex h-[min(10rem,17svh)] w-[min(10rem,17svh)] items-center justify-center lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:h-[min(15rem,calc(var(--stage-h)-6rem))] lg:w-[min(15rem,calc(var(--stage-h)-6rem))]"
          style={{ animationDelay: "0.05s" }}
        >
          {picture ? (
            <Image src={picture} alt="" fill preload sizes="(min-width: 1024px) 15rem, 10rem" className="object-contain" />
          ) : (
            shape && <FaceView face={{ kind: "shape", shape }} size="tile" />
          )}
        </span>
      )}
      <span className="contents lg:col-start-2 lg:row-start-2 lg:flex lg:justify-center lg:self-start">
        <ClayWord word={word} tone={tone} />
      </span>
    </div>
  );
}
