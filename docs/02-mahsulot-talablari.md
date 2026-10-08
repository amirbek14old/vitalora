# 2. Mahsulot talablari hujjati (PRD)

## Vizyon
**VITALORA AI** — *Yaxshiroq harakat. Yaxshiroq ovqatlanish. Yaxshiroq hayot.*

Bu harakat, muvozanatli ovqatlanish, uyqu va sogʻlom odatlar boʻyicha bepul va koʻp tilli taʼlim platformasi. Unda masʼuliyatli AI yordamchisi bor.

## Foydalanuvchi personalari (gipotezalar — intervyu bilan tasdiqlanadi)

| Persona | Tavsif | Ehtiyoj | Asosiy funksiya |
|---|---|---|---|
| **Dilnoza, 16, maktab oʻquvchisi** | Telefondan foydalanadi, soati yoʻq | Xavfsiz, qiziqarli bilim, uyqu | Akademiya, odatlar, oʻsmir rejimi |
| **Jasur, 28, ofis xodimi** | Kun boʻyi oʻtiradi, vaqti kam | 10–15 daqiqalik mashqlar, tanaffuslar | Tartib tuzuvchi, odatlar |
| **Malika, 35, ona** | Oila uchun pishiradi | Sogʻlom oʻzbek retseptlari, ovqat tarkibini tushunish | Retseptlar, ovqat rasmi |
| **Aleksandr, 45, boshlovchi** | Rus tilida, jarohatdan qoʻrqadi | Xavfsiz texnika, sekin rivojlanish | Mashq kutubxonasi, AI yordamchi |

## Muammolar ustuvorligi
1. Foydali funksiyalar pullik → **asosiy funksiyalar bepul**.
2. Qurilma talab qilinadi → **qoʻlda kiritish yetarli**.
3. Oʻzbek tilida sifatli kontent yoʻq → **uch til, oʻzbek oshxonasi**.
4. Kaloriya va raqobat bosimi → **taʼlim, shaxsiy nishonlar, oʻsmirlar uchun kaloriyasiz rejim**.
5. AI xavfi (notoʻgʻri tibbiy maslahat) → **himoya qatlamlari, rozilik, cheklovlar haqida aniq ogohlantirish**.

## MVP funksiyalari va holati

| Funksiya | Holat |
|---|---|
| Roʻyxatdan oʻtish, kirish, sessiyalar, rollar | ✅ Tayyor |
| Onboarding (daraja, maqsad, vaqt, boshlangʻich odatlar) | ✅ |
| Boshqaruv paneli: haftalik grafik, statistika, tavsiyalar, AI maslahat | ✅ |
| Mashq kutubxonasi (19 mashq, 3 tilda), filtr, batafsil sahifa, muqobillar | ✅ |
| Tartib tuzuvchi (vaqt / daraja / yoʻnalish) va natijani yozish | ✅ |
| Mashgʻulotlar tarixi | ✅ |
| Ovqatlanish akademiyasi, 9 retsept (5 ta oʻzbekcha), testlar, AI retsept gʻoyalari | ✅ |
| **Ovqat rasmi → kaloriya va makronutrient bahosi** | ✅ (AI provayder kaliti kerak) |
| Uyqu kundaligi, haftalik xulosa, kechki tartib, nafas mashqi | ✅ |
| Odatlar: qoʻshish, toʻxtatish, oʻchirish, 7 kunlik belgilash | ✅ |
| AI yordamchi: suhbatlar tarixi, xavfsizlik filtrlari | ✅ (kalit kerak) |
| Akademiya: 4 kurs, 9 dars, testlar, sertifikat | ✅ |
| Hamjamiyat: guruhlar, postlar, javoblar, shikoyat, moderatsiya | ✅ |
| Yutuqlar (11 nishon), bildirishnomalar (ilova ichida) | ✅ |
| Profil, sozlamalar, rozilik, maʼlumot eksporti, hisobni oʻchirish | ✅ |
| Admin: statistika, moderatsiya, kontent eʼloni, rollar, xatolar, audit | ✅ |
| Video darsliklar | ⏳ Maydon tayyor; litsenziyalangan video yoʻq |
| Push/email eslatmalar | ⏳ Sozlama saqlanadi, yetkazish yoʻq |
| Aqlli qurilmalar integratsiyasi | ⏳ 4-bosqich |
| Admin: mashq/kursni toʻliq tahrirlash formasi | ⏳ Hozir faqat eʼlon/tekshiruv; retsept qoʻshish formasi bor |

