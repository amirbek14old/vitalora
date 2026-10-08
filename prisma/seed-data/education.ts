type L = { uz: string; en: string; ru: string };
type LL = { uz: string[]; en: string[]; ru: string[] };

type QuestionSeed = { prompt: L; options: LL; correctIndex: number; explanation: L };
type LessonSeed = { slug: string; title: L; body: LL; minutes: number; questions: QuestionSeed[] };
export type CourseSeed = { slug: string; title: L; description: L; track: string; order: number; lessons: LessonSeed[] };

export const courses: CourseSeed[] = [
  {
    slug: "movement-basics",
    track: "sports",
    order: 1,
    title: { uz: "Harakat asoslari", en: "Movement basics", ru: "Основы движения" },
    description: { uz: "Xavfsiz va yoqimli jismoniy faollikni boshlash uchun qisqa kurs.", en: "A short course to start safe, enjoyable physical activity.", ru: "Короткий курс, чтобы начать безопасно и с удовольствием двигаться." },
    lessons: [
      {
        slug: "why-move",
        minutes: 5,
        title: { uz: "Nega harakat muhim", en: "Why movement matters", ru: "Почему движение важно" },
        body: {
          uz: ["Muntazam jismoniy faollik yurak, mushak, suyak va kayfiyat uchun foydali.", "Jahon sogʻliqni saqlash tashkiloti (JSST) kattalarga haftasiga kamida 150–300 daqiqa oʻrtacha intensiv faollikni tavsiya qiladi; bolalar va oʻsmirlarga — kuniga oʻrtacha 60 daqiqa.", "Har qanday harakat hisobga olinadi: yurish, zinadan chiqish, uy ishlari. Kichikdan boshlang."],
          en: ["Regular physical activity benefits your heart, muscles, bones and mood.", "The World Health Organization (WHO) recommends at least 150–300 minutes of moderate activity per week for adults, and an average of 60 minutes per day for children and adolescents.", "Every bit of movement counts: walking, stairs, housework. Start small."],
          ru: ["Регулярная физическая активность полезна для сердца, мышц, костей и настроения.", "Всемирная организация здравоохранения (ВОЗ) рекомендует взрослым не менее 150–300 минут умеренной активности в неделю, а детям и подросткам — в среднем 60 минут в день.", "Любое движение считается: ходьба, лестницы, домашние дела. Начните с малого."],
        },
        questions: [
          {
            prompt: { uz: "JSST kattalarga haftasiga qancha oʻrtacha faollikni tavsiya qiladi?", en: "How much moderate activity does WHO recommend for adults per week?", ru: "Сколько умеренной активности в неделю ВОЗ рекомендует взрослым?" },
            options: { uz: ["30 daqiqa", "150–300 daqiqa", "1000 daqiqa"], en: ["30 minutes", "150–300 minutes", "1000 minutes"], ru: ["30 минут", "150–300 минут", "1000 минут"] },
            correctIndex: 1,
            explanation: { uz: "JSST koʻrsatmalariga koʻra, kattalar uchun 150–300 daqiqa.", en: "WHO guidelines suggest 150–300 minutes for adults.", ru: "По рекомендациям ВОЗ — 150–300 минут для взрослых." },
          },
          {
            prompt: { uz: "Uy ishlari jismoniy faollik hisoblanadimi?", en: "Does housework count as physical activity?", ru: "Считаются ли домашние дела физической активностью?" },
            options: { uz: ["Ha", "Yoʻq"], en: ["Yes", "No"], ru: ["Да", "Нет"] },
            correctIndex: 0,
            explanation: { uz: "Ha — tanani harakatlantiradigan har qanday faoliyat hisobga olinadi.", en: "Yes — any activity that moves your body counts.", ru: "Да — любая активность, при которой вы двигаетесь, считается." },
          },
        ],
      },
      {
        slug: "warm-up-cool-down",
        minutes: 5,
        title: { uz: "Qizdirish va sovitish", en: "Warm-up and cool-down", ru: "Разминка и заминка" },
        body: {
          uz: ["Qizdirish (5 daqiqa) yurak urishini asta oshiradi va boʻgʻimlarni tayyorlaydi.", "Sovitish — sekin harakat va yengil choʻzilish — tanani tinchlantirishga yordam beradi.", "Choʻzilish yoqimli boʻlishi kerak, ogʻriqli emas."],
          en: ["A warm-up (about 5 minutes) gradually raises your heart rate and prepares joints.", "A cool-down — slow movement and gentle stretching — helps your body settle.", "Stretching should feel comfortable, never painful."],
          ru: ["Разминка (около 5 минут) постепенно повышает пульс и готовит суставы.", "Заминка — медленное движение и лёгкая растяжка — помогает телу успокоиться.", "Растяжка должна быть комфортной, а не болезненной."],
        },
        questions: [
          {
            prompt: { uz: "Choʻzilish qanday his qilinishi kerak?", en: "How should stretching feel?", ru: "Какими должны быть ощущения при растяжке?" },
            options: { uz: ["Qattiq ogʻriqli", "Yoqimli, ogʻriqsiz", "Hech narsa sezilmasligi kerak"], en: ["Very painful", "Comfortable, pain-free", "You should feel nothing"], ru: ["Очень болезненными", "Комфортными, без боли", "Никакими"] },
            correctIndex: 1,
            explanation: { uz: "Ogʻriq — toʻxtash signali.", en: "Pain is a signal to stop.", ru: "Боль — сигнал остановиться." },
          },
        ],
      },
      {
        slug: "safe-progression",
        minutes: 6,
        title: { uz: "Xavfsiz rivojlanish", en: "Safe progression", ru: "Безопасная прогрессия" },
        body: {
          uz: ["Bir vaqtda faqat bitta narsani oshiring: vaqt, takror yoki qiyinlik.", "Dam olish kunlari — tana moslashadigan vaqt.", "Koʻkrakda ogʻriq, bosh aylanishi yoki kuchli nafas qisishi boʻlsa, toʻxtang va tibbiy yordam soʻrang."],
          en: ["Increase only one thing at a time: time, repetitions or difficulty.", "Rest days are when your body adapts.", "Stop and seek medical help if you feel chest pain, dizziness or severe breathlessness."],
          ru: ["Увеличивайте что-то одно: время, повторения или сложность.", "Дни отдыха — время, когда тело адаптируется.", "При боли в груди, головокружении или сильной одышке остановитесь и обратитесь за медицинской помощью."],
        },
        questions: [
          {
            prompt: { uz: "Mashgʻulot paytida koʻkrakda ogʻriq sezsangiz nima qilish kerak?", en: "What should you do if you feel chest pain during exercise?", ru: "Что делать при боли в груди во время тренировки?" },
            options: { uz: ["Davom etish", "Toʻxtash va tibbiy yordam soʻrash", "Tezlikni oshirish"], en: ["Keep going", "Stop and seek medical help", "Go faster"], ru: ["Продолжать", "Остановиться и обратиться за помощью", "Ускориться"] },
            correctIndex: 1,
            explanation: { uz: "Koʻkrakdagi ogʻriq jiddiy belgi boʻlishi mumkin.", en: "Chest pain can be a serious warning sign.", ru: "Боль в груди может быть серьёзным сигналом." },
          },
        ],
      },
    ],
  },
  {
    slug: "nutrition-fundamentals",
    track: "nutrition",
    order: 2,
    title: { uz: "Ovqatlanish asoslari", en: "Nutrition fundamentals", ru: "Основы питания" },
    description: { uz: "Muvozanatli likopcha, suv ichish va oziq-ovqat guruhlari.", en: "The balanced plate, hydration and food groups.", ru: "Сбалансированная тарелка, вода и группы продуктов." },
    lessons: [
      {
        slug: "food-groups",
        minutes: 6,
        title: { uz: "Oziq-ovqat guruhlari", en: "Food groups", ru: "Группы продуктов" },
        body: {
          uz: ["Asosiy guruhlar: sabzavot va mevalar, donli mahsulotlar, oqsilli mahsulotlar (dukkaklilar, baliq, goʻsht, tuxum), sut mahsulotlari va sogʻlom yogʻlar.", "Har bir guruh turli foydali moddalar beradi — shuning uchun xilma-xillik muhim.", "\"Yaxshi\" yoki \"yomon\" ovqat yoʻq; umumiy muvozanat muhim."],
          en: ["Main groups: vegetables and fruits, grains, protein foods (legumes, fish, meat, eggs), dairy, and healthy fats.", "Each group provides different nutrients — that's why variety matters.", "There are no 'good' or 'bad' foods; overall balance matters."],
          ru: ["Основные группы: овощи и фрукты, зерновые, белковые продукты (бобовые, рыба, мясо, яйца), молочные продукты и полезные жиры.", "Каждая группа даёт разные питательные вещества — поэтому важно разнообразие.", "Нет «хорошей» или «плохой» еды; важен общий баланс."],
        },
        questions: [
          {
            prompt: { uz: "Noʻxat va yasmiq qaysi guruhga kiradi?", en: "Which group do chickpeas and lentils belong to?", ru: "К какой группе относятся нут и чечевица?" },
            options: { uz: ["Shirinliklar", "Oqsilli mahsulotlar (dukkaklilar)", "Ichimliklar"], en: ["Sweets", "Protein foods (legumes)", "Drinks"], ru: ["Сладости", "Белковые продукты (бобовые)", "Напитки"] },
            correctIndex: 1,
            explanation: { uz: "Dukkaklilar oʻsimlik oqsili va tolaga boy.", en: "Legumes are rich in plant protein and fibre.", ru: "Бобовые богаты растительным белком и клетчаткой." },
          },
        ],
      },
      {
        slug: "balanced-plate",
        minutes: 5,
        title: { uz: "Muvozanatli likopcha", en: "The balanced plate", ru: "Сбалансированная тарелка" },
        body: {
          uz: ["Oddiy qoʻllanma: likopchaning yarmi sabzavot va meva, choragi butun donli mahsulot, choragi oqsil.", "Oshni achchiq-chuchuk salat bilan yeyish — oʻzbek dasturxonida muvozanatga oddiy misol.", "Ochlik va toʻqlik hissiga quloq soling."],
          en: ["A simple guide: half the plate vegetables and fruit, a quarter whole grains, a quarter protein.", "Eating osh with achichuk salad is a simple example of balance on an Uzbek table.", "Listen to your hunger and fullness cues."],
          ru: ["Простое правило: половина тарелки — овощи и фрукты, четверть — цельные злаки, четверть — белок.", "Плов с салатом ачичук — простой пример баланса на узбекском столе.", "Прислушивайтесь к сигналам голода и сытости."],
        },
        questions: [
          {
            prompt: { uz: "Muvozanatli likopchaning yarmini nima tashkil qiladi?", en: "What fills half of a balanced plate?", ru: "Что занимает половину сбалансированной тарелки?" },
            options: { uz: ["Shirinliklar", "Sabzavot va mevalar", "Non"], en: ["Sweets", "Vegetables and fruit", "Bread"], ru: ["Сладости", "Овощи и фрукты", "Хлеб"] },
            correctIndex: 1,
            explanation: { uz: "Sabzavot va mevalar vitamin va tolaga boy.", en: "Vegetables and fruit are rich in vitamins and fibre.", ru: "Овощи и фрукты богаты витаминами и клетчаткой." },
          },
        ],
      },
      {
        slug: "hydration",
        minutes: 4,
        title: { uz: "Suv ichish", en: "Hydration", ru: "Питьевой режим" },
        body: {
          uz: ["Suv — eng yaxshi kundalik ichimlik.", "Ehtiyoj issiq havo, faollik va tana oʻlchamiga qarab farq qiladi.", "Shirin ichimliklarni kamaytirish oddiy foydali qadam."],
          en: ["Water is the best everyday drink.", "Needs vary with hot weather, activity and body size.", "Cutting back on sugary drinks is a simple helpful step."],
          ru: ["Вода — лучший повседневный напиток.", "Потребность зависит от жары, активности и размеров тела.", "Сократить сладкие напитки — простой полезный шаг."],
        },
        questions: [
          {
            prompt: { uz: "Suvga ehtiyoj nimaga bogʻliq?", en: "What affects how much water you need?", ru: "От чего зависит потребность в воде?" },
            options: { uz: ["Faqat yoshga", "Havo, faollik va tana oʻlchamiga", "Hech narsaga"], en: ["Only age", "Weather, activity and body size", "Nothing"], ru: ["Только от возраста", "От погоды, активности и размеров тела", "Ни от чего"] },
            correctIndex: 1,
            explanation: { uz: "Bir nechta omil taʼsir qiladi.", en: "Several factors play a role.", ru: "Влияют несколько факторов." },
          },
        ],
      },
    ],
  },
  {
    slug: "better-sleep",
    track: "sleep",
    order: 3,
    title: { uz: "Yaxshiroq uyqu", en: "Better sleep", ru: "Лучший сон" },
    description: { uz: "Uyqu gigiyenasi va kechki tartib.", en: "Sleep hygiene and evening routines.", ru: "Гигиена сна и вечерние ритуалы." },
    lessons: [
      {
        slug: "sleep-why",
        minutes: 5,
        title: { uz: "Uyqu nega muhim", en: "Why sleep matters", ru: "Почему сон важен" },
        body: {
          uz: ["Uyqu paytida tana tiklanadi, miya esa xotirani mustahkamlaydi.", "Kattalarga odatda 7+ soat, oʻsmirlarga taxminan 8–10 soat tavsiya etiladi.", "Muntazam tartib davomiylik kabi muhim."],
          en: ["During sleep your body recovers and your brain consolidates memory.", "Adults are generally advised 7+ hours; teenagers around 8–10 hours.", "A regular schedule matters as much as duration."],
          ru: ["Во сне тело восстанавливается, а мозг закрепляет память.", "Взрослым обычно рекомендуют 7+ часов, подросткам — около 8–10 часов.", "Регулярный режим так же важен, как продолжительность."],
        },
        questions: [
          {
            prompt: { uz: "Oʻsmirlarga taxminan qancha uyqu tavsiya etiladi?", en: "About how much sleep is recommended for teenagers?", ru: "Сколько сна примерно рекомендуется подросткам?" },
            options: { uz: ["4–5 soat", "8–10 soat", "12–14 soat"], en: ["4–5 hours", "8–10 hours", "12–14 hours"], ru: ["4–5 часов", "8–10 часов", "12–14 часов"] },
            correctIndex: 1,
            explanation: { uz: "Oʻsmirlarga kattalardan koʻproq uyqu kerak.", en: "Teenagers need more sleep than adults.", ru: "Подросткам нужно больше сна, чем взрослым." },
          },
        ],
      },
      {
        slug: "wind-down",
        minutes: 5,
        title: { uz: "Kechki tinchlanish", en: "Winding down", ru: "Вечернее расслабление" },
        body: {
          uz: ["Uxlashdan 30–60 daqiqa oldin ekranlarni chetga qoʻying.", "Xonani salqin, qorongʻi va sokin saqlang.", "Nafas mashqlari va yengil choʻzilish tinchlanishga yordam beradi."],
          en: ["Put screens away 30–60 minutes before bed.", "Keep your room cool, dark and quiet.", "Breathing exercises and gentle stretching can help you relax."],
          ru: ["Уберите экраны за 30–60 минут до сна.", "Пусть в комнате будет прохладно, темно и тихо.", "Дыхательные упражнения и лёгкая растяжка помогают расслабиться."],
        },
        questions: [
          {
            prompt: { uz: "Uyqu uchun xona qanday boʻlishi yaxshi?", en: "What kind of room supports sleep?", ru: "Какая комната способствует сну?" },
            options: { uz: ["Issiq va yorugʻ", "Salqin, qorongʻi, sokin", "Shovqinli"], en: ["Warm and bright", "Cool, dark, quiet", "Noisy"], ru: ["Тёплая и светлая", "Прохладная, тёмная, тихая", "Шумная"] },
            correctIndex: 1,
            explanation: { uz: "Salqin, qorongʻi va sokin muhit uyquga yordam beradi.", en: "A cool, dark and quiet environment helps sleep.", ru: "Прохладная, тёмная и тихая обстановка помогает сну." },
          },
        ],
      },
    ],
  },
  {
    slug: "habit-building",
    track: "habits",
    order: 4,
    title: { uz: "Odat shakllantirish", en: "Building habits", ru: "Формирование привычек" },
    description: { uz: "Kichik qadamlar orqali barqaror oʻzgarishlar.", en: "Lasting change through small steps.", ru: "Устойчивые изменения через маленькие шаги." },
    lessons: [
      {
        slug: "tiny-habits",
        minutes: 5,
        title: { uz: "Kichik odatlar", en: "Tiny habits", ru: "Маленькие привычки" },
        body: {
          uz: ["Shunchalik kichik odatdan boshlangki, uni oʻtkazib yuborish qiyin boʻlsin — masalan, 2 daqiqa choʻzilish.", "Yangi odatni mavjudiga bogʻlang: \"Choy damlaganimdan keyin 5 marta oʻtirib-turaman\".", "Oʻtkazib yuborilgan kun — muvaffaqiyatsizlik emas. Shunchaki keyingi kuni davom eting."],
          en: ["Start with a habit so small it's hard to skip — like 2 minutes of stretching.", "Attach it to an existing routine: \"After I make tea, I do 5 squats\".", "A missed day isn't failure. Simply continue the next day."],
          ru: ["Начните с настолько маленькой привычки, что её трудно пропустить, — например, 2 минуты растяжки.", "Привяжите её к существующему действию: «После того как заварю чай, сделаю 5 приседаний».", "Пропущенный день — не провал. Просто продолжите на следующий день."],
        },
        questions: [
          {
            prompt: { uz: "Bir kunni oʻtkazib yuborsangiz nima qilish kerak?", en: "What should you do after missing a day?", ru: "Что делать, если пропустили день?" },
            options: { uz: ["Hammasini tashlash", "Keyingi kuni oddiygina davom etish", "Ikki baravar koʻp qilish"], en: ["Give up", "Simply continue the next day", "Do double"], ru: ["Бросить", "Просто продолжить на следующий день", "Сделать вдвое больше"] },
            correctIndex: 1,
            explanation: { uz: "Muntazamlik mukammallikdan muhimroq.", en: "Consistency matters more than perfection.", ru: "Регулярность важнее идеальности." },
          },
        ],
      },
      {
        slug: "breaks",
        minutes: 4,
        title: { uz: "Faol tanaffuslar", en: "Active breaks", ru: "Активные перерывы" },
        body: {
          uz: ["Uzoq oʻtirishni har 30–60 daqiqada qisqa harakat bilan boʻling.", "Turib choʻzilish, suv ichish yoki biroz yurish yetarli.", "Bu, ayniqsa, oʻqish va kompyuter ishida foydali."],
          en: ["Break up long sitting every 30–60 minutes with short movement.", "Standing up to stretch, getting water or a short walk is enough.", "This is especially helpful when studying or at a computer."],
          ru: ["Прерывайте долгое сидение каждые 30–60 минут коротким движением.", "Достаточно встать и потянуться, сходить за водой или немного пройтись.", "Это особенно полезно при учёбе и работе за компьютером."],
        },
        questions: [
          {
            prompt: { uz: "Uzoq oʻtirishni qanchalik tez-tez boʻlish tavsiya etiladi?", en: "How often is it suggested to break up long sitting?", ru: "Как часто советуют прерывать долгое сидение?" },
            options: { uz: ["Har 30–60 daqiqada", "Kuniga bir marta", "Hech qachon"], en: ["Every 30–60 minutes", "Once a day", "Never"], ru: ["Каждые 30–60 минут", "Раз в день", "Никогда"] },
            correctIndex: 0,
            explanation: { uz: "Qisqa, tez-tez tanaffuslar foydali.", en: "Short, frequent breaks are helpful.", ru: "Короткие частые перерывы полезны." },
          },
        ],
      },
    ],
  },
];

