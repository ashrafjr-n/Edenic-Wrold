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
    right in every language. */
export function ListNote({ list, got, hearLabel, className = "" }: ListNoteProps) {
  return (
    <ol dir="ltr" className={`card card-clay-white -rotate-1 flex flex-col gap-1.5 p-3 sm:gap-2 sm:p-4 [@media(max-height:700px)]:gap-1 ${className}`}>
      {list.map((word) => {
        const isGot = got.includes(word);
        return (
          <li key={word} className="flex items-center gap-2 rounded-2xl px-1.5 py-1 sm:gap-3 sm:px-2 [@media(max-height:700px)]:py-0">
            <CueButton cue={lessonCue.word(word)} label={format(hearLabel, { word })} size="sm" />
            <span className={`min-w-0 flex-1 truncate text-xl font-bold text-[var(--color-ink)] sm:text-2xl ${isGot ? "opacity-45 line-through decoration-[3px]" : ""}`}>
              {word}
            </span>
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full sm:h-8 sm:w-8 ${isGot ? "clay anim-pop-in text-white" : "letter-slot"}`}
              style={isGot ? GO : undefined}
            >
              {isGot && <Check className="h-4 w-4" strokeWidth={3.5} />}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