## Ovqat rasmi funksiyasi (siz soʻragan qoʻshimcha)

**Ishlash tartibi:**
1. Foydalanuvchi telefonda kamerani ochadi (`capture="environment"`) yoki rasm yuklaydi.
2. Brauzer rasmni 1280 px gacha kichraytiradi. Bunda EXIF, jumladan GPS joylashuvi, olib tashlanadi.
3. Server tekshiruvlari:
   - foydalanuvchi tizimga kirganmi;
   - AI roziligi berilganmi;
   - soatiga 15 ta soʻrov chegarasi;
   - fayl 4 MB dan oshmaydimi;
   - fayl turi "magic bytes" orqali tekshiriladi.
4. Rasm vision modelga yuboriladi. Model qatʼiy JSON qaytaradi: taomlar, gramm, kkal, oqsil, uglevod, yogʻ, guruh, ishonchlilik.
5. Javob Zod bilan tekshiriladi. Notoʻgʻri javob qabul qilinmaydi.
6. Foydalanuvchi porsiyani oʻzgartira oladi — qiymatlar mutanosib qayta hisoblanadi. Keyin kundalikka saqlaydi.
7. **Oʻsmirlarga** raqamlar serverda olib tashlanadi. Ular faqat taom nomi, porsiya va guruhni koʻradi.
8. Rasm **saqlanmaydi**. Faqat natija saqlanadi.

## Sayt xaritasi

| Boʻlim | Sahifalar |
|---|---|
| Ommaviy | `/`, `/about`, `/features`, `/login`, `/register`, `/privacy`, `/terms`, `/help` |
| Onboarding | `/onboarding` |
| Asosiy | `/dashboard` |
| Fitnes | `/fitness`, `/fitness/[slug]`, `/fitness/history` |
| Ovqatlanish | `/nutrition`, `/nutrition/recipes`, `/nutrition/recipes/[slug]`, `/nutrition/scan` |
| Uyqu va odatlar | `/sleep`, `/habits` |
| AI | `/assistant` |
| Akademiya | `/academy`, `/academy/[course]`, `/academy/[course]/[lesson]`, `/academy/[course]/certificate` |
| Hamjamiyat | `/community`, `/community/[slug]` |
| Shaxsiy | `/achievements`, `/profile`, `/settings` |
| Boshqaruv | `/admin` |
| API | `/api/ai/chat`, `/api/ai/food-scan`, `/api/account/export`, `/api/cron/retention`, `/api/health` |

## Taxminlar va xavflar

| Xavf | Tavsif | Yechim |
|---|---|---|
| AI narxi | Har bir soʻrov pullik | Soatlik limitlar, qisqa javoblar |
| AI notoʻgʻri baho | Rasm orqali kaloriya ±30% va undan koʻp xato boʻlishi mumkin | Doimo "taxminiy" belgisi, porsiyani tahrirlash |
| Huquqiy | Oʻzbekistonning "Shaxsga doir maʼlumotlar toʻgʻrisida"gi qonuni maʼlumotni mahalliy saqlashni talab qilishi mumkin | Yurist bilan tekshiring |
| Yosh | Faqat tugʻilgan yil saqlanadi | Konservativ hisob: 18 yoshdan kichik boʻlishi mumkin boʻlganlar — oʻsmir |
| Moderatsiya | Avtomatik filtr oddiy | Odam moderatori shart |