export const nutritionLessons = [
  {
    slug: "fiber-and-whole-grains",
    topic: "nutrients",
    order: 1,
    title: { uz: "Tola va butun donli mahsulotlar", en: "Fibre and whole grains", ru: "Клетчатка и цельные злаки" },
    body: {
      uz: ["Tola sabzavot, meva, dukkaklilar va butun donli mahsulotlarda boʻladi va hazm qilishni qoʻllab-quvvatlaydi.", "Oq non oʻrniga ba'zan butun donli non tanlash — oddiy almashtirish."],
      en: ["Fibre is found in vegetables, fruit, legumes and whole grains and supports digestion.", "Sometimes choosing wholegrain bread instead of white is a simple swap."],
      ru: ["Клетчатка содержится в овощах, фруктах, бобовых и цельных злаках и поддерживает пищеварение.", "Иногда выбирать цельнозерновой хлеб вместо белого — простая замена."],
    },
    sources: ["https://www.who.int/news-room/fact-sheets/detail/healthy-diet"],
  },
  {
    slug: "hydration-basics",
    topic: "hydration",
    order: 2,
    title: { uz: "Suv ichish asoslari", en: "Hydration basics", ru: "Основы питьевого режима" },
    body: {
      uz: ["Chanqoqlik — tanangiz suv soʻrayotgani belgisi.", "Issiq yoz kunlarida va mashgʻulotda koʻproq suv iching.", "Choy ham suyuqlik beradi, lekin shirin ichimliklarni kamaytiring."],
      en: ["Thirst is your body's signal that it needs water.", "Drink more on hot summer days and when exercising.", "Tea also provides fluid, but limit sugary drinks."],
      ru: ["Жажда — сигнал тела, что ему нужна вода.", "Пейте больше в жаркие дни и во время тренировок.", "Чай тоже даёт жидкость, но ограничивайте сладкие напитки."],
    },
    sources: ["https://www.who.int/news-room/fact-sheets/detail/healthy-diet"],
  },
  {
    slug: "food-allergy-awareness",
    topic: "allergies",
    order: 3,
    title: { uz: "Oziq-ovqat allergiyasi haqida", en: "Food allergy awareness", ru: "О пищевой аллергии" },
    body: {
      uz: ["Keng tarqalgan allergenlar: sut, tuxum, yeryongʻoq, daraxt yongʻoqlari, bugʻdoy (glyuten), soya, baliq va dengiz mahsulotlari, kunjut.", "Allergiya alomatlari engildan hayot uchun xavfligacha boʻlishi mumkin. Nafas qisishi yoki yuz shishsa — darhol tez yordam chaqiring.", "Allergiya tashxisini faqat shifokor qoʻyadi."],
      en: ["Common allergens include milk, egg, peanuts, tree nuts, wheat (gluten), soy, fish and shellfish, and sesame.", "Reactions can range from mild to life-threatening. Call emergency services immediately for breathing difficulty or facial swelling.", "Only a doctor can diagnose an allergy."],
      ru: ["Распространённые аллергены: молоко, яйца, арахис, орехи, пшеница (глютен), соя, рыба и морепродукты, кунжут.", "Реакции бывают от лёгких до опасных для жизни. При затруднённом дыхании или отёке лица сразу вызывайте скорую.", "Диагноз аллергии может поставить только врач."],
    },
    sources: ["https://www.who.int/news-room/fact-sheets/detail/food-safety"],
  },
  {
    slug: "meal-prep",
    topic: "meal-prep",
    order: 4,
    title: { uz: "Taomni oldindan tayyorlash", en: "Meal preparation tips", ru: "Подготовка еды заранее" },
    body: {
      uz: ["Haftasiga bir marta sabzavotlarni yuvib toʻgʻrab qoʻyish vaqtni tejaydi.", "Shoʻrva va dimlamani koʻproq pishirib, sovutgichda 3 kungacha saqlash mumkin.", "Pishgan ovqatni 2 soat ichida sovutgichga qoʻying."],
      en: ["Washing and chopping vegetables once a week saves time.", "Cook larger batches of soup or dimlama and refrigerate for up to 3 days.", "Refrigerate cooked food within 2 hours."],
      ru: ["Мойте и нарезайте овощи раз в неделю — это экономит время.", "Готовьте суп или димламу с запасом и храните в холодильнике до 3 дней.", "Убирайте приготовленную еду в холодильник в течение 2 часов."],
    },
    sources: ["https://www.who.int/news-room/fact-sheets/detail/food-safety"],
  },
];

