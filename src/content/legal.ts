import type { Locale } from "@/lib/i18n/config";

type Section = { h: string; p: string[] };
export const LEGAL_UPDATED = "2026-10-08";

export const privacy: Record<Locale, Section[]> = {
  en: [
    { h: "What we collect", p: ["Account: email, hashed password, display name and birth year (used only to provide age-appropriate content).", "Data you choose to log: workouts, sleep journal, habits, meal journal, lesson progress, community posts and AI conversations.", "Technical data: session cookie and minimal security logs (e.g. login events). We do not use advertising trackers."] },
    { h: "How we use it", p: ["To provide the features you use, to keep your account secure, and to show you your own progress.", "We never sell personal data and never show health logs publicly."] },
    { h: "AI features", p: ["AI features are off until you enable them in Settings.", "When enabled, your messages (and food photos you submit) are sent to our AI provider to generate an answer. Photos are processed in memory and not stored by VITALORA.", "A summary of your own weekly activity is only shared with the AI if you separately enable personalisation. It never includes your name, email or notes."] },
    { h: "Teen accounts (13–17)", p: ["Teen accounts have privacy-protective defaults: community visibility is off, calorie numbers are hidden, and AI responses are age-aware.", "We recommend that teens use VITALORA with the knowledge of a parent or guardian."] },
    { h: "Retention", p: ["AI conversations are deleted after 90 days of inactivity. Read notifications after 60 days. Security audit logs after 365 days. Error logs after 30 days.", "Everything else is kept until you delete it or your account."] },
    { h: "Your rights", p: ["Download all your data as JSON and permanently delete your account in Settings → Your data.", "You can withdraw any consent at any time in Settings."] },
    { h: "Security", p: ["Passwords are hashed with bcrypt; session tokens are stored only as hashes; all traffic should be served over HTTPS; input is validated server-side and sensitive actions are rate-limited."] },
  ],
  uz: [
    { h: "Qanday maʼlumot yigʻamiz", p: ["Hisob: email, xeshlangan parol, koʻrinadigan ism va tugʻilgan yil (faqat yoshga mos kontent uchun).", "Siz yozishni tanlagan maʼlumotlar: mashgʻulotlar, uyqu kundaligi, odatlar, ovqat kundaligi, dars natijalari, hamjamiyat postlari va AI suhbatlari.", "Texnik maʼlumotlar: sessiya cookie fayli va minimal xavfsizlik jurnallari (masalan, kirish hodisalari). Reklama kuzatuvchilaridan foydalanmaymiz."] },
    { h: "Qanday foydalanamiz", p: ["Siz foydalanadigan imkoniyatlarni taqdim etish, hisobingiz xavfsizligini taʼminlash va oʻz natijalaringizni koʻrsatish uchun.", "Shaxsiy maʼlumotlarni hech qachon sotmaymiz va sogʻliq qaydlarini ommaga koʻrsatmaymiz."] },
    { h: "AI imkoniyatlari", p: ["AI imkoniyatlari Sozlamalarda yoqmaguningizcha oʻchiq turadi.", "Yoqilganda xabarlaringiz (va yuborgan ovqat rasmlaringiz) javob tayyorlash uchun AI provayderimizga yuboriladi. Rasmlar xotirada qayta ishlanadi va VITALORA tomonidan saqlanmaydi.", "Haftalik faolligingiz xulosasi faqat shaxsiylashtirishni alohida yoqsangiz AI bilan ulashiladi. Unda ismingiz, emailingiz yoki izohlaringiz hech qachon boʻlmaydi."] },
    { h: "Oʻsmirlar hisobi (13–17)", p: ["Oʻsmirlar hisoblarida maxfiylikni himoya qiluvchi standart sozlamalar bor: hamjamiyatda koʻrinish oʻchiq, kaloriya raqamlari yashirilgan, AI javoblari yoshga mos.", "Oʻsmirlarga VITALORA'dan ota-ona yoki vasiy xabardorligida foydalanishni tavsiya qilamiz."] },
    { h: "Saqlash muddati", p: ["AI suhbatlari 90 kun faolsizlikdan keyin oʻchiriladi. Oʻqilgan bildirishnomalar — 60 kun, xavfsizlik audit jurnallari — 365 kun, xato jurnallari — 30 kundan keyin.", "Qolgan maʼlumotlar siz ularni yoki hisobingizni oʻchirguningizcha saqlanadi."] },
    { h: "Huquqlaringiz", p: ["Sozlamalar → Maʼlumotlaringiz boʻlimida barcha maʼlumotlaringizni JSON shaklida yuklab olishingiz va hisobingizni butunlay oʻchirishingiz mumkin.", "Har qanday rozilikni istalgan vaqtda Sozlamalarda qaytarib olishingiz mumkin."] },
    { h: "Xavfsizlik", p: ["Parollar bcrypt bilan xeshlanadi; sessiya tokenlari faqat xesh koʻrinishida saqlanadi; barcha trafik HTTPS orqali boʻlishi kerak; kiritilgan maʼlumotlar serverda tekshiriladi va muhim amallar cheklanadi."] },
  ],
  ru: [
    { h: "Что мы собираем", p: ["Аккаунт: email, хеш пароля, отображаемое имя и год рождения (только для подбора контента по возрасту).", "Данные, которые вы решаете записывать: тренировки, дневник сна, привычки, дневник питания, прогресс в уроках, посты в сообществе и диалоги с ИИ.", "Технические данные: cookie сессии и минимальные журналы безопасности (например, входы). Рекламные трекеры не используются."] },
    { h: "Как мы используем данные", p: ["Чтобы предоставлять функции, которыми вы пользуетесь, защищать аккаунт и показывать ваш собственный прогресс.", "Мы никогда не продаём персональные данные и не публикуем записи о здоровье."] },
    { h: "Функции ИИ", p: ["Функции ИИ выключены, пока вы не включите их в Настройках.", "После включения ваши сообщения (и отправленные фото еды) передаются нашему ИИ-провайдеру для генерации ответа. Фото обрабатываются в памяти и не хранятся в VITALORA.", "Сводка вашей недельной активности передаётся ИИ только при отдельном включении персонализации. Она никогда не содержит имени, email или заметок."] },
    { h: "Подростковые аккаунты (13–17)", p: ["У подростковых аккаунтов защищённые настройки по умолчанию: видимость в сообществе выключена, калории скрыты, ответы ИИ учитывают возраст.", "Рекомендуем подросткам пользоваться VITALORA с ведома родителей или опекунов."] },
    { h: "Сроки хранения", p: ["Диалоги с ИИ удаляются через 90 дней неактивности. Прочитанные уведомления — через 60 дней, журналы аудита — через 365 дней, журналы ошибок — через 30 дней.", "Остальное хранится, пока вы не удалите данные или аккаунт."] },
    { h: "Ваши права", p: ["В разделе Настройки → Ваши данные можно скачать все данные в JSON и навсегда удалить аккаунт.", "Любое согласие можно отозвать в Настройках в любое время."] },
    { h: "Безопасность", p: ["Пароли хешируются bcrypt; токены сессий хранятся только в виде хешей; весь трафик должен идти по HTTPS; ввод проверяется на сервере, чувствительные действия ограничены по частоте."] },
  ],
};

