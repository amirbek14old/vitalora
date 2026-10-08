# VITALORA AI

**Yaxshiroq harakat. Yaxshiroq ovqatlanish. Yaxshiroq hayot.**

Bepul, koʻp tilli (oʻzbek, ingliz, rus) sogʻlom turmush taʼlimi platformasi. Ichida: mashqlar, ovqatlanish, uyqu, odatlar, akademiya, hamjamiyat va masʼuliyatli AI. AI ovqat rasmidan kaloriyani taxminan baholaydi.

**Texnologiyalar:**
- Next.js 15 (App Router), React 19, TypeScript, Tailwind
- PostgreSQL + Prisma 6 (Rust-free)
- Zod, Recharts, Lucide
- Vitest, Playwright

## Tez boshlash
```bash
npm install
cp .env.example .env
npx prisma migrate deploy && npm run db:seed
npm run dev
```

## Hujjatlar (oʻzbek tilida)
1. [Raqobatchilar tahlili](docs/01-raqobatchilar-tahlili.md)
2. [Mahsulot talablari, MVP, sayt xaritasi](docs/02-mahsulot-talablari.md)
3. [Dizayn tizimi](docs/03-dizayn-tizimi.md)
4. [Arxitektura, maʼlumotlar bazasi, API, AI](docs/04-arxitektura.md)
5. [Ishga tushirish, testlar, deploy](docs/05-test-va-deploy.md)
6. [Xavfsizlik, maxfiylik, yoʻl xaritasi](docs/06-xavfsizlik-va-yol-xaritasi.md)

> VITALORA taʼlimiy xizmat. U tibbiy tashxis qoʻymaydi va davolamaydi.