export const achievements = [
  { code: "first_workout", icon: "Dumbbell", title: { uz: "Birinchi qadam", en: "First step", ru: "Первый шаг" }, description: { uz: "Birinchi mashgʻulotni yozdingiz.", en: "You logged your first workout.", ru: "Вы записали первую тренировку." } },
  { code: "ten_workouts", icon: "Flame", title: { uz: "Harakatdagi inson", en: "On the move", ru: "В движении" }, description: { uz: "10 ta mashgʻulot yozdingiz.", en: "You logged 10 workouts.", ru: "Вы записали 10 тренировок." } },
  { code: "first_sleep_log", icon: "Moon", title: { uz: "Uyqu kuzatuvchisi", en: "Sleep observer", ru: "Наблюдатель сна" }, description: { uz: "Birinchi uyqu qaydi.", en: "Your first sleep log.", ru: "Первая запись сна." } },
  { code: "sleep_week", icon: "BedDouble", title: { uz: "Bir hafta kechalar", en: "A week of nights", ru: "Неделя ночей" }, description: { uz: "7 ta uyqu qaydi.", en: "7 sleep logs.", ru: "7 записей сна." } },
  { code: "first_habit", icon: "Sprout", title: { uz: "Urugʻ ekildi", en: "Seed planted", ru: "Семя посажено" }, description: { uz: "Birinchi odatingizni yaratdingiz.", en: "You created your first habit.", ru: "Вы создали первую привычку." } },
  { code: "habit_25", icon: "Leaf", title: { uz: "Oʻsayotgan odat", en: "Growing habits", ru: "Растущие привычки" }, description: { uz: "25 ta odat belgisi.", en: "25 habit check-ins.", ru: "25 отметок привычек." } },
  { code: "first_lesson", icon: "BookOpen", title: { uz: "Qiziquvchan aql", en: "Curious mind", ru: "Любознательный ум" }, description: { uz: "Birinchi darsni tugatdingiz.", en: "You completed your first lesson.", ru: "Вы прошли первый урок." } },
  { code: "quiz_perfect", icon: "Star", title: { uz: "Aʼlo natija", en: "Full marks", ru: "Отличный результат" }, description: { uz: "Testda barcha javoblar toʻgʻri.", en: "All answers correct in a quiz.", ru: "Все ответы верны в тесте." } },
  { code: "first_course", icon: "GraduationCap", title: { uz: "Kurs bitiruvchisi", en: "Course graduate", ru: "Выпускник курса" }, description: { uz: "Butun kursni tugatdingiz.", en: "You finished a whole course.", ru: "Вы прошли весь курс." } },
  { code: "first_meal", icon: "Salad", title: { uz: "Ongli likopcha", en: "Mindful plate", ru: "Осознанная тарелка" }, description: { uz: "Birinchi taomni kundalikka saqladingiz.", en: "You saved your first meal to the journal.", ru: "Вы сохранили первое блюдо в дневник." } },
  { code: "community_voice", icon: "MessageCircleHeart", title: { uz: "Iliq soʻz", en: "Kind voice", ru: "Добрый голос" }, description: { uz: "Hamjamiyatda birinchi postingiz.", en: "Your first community post.", ru: "Ваш первый пост в сообществе." } },
];

