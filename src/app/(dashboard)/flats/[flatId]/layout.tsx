import { auth } from "@/auth";
import { redirect } from "next/navigation";

type FlatLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ flatId: string }>;
};

export default async function FlatLayout({
  children,
  params,
}: FlatLayoutProps) {
  const { flatId } = await params;

  const session = await auth();
  if (!session?.user) {
    redirect(`/sign-in?next=${encodeURIComponent(`/flats/${flatId}`)}`);
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-surface-muted p-8">
      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </div>
  );
}
