import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, initials } from "@/lib/utils";
import type { FlatMember } from "@/lib/types/flat";

export type MembersListCardProps = {
  members: FlatMember[];
  className?: string;
};

function roleLabel(role: FlatMember["role"]): string {
  if (role === "owner") return "Owner / Admin";
  if (role === "admin") return "Admin";
  return "Member";
}

export function MembersListCard({ members, className }: MembersListCardProps) {
  return (
    <Card className={cn("flex flex-col gap-4", className)}>
      <CardHeader>
        <CardTitle>Members</CardTitle>
      </CardHeader>

      <ul className="flex flex-col divide-y divide-surface-line">
        {members.map((member) => {
          const display = member.fullName;
          const ini = initials(display) || display[0]!.toUpperCase();
          const showTag = member.role === "owner" || member.role === "admin";

          return (
            <li
              key={member.id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <Avatar
                initials={ini}
                highlighted={member.role === "owner"}
                className="size-10 text-sm"
              />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink-strong">
                {display}
              </span>
              {showTag ? (
                <Badge variant={member.role === "owner" ? "primary" : "neutral"}>
                  {roleLabel(member.role)}
                </Badge>
              ) : null}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
