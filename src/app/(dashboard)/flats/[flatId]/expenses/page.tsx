import { PlaceholderSection } from "@/components/flat/placeholder-section";
import { Receipt } from "lucide-react";

export default function ExpensesPage() {
  return (
    <PlaceholderSection
      title="Expenses"
      description="Track shared spending across your flat. Coming in a later phase."
      icon={Receipt}
    />
  );
}
