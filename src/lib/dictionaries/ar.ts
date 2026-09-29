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
 * not modelled (e.g. `numberOf` always use the singular counter
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
    shapes: {
      name: "تعلّم الأشكال",
      description: "دوائر ومربعات ومثلثات والمزيد",
      items: ["الدائرة", "المربع", "المثلث", "المستطيل", "مراجعة الأشكال"],
    },
    adding: {
      name: "تعلّم الجمع",
      description: "اجمع الأرقام معًا حتى 10",
      items: ["نضعها معًا", "حتى 5", "حتى 10", "الأعداد المتشابهة", "جمع سريع"],
    },
  },
  characterHub: {
    backToLearn: "العودة إلى التعلّم",
    nextUp: "التالي",
    unlocksAfter: "يُفتح بعد إكمال {name}",
    unlocksLater: "يُفتح لاحقًا",
    startLesson: "ابدأ {name}",
    hello: "مرحبًا، أنا {name}!",
    askToday: "ماذا سنتعلّم اليوم؟",
  },
  lessonPicker: {
    backTo: "العودة إلى دروس {characterName}",
    next: "التالي",
    lessonsCount: "{n} دروس",
    lockedLessonAria: "الدرس {n}: {title}، مقفل",
    startLessonAria: "ابدأ الدرس {n}: {title}",
    ctaStart: "بدء",
    ctaNextLesson: "الدرس التالي",
  },
  lessonPlayer: {
    backTo: "العودة إلى {lessonName}",
    traceInstruction: "تتبّع الشكل بإصبعك",
    dropItem: "ضع {itemLabel} هنا",
    pickItemAria: "التقط {itemLabel}",
    reelAbout: "فيديو قصير: {title}",
    comingSoon: "Pinki لا تزال تجهّز هذا الدرس!",
    next: "التالي",
    yourTurn: "دورك!",
    playAgain: "العب مرة أخرى",
    nextLesson: "الدرس التالي",
    nextShape: "الشكل التالي",
    finish: "إنهاء",
    lessonDone: "اكتمل الدرس!",
    unlocked: "{title} مفتوح الآن!",
    skip: "تخطٍّ",
    help: "مساعدة",
    startOver: "من جديد",
    close: "إغلاق",
    sortBin: "صندوق {shape}",
    hearWord: "استمع إلى {word}",
    letterAria: "الحرف {letter}",
    playReel: "شغّل الفيديو",
    findItemAria: "المس {word}",
  },
  asks: {
    whichShape: "أين {shape}؟",
    shapeOf: "ما شكل {thing}؟",
    howMany: "كم المجموع؟",
    putIn: "ضع {n} {item} في السلة!",
    draw: "ارسم {shape}!",
    thisIs: "هذا {shape}!",
    spell: "كوّن كلمة {word}!",
    findAll: "ابحث عن كل شكل {shape}!",
    sortAll: "ضع كل شيء في صندوق شكله!",
  },
  tasks: {
    listen: "استمع",
    watch: "شاهد",
    draw: "ارسم",
    build: "ركّب",
    find: "ابحث",
    pick: "اختر",
    count: "عُدّ",
    sort: "رتّب",
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
    levelLabel: "مستوى {value}",
    levelWord: "مستوى",
    puzzleBoardAria: "لوحة البازل — {alt}",
    puzzlePieceAria: "قطعة البازل {index} من {total}",
    hintsButton: "تلميحات — شاهد الصورة الكاملة",
    theFinishedPicture: "الصورة الكاملة",
    helpButtonAria: "مساعدة — ضع قطعة في مكانها. باقي {left}",
    help: "مساعدة",
    closeHint: "إغلاق والعودة إلى البازل",
    again: "مرة أخرى",
    next: "التالي",
    secondsLeftAria: "{n} ثانية متبقية",
    cardFaceDownAria: "البطاقة {index}، مقلوبة",
  },
  trail: {
    title: "Edenic Trail",
    description:
      "طريق مغامرات يتسلّق السماء. اصعده مع Pinki و Nova و Bloo، محطة بعد محطة.",
    cta: "ابدأ مغامرتك",
    ctaContinue: "تابع",
    introHello: "مرحبًا! أنا Nova، دليلك في السماء.",
    introStart: "هيا بنا، رحلتنا تبدأ من هنا!",
    introSkip: "تخطَّ",
  },
  ui: {
    completedAria: "{label} مكتمل",
  },
};
