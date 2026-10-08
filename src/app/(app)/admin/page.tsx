import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { getI18n } from "@/lib/i18n/server";
import { tr } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/format";
import {
  changeRoleAction, markExerciseReviewedAction, moderatePostAction, toggleCoursePublishAction, toggleExercisePublishAction, toggleRecipePublishAction,
} from "@/app/actions/admin";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/submit-button";
import { Select } from "@/components/ui/form";
import { RecipeForm } from "@/components/admin/recipe-form";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const user = await requireUser();
  if (user.role !== "ADMIN" && user.role !== "MODERATOR") redirect("/dashboard");
  const isAdmin = user.role === "ADMIN";
  const { t, locale } = await getI18n();
  const since = new Date(Date.now() - 7 * 24 * 3600 * 1000);

  // Anonymised analytics: aggregate counts only, no per-user health data.
  const [users, newUsers, workouts7d, aiMessages7d, openReports, pendingPosts, reports] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { createdAt: { gte: since } } }),
    db.workoutSession.count({ where: { createdAt: { gte: since } } }),
    db.aIMessage.count({ where: { createdAt: { gte: since }, role: "user" } }),
    db.report.count({ where: { status: "OPEN" } }),
    db.communityPost.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "asc" }, take: 20, include: { community: { select: { name: true } } } }),
    db.report.findMany({ where: { status: "OPEN" }, orderBy: { createdAt: "asc" }, take: 20, include: { post: { include: { community: { select: { name: true } } } } } }),
  ]);

  const [exercises, recipes, courses, staff, errors, auditLog] = isAdmin
    ? await Promise.all([
        db.exercise.findMany({ orderBy: { slug: "asc" }, select: { id: true, slug: true, name: true, published: true, reviewed: true } }),
        db.recipe.findMany({ orderBy: { slug: "asc" }, select: { id: true, slug: true, title: true, published: true } }),
        db.course.findMany({ orderBy: { order: "asc" }, select: { id: true, slug: true, title: true, published: true } }),
        db.user.findMany({ orderBy: { createdAt: "desc" }, take: 25, select: { id: true, email: true, role: true, createdAt: true } }),
        db.errorLog.findMany({ orderBy: { createdAt: "desc" }, take: 15 }),
        db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 20, select: { id: true, action: true, target: true, createdAt: true } }),
      ])
    : [[], [], [], [], [], []];

  const stats = [
    [t.admin.users, users], [t.admin.newUsers7d, newUsers], [t.admin.workouts7d, workouts7d], [t.admin.aiMessages7d, aiMessages7d], [t.admin.openReports, openReports],
  ] as const;

  return (
    <div className="space-y-8">
      <PageHeader title={t.admin.title} />

      <section aria-labelledby="a-stats">
        <h2 id="a-stats" className="mb-3 text-lg font-semibold">{t.admin.analytics}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {stats.map(([label, value]) => (
            <Card key={label} className="p-4"><p className="text-2xl font-bold">{value}</p><p className="text-xs text-slate-500">{label}</p></Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="a-mod">
        <h2 id="a-mod" className="mb-3 text-lg font-semibold">{t.admin.moderation}</h2>
        <div className="space-y-3">
          {[...reports.map((r) => ({ key: r.id, post: r.post, reason: r.reason })), ...pendingPosts.map((p) => ({ key: p.id, post: p, reason: null as string | null }))].map(({ key, post, reason }) => (
            <Card key={key} className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="text-sm">
                <div className="flex flex-wrap gap-2">
                  <Badge tone="slate">{tr(post.community.name, locale)}</Badge>
                  <Badge tone={post.status === "PENDING" ? "amber" : post.status === "HIDDEN" ? "red" : "brand"}>{post.status}</Badge>
                </div>
                <p className="mt-2 whitespace-pre-line">{post.body}</p>
                {reason && <p className="mt-1 text-xs text-red-700 dark:text-red-300">{t.community.report}: {reason}</p>}
              </div>
              <div className="flex gap-2">
                {(["hide", "restore", "dismiss"] as const).map((d) => (
                  <form key={d} action={moderatePostAction}>
                    <input type="hidden" name="postId" value={post.id} />
                    <input type="hidden" name="decision" value={d} />
                    <SubmitButton size="sm" variant={d === "hide" ? "danger" : "outline"}>{d === "hide" ? t.admin.hidePost : d === "restore" ? t.admin.restorePost : t.admin.dismiss}</SubmitButton>
                  </form>
                ))}
              </div>
            </Card>
          ))}
          {reports.length === 0 && pendingPosts.length === 0 && <p className="text-sm text-slate-500">—</p>}
        </div>
      </section>

      {isAdmin && (
        <>
          <section aria-labelledby="a-content" className="grid gap-6 lg:grid-cols-3">
            <h2 id="a-content" className="sr-only">{t.admin.content}</h2>
            <Card>
              <CardTitle>{t.admin.exercises}</CardTitle>
              <ul className="mt-3 divide-y divide-slate-200 text-sm dark:divide-slate-700">
                {exercises.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-2 py-2">
                    <span className="flex-1">{tr(e.name, locale)}</span>
                    {!e.reviewed && (
                      <form action={markExerciseReviewedAction}><input type="hidden" name="id" value={e.id} /><SubmitButton size="sm" variant="ghost">{t.admin.markReviewed}</SubmitButton></form>
                    )}
                    <form action={toggleExercisePublishAction}><input type="hidden" name="id" value={e.id} /><SubmitButton size="sm" variant="ghost">{e.published ? t.admin.published : t.admin.draft}</SubmitButton></form>
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <CardTitle>{t.admin.recipes}</CardTitle>
              <ul className="mt-3 divide-y divide-slate-200 text-sm dark:divide-slate-700">
                {recipes.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-2 py-2">
                    <span>{tr(r.title, locale)}</span>
                    <form action={toggleRecipePublishAction}><input type="hidden" name="id" value={r.id} /><SubmitButton size="sm" variant="ghost">{r.published ? t.admin.published : t.admin.draft}</SubmitButton></form>
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <CardTitle>{t.admin.courses}</CardTitle>
              <ul className="mt-3 divide-y divide-slate-200 text-sm dark:divide-slate-700">
                {courses.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-2 py-2">
                    <span>{tr(c.title, locale)}</span>
                    <form action={toggleCoursePublishAction}><input type="hidden" name="id" value={c.id} /><SubmitButton size="sm" variant="ghost">{c.published ? t.admin.published : t.admin.draft}</SubmitButton></form>
                  </li>
                ))}
              </ul>
            </Card>
          </section>

          <Card>
            <details>
              <summary className="cursor-pointer text-lg font-semibold">{t.admin.addRecipe}</summary>
              <div className="mt-4"><RecipeForm f={t.admin.fields} labels={{ submit: t.admin.addRecipe, hint: t.admin.jsonHint, saving: t.common.saving }} /></div>
            </details>
          </Card>

          <section aria-labelledby="a-roles">
            <Card>
              <CardTitle id="a-roles">{t.admin.roles}</CardTitle>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[32rem] text-sm">
                  <tbody>
                    {staff.map((u) => (
                      <tr key={u.id} className="border-t border-slate-200 dark:border-slate-700">
                        <td className="py-2">{u.email}</td>
                        <td className="py-2 text-slate-500">{formatDate(u.createdAt, locale)}</td>
                        <td className="py-2">
                          <form action={changeRoleAction} className="flex items-center gap-2">
                            <input type="hidden" name="userId" value={u.id} />
                            <label className="sr-only" htmlFor={`role-${u.id}`}>{t.admin.changeRole}</label>
                            <Select id={`role-${u.id}`} name="role" defaultValue={u.role} className="h-9 w-36" disabled={u.id === user.id}>
                              <option value="USER">USER</option><option value="MODERATOR">MODERATOR</option><option value="ADMIN">ADMIN</option>
                            </Select>
                            {u.id !== user.id && <SubmitButton size="sm" variant="outline">{t.common.save}</SubmitButton>}
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardTitle>{t.admin.errors}</CardTitle>
              {errors.length === 0 ? <p className="mt-2 text-sm text-slate-500">{t.admin.noErrors}</p> : (
                <ul className="mt-3 space-y-2 text-xs">{errors.map((e) => <li key={e.id}><span className="font-mono">{e.scope}</span> · {formatDate(e.createdAt, locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}<br />{e.message}</li>)}</ul>
              )}
            </Card>
            <Card>
              <CardTitle>{t.admin.audit}</CardTitle>
              <ul className="mt-3 space-y-1 font-mono text-xs">{auditLog.map((a) => <li key={a.id}>{a.createdAt.toISOString().slice(0, 16)} {a.action} {a.target ?? ""}</li>)}</ul>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
