import { Search } from "lucide-react";

import { cn } from "~/core/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onSearch: () => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "검색어를 입력해주세요.",
  className = "",
}: SearchBarProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
        placeholder={placeholder}
        className="h-16 min-w-0 flex-1 rounded-full border-0 bg-white px-5 text-sm outline-none placeholder:text-gray-400 md:w-64 md:flex-none"
      />
      <button
        onClick={onSearch}
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition-all hover:brightness-110 active:scale-95"
        style={{ backgroundColor: "#02633E" }}
        type="button"
        aria-label="검색"
      >
        <Search className="h-5 w-5" />
      </button>
    </div>
  );
}
