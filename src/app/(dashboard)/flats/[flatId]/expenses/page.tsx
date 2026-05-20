type ExpensesPageProps = {
  params: Promise<{ flatId: string }>;
};

export default async function ExpensesPage({ params }: ExpensesPageProps) {
  const { flatId } = await params;

  return (
    <section className="rounded-lg border border-surface-border bg-surface p-8 text-center text-ink-muted">
      Expenses for flat <code className="text-ink">{flatId}</code> — not built yet.
    </section>
  );
}
