# VITALORA

**Yaxshiroq harakat. Yaxshiroq ovqatlanish. Yaxshiroq hayot.**

Bepul, koʻp tilli (oʻzbek, ingliz, rus) sogʻlom turmush taʼlimi platformasi: mashqlar, ovqatlanish, uyqu, odatlar, akademiya, hamjamiyat, AI kamera murabbiy (otjimaniya va oʻtirib-turish texnikasi), tangalar va doʻkon, rasmli profillar va masʼuliyatli AI.

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
7. [Yangi imkoniyatlar: AI kamera murabbiy, tangalar, profillar, mobil](docs/07-yangi-imkoniyatlar.md)

> VITALORA taʼlimiy xizmat. U tibbiy tashxis qoʻymaydi va davolamaydi.
