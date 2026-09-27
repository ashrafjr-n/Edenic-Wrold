# Edenic World — خطة تطوير قسم Learn

> وثيقة اقتراح لتحويل Learn من "أرقام وحروف" إلى منتج تعليمي حقيقي بثلاثة عوالم،
> لكل شخصية عالم. مبنية على بحث في أنجح منتجات تعليم الأطفال عالمياً وعربياً، وعلى
> قراءة دراسة "كرتنة"، وعلى ما هو مبني فعلاً في الكود.
> التاريخ: 2026-09-27

---

## 0. الخلاصة في صفحة واحدة

**المشكلة:** الطفل القادر على فتح موقع والتنقل فيه (5–9 سنوات) يعرف غالباً الأرقام 1–9
وشكل الحروف. المحتوى الحالي أصغر من جمهورنا، فيشعر الطفل أنه "للصغار" ويشعر الأهل
أنه لا يضيف شيئاً.

**الفكرة:** كل شخصية تصبح **عالَماً كاملاً** بخريطة ووحدات وقصة، لا مجرد "درس":

| الشخصية | العالم | ماذا تعلّم | الإحساس |
| --- | --- | --- | --- |
| **Pinki** | **Pinki Town** — مدينة صغيرة تبنيها بالرياضيات | الحساب السريع، الجمع والطرح، الأشكال 2D و3D، الأنماط، القيمة المكانية، القياس والوقت | "أنا أبني وأطبخ وأرتب" |
| **Nova** | **Word Sky** — سماء كلمات، كل كلمة نجمة، والنجوم تصنع قصصاً | من الأصوات إلى الكلمات، الإملاء، الكلمات البصرية، بناء الجمل، القراءة والفهم | "أنا أقرأ قصة بنفسي" |
| **Bloo** | **Bloo's Expeditions** — رحلات استكشاف حول العالم | أسماء الحيوانات وبيوتها وصغارها، الجسم، الطقس والفصول، النباتات، الفضاء، الألوان | "أنا مستكشف وعندي دفتر اكتشافاتي" |

هذا التوزيع **ليس اختراعاً جديداً**: هو ما تقوله بطاقات الشخصيات الحالية في الموقع
(Pinki: "Counts everything and finds shapes"، Nova: "Turns letters into stories"،
Bloo: "Wonders about colours, seasons and everything in the sky"). نحن فقط نفي بالوعد
الذي كتبناه.

**الميزة التي لا يملكها المنافسون:** جمهورنا طفل يتكلم العربية أو الكردية البهدينية
ويتعلم **الإنجليزية + الرياضيات + العلوم** معاً. Lingokids وKhan Kids للناطقين
بالإنجليزية. Lamsa وAdam Wa Mishmish للعربية ولأعمار أصغر (0–5). **لا يوجد منتج قوي
يأخذ طفلاً عربياً أو كردياً عمره 5–9 ويعلّمه بالإنجليزية وهو يشرح له بلغته.** هذا
هو موقعنا في السوق.

**أهم ثلاثة قرارات مقترحة:**
1. **محرك واحد لكل العوالم.** محرك جلسات Letters الموجود (`sessionFor` + مكتبة تمارين)
   هو النمط الصحيح. نعمّمه ليصبح محركاً مشتركاً، فكل عالم يصبح "بيانات + تمارين"،
   لا صفحات مكتوبة يدوياً.
2. **مكتبة قوالب تمارين (~10 قوالب) تُنتج 30+ نوع تمرين.** هي نفس فكرة "Game
   Template & Asset Library" في دراسة كرتنة، التي تقدّر أنها توفر 40–70% من وقت الإنتاج.
3. **الصوت يجب أن يدخل مبكراً.** منتج يعلّم الإنجليزية لطفل غير ناطق بها بدون صوت
   ناقص جوهرياً، فالنطق لا يُتعلَّم من نص. قرار "لا صوت في الـ MVP" كان مناسباً
   للأرقام والحروف، لكنه لا يصلح لـ Nova وBloo. (تفاصيل في §9)

---

## 1. ما الثابت وما المتغير (حسب طلبك)

**ثابت:**
- أسلوب التصميم (Claymorphism، الألوان، الخطوط، البطاقات، الأزرار) في Home وLearn.
- محتوى Home كما هو.
- فكرة Learn: ثلاث شخصيات، كل واحدة تفتح عالمها.
- Play: خارج هذه الخطة (سطر واحد عنه في §10، لأن المكتبة نفسها ستخدمه لاحقاً).

**متغير:**
- محتوى التعليم لكل شخصية بالكامل.
- البنية: من "درس = قائمة عناصر" إلى "عالم ← وحدات ← جلسات ← تمارين".
- Numbers وLetters **لا يُحذفان** بل يصبحان "وحدة البداية" (§8).

---

## 2. ماذا تعلّمنا من البحث (والقرار الذي أخذناه من كل نقطة)

### من المنتجات الرائدة

