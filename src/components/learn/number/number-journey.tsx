"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, PartyPopper, RotateCcw, Unlock } from "lucide-react";
import type { Character } from "@/types/character";
import type { NumberItem } from "@/types/number-item";
import { JOURNEY_STAGES, WORKING_STAGES } from "@/types/number-journey";
import type { JourneyStage } from "@/types/number-journey";
import type { Locale } from "@/types/locale";
import { scriptFor } from "@/data/number-script";
import { countActivityFor } from "@/data/count-activities";
import { gameActivityFor } from "@/data/game-activities";
import { guideFor, pointsAtTarget } from "@/data/number-guide";
import { buildNumberChoices } from "@/lib/number-choices";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { itemKey, useProgress } from "@/store/progress";
import { Button3D } from "@/components/ui/button-3d";
import type { ButtonTone } from "@/components/ui/button-3d";
import { format, dirFor } from "@/lib/format-dict";
import type { Dictionary } from "@/lib/dictionaries/en";
import { NumberVideo } from "./number-video";
import { Numeral } from "./numeral";
import { PinkiGuide } from "./pinki-guide";
import { PinkiLean } from "./pinki-lean";
import { StageDots } from "./stage-dots";
import { SayItButton } from "./say-it-button";
import { StrokeDemo } from "./stroke-demo";
import { TraceBoard } from "./trace-board";
import { NumberQuiz } from "./number-quiz";
import { AppleGive } from "./apple-give";
import { NumberComplete } from "./number-complete";
import { NumberPath } from "./number-path";
import { NumberColor } from "./number-color";
import { BalloonPop, TargetBalloon } from "./balloon-pop";
import { Celebration } from "@/components/ui/celebration";

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

const COUNT_CHOICES = 3;
/* Four balloons rising through the sky at once. Fewer reads as no game at
   all; more turns "find the numeral" into a crowd on a phone-width board. */
const POP_CHOICES = 4;

/** How long the stage on screen takes to fade out before the next one is
    mounted. Kept in step with `.stage-out`'s own 0.2s in `globals.css` by
    comment — the same hand-synced arrangement the cloud page transition uses.
    Short on purpose: this is a hand-off between two exercises, not a scene
    change, and anything longer reads as the app thinking. */
const STAGE_LEAVE_MS = 200;

/** How long the "how many apples" answer is left on screen, celebrating,
    before the journey carries the child on by itself. Long enough for the
    confetti and the numeral's own jump to read as "yes, that one", short
    enough that nobody is waiting — this stage has no Next button at all, on
    direct request, because a right answer is already the child saying they
    are ready. */
const AUTO_ADVANCE_MS = 1100;

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
  dict: Dictionary;
  locale: Locale;
}

