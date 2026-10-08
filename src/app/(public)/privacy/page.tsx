import { getI18n } from "@/lib/i18n/server";
import { LegalPage } from "@/components/legal/legal-page";
import { privacy, LEGAL_UPDATED } from "@/content/legal";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.legal.privacyTitle };
}

export default async function PrivacyPage() {
  const { t, locale } = await getI18n();
  return <LegalPage title={t.legal.privacyTitle} updatedLabel={t.legal.updated} updated={LEGAL_UPDATED} note={t.legal.draftNote} sections={privacy[locale]} />;
}
