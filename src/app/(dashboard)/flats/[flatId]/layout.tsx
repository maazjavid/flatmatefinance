type FlatLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ flatId: string }>;
};

export default async function FlatLayout({
  children,
  params: _params,
}: FlatLayoutProps) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-[#FAFAFA] p-8">
      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </div>
  );
}
