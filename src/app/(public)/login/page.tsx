import Link from "next/link";
import { redirect } from "next/navigation";
import { getI18n } from "@/lib/i18n/server";
import { getCurrentUser } from "@/lib/auth/session";
import { Card } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { Alert } from "@/components/ui/alert";
import { safeNext } from "@/lib/safe-redirect";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.nav.login };
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const target = safeNext(next);
  if (await getCurrentUser()) redirect(target);
  const { t } = await getI18n();
  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <Card className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold">{t.auth.loginTitle}</h1>
        <p className="mb-6 mt-1 text-slate-600 dark:text-slate-300">{t.auth.loginSubtitle}</p>
        {next && <Alert tone="info" className="mb-4">{t.auth.loginToContinue}</Alert>}
        <LoginForm next={target} labels={{ email: t.auth.email, password: t.auth.password, submit: t.auth.loginButton, pending: t.common.loading, show: t.auth.showPassword, hide: t.auth.hidePassword }} />
        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
          {t.auth.noAccount} <Link href="/register" className="font-medium text-brand-700 underline dark:text-brand-400">{t.nav.register}</Link>
        </p>
      </Card>
    </div>
  );
}
