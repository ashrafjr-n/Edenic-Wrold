import type { Dictionary } from "./en";

/**
 * Arabic site chrome and Pinki's speech. Structurally mirrors `en.ts`
 * (checked against `Dictionary`) — the taught content itself never appears
 * here, only the words around it. Every leaf is a plain string with the same
 * `{placeholder}` tokens as its English counterpart — see `en.ts`'s doc
 * comment for why (`format()` in `lib/format-dict.ts` fills them in).
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
  locale: "ar",
  nav: {
    home: "الرئيسية",
    learn: "تعلّم",
    play: "العب",
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
    copyright: "© {year} Edenic World. صُنع لأصحاب الفضول الصغار.",
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
    learn: {
      title: "تعلّم",
      description:
        "اختر صديقًا وتقدّم في دروسه — فيديو قصير، ثم الشكل نفسه، ثم التتبّع وبضعة أسئلة.",
      action: "ابدأ التعلّم",
    },
    play: {
      title: "العب",
      description:
        "تتبّع الحروف بإصبعك، طابق الأشكال، اكتشف المختلف — تمارين عملية بسيطة بعد كل درس.",
      action: "ابدأ اللعب",
    },
  },
  learnPicker: {
    headingLearn: "تعلّم.",
    headingPlay: "العب.",
    headingGrow: "انمُ.",
    subtitle: "اختر صديقًا وابدأ مغامرة التعلّم!",
    locked: "مقفل",
    learnWith: "تعلّم مع {name}",
    lockedAria: "{name} مقفل",
    finishFirst: "أكمل دروس {name} أولاً!",
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
    shapes: { name: "تعلّم الأشكال", description: "اكتشف الأشكال من حولك" },
  },
  characterHub: {
    backToLearn: "العودة إلى التعلّم",
    achievements: "الإنجازات",
    yourAchievements: "إنجازاتك",
    nextUp: "التالي",
    unlocksAfter: "يُفتح بعد إكمال {name}",
    unlocksLater: "يُفتح لاحقًا",
    startLesson: "ابدأ {name}",
    learningCorner: "ركن {name} التعليمي",
  },
  lessonPicker: {
    backTo: "العودة إلى دروس {characterName}",
    numbersLabel: "الأرقام",
    next: "التالي",
    lockedNumberAria: "الرقم {value}، مقفل",
    startNumberAria: "ابدأ الرقم {value}، {stars} من 3 نجوم",
  },
  journey: {
    pickerWelcome:
      "مرحبًا! أنا بينكي. لنتعلّم أرقامنا معًا — اضغط على الرقم 1 لتبدأ! 🌟",
    backTo: "العودة إلى {lessonName}",
    numberOf: "الرقم {position} من {total}",
    stepOf: "الخطوة {current} من {total}",
    tryAgain: "حاول مرة أخرى",
    next: "التالي",
    canYouSayIt: "هل تستطيع أن تقولها؟",
    sayWord: "قل {word}",
    again: "مرة أخرى",
    numberButton: "الرقم {value}",
    traceInstruction: "تتبّع الرقم بإصبعك",
    dragMissingPiece: "اسحب القطعة الناقصة إلى داخل الرقم",
    numberValue: "الرقم {value}",
    whichOneIsThis: "أي واحد هو هذا؟",
    dropItem: "ضع {itemLabel} هنا",
    pickItemAria: "التقط {itemLabel}",
    popBalloon: "افقع البالونة برقم {value}",
    colorNumber: "لوّن الرقم {value}",
    dragPinkiToward: "اسحب بينكي نحو الرقم {value}",
    videoAbout: "فيديو قصير عن الرقم {value}",
    playVideoAbout: "شغّل الفيديو عن الرقم {value}",
    myTurn: "دوري أنا!",
    finishExclaim: "انتهيت!",
    finish: "إنهاء",
    numberComplete: "اكتمل الرقم {value}!",
    numberUnlocked: "فُتح الرقم {value}!",
  },
  activities: {
    puzzleTitle: "وقت تركيب الصور",
    puzzleSubtitle: "أكمل قطع البازل!",
    memoryTitle: "اختبر ذاكرتك",
    memorySubtitle: "اعثر على الأصدقاء المتطابقين!",
    backToActivities: "العودة إلى اللعب",
    puzzleCtaButton: "وقت تركيب الصور",
    puzzleCtaAlt: "قطع بازل ملوّنة متناثرة على البطاقة",
    memoryCtaButton: "اختبر ذاكرتك",
    memoryCtaAlt: "بينكي ونوفا وبلو يلعبون لعبة بطاقات الذاكرة",
    puzzlesLabel: "البازل",
    levelsLabel: "المستويات",
    finished: "مكتمل",
    backToPuzzles: "العودة إلى البازل",
    backToLevels: "العودة إلى المستويات",
    startPuzzleAria: "ابدأ البازل {value}",
    lockedPuzzleAria: "البازل {value}، مقفل",
    startLevelAria: "ابدأ المستوى {value} — {pairs} أزواج",
    lockedLevelAria: "المستوى {value}، مقفل",
    puzzleLabel: "بازل {value}",
    levelLabel: "مستوى {value}",
    levelWord: "مستوى",
    puzzleBoardAria: "لوحة البازل — {alt}",
    puzzlePieceAria: "قطعة البازل {index} من {total}",
    hintsButton: "تلميحات — شاهد الصورة الكاملة",
    theFinishedPicture: "الصورة الكاملة",
    helpButtonAria: "مساعدة — ضع قطعة في مكانها. باقي {left}",
    help: "مساعدة",
    skip: "تخطّي",
    closeHint: "إغلاق والعودة إلى البازل",
    again: "مرة أخرى",
    next: "التالي",
    secondsLeftAria: "{n} ثانية متبقية",
    cardFaceDownAria: "البطاقة {index}، مقلوبة",
  },
  worldTeaser: {
    comingSoon: "قريبًا",
    title: "ابنِ عالم Pinki و Nova و Bloo",
    description:
      "اجمع النقود من دروسك وألعابك، ثم أنفقها على تزيين غرفة خاصة لصديقك المفضّل.",
    ariaLabel: "قريبًا: ابنِ عالم صديقك المفضّل",
  },
  ui: {
    completedAria: "{label} مكتمل",
    starsAria: "{stars} من {max} نجوم",
  },
  pinki: {
    discover: "انظر ماذا وجدت — الرقم {value}!",
    reveal: "هذا هو الرقم {value}!",
    strokeHintDefault: "شاهدني أرسمه!",
    strokeHint1: "علم صغير... ثم مباشرة للأسفل!",
    traceInvite: "تتبّعه معي!",
    traceMiss: "قريب جدًا! لنحاول مرة أخرى.",
    find: "أيّهم هو {word}؟",
    findMiss: "همم... لننظر مرة أخرى!",
    countGive: "التقط {value} {itemLabel}!",
    countComplete: "أكمل الرقم {value}!",
    countPath: "امشِ معي إلى الرقم {value}!",
    countColor: "لوّن الرقم {value}!",
    countHow: "كم {itemLabel} التقطنا؟",
    game: "افقع الرقم {value}!",
    celebrate: "مرحى! لقد نجحت!",
  },
};
