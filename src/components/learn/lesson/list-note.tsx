import type { CSSProperties } from "react";
import { Check } from "lucide-react";
import { format } from "@/lib/format-dict";
import { lessonCue } from "@/lib/cue";
import type { Face } from "@/types/course";
import { CueButton } from "./cue-button";

const GO = { backgroundColor: "var(--color-go)", "--clay-edge": "var(--color-go-dark)" } as CSSProperties;

/** A thing's English word. */
export const wordOf = (face: Face) => (face.kind === "picture" ? face.word : face.kind === "shape" ? face.shape : face.text);

interface ListNoteProps {
  /** The English words on it. */
  list: string[];
  /** The ones already got — ticked off. */
  got: string[];
  /** "Hear {word}" — each word's speaker. */
  hearLabel: string;
  className?: string;
}

/** Nova's note: the English words, each with its speaker — read it, or
    hear it — ticked off as each one is got. English, so it reads left to
    right in every language. On a phone the words stand side by side, each
    under its speaker, so a whole word always fits; from `sm` a list. */
export function ListNote({ list, got, hearLabel, className = "" }: ListNoteProps) {
  return (
    <ol
      dir="ltr"
      className={`card card-clay-white -rotate-1 grid grid-cols-3 gap-1 p-2 sm:flex sm:flex-col sm:gap-2 sm:p-4 [@media(max-height:700px)]:gap-1 ${className}`}
    >
      {list.map((word) => {
        const isGot = got.includes(word);
        return (
          <li
            key={word}
            className="relative flex flex-col items-center gap-1 rounded-2xl px-1 py-1 sm:flex-row sm:gap-3 sm:px-2 [@media(max-height:700px)]:py-0"
          >
            <CueButton cue={lessonCue.word(word)} label={format(hearLabel, { word })} size="sm" />
            <span
              className={`whitespace-nowrap text-2xl font-bold text-[var(--color-ink)] sm:min-w-0 sm:flex-1 sm:truncate ${
                isGot ? "opacity-45 line-through decoration-[3px]" : ""
              }`}
            >
              {word}
            </span>
            {/* The tick: on a phone it pins to the word's corner once got
                (no empty socket); from `sm` it closes the line. */}
            <span className={`absolute -top-1 right-0 sm:static sm:contents ${isGot ? "" : "hidden"}`}>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full sm:h-8 sm:w-8 ${isGot ? "clay anim-pop-in text-white" : "letter-slot"}`}
                style={isGot ? GO : undefined}
              >
                {isGot && <Check className="h-4 w-4" strokeWidth={3.5} />}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
