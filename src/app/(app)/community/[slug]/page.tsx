import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Heart, Target, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser, isTeen } from "@/lib/auth/guards";
import { getI18n } from "@/lib/i18n/server";
import { tr } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/format";
import { cheerPostAction, deleteOwnPostAction, toggleMembershipAction } from "@/app/actions/community";
import { Card, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { SubmitButton } from "@/components/submit-button";
import { PostForm } from "@/components/community/post-form";
import { ReportForm } from "@/components/community/report-form";
import { publicUserSelect, toAvatarUser } from "@/lib/public-profile";
import { UserAvatar, DisplayName, ProfileBadge, ProTag } from "@/components/user-avatar";

export default async function CommunityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await requireUser();
  const { t, locale } = await getI18n();
  const community = await db.community.findUnique({ where: { slug } });
  if (!community || (isTeen(user) && !community.teenSafe)) notFound();
  const membership = await db.communityMember.findUnique({ where: { userId_communityId: { userId: user.id, communityId: community.id } } });

  // Only public-safe author fields are selected: never email, birth year or health data.
  const authorSelect = publicUserSelect;
  const posts = await db.communityPost.findMany({
    where: { communityId: community.id, parentId: null, OR: [{ status: "VISIBLE" }, { authorId: user.id }] },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      author: { select: authorSelect },
      replies: { where: { OR: [{ status: "VISIBLE" }, { authorId: user.id }] }, orderBy: { createdAt: "asc" }, include: { author: { select: authorSelect } } },
    },
  });

  const name = (a: Parameters<typeof toAvatarUser>[0]) => {
    const v = toAvatarUser(a, user.id, t.community.anonymous);
    return { ...v, displayName: a.id === user.id ? `${v.displayName} (${t.community.you})` : v.displayName };
  };

  const postLabels = { placeholder: t.community.write, submit: t.community.post, saving: t.common.saving };
  const reportLabels = { report: t.community.report, reason: t.community.reportReason, submit: t.common.submit };

  return (
    <div className="space-y-6">
      <Link href="/community" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:underline dark:text-slate-300"><ArrowLeft className="h-4 w-4" aria-hidden />{t.common.back}</Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{tr(community.name, locale)}</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-300">{tr(community.description, locale)}</p>
        </div>
        <form action={toggleMembershipAction}>
          <input type="hidden" name="communityId" value={community.id} />
          <SubmitButton variant={membership ? "outline" : "primary"}>{membership ? t.community.leave : t.community.join}</SubmitButton>
        </form>
      </div>

      {community.challenge && (
        <Alert tone="success"><span className="font-semibold"><Target className="mr-1 inline h-4 w-4" aria-hidden />{t.community.challenge}:</span> {tr(community.challenge, locale)}</Alert>
      )}

      <Card>
        {membership ? <PostForm communityId={community.id} labels={postLabels} /> : <p className="text-sm text-slate-600 dark:text-slate-300">{t.community.joinToPost}</p>}
      </Card>

      {posts.length === 0 ? (
        <EmptyState icon={Heart} title={t.community.empty} />
      ) : (
        <ul className="space-y-4">
          {posts.map((p) => (
            <li key={p.id}>
              <Card>
                <PostBody
                  post={p}
                  author={name(p.author)}
                  locale={locale}
                  own={p.author.id === user.id}
                  labels={{ cheer: t.community.cheer, pending: t.community.pending, delete: t.common.delete }}
                  report={p.author.id !== user.id ? <ReportForm postId={p.id} labels={reportLabels} /> : null}
                />
                {p.replies.length > 0 && (
                  <ul className="mt-4 space-y-3 border-l-2 border-slate-200 pl-4 dark:border-slate-700">
                    {p.replies.map((r) => (
                      <li key={r.id}>
                        <PostBody post={r} author={name(r.author)} locale={locale} own={r.author.id === user.id} labels={{ cheer: t.community.cheer, pending: t.community.pending, delete: t.common.delete }} report={r.author.id !== user.id ? <ReportForm postId={r.id} labels={reportLabels} /> : null} />
                      </li>
                    ))}
                  </ul>
                )}
                {membership && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm text-brand-700 dark:text-brand-400">{t.community.reply}</summary>
                    <div className="mt-2"><PostForm compact communityId={community.id} parentId={p.id} labels={{ ...postLabels, submit: t.community.reply }} /></div>
                  </details>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
      <Card>
        <CardTitle as="h2" className="text-base">{t.community.title}</CardTitle>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">{t.community.rules.map((r) => <li key={r}>{r}</li>)}</ul>
      </Card>
    </div>
  );
}

function PostBody({ post, author, locale, own, labels, report }: { post: { id: string; body: string; createdAt: Date; cheers: number; status: string }; author: ReturnType<typeof toAvatarUser>; locale: "uz" | "en" | "ru"; own: boolean; labels: { cheer: string; pending: string; delete: string }; report: React.ReactNode }) {
  const header = (
    <>
      <UserAvatar user={author} size="sm" />
      <span className="flex flex-wrap items-center gap-1.5">
        <DisplayName name={author.displayName} color={author.nameColor} className="text-sm" />
        <ProfileBadge code={author.badge} size={14} />
        {author.pro && <ProTag />}
      </span>
    </>
  );
  return (
    <div>
      <div className="flex items-center gap-2 text-sm font-medium">
        {author.visible ? <Link href={`/u/${author.id}`} className="flex items-center gap-2 hover:underline">{header}</Link> : <span className="flex items-center gap-2">{header}</span>}
        <span className="font-normal text-slate-500">· {formatDate(post.createdAt, locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
      </div>
      {post.status === "PENDING" && <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">{labels.pending}</p>}
      <p className="mt-2 whitespace-pre-line text-slate-800 dark:text-slate-200">{post.body}</p>
      <div className="mt-2 flex flex-wrap items-center gap-4">
        <form action={cheerPostAction}>
          <input type="hidden" name="postId" value={post.id} />
          <button type="submit" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600"><Heart className="h-3.5 w-3.5" aria-hidden />{labels.cheer} · {post.cheers}</button>
        </form>
        {own && (
          <form action={deleteOwnPostAction}>
            <input type="hidden" name="postId" value={post.id} />
            <button type="submit" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" aria-hidden />{labels.delete}</button>
          </form>
        )}
        {report}
      </div>
    </div>
  );
}
