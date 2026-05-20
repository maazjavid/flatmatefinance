type ReportsPageProps = {
  params: Promise<{ flatId: string }>;
};

export default async function ReportsPage({ params }: ReportsPageProps) {
  const { flatId } = await params;

  return (
    <section className="rounded-lg border border-surface-border bg-surface p-8 text-center text-ink-muted">
      Reports for flat <code className="text-ink">{flatId}</code> — not built yet.
    </section>
  );
}
