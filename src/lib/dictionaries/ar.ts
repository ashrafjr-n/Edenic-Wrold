import type { Dictionary } from "./en";

/**
 * Arabic site chrome and Pinki's speech. Structurally mirrors `en.ts`
 * (checked against `Dictionary`) — the taught content itself never appears
 * here, only the words around it.
 *
 * Brand and character names (Edenic World, Pinki, Nova, Bloo) are never
 * translated — they stay Latin even inside an Arabic sentence, matching how
 * the rest of the site keeps them as identity, not content.
 *
 * Simplified corner, called out on purpose: Arabic dual/plural agreement is
 * not modelled (e.g. `stepOf`/`numberOf` always use the singular counter
 * form) — correct enough for a children's site, not grammatically complete.
 */
export const ar: Dictionary = {
  nav: {
    home: "الرئيسية",
    learn: "تعلّم",
    activities: "أنشطة",
    profile: "الملف الشخصي",
    soon: "قريبًا",
    mainAriaLabel: "القائمة الرئيسية",
    footerAriaLabel: "التذييل",
  },
  header: {
    changeLanguage: "تغيير اللغة",
    chooseLanguage: "اختر اللغة",
    english: "English",
    arabic: "العربية",
    kurdish: "کوردی",
    joinFull: "انضم إلى Edenic World",
    join: "انضم",
  },
  footer: {
    tagline:
      "مكان لطيف لتعلّم الحروف والأرقام والأشكال — مصمَّم للأطفال دون سن العاشرة.",
    explore: "استكشف",
    follow: "تابعنا",
    copyright: (year: number) => `© ${year} Edenic World. صُنع لأصحاب الفضول الصغار.`,
  },
  home: {
    heroWelcome: "مرحبًا بكم في",
    heroSubtitle:
      "ادخلوا عالمًا كاملاً مع نوفا وبينكي وبلو — مغامرة في الحروف والأرقام والأشكال.",
    heroCta: "ابدأ الآن",
    heroAlt: "أصدقاء Edenic World يمشون في أرض ملوّنة كالحلوى",
    scrollCue: "تعرّف على أصدقاء Edenic",
    friendsEyebrow: "تعرّف على الأصدقاء",
    friendsHeadingLine1: "ثلاثة أصدقاء،",
    friendsHeadingLine2: "وعالم واحد كبير.",
    friendsBody:
      "لكل من بينكي ونوفا وبلو مجموعة دروسه الخاصة. أكمل عالم صديق واحد ليُفتح عالم الآخر.",
    comeSayHello: "تعالوا نتعرف عليهم",
    pathsHeading: "من أين تحب أن تبدأ؟",
  },
  homePaths: {
    learn: { title: "تعلّم", action: "ابدأ التعلّم" },
    activities: { title: "أنشطة", action: "ابدأ اللعب" },
  },
  learnPicker: {
    headingLearn: "تعلّم.",
    headingPlay: "العب.",
    headingGrow: "انمُ.",
    subtitle: "اختر صديقًا وابدأ مغامرة التعلّم!",
    locked: "مقفل",
    learnWith: (name: string) => `تعلّم مع ${name}`,
    lockedAria: (name: string) => `${name} مقفل`,
    finishFirst: (name: string) => `أكمل دروس ${name} أولاً!`,
  },
  characters: {
    pinki: { tagline: "تُحصي كل شيء وتكتشف الأشكال في أرجاء العالم الواسع." },
    nova: { tagline: "يحوّل الحروف إلى حكايات تستحق أن تُروى مرتين." },
    bloo: { tagline: "يتساءل عن الألوان والفصول وكل ما في السماء." },
  },
  lessons: {
    numbers: { name: "تعلّم الأرقام", description: "تعلّم الأرقام من 1 إلى 9" },
    letters: {
      name: "تعلّم الحروف",
      description: "تعلّم الأبجدية الإنجليزية من A إلى Z",
    },
    colors: { name: "تعلّم الألوان", description: "اكتشف الألوان من حولك" },
  },
  characterHub: {
    backToLearn: "العودة إلى التعلّم",
    achievements: "الإنجازات",
    yourAchievements: "إنجازاتك",
    nextUp: "التالي",
    unlocksAfter: (name: string) => `يُفتح بعد إكمال ${name}`,
    unlocksLater: "يُفتح لاحقًا",
    startLesson: (name: string) => `ابدأ ${name}`,
  },
  lessonPicker: {
    backTo: (characterName: string) => `العودة إلى دروس ${characterName}`,
    numbersLabel: "الأرقام",
    next: "التالي",
    lockedNumberAria: (value: number) => `الرقم ${value}، مقفل`,
    startNumberAria: (value: number, stars: number) =>
      `ابدأ الرقم ${value}، ${stars} من 3 نجوم`,
  },
  journey: {
    backTo: (lessonName: string) => `العودة إلى ${lessonName}`,
    numberOf: (position: number, total: number) => `الرقم ${position} من ${total}`,
    stepOf: (current: number, total: number) => `الخطوة ${current} من ${total}`,
    tryAgain: "حاول مرة أخرى",
    next: "التالي",
    canYouSayIt: "هل تستطيع أن تقولها؟",
    sayWord: (word: string) => `قل ${word}`,
    again: "مرة أخرى",
    numberButton: (value: number) => `الرقم ${value}`,
    traceInstruction: "تتبّع الرقم بإصبعك",
    dragMissingPiece: "اسحب القطعة الناقصة إلى داخل الرقم",
    numberValue: (value: number) => `الرقم ${value}`,
    whichOneIsThis: "أي واحد هو هذا؟",
    dropItem: (itemLabel: string) => `ضع ${itemLabel} هنا`,
    pickItemAria: (itemLabel: string) => `التقط ${itemLabel}`,
    popBalloon: (value: number) => `افقع البالونة برقم ${value}`,
    colorNumber: (value: number) => `لوّن الرقم ${value}`,
    dragPinkiToward: (value: number) => `اسحب بينكي نحو الرقم ${value}`,
    videoAbout: (value: number) => `فيديو قصير عن الرقم ${value}`,
    playVideoAbout: (value: number) => `شغّل الفيديو عن الرقم ${value}`,
  },
  activities: {
    puzzleTitle: "وقت البازل",
    puzzleSubtitle: "أكمل قطع البازل!",
    memoryTitle: "لعبة الذاكرة",
    memorySubtitle: "اعثر على الأصدقاء المتطابقين!",
    backToActivities: "العودة إلى الأنشطة",
    puzzleCtaButton: "وقت البازل",
    puzzleCtaAlt: "قطع بازل ملوّنة متناثرة على البطاقة",
    memoryCtaButton: "لعبة الذاكرة",
    memoryCtaAlt: "بينكي ونوفا وبلو يلعبون لعبة بطاقات الذاكرة",
    puzzlesLabel: "البازل",
    levelsLabel: "المستويات",
    finished: "مكتمل",
    backToPuzzles: "العودة إلى البازل",
    backToLevels: "العودة إلى المستويات",
    startPuzzleAria: (value: number) => `ابدأ البازل ${value}`,
    lockedPuzzleAria: (value: number) => `البازل ${value}، مقفل`,
    startLevelAria: (value: number, pairs: number) =>
      `ابدأ المستوى ${value} — ${pairs} أزواج`,
    lockedLevelAria: (value: number) => `المستوى ${value}، مقفل`,
    puzzleLabel: (value: number) => `بازل ${value}`,
    levelLabel: (value: number) => `مستوى ${value}`,
    puzzleBoardAria: (alt: string) => `لوحة البازل — ${alt}`,
    puzzlePieceAria: (index: number, total: number) => `قطعة البازل ${index} من ${total}`,
    hintsButton: "تلميحات — شاهد الصورة الكاملة",
    theFinishedPicture: "الصورة الكاملة",
    helpButtonAria: (left: number) => `مساعدة — ضع قطعة في مكانها. باقي ${left}`,
    help: "مساعدة",
    skip: "تخطّي",
    closeHint: "إغلاق والعودة إلى البازل",
    again: "مرة أخرى",
    next: "التالي",
    secondsLeftAria: (n: number) => `${n} ثانية متبقية`,
    cardFaceDownAria: (index: number) => `البطاقة ${index}، مقلوبة`,
  },
  ui: {
    completedAria: (label: string) => `${label} مكتمل`,
    starsAria: (stars: number, max: number) => `${stars} من ${max} نجوم`,
  },
};
