# 7. Yangi imkoniyatlar (2026-yil oktabr)

## AI kamera murabbiy — `/fitness/coach`

Kamera orqali mashqlar texnikasini tekshiradi.

**Qanday ishlaydi:**
- Tana holati **MediaPipe Pose Landmarker** (lite) modeli bilan aniqlanadi.
- Hisoblash **qurilmaning oʻzida** bajariladi (WebAssembly yoki GPU).
- Video hech qayerga yuklanmaydi va saqlanmaydi.

**Mashqlar:** otjimaniya va oʻtirib-turish.

**Takrorlarni sanash** (`src/lib/pose/analyze.ts`):
- Tirsak yoki tizza burchagi kuzatiladi.
- Pastki va yuqori chegaralar orasida gisterezis ishlatiladi — tasodifiy tebranishlar takror sifatida sanalmaydi.

**Har bir takrorga 0–100 baho.** Quyidagi xatolar tekshiriladi:
- yetarli chuqur tushmaslik;
- bel egilishi yoki sonni koʻtarish;
- yuqorida qoʻl yoki oyoqni toʻliq toʻgʻrilamaslik;
- juda tez bajarish;
- oʻtirib-turishda oldinga ortiqcha engashish.

**Qoʻshimcha imkoniyatlar:**
- Ekranda va ovozda real vaqtda maslahat beriladi.
- Set yakunida natija `FormCheckSession` jadvaliga va mashgʻulotlar tarixiga yoziladi.
- Har bir toʻgʻri takror uchun 1 tanga beriladi.
- AI roziligi boʻlsa, **AI murabbiy maslahatlari** olish mumkin. Bunda AI'ga faqat raqamlar yuboriladi, rasm yuborilmaydi.

**Texnik eslatmalar:**
- WASM fayllar `npm install` paytida `public/mediapipe/wasm` papkasiga nusxalanadi (`scripts/copy-mediapipe.mjs`).
- Model fayli `storage.googleapis.com` dan yuklanadi, shuning uchun u CSP'da ruxsat etilgan.
- Kamera faqat **HTTPS** yoki `localhost` da ishlaydi. Telefonda Vercel havolasi orqali sinang.

**Cheklov:** algoritm sintetik maʼlumotlarda unit-testdan oʻtgan. Haqiqiy kamerada turli odamlar bilan sinab koʻrish va chegaralarni sozlash kerak.

## Tangalar, doʻkon va Pro — `/shop`

**Tangalar daftari:**
- Har bir mukofot `CoinTransaction` jadvaliga yoziladi.
- `refKey` noyob, shuning uchun bitta vazifa uchun ikki marta tanga berilmaydi.
- Kunlik chegaralar `src/lib/coin-rules.ts` faylida.

**Tanga qanday olinadi:**

| Harakat | Tanga | Chegara |
|---|---|---|
| Mashgʻulot | +10 | kuniga 3 ta |
| Uyqu qaydi | +5 | kuniga 1 ta |
| Odat belgisi | +2 | kuniga 10 ta |
| Dars | +15 | — |
| Aʼlo test | +10 | — |
| Ovqat kundaligi | +3 | kuniga 2 ta |
| Yutuq | +20 | — |
| AI murabbiy | har toʻgʻri takror uchun +1 | setda 25, kuniga 50 |

**Xarid:**
- Balansni tekshirish va tangani yechish bitta shartli `UPDATE` bilan bajariladi, shuning uchun balans manfiy boʻlmaydi.
- Bu bir vaqtdagi xaridlar testida tekshirilgan.

**Pro:**
- 500 tanga evaziga 30 kunga beriladi.
- Imkoniyatlari: AI limitlari 2 barobar koʻp, faqat Pro uchun bezaklar, PRO belgisi.
- Tangalarni pulga sotib olib boʻlmaydi. Bu qasddan qilingan: oʻsmirlar uchun xavfsiz va toʻlov tizimi kerak emas.

## Profil rasmi va bezaklar

- **Rasm:**
  - Brauzerda 256×256 oʻlchamga qirqiladi, EXIF va GPS maʼlumotlari oʻchiriladi.
  - `Avatar` jadvalida saqlanadi (≤256 KB). Fayl turi magic bytes orqali tekshiriladi.
- **Bezaklar:** ramka, banner, ism rangi, nishon. Ular `src/lib/cosmetics.ts` faylida tavsiflangan.
- **Ommaviy profil `/u/[id]`:**
  - Faqat tizimga kirgan aʼzolar koʻradi.
  - Faqat egasi "Hamjamiyatda koʻrinish" sozlamasini yoqqan boʻlsa ochiladi. Standart holatda oʻchiq.
- Hamjamiyat postlarida avatar, ramka, ism rangi va nishon koʻrsatiladi.

## Mobil qulaylik

- **Pastki tab-panel:** Asosiy, Fitnes, AI murabbiy, Odatlar, Profil. iPhone'dagi xavfsiz hudud hisobga olingan.
- **PWA:** `manifest.webmanifest` va ikonkalar bor, saytni "Bosh ekranga qoʻshish" mumkin.
- Telefonda maydonga bosilganda iOS ekranni kattalashtirib yubormaydi (16 px shrift).
- Parolni koʻrsatish tugmasi qoʻshildi.
- Kirgandan keyin foydalanuvchi ochmoqchi boʻlgan sahifaga qaytadi (`?next=`). Ochiq qayta yoʻnaltirish (open-redirect) himoyasi bor.
- **Chiqish** tugmasi profil sahifasida va mobil menyuda bor.

## Yangilash tartibi

```bash
npm install                  # MediaPipe WASM ham nusxalanadi
npx prisma migrate deploy    # 20261009000000_coins_profiles_coach migratsiyasi
npm run db:seed              # doʻkon buyumlari
```

## Testlar

| Test turi | Natija |
|---|---|
| Unit | 54 ta (shu jumladan 8 ta poza tahlili testi) |
| Integratsiya | 7 ta tanga testi; `DATABASE_URL` kerak |
| E2E (Playwright) | 13 ta: auth va `next`, tanga va doʻkon, avatar yuklash, AI murabbiy sahifasi, mobil tab-panel |