export function NumberJourney({
  item,
  character,
  lessonId,
  nextHref,
  nextValue,
  dict,
  locale,
}: NumberJourneyProps) {
  const { value, image, videoId, strokes } = item;
  const { accent } = character;
  const script = scriptFor(value, locale, dict);
  /* Every line below mixes this locale's words with an English name/number
     via `format()` — the isolate marks inside `format()` stop the value
     itself from being scrambled, but the element carrying the mixed text
     still needs an explicit `dir` or the browser (which never sets `dir` on
     `<html>` — see CLAUDE.md) places the Arabic run on the wrong SIDE of the
     value it's next to, e.g. "تعلم مع Pinki" rendering as "Pinki تعلم مع". */
  const dir = dirFor(locale);
  const countActivity = countActivityFor(value);
  /* Which exercise this number's LAST stage runs. Most pop balloons; see
     `data/game-activities.ts`. */
  const gameActivity = gameActivityFor(value);
  /* The tray's own word for its item, in whatever language is on. One lookup
     rather than a per-locale branch — see `types/count-activity.ts`. */
  const itemLabel =
    countActivity.kind === "give" ? countActivity.itemLabel[locale] : "";

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
  /* The balloon game is the one stage that can be LOST: the right balloon rose
     off the top without being popped. Not a failure state in the site's usual
     sense — nothing is marked wrong and nothing is lost — it just ends the
     round, so Pinki comes back on to ask for another go. */
  const [gameFailed, setGameFailed] = useState(false);
  /* Bumping this remounts whichever interactive stage is on screen, which is
     how a retry clears it — that state lives inside the stage, not up here. */
  const [attempt, setAttempt] = useState(0);
  /* True while the stage on screen is fading out and the next one has not been
     mounted yet — see `go` below. */
  const [leaving, setLeaving] = useState(false);
  const leaveTimer = useRef<number | undefined>(undefined);
  /* The one stage that moves on without being asked — see `AUTO_ADVANCE_MS`. */
  const autoTimer = useRef<number | undefined>(undefined);

  /* The tracing stage owns the screen: the child draws on it with a finger,
     and the page sliding under that finger is the one thing that can ruin a
     stroke. `touch-action: none` on the board already stops a drag ON it from
     scrolling — this stops the page moving at all while the board is up. */
  useScrollLock(stage === "trace");

  /* The one timer this component owns. Cleared on unmount so a child who
     leaves mid-transition never lands a `setState` on a gone component. */
  useEffect(
    () => () => {
      window.clearTimeout(leaveTimer.current);
      window.clearTimeout(autoTimer.current);
    },
    [],
  );

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
  const countChoices = buildNumberChoices(value, COUNT_CHOICES);
  const popChoices = buildNumberChoices(value, POP_CHOICES);

  /* **Every move between stages goes through here**, so the swap always
     looks the same: the stage on screen fades out, and only once it has does
     the next one mount and fade in. It is an event handler with a timer in
     it, not an effect watching state — the transition is caused by the press,
     which is exactly where `nextjs-principles.md` says this belongs. */
  const go = (change: () => void) => {
    setLeaving(true);
    window.clearTimeout(leaveTimer.current);
    leaveTimer.current = window.setTimeout(() => {
      change();
      setLeaving(false);
    }, STAGE_LEAVE_MS);
  };

  const advance = () =>
    go(() => {
      setSolved(false);
      setTraceMissed(false);
      setPickMissed(false);
      setGameFailed(false);
      setStage(JOURNEY_STAGES[stageIndex + 1]);
    });

  /* Celebrate the right answer where it was given, then carry on — the whole
     point of a stage with no Next button. Scheduled from the handler that
     knows the answer was right, not from an effect watching `solved`. */
  const solveAndGo = () => {
    setSolved(true);
    window.clearTimeout(autoTimer.current);
    autoTimer.current = window.setTimeout(advance, AUTO_ADVANCE_MS);
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

  const retryGame = () => {
    setGameFailed(false);
    setPickMissed(false);
    /* Bumping `attempt` remounts `BalloonPop`, which is what re-launches the
       flight — the balloons' positions live in CSS animations inside it, not
       in any state up here. */
    setAttempt((count) => count + 1);
  };

  const restart = () =>
    go(() => {
      setStage("discover");
    setSolved(false);
    setMistakes(0);
    setTraceAttempt(0);
    setTraceMissed(false);
    setPickMissed(false);
      setAppleGiven(false);
      setGameFailed(false);
      setAttempt((count) => count + 1);
    });

  /* Pinki's whole appearance for the stage on screen — how big she is, what
     she is doing and what she says. Resolved by `data/number-guide.ts` rather
     than by a branch here: this was a forty-line nested ternary in the middle
     of the component, and her size in particular has to have exactly one
     answer, or the stage that asks for her and the component that draws her
     can drift apart. */
  const guide = guideFor(stage, script, {
    countKind: countActivity.kind,
    appleGiven,
    traceMissed,
    pickMissed,
    gameFailed,
    gameKind: gameActivity,
  });

  /* Only meaningful where she is actually pointing — see `pointsAtTarget`. */
  const marksTarget = pointsAtTarget(guide);

  /* Each stage is TWO pieces, not one block of markup: the thing the child
     works on, and the buttons that move them along. They are split because
     `lead` puts the buttons under Pinki's speech bubble, in the column her
     crop leaves free on the left, while the activity stays above her — so the
     two halves land in different places on the screen and cannot be one
     fragment. Built above the return, per stage, rather than branched inside
     the markup. */
  /* The label goes in its own `dir`-bearing span, the same way the celebrate
     stage's "Number N" button does. Two of these labels end in an exclamation
     mark ("My turn!", "Finish!"), which is a bidi-neutral: with the arrow icon
     after it and no base direction of its own it takes the page's `ltr` and
     renders on the wrong end of the Arabic label. */
  const nextButton = (label: string, tone: ButtonTone) => (
    <Button3D
      tone={tone}
      onClick={advance}
      className="px-8 py-3 text-base sm:px-10 sm:text-lg"
    >
      <span dir={dir}>{label}</span>
      <ArrowRight className="h-5 w-5" strokeWidth={2.75} />
    </Button3D>
  );

  let body: ReactNode = null;
  let actions: ReactNode = null;

  if (stage === "discover") {
    /* **The button sits BESIDE the reel from `sm` up, never underneath it**,
       and it stays inside `body` for exactly that reason — the split into
       body/actions exists so `lead` can move buttons under Pinki's bubble,
       and this stage is `aside`, so it keeps the row it already had. Stacking
       them capped the video's height to leave room below, which fought the
       whole point of this stage; moving the button to the side is what
       removed that ceiling. */
    body = (
      <div className="flex w-full flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-10 lg:gap-14">
        {videoId && (
          <NumberVideo videoId={videoId} value={value} image={image} dict={dict.journey} />
        )}

        <div className="flex items-center gap-3 sm:flex-col sm:items-stretch sm:gap-4">
          <Button3D
            tone={BRAND_TONE}
            onClick={advance}
            className="px-7 py-3 text-base sm:px-9 sm:py-4 sm:text-lg"
          >
            {dict.journey.next}
            <ArrowRight className="h-5 w-5" strokeWidth={2.75} />
          </Button3D>
        </div>
      </div>
    );
  } else if (stage === "reveal") {
    /* The numeral alone, and bigger than it was: it is the whole subject of
       this stage, and it used to sit tight under the stage dots sharing its
       screen with the say-it button. The top margin is what pushes it clear
       of them. */
    body = (
      <div className="mt-3 sm:mt-6">
        <Numeral
          value={value}
          image={image}
          sizeClass="h-36 w-36 sm:h-52 sm:w-52"
          sizes="(min-width: 640px) 208px, 144px"
        />
      </div>
    );
    /* Both of the things the child can press, stacked in ONE column beside
       Pinki rather than split across the screen — the gold say-it button
       under her line, and the way onward under that. Placed and timed now so
       adding audio later changes no layout. */
    actions = (
      <div className="flex flex-col items-start gap-3 sm:gap-4">
        <p className="text-sm font-semibold text-[var(--color-ink-soft)] sm:text-base">
          {dict.journey.canYouSayIt}
        </p>

        <SayItButton word={script.word} dict={dict.journey} />

        {nextButton(dict.journey.next, BRAND_TONE)}
      </div>
    );
  } else if (stage === "demo") {
    body = (
      <div className="card card-clay-white aspect-square w-full max-w-[13rem] p-4 sm:max-w-[16rem] sm:p-6">
        <StrokeDemo strokes={strokes} accent={accent} />
      </div>
    );
    /* The band between her line and this button is `PinkiGuide`'s now — every
       `lead` stage gets the same one, so this stage no longer sets its own. */
    actions = nextButton(dict.journey.myTurn, BRAND_TONE);
  } else if (stage === "trace") {
    body = (
      /* Much larger than the demo card it follows, and the centre of its own
         screen: Pinki is off this stage entirely, so the whole column is the
         board's. This is the one thing the child does with their hand, and it
         was the smallest object on the page. */
      <div className="card card-clay-white relative aspect-square w-full max-w-[17rem] p-4 sm:max-w-[24rem] sm:p-6">
        <TraceBoard
          key={attempt}
          strokes={strokes}
          accent={accent}
          minCoverage={
            TRACE_COVERAGE[Math.min(traceAttempt, TRACE_COVERAGE.length - 1)]
          }
          onFinish={() => setSolved(true)}
          onMiss={() => {
            setTraceMissed(true);
            setTraceAttempt((count) => count + 1);
            miss();
          }}
          locked={solved}
          dict={dict.journey}
        />
        {solved && <Celebration />}
      </div>
    );
    actions = (
      <div className="anim-fade-up flex items-center gap-2 sm:gap-3">
        <Button3D
          variant="calm"
          tone={WHITE_TONE}
          onClick={retryTrace}
          className="btn3d--clay-white px-4 py-2.5 text-sm sm:px-6 sm:py-3 sm:text-base"
        >
          {/* `--color-ink-soft-fixed`, not `--color-ink-soft`: this icon rides
              inside a `.btn3d--clay-white` button, pinned pale regardless of
              theme (globals.css) — `--color-ink-soft` itself flips light in
              dark mode, for the same body-text reason `--color-ink` does. */}
          <RotateCcw
            className="h-4 w-4 text-[var(--color-ink-soft-fixed)]"
            strokeWidth={2.75}
          />
          {dict.journey.tryAgain}
        </Button3D>

        {solved && nextButton(dict.journey.next, GO_TONE)}
      </div>
    );
  } else if (stage === "count") {
    body =
      countActivity.kind === "give" ? (
        /* Two beats, because the point of this activity is the LINK: hand over
           the item, then say what that many of it is called. Giving alone
           teaches nothing about the numeral; asking alone teaches nothing
           about quantity. */
        !appleGiven ? (
          <div>
            <AppleGive
              key={`give-${attempt}`}
              target={value}
              icon={countActivity.icon}
              itemLabel={itemLabel}
              dict={dict.journey}
              dir={dir}
              highlightTarget={marksTarget}
              onGiven={() => setAppleGiven(true)}
            />
          </div>
        ) : (
          <div className="relative">
            <NumberQuiz
              key={`count-${attempt}`}
              choices={countChoices}
              answer={value}
              solved={solved}
              /* The one stage that carries itself on — see `solveAndGo`. */
              onCorrect={solveAndGo}
              onWrong={pickMiss}
              dict={dict.journey}
            />
            {solved && <Celebration />}
          </div>
        )
      ) : countActivity.kind === "complete" ? (
        <div className="relative">
          <NumberComplete
            key={`complete-${attempt}`}
            value={value}
            image={image}
            highlightTarget={marksTarget}
            onFinish={() => setSolved(true)}
            onMiss={pickMiss}
            dict={dict.journey}
          />
          {solved && <Celebration />}
        </div>
      ) : countActivity.kind === "path" ? (
        <div className="relative">
          <NumberPath
            key={`path-${attempt}`}
            numbers={countActivity.numbers}
            target={value}
            accent={accent}
            onFinish={() => setSolved(true)}
            dict={dict.journey}
          />
          {solved && <Celebration />}
        </div>
      ) : (
        <div className="relative">
          <NumberColor
            key={`color-${attempt}`}
            value={value}
            image={image}
            strokes={strokes}
            accent={accent}
            onFinish={() => setSolved(true)}
            dict={dict.journey}
          />
          {solved && <Celebration />}
        </div>
      );
    /* **"How many apples did we pick?" has NO Next button**, on direct
       request: picking the right numeral IS the child saying they are done,
       so the stage celebrates and then moves on by itself. The other three
       count activities keep theirs — they finish on a drag or a filled-in
       outline, where a moment to look at the finished numeral is the reward
       and taking it away would cut that short. */
    const countAutoAdvances =
      countActivity.kind === "give" && appleGiven;
    actions =
      solved && !countAutoAdvances
        ? nextButton(dict.journey.next, GO_TONE)
        : null;
  } else if (stage === "game") {
    /* **A lost round takes the sky off the screen entirely**, and puts the
       balloon that got away in its place — centred, above Pinki, so "pop the
       Number 1 balloon" is shown as well as said. The sky itself has to go:
       every balloon has left by then, so leaving the box up would be an empty
       panel over her line.

       No sibling `<Celebration>` here either, unlike the other stages: the
       balloons are still rising when one is popped, so a burst centred on this
       wrapper would land away from it. `BalloonPop` bursts its own confetti
       from inside the balloon. */
    body = gameActivity === "complete" ? (
      /* The same board the `count` stage gives 4 and 9, as this number's last
         challenge instead of the balloons — see `data/game-activities.ts` for
         the rule that stops one number getting it twice. */
      <div className="relative">
        <NumberComplete
          key={`game-complete-${attempt}`}
          value={value}
          image={image}
          highlightTarget={marksTarget}
          onFinish={() => setSolved(true)}
          onMiss={pickMiss}
          dict={dict.journey}
        />
        {solved && <Celebration />}
      </div>
    ) : gameFailed ? (
      <TargetBalloon choices={popChoices} value={value} />
    ) : (
      <BalloonPop
        key={`pop-${attempt}`}
        choices={popChoices}
        answer={value}
        onCorrect={() => setSolved(true)}
        onMiss={pickMiss}
        onEscape={() => {
          setGameFailed(true);
          /* A whole round let go counts the same as a wrong pick — it is the
             one thing the star tally is built from. */
          miss();
        }}
        dict={dict.journey}
      />
    );
    /* Was "See my stars!" — the celebration screen does not show stars any
       more, so the button can no longer promise them. */
    actions = solved ? (
      nextButton(dict.journey.finishExclaim, GO_TONE)
    ) : gameFailed ? (
      <Button3D
        tone={BRAND_TONE}
        onClick={retryGame}
        className="px-8 py-3 text-base sm:px-10 sm:text-lg"
      >
        <RotateCcw className="h-5 w-5" strokeWidth={2.75} />
        <span dir={dir}>{dict.journey.again}</span>
      </Button3D>
    ) : null;
  } else {
    /* **No stars here.** The three-star tally was taken off this screen on
       direct request — it is still scored and still recorded (see the effect
       above), so the number list keeps showing what was earned; it is only
       the celebration that no longer stops to count. What is left is the
       thing that actually happened: the number is finished, and the next one
       is open.

       The confetti needs a sized box to burst from, and the stars used to be
       it — so it wraps the title and the unlock pill now, which is the same
       spot on the screen. */
    body = (
      /* **The reward is a PANEL, not loose text on the ground.** The title and
         the unlock used to float on the bare page between the confetti and
         the two buttons — three pill-shaped things stacked in a column, two of
         them the same green, and nothing saying which was the announcement and
         which was the way onward. On a white `.card` the announcement has a
         surface of its own, so the green pill inside it reads as news and the
         green button below it reads as an action. The card is also what the
         confetti bursts from, which is why it is `relative`. */
      <div className="card card-clay-white anim-pop-in relative flex w-full max-w-sm flex-col items-center gap-4 px-6 py-6 text-center sm:max-w-lg sm:gap-5 sm:px-10 sm:py-8">
        <Celebration />

        {/* The crown stacks over the title on a phone and stands BESIDE it
            from `sm`. Not a style choice: this screen also carries the two
            buttons and a life-size Pinki under it, and at 1440x900 a stacked
            badge is the difference between the whole celebration fitting the
            viewport and her feet running off the bottom of it. */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          {/* **A party popper, not the crown that was here.** The crown was
              the site's achievement mark, shared with the header's
              achievements chip — and that chip has since been cut from both
              numbers pages, so a trophy on this screen was pointing at an
              award that no longer exists anywhere. This is a moment, not a
              medal: the child finished a number, and the mark should say
              "hooray" rather than "you have won a cup". Still filled and
              still one solid silhouette on the same pale gold tile — an
              outlined icon does not read as clay at this size. */}
          <span
            className="tile tile-round tile-grain anim-pop-in flex h-14 w-14 shrink-0 items-center justify-center sm:h-16 sm:w-16"
            style={
              {
                /* Mixed with a LITERAL white, not `--surface`: this is a
                   coloured clay object, and the site's rule is that those
                   stay themselves in both themes (a gold button does). Mixed
                   with `--surface` it followed the card into the dark and
                   came out a muddy olive, which is not what a medal looks
                   like. */
                "--tile-tint": "color-mix(in srgb, var(--color-gold) 26%, #fff)",
                animationDelay: "0.25s",
              } as CSSProperties
            }
          >
            <PartyPopper
              className="h-7 w-7 fill-current sm:h-8 sm:w-8"
              style={{ color: "var(--color-gold)" }}
              strokeWidth={1.5}
            />
          </span>

          <p dir={dir} className="anim-fade-up text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
            {format(dict.journey.numberComplete, { value })}
          </p>
        </div>

        {/* The unlock is the payoff for the whole journey, so it is stated in
            words rather than left for the child to notice on the list — a
            green clay pill, not plain colored text, so it reads as its own
            small reward instead of a caption. */}
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
            <Unlock
              className="h-5 w-5 text-white sm:h-6 sm:w-6"
              strokeWidth={2.75}
            />
            <span dir={dir} className="text-base font-bold text-white sm:text-lg">
              {format(dict.journey.numberUnlocked, { value: nextValue })}
            </span>
          </div>
        )}
      </div>
    );
    /* Clear of the card above them, the same way every `lead` stage's buttons
       are clear of Pinki's bubble. */
    actions = (
      <div className="anim-fade-up mt-1 flex items-center gap-3 sm:mt-3 sm:gap-4">
        <Button3D
          variant="calm"
          tone={WHITE_TONE}
          onClick={restart}
          className="btn3d--clay-white px-6 py-3 text-sm sm:text-base"
        >
          <RotateCcw
            className="h-4 w-4 text-[var(--color-ink-soft-fixed)]"
            strokeWidth={2.75}
          />
          {dict.journey.again}
        </Button3D>

        <Button3D
          tone={GO_TONE}
          href={nextHref}
          className="px-8 py-3 text-base sm:px-10 sm:text-lg"
        >
          {/* `Button3D`'s `href` branch renders a `Link` and only forwards
              `aria-label` from its rest props, so a `dir` prop passed to the
              button itself would be silently dropped — wrapping just the
              mixed text in its own `dir`-bearing span reaches both branches
              without touching the shared component. */}
          <span dir={dir}>
            {nextValue ? format(dict.journey.numberButton, { value: nextValue }) : dict.journey.finish}
          </span>
          <ArrowRight className="h-5 w-5" strokeWidth={2.75} />
        </Button3D>
      </div>
    );
  }

  const lead = guide.presence === "lead";
  /* `complete` and `path` are the two count activities with a tall board —
     a piece tray under the numeral, a route down the card — and at the
     standard placement she stood on the half of it the child has to reach.
     Resolved here rather than in the markup, like every other stage
     decision on this screen. */
  const tallBoard =
    (stage === "count" &&
      (countActivity.kind === "complete" || countActivity.kind === "path")) ||
    /* The `complete` GAME is the same tall board, so she stands clear of it
       the same way. Deliberately NOT dropped when it is solved: moving her
       back up the moment the piece lands makes her jump, and lands her across
       the bottom of the very numeral the child has just finished. */
    (stage === "game" && gameActivity === "complete");
  /* The apple tray is not a tall board, but its items grew, so she stands a
     little lower there too — see `journeyGive`. Only while the tray is still
     up: once it is answered the stage is a three-numeral quiz and she goes
     back to her usual place. */
  const givingItems = stage === "count" && countActivity.kind === "give" && !appleGiven;
  const leanPlacement = tallBoard
    ? "journeyLow"
    : givingItems
      ? "journeyGive"
      : "journey";

  /* `hero` is the one presence that comes AFTER the stage's buttons. It is the
     celebration screen, and the two ways onward were asked to sit ABOVE her:
     she is the last thing on the page there, at full size, with nothing under
     her. Every other in-flow presence introduces what follows it, so it stays
     first. */
  const heroLast = guide.presence === "hero";
  const guideNode = lead ? null : (
    <PinkiGuide pose={guide.pose} line={guide.line} presence={guide.presence} dir={dir} />
  );

  return (
    /* `relative` anchors both out-of-flow guides — `lead`'s life-size Pinki
       and `aside`'s corner one — against this column, so neither costs the
       stage any height. **No `overflow-hidden` here**: `lead` deliberately
       runs past the right edge, and the route's `<main>` carries
       `overflow-x-hidden` to stop that widening the document.

       `lead` stacks from the TOP on a phone, so the activity keeps the upper
       half of the screen and Pinki fills the lower one beneath it. From `sm`
       it centres again: a desktop column is much taller than its content, and
       pinning that content to the top there left a large dead band between it
       and the bottom-anchored Pinki. Every other presence centres at all
       widths. */
    <div className="relative flex w-full flex-1 flex-col">
      {/* **The step rail belongs to the PAGE, not to the stage on screen.** It
          is pinned to the top of the journey column, directly under the
          "Number N of 9" bar, rather than sitting inside the centred group
          with the activity — where it rode up and down the screen with
          whatever was being worked on and ended up floating in the middle of
          the page, immediately above the balloons. Where the child is inside
          one number is chrome: it belongs in one fixed place at the top,
          every stage. */}
      {stage !== "celebrate" && (
        <div className="flex shrink-0 justify-center pb-4 sm:pb-6">
          <StageDots
            current={stageIndex}
            total={WORKING_STAGES.length}
            accent={accent}
            dict={dict.journey}
          />
        </div>
      )}

      {/* The stage itself, centred in whatever height the rail leaves. `lead`
          stacks from the TOP on a phone so the activity keeps the upper half
          of the screen and Pinki fills the lower one beneath it; from `sm` it
          centres again, because a desktop column is much taller than its
          content and pinning it to the top left a dead band above the
          bottom-anchored Pinki. */}
      <div
        /* **The `key` is what replays the entrance.** Changing it remounts the
           whole group, which restarts `.stage-swap`'s animation — a class
           alone would not, since the element never leaves the DOM. It counts
           the two IN-STAGE activity changes as swaps too, because they are
           ones: handing the apple over replaces the tray with a question, and
           losing the balloons replaces the sky with Pinki. It deliberately
           does NOT include `solved`, which only adds a button — keying on
           that would remount the balloons the moment one is popped. */
        key={`${stage}-${appleGiven}-${gameFailed}`}
        /* **`relative z-20` is not decoration — it is what the transition
           cost.** Animating `opacity`/`translate` makes this group its own
           stacking context, which traps the guide column's `z-20` INSIDE it:
           `PinkiLean` is a sibling that comes later in the DOM, so she started
           painting over her own speech bubble (her stick drawn straight across
           the words). Ranking the whole group above her `z-10` puts it back,
           and it also settles the activity/Pinki order the same way at every
           stage — she leans in from BEHIND the board rather than across it. */
        className={`stage-swap relative z-20 flex flex-1 flex-col items-center gap-4 sm:gap-6 ${
          leaving ? "stage-swap--out" : ""
        } ${lead ? "justify-start sm:justify-center" : "justify-center"}`}
      >
        {/* WHERE she sits in the column is part of what her presence means.
            `lead` comes after the activity, because she is the lower half of
            the screen and her bubble carries the stage's buttons with it;
            `hero` comes after the buttons, at the very end of the celebration
            screen. */}
        {!heroLast && guideNode}

        {body}

        {lead ? (
          <PinkiGuide
            pose={guide.pose}
            line={guide.line}
            presence={guide.presence}
            lowered={leanPlacement === "journeyGive"}
            /* The apple-count quiz is solved but carries no Next button of
               its own — see `bubbleDown`'s own doc comment for why `children`
               alone can't tell PinkiGuide the round is over here. */
            bubbleDown={stage === "count" && countActivity.kind === "give" && appleGiven && solved}
            dir={dir}
          >
            {actions}
          </PinkiGuide>
        ) : (
          actions
        )}

        {heroLast && guideNode}
      </div>

      {/* Life size, and positioned against THIS column rather than against the
          stage's own box — she is sized as a share of its height, and it is
          the box whose right edge crops her. A direct child of the root for
          that reason alone; `data/number-guide.ts` still decides whether she
          appears. She keeps `z-10`, under the guide column's `z-20`, so a
          button is never painted over. */}
      {lead && <PinkiLean pose={guide.pose} placement={leanPlacement} />}
    </div>
  );
}
