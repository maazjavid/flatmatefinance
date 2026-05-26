import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, initials } from "@/lib/utils";
import type { FlatMember, FlatRole } from "@/lib/types/flat";

export type MembersListCardProps = {
  members: FlatMember[];
  className?: string;
};

const roleLabel: Record<FlatRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

export function MembersListCard({ members, className }: MembersListCardProps) {
  return (
    <Card className={cn("flex flex-col gap-4", className)}>
      <CardHeader>
        <CardTitle>Members</CardTitle>
        <CardDescription>People who have joined this flat.</CardDescription>
      </CardHeader>

      <ul className="flex flex-col divide-y divide-surface-line">
        {members.map((member) => (
          <li key={member.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
            <Avatar
              initials={initials(member.fullName)}
              highlighted={member.role === "owner"}
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-ink-strong">{member.fullName}</p>
              <p className="text-xs text-ink-muted">{roleLabel[member.role]}</p>
            </div>
            <Badge variant={member.role === "owner" ? "primary" : "neutral"}>
              {roleLabel[member.role]}
            </Badge>
          </li>
        ))}
      </ul>
    </Card>
  );
}
