# 3. UI/UX dizayn tizimi

## Ranglar
| Token | Qiymat | Ishlatilishi |
|---|---|---|
| `brand-700` (Primary) | `#0F766E` | Asosiy tugmalar, havolalar |
| `brand-500` (Secondary) | `#14B8A6` | Qorongʻi rejimda tugmalar, grafik ustunlari |
| `surface-light` | `#F8FAFC` | Yorugʻ fon |
| `surface-dark` | `#0B1220` | Qorongʻi fon |
| `ink` | `#0F172A` | Asosiy matn |
| Qoʻshimcha | amber (yutuqlar), red (xavf), sky (maʼlumot), indigo `#6366F1` (uyqu chizigʻi) | |

Kontrast WCAG AA darajasida: `brand-700` oq fonda taxminan 5.5:1, oq matn `brand-700` ustida ham shunday.

## Tipografiya
- Shrift: **Inter Variable**. U `@fontsource-variable/inter` orqali ilovaning oʻzida saqlanadi — Google'ga soʻrov yuborilmaydi.
- Sarlavhalar: `text-2xl` → `text-5xl`, `font-bold`, `tracking-tight`.
- Matn: `text-sm` / `text-base`, `leading-relaxed`.

## Komponentlar
Barchasi `src/components/ui/` papkasida. shadcn uslubida yozilgan, lekin CLI ishlatilmagan.

| Komponent | Tavsif |
|---|---|
| `Button`, `ButtonLink` | Variantlar: primary, secondary, outline, ghost, danger. Oʻlchamlar: sm, md, lg |
| `Card`, `CardTitle`, `CardText` | `rounded-2xl`, yengil soya |
| `Input`, `Select`, `Textarea`, `Field`, `Checkbox` | Label va izoh `aria-describedby` bilan bogʻlangan |
| `Badge`, `Alert`, `Progress`, `EmptyState` | `role="progressbar"` ARIA qiymatlari bilan |
| `SubmitButton` | `useFormStatus` bilan "saqlanmoqda" holatini koʻrsatadi |

## Joylashuv
- Avval mobil uchun. Asosiy maket: mobil → `sm` → `lg`.
- Ilova ichida chap tomonda menyu (`lg`), mobil qurilmada "Menyu" ochiladigan roʻyxati.
- Kontent kengligi `max-w-6xl`, chetlardan 16 px boʻsh joy.

## Harakat va animatsiya
- Animatsiyalar kam: hover rangi, progress, nafas olish kvadrati.
- `prefers-reduced-motion` yoqilgan boʻlsa, barcha animatsiyalar oʻchadi.

## Qulaylik (WCAG 2.2 AA)
- "Asosiy kontentga oʻtish" havolasi bor.
- Fokus doim koʻrinadi.
- Belgilar (ikonkalar) `aria-hidden`, tugmalarda `aria-label` bor.
- Grafik uchun `figcaption` matn muqobili bor.
- `aria-live` qoʻllanilgan joylar: test natijasi, AI javobi, xabarlar.
- `lang` atributi tilga qarab oʻzgaradi.
- Formalarda faqat placeholder emas, haqiqiy label ishlatiladi.

## Yorugʻ va qorongʻi rejim
- Cookie'ga saqlanadi: `vitalora_theme` = light / dark / system.
- Sahifa birinchi chizilishidan oldin kichik skript ishlaydi, shuning uchun ekran "miltillamaydi".
