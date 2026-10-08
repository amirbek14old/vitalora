import { PageHeader } from "@/components/page-header";
import { Alert } from "@/components/ui/alert";

export function LegalPage({ title, updatedLabel, updated, note, sections }: { title: string; updatedLabel: string; updated: string; note: string; sections: { h: string; p: string[] }[] }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <PageHeader title={title} subtitle={`${updatedLabel}: ${updated}`} />
      <Alert tone="info" className="mb-8">{note}</Alert>
      {sections.map((s) => (
        <section key={s.h} className="mb-8">
          <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">{s.h}</h2>
          <div className="prose-vitalora">{s.p.map((p) => <p key={p}>{p}</p>)}</div>
        </section>
      ))}
    </div>
  );
}
