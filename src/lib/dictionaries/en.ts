import type { Locale } from "@/types/locale";
/**
 * Site chrome and Pinki's speech, in English — the default locale and the
 * type source every other dictionary is checked against (`Dictionary =
 * typeof en`). The taught content itself (shape words, colors,
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
  /** Not chrome text — the one non-string leaf, so any component already
      holding the whole `dict` can derive `dir="rtl"|"ltr"` for an element
      whose text mixes this locale's words with an English value (a name, a
      number) without a second `locale` prop or a second `getLocale()` call.
      Typed via `Locale` rather than inferred, so `ar.ts` can declare `"ar"`
      instead of being forced into this literal `"en"`. */
  locale: "en" as Locale,
  nav: {
    home: "Home",
    learn: "Learn",
    play: "Play",
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
    play: {
      title: "Play",
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
    shapes: {
      name: "Learn Shapes",
      description: "Circles, squares, triangles and more",
      items: ["Circle", "Square", "Triangle", "Rectangle", "Shape review"],
    },
    colors: {
      name: "Learn Colors",
      description: "Red, blue, yellow and every color around you",
      items: ["Red", "Blue", "Yellow", "Green", "Orange", "Purple", "Pink", "Brown", "Black", "White", "Color review"],
    },
    fruits: {
      name: "Fruits & Vegetables",
      description: "Yummy things to eat and how to spell them",
      items: ["Apple", "Banana", "Orange", "Grapes", "Carrot", "Broccoli", "Corn", "Potato", "Market review"],
    },
    seasons: {
      name: "The Seasons",
      description: "Spring, summer, fall and winter",
      items: ["Spring", "Summer", "Fall", "Winter", "Seasons review"],
    },
    animals: {
      name: "Animals",
      description: "Cat, dog, cow and fish — and where they live",
      items: ["Cat", "Dog", "Cow", "Fish", "Animals review"],
    },
    weather: {
      name: "The Weather",
      description: "Sunny, rainy, windy, snowy",
      items: ["Sunny", "Rainy", "Cloudy & Windy", "Snowy", "Weather review"],
    },
  },
  characterHub: {
    backToLearn: "Back to Learn",
    nextUp: "Next up",
    startLesson: "Start {name}",
    hello: "Hi, I'm {name}!",
    askToday: "What shall we learn today?",
  },
  lessonPicker: {
    backTo: "Back to {characterName}'s lessons",
    next: "Next",
    lessonsCount: "{n} lessons",
    lockedLessonAria: "Lesson {n}: {title}, locked",
    startLessonAria: "Start lesson {n}: {title}",
    ctaStart: "Start",
    ctaNextLesson: "Next Lesson",
  },
  /** The lesson player's own chrome and Pinki's lines in a lesson. Taught
      words arrive in `{…}` and stay English. */
  lessonPlayer: {
    backTo: "Back to {lessonName}",
    traceInstruction: "Trace the shape with your finger",
    reelAbout: "A short video: {title}",
    comingSoon: "{name} is still getting this lesson ready!",
    next: "Next",
    yourTurn: "Your turn!",
    playAgain: "Play again",
    nextLesson: "Next lesson",
    nextShape: "Next shape",
    finish: "Finish",
    lessonDone: "Lesson complete!",
    skip: "Skip",
    help: "Help",
    startOver: "Start over",
    close: "Close",
    sortBin: "The {shape} box",
    hearWord: "Hear {word}",
    letterAria: "Letter {letter}",
    playReel: "Play the video",
    findItemAria: "Tap the {word}",
    likeAria: "I like it",
    dislikeAria: "I don't like it",
    potAria: "{color} paint",
    balloonAria: "{color} balloon",
    seasonSpotAria: "Tap to bring more {word}",
    growSpotAria: "Tap to help the {word} grow",
  },
  /** Pinki's questions. `{shape}`, `{item}` are English taught words. */
  asks: {
    whichShape: "Which one is the {shape}?",
    draw: "Draw a {shape}!",
    thisIs: "This is a {shape}!",
    spell: "Build the word {word}!",
    findAll: "Find all the {shape}s!",
    sortAll: "Put each thing in its shape's box!",
    thisColor: "This is {color}!",
    paint: "Read the word, then paint!",
    findColor: "Find all the {color} things!",
    mix: "What do {a} and {b} make?",
    whichColor: "Which one is {color}?",
    spellColor: "Build the word for this color!",
    sortColors: "Put each thing in its color's box!",
    popColor: "Pop the {color} balloons!",
    spellPicture: "Build the word for this picture!",
    thisSeason: "This is {season}!",
    changeSeason: "Make it {season}!",
    growIt: "Grow the {thing}!",
    sortSeasons: "Put each thing in its season's box!",
    orderSeasons: "Put the seasons in order!",
    sortAnimals: "Put each animal in its home!",
    meetThing: "Meet the {thing}!",
    makeSoup: "Make a vegetable soup!",
    makeJuice: "Make juice with the {thing}!",
    cookSoup: "Make soup with the {thing}!",
    mixJuice: "Make a fruit juice!",
    likeThem: "Do you like them?",
    fillWord: "Fill the word {word} with your finger!",
    pickList: "Pick the things on Nova's list!",
  },
  /** The task chip's one verb per kind of step. */
  tasks: {
    listen: "Listen",
    watch: "Watch",
    draw: "Draw",
    build: "Build",
    find: "Find",
    pick: "Pick",
    sort: "Sort",
    paint: "Paint",
    pop: "Pop",
    order: "Line up",
    cook: "Cook",
    juice: "Blend",
    like: "Like?",
    fill: "Fill",
    harvest: "Pick",
    change: "Make",
    grow: "Grow",
  },
  activities: {
    puzzleTitle: "Puzzle Time",
    puzzleSubtitle: "Complete the puzzles!",
    memoryTitle: "Memory Match",
    memorySubtitle: "Find the matching friends!",
    backToActivities: "Back to Play",
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
    levelLabel: "Level {value}",
    /** The bare word, used beside the digit in the puzzle grid's stage chip
        (`<span>{levelWord}</span>{value}`) — distinct from `levelLabel`
        above, a single already-joined string used elsewhere as one label. */
    levelWord: "Level",
    puzzleBoardAria: "Puzzle board — {alt}",
    puzzlePieceAria: "Puzzle piece {index} of {total}",
    hintsButton: "Hints — see the finished picture",
    theFinishedPicture: "The finished picture",
    helpButtonAria: "Help — put one piece in place. {left} left",
    help: "Help",
    closeHint: "Close and go back to the puzzle",
    again: "Again",
    next: "Next",
    secondsLeftAria: "{n} seconds left",
    cardFaceDownAria: "Card {index} face down",
  },
  /** The Edenic Trail — the adventure map. Its own namespace, not part of
      `activities`: it is a section of the site in its own right, not one of
      the two games. **"Edenic Trail" itself never translates** — it is a
      brand name, the same rule that keeps Edenic World, Pinki, Nova and Bloo
      English inside an Arabic or Kurdish sentence. It replaced `worldTeaser`,
      the friend-world "Coming Soon" card this one was built over. */
  trail: {
    title: "Edenic Trail",
    description:
      "A path of adventures winding up through the sky. Climb it with Pinki, Nova and Bloo — one stop at a time.",
    cta: "Start your adventure",
    ctaContinue: "Continue",
    /* Nova's welcome, the two beats she greets a child with on `/trail`.
       She names herself in the first because a child meeting her here has
       only seen her locked on `/learn`. The second deliberately does NOT
       say "tap the cloud": tapping a stop does nothing yet, and promising
       an action that isn't built is worse than pointing at one. */
    introHello: "Hi! I am Nova, your guide up the sky.",
    introStart: "Come on — our journey starts here!",
    introSkip: "Skip",
  },
  ui: {
    completedAria: "{label} completed",
  },
};

export type Dictionary = typeof en;
