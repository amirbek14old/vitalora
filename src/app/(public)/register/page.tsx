import Link from "next/link";
import { redirect } from "next/navigation";
import { getI18n } from "@/lib/i18n/server";
import { getCurrentUser } from "@/lib/auth/session";
import { Card } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/register-form";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.nav.register };
}

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  const { t } = await getI18n();
  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <Card className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold">{t.auth.registerTitle}</h1>
        <p className="mb-6 mt-1 text-slate-600 dark:text-slate-300">{t.auth.registerSubtitle}</p>
        <RegisterForm t={{ auth: t.auth, common: t.common, nav: t.nav }} />
        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
          {t.auth.haveAccount} <Link href="/login" className="font-medium text-brand-700 underline dark:text-brand-400">{t.nav.login}</Link>
        </p>
      </Card>
    </div>
  );
}
