"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Lock, Trophy } from "lucide-react";
import { letterNodes } from "@/data/letter-items";
import { letterNodeStates, type LetterNodeState } from "@/lib/letter-progress";
import { itemKey, useProgress } from "@/store/progress";
import { format, dirFor } from "@/lib/format-dict";
import type { LetterNode } from "@/types/letter-item";
import type { LessonTheme } from "@/types/lesson";
import type { Dictionary } from "@/lib/dictionaries/en";
import { LetterGlyph } from "./letter-glyph";

/* How far each node sits off the centre line, in rem, by its place in the
   unit — the path winds instead of running down a straight column, which is
   what makes it read as a road to walk rather than a list. */
const WIND = [0, 2.75, 4, 2.75, 0, -2.75, -4, -2.75];

interface LetterMapProps {
  characterId: string;
  lessonId: string;
  basePath: string;
  theme: LessonTheme;
  dict: Dictionary;
}

type Clay = CSSProperties & { "--clay-edge"?: string };

/**
 * The Letters map: A to Z as one winding path, in five units, each closed by
 * a challenge. The next node to play is the big one, circled in the lesson's
 * colour, with Pinki standing beside it; finished nodes carry a green tick and
 * stay open for replay; everything past the current node is locked.
 *
 * Reads the progress store, so like every reader on the site it renders the
 * nothing-finished map until `hydrated` (A current, the rest locked).
 */
export function LetterMap({ characterId, lessonId, basePath, theme, dict }: LetterMapProps) {
  const progress = useProgress((state) => state.items);
  const hydrated = useProgress((state) => state.hydrated);

  const states = letterNodeStates(
    (node) =>
      hydrated && (progress[itemKey(characterId, lessonId, node.id)]?.stars ?? 0) > 0,
  );

  const units = [...new Set(letterNodes.map((node) => node.unit))].map((unit) => ({
    unit,
    nodes: letterNodes
      .map((node, index) => ({ node, state: states[index] }))
      .filter(({ node }) => node.unit === unit),
  }));

  const accent: Clay = { backgroundColor: theme.accent, "--clay-edge": theme.accentDark };
  const dir = dirFor(dict.locale);

  return (
    <div className="flex flex-col gap-10 pb-6 sm:gap-12">
      {units.map(({ unit, nodes }, unitIndex) => {
        const letters = nodes.filter(({ node }) => node.kind === "letter");
        const from = letters[0].node.id.toUpperCase();
        const to = letters[letters.length - 1].node.id.toUpperCase();

        return (
          <section
            key={unit}
            className="anim-fade-up flex flex-col items-center gap-6"
            style={{ animationDelay: `${0.15 + unitIndex * 0.08}s` }}
            aria-label={format(dict.letters.unitLabel, { n: unit })}
          >
            <div
              className="clay flex w-full max-w-sm items-center justify-between gap-3 rounded-full px-5 py-2.5 text-white sm:py-3"
              style={accent}
            >
              <span dir={dir} className="text-base font-bold sm:text-lg">
                {format(dict.letters.unitLabel, { n: unit })}
              </span>
              <span dir={dir} className="text-sm font-semibold opacity-90 sm:text-base">
                {format(dict.letters.unitRange, { from, to })}
              </span>
            </div>

            <ol className="flex flex-col items-center gap-5 sm:gap-6">
              {nodes.map(({ node, state }, index) => (
                <li
                  key={node.id}
                  className="relative"
                  style={{ translate: `${WIND[index % WIND.length]}rem 0` }}
                >
                  <MapNode
                    node={node}
                    state={state}
                    href={`${basePath}/${node.id}`}
                    accent={accent}
                    pinkiOnLeft={WIND[index % WIND.length] >= 0}
                    dict={dict}
                  />
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}

interface MapNodeProps {
  node: LetterNode;
  state: LetterNodeState;
  href: string;
  accent: Clay;
  pinkiOnLeft: boolean;
  dict: Dictionary;
}

function MapNode({ node, state, href, accent, pinkiOnLeft, dict }: MapNodeProps) {
  const isLetter = node.kind === "letter";
  const letter = node.id.toUpperCase();
  const locked = state === "locked";
  const current = state === "current";

  const label = isLetter
    ? format(
        locked
          ? dict.letters.letterLockedAria
          : state === "done"
            ? dict.letters.letterDoneAria
            : dict.letters.letterAria,
        { letter },
      )
    : format(locked ? dict.letters.challengeLockedAria : dict.letters.challengeAria, {
        n: node.unit,
      });

  /* The disc itself: white clay holding the clay letter, or — for a unit's
     challenge — the lesson's own colour holding a trophy. */
  const disc = isLetter ? (
    <span
      className={`card card-clay-white card-pill flex items-center justify-center ${
        current ? "h-20 w-20 sm:h-24 sm:w-24" : "h-[4.5rem] w-[4.5rem] sm:h-20 sm:w-20"
      }`}
    >
      <LetterGlyph
        letter={node.id}
        capital
        sizeClass={current ? "h-11 sm:h-14" : "h-9 sm:h-11"}
        sizes="56px"
        className={locked ? "opacity-35 grayscale" : ""}
      />
    </span>
  ) : (
    <span
      className={`clay flex items-center justify-center rounded-full text-white ${
        current ? "h-20 w-20 sm:h-24 sm:w-24" : "h-[4.5rem] w-[4.5rem] sm:h-20 sm:w-20"
      } ${locked ? "opacity-50" : ""}`}
      style={accent}
    >
      <Trophy className="h-9 w-9 sm:h-10 sm:w-10" strokeWidth={2.25} />
    </span>
  );

  const badge =
    state === "done" ? (
      <span
        className="clay absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: "var(--color-go)", "--clay-edge": "var(--color-go-dark)" } as Clay}
        aria-hidden
      >
        <Check className="h-4.5 w-4.5" strokeWidth={3} />
      </span>
    ) : locked ? (
      <span className="lock-chip absolute -right-1 -top-1 h-8 w-8" aria-hidden>
        <Lock className="h-4 w-4" strokeWidth={2.75} />
      </span>
    ) : null;

  if (locked) {
    return (
      <span role="img" aria-label={label} className="relative block">
        {disc}
        {badge}
      </span>
    );
  }

  return (
    <>
      {/* The next thing to play: ringed in the lesson's colour, breathing,
          with Pinki beside it pointing at it. (A "Start" flag over it was
          tried and cut — it sat on the unit banner above the first node.) */}
      {current && (
        <Image
          src="/assets/learn-with-pinki/pinki/pinki-with-a-stick.png"
          alt=""
          width={112}
          height={111}
          sizes="112px"
          className={`anim-breathe pointer-events-none absolute top-1/2 h-24 w-auto max-w-none -translate-y-1/2 object-contain sm:h-28 ${
            pinkiOnLeft ? "right-full mr-3 -scale-x-100" : "left-full ml-3"
          }`}
        />
      )}

      <Link
        href={href}
        aria-label={label}
        className={`relative block rounded-full transition-transform duration-200 hover:scale-105 active:scale-95 ${
          current ? "anim-pulse-invite" : ""
        }`}
      >
        {current ? (
          <span className="clay block rounded-full p-1.5 sm:p-2" style={accent}>
            {disc}
          </span>
        ) : (
          disc
        )}
        {badge}
      </Link>
    </>
  );
}
