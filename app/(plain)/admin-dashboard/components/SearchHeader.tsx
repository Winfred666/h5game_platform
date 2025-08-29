import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
// This component is used to display a search header with a title, no logic
interface SearchHeaderProps {
  title: string;
  subtitle?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
}

export function SearchHeader({
  title,
  subtitle,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  children,
}: SearchHeaderProps) {
  return (
    <div className="flex justify-between items-center w-full">
      <div>
        <h3>{title}</h3>
        {subtitle && (
          <p className="text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            className="pl-8"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            autoComplete="off"
          />
        </div>
        {children}
      </div>
    </div>
  );
}
