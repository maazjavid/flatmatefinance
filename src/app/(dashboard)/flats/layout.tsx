export default function FlatsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-surface-muted p-8">
      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </div>
  );
}