export const terms: Record<Locale, Section[]> = {
  en: [
    { h: "Educational service", p: ["VITALORA AI provides general health, sport, nutrition and sleep education. It is not a medical service and does not diagnose, treat or prescribe.", "Consult a qualified professional before starting new exercise if you have health conditions, injuries or are pregnant."] },
    { h: "Eligibility", p: ["You must be at least 13 years old. Users aged 13–17 receive a teen account with additional protections."] },
    { h: "AI limitations", p: ["AI answers and food photo estimates can be inaccurate. Do not rely on them for medical decisions."] },
    { h: "Community rules", p: ["Be kind. No harassment, body-shaming, medical claims, spam, or sharing other people's private information. We may hide content and suspend accounts that break these rules."] },
    { h: "Your content", p: ["You keep ownership of what you post. You give us permission to display your community posts to other members of that group."] },
    { h: "Changes and termination", p: ["You can delete your account at any time. We may update these terms and will show the update date on this page."] },
  ],
  uz: [
    { h: "Taʼlimiy xizmat", p: ["VITALORA AI sogʻliq, sport, ovqatlanish va uyqu boʻyicha umumiy taʼlim beradi. Bu tibbiy xizmat emas: tashxis qoʻymaydi, davolamaydi va dori yozmaydi.", "Sogʻligʻingizda muammo, jarohat boʻlsa yoki homilador boʻlsangiz, yangi mashqlarni boshlashdan oldin malakali mutaxassis bilan maslahatlashing."] },
    { h: "Foydalanish huquqi", p: ["Kamida 13 yoshda boʻlishingiz kerak. 13–17 yoshdagilar qoʻshimcha himoyali oʻsmir hisobini oladi."] },
    { h: "AI cheklovlari", p: ["AI javoblari va ovqat rasmi baholari notoʻgʻri boʻlishi mumkin. Tibbiy qarorlar uchun ularga tayanmang."] },
    { h: "Hamjamiyat qoidalari", p: ["Mehribon boʻling. Haqorat, tana haqida kamsitish, tibbiy daʼvolar, spam va boshqalarning shaxsiy maʼlumotlarini tarqatish taqiqlanadi. Qoidalarni buzgan kontentni yashirishimiz va hisoblarni toʻxtatishimiz mumkin."] },
    { h: "Sizning kontentingiz", p: ["Joylagan kontentingiz sizga tegishli boʻlib qoladi. Hamjamiyat postlaringizni shu guruh aʼzolariga koʻrsatishga ruxsat berasiz."] },
    { h: "Oʻzgarishlar va tugatish", p: ["Hisobingizni istalgan vaqtda oʻchirishingiz mumkin. Shartlarni yangilashimiz mumkin va yangilanish sanasini shu sahifada koʻrsatamiz."] },
  ],
  ru: [
    { h: "Образовательный сервис", p: ["VITALORA AI даёт общие знания о здоровье, спорте, питании и сне. Это не медицинская услуга: мы не ставим диагнозы, не лечим и не назначаем лекарства.", "При заболеваниях, травмах или беременности проконсультируйтесь со специалистом перед началом новых упражнений."] },
    { h: "Возраст", p: ["Вам должно быть не менее 13 лет. Пользователи 13–17 лет получают подростковый аккаунт с дополнительной защитой."] },
    { h: "Ограничения ИИ", p: ["Ответы ИИ и оценки по фото могут быть неточными. Не используйте их для медицинских решений."] },
    { h: "Правила сообщества", p: ["Будьте доброжелательны. Запрещены оскорбления, бодишейминг, медицинские заявления, спам и раскрытие чужих личных данных. Мы можем скрывать контент и блокировать аккаунты нарушителей."] },
    { h: "Ваш контент", p: ["Вы остаётесь владельцем опубликованного. Вы разрешаете показывать ваши посты участникам соответствующей группы."] },
    { h: "Изменения и прекращение", p: ["Вы можете удалить аккаунт в любое время. Мы можем обновлять условия и укажем дату обновления на этой странице."] },
  ],
};
