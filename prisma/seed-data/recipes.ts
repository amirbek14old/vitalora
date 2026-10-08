type L = { uz: string; en: string; ru: string };
type LL = { uz: string[]; en: string[]; ru: string[] };

export type RecipeSeed = {
  slug: string;
  title: L;
  description: L;
  ingredients: LL;
  steps: LL;
  cuisine: "uzbek" | "international";
  region?: string;
  foodGroups: string[];
  allergens: string[];
  prepMin: number;
  servings: number;
};

export const recipes: RecipeSeed[] = [
  {
    slug: "vegetable-rich-osh",
    title: { uz: "Sabzavotga boy osh", en: "Vegetable-rich osh (plov)", ru: "Плов с большим количеством овощей" },
    description: {
      uz: "Anʼanaviy oshning muvozanatli varianti: koʻproq sabzi va noʻxat, kamroq yogʻ. Yoniga achchiq-chuchuk salat bilan.",
      en: "A balanced take on the traditional dish: more carrots and chickpeas, less oil. Serve with achichuk salad.",
      ru: "Сбалансированный вариант традиционного блюда: больше моркови и нута, меньше масла. Подавайте с салатом ачичук.",
    },
    ingredients: {
      uz: ["400 g guruch (devzira yoki boshqa)", "400 g sabzi", "300 g mol yoki qoʻy goʻshti (yogʻsiz)", "1 stakan pishgan noʻxat", "2 ta piyoz", "3 osh qoshiq oʻsimlik yogʻi", "1 bosh sarimsoq", "Zira, tuz"],
      en: ["400 g rice (devzira or other)", "400 g carrots", "300 g lean beef or lamb", "1 cup cooked chickpeas", "2 onions", "3 tbsp vegetable oil", "1 head of garlic", "Cumin, salt"],
      ru: ["400 г риса (девзира или другой)", "400 г моркови", "300 г постной говядины или баранины", "1 стакан варёного нута", "2 луковицы", "3 ст. л. растительного масла", "1 головка чеснока", "Зира, соль"],
    },
    steps: {
      uz: ["Guruchni yuvib, 30 daqiqa ivitib qoʻying.", "Qozonda yogʻni qizdirib, goʻsht va piyozni qovuring.", "Somoncha toʻgʻralgan sabzini qoʻshib, yumshaguncha qovuring.", "Noʻxat, zira, tuz va suv qoʻshib, 20 daqiqa qaynating (zirvak).", "Guruchni tekis yoyib, suv qoʻshing; sarimsoqni oʻrtaga qoʻying.", "Suv singgach, qopqogʻini yopib, past olovda 20–25 daqiqa dimlang."],
      en: ["Rinse rice and soak for 30 minutes.", "Heat oil in a heavy pot; brown the meat and onions.", "Add julienned carrots and cook until soft.", "Add chickpeas, cumin, salt and water; simmer 20 minutes (zirvak).", "Spread rice evenly, add water to cover; place garlic in the centre.", "When water is absorbed, cover and steam on low heat for 20–25 minutes."],
      ru: ["Промойте рис и замочите на 30 минут.", "Разогрейте масло в казане, обжарьте мясо и лук.", "Добавьте морковь соломкой, тушите до мягкости.", "Добавьте нут, зиру, соль и воду; томите 20 минут (зирвак).", "Ровно выложите рис, залейте водой; в центр положите чеснок.", "Когда вода впитается, накройте и томите на слабом огне 20–25 минут."],
    },
    cuisine: "uzbek", region: "Toshkent", foodGroups: ["grains", "vegetables", "protein"], allergens: [], prepMin: 90, servings: 6,
  },
  {
    slug: "mastava",
    title: { uz: "Mastava", en: "Mastava (rice and vegetable soup)", ru: "Мастава" },
    description: { uz: "Guruch va sabzavotli toʻyimli shoʻrva.", en: "A hearty soup with rice, vegetables and a little meat.", ru: "Сытный суп с рисом, овощами и небольшим количеством мяса." },
    ingredients: {
      uz: ["200 g yogʻsiz goʻsht", "100 g guruch", "2 ta kartoshka", "1 ta sabzi", "1 ta piyoz", "2 ta pomidor", "Koʻkat, tuz, murch", "Xohishga koʻra qatiq"],
      en: ["200 g lean meat", "100 g rice", "2 potatoes", "1 carrot", "1 onion", "2 tomatoes", "Herbs, salt, pepper", "Optional: plain yogurt (qatiq)"],
      ru: ["200 г постного мяса", "100 г риса", "2 картофелины", "1 морковь", "1 луковица", "2 помидора", "Зелень, соль, перец", "По желанию: катык"],
    },
    steps: {
      uz: ["Goʻshtni mayda toʻgʻrab, piyoz bilan qovuring.", "Sabzi, pomidor va kartoshkani kubik qilib qoʻshing.", "Suv quyib, 20 daqiqa qaynating.", "Yuvilgan guruchni qoʻshib, yumshaguncha pishiring.", "Koʻkat va qatiq bilan torting."],
      en: ["Dice the meat and brown with the onion.", "Add diced carrot, tomato and potato.", "Cover with water and simmer 20 minutes.", "Add rinsed rice and cook until tender.", "Serve with herbs and a spoon of yogurt."],
      ru: ["Нарежьте мясо и обжарьте с луком.", "Добавьте нарезанные кубиком морковь, помидоры и картофель.", "Залейте водой и варите 20 минут.", "Добавьте промытый рис и варите до мягкости.", "Подавайте с зеленью и ложкой катыка."],
    },
    cuisine: "uzbek", foodGroups: ["grains", "vegetables", "protein", "dairy"], allergens: ["milk"], prepMin: 60, servings: 4,
  },
  {
    slug: "achichuk",
    title: { uz: "Achchiq-chuchuk salati", en: "Achichuk salad", ru: "Салат ачичук" },
    description: { uz: "Pomidor va piyozdan yangi salat — oshga ajoyib hamroh.", en: "A fresh tomato and onion salad — a perfect partner for osh.", ru: "Свежий салат из помидоров и лука — идеальная пара к плову." },
    ingredients: {
      uz: ["4 ta pishgan pomidor", "1 ta shirin piyoz", "Rayhon yoki kashnich", "Tuz, qora murch", "Xohishga koʻra achchiq qalampir"],
      en: ["4 ripe tomatoes", "1 sweet onion", "Basil or coriander", "Salt, black pepper", "Optional: chili"],
      ru: ["4 спелых помидора", "1 сладкая луковица", "Базилик или кинза", "Соль, чёрный перец", "По желанию: острый перец"],
    },
    steps: {
      uz: ["Piyozni yupqa halqa qilib toʻgʻrab, tuzlab, sovuq suvda chayqang.", "Pomidorni yupqa boʻlakka kesing.", "Hammasini koʻkat bilan aralashtirib, darhol torting."],
      en: ["Slice onion thinly, salt it and rinse in cold water.", "Slice tomatoes thinly.", "Combine with herbs and serve immediately."],
      ru: ["Тонко нарежьте лук, посолите и промойте холодной водой.", "Тонко нарежьте помидоры.", "Смешайте с зеленью и сразу подавайте."],
    },
    cuisine: "uzbek", foodGroups: ["vegetables"], allergens: [], prepMin: 10, servings: 4,
  },
  {
    slug: "vegetable-shurpa",
    title: { uz: "Sabzavotli shoʻrva", en: "Vegetable shurpa", ru: "Овощная шурпа" },
    description: { uz: "Katta boʻlak sabzavotli tiniq shoʻrva.", en: "A clear soup with large pieces of vegetables.", ru: "Прозрачный суп с крупными кусками овощей." },
    ingredients: {
      uz: ["300 g goʻsht (suyakli)", "3 ta kartoshka", "2 ta sabzi", "1 ta bolgar qalampiri", "2 ta pomidor", "1 ta piyoz", "Noʻxat (ixtiyoriy)", "Koʻkat, tuz"],
      en: ["300 g meat on the bone", "3 potatoes", "2 carrots", "1 bell pepper", "2 tomatoes", "1 onion", "Chickpeas (optional)", "Herbs, salt"],
      ru: ["300 г мяса на кости", "3 картофелины", "2 моркови", "1 болгарский перец", "2 помидора", "1 луковица", "Нут (по желанию)", "Зелень, соль"],
    },
    steps: {
      uz: ["Goʻshtni sovuq suvga solib, koʻpigini olib, 1 soat qaynating.", "Yirik toʻgʻralgan sabzi, piyoz va kartoshkani qoʻshing.", "Qalampir va pomidorni qoʻshib, yana 20 daqiqa pishiring.", "Koʻkat sepib torting."],
      en: ["Cover meat with cold water, skim and simmer 1 hour.", "Add large-cut carrots, onion and potatoes.", "Add pepper and tomatoes; cook 20 more minutes.", "Serve sprinkled with herbs."],
      ru: ["Залейте мясо холодной водой, снимите пену и варите 1 час.", "Добавьте крупно нарезанные морковь, лук и картофель.", "Добавьте перец и помидоры, варите ещё 20 минут.", "Подавайте, посыпав зеленью."],
    },
    cuisine: "uzbek", foodGroups: ["vegetables", "protein"], allergens: [], prepMin: 100, servings: 5,
  },
  {
    slug: "dimlama",
    title: { uz: "Dimlama", en: "Dimlama (layered stew)", ru: "Димлама" },
    description: { uz: "Oʻz sharbatida dimlangan sabzavot va goʻsht.", en: "Meat and vegetables slow-steamed in their own juices.", ru: "Мясо и овощи, тушённые в собственном соку." },
    ingredients: {
      uz: ["300 g goʻsht", "1 ta karam (kichik)", "3 ta kartoshka", "2 ta sabzi", "2 ta bolgar qalampiri", "2 ta pomidor", "1 ta baqlajon", "Piyoz, sarimsoq, tuz"],
      en: ["300 g meat", "1 small cabbage", "3 potatoes", "2 carrots", "2 bell peppers", "2 tomatoes", "1 eggplant", "Onion, garlic, salt"],
      ru: ["300 г мяса", "1 небольшой кочан капусты", "3 картофелины", "2 моркови", "2 болгарских перца", "2 помидора", "1 баклажан", "Лук, чеснок, соль"],
    },
    steps: {
      uz: ["Qozon tagiga goʻsht va piyozni qoʻying.", "Ustiga sabzavotlarni qatlam-qatlam terib, tuzlang.", "Karam barglari bilan yoping.", "Qopqogʻini mahkam yopib, past olovda 1,5 soat dimlang."],
      en: ["Place meat and onion at the bottom of a pot.", "Layer vegetables on top, seasoning each layer.", "Cover with cabbage leaves.", "Close tightly and cook on low heat for 1.5 hours."],
      ru: ["Выложите на дно казана мясо и лук.", "Сверху слоями выложите овощи, присаливая.", "Накройте капустными листьями.", "Плотно закройте и томите на слабом огне 1,5 часа."],
    },
    cuisine: "uzbek", foodGroups: ["vegetables", "protein"], allergens: [], prepMin: 110, servings: 5,
  },
  {
    slug: "fruit-oatmeal",
    title: { uz: "Mevali suli boʻtqasi", en: "Oatmeal with fruit and nuts", ru: "Овсянка с фруктами и орехами" },
    description: { uz: "Tez va toʻyimli nonushta.", en: "A quick, filling breakfast.", ru: "Быстрый сытный завтрак." },
    ingredients: {
      uz: ["½ stakan suli yormasi", "1 stakan sut yoki suv", "1 ta olma yoki banan", "1 osh qoshiq yongʻoq", "Dolchin"],
      en: ["½ cup rolled oats", "1 cup milk or water", "1 apple or banana", "1 tbsp walnuts", "Cinnamon"],
      ru: ["½ стакана овсяных хлопьев", "1 стакан молока или воды", "1 яблоко или банан", "1 ст. л. грецких орехов", "Корица"],
    },
    steps: {
      uz: ["Suli va sutni 5 daqiqa qaynating.", "Toʻgʻralgan meva va dolchin qoʻshing.", "Yongʻoq sepib torting."],
      en: ["Simmer oats in milk for 5 minutes.", "Add chopped fruit and cinnamon.", "Top with walnuts."],
      ru: ["Варите хлопья в молоке 5 минут.", "Добавьте нарезанные фрукты и корицу.", "Посыпьте орехами."],
    },
    cuisine: "international", foodGroups: ["grains", "fruits", "dairy", "fats"], allergens: ["milk", "tree nuts", "gluten (oats may be cross-contaminated)"], prepMin: 10, servings: 1,
  },
  {
    slug: "red-lentil-soup",
    title: { uz: "Qizil yasmiq shoʻrva", en: "Red lentil soup", ru: "Суп из красной чечевицы" },
    description: { uz: "Oʻsimlik oqsiliga boy, arzon va oson shoʻrva.", en: "An affordable, easy soup rich in plant protein.", ru: "Недорогой простой суп, богатый растительным белком." },
    ingredients: {
      uz: ["1 stakan qizil yasmiq", "1 ta piyoz", "1 ta sabzi", "1 osh qoshiq tomat pastasi", "1 litr suv", "Zira, limon, tuz"],
      en: ["1 cup red lentils", "1 onion", "1 carrot", "1 tbsp tomato paste", "1 litre water", "Cumin, lemon, salt"],
      ru: ["1 стакан красной чечевицы", "1 луковица", "1 морковь", "1 ст. л. томатной пасты", "1 литр воды", "Зира, лимон, соль"],
    },
    steps: {
      uz: ["Piyoz va sabzini ozgina yogʻda yumshating.", "Tomat pastasi va ziravorlarni qoʻshing.", "Yasmiq va suvni qoʻshib, 20 daqiqa qaynating.", "Xohishga koʻra ezib, limon bilan torting."],
      en: ["Soften onion and carrot in a little oil.", "Add tomato paste and spices.", "Add lentils and water; simmer 20 minutes.", "Blend if you like; serve with lemon."],
      ru: ["Обжарьте лук и морковь на небольшом количестве масла.", "Добавьте томатную пасту и специи.", "Добавьте чечевицу и воду, варите 20 минут.", "По желанию пюрируйте; подавайте с лимоном."],
    },
    cuisine: "international", foodGroups: ["protein", "vegetables"], allergens: [], prepMin: 30, servings: 4,
  },
  {
    slug: "veggie-omelette",
    title: { uz: "Sabzavotli omlet", en: "Vegetable omelette", ru: "Омлет с овощами" },
    description: { uz: "Oqsil va sabzavotli tezkor taom.", en: "A quick meal with protein and vegetables.", ru: "Быстрое блюдо с белком и овощами." },
    ingredients: {
      uz: ["2 ta tuxum", "½ bolgar qalampiri", "1 ta pomidor", "Bir hovuch ismaloq yoki koʻkat", "Tuz, murch"],
      en: ["2 eggs", "½ bell pepper", "1 tomato", "A handful of spinach or herbs", "Salt, pepper"],
      ru: ["2 яйца", "½ болгарского перца", "1 помидор", "Горсть шпината или зелени", "Соль, перец"],
    },
    steps: {
      uz: ["Sabzavotlarni toʻgʻrab, 2 daqiqa qovuring.", "Tuxumni chayqab quying.", "Past olovda pishguncha qoldiring."],
      en: ["Chop vegetables and sauté for 2 minutes.", "Pour in beaten eggs.", "Cook on low heat until set."],
      ru: ["Нарежьте овощи и обжарьте 2 минуты.", "Влейте взбитые яйца.", "Готовьте на слабом огне до схватывания."],
    },
    cuisine: "international", foodGroups: ["protein", "vegetables"], allergens: ["egg"], prepMin: 10, servings: 1,
  },
  {
    slug: "greek-style-salad",
    title: { uz: "Grekcha salat", en: "Greek-style salad", ru: "Салат по-гречески" },
    description: { uz: "Yangi sabzavot va pishloqli rang-barang salat.", en: "A colourful salad with fresh vegetables and cheese.", ru: "Яркий салат со свежими овощами и сыром." },
    ingredients: {
      uz: ["2 ta bodring", "2 ta pomidor", "1 ta bolgar qalampiri", "50 g brinza", "Zaytun", "Zaytun moyi, limon"],
      en: ["2 cucumbers", "2 tomatoes", "1 bell pepper", "50 g feta or brynza", "Olives", "Olive oil, lemon"],
      ru: ["2 огурца", "2 помидора", "1 болгарский перец", "50 г брынзы или феты", "Оливки", "Оливковое масло, лимон"],
    },
    steps: {
      uz: ["Sabzavotlarni yirik toʻgʻrang.", "Pishloq va zaytunni qoʻshing.", "Moy va limon sharbati bilan aralashtiring."],
      en: ["Chop vegetables into chunks.", "Add cheese and olives.", "Dress with oil and lemon juice."],
      ru: ["Крупно нарежьте овощи.", "Добавьте сыр и оливки.", "Заправьте маслом и лимонным соком."],
    },
    cuisine: "international", foodGroups: ["vegetables", "dairy", "fats"], allergens: ["milk"], prepMin: 10, servings: 2,
  },
];
