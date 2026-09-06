/**
 * Site chrome and Pinki's speech, in English — the default locale and the
 * type source every other dictionary is checked against (`Dictionary =
 * typeof en`). The taught content itself (numeral words, letters, colors,
 * and every brand/character name) never lives here: it stays English (and
 * unchanged) in every locale, per CLAUDE.md's language switcher conventions.
 *
 * Every leaf is a plain string, never a function — some carry `{name}`-style
 * placeholders, filled in with `format()` (`lib/format-dict.ts`) at the call
 * site. This is what lets the WHOLE dictionary be handed to a Client
 * Component as an ordinary prop: React can't serialize a function crossing
 * the Server→Client boundary, so nothing here may be one.
 */
export const en = {
  nav: {
    home: "Home",
    learn: "Learn",
    activities: "Activities",
    profile: "Profile",
    soon: "Soon",
    mainAriaLabel: "Main",
    footerAriaLabel: "Footer",
  },
  header: {
    changeLanguage: "Change language",
    chooseLanguage: "Choose a language",
    english: "English",
    arabic: "العربية",
    kurdish: "کوردی",
    joinFull: "Join Edenic World",
    join: "Join",
  },
  footer: {
    tagline:
      "A gentle place to learn letters, numbers and shapes — built for children under ten.",
    explore: "Explore",
    follow: "Follow",
    copyright: "© {year} Edenic World. Made for curious little people.",
  },
  home: {
    heroWelcome: "Welcome to",
    heroSubtitle:
      "Step into a whole world with Nova, Pinki and Bloo — an adventure in letters, numbers and shapes.",
    heroCta: "Start Now",
    heroAlt: "The friends of Edenic World walking through a candy-coloured land",
    scrollCue: "Meet Edenic Friends",
    friendsEyebrow: "Meet the friends",
    friendsHeadingLine1: "Three friends,",
    friendsHeadingLine2: "one big world.",
    friendsBody:
      "Pinki, Nova and Bloo each keep their own set of lessons. Finish one friend's world and the next one opens up.",
    comeSayHello: "Come say hello",
    pathsHeading: "Where would you like to start?",
  },
  homePaths: {
    learn: {
      title: "Learn",
      description:
        "Pick a friend and work through their lessons — a short video, the shape itself, then tracing and a few questions.",
      action: "Start learning",
    },
    activities: {
      title: "Activities",
      description:
        "Trace letters with a finger, match the shapes, find the odd one out — small hands-on practice after every lesson.",
      action: "Start playing",
    },
  },
  learnPicker: {
    headingLearn: "Learn.",
    headingPlay: "Play.",
    headingGrow: "Grow.",
    subtitle: "Pick a friend and start your learning adventure!",
    locked: "Locked",
    learnWith: "Learn With {name}",
    lockedAria: "{name} is locked",
    finishFirst: "Finish {name}'s lessons first!",
  },
  characters: {
    pinki: { tagline: "Counts everything and finds shapes in the whole wide world." },
    nova: { tagline: "Turns letters into stories worth telling twice." },
    bloo: { tagline: "Wonders about colours, seasons and everything in the sky." },
  },
  lessons: {
    numbers: { name: "Learn Numbers", description: "Learn numbers 1 to 9" },
    letters: { name: "Learn Letters", description: "Learn the alphabet from A to Z" },
    colors: { name: "Learn Colors", description: "Discover colors all around us" },
    /* No character currently has a "shapes" lesson (dropped on direct
       request — see CLAUDE.md), but `LessonId` still carries it, so this
       entry exists purely so `dict.lessons[lesson.id]` type-checks. */
    shapes: { name: "Learn Shapes", description: "Discover shapes all around us" },
  },
  characterHub: {
    backToLearn: "Back to Learn",
    achievements: "Achievements",
    yourAchievements: "Your achievements",
    nextUp: "Next up",
    unlocksAfter: "Unlocks after {name}",
    unlocksLater: "Unlocks later",
    startLesson: "Start {name}",
    learningCorner: "{name}'s learning corner",
  },
  lessonPicker: {
    backTo: "Back to {characterName}'s lessons",
    numbersLabel: "Numbers",
    next: "Next",
    lockedNumberAria: "The number {value}, locked",
    startNumberAria: "Start the number {value}, {stars} of 3 stars",
  },
  journey: {
    /** Pinki's line on the number PICKER, for a child who has never finished
        a number — distinct from the per-number script below it, which is
        about the one numeral being worked on. */
    pickerWelcome:
      "Hi! I'm Pinki. Let's learn our numbers together — tap Number 1 to start! 🌟",
    backTo: "Back to {lessonName}",
    numberOf: "Number {position} of {total}",
    stepOf: "Step {current} of {total}",
    tryAgain: "Try Again",
    next: "Next",
    canYouSayIt: "Can you say it?",
    sayWord: "Say {word}",
    again: "Again",
    numberButton: "Number {value}",
    traceInstruction: "Trace the number with your finger",
    dragMissingPiece: "Drag the missing piece back into the number",
    numberValue: "The number {value}",
    whichOneIsThis: "Which one is this?",
    dropItem: "Drop {article} {itemLabel} here",
    pickItemAria: "Pick {article} {itemLabel}",
    popBalloon: "Pop the balloon with number {value}",
    colorNumber: "Color in the number {value}",
    dragPinkiToward: "Drag Pinki toward number {value}",
    videoAbout: "A short video about the number {value}",
    playVideoAbout: "Play the video about the number {value}",
    myTurn: "My turn!",
    finishExclaim: "Finish!",
    finish: "Finish",
    numberComplete: "Number {value} complete!",
    numberUnlocked: "Number {value} unlocked!",
  },
  activities: {
    puzzleTitle: "Puzzle Time",
    puzzleSubtitle: "Complete the puzzles!",
    memoryTitle: "Memory Match",
    memorySubtitle: "Find the matching friends!",
    backToActivities: "Back to Activities",
    puzzleCtaButton: "Puzzle Time",
    puzzleCtaAlt: "Colourful puzzle pieces scattered across the card",
    memoryCtaButton: "Memory Match",
    memoryCtaAlt: "Pinki, Nova and Bloo playing a memory card game",
    puzzlesLabel: "Puzzles",
    levelsLabel: "Levels",
    finished: "Finished",
    backToPuzzles: "Back to the puzzles",
    backToLevels: "Back to the levels",
    startPuzzleAria: "Start puzzle {value}",
    lockedPuzzleAria: "Puzzle {value}, locked",
    startLevelAria: "Start level {value} — {pairs} pairs",
    lockedLevelAria: "Level {value}, locked",
    puzzleLabel: "Puzzle {value}",
    levelLabel: "Level {value}",
    puzzleBoardAria: "Puzzle board — {alt}",
    puzzlePieceAria: "Puzzle piece {index} of {total}",
    hintsButton: "Hints — see the finished picture",
    theFinishedPicture: "The finished picture",
    helpButtonAria: "Help — put one piece in place. {left} left",
    help: "Help",
    skip: "Skip",
    closeHint: "Close and go back to the puzzle",
    again: "Again",
    next: "Next",
    secondsLeftAria: "{n} seconds left",
    cardFaceDownAria: "Card {index} face down",
  },
  ui: {
    completedAria: "{label} completed",
    starsAria: "{stars} out of {max} stars",
  },
  /** Pinki's spoken-line TEMPLATES for one number's journey — distinct from
      `journey` above, which holds ordinary button/aria copy.
      `data/number-script.ts` composes the final line per locale; the
      English branch there reproduces the site's original hand-written
      composition exactly (word.toUpperCase(), English pluralization) rather
      than reading these templates, so these English entries exist only for
      `Dictionary` shape parity with `ar.ts` — not read at runtime. `{value}`
      is the bare numeral; `{word}`/`{itemLabel}` arrive pre-cased/pluralized
      by the caller for whichever locale is active. */
  pinki: {
    discover: "Look what I found — Number {value}!",
    reveal: "This is Number {value}!",
    strokeHintDefault: "Watch me draw it!",
    strokeHint1: "A little flag... then straight down!",
    traceInvite: "Trace it with me!",
    traceMiss: "So close! Let's go again.",
    find: "Which one is {word}?",
    findMiss: "Hmm... let's look again!",
    countGive: "Pick {word} {itemLabel}!",
    countComplete: "Complete Number {value}!",
    countPath: "Walk me to Number {value}!",
    countColor: "Color Number {value}!",
    countHow: "How many {itemLabel} did we pick?",
    game: "Pop Number {value}!",
    celebrate: "Hooray! You did it!",
  },
};

export type Dictionary = typeof en;
