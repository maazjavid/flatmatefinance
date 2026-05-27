import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { FlatServiceError, getFlatById } from "@/lib/services/flats";

type FlatLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ flatId: string }>;
};

/**
 * Membership gate for an individual flat.
 * The dashboard chrome (sidebar + topbar) is provided by the parent
 * `(dashboard)/flats/layout.tsx`.
 */
export default async function FlatLayout({ children, params }: FlatLayoutProps) {
  const { flatId } = await params;

  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!session?.user || !userId) {
    redirect(`/sign-in?next=${encodeURIComponent(`/flats/${flatId}`)}`);
  }

  try {
    await getFlatById(userId, flatId);
  } catch (error) {
    if (error instanceof FlatServiceError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return <>{children}</>;
}
