"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { letterItems, findLetterItem } from "@/data/letter-items";
import { sessionFor, type LetterStep } from "@/lib/letter-session";
import { nextLetterNode } from "@/lib/letter-progress";
import { cueFor } from "@/lib/cue";
import { format, dirFor } from "@/lib/format-dict";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { itemKey, useProgress } from "@/store/progress";
import type { LetterId, LetterNode } from "@/types/letter-item";
import type { LessonTheme } from "@/types/lesson";
import type { Locale } from "@/types/locale";
import type { PinkiPose } from "@/types/number-journey";
import type { Dictionary } from "@/lib/dictionaries/en";
import { BackButton } from "@/components/ui/back-button";
import { NextButton } from "@/components/ui/morph-button";
import { LetterCoach } from "./letter-coach";
import { LetterWatch } from "./letter-watch";
import { LetterMeet } from "./letter-meet";
import { LetterTrace } from "./letter-trace";
import { SoundPick } from "./sound-pick";
import { CaseMatch } from "./case-match";
import { LetterBubbles } from "./letter-bubbles";
import { WordBuild } from "./word-build";
import { LetterFind } from "./letter-find";
import { LetterCelebrate } from "./letter-celebrate";

/* Green is "you passed this, carry on"; blue is the ordinary way onward. */
const GO_TONE = { face: "var(--color-go)", edge: "var(--color-go-dark)", text: "#fff" };
const BRAND_TONE = { face: "var(--brand)", edge: "var(--brand-dark)", text: "#fff" };

/** Kept in step with `.stage-swap--out`'s 0.2s in `globals.css` — the same
    hand-off the number journey uses between two exercises. */
const STEP_LEAVE_MS = 200;

/** Stars are never shown on this lesson; the store still keeps them, and
    they are how a later session knows which letters went less smoothly. */
function starsFor(mistakes: number): number {
  if (mistakes <= 1) return 3;
  if (mistakes <= 4) return 2;
  return 1;
}

interface LetterSessionProps {
  node: LetterNode;
  characterId: string;
  lessonId: string;
  theme: LessonTheme;
  dict: Dictionary;
  locale: Locale;
}

/**
 * One Letters session: a list of short exercises from `sessionFor`, played
 * in order, then the celebration. Pinki's line, the progress bar and the
 * way onward live here; each exercise only reports `onSolved` / `onMiss`.
 *
 * The session is dealt from the child's progress (which letters are known,
 * which went badly), so it waits for the store to hydrate, then keeps that
 * deal for the whole round — finishing the letter changes the progress, and
 * the list must not reshuffle under the celebration.
 */
