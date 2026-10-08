import { getI18n } from "@/lib/i18n/server";
import { LegalPage } from "@/components/legal/legal-page";
import { terms, LEGAL_UPDATED } from "@/content/legal";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.legal.termsTitle };
}

export default async function TermsPage() {
  const { t, locale } = await getI18n();
  return <LegalPage title={t.legal.termsTitle} updatedLabel={t.legal.updated} updated={LEGAL_UPDATED} note={t.legal.draftNote} sections={terms[locale]} />;
}
