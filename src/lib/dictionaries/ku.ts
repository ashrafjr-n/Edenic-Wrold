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
 *
 * Simplified corner, called out on purpose, same as `ar.ts`: Kurdish noun
 * inflection after a numeral is not modelled — `countGive`/`countHow` use the
 * bare digit with the item's plain singular form regardless of count.
 */
export const ku: Dictionary = {
  locale: "ku",
  nav: {
    home: "ماڵ",
    learn: "فێربوون",
    play: "یاری",
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
    pinki: { tagline: "هەمی تشتان دهەژمێریت و شێوەیان ل هەمی جیهانی دبینیت." },
    nova: { tagline: "تیپان دکەتە چیرۆکێن هێژایی دوو جاران بێنە گۆتن." },
    bloo: { tagline: "دەربارەی ڕەنگان، وەرزان و هەمی تشتێن ل ئەسمانی پرسیاران دکەت." },
  },
  lessons: {
    numbers: { name: "فێربوونا ژمارەیان", description: "ژمارەیان ژ 1 هەتا 9 فێربە" },
    letters: {
      name: "فێربوونا تیپان",
      description: "ئەلفوبێیا ئینگلیزی ژ A هەتا Z فێربە",
    },
    colors: { name: "فێربوونا ڕەنگان", description: "ڕەنگێن دەڤروبەری خۆ کەشف بکە" },
    shapes: { name: "فێربوونا شێوەیان", description: "شێوەیێن دەڤروبەری خۆ کەشف بکە" },
  },
  characterHub: {
    backToLearn: "ڤەگەڕان بۆ فێربوونێ",
    achievements: "دەستکەفتن",
    yourAchievements: "دەستکەفتنێن تە",
    nextUp: "یا دی",
    unlocksAfter: "پشتی {name} ڤەدبیت",
    unlocksLater: "دویڤ ڕا ڤەدبیت",
    startLesson: "{name} دەستپێبکە",
    learningCorner: "گۆشەیا فێربوونێ یا {name}",
  },
  lessonPicker: {
    backTo: "ڤەگەڕان بۆ وانەیێن {characterName}",
    numbersLabel: "ژمارە",
    next: "یا دی",
    lockedNumberAria: "ژمارا {value}، قوفلکری",
    startNumberAria: "ژمارا {value} دەستپێبکە، {stars} ژ 3 ستێران",
  },
  journey: {
    pickerWelcome:
      "سلاڤ! ئەز Pinki مە. با ب هەڤ ڕا ژمارەیێن خۆ فێربین — ژمارا 1 بتکینە دا دەست پێ بکەی! 🌟",
    backTo: "ڤەگەڕان بۆ {lessonName}",
    numberOf: "ژمارا {position} ژ {total}",
    stepOf: "پێنگاڤا {current} ژ {total}",
    tryAgain: "جارەکا دی هەول بدە",
    next: "پێشڤە",
    canYouSayIt: "دشێی بێژی؟",
    sayWord: "{word} بێژە",
    again: "جارەکا دی",
    numberButton: "ژمارا {value}",
    traceInstruction: "ژمارەی ب تلییا خۆ بشوپینە",
    dragMissingPiece: "پارچەیا کێم ڤەگەڕینە ناڤ ژمارەی",
    numberValue: "ژمارا {value}",
    whichOneIsThis: "ئەڤە کیژە؟",
    dropItem: "{itemLabel} ل ڤێرێ دانە",
    pickItemAria: "{itemLabel} هەلبژێرە",
    popBalloon: "بالۆنا ب ژمارا {value} بتەقینە",
    colorNumber: "ژمارا {value} ڕەنگ بکە",
    dragPinkiToward: "Pinki بەرەڤ ژمارا {value} بکێشە",
    videoAbout: "ڤیدیۆیەکا کورت دەربارەی ژمارا {value}",
    playVideoAbout: "ڤیدیۆیێ دەربارەی ژمارا {value} لێدە",
    myTurn: "دۆرا منە!",
    finishExclaim: "خلاس!",
    finish: "خلاسکرن",
    numberComplete: "ژمارا {value} تەمام بوو!",
    numberUnlocked: "ژمارا {value} ڤەبوو!",
  },
  activities: {
    puzzleTitle: "دەمێ چێکرنا وێنەیان",
    puzzleSubtitle: "پازلان تەمام بکە!",
    memoryTitle: "بیرا خۆ تاقی بکە",
    memorySubtitle: "هەڤالێن وەکهەڤ بدۆزە!",
    backToActivities: "ڤەگەڕان بۆ یاریان",
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
    puzzleLabel: "پازلا {value}",
    levelLabel: "ئاستێ {value}",
    levelWord: "ئاست",
    puzzleBoardAria: "تەختێ پازلێ — {alt}",
    puzzlePieceAria: "پارچەیا پازلێ {index} ژ {total}",
    hintsButton: "ئاماژە — وێنێ تەمام ببینە",
    theFinishedPicture: "وێنێ تەمام",
    helpButtonAria: "هاریکاری — پارچەیەکێ دانە جهێ خۆ. {left} مایە",
    help: "هاریکاری",
    skip: "بازدان",
    closeHint: "دگرە و ڤەگەڕە بۆ پازلێ",
    again: "جارەکا دی",
    next: "یا دی",
    secondsLeftAria: "{n} چرکە مایە",
    cardFaceDownAria: "کارتا {index}، سەرەژێر",
  },
  trail: {
    title: "Edenic Trail",
    description:
      "ڕێکەکا سەرپێهاتیان ب ئاسمانی ڤە هەلدکشیت. ب Pinki، Nova و Bloo ڕا هەلکشە، وەستگەه ب وەستگەه.",
    cta: "سەرپێهاتیا خۆ دەست پێ بکە",
    ctaContinue: "بەردەوام بە",
  },
  ui: {
    completedAria: "{label} تەمام بوو",
    starsAria: "{stars} ژ {max} ستێران",
  },
  pinki: {
    discover: "بنێڕە من چ دیت — ژمارا {value}!",
    reveal: "ئەڤە ژمارا {value}!",
    strokeHintDefault: "بنێڕە ئەز چاوا دنڤیسم!",
    strokeHint1: "ئالایەکا بچویک... پاشی ڕاست بەرەڤ خوارێ!",
    traceInvite: "دگەل من بشوپینە!",
    traceMiss: "زۆر نێزیک بوو! دیسا هەول بدەین.",
    find: "{word} کیژە؟",
    findMiss: "هومم... دیسا بنێڕین!",
    countGive: "{value} {itemLabel} هەلبژێرە!",
    countComplete: "ژمارا {value} تەمام بکە!",
    countPath: "من بگهینە ژمارا {value}!",
    countColor: "ژمارا {value} ڕەنگ بکە!",
    countHow: "مە چەند {itemLabel} هەلبژارت؟",
    game: "ژمارا {value} بتەقینە!",
    celebrate: "هوورا! تە کر!",
  },
};
