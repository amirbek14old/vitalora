import Link from "next/link";
import { Users } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser, isTeen } from "@/lib/auth/guards";
import { getI18n } from "@/lib/i18n/server";
import { tr } from "@/lib/i18n/config";
import { toggleMembershipAction } from "@/app/actions/community";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { SubmitButton } from "@/components/submit-button";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.community.title };
}

export default async function CommunityPage() {
  const user = await requireUser();
  const { t, locale } = await getI18n();
  const teen = isTeen(user);
  const communities = await db.community.findMany({
    where: teen ? { teenSafe: true } : {},
    include: { _count: { select: { members: true } }, members: { where: { userId: user.id }, select: { id: true } } },
    orderBy: { slug: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader title={t.community.title} subtitle={t.community.subtitle} />
      {teen && <Alert tone="info">{t.community.teenNote}</Alert>}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
          {communities.map((c) => {
            const joined = c.members.length > 0;
            return (
              <Card key={c.id} className="flex flex-col">
                <Link href={`/community/${c.slug}`} className="text-lg font-semibold hover:text-brand-700 hover:underline">{tr(c.name, locale)}</Link>
                <p className="mt-1 flex-1 text-sm text-slate-600 dark:text-slate-300">{tr(c.description, locale)}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-slate-500"><Users className="h-3.5 w-3.5" aria-hidden />{c._count.members} {t.community.members}</span>
                  <form action={toggleMembershipAction}>
                    <input type="hidden" name="communityId" value={c.id} />
                    <SubmitButton size="sm" variant={joined ? "outline" : "primary"}>{joined ? t.community.leave : t.community.join}</SubmitButton>
                  </form>
                </div>
              </Card>
            );
          })}
        </div>
        <Card className="h-fit">
          <CardTitle>{t.community.title}</CardTitle>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">{t.community.rules.map((r) => <li key={r}>{r}</li>)}</ul>
        </Card>
      </div>
    </div>
  );
}
