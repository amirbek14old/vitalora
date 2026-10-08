# 6. Xavfsizlik, maxfiylik va yoʻl xaritasi

## Amalga oshirilgan himoya
| Tahdid | Choralar |
|---|---|
| Parol oʻgʻirlanishi | bcrypt (cost 12); login urinishlari IP va email boʻyicha cheklangan; email mavjudligini oshkor qilmaydigan bir xil javob va vaqt |
| Sessiya oʻgʻirlanishi | httpOnly + SameSite cookie; bazada faqat token xeshi; parol oʻzgarsa boshqa sessiyalar bekor qilinadi |
| CSRF | Server Actions'da Next'ning origin tekshiruvi; REST'da `Origin` = `Host` talabi |
| XSS | React avtomatik ekranlaydi; AI javoblari oddiy matn sifatida chiqadi (HTML/markdown emas); CSP; video faqat ruxsat etilgan hostlardan |
| Clickjacking | `X-Frame-Options: DENY`, `frame-ancestors 'none'` |
| Fayl yuklash | ≤4 MB; tur magic bytes orqali; rasm saqlanmaydi; brauzerda EXIF/GPS olib tashlanadi |
| IDOR | Har bir oʻzgartirish `userId` filtri bilan; admin amallari `assertRole` bilan |
| Kirish maʼlumotlari | Zod hamma joyda; uzunlik cheklovlari bazada ham (VarChar) |
| AI suiisteʼmoli | Rozilik; soatlik limit; deterministik kirish va chiqish filtrlari |
| Hamjamiyat | Havola, telefon, email va tana haqidagi haqoratli soʻzlar avtomatik tekshiruvga tushadi; shikoyat va moderatsiya; bir postga bitta "qoʻllash" |
| Kuzatuv | AuditLog (login, rozilik, eksport, oʻchirish, admin amallari); ErrorLog (sogʻliq maʼlumotisiz) |

## Maxfiylik va rozilik
- Barcha roziliklar standart holatda **oʻchiq**: AI, shaxsiylashtirish, analitika, hamjamiyatda koʻrinish.
- Faqat tugʻilgan yil saqlanadi, toʻliq sana emas. Joylashuv, vazn va tana oʻlchamlari saqlanmaydi.
- Eksport (JSON) va hisobni butunlay oʻchirish (cascade) imkoniyati bor.
- **Saqlash muddatlari:**

  | Maʼlumot | Muddat |
  |---|---|
  | AI suhbatlari | 90 kun |
  | Oʻqilgan bildirishnomalar | 60 kun |
  | Audit jurnali | 365 kun |
  | Xato jurnali | 30 kun |
  | Muddati oʻtgan sessiyalar | darhol |

- **Oʻsmirlar:**
  - 13 yoshdan kichiklar qabul qilinmaydi.
  - 18 yoshdan kichik boʻlishi mumkin boʻlganlar oʻsmir rejimiga tushadi.
  - Oʻsmirlar kaloriya raqamlarini koʻrmaydi.
  - AI ularga yoshga mos javob beradi.
  - Faqat oʻsmirlar uchun xavfsiz deb belgilangan guruhlar koʻrinadi.
- Analitika rozilik bilan yoqiladi. Hozir uchinchi tomon analitika skripti umuman yoʻq. Admin statistikasi faqat umumiy sonlardan iborat.

## Maʼlum cheklovlar (halol roʻyxat)
- Video darsliklar yoʻq. Maydon va xavfsiz embed tayyor, litsenziyalangan kontent kerak.
- Push va email eslatmalar yetkazilmaydi. Faqat sozlama saqlanadi.
- Admin panelda mashq va kurs matnini tahrirlash formasi yoʻq. Eʼlon qilish va tekshiruv tugmalari bor; retseptni qoʻshish formasi bor.
- Parolni tiklash (email orqali) yoʻq. Buning uchun email provayder kerak.
- Ikki bosqichli autentifikatsiya yoʻq.
- Avtomatik moderatsiya oddiy regex'larga asoslangan.
- Ovqat bahosi aniqligi modelga bogʻliq va tasdiqlanmagan. Ilmiy validatsiya qilinmagan.

## Yoʻl xaritasi
| Bosqich | Holat | Tarkibi |
|---|---|---|
| 1 — Tadqiqot va arxitektura | ✅ | Raqobat tahlili, PRD, sxema, arxitektura |
| 2 — MVP | ✅ | Auth, onboarding, panel, mashqlar, ovqatlanish, uyqu, odatlar, profil |
| 3 — AI | ✅ (kalit bilan) | Yordamchi, maslahatlar, retsept gʻoyalari, ovqat rasmi, xavfsizlik testlari |
| 4 — Kengaytirilgan | 🟡 qisman | Hamjamiyat, yutuqlar, admin ✅. Qurilma integratsiyalari va kengaytirilgan analitika ⏳ |
| 5 — Test va deploy | 🟡 | Unit va e2e ✅. Lighthouse/axe audit, penetratsion test, production deploy ⏳ |

### Keyingi qadamlar (ustuvorlik boʻyicha)
1. Parolni tiklash va email tasdiqlash (Resend yoki SES orqali).
2. Push eslatmalar (Web Push + VAPID) va email dayjest.
3. Admin uchun toʻliq CMS: mashq, dars va test tahriri; media yuklash.
4. Litsenziyalangan video darsliklar (yoki oʻz suratga olishlaringiz).
5. axe-core avtomatik qulaylik testlari CI'da; Sentry.
6. Apple Health / Health Connect integratsiyasi — ixtiyoriy.
7. Ovqat bahosini real oʻlchovlar bilan solishtiruvchi kichik validatsiya tadqiqoti.
8. Qozoq, tojik va turk tillari. Arxitektura tayyor: yangi lugʻat va `locales` massiviga qoʻshish kifoya.
