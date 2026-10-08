import Link from "next/link";
import { redirect } from "next/navigation";
import { getI18n } from "@/lib/i18n/server";
import { getCurrentUser } from "@/lib/auth/session";
import { Card } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.nav.login };
}

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  const { t } = await getI18n();
  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <Card className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold">{t.auth.loginTitle}</h1>
        <p className="mb-6 mt-1 text-slate-600 dark:text-slate-300">{t.auth.loginSubtitle}</p>
        <LoginForm labels={{ email: t.auth.email, password: t.auth.password, submit: t.auth.loginButton, pending: t.common.loading }} />
        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
          {t.auth.noAccount} <Link href="/register" className="font-medium text-brand-700 underline dark:text-brand-400">{t.nav.register}</Link>
        </p>
      </Card>
    </div>
  );
}
