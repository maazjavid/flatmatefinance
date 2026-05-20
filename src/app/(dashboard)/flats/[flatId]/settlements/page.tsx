type SettlementsPageProps = {
  params: Promise<{ flatId: string }>;
};

export default async function SettlementsPage({ params }: SettlementsPageProps) {
  const { flatId } = await params;

  return (
    <section className="rounded-lg border border-surface-border bg-surface p-8 text-center text-ink-muted">
      Settlements for flat <code className="text-ink">{flatId}</code> — not built yet.
    </section>
  );
}