| المنتج | ما يفعله بشكل ممتاز | ماذا نأخذ |
| --- | --- | --- |
| **Khan Academy Kids** (طُوّر مع Stanford GSE) | خمس شخصيات حيوانات، **كل شخصية ترتبط بمادة**، فيعرف الطفل ذهنياً أن الموضوع تغيّر بمجرد ظهور الشخصية. مسار تعلم يتكيف مع مستوى الطفل ويدوّر المواد | نفس فكرتنا بالضبط، وهذا تأكيد أنها صحيحة: الشخصية = المادة. نأخذ أيضاً التكيف مع المستوى |
| **Duolingo ABC** | 700+ درس قصير مبني على توصيات National Reading Panel: phonics ثم sight words ثم مفردات ثم قصص تُقرأ بصوت عالٍ مع **تظليل الكلمة المقروءة**. دراسة EDC: تحسن 28% في 9 أسابيع | تسلسل Nova (§5) وقصص بكلمة مظللة |
| **Teach Your Monster to Read** (مع جامعة Roehampton) | الطفل يعلّم **وحشاً** القراءة. خريطة جزر، وكل جزيرة ألعاب مصغرة | فكرة "أنت تساعد الشخصية" بدل "أنت تُختبر"، والخريطة الجزرية |
| **Endless Reader** (Originator) | كل كلمة **تتحرك وتعيش**: "up" تصعد و"dog" تنبح. لا نقاط ولا فشل ولا ضغط | كل كلمة في Nova لها حركة clay صغيرة تشرح معناها |
| **DragonBox Numbers** | الأرقام شخصيات (Nooms) تُكدّس وتُقطع وتُدمج، مستوحاة من Cuisenaire وMontessori. الطفل **يفهم** العدد ولا يحفظه | أدوات Pinki الملموسة: ten-frame، كتل تُفكّ وتُركّب، ميزان |
| **Numberblocks** (BBC، مع NCETM) | يُعتبر أدق مصدر فيديو لحس الأعداد: subitizing (معرفة الكمية بلمحة بلا عدّ)، التركيب والتفكيك، القيمة المكانية | وحدة Pinki الأولى: "Quick Look"، أي معرفة الكمية بلمحة |
| **Prodigy Math** | خريطة عالم ومهمات، وخوارزمية تُبقي الطفل في **منطقة النمو القريبة (ZPD)**: إذا تعثّر تعيده لمهارة سابقة | التكيف في §7: التراجع التلقائي لمهارة أسهل |
| **Lingokids** (محتوى Oxford University Press) | مفردات مقسمة بمواضيع (حيوانات أليفة، برية، بحرية، حشرات، مزرعة، طقس، أشكال) مع أغانٍ وحركة | قائمة مفردات Bloo مقسمة بنفس الأسلوب |
| **Wild Kratts / Octonauts** | الحيوان بطل وليس معلومة: "creature powers" أي قدرات الحيوان الحقيقية كقوى خارقة. الأطفال يأتون للمدرسة بمعلومة جديدة كل يوم | "Bloo's Big Fact": معلومة مدهشة واحدة لكل حيوان |
| **BrainPOP Jr.** (K–3) | كل موضوع علمي يبدأ بفيديو قصير مع شخصيتين ثابتتين، ثم نشاط واختبار | نموذج "Reel ← تمارين ← تحدٍّ" لكل وحدة |
| **HOMER** | مسار قراءة شخصي: حروف ← دمج ← كلمات بصرية ← طلاقة ← فهم. 15 دقيقة يومياً (الشركة تذكر تحسناً بنسبة 74%) | طول الجلسة المستهدف: 10–15 دقيقة |
| **Adam Wa Mishmish / Lamsa** | أقوى الأسماء عربياً. Adam Wa Mishmish يقوم على الموسيقى ويستهدف 0–5 سنوات بـ 2–5 دقائق يومياً | يؤكد أن الفئة 5–9 التي تتعلم **بالإنجليزية** غير مخدومة عربياً |

### من الأبحاث

1. **الأعمدة الأربعة (Hirsh-Pasek وزملاؤها، 2015):** التطبيق التعليمي الحقيقي
   **نشط** (يتطلب تفكيراً لا مجرد نقر)، و**مُنخرط** (المؤثرات تخدم التعلم لا تشتت)،
   و**ذو معنى** (مرتبط بحياة الطفل)، و**تفاعلي اجتماعياً** (شخصية تستجيب لاختياراته).
   ← كل تمرين في الخطة يجب أن يمرّ على هذه الأعمدة الأربعة. هذا معيار القبول (§11).
2. **التغذية الراجعة في ألعاب الأطفال:** مراجعة لألعاب ما قبل المدرسة وجدت أن معظمها
   يقول فقط "صح/خطأ"، وقليل منها يعطي **تغذية راجعة تشرح وتوجّه**، وهي النوع الذي
   يحسّن التعلم فعلاً. ← نظام التلميح المتدرج في §7.
3. **الاسترجاع المتباعد (Spaced Retrieval):** يحسّن حفظ الكلمات والحقائق عند أطفال
   4–8 سنوات لأسابيع. لكن الأصغر سناً يحتاجون **سقالات** (مساعدة) أثناء الاسترجاع.
   ← "Daily Mix" في §7 مع تلميحات.
4. **الحساب السريع:** أبحاث Jo Boaler (Stanford) تُظهر أن الاختبارات المؤقّتة تسبب
   قلق الرياضيات وتعطّل الذاكرة العاملة. الطلاقة تنمو من **الاستراتيجيات** (make ten،
   doubles) لا من الحفظ. ← "Quick Sums" بلا مؤقت افتراضياً، والتحدي المؤقت اختياري.
5. **PBS KIDS Ready To Learn (EDC وSRI):** الفيديو + اللعبة + نشاط حقيقي معاً أعطى
   تحسناً كبيراً، والتقنية وحدها بلا ربط لم تُعطِ نفس النتيجة. والأطفال **لا يدركون**
   ما يتعلمونه في اللعبة إلا إذا ذُكِر لهم. ← كل وحدة تبدأ بـ Reel وتنتهي بجملة
   "اليوم تعلمت…" ونشاط في البيت للأهل.
6. **طول الفيديو:** التوصية الشائعة للأطفال الصغار 3–7 دقائق وفكرة واحدة لكل فيديو.
   ← الـ Reels عندنا 30–90 ثانية (فكرة واحدة)، وحلقة القصة 3–5 دقائق.
7. **الأنماط المظلمة (Dark Patterns):** سلاسل الأيام في Duolingo تعتمد على الخوف من
   الخسارة، وهذا عند الأطفال يسبب ضغطاً، ويجعلهم يلعبون أقصر تمرين فقط للحفاظ على
   السلسلة. مبادئ 5Rights تحذّر من ذلك. ← **لا streak عقابي، لا عدّاد طاقة، لا
   مؤقتات إجبارية** (§7).

### من دراسة "كرتنة" (أفكار فقط)

**نأخذ:**
- **الدراما والقصة:** الطفل يتذكر المعلومة المربوطة بقصة. ← كل وحدة لها حبكة صغيرة،
  والشخصيات المساعدة (الحيوانات والنجوم من الفيديوهات) أبطال ثانويون فيها.
- **"لعبة عند انخفاض التركيز":** الذكاء الاصطناعي عندهم يطلق لعبة عندما يتشتت الطفل.
  ← نسخة بسيطة ذكية عندنا: بعد خطأين متتاليين أو 6 تمارين متواصلة تأتي **Brain Break**،
  لعبة مصغرة 30 ثانية من نفس المحتوى (§7). بدون كاميرا ولا تحليل سلوك.
- **مكتبة قوالب وأصول مشتركة:** قلب خطتنا التقنية (§9).
- **تقارير للأهل** (يومية/أسبوعية): نسخة خفيفة لاحقاً مع الحسابات.
- **الاختبارات الدورية المفاجئة القصيرة:** "Daily Mix".
- **الأمان:** لا إعلانات، لا شراء داخل التطبيق، لا دردشة.
- **Playtests مع أطفال حقيقيين كل 2–3 أسابيع.**

**لا نأخذ (ولماذا):**
- الذكاء الاصطناعي المرافق وتحليل الحالة النفسية وتنبيهات السلوك للأهل: مكلف جداً
  (بنيتهم 5 ملايين دولار سنوياً للسحابة فقط)، ويحمل مخاطر خصوصية وقانونية مع أطفال،
  وخارج حجمنا.
