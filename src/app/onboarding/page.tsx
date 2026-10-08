import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { getI18n } from "@/lib/i18n/server";
import { Logo } from "@/components/logo";
import { Card } from "@/components/ui/card";
import { OnboardingForm } from "@/components/onboarding-form";

export const metadata = { title: "Onboarding" };

export default async function OnboardingPage() {
  const user = await requireUser({ allowIncompleteOnboarding: true });
  if (user.profile?.onboardingDone) redirect("/dashboard");
  const { t } = await getI18n();
  return (
    <main id="main" className="mx-auto max-w-2xl px-4 py-10">
      <Logo />
      <Card className="mt-6 p-6 sm:p-8">
        <h1 className="text-2xl font-bold">{t.onboarding.title}</h1>
        <p className="mb-6 mt-1 text-slate-600 dark:text-slate-300">{t.onboarding.subtitle}</p>
        <OnboardingForm t={{ onboarding: t.onboarding, common: t.common }} />
      </Card>
    </main>
  );
}
