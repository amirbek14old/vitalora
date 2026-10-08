import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { getI18n } from "@/lib/i18n/server";
import { tr } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/format";
import { PrintButton } from "@/components/print-button";

export default async function CertificatePage({ params }: { params: Promise<{ course: string }> }) {
  const { course: slug } = await params;
  const user = await requireUser();
  const { t, locale } = await getI18n();
  const course = await db.course.findFirst({ where: { slug, published: true }, include: { lessons: { select: { id: true } } } });
  if (!course) notFound();
  const progress = await db.lessonProgress.findMany({
    where: { userId: user.id, lessonId: { in: course.lessons.map((l) => l.id) } },
    orderBy: { completedAt: "desc" },
  });
  if (!course.lessons.length || progress.length !== course.lessons.length) redirect(`/academy/${slug}`);
  const completedAt = progress[0].completedAt;
  // Verification code derived from ids (not secret; lets the holder reference the record).
  const [before, after] = t.academy.certificateText.split("{name}");
  const code = `VA-${course.id.slice(-4)}-${user.id.slice(-6)}`.toUpperCase();

  return (
    <div className="space-y-4">
      <div className="no-print flex justify-end"><PrintButton label={t.academy.print} /></div>
      <section className="mx-auto max-w-3xl rounded-3xl border-8 border-double border-brand-700 bg-white p-10 text-center text-slate-900 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">VITALORA AI</p>
        <h1 className="mt-4 text-3xl font-bold">{t.academy.certificateTitle}</h1>
        <p className="mt-6 text-slate-600">
          {before}
          <span className="mx-1 block py-2 text-3xl font-semibold text-brand-800">{user.profile?.displayName}</span>
          {after}
        </p>
        <p className="mt-6 text-xl font-medium">«{tr(course.title, locale)}»</p>
        <p className="mt-8 text-sm text-slate-500">{formatDate(completedAt, locale, { day: "numeric", month: "long", year: "numeric" })} · {code}</p>
        <p className="mt-4 text-xs text-slate-400">{t.common.notMedical}</p>
      </section>
    </div>
  );
}