- بطاقة الهوية وGPS والإعلانات: لا علاقة لها بمنتج تعليمي نظيف.
- "100 لعبة منفصلة": الأذكى 10 قوالب تنتج مئات التمارين.

---

## 3. البنية الجديدة لـ Learn

```
/learn                        ← اختيار الصديق (ثابت كما هو)
 └─ /learn/pinki              ← خريطة عالم Pinki Town (بدل قائمة الدروس)
     └─ Unit (حيّ/جزيرة/رحلة)  ← 4–6 جلسات + Reel افتتاحي + تحدٍّ ختامي + مكافأة
         └─ Session (جلسة)    ← 8–12 تمريناً، 5–8 دقائق، تُوزّع بالمحرك
             └─ Exercise      ← من مكتبة القوالب المشتركة
```

**شكل كل وحدة:**
1. **Reel** (30–90 ثانية): الشخصية تقدّم الفكرة، مع وقفات تفاعلية داخل الفيديو
   ("كم بطة ترى؟" ثم يُكمل الفيديو).
2. **4–6 جلسات:** كل جلسة تمارين من قوالب مختلفة، تبدأ سهلة وتصعب، وفيها 20–30%
   مراجعة من وحدات سابقة (المحرك الحالي يفعل هذا في Letters أصلاً).
3. **Challenge (تحدٍّ ختامي):** "الزعيم" اللطيف للوحدة. مثال: "Pinki's bakery opens
   today — fill 5 orders!". النجاح يفتح الوحدة التالية.
4. **مكافأة ذات معنى:** شيء **يُبنى ويبقى** (مبنى في المدينة، كوكبة في السماء، بطاقة
   حيوان في الدفتر)، لا نقاط مجردة.
