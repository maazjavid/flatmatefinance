import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { listFlatsForUser } from "@/lib/services/flats";

/**
 * All `/flats/**` routes share the dashboard shell (sidebar + topbar).
 * Auth + sidebar data are loaded here once for the whole subtree.
 */
export default async function FlatsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!session?.user || !userId) {
    redirect(`/sign-in?next=${encodeURIComponent("/flats")}`);
  }

  const { flats } = await listFlatsForUser(userId);

  return (
    <DashboardShell
      user={{
        name: session.user.name ?? "",
        email: session.user.email ?? "",
      }}
      flats={flats.map((f) => ({ id: f.id, name: f.name }))}
    >
      {children}
    </DashboardShell>
  );
}
