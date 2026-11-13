import type { Dictionary } from "./en";

/**
 * Badini (Behdinî) Kurdish site chrome and Pinki's speech — the Kurmanji
 * dialect spoken around Duhok, written in the Arabic-based Kurdish alphabet
 * (so: right-to-left, and every rule in `lib/format-dict.ts`'s `dirFor`
 * applies here exactly as it does to `ar.ts`). Structurally mirrors `en.ts`
 * (checked against `Dictionary`) — the taught content itself never appears
 * here, only the words around it. Every leaf is a plain string with the same
 * `{placeholder}` tokens as its English counterpart — see `en.ts`'s doc
 * comment for why (`format()` in `lib/format-dict.ts` fills them in).
 *
 * Brand and character names (Edenic World, Pinki, Nova, Bloo) are never
 * translated and never transliterated — they stay Latin even inside a Kurdish
 * sentence, which is the rule CLAUDE.md states. (`ar.ts` transliterates the
 * three mascots in two prose lines; that is the deviation, not this.)
 */
export const ku: Dictionary = {
  locale: "ku",
  nav: {
    home: "ماڵ",
    learn: "فێربوون",
    discover: "بدۆزە",
    profile: "پرۆفایل",
    soon: "بزووی",
    mainAriaLabel: "لیستا سەرەکی",
    footerAriaLabel: "بنێ لاپەڕێ",
  },
  header: {
    changeLanguage: "گوهۆڕینا زمانی",
    chooseLanguage: "زمانەکی هەلبژێرە",
    english: "English",
    arabic: "العربية",
    kurdish: "کوردی",
    joinFull: "بەشدارە ل Edenic World",
    join: "بەشدارە",
  },
  footer: {
    tagline:
      "جهەکێ خۆش بۆ فێربوونا تیپان، ژمارەیان و شێوەیان — هاتیە چێکرن بۆ زاڕۆکێن بن دە سالان.",
    explore: "گەڕان",
    follow: "شوینکەفتن",
    copyright: "© {year} Edenic World. بۆ زاڕۆکێن بچویک و پرسیارکەر هاتیە چێکرن.",
  },
  home: {
    heroWelcome: "بخێر هاتن بۆ",
    heroSubtitle:
      "بچە ناڤ جیهانەکێ تەمام دگەل Nova، Pinki و Bloo — سەرپێهاتییەک د تیپان، ژمارەیان و شێوەیاندا.",
    heroCta: "نوکە دەست پێبکە",
    heroAlt: "هەڤالێن Edenic World ل زەڤییەکا ب ڕەنگێ شیرینییان دگەڕن",
    scrollCue: "هەڤالێن Edenic ناسبکە",
    friendsEyebrow: "هەڤالان ناسبکە",
    friendsHeadingLine1: "سێ هەڤال،",
    friendsHeadingLine2: "و جیهانەکێ مەزن.",
    friendsBody:
      "Pinki، Nova و Bloo هەر ئێک کۆمەلا خۆ یا وانەیان هەیە. جیهانا ئێک هەڤالی تەمام بکە، یا دی ڤەدبیت.",
    comeSayHello: "وەرن سلاڤان لێ بکەن",
    pathsHeading: "دخوازی ژ کیڤە دەست پێ بکەی؟",
  },
  homePaths: {
    learn: {
      title: "فێربوون",
      description:
        "هەڤالەکی هەلبژێرە و د وانەیێن وی دا بڕێڤە بچە — ڤیدیۆیەکا کورت، پاشی شێوە بخۆ، پاشی شوپاندن و چەند پرسیار.",
      action: "دەستبکە ب فێربوونێ",
    },
    play: {
      title: "یاری",
      description:
        "تیپان ب تلییا خۆ بشوپینە، شێوەیان وەکهەڤ بکە، یا جودا بدۆزە — چالاکیێن بچویک پشتی هەر وانەیەکێ.",
      action: "دەستبکە ب یاریێ",
    },
  },
  learnPicker: {
    headingLearn: "فێربە.",
    headingPlay: "یاری بکە.",
    headingGrow: "گەشە بکە.",
    subtitle: "هەڤالەکی هەلبژێرە و دەستبکە ب سەرپێهاتییا فێربوونێ!",
    locked: "قوفلکری",
    learnWith: "دگەل {name} فێربە",
    lockedAria: "{name} قوفلکرییە",
    finishFirst: "بەری هەمییان وانەیێن {name} تەمام بکە!",
  },
  characters: {
    pinki: { tagline: "شێوە و ڕەنگان ل هەمی جیهانی نیشا تە ددەت." },
    nova: { tagline: "سەوزەیان نیشا تە ددەت." },
    bloo: { tagline: "گیانەوەر، وەرز و کەش و هەوایێ نیشا تە ددەت." },
  },
  lessons: {
    shapes: {
      name: "شێوە",
      description: "بازنە، چوارگۆشە و سێگۆشە",
      items: ["بازنە", "چوارگۆشە", "سێگۆشە", "لاکێشە"],
    },
    colors: {
      name: "ڕەنگ",
      description: "سۆر، شین، زەر و پتر",
      items: ["سۆر", "شین", "زەر", "کەسک", "پرتەقالی", "مۆر", "پەمبەیی", "قاوەیی", "ڕەش", "سپی"],
    },
    fruits: {
      name: "سەوزە",
      description: "تشتێن خۆش بۆ خوارنێ و چاوا دنڤیسن",
      items: ["گێزەر", "بڕۆکلی", "پەتاتە", "تەماتە", "بیبەر"],
    },
    garden: {
      name: "باخچێ من",
      description: "گول، دار، هێلین و پتر د باخچێ دا",
      items: ["گول", "دار", "بەلگ", "گیا", "هێلین", "کورسی"],
    },
    animals: {
      name: "گیانەوەر",
      description: "پشیک، سەگ، ماسی، فیل و یێن دی",
      items: ["پشیک", "سەگ", "ماسی", "فیل", "مشک", "تەیر", "تووتی", "کووسی", "مارمارۆک"],
    },
    weather: {
      name: "وەرز و کەش و هەوا",
      description: "بهار، هاڤین، پاییز و زڤستان، و کەش و هەوایێ وان",
      items: ["بهار · باران", "هاڤین · ڕۆژ", "پاییز · با", "زڤستان · بەفر"],
    },
  },
  characterHub: {
    backToLearn: "ڤەگەڕان بۆ فێربوونێ",
    startLesson: "{name} دەستپێبکە",
    continueLesson: "{name} بەردەوام بە",
    replayLesson: "{name} دووبارە یاری بکە",
    youCanDoIt: "تو دشێی!",
    allDone: "تە هەمی فێربوو! دەستخۆش!",
    learnedOf: "{done} ژ {total} فێربوو",
  },
  lessonPicker: {
    backTo: "ڤەگەڕان بۆ وانەیێن {characterName}",
    next: "یا دی",
    lessonsCount: "{n} وانە",
    lockedLessonAria: "وانا {n}: {title}، قوفلکری",
    startLessonAria: "وانا {n} دەستپێبکە: {title}",
    ctaStart: "دەستپێبکە",
    ctaContinue: "بەردەوام بە",
    openChest: "سندوقێ ڤەکە",
    /** Over the next lesson on a friend's course board. */
    lessonN: "وانا {n}",
  },
  lessonPlayer: {
    backTo: "ڤەگەڕان بۆ {lessonName}",
    traceInstruction: "شێوەی ب تلییا خۆ بشوپینە",
    reelAbout: "ڤیدیۆیەکا کورت: {title}",
    comingSoon: "{name} هێشتا ڤێ وانێ ئامادە دکەت!",
    next: "یا دی",
    yourTurn: "نۆبەتا تەیە!",
    playAgain: "دووبارە یاری بکە",
    nextLesson: "وانا دی",
    nextShape: "شێوەیێ دی",
    finish: "بدووماهی بینە",
    lessonDone: "وانە ب دووماهی هات!",
    learnedWord: "تە پەیڤا {word} فێربوو!",
    learnedAll: "تە هەمی فێربوو!",
    skip: "دەرباز ببە",
    help: "هاریکاری",
    startOver: "ژ نوی",
    close: "دابخە",
    hearWord: "گوهداری {word} بکە",
    letterAria: "تیپا {letter}",
    playReel: "ڤیدیۆیێ لێ بدە",
    findItemAria: "دەست بدە {word}",
  },
  asks: {
    draw: "{shape} بکێشە!",
    thisIs: "ئەڤە {shape}!",
    spell: "پەیڤا {word} چێ بکە!",
    findAll: "هەمی {shape} بدۆزە!",
    thisColor: "ئەڤە ڕەنگێ {color}ە!",
    findColor: "هەمی تشتێن {color} بدۆزە!",
    mix: "{a} و {b} پێکڤە چ چێدکەن؟",
    thisSeason: "ئەڤە وەرزێ {season}ە!",
    meetThing: "{thing} بناسە!",
    feedAnimal: "{thing} چ دخوت؟ خوارنێ بدێ!",
    basketTime: "{thing} بکە د سەلکێ دا!",
    thisWeather: "هەوا {weather}ە!",
  },
  tasks: {
    listen: "گوهداری بکە",
    watch: "تەماشە بکە",
    draw: "بکێشە",
    build: "چێ بکە",
    find: "بدۆزە",
    pick: "هەلبژێرە",
    feed: "خوارن بدە",
    basket: "دانە",
  },
  /** `/discover`: the two doors — Play and Watch — and Watch's own lines. */
  discover: {
    playButton: "یاری",
    watchButton: "تەماشە بکە",
    watchAlt: "Pinki، Nova و Bloo د جیهانا Edenic دا دگەرن",
    backToDiscover: "زڤڕینا بۆ بدۆزە",
    watchClipAria: "ڤیدیۆیا {title} تەماشە بکە",
    episodesTitle: "پشکێن",
    reelsTitle: "ڤیدیۆیێن کورت",
    filterAll: "هەمی",
    filterAria: "ڤیدیۆیێن کورت فلتەر بکە",
    episodeAria: "پشکا {title} بلێزە",
    latestEpisode: "دوماهیک پشک",
    watchNow: "نوکە تەماشە بکە",
    more: "زێدەتر",
  },
  activities: {
    /** Nova's Cups on /play (2026-10-23 — the Vegetables lessons' third
        step until then). */
    cupsCtaButton: "یاریا پەرداخان",
    cupsCtaAlt: "سێ پەرداخێن Nova د باخچێ وێدا، گێزەرەک ل بن ئێکێ ژ وان",
    cupsAsk: "تەماشەی پەرداخان بکە و {thing} بدۆزە!",
    cupsWin: "تە هەمی دیتن!",
    /** A cup's name for a screen reader, by where it stands — never by
        what is under it. */
    cupAria: "پەرداخا {n}",
    puzzleTitle: "دەمێ چێکرنا وێنەیان",
    puzzleSubtitle: "پازلان تەمام بکە!",
    memoryTitle: "بیرا خۆ تاقی بکە",
    memorySubtitle: "هەڤالێن وەکهەڤ بدۆزە!",
    backToGames: "ڤەگەڕان بۆ یاریان",
    puzzleCtaButton: "دەمێ چێکرنا وێنەیان",
    puzzleCtaAlt: "پارچەیێن پازلێ یێن ڕەنگین ل سەر کارتێ بەلاڤبووی",
    memoryCtaButton: "بیرا خۆ تاقی بکە",
    memoryCtaAlt: "Pinki، Nova و Bloo یاریا کارتێن بیرێ دکەن",
    puzzlesLabel: "پازل",
    levelsLabel: "ئاست",
    finished: "تەمام",
    backToPuzzles: "ڤەگەڕان بۆ پازلان",
    backToLevels: "ڤەگەڕان بۆ ئاستان",
    startPuzzleAria: "پازلا {value} دەستپێبکە",
    lockedPuzzleAria: "پازلا {value}، قوفلکری",
    startLevelAria: "ئاستێ {value} دەستپێبکە — {pairs} جووت",
    lockedLevelAria: "ئاستێ {value}، قوفلکری",
    levelLabel: "ئاستێ {value}",
    levelWord: "ئاست",
    puzzleBoardAria: "تەختێ پازلێ — {alt}",
    puzzlePieceAria: "پارچەیا پازلێ {index} ژ {total}",
    hintsButton: "ئاماژە — وێنێ تەمام ببینە",
    theFinishedPicture: "وێنێ تەمام",
    helpButtonAria: "هاریکاری — پارچەیەکێ دانە جهێ خۆ. {left} مایە",
    help: "هاریکاری",
    closeHint: "دگرە و ڤەگەڕە بۆ پازلێ",
    again: "جارەکا دی",
    next: "یا دی",
    secondsLeftAria: "{n} چرکە مایە",
    cardFaceDownAria: "کارتا {index}، سەرەژێر",
  },
  sky: {
    title: "ڕێکا ئاسمانی",
    back: "ڤەگەڕان بۆ ئاسمانی",
    games: "یاری",
    gamesAria: "هەمی یاری",
    startLevelAria: "ئاستێ {n} دەست پێ بکە",
    lockedLevelAria: "ئاستێ {n}، گرتییە",
    starAria: "ستێرا مەزن یا Edenic",
    doorAria: "مالا {name}",
    gateCount: "{n} ژ {total}",
    gateAria: "دەرگەهێ {name} ب {total} ستێرێن وانەیێن {name} ڤەدبیت. {n} ل دەڤ تە نە.",
    replayIntro: "چیرۆکێ دووبارە ببینە",
    toTheDoor: "بۆ مالا {name}",
    searchStars: "ستێرێن ڤەشارتی ببینە!",
    searchDust: "عەوران ب دەستلێدانێ لادە و تۆزا ستێرێ ببینە!",
    searchLights: "هەر سێ ڕووناهیێن دوور ببینە!",
    searchThingAria: "تشتێ ڤەشارتی {n}",
    searchCloudAria: "عەورەک. دەست لێ بدە دا بچیت.",
    levelTitle: "ڕێکا ئاسمانی، ئاستێ {n}",
    challengeOf: "ئالنگاریا {n} ژ {total}",
    levelDone: "ئاست ب دوماهی هات!",
    levelDoneLine: "عەورێ {n} یێ تە یە. بفڕە!",
    allDoneLine: "بەرێخۆبدە! مالەکا بچووک ل سەر دوماهیک عەوری.",
    nextLevel: "ئاستێ دی",
    pinkiHello: "سلاڤ! ئەز Pinki مە. وەرە پێکڤە بفڕین!",
    pinkiPower: "د پازلێ دا ئاسێ بووی؟ لامپێ بگرە و ئەز دێ هاریکاریا تە کەم.",
    skip: "دەرباز ببە",
  },
  ui: {
    /** Read out while something loads (nothing is written on screen). */
    loading: "بارکرن…",
    completedAria: "{label} تەمام بوو",
  },
};
