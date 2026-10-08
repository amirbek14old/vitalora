# 5. Ishga tushirish, testlar va deploy

## Lokal ishga tushirish
Talablar: Node.js 20+ (22 tavsiya etiladi), PostgreSQL 14+.

```bash
npm install
cp .env.example .env        # DATABASE_URL va (ixtiyoriy) AI_* qiymatlarini kiriting
npx prisma migrate deploy   # migratsiyani qoʻllash
npm run db:seed             # kontent + admin hisobi (SEED_ADMIN_*)
npm run dev                 # http://localhost:3000
```

Admin: `.env` dagi `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`. Birinchi kirishda parolni oʻzgartiring.

### AI ni yoqish
`.env` faylida quyidagilarni toʻldiring:
```
AI_PROVIDER="anthropic"            # yoki "openai"
AI_API_KEY="..."
AI_MODEL="<matn modeli id>"
AI_VISION_MODEL="<rasmni qoʻllaydigan model id>"   # ovqat rasmi uchun shart
AI_BASE_URL=""                     # OpenAI-mos boshqa provayder boʻlsa
```

Keyin ilovada **Sozlamalar → AI imkoniyatlarini yoqish** belgisini qoʻying. Kalit boʻlmasa, sayt ishlaydi, faqat AI boʻlimlari "sozlanmagan" deb koʻrsatiladi.

## Testlar
| Buyruq | Nima tekshiradi |
|---|---|
| `npm run typecheck` | TypeScript (strict) |
| `npm test` | Vitest — 46 ta unit test: xavfsizlik filtrlari (uz/en/ru), ovqat JSON tahlili va hisob-kitoblar, fayl turini aniqlash, tartib tuzuvchi, tavsiyalar, yosh qoidalari, validatsiya, moderatsiya, lugʻatlarning toʻliqligi |
| `npm run build && npm run test:e2e` | Playwright (desktop + Pixel 7): toʻliq foydalanuvchi yoʻli, oʻsmir rejimi, xavfsizlik |

**E2E toʻliq yoʻl testi tekshiradi:** roʻyxatdan oʻtish → onboarding → odat → tartib → uyqu → dars va test → AI rozilik → chat → xavfsizlik javobi → ovqat rasmi (porsiyani oʻzgartirish) → yutuqlar → eksport → til almashtirish → hisobni oʻchirish.

E2E AI uchun `e2e/mock-ai-server.mjs` ishlatiladi. Bu **faqat test** uchun: haqiqiy marshrutlar (auth, rozilik, validatsiya, JSON tahlil) tekshiriladi, pullik kalit kerak emas.

**E2E uchun alohida test bazasi ishlating.** Roʻyxatdan oʻtish soatiga 5 ta bilan cheklangan. Testlarni qayta ishga tushirishdan oldin `RateLimitBucket` jadvalini tozalang.

**Qoʻlda tekshirish roʻyxati:**
- Klaviatura bilan barcha sahifalarni aylanib chiqing.
- Ekran oʻquvchi bilan tekshiring (VoiceOver/NVDA).
- 200% kattalashtirishda koʻring.
- Qorongʻi rejimni tekshiring.
- Lighthouse Accessibility natijasi ≥ 95 boʻlishi kerak.

## Vercel'ga deploy
1. GitHub'ga yuklang va Vercel'da import qiling (Framework: Next.js).
2. Boshqariladigan PostgreSQL ulang (Neon, Supabase yoki Vercel Postgres).
3. Environment Variables'ni kiriting:

   | Oʻzgaruvchi | Izoh |
   |---|---|
   | `DATABASE_URL` | pooled ulanish satri |
   | `AI_*` | AI provayder sozlamalari |
   | `CRON_SECRET` | uzun tasodifiy satr |
   | `APP_URL` | sayt manzili |

4. Build buyrugʻi: `npm run build` (ichida `prisma generate` bor).
5. Migratsiya: `npx prisma migrate deploy`. Uni deploydan oldin CI'da yoki "Build Command"ga qoʻshib bajaring: `prisma migrate deploy && npm run build`.
6. Seed: bir marta lokal kompyuterdan, `DATABASE_URL` production bazaga qaratilgan holda `npm run db:seed`.
7. `vercel.json` har kuni soat 03:00 UTC da `/api/cron/retention` ni chaqiradi. Vercel `CRON_SECRET` ni avtomatik Bearer sifatida yuboradi.

**Ishga tushirishdan oldin:**
- Huquqiy matnlarni yuristga koʻrsating.
- AI provayder bilan maʼlumotlarni qayta ishlash shartnomasini (DPA) tekshiring.
- Moderatorlarni tayinlang.
- Xatoliklarni kuzatish tizimini ulang (masalan, Sentry). Hozir xatolar `ErrorLog` jadvaliga va admin panelga yoziladi.

## Muhim eslatma (migratsiya)
`prisma/migrations/20261008000000_init/migration.sql` qoʻlda yozilgan va Postgres 16'da sinovdan oʻtgan. Ishlab chiqish muhitida u sxema bilan farq qilsa, `npx prisma migrate dev` buni koʻrsatadi. Bunday holda yangi bazada `npx prisma migrate reset` qiling.

Sabab: ishlab chiqish muhitimda Prisma migratsiya dvigateli yuklab olinmadi.
