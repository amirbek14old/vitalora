import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { getI18n } from "@/lib/i18n/server";
import { fmt, tr } from "@/lib/i18n/config";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.academy.title };
}

export default async function AcademyPage() {
  const user = await requireUser();
  const { t, locale } = await getI18n();
  const [courses, progress] = await Promise.all([
    db.course.findMany({ where: { published: true }, orderBy: { order: "asc" }, include: { lessons: { select: { id: true } } } }),
    db.lessonProgress.findMany({ where: { userId: user.id }, select: { lessonId: true } }),
  ]);
  const done = new Set(progress.map((p) => p.lessonId));

  return (
    <div className="space-y-6">
      <PageHeader title={t.academy.title} subtitle={t.academy.subtitle} />
      <section aria-labelledby="path">
        <h2 id="path" className="mb-4 flex items-center gap-2 text-lg font-semibold"><GraduationCap className="h-5 w-5 text-brand-700" aria-hidden />{t.academy.beginnerPath}</h2>
        <ol className="grid gap-4 md:grid-cols-2">
          {courses.map((c, i) => {
            const completed = c.lessons.filter((l) => done.has(l.id)).length;
            return (
              <li key={c.id}>
                <Link href={`/academy/${c.slug}`} className="group block h-full">
                  <Card className="h-full group-hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <Badge>{i + 1}. {t.academy.tracks[c.track as keyof typeof t.academy.tracks] ?? c.track}</Badge>
                      <span className="text-xs text-slate-500">{c.lessons.length} {t.academy.lessons}</span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold group-hover:text-brand-700">{tr(c.title, locale)}</h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{tr(c.description, locale)}</p>
                    <div className="mt-4">
                      <Progress value={completed} max={c.lessons.length} label={tr(c.title, locale)} />
                      <p className="mt-1 text-xs text-slate-500">{fmt(t.academy.progress, { done: completed, total: c.lessons.length })}</p>
                    </div>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
