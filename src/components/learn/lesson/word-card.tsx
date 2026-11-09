import Image, { type StaticImageData } from "next/image";
import type { ShapeId } from "@/types/course";
import { CueButton } from "./cue-button";
import { ClayWord, type LetterTone } from "./clay-word";
import { FaceView } from "./face";
import { TiltPicture } from "./tilt-picture";

interface WordCardProps {
  word: string;
  /** The shape the word names, drawn above it — word and shape together. */
  shape?: ShapeId;
  /** Or a picture of what it names. */
  picture?: StaticImageData;
  /** The picture leans toward the finger (`TiltPicture`). */
  tilt?: boolean;
  /** What it names is in the world behind it (a color's splash on the
      forest's easel): just the speaker and the word, on a card under it. */
  onScene?: boolean;
  /** A colour's name written big in the world's sky, glowing in its own
      colour, with one big speaker in the middle of the stage (Colors). */
  inSky?: boolean;
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
export function WordCard({ word, shape, picture, tilt, onScene = false, inSky = false, tone, cue, label }: WordCardProps) {
  if (inSky) {
    return (
      <div className="flex flex-1 flex-col items-center">
        <div className="flex flex-1 items-center justify-center" style={tone && { filter: `drop-shadow(0 0 0.3em color-mix(in srgb, ${tone.face} 65%, transparent))` }}>
          <ClayWord word={word} size="xl" tone={tone} />
        </div>
        <CueButton cue={cue} label={label} size="2xl" invite />
        <div className="flex-1" />
      </div>
    );
  }
  if (onScene) {
    return (
      <div className="card card-clay-white anim-pop-in mt-auto flex items-center gap-4 px-5 py-3 sm:gap-6 sm:px-8 sm:py-4">
        <CueButton cue={cue} label={label} size="lg" invite />
        <ClayWord word={word} size="md" tone={tone} />
      </div>
    );
  }

  /* Desktop: side by side — the shape big on the left, the speaker above
     the word on the right. The two wrappers are `contents` below `lg`, so
     the phone's column is exactly what it was. */
  const layout =
    "flex w-full flex-col items-center gap-4 px-6 py-6 sm:gap-7 sm:py-10 lg:grid lg:grid-cols-[auto_auto] lg:grid-rows-2 lg:items-center lg:gap-x-16 lg:gap-y-6 lg:px-16 lg:py-12 [@media(max-height:700px)]:gap-2 [@media(max-height:700px)]:py-2.5";
  const content = (
    <>
      <span className="contents lg:col-start-2 lg:row-start-1 lg:flex lg:items-end lg:justify-center lg:self-end">
        <CueButton cue={cue} label={label} size="xl" invite />
      </span>
      {(shape || picture) && (
        <span
          className={`anim-pop-in relative flex h-[min(10rem,17svh)] w-[min(10rem,17svh)] items-center justify-center lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:h-[min(15rem,calc(var(--stage-h)-6rem))] lg:w-[min(15rem,calc(var(--stage-h)-6rem))]`}
          style={{ animationDelay: "0.05s" }}
        >
          {picture && tilt ? (
            <TiltPicture>
              <Image src={picture} alt="" fill preload sizes="(min-width: 1024px) 15rem, 10rem" draggable={false} className="pointer-events-none select-none object-contain" />
            </TiltPicture>
          ) : picture ? (
            <Image src={picture} alt="" fill preload sizes="(min-width: 1024px) 15rem, 10rem" className="object-contain" />
          ) : (
            shape && <FaceView face={{ kind: "shape", shape }} size="tile" />
          )}
        </span>
      )}
      <span className="contents lg:col-start-2 lg:row-start-2 lg:flex lg:justify-center lg:self-start">
        <ClayWord word={word} tone={tone} />
      </span>
    </>
  );

  /* On the friend's board: no card of its own — the word goes up on a
     paper strip (`.chalkboard--stage .clay-word`). */
  return <div className={`max-w-xl lg:w-auto lg:max-w-none ${layout}`}>{content}</div>;
}
