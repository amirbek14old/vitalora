type L = { uz: string; en: string; ru: string };
type LL = { uz: string[]; en: string[]; ru: string[] };
type Level = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type ExerciseSeed = {
  slug: string;
  name: L;
  description: L;
  steps: LL;
  safetyTips: LL;
  category: "warmup" | "strength" | "cardio" | "mobility" | "balance" | "cooldown";
  muscleGroups: string[];
  difficulty: Level;
  durationSec: number;
  alternatives: string[];
};

export const exercises: ExerciseSeed[] = [
  {
    slug: "march-in-place",
    name: { uz: "Joyida yurish", en: "March in place", ru: "Ходьба на месте" },
    description: { uz: "Yurak urishini asta oshiradigan yengil qizdirish mashqi.", en: "A gentle warm-up that gradually raises your heart rate.", ru: "Мягкая разминка, постепенно повышающая пульс." },
    steps: {
      uz: ["Tik turing, qoʻllar yonda.", "Tizzalarni navbatma-navbat bel balandligigacha koʻtaring.", "Qoʻllarni tabiiy harakatlantiring.", "Bir tekis nafas oling."],
      en: ["Stand tall with arms by your sides.", "Lift your knees one at a time towards hip height.", "Swing your arms naturally.", "Breathe steadily."],
      ru: ["Встаньте прямо, руки вдоль тела.", "Поочерёдно поднимайте колени к уровню бёдер.", "Естественно работайте руками.", "Дышите ровно."],
    },
    safetyTips: { uz: ["Tizzalar ogʻrisa, balandlikni pasaytiring."], en: ["Lower the knee height if your knees feel uncomfortable."], ru: ["Уменьшите высоту подъёма колен при дискомфорте."] },
    category: "warmup", muscleGroups: ["legs", "hips"], difficulty: "BEGINNER", durationSec: 60, alternatives: ["arm-circles"],
  },
  {
    slug: "arm-circles",
    name: { uz: "Qoʻllarni aylantirish", en: "Arm circles", ru: "Круги руками" },
    description: { uz: "Yelka boʻgʻimlarini mashgʻulotga tayyorlaydi.", en: "Prepares your shoulder joints for exercise.", ru: "Готовит плечевые суставы к нагрузке." },
    steps: {
      uz: ["Qoʻllarni yon tomonga yelka balandligida choʻzing.", "Kichik doiralar chizing, asta kattalashtiring.", "30 soniyadan keyin yoʻnalishni oʻzgartiring."],
      en: ["Extend your arms out to the sides at shoulder height.", "Make small circles, gradually making them bigger.", "Change direction after 30 seconds."],
      ru: ["Разведите руки в стороны на уровне плеч.", "Делайте маленькие круги, постепенно увеличивая их.", "Через 30 секунд смените направление."],
    },
    safetyTips: { uz: ["Yelkani koʻtarmang, boʻyin boʻsh tursin."], en: ["Keep your shoulders down and neck relaxed."], ru: ["Не поднимайте плечи, шея расслаблена."] },
    category: "warmup", muscleGroups: ["shoulders"], difficulty: "BEGINNER", durationSec: 60, alternatives: ["march-in-place"],
  },
  {
    slug: "hip-circles",
    name: { uz: "Sonni aylantirish", en: "Hip circles", ru: "Круги тазом" },
    description: { uz: "Son va bel atrofidagi harakatchanlikni yaxshilaydi.", en: "Loosens the hips and lower back.", ru: "Разминает тазобедренные суставы и поясницу." },
    steps: {
      uz: ["Oyoqlarni yelka kengligida qoʻying, qoʻllar belda.", "Sonni sekin katta doira boʻylab aylantiring.", "10 marta bir tomonga, 10 marta boshqa tomonga."],
      en: ["Feet shoulder-width apart, hands on hips.", "Slowly draw large circles with your hips.", "10 circles each direction."],
      ru: ["Ноги на ширине плеч, руки на поясе.", "Медленно описывайте тазом большие круги.", "По 10 кругов в каждую сторону."],
    },
    safetyTips: { uz: ["Harakatni silliq bajaring, keskin burilmang."], en: ["Move smoothly without jerking."], ru: ["Двигайтесь плавно, без рывков."] },
    category: "warmup", muscleGroups: ["hips", "core"], difficulty: "BEGINNER", durationSec: 60, alternatives: ["march-in-place"],
  },
  {
    slug: "bodyweight-squat",
    name: { uz: "Oʻz vazn bilan oʻtirib-turish", en: "Bodyweight squat", ru: "Приседания с весом тела" },
    description: { uz: "Oyoq va dumba mushaklari uchun asosiy mashq.", en: "A foundational exercise for legs and glutes.", ru: "Базовое упражнение для ног и ягодиц." },
    steps: {
      uz: ["Oyoqlarni yelka kengligida qoʻying.", "Sonni orqaga yuborib, stulga oʻtirayotgandek pasaying.", "Tizzalar oyoq uchi yoʻnalishida boʻlsin.", "Tovonlar bilan itarib, tik turing."],
      en: ["Stand with feet shoulder-width apart.", "Push your hips back and bend your knees as if sitting on a chair.", "Keep knees in line with your toes.", "Press through your heels to stand up."],
      ru: ["Ноги на ширине плеч.", "Отведите таз назад и согните колени, будто садитесь на стул.", "Колени направлены по линии носков.", "Встаньте, отталкиваясь пятками."],
    },
    safetyTips: { uz: ["Boshlovchilar haqiqiy stuldan foydalanishi mumkin.", "Tizzada ogʻriq boʻlsa, chuqurlikni kamaytiring."], en: ["Beginners can squat to a real chair.", "Reduce the depth if your knees hurt."], ru: ["Новичкам можно приседать до стула.", "При боли в коленях уменьшите глубину."] },
    category: "strength", muscleGroups: ["legs", "glutes"], difficulty: "BEGINNER", durationSec: 40, alternatives: ["glute-bridge", "reverse-lunge"],
  },
  {
    slug: "wall-push-up",
    name: { uz: "Devorga tayanib otjimaniya", en: "Wall push-up", ru: "Отжимания от стены" },
    description: { uz: "Koʻkrak va qoʻllar uchun eng yengil otjimaniya varianti.", en: "The easiest push-up variation for chest and arms.", ru: "Самый лёгкий вариант отжиманий для груди и рук." },
    steps: {
      uz: ["Devorga qarab, bir qadam narida turing.", "Kaftlarni yelka balandligida devorga qoʻying.", "Tirsaklarni bukib, koʻkrakni devorga yaqinlashtiring.", "Itarib, boshlangʻich holatga qayting."],
      en: ["Stand facing a wall, about one step away.", "Place palms on the wall at shoulder height.", "Bend your elbows to bring your chest towards the wall.", "Push back to the start."],
      ru: ["Встаньте лицом к стене на расстоянии шага.", "Упритесь ладонями в стену на уровне плеч.", "Сгибая локти, приблизьте грудь к стене.", "Оттолкнитесь в исходное положение."],
    },
    safetyTips: { uz: ["Tanani toʻgʻri chiziqda saqlang."], en: ["Keep your body in a straight line."], ru: ["Держите тело прямым."] },
    category: "strength", muscleGroups: ["chest", "arms", "shoulders"], difficulty: "BEGINNER", durationSec: 40, alternatives: ["knee-push-up"],
  },
  {
    slug: "knee-push-up",
    name: { uz: "Tizzada otjimaniya", en: "Knee push-up", ru: "Отжимания с колен" },
    description: { uz: "Toʻliq otjimaniyaga tayyorlovchi oraliq bosqich.", en: "A step between wall and full push-ups.", ru: "Промежуточный шаг к полным отжиманиям." },
    steps: {
      uz: ["Tizza va kaftlarga tayaning, qoʻllar yelkadan biroz kengroq.", "Tizzadan boshgacha toʻgʻri chiziq hosil qiling.", "Koʻkrakni polga yaqinlashtiring.", "Itarib koʻtariling."],
      en: ["Kneel and place hands slightly wider than shoulders.", "Form a straight line from knees to head.", "Lower your chest towards the floor.", "Push back up."],
      ru: ["Встаньте на колени, руки чуть шире плеч.", "Тело прямое от колен до головы.", "Опустите грудь к полу.", "Выжмите себя вверх."],
    },
    safetyTips: { uz: ["Tizza ostiga yumshoq narsa qoʻying."], en: ["Use a cushion under your knees."], ru: ["Подложите под колени мягкую опору."] },
    category: "strength", muscleGroups: ["chest", "arms", "core"], difficulty: "BEGINNER", durationSec: 40, alternatives: ["wall-push-up", "push-up"],
  },
  {
    slug: "push-up",
    name: { uz: "Otjimaniya", en: "Push-up", ru: "Отжимания" },
    description: { uz: "Koʻkrak, yelka, qoʻl va tana markazi uchun klassik mashq.", en: "Classic exercise for chest, shoulders, arms and core.", ru: "Классика для груди, плеч, рук и кора." },
    steps: {
      uz: ["Planka holatida turing, qoʻllar yelka ostida.", "Tanani tekis ushlab, koʻkrakni pastga tushiring.", "Tirsaklar tanaga nisbatan taxminan 45° burchakda.", "Itarib koʻtariling."],
      en: ["Start in a high plank, hands under shoulders.", "Keep your body straight and lower your chest.", "Elbows at about 45° from your body.", "Push back up."],
      ru: ["Упор лёжа, ладони под плечами.", "Держа тело прямым, опустите грудь.", "Локти примерно под 45° к корпусу.", "Выжмите себя вверх."],
    },
    safetyTips: { uz: ["Bel egilib ketsa, tizzadagi variantga oʻting."], en: ["If your lower back sags, switch to knee push-ups."], ru: ["Если поясница прогибается, перейдите на отжимания с колен."] },
    category: "strength", muscleGroups: ["chest", "arms", "shoulders", "core"], difficulty: "INTERMEDIATE", durationSec: 40, alternatives: ["knee-push-up"],
  },
  {
    slug: "glute-bridge",
    name: { uz: "Dumba koʻprigi", en: "Glute bridge", ru: "Ягодичный мост" },
    description: { uz: "Dumba va orqa son mushaklarini mustahkamlaydi, belga yumshoq.", en: "Strengthens glutes and hamstrings, gentle on the back.", ru: "Укрепляет ягодицы и заднюю поверхность бедра, бережно к спине." },
    steps: {
      uz: ["Chalqancha yoting, tizzalar bukilgan, oyoqlar polda.", "Dumbani qisib, sonni koʻtaring.", "Yuqorida 2 soniya ushlang.", "Sekin tushiring."],
      en: ["Lie on your back, knees bent, feet flat.", "Squeeze your glutes and lift your hips.", "Hold for 2 seconds at the top.", "Lower slowly."],
      ru: ["Лягте на спину, колени согнуты, стопы на полу.", "Напрягите ягодицы и поднимите таз.", "Задержитесь наверху на 2 секунды.", "Медленно опуститесь."],
    },
    safetyTips: { uz: ["Belni haddan tashqari egmang."], en: ["Don't over-arch your lower back."], ru: ["Не прогибайте поясницу чрезмерно."] },
    category: "strength", muscleGroups: ["glutes", "legs", "core"], difficulty: "BEGINNER", durationSec: 40, alternatives: ["bodyweight-squat"],
  },
  {
    slug: "reverse-lunge",
    name: { uz: "Orqaga hamla", en: "Reverse lunge", ru: "Выпад назад" },
    description: { uz: "Oyoq kuchi va muvozanat uchun; oldinga hamladan koʻra tizzaga yengilroq.", en: "Builds leg strength and balance; often easier on knees than forward lunges.", ru: "Сила ног и баланс; обычно мягче для коленей, чем выпад вперёд." },
    steps: {
      uz: ["Tik turing.", "Bir oyoq bilan orqaga katta qadam tashlang.", "Ikkala tizzani bukib pasaying.", "Oldingi oyoq bilan itarib qayting, oyoqni almashtiring."],
      en: ["Stand tall.", "Step one foot back.", "Bend both knees to lower down.", "Push through the front foot to return; switch legs."],
      ru: ["Встаньте прямо.", "Сделайте шаг одной ногой назад.", "Согните оба колена, опускаясь.", "Вернитесь, отталкиваясь передней ногой; смените ногу."],
    },
    safetyTips: { uz: ["Muvozanat uchun stulga ushlansangiz boʻladi."], en: ["Hold a chair for balance if needed."], ru: ["При необходимости держитесь за стул."] },
    category: "strength", muscleGroups: ["legs", "glutes"], difficulty: "INTERMEDIATE", durationSec: 40, alternatives: ["bodyweight-squat"],
  },
  {
    slug: "plank",
    name: { uz: "Planka", en: "Plank", ru: "Планка" },
    description: { uz: "Tana markazi (kor) barqarorligini oshiradi.", en: "Builds core stability.", ru: "Развивает стабильность кора." },
    steps: {
      uz: ["Bilaklarga tayaning, tirsaklar yelka ostida.", "Oyoqlarni orqaga choʻzing.", "Tanani boshdan tovongacha tekis ushlang.", "Bir tekis nafas oling."],
      en: ["Rest on your forearms, elbows under shoulders.", "Step your feet back.", "Keep a straight line from head to heels.", "Breathe steadily."],
      ru: ["Упор на предплечья, локти под плечами.", "Ноги отведите назад.", "Тело — прямая линия от головы до пяток.", "Дышите ровно."],
    },
    safetyTips: { uz: ["Boshlovchilar tizzada bajarishi mumkin.", "Nafasni ushlab turmang."], en: ["Beginners can do it from the knees.", "Don't hold your breath."], ru: ["Новичкам можно с колен.", "Не задерживайте дыхание."] },
    category: "strength", muscleGroups: ["core", "shoulders"], difficulty: "BEGINNER", durationSec: 30, alternatives: ["bird-dog"],
  },
  {
    slug: "bird-dog",
    name: { uz: "Qarama-qarshi qoʻl-oyoq choʻzish", en: "Bird dog", ru: "Птица-собака" },
    description: { uz: "Orqa va kor uchun muvozanatni talab qiluvchi yumshoq mashq.", en: "A gentle core and back exercise that challenges balance.", ru: "Мягкое упражнение для спины и кора с элементом баланса." },
    steps: {
      uz: ["Toʻrt oyoqlab turing.", "Oʻng qoʻl va chap oyoqni bir vaqtda choʻzing.", "2 soniya ushlang, qayting.", "Tomonni almashtiring."],
      en: ["Start on hands and knees.", "Extend your right arm and left leg together.", "Hold 2 seconds, return.", "Switch sides."],
      ru: ["Встаньте на четвереньки.", "Одновременно вытяните правую руку и левую ногу.", "Задержитесь на 2 секунды, вернитесь.", "Смените сторону."],
    },
    safetyTips: { uz: ["Belni tekis saqlang, sonni burmang."], en: ["Keep your back flat and hips level."], ru: ["Спина ровная, таз не разворачивайте."] },
    category: "balance", muscleGroups: ["core", "back"], difficulty: "BEGINNER", durationSec: 40, alternatives: ["plank"],
  },
  {
    slug: "calf-raise",
    name: { uz: "Oyoq uchida koʻtarilish", en: "Calf raise", ru: "Подъёмы на носки" },
    description: { uz: "Boldir mushaklari va toʻpiq barqarorligi uchun.", en: "For calf strength and ankle stability.", ru: "Для икр и устойчивости голеностопа." },
    steps: {
      uz: ["Tik turing, kerak boʻlsa devorga ushlaning.", "Oyoq uchiga koʻtariling.", "Sekin pastga tushing."],
      en: ["Stand tall, holding a wall if needed.", "Rise onto the balls of your feet.", "Lower slowly."],
      ru: ["Встаньте прямо, при необходимости держитесь за стену.", "Поднимитесь на носки.", "Медленно опуститесь."],
    },
    safetyTips: { uz: ["Harakatni nazorat bilan bajaring."], en: ["Move with control."], ru: ["Двигайтесь подконтрольно."] },
    category: "strength", muscleGroups: ["calves", "legs"], difficulty: "BEGINNER", durationSec: 40, alternatives: ["march-in-place"],
  },
  {
    slug: "step-jacks",
    name: { uz: "Sakrashsiz jek", en: "Step jacks (low impact)", ru: "Шаговые «джеки» (без прыжков)" },
    description: { uz: "Sakrashsiz kardio — boʻgʻimlarga yengil.", en: "Jumping-jack style cardio without jumping — joint friendly.", ru: "Кардио в стиле «джампинг-джек» без прыжков — бережно к суставам." },
    steps: {
      uz: ["Bir oyoqni yonga qoʻying va qoʻllarni tepaga koʻtaring.", "Qaytib, boshqa tomonga takrorlang.", "Qulay sur'atda davom eting."],
      en: ["Step one foot to the side while raising your arms overhead.", "Return and repeat on the other side.", "Keep a comfortable pace."],
      ru: ["Шагните в сторону, поднимая руки вверх.", "Вернитесь и повторите в другую сторону.", "Держите комфортный темп."],
    },
    safetyTips: { uz: ["Gaplasha oladigan darajada sur'atni saqlang."], en: ["Keep a pace where you can still talk."], ru: ["Темп — такой, чтобы можно было говорить."] },
    category: "cardio", muscleGroups: ["legs", "shoulders"], difficulty: "BEGINNER", durationSec: 40, alternatives: ["high-knees"],
  },
  {
    slug: "high-knees",
    name: { uz: "Tizzalarni baland koʻtarib yugurish", en: "High knees", ru: "Бег с высоким подниманием колен" },
    description: { uz: "Yurak urishini tezlashtiruvchi kardio mashqi.", en: "A heart-rate-raising cardio move.", ru: "Кардио-упражнение для повышения пульса." },
    steps: {
      uz: ["Joyida yengil yuguring.", "Tizzalarni bel balandligiga koʻtaring.", "Oyoq uchida yumshoq qoʻning."],
      en: ["Jog in place.", "Drive your knees up towards hip height.", "Land softly on the balls of your feet."],
      ru: ["Бегите на месте.", "Поднимайте колени к уровню бёдер.", "Мягко приземляйтесь на носки."],
    },
    safetyTips: { uz: ["Yengilroq variant: joyida tez yurish."], en: ["Easier option: fast marching."], ru: ["Облегчённый вариант: быстрая ходьба на месте."] },
    category: "cardio", muscleGroups: ["legs", "core"], difficulty: "INTERMEDIATE", durationSec: 30, alternatives: ["step-jacks", "march-in-place"],
  },
  {
    slug: "single-leg-stand",
    name: { uz: "Bir oyoqda turish", en: "Single-leg stand", ru: "Стойка на одной ноге" },
    description: { uz: "Muvozanat va toʻpiq barqarorligini rivojlantiradi.", en: "Develops balance and ankle stability.", ru: "Развивает равновесие и устойчивость голеностопа." },
    steps: {
      uz: ["Stul yonida turing.", "Bir oyoqni biroz koʻtaring.", "30 soniya ushlang, oyoqni almashtiring."],
      en: ["Stand next to a chair.", "Lift one foot slightly off the floor.", "Hold 30 seconds, switch legs."],
      ru: ["Встаньте рядом со стулом.", "Немного приподнимите одну ногу.", "Держите 30 секунд, смените ногу."],
    },
    safetyTips: { uz: ["Yiqilish xavfi boʻlsa, doimo tayanch yonida bajaring."], en: ["Always stay near support if you might lose balance."], ru: ["Если есть риск падения, держитесь рядом с опорой."] },
    category: "balance", muscleGroups: ["legs", "core"], difficulty: "BEGINNER", durationSec: 60, alternatives: ["bird-dog"],
  },
  {
    slug: "cat-cow",
    name: { uz: "Mushuk-sigir choʻzilishi", en: "Cat–cow stretch", ru: "Кошка–корова" },
    description: { uz: "Umurtqa pogʻonasi harakatchanligi uchun yumshoq mashq.", en: "Gentle spinal mobility.", ru: "Мягкая мобилизация позвоночника." },
    steps: {
      uz: ["Toʻrt oyoqlab turing.", "Nafas olib, belni pastga egib, boshni koʻtaring.", "Nafas chiqarib, orqani yumaloqlang.", "Sekin almashtiring."],
      en: ["Start on hands and knees.", "Inhale, let your belly drop and lift your head.", "Exhale, round your back.", "Alternate slowly."],
      ru: ["Встаньте на четвереньки.", "На вдохе прогнитесь, поднимите голову.", "На выдохе округлите спину.", "Чередуйте медленно."],
    },
    safetyTips: { uz: ["Ogʻriqsiz amplitudada harakatlaning."], en: ["Move only within a pain-free range."], ru: ["Двигайтесь только в безболезненной амплитуде."] },
    category: "mobility", muscleGroups: ["back", "core"], difficulty: "BEGINNER", durationSec: 60, alternatives: ["childs-pose"],
  },
  {
    slug: "hip-flexor-stretch",
    name: { uz: "Son old qismini choʻzish", en: "Kneeling hip-flexor stretch", ru: "Растяжка сгибателей бедра" },
    description: { uz: "Uzoq oʻtirishdan keyin son oldini boʻshashtiradi.", en: "Releases the front of the hip after long sitting.", ru: "Расслабляет переднюю поверхность бедра после долгого сидения." },
    steps: {
      uz: ["Bir tizzaga tushing, ikkinchi oyoq oldinda.", "Sonni sekin oldinga suring.", "30 soniya ushlang, tomonni almashtiring."],
      en: ["Kneel on one knee, other foot in front.", "Gently shift your hips forward.", "Hold 30 seconds, switch sides."],
      ru: ["Встаньте на одно колено, другая нога впереди.", "Мягко подайте таз вперёд.", "Держите 30 секунд, смените сторону."],
    },
    safetyTips: { uz: ["Choʻzilish yoqimli boʻlsin, ogʻriqli emas."], en: ["The stretch should feel comfortable, not painful."], ru: ["Растяжение должно быть комфортным, не болезненным."] },
    category: "mobility", muscleGroups: ["hips", "legs"], difficulty: "BEGINNER", durationSec: 60, alternatives: ["hamstring-stretch"],
  },
  {
    slug: "childs-pose",
    name: { uz: "Bola holati", en: "Child's pose", ru: "Поза ребёнка" },
    description: { uz: "Orqa va yelkani boʻshashtiruvchi tinchlantiruvchi holat.", en: "A calming position that relaxes the back and shoulders.", ru: "Успокаивающая поза для расслабления спины и плеч." },
    steps: {
      uz: ["Tizzalab oʻtiring, tovonlarga oʻtiring.", "Oldinga engashib, qoʻllarni oldinga choʻzing.", "Peshonani polga qoʻyib, chuqur nafas oling."],
      en: ["Kneel and sit back on your heels.", "Fold forward and reach your arms ahead.", "Rest your forehead down and breathe deeply."],
      ru: ["Сядьте на пятки.", "Наклонитесь вперёд, вытянув руки.", "Опустите лоб и глубоко дышите."],
    },
    safetyTips: { uz: ["Tizza noqulay boʻlsa, ostiga yostiq qoʻying."], en: ["Place a cushion under your knees or hips if uncomfortable."], ru: ["Подложите подушку под колени или таз при дискомфорте."] },
    category: "cooldown", muscleGroups: ["back", "hips"], difficulty: "BEGINNER", durationSec: 60, alternatives: ["cat-cow"],
  },
  {
    slug: "hamstring-stretch",
    name: { uz: "Orqa son choʻzilishi", en: "Seated hamstring stretch", ru: "Растяжка задней поверхности бедра сидя" },
    description: { uz: "Mashgʻulotdan keyin orqa son mushaklarini boʻshashtiradi.", en: "Relaxes the hamstrings after exercise.", ru: "Расслабляет заднюю поверхность бедра после тренировки." },
    steps: {
      uz: ["Polga oʻtiring, bir oyoq choʻzilgan.", "Belni tekis tutib, oldinga engashing.", "30 soniya ushlang, almashtiring."],
      en: ["Sit with one leg straight.", "Hinge forward from the hips with a long back.", "Hold 30 seconds, switch."],
      ru: ["Сядьте, одна нога прямая.", "Наклонитесь от бёдер с прямой спиной.", "Держите 30 секунд, смените ногу."],
    },
    safetyTips: { uz: ["Silkitmang — sekin va barqaror choʻzing."], en: ["Don't bounce — stretch slowly and steadily."], ru: ["Не пружиньте — тянитесь медленно и плавно."] },
    category: "cooldown", muscleGroups: ["legs"], difficulty: "BEGINNER", durationSec: 60, alternatives: ["childs-pose"],
  },
];