5. **"اليوم تعلمت"** + نشاط للبيت (سطر للأهل: "اطلب من طفلك أن يعدّ الملاعق وهو
   يرتب المائدة").

**مستويات الأعمار داخل كل عالم** (نفس الخريطة ومسارات أعمق):
- 🌱 **Explorer** (5–6)، 🌿 **Adventurer** (6–7)، 🌳 **Champion** (8–9).
- اختبار تحديد المستوى (§7) يضع الطفل في مكانه، فلا يبدأ ابن الثامنة من "1 + 1".

---

## 4. عالم Pinki — Pinki Town 🏙️ (الرياضيات والأشكال)

**القصة:** Pinki انتقلت لمدينة فارغة وتريد بناءها. كل وحدة **مكان في المدينة**، وكل
وحدة تُنجز تُبنى في الخريطة: المخبز يفتح، الحديقة تزهر، القطار يمشي. في النهاية
مدينة كاملة بناها الطفل بالرياضيات. (Hirsh-Pasek: معنى + ارتباط بالحياة اليومية)

**الشخصيات المساعدة المقترحة:** Chef Bear في المخبز، Builder Beaver في موقع البناء،
Train Mouse في المحطة، Owl ساعاتي في برج الساعة.

### الوحدات (مرتبة بالتسلسل ومتوافقة مع Common Core K–2 وCambridge Primary 1–2)

| # | المكان | المهارة | مستوى | أمثلة تمارين |
| --- | --- | --- | --- | --- |
| 0 | **Pinki's House** | الأعداد 1–20 (وحدة البداية، تحتوي Numbers الحالي) | 🌱 | الموجود + تخطٍّ تلقائي لمن يعرف |
| 1 | **The Market** | Quick Look: معرفة الكمية بلمحة (نقاط، ten-frame، أصابع)، أكثر/أقل | 🌱 | ومضة ثانية واحدة ثم "كم رأيت؟"، أيهما أكثر؟ |
| 2 | **The Bakery** 🧁 | **Make 10**: أزواج العدد 10 (number bonds) | 🌱🌿 | علبة الكب كيك فيها 10 أماكن: "فيها 7، كم نضيف؟" |
| 3 | **Candy Shop** 🍬 | **الجمع حتى 10 ثم 20**: count on، doubles، make ten | 🌿 | Quick Sums، Balance، Number Line Hop |
| 4 | **The Picnic** 🧺 | **الطرح**: "take away"، العدد الناقص | 🌿 | "كان 9 كعكات، أكل الدب 3" |
| 5 | **Shape Park** 🔺 | **الأشكال 2D**: دائرة، مربع، مثلث، مستطيل، بيضاوي، نجمة، قلب، معين، خماسي، سداسي، وخصائصها (أضلاع، زوايا) | 🌱🌿 | Shape Detective بصور حقيقية، عدّ الأضلاع، Tangram |
| 6 | **Building Site** 🏗️ | **الأشكال 3D**: cube، sphere، cone، cylinder، pyramid وأشياء حقيقية تشبهها | 🌿 | "أي شكل هذه العلبة؟"، ابنِ برجاً |
| 7 | **The Garden** 🌷 | **الأنماط والتصنيف** (تفكير منطقي) | 🌱🌿 | أكمل النمط، ضع الغريب خارجاً، رتّب حسب قاعدتين |
| 8 | **Train Station** 🚂 | **العشرات والآحاد** حتى 100 | 🌿🌳 | حزم أعواد من 10، "كم عربة من 10؟" |
| 9 | **Clock Tower** 🕰️ | **الوقت**: o'clock وhalf past | 🌳 | حرّك العقارب، "متى يذهب Pinki للنوم؟" |
| 10 | **Toy Workshop** 📏 | **القياس والمقارنة**: أطول/أقصر، أثقل/أخف، القياس بوحدات | 🌿🌳 | قِس القلم بالمشابك، الميزان |
| 11 | **Town Hall** 🏛️ | **مسائل قصصية** (تتقاطع مع Nova: قراءة + حساب) | 🌳 | مسألة من جملتين مع صورة |
| 12 | **Pinki's Party** 🎉 | **الجمع والطرح حتى 100** والضرب كجمع متكرر (مقدمة) | 🌳 | مجموعات متساوية: "3 صحون في كل صحن 4 كعكات" |

### تمارين Pinki المميزة
- **Quick Sums:** معادلات سريعة (3 + 4 = ?) بأربعة خيارات كبيرة، **بلا مؤقت**. بعد
  الإتقان يظهر وضع اختياري "Beat Pinki!" بسباق ودّي مع Pinki.
- **Balance Scale ⚖️:** الميزان يجب أن يتوازن: `3 + ? = 7`. هذا أساس التفكير الجبري
  مبكراً، وملموس جداً بأسلوب clay.
- **Ten Frame:** املأ الإطار بالعناصر، ومنه تُفهم أزواج العدد 10.
- **Number Line Hop:** الأرنب يقفز على خط الأعداد، فيصبح الجمع والطرح "قفزات".
- **Shape Detective 🔍:** صورة حقيقية (نافذة، بيتزا، إشارة مرور) و"أين المثلث؟".
- **Shape Builder / Tangram:** ركّب شكلاً من قطع (يستفيد من محرك Puzzle الموجود).
- **Break Apart:** كتلة الـ 7 تُقطع إلى 5 و2 أو 4 و3 (فكرة DragonBox).
- **Order Fill:** "الزبون يريد 8 كعكات" فيسحب الطفل العدد الصحيح. عدّ ذو معنى.

---

## 5. عالم Nova — Word Sky ✨ (الكلمات والقراءة والإملاء)

**القصة:** السماء فقدت نجومها، وكل **كلمة يتعلمها الطفل تعود نجمة**. كل وحدة
**كوكبة (constellation)**، وعندما تكتمل ترسم صورة (قطة، مركب، شجرة) وتنفتح **قصة
Nova** لتلك الكوكبة، قصة قصيرة يقرؤها الطفل بنفسه بالكلمات التي تعلمها. هذا يطابق
وصف Nova الحالي: "Turns letters into stories".

**الشخصيات المساعدة:** النجوم الصغيرة من الفيديوهات (كل نجمة تحمل صوتاً: star "sh"،
star "ch")، وبومة القصص Story Owl.

### التسلسل (Science of Reading مكيّف للطفل غير الناطق بالإنجليزية)

المبدأ: **الصوت ← الحرف ← دمج الكلمة ← الكلمات البصرية ← الجملة ← القصة**. نبدأ
بالمفردات المصورة لأن الطفل العربي/الكردي يحتاج أن يعرف **معنى** الكلمة قبل أن يقرأها.

| # | الكوكبة | المهارة | مستوى | المحتوى |
| --- | --- | --- | --- | --- |
| 0 | **Alphabet Stars** | الحروف (وحدة البداية، تحتوي Letters الحالي بخريطته وكتاب الأبجدية) | 🌱 | الموجود |
| 1 | **First Words** | مفردات مصورة بمواضيع Cambridge Pre A1 Starters: family، toys، food، clothes، home، school | 🌱 | ~120 كلمة، صورة + كلمة + ترجمة عند الطلب |
| 2 | **Sound Slide** 🛝 | **دمج CVC**: c-a-t = cat، بالتسلسل الموصى به: a ثم i ثم o ثم u ثم e | 🌱🌿 | الحروف تنزلق على زحليقة وتلتصق |
| 3 | **Word Families** 🏠 | عائلات الكلمات: -at، -an، -ig، -op، -ug، -en، -et | 🌿 | بيت "at": cat، hat، bat، mat |
| 4 | **Star Words** ⭐ | الكلمات البصرية: قائمة Dolch pre-primer (40 كلمة: the، is، I، can، see، a، my، go…) ثم primer | 🌿 | Word Pop، Find it fast |
| 5 | **Build a Sentence** 🚂 | ترتيب الكلمات في جملة: "I see a cat."، جملة وصورة، النقطة والحرف الكبير | 🌿 | قطار الجمل: كل كلمة عربة |
| 6 | **Action Words** 🏃 | الأفعال (run، jump، eat، sleep، swim) مع Reel حركي، و is/are | 🌿 | "The cat is ___." |
| 7 | **Spelling Bee** 🐝 | الإملاء: صورة ← تهجئة بالبلاطات (قالب `word-build` الموجود) ثم الحرف الناقص ثم تهجئة كاملة | 🌿🌳 | تدرّج بثلاثة مستويات من المساعدة |
| 8 | **Opposites & Friends** | الأضداد (big/small، hot/cold)، الجمع (cat ← cats)، الصفات | 🌿🌳 | اسحب الضد |
| 9 | **Twin Sounds** | digraphs: sh، ch، th، ck، ee، oo | 🌳 | ship، chip، this، duck، tree، moon |
| 10 | **Magic E** ✨ | الحرف الصامت e: cap ← cape، kit ← kite | 🌳 | نجمة سحرية تغيّر الكلمة وتتحرك الصورة |
| 11 | **Story Nights** 📖 | قصص قصيرة decodable (4–6 صفحات) عن الأصدقاء الثلاثة + سؤالا فهم | 🌿🌳 | الكلمة المقروءة تُظلَّل، والنقر على كلمة يشرحها |
| 12 | **Little Writer** ✍️ | كتابة جملة عن صورة باختيار الكلمات (ثم كتابة حرة للكبار) | 🌳 | "Write about your pet" بكلمات مقترحة |

### تمارين Nova المميزة
- **Living Words:** كل كلمة جديدة تظهر وتتحرك حسب معناها (up تصعد، jump تقفز، big
  تكبر). فكرة Endless Reader بأسلوبنا clay وبـ CSS keyframes فقط.
- **Sound Slide:** دمج الأصوات بسحب الإصبع على الحروف ببطء ثم بسرعة. هذه أهم مهارة
  قراءة، ولا تعمل حقاً بدون صوت (§9).
- **Sentence Train 🚂:** العربات تحمل الكلمات، والطفل يرتبها لتمشي القطار. (فنّ القطار
  موجود في صور Puzzle.)
- **Word or Not?:** هل "cat" كلمة؟ هل "tac" كلمة؟ تمييز سريع ممتع.
- **Picture ↔ Sentence:** 3 صور وجملة واحدة، أي صورة تطابق "The dog is on the bed"؟
  تدريب فهم حقيقي لحروف الجر والتفاصيل.
- **Missing Letter:** c_t مع 3 خيارات.
- **Bridge Button 🌉 (خاص بنا):** زر صغير يترجم الكلمة للعربية/الكردية حسب لغة
  الواجهة. **هذه الميزة التي لا يملكها أي منافس.** لا تظهر الترجمة تلقائياً، الطفل يطلبها،
  والمحرك يسجل إن كان يعتمد عليها ليكرر الكلمة لاحقاً.

---

## 6. عالم Bloo — Bloo's Expeditions 🧭 (العالم والعلوم والحيوانات)

**القصة:** Bloo مستكشف معه **دفتر رحلات (Field Journal)** فارغ. كل وحدة **رحلة** إلى
مكان في العالم، وكل حيوان أو شيء يكتشفه الطفل يصبح **بطاقة clay** في الدفتر (الوجه:
الصورة والاسم، والظهر: 3 معلومات و"Big Fact" مدهشة). جمع البطاقات ممتع جداً في هذا
العمر، وهو هنا مكافأة **مرتبطة بالتعلم** (Kartana #46 Sticker Album، وWild Kratts).

**الشخصيات المساعدة:** الحيوانات من الفيديوهات، كل رحلة لها مرشد حيوان (Camel في
الصحراء، Turtle في المحيط، Eagle في الجبال).

### الرحلات (مفردات Cambridge Starters + علوم BrainPOP Jr. K–2)

| # | الرحلة | المحتوى | مستوى |
| --- | --- | --- | --- |
| 1 | **The Farm** 🐄 | حيوانات المزرعة (cow، sheep، goat، hen، horse، duck)، صغارها (calf، lamb، chick)، ماذا تعطينا (milk، eggs، wool) | 🌱 |
| 2 | **The Jungle & Savanna** 🦁 | lion، elephant، giraffe، monkey، zebra، tiger، hippo، crocodile | 🌱🌿 |
| 3 | **Under the Sea** 🐠 | fish، whale، shark، octopus، turtle، crab، starfish، dolphin | 🌱🌿 |
| 4 | **Desert & Mountains** 🏜️⛰️ | **حيوانات منطقتنا**: camel، falcon، fox، lizard، mountain goat، bear، eagle، wolf | 🌿 |
| 5 | **Tiny Creatures** 🐞 | bee، ant، butterfly، ladybird، spider، snail، ودورة حياة الفراشة | 🌿 |
| 6 | **Birds of the Sky** 🦅 | أنواع الطيور، الأعشاش، البيض، الطيران | 🌿 |
| 7 | **My Body** 🧍 | أجزاء الجسم، الحواس الخمس، عادات صحية (أسنان، نوم، ماء) | 🌱🌿 |
| 8 | **Food & Plants** 🍎🌱 | فواكه وخضار، كيف تنمو البذرة، أجزاء النبات، صحي/أحياناً | 🌿 |
| 9 | **Weather & Seasons** ☀️🌧️ | sunny، rainy، windy، snowy، cloudy، الفصول الأربعة، ماذا نلبس | 🌱🌿 |
| 10 | **Colours of the World** 🎨 | الألوان ومزجها (درس Colors المقفل ينتقل إلى هنا) | 🌱 |
| 11 | **Day, Night & Space** 🌙🪐 | الشمس والقمر والنجوم، النهار والليل، الكواكب | 🌿🌳 |
| 12 | **Habitats & Homes** 🏡 | من يعيش أين (مراجعة كبرى): الغابة، المحيط، الصحراء، القطب | 🌳 |
| 13 | **Animal Superpowers** ⚡ | التكيف: لماذا للجمل سنام؟ لماذا الدب القطبي أبيض؟ | 🌳 |

### تمارين Bloo المميزة
- **Who Am I? 🕵️:** 3 أدلة تظهر واحداً تلو الآخر ("I am big. I am grey. I have a long
  nose.")، وكلما خمّن الطفل أبكر نال نجوماً أكثر. قراءة + علوم معاً (تقاطع مع Nova).
- **Zoom Reveal 🔍:** صورة مقربة جداً (جلد زرافة) تتسع تدريجياً: من هذا؟
- **Habitat Sort:** اسحب كل حيوان إلى بيته (بحر، مزرعة، غابة).
- **Mama & Baby:** طابق الأم مع صغيرها (cow ← calf). قالب Memory Match موجود.
- **Shadow Guess:** ظل الحيوان وثلاث صور.
- **Life Cycle:** رتّب المراحل (egg ← caterpillar ← cocoon ← butterfly).
- **Dress for the Weather 🧥:** الطقس في الصورة ماطر، فماذا يلبس Bloo؟
- **True or False, Bloo's Big Fact 🤯:** "Octopuses have three hearts. True or false?"،
  والجواب يأتي مع حركة مدهشة.
- **Count the Herd:** "كم زرافة في الصورة؟" (تقاطع مع Pinki).

---

## 7. النظام المشترك الذي يجعلها "منتجاً" لا مجموعة دروس

### 7.1 اختبار تحديد المستوى — "Show me what you know!"
أول دخول لكل عالم: 2–3 دقائق، 8–10 أسئلة تتدرج صعوبتها، مقدمة كلعبة مع الشخصية وليست
امتحاناً. يضع الطفل في الوحدة المناسبة ويفتح ما قبلها كـ "مكتمل". **يحل مشكلة "أصغر
من عمر الطفل" من جذورها.**

### 7.2 الإتقان والتكيف (مثل Prodigy وKhan Kids، بدون خادم)
- لكل **مهارة** (لا لكل وحدة) مستوى إتقان من 0 إلى 3، يُحفظ في `localStorage` كما
  يُحفظ التقدم الآن.
- **الترقية:** 3 إجابات صحيحة من أول محاولة في جلستين مختلفتين.
- **التراجع:** خطآن في نفس المهارة داخل الجلسة يجعلان المحرك يدخل تمريناً أسهل
  لنفس المهارة (وضع ZPD).
- **سقف الصعوبة داخل التمرين:** نفس القالب بثلاث درجات (خياران ← 3 ← 4 خيارات، أو
  أعداد حتى 10 ← حتى 20).

### 7.3 Daily Mix — مراجعة متباعدة من العوالم الثلاثة
زر كبير في `/learn`: "Today's Mix with Pinki, Nova & Bloo". خمس دقائق، 10 تمارين
مسحوبة مما تعلّمه الطفل حسب **صناديق Leitner** (ما أخطأ فيه يعود بعد يوم، وما أتقنه
بعد 3 ثم 7 ثم 14 يوماً). هذا ما يجعل الطفل **يتذكر** بعد أسبوع، لا ما حفظه اليوم فقط.

### 7.4 التغذية الراجعة المتدرجة (لا "خطأ" أبداً)
- **المحاولة الأولى خطأ:** الشخصية تعطي **تلميحاً يشرح** ("Count the corners with
  me!")، لا "حاول مجدداً" فقط.
- **الثانية خطأ:** يُزال خيار خاطئ (تضييق).
- **الثالثة:** الشخصية **تُري** الحل خطوة بخطوة، ثم تُعاد نفس الفكرة بأرقام أخرى
  لاحقاً في الجلسة.
- **صح:** احتفال قصير + **سبب**: "Yes! A triangle has 3 sides."

### 7.5 Brain Break (مستوحى من كرتنة، بدون كاميرا)
بعد 6 تمارين متواصلة، أو خطأين متتاليين، تظهر لعبة 20–30 ثانية من **نفس المحتوى**
بشكل حركي: فرقعة بالونات، التقاط نجوم ساقطة. تغيّر الإيقاع وتعيد التركيز. (قالب
البالونات موجود في Numbers.)

### 7.6 المكافآت: تُبنى ولا تُخسر
- **نجوم** لكل جلسة (1–3).
- **مكافأة العالم:** مبانٍ في Pinki Town، كوكبات في Word Sky، بطاقات في Field Journal.
- **هدف أسبوعي لطيف** ("5 أيام هذا الأسبوع 🌟") بدلاً من streak يومي يُكسر، فلا خوف من
  الخسارة (5Rights).
- **لا** طاقة، **لا** قلوب تنفد، **لا** مؤقت إجباري، **لا** شراء.

### 7.7 وقت صحي
إعداد للأهل (لاحقاً): مدة يومية (افتراضياً 20 دقيقة). عند انتهائها: "Pinki is sleepy!
Let's play outside and come back tomorrow 💤"، مع حفظ مكان الطفل. هذا يحقق ما تعد به
كرتنة (توازن الشاشة) بطريقة بسيطة ومحترمة.

### 7.8 الـ Reels (الفيديوهات القصيرة)
ذكرتَ أن عندكم فيديوهات Reels لأي موضوع تعليمي، وهذا أصل ضخم:
- **داخل الوحدة:** Reel افتتاحي لكل وحدة، مع **وقفات تفاعلية** بالطوابع الزمنية
  (الفيديو يتوقف، يظهر سؤال، يكمل). بحث PBS: الفيديو مع التفاعل أقوى من الفيديو وحده.
- **مكتبة Reels لكل شخصية:** تبويب "Watch" داخل كل عالم، الفيديوهات مرتبة حسب الوحدة،
  و**تُفتح فقط بعد وصول الطفل للوحدة** (تشويق + لا مشاهدة عشوائية لا نهائية).
- **بلا autoplay لا نهائي:** بعد 3 Reels متتالية: "Let's play what we watched!"
  ويُنقل الطفل لتمرين. الفيديو يخدم التعلم ولا يستبدله.
- **مطلوب من فريق الفيديو:** قائمة الـ Reels الحالية مع موضوع كل واحد ومدته، لربطها
  بالوحدات. (أول مهمة في §12.)

### 7.9 التقاطعات بين العوالم (يجعلها عالماً واحداً)
- **مسائل قصصية** = قراءة Nova + حساب Pinki.
- **Who Am I?** = قراءة Nova + معلومات Bloo.
- **Count the Herd** = حيوانات Bloo + عدّ Pinki.
- **حلقة قصة شهرية "The Three Friends"** (3–5 دقائق): الأصدقاء الثلاثة في مغامرة
  تستخدم ما تعلمه الطفل في العوالم الثلاثة.

---

## 8. ماذا نفعل بـ Numbers وLetters الحاليين؟

**لا نحذف شيئاً. نعيد التموضع:**
- **Numbers** يصبح **Unit 0 "Pinki's House"** في Pinki Town.
- **Letters** (الخريطة والجلسات والتحديات وكتاب الأبجدية) **ينتقل إلى Nova** ويصبح
  **"Alphabet Stars"**، وحدة البداية في Word Sky. يناسب وصف Nova أكثر، والقرار الأخير
  في `letters-lesson.md` كان "لون Pinki الوردي لا لون المادة"، **فهذا الانتقال يحتاج
  موافقتك** لأنه يغيّر لون الدرس.
- **Colors** (المقفل عند Pinki) ينتقل إلى Bloo: "Colours of the World".
- **اختبار المستوى** يتخطى وحدة البداية لمن يعرفها، فيبقى العمل السابق مفيداً لـ 5
  سنوات ولمن يحتاج تقوية، ولا يُفرض على ابن الثامنة.

---

## 9. الخطة التقنية (مبنية على الكود الموجود)

### 9.1 محرك جلسات مشترك
الموجود: `src/lib/letter-session.ts` فيه `LetterStep` (union من أنواع التمارين)
و`sessionFor` الذي يوزّع جلسة من مكتبة، مع خلط ببذرة seeded (بدون `Math.random`،
صالح للـ Server Components). **هذا هو النمط الصحيح.**

المقترح:
- تعميم `LetterStep` إلى `Exercise` (union واحد لكل العوالم) و`sessionFor(world,
  unit, progress)`.
- كل عالم = **ملف بيانات** (`data/worlds/pinki.ts` …): الوحدات، المهارات، المفردات،
  والتمارين المسموحة لكل وحدة.
- التقدم: توسيع `lib/progress-keys.ts` ليشمل الإتقان لكل مهارة وصناديق Leitner.
- Numbers الحالي (آلة 7 مراحل) **يبقى كما هو** كوحدة 0، ولا نعيد كتابته الآن.

### 9.2 مكتبة القوالب (~10 قوالب تنتج كل التمارين)

| القالب | ينتج تمارين | موجود جزئياً؟ |
| --- | --- | --- |
| **Choice** (صورة/كلمة/رقم/شكل: أربعة خيارات) | Quick Sums، Find، Picture↔Sentence، Shadow، True/False، Who Am I | ✅ `letter-find`، `question-panel` |
| **Build** (بلاطات إلى خانات) | Spelling، Missing Letter، Sentence Train، Missing Number | ✅ `word-build` |
| **Match** (أزواج) | Mama & Baby، Word↔Picture، Number bonds، Rhymes | ✅ `case-match`، Memory Match |
| **Sort** (اسحب إلى سلال) | Habitat Sort، Shape sort، Healthy food، Odd one out | ❌ جديد |
| **Order** (رتّب تسلسلاً) | Life Cycle، Number order، Story order، Patterns | ❌ جديد |
| **Count / Fill** (املأ حتى العدد) | Ten Frame، Order Fill، Count the Herd | ✅ مرحلة count في Numbers |
| **Trace** (تتبّع بالإصبع) | الحروف، الأرقام، رسم الأشكال | ✅ لوح Pointer Events |
| **Pop** (بالونات/فقاعات) | Brain Break، Word Pop، Star Words | ✅ `letter-bubbles`، بالونات Numbers |
| **Scale / Line** (ميزان، خط أعداد) | Balance، Number Line Hop | ❌ جديد |
| **Reel + Pause** (فيديو بوقفات) | افتتاح كل وحدة | ✅ مرحلة `discover` / `letter-watch` |
| **Story Reader** (صفحات + كلمة مظللة) | Story Nights | ❌ جديد (يحتاج صوتاً للتظليل المتزامن) |

**النتيجة:** 6 قوالب من 11 موجودة جزئياً. الجديد فعلياً 4–5 قوالب فقط. هذا ما يجعل
الخطة **قابلة للتنفيذ** بفريق صغير.

### 9.3 الصوت (قرار يجب اتخاذه الآن)
- Pinki (الرياضيات) تعمل بدون صوت بشكل مقبول.
- **Nova وBloo لا تعملان بدون صوت كمنتج جدي:** الطفل العربي/الكردي لا يعرف كيف تُنطق
  "giraffe" أو "the"، والدمج الصوتي (Sound Slide) مستحيل بدون صوت، والتظليل في القصص
  يحتاج صوتاً متزامناً.
- **الاقتراح:** نقل الصوت من "بعد الـ MVP" إلى **المرحلة 1**. الخانة جاهزة
  (`SayItButton` و`TODO(audio)` و`CueButton` في Letters مصممة لهذا)، والمكتبة محددة
  (howler.js). المطلوب: تسجيل صوتي بشري لكل كلمة وجملة (أو TTS عالي الجودة كبداية
  مؤقتة، مع مراجعة بشرية).
- الميكروفون (تقييم نطق الطفل): **لا**، كما تقرر سابقاً (خصوصية + تعقيد).

### 9.4 الأصول البصرية
- كل مفردة تحتاج صورة clay بنفس أسلوب الشخصيات: ~120 (First Words) + ~100 حيوان + ~40
  شكلاً وشيئاً. **مكتبة أصول مشتركة** تُستخدم في كل العوالم وفي Play لاحقاً.
- حتى تجهز الصور: emoji بديلاً مؤقتاً (كما في Letters الآن)، مع إبقاء بنية البيانات
  جاهزة للصورة.

---

## 10. سطر واحد عن Play
لعبة Play الكبيرة بخريطتها (كما وصفتها) تستطيع لاحقاً **استخدام نفس مكتبة القوالب
ونفس المحتوى** كمراحل، فكل ما يُبنى لـ Learn الآن يُبنى مرة واحدة لكليهما.

---

## 11. معايير الجودة لكل تمرين (قائمة القبول)

قبل أن يُعتمد أي تمرين أو وحدة:
- [ ] **نشط:** يتطلب تفكيراً، لا نقراً عشوائياً؟
- [ ] **ذو معنى:** مربوط بقصة أو بحياة الطفل؟
- [ ] **تفاعلي:** الشخصية تتكلم قبله وأثناءه وبعده؟
- [ ] **تغذية راجعة تشرح** (لا "صح/خطأ" فقط)؟
- [ ] يعمل على الهاتف باللمس، بأهداف كبيرة (44px على الأقل)؟
- [ ] التعليمات مترجمة للغات الثلاث، والمحتوى المُعلَّم بالإنجليزية؟
- [ ] لا `Math.random` (توزيع seeded)؟
- [ ] مجرّب مع طفل حقيقي واحد على الأقل من الفئة العمرية؟

---

## 12. خارطة الطريق المقترحة

> المبدأ: **شريحة عمودية أولاً.** وحدة واحدة كاملة ومصقولة لكل شخصية، مجرّبة مع
> أطفال، أفضل من 12 وحدة نصف جاهزة.

**المرحلة 0 — الأساس (2–3 أسابيع)**
- جرد الـ Reels الموجودة وربطها بالوحدات.
- قرار الصوت ونقل Letters.
- المحرك المشترك + بنية بيانات العوالم + تقدم المهارات.
- خريطة العالم (نسخة عامة تُلبس لكل شخصية، مبنية على نمط خريطة Letters الموجودة).

**المرحلة 1 — شريحة عمودية (4–6 أسابيع)**
- Pinki: **The Bakery (Make 10)** كاملة.
- Nova: **First Words + Sound Slide**.
- Bloo: **The Farm** مع Field Journal.
- القوالب الجديدة: Sort، Order، Scale.
- اختبار مستوى بسيط + تغذية راجعة متدرجة.
- **Playtest مع 5–8 أطفال** (5–9 سنوات) وتعديل.

**المرحلة 2 — التوسع (2–3 أشهر)**
- 4 وحدات إضافية لكل عالم، Daily Mix، Brain Break، مكتبة Reels لكل شخصية.
- Playtest كل 2–3 أسابيع.

**المرحلة 3 — العمق (3+ أشهر)**
- باقي الوحدات، Story Nights، مستوى Champion، حلقات "The Three Friends".

**المرحلة 4 — الحسابات والأهل** (عندما يتقرر وجود حسابات)
- مزامنة التقدم، تقرير أسبوعي للأهل، إعداد الوقت اليومي.

---

## 13. كيف نقيس النجاح

| المقياس | الهدف المبدئي |
| --- | --- |
| نسبة إكمال الجلسة بعد بدئها | > 80% |
| دقة المحاولة الأولى في المراجعة بعد 7 أيام | > 70% (دليل تذكّر حقيقي) |
| عودة الطفل خلال 7 أيام | > 40% |
| الوقت حتى إتقان مهارة | ينخفض مع تحسين التمارين |
| ملاحظات Playtest: "ممل/صعب/سهل جداً" | تُراجَع كل جولة |

(قياس بسيط محلياً أولاً، وتحليلات مجهولة الهوية لاحقاً بموافقة الأهل.)

---

## 14. قرارات مطلوبة من الإدارة

1. **الفئة العمرية المستهدفة رسمياً:** 5–9؟ (الخطة مبنية على ذلك)
2. **المرجع المنهجي:** Cambridge Pre A1 Starters + Common Core K–2 (الأقوى عالمياً)،
   أم التوافق مع منهج Sunrise الذي تعتمده وزارة تربية إقليم كردستان منذ 2007 للصفوف
   الأولى (ميزة تسويقية للمدارس المحلية)؟ يمكن الجمع: Cambridge أساساً وجدول توافق
   مع Sunrise.
3. **الصوت في المرحلة 1:** نعم أم لا؟ (توصيتي: نعم)
4. **نقل Letters إلى Nova وColors إلى Bloo:** موافقة؟
5. **قدرة فريق الفيديو والرسم:** كم Reel وكم صورة clay شهرياً؟ هذا يحدد سرعة المراحل
   2–3 أكثر من البرمجة.
6. **الأسماء:** Pinki Town / Word Sky / Bloo's Expeditions أسماء عمل مقترحة، وتحتاج
   اعتماداً وترجمة.

---

## 15. المصادر

**منتجات:**
- Khan Academy Kids: [Learning Path](https://khankids.zendesk.com/hc/en-us/articles/360048828572-Learn-more-about-the-Learning-Path) · [الشخصيات](https://khankids.zendesk.com/hc/en-us/articles/360049358751-Learn-more-about-the-characters-inside-Khan-Academy-Kids) · [The 74](https://www.the74million.org/zero2eight/learning-and-growing-with-khan-academy-kids/)
- Duolingo ABC: [الموقع](https://abc.duolingo.com/) · [Scope and Sequence (PDF)](https://lit-lessons-cdn.duolingo.com/resources/duolingo_abc_scope_and_sequence_english.pdf)
- [Teach Your Monster to Read](https://www.teachyourmonster.org/teach-your-monster-to-read-overview/) · [Common Sense Education review](https://www.commonsense.org/education/reviews/teach-your-monster-to-read)
- [Endless Reader — Originator](https://www.originatorkids.com/endless-reader-2/)
- [DragonBox Numbers](https://dragonbox.com/products/numbers) · [Games for Change](https://www.gamesforchange.org/games/dragonbox-numbers/)
- [Numberblocks](https://www.blocksuniverse.tv/numberblocks/home) · [Modulo review](https://joinmodulo.com/products/numberblocks)
- [Prodigy — كيف يعمل التكيف](https://www.prodigygame.com/main-en/blog/is-prodigy-math-adaptive)
- Lingokids: [Playlearning Curriculum](https://lingokids.com/playlearning-curriculum) · [محتوى Oxford](https://lingokids.com/blog/posts/new-english-lessons-with-content-from-oxford-university-press) · [Animal Vocabulary Pre-A1](https://lingokids.com/teachers/learning-english-animal-vocabulary-pre-a1)
- [HOMER Learn & Grow](https://learnwithhomer.com/learn-and-grow) · [Common Sense review](https://www.commonsensemedia.org/app-reviews/homer-learn-grow)
- [BrainPOP Jr. Science](https://jr.brainpop.com/subject/science/)
- Wild Kratts / Octonauts: [Screenwise — Creature Powers](https://screenwiseapp.com/guides/the-wild-kratts) · [Octonauts](https://screenwiseapp.com/guides/octonauts-tv)
- Adam Wa Mishmish: [Wikipedia](https://en.wikipedia.org/wiki/Adam_Wa_Mishmish) · [App Store](https://apps.apple.com/us/app/adam-wa-mishmish-game/id6753582482) · [Lamsa](https://play.google.com/store/apps/details?id=com.ertiqa.lamsa&hl=en_US)
- [Sago Mini](https://en.wikipedia.org/wiki/Sago_Mini) · [Toca Boca](https://en.wikipedia.org/wiki/Toca_Boca)

**أبحاث:**
- Hirsh-Pasek et al. (2015), *Putting Education in "Educational" Apps*: [SAGE](https://journals.sagepub.com/doi/10.1177/1529100615569721) · [ملخص APS](https://www.psychologicalscience.org/publications/educational-apps.html)
- [A Critical Examination of Feedback in Early Reading Games (iRead)](https://iread-project.eu/wp-content/uploads/2018/05/a-critical-examination-of-feedback-in-early-reading-games-camera-ready.pdf) · [Review of feedback in edutainment games for preschoolers](https://www.tandfonline.com/doi/abs/10.1080/17482798.2020.1815227)
- [The science of effective learning with spacing and retrieval practice — Nature Reviews Psychology](https://www.nature.com/articles/s44159-022-00089-1) · [Retrieval practice boosts fact learning in primary children](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3827082/) · [Learning Scientists — حدود التطبيق في الصف](https://www.learningscientists.org/blog/2017/7/20-1)
- PBS KIDS Ready To Learn: [Transmedia Gaming Study (ERIC)](https://eric.ed.gov/?id=ED543354) · [RCT للرياضيات في الروضة](https://eric.ed.gov/?id=ED594258) · [WestEd — في البيوت](https://www.wested.org/resource/pbs-kids-mathematics-transmedia-suites-in-preschool-homes-a-report-to-the-cpb-pbs-ready-to-learn-initiative/)
- طلاقة الحساب واستراتيجياته: [Edutopia](https://www.edutopia.org/article/building-elementary-math-fact-fluency/) · [McGraw Hill — Research-based fact fluency](https://medium.com/inspired-ideas-prek-12/a-research-based-approach-to-math-fact-fluency-that-also-promotes-a-love-of-mathematics-31f9d7e8099f)
- الأنماط المظلمة: [Children, dark patterns and normative perspectives](https://opo.iisj.net/index.php/osls/article/view/2351) · [Deceptive designs in children's apps (arXiv)](https://arxiv.org/pdf/2512.17819) · [UX Collective — Duolingo gamification](https://uxdesign.cc/the-good-the-bad-and-the-ugly-of-duolingo-gamification-3a12f0e80dc7)
- تصميم تطبيقات الأطفال: [UX Collective — Designing apps for young kids](https://uxdesign.cc/designing-apps-for-young-kids-part-2-d57bc6dd86ae)
- طول الفيديو: [Kokotree — educational videos for toddlers](https://kokotree.com/blog/preschool/educational-videos-for-toddlers-the-ultimate-guide) (إرشاد صناعي لا دراسة محكّمة)

**مناهج ومراجع محتوى:**
- Common Core: [Grade 1 Introduction](https://www.thecorestandards.org/Math/Content/1/introduction/) · [Operations & Algebraic Thinking](https://www.thecorestandards.org/Math/Content/1/OA/)
- Cambridge Pre A1 Starters: [Wikipedia — Young Learners](https://en.wikipedia.org/wiki/Cambridge_English:_Young_Learners) · [المواضيع](https://flyer.us/cambridge-starters-vocabulary/)
- Dolch/Fry: [قائمة Dolch الكاملة (FLDOE PDF)](https://www.fldoe.org/core/fileparse.php/16294/urlt/SightWord.pdf) · [مقارنة Dolch وFry](https://www.readsters.com/wp-content/uploads/2013/03/ComparingDolchAndFryLists.pdf)
- CVC وتسلسل الـ phonics: [Little Lions Literacy](https://littlelionsliteracy.com/cvc-words-for-kindergarten/) · [Lead in Literacy](https://leadinliteracy.com/how-to-teach-cvc-words/)
- منهج Sunrise في إقليم كردستان: [English Language Teaching in the Kurdistan Region of Iraq](https://www.researchgate.net/publication/280131563_English_Language_Teaching_in_the_Kurdistan_Region_of_Iraq) · [Evaluation of the Sunrise series](https://www.researchgate.net/publication/361717752_Evaluation_of_the_Sunrise_Coursebook_Series_by_Teachers_in_the_Sulaymaniyah_Governorate_in_the_Kurdistan_Region_of_Iraq)

**داخلي:**
- `example/kartana_feasibility_study_EN.md`: دراسة جدوى كرتنة (أفكار فقط، §2).
