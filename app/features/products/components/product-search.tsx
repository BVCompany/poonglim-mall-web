import { Search } from "lucide-react";
import { Input } from "~/core/components/ui/input";

interface ProductSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ProductSearch({ searchQuery, onSearchChange }: ProductSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="제품명으로 검색하세요..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}

