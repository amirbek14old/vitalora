import { CheckCircle2, Dumbbell, GraduationCap, Moon, Salad } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getI18n } from "@/lib/i18n/server";

const pillarIcons = [Dumbbell, Salad, Moon, GraduationCap];

export default async function HomePage() {
  const { t } = await getI18n();
  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:py-20 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-400">{t.common.slogan}</p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">{t.home.heroTitle}</h1>
          <p className="mt-5 text-lg text-slate-600 dark:text-slate-300">{t.home.heroText}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/register" size="lg">{t.home.ctaPrimary}</ButtonLink>
            <ButtonLink href="/features" size="lg" variant="outline">{t.home.ctaSecondary}</ButtonLink>
          </div>
        </div>
        <HeroIllustration />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12" aria-labelledby="pillars">
        <h2 id="pillars" className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">{t.home.pillarsTitle}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.home.pillars.map((p, i) => {
            const Icon = pillarIcons[i];
            return (
              <Card key={p.title}>
                <Icon className="mb-3 h-6 w-6 text-brand-700 dark:text-brand-400" aria-hidden />
                <h3 className="font-semibold text-slate-900 dark:text-white">{p.title}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{p.text}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12" aria-labelledby="principles">
        <div className="rounded-2xl bg-brand-800 p-8 text-white dark:bg-brand-900">
          <h2 id="principles" className="text-2xl font-bold">{t.home.principlesTitle}</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {t.home.principles.map((p) => (
              <li key={p} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-200" aria-hidden />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 pt-6 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t.home.finalCta}</h2>
        <ButtonLink href="/register" size="lg" className="mt-6">{t.home.ctaPrimary}</ButtonLink>
      </section>
    </>
  );
}

/** Original, decorative SVG — an abstract "weekly rhythm" card. */
function HeroIllustration() {
  const bars = [30, 45, 20, 60, 40, 55, 35];
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-brand-100 to-transparent dark:from-brand-900/40" />
      <div className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-surface-carddark">
        <div className="flex items-center justify-between">
          <div className="h-3 w-24 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-900" />
        </div>
        <svg viewBox="0 0 280 120" className="mt-6 w-full">
          {bars.map((h, i) => (
            <rect key={i} x={i * 40 + 6} y={110 - h * 1.6} width="26" height={h * 1.6} rx="6" className="fill-brand-500/80" />
          ))}
          <path d="M10 70 C 60 30, 100 90, 150 50 S 240 40, 275 30" fill="none" stroke="#0F766E" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
              <div className="h-2 w-10 rounded-full bg-slate-300 dark:bg-slate-600" />
              <div className="mt-2 h-4 w-14 rounded-full bg-brand-600/70" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