export const communities = [
  {
    slug: "beginners-move",
    name: { uz: "Boshlovchilar harakati", en: "Beginners on the move", ru: "Новички в движении" },
    description: { uz: "Endi boshlayotganlar uchun qoʻllab-quvvatlovchi guruh.", en: "A supportive group for people just starting out.", ru: "Поддерживающая группа для тех, кто только начинает." },
    challenge: { uz: "Shu hafta: 'Harakat asoslari' kursining bitta darsini tugating va oʻrgangan bitta narsani ulashing.", en: "This week: finish one lesson of 'Movement basics' and share one thing you learned.", ru: "На этой неделе: пройдите один урок курса «Основы движения» и поделитесь одним выводом." },
  },
  {
    slug: "walking-club",
    name: { uz: "Piyoda yurish klubi", en: "Walking club", ru: "Клуб ходьбы" },
    description: { uz: "Sayr qilish yoʻllari va motivatsiya (aniq manzillarsiz).", en: "Walking ideas and motivation (no precise locations).", ru: "Идеи прогулок и мотивация (без точных адресов)." },
    challenge: { uz: "Bu hafta 3 marta 15 daqiqalik sayr.", en: "Three 15-minute walks this week.", ru: "Три 15-минутные прогулки на этой неделе." },
  },
  {
    slug: "uzbek-kitchen",
    name: { uz: "Sogʻlom oʻzbek oshxonasi", en: "Healthy Uzbek kitchen", ru: "Здоровая узбекская кухня" },
    description: { uz: "Sevimli taomlarni sabzavotga boyroq qilish gʻoyalari.", en: "Ideas for making favourite dishes more vegetable-rich.", ru: "Идеи, как сделать любимые блюда богаче овощами." },
    challenge: { uz: "Sevimli taomingizga bitta qoʻshimcha sabzavot qoʻshib koʻring.", en: "Add one extra vegetable to a favourite dish.", ru: "Добавьте один дополнительный овощ в любимое блюдо." },
  },
  {
    slug: "sleep-circle",
    name: { uz: "Yaxshi uyqu davrasi", en: "Good sleep circle", ru: "Круг хорошего сна" },
    description: { uz: "Kechki tartib va tinchlanish gʻoyalari.", en: "Wind-down routines and ideas.", ru: "Вечерние ритуалы и идеи для расслабления." },
    challenge: { uz: "5 kecha ketma-ket ekranni uxlashdan 30 daqiqa oldin chetga qoʻying.", en: "Put screens away 30 minutes before bed for 5 nights.", ru: "5 вечеров подряд убирайте экраны за 30 минут до сна." },
  },
  {
    slug: "students-active",
    name: { uz: "Faol talabalar", en: "Active students", ru: "Активные студенты" },
    description: { uz: "Oʻqish orasida faol tanaffuslar va sport.", en: "Active breaks and sport between studies.", ru: "Активные перерывы и спорт между учёбой." },
    challenge: { uz: "Har 45 daqiqalik oʻqishdan keyin 2 daqiqalik tanaffus.", en: "A 2-minute active break after every 45 minutes of study.", ru: "2-минутный активный перерыв после каждых 45 минут учёбы." },
  },
];
