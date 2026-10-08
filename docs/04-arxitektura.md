# 4. Arxitektura

## Umumiy sxema
```
Brauzer (React 19, Next.js App Router, Tailwind)
   │  Server Actions (formalar)        │  REST: /api/ai/*, /api/account/export
   ▼                                   ▼
Next.js server (Node, Vercel Functions)
   ├─ middleware.ts        → himoyalangan yoʻllar, CSP
   ├─ lib/auth             → bcrypt, DB sessiyalar (token xeshi), rollar
   ├─ lib/validation (Zod) → barcha kirishlar tekshiriladi
   ├─ lib/rate-limit       → Postgres'da saqlanadigan limitlar
   ├─ lib/ai               → provayder interfeysi + xavfsizlik + promptlar
   └─ lib/db (Prisma 6, Rust-free client + @prisma/adapter-pg)
            ▼
       PostgreSQL (Neon / Supabase / RDS)        AI provayder (Anthropic / OpenAI-mos)
```

## Muhim arxitektura qarorlari
1. **Server Actions + kerakli joyda REST.**
   - Oddiy formalarda (odat, uyqu, mashgʻulot) Server Actions ishlatiladi. Ular JS yuklanmasdan ham ishlaydi va CSRF himoyasi Next ichida bor.
   - AI va fayl yuklashda JSON/multipart REST ishlatiladi. Bu yoʻllarda `Origin` tekshiriladi.
2. **Oʻzimizning sessiya tizimi** (NextAuth emas).
   - 32 baytli tasodifiy token. Bazada faqat uning SHA-256 xeshi saqlanadi.
   - Cookie: `httpOnly`, `sameSite=lax`, ishlab chiqarishda `secure`, muddati 30 kun.
   - Sabab: kam bogʻliqlik, toʻliq nazorat, sessiyani bekor qilish oson (parol oʻzgarsa, boshqa sessiyalar oʻchadi).
3. **Rust-free Prisma** (`engineType = "client"`). Vercel'da binar fayl yoʻq, cold start tez.
4. **Rate limit Postgres'da.** Serverless'da xotira umumiy emas, shuning uchun Redis'siz ishlaydigan atomar `INSERT … ON CONFLICT` ishlatiladi.
5. **i18n** — cookie va `Accept-Language` asosida. URL'da til prefiksi yoʻq.
   - UI matnlari: `src/lib/i18n/dictionaries/{uz,en,ru}.ts`. TypeScript kalitlar bir xilligini majburlaydi.
   - Bazadagi kontent: `{uz,en,ru}` JSON maydonlarda.
6. **AI provayderdan mustaqil.**
   - `AIProvider` interfeysi bor. Anthropic va OpenAI-mos API'lar `fetch` orqali ulanadi, SDK kerak emas.
   - Kalit faqat serverda (`server-only`).
   - Kalit boʻlmasa, aniq "sozlanmagan" xabari chiqadi — soxta javob qaytarilmaydi.

## Papka tuzilmasi
```
vitalora-ai/
├─ prisma/
│  ├─ schema.prisma
│  ├─ migrations/20261008000000_init/
│  ├─ seed.ts
│  └─ seed-data/              (mashqlar, retseptlar, kurslar, yutuqlar, hamjamiyatlar)
├─ src/
│  ├─ middleware.ts
│  ├─ app/
│  │  ├─ (public)/            bosh sahifa, about, features, login, register, privacy, terms, help
│  │  ├─ (app)/               dashboard, fitness, nutrition, sleep, habits, assistant, academy,
│  │  │                       community, achievements, profile, settings, admin
│  │  ├─ onboarding/
│  │  ├─ actions/             Server Actions (auth, fitness, sleep, habits, academy, community, account, meals, admin)
│  │  └─ api/                 ai/chat, ai/food-scan, account/export, cron/retention, health
│  ├─ components/             ui/, fitness/, nutrition/, sleep/, habits/, academy/, community/, assistant/, admin/, settings/
│  ├─ content/legal.ts        maxfiylik va shartlar (3 tilda)
│  ├─ lib/                    auth/, ai/, i18n/, db, validation, rate-limit, stats, routine,
│  │                          recommendations, achievements, moderation, retention, audit, age, utils
│  └─ tests/                  Vitest unit testlar
├─ e2e/                       Playwright testlar + TEST uchun mock AI server
├─ docs/                      ushbu hujjatlar
└─ vercel.json                retention cron
```