export function LetterSession({ node, characterId, lessonId, theme, dict, locale }: LetterSessionProps) {
  const dir = dirFor(locale);
  const hydrated = useProgress((state) => state.hydrated);
  const complete = useProgress((state) => state.complete);

  const [round, setRound] = useState(0);
  const [index, setIndex] = useState(0);
  const [solved, setSolved] = useState(false);
  const [missed, setMissed] = useState(false);
  const [board, setBoard] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const leaveTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(leaveTimer.current), []);

  const steps = useMemo(() => {
    if (!hydrated) return null;
    /* A snapshot, read once per round on purpose — see the note above. */
    const items = useProgress.getState().items;
    const starsOf = (id: LetterId) => items[itemKey(characterId, lessonId, id)]?.stars ?? 0;
    const known = letterItems.map((item) => item.id).filter((id) => starsOf(id) > 0);
    return sessionFor(node, { known, shaky: known.filter((id) => starsOf(id) < 3), round });
  }, [hydrated, node, characterId, lessonId, round]);

  const step: LetterStep | undefined = steps?.[index];
  const finished = steps !== null && index >= steps.length;

  useScrollLock(step?.kind === "trace" && board);

  /* Recorded when the celebration is reached, not on "Next": closing the tab
     on the celebration must not lose the letter. */
  useEffect(() => {
    if (finished) complete(itemKey(characterId, lessonId, node.id), starsFor(mistakes));
  }, [finished, complete, characterId, lessonId, node.id, mistakes]);

  const go = (change: () => void) => {
    setLeaving(true);
    window.clearTimeout(leaveTimer.current);
    leaveTimer.current = window.setTimeout(() => {
      change();
      setSolved(false);
      setMissed(false);
      setBoard(false);
      setLeaving(false);
    }, STEP_LEAVE_MS);
  };

  const advance = () => go(() => setIndex((value) => value + 1));
  const restart = () =>
    go(() => {
      setIndex(0);
      setMistakes(0);
      setRound((value) => value + 1);
    });

  const onSolved = () => {
    setSolved(true);
    setMissed(false);
  };
  const onMiss = () => {
    setMissed(true);
    setMistakes((count) => count + 1);
  };

  const basePath = `/learn/${characterId}/${lessonId}`;
  const next = nextLetterNode(node.id);
  const progressShare = steps
    ? Math.min(1, (index + (solved ? 1 : 0)) / steps.length)
    : 0;

  const lines = dict.lettersPinki;
  const coach = step ? coachFor(step, { solved, missed, board }, lines, locale) : null;

  let body: ReactNode = null;
  let action: ReactNode = null;
  const nextButton = (tone: typeof GO_TONE) => (
    <NextButton label={dict.journey.next} tone={tone} onPress={advance} dir={dir} />
  );

  if (step?.kind === "watch") {
    const item = findLetterItem(step.letter);
    body = item?.video ? (
      <LetterWatch
        src={item.video}
        label={format(dict.letters.videoAbout, { letter: step.letter.toUpperCase() })}
      />
    ) : null;
    action = nextButton(BRAND_TONE);
  } else if (step?.kind === "meet") {
    const item = findLetterItem(step.letter);
    body = item ? <LetterMeet item={item} dict={dict} /> : null;
    action = nextButton(BRAND_TONE);
  } else if (step?.kind === "trace") {
    const item = findLetterItem(step.letter);
    body = item ? (
      <LetterTrace
        item={item}
        capital={step.capital}
        accent={theme.accent}
        dict={dict}
        dir={dir}
        onBoard={() => setBoard(true)}
        onSolved={onSolved}
        onMiss={onMiss}
      />
    ) : null;
    action = solved ? nextButton(GO_TONE) : null;
  } else if (step) {
    const shared = { dict, onSolved, onMiss };
    body =
      step.kind === "sound-pick" ? (
        <SoundPick letter={step.letter} choices={step.choices} {...shared} />
      ) : step.kind === "match" ? (
        <CaseMatch letters={step.letters} smallOrder={step.smallOrder} accent={theme.accent} {...shared} />
      ) : step.kind === "bubbles" ? (
        <LetterBubbles letter={step.letter} bubbles={step.bubbles} {...shared} />
      ) : step.kind === "build" ? (
        <WordBuild word={step.word} tiles={step.tiles} {...shared} />
      ) : (
        <LetterFind letter={step.letter} choices={step.choices} {...shared} />
      );
    action = solved ? nextButton(GO_TONE) : null;
  }

  return (
    <div className="flex w-full flex-1 flex-col">
      {/* The chrome row: out to the map, and how far through the session the
          child is — a filling bar, not numbered steps, as a child reads it. */}
      <div
        className="anim-drop-in sticky top-[4.25rem] z-20 flex items-center gap-4 sm:top-[4.75rem] sm:gap-6 lg:top-[5.5rem]"
        style={{ animationDelay: "0.1s" }}
      >
        <BackButton href={basePath} label={dict.letters.backToMap} />
        {!finished && (
          <div
            className="puzzle-progress-track flex-1"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progressShare * 100)}
            aria-label={
              node.kind === "letter"
                ? format(dict.letters.letterOf, { letter: node.id.toUpperCase() })
                : format(dict.letters.unitChallenge, { n: node.unit })
            }
          >
            <span
              className="puzzle-progress-fill transition-[width] duration-500 ease-out"
              style={
                {
                  width: `${progressShare * 100}%`,
                  "--bar-face": theme.accent,
                  "--bar-edge": theme.accentDark,
                } as CSSProperties
              }
            />
          </div>
        )}
      </div>

      <div
        key={`${round}-${index}-${finished}`}
        className={`stage-swap relative mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-6 pt-6 sm:gap-8 sm:pt-10 ${
          leaving ? "stage-swap--out" : ""
        }`}
      >
        {finished && steps ? (
          <LetterCelebrate
            node={node}
            next={next}
            basePath={basePath}
            dict={dict}
            dir={dir}
            locale={locale}
            onAgain={restart}
          />
        ) : coach ? (
          <>
            <LetterCoach
              pose={coach.pose}
              line={coach.line}
              cue={coach.cue}
              listenLabel={dict.letters.listenAgain}
              dir={dir}
            />
            {body}
            <div className="flex min-h-14 items-center justify-center">{action}</div>
          </>
        ) : null}
      </div>
    </div>
  );
}

interface CoachState {
  solved: boolean;
  missed: boolean;
  board: boolean;
}

/** Pinki's pose and line for the exercise on screen, and the recording of
    that line. Her pose is what she is doing: `pen` writing, `think`
    listening, `stick` pointing at a board, `celebrate` a win. */
function coachFor(
  step: LetterStep,
  { solved, missed, board }: CoachState,
  lines: Dictionary["lettersPinki"],
  locale: Locale,
): { pose: PinkiPose; line: string; cue: string } {
  const subject = "letter" in step ? step.letter : step.kind === "build" ? step.word.word : "pairs";
  const letter = "letter" in step ? step.letter.toUpperCase() : "";
  const say = (key: keyof Dictionary["lettersPinki"], pose: PinkiPose, vars: Record<string, string> = {}) => ({
    pose,
    line: format(lines[key], { letter, ...vars }),
    cue: cueFor.pinki(locale, key, subject),
  });

  if (solved) return say(step.kind === "trace" ? "traceDone" : "good", "celebrate");

  switch (step.kind) {
    case "watch":
      return say("watch", "speak");
    case "meet": {
      const word = findLetterItem(step.letter)?.words[0].word ?? "";
      return say("meet", "speak", { word });
    }
    case "trace":
      if (!board) return say(step.capital ? "demoCapital" : "demoSmall", "pen");
      return say(missed ? "traceMiss" : "trace", "pen");
    case "sound-pick":
      return say(missed ? "soundMiss" : "soundPick", "think");
    case "match":
      return say("match", "stick");
    case "bubbles":
      return say("bubbles", "stick");
    case "build":
      return say("build", "speak", { word: step.word.word });
    case "find":
      return say(missed ? "soundMiss" : "find", "think");
  }
}