## Maʼlumotlar bazasi
Toʻliq sxema: `prisma/schema.prisma`. Asosiy jadvallar:

| Guruh | Jadvallar |
|---|---|
| Hisob | User, Session, Profile, Preference |
| Fitnes | Exercise, WorkoutSession, WorkoutLog |
| Ovqatlanish | Recipe, NutritionLesson, MealLog |
| Uyqu va odatlar | SleepLog, Habit, HabitEntry |
| Taʼlim | Course, Lesson, QuizQuestion, QuizAttempt, LessonProgress |
| Motivatsiya | Achievement, UserAchievement |
| Hamjamiyat | Community, CommunityMember, CommunityPost, Report |
| AI | AIConversation, AIMessage |
| Tizim | Notification, AuditLog, ErrorLog, RateLimitBucket |

**Qoidalar:**
- Har bir sogʻliq jadvali `userId` orqali egasiga bogʻlangan va `onDelete: Cascade`. Hisob oʻchsa, maʼlumot ham oʻchadi.
- Barcha soʻrovlarda `where: { id, userId }` — egalik tekshiruvi.
- Indekslar: `(userId, date)`, `(communityId, status, createdAt)` va boshqalar.
- Unikal cheklovlar:
  - `(userId, date)` — uyqu;
  - `(habitId, date)` — odat;
  - `(postId, reporterId)` — shikoyat.

## API va Server Actions

| Yoʻl | Usul | Himoya | Vazifa |
|---|---|---|---|
| `/api/ai/chat` | POST JSON `{message, conversationId?, mode}` | sessiya, rozilik, origin, 30/soat | suhbat, retsept gʻoyalari, maslahat |
| `/api/ai/food-scan` | POST multipart `image` | sessiya, rozilik, origin, 15/soat, ≤4 MB, magic bytes | rasm bahosi |
| `/api/account/export` | GET | sessiya | barcha shaxsiy maʼlumot JSON (parol xeshisiz) |
| `/api/cron/retention` | GET | `Authorization: Bearer CRON_SECRET` | saqlash muddati tozalash |
| `/api/health` | GET | — | DB holati |

Server Actions roʻyxati: `src/app/actions/*.ts`. Har biri `assertUser()` yoki `assertRole()` bilan boshlanadi, keyin Zod tekshiruvi keladi.

## AI integratsiyasi

**Chat soʻrovi bosqichlari:**
1. **Kirish filtri** (`lib/ai/safety.ts`): oʻz joniga qasd, shoshilinch holat yoki ovqatdan voz kechish iboralari aniqlansa, model chaqirilmaydi. Tayyor xavfsiz javob qaytariladi (uz/en/ru).
2. **System prompt** (`lib/ai/prompts.ts`):
   - tashxis yoʻq, dori yoʻq, qatʼiy parhez yoʻq;
   - manba oʻylab topilmaydi;
   - til qatʼiy belgilangan;
   - oʻsmir rejimi alohida.
3. **Shaxsiylashtirish** faqat alohida rozilik bilan. Modelga faqat haftalik umumiy raqamlar yuboriladi.
4. **Chiqish filtri:** juda past kaloriya tavsiyasi bloklanadi. Oʻsmirlarga kaloriya raqamlari oʻchiriladi.
5. **Saqlash:** suhbat bazaga yoziladi, xavfsizlik bayrogʻi bilan. 90 kundan keyin avtomatik oʻchiriladi.
