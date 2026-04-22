import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "~/core/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onSearch: () => void;
  placeholder?: string;
  className?: string;
  /** input 요소에만 추가 (제품 목록 PC 시안 등) */
  inputClassName?: string;
  /** 검색 버튼에만 추가 */
  buttonClassName?: string;
  /** 검색 실행 버튼 접근성 라벨 */
  buttonAriaLabel?: string;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder,
  className = "",
  inputClassName = "",
  buttonClassName = "",
  buttonAriaLabel,
}: SearchBarProps) {
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder ?? t("search.placeholder");
  const resolvedAria = buttonAriaLabel ?? t("search.ariaSubmit");

  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
        placeholder={resolvedPlaceholder}
        className={cn(
          "h-16 min-w-0 flex-1 rounded-full border-0 bg-white px-5 text-sm outline-none placeholder:text-gray-400 md:w-64 md:flex-none",
          inputClassName,
        )}
      />
      <button
        onClick={onSearch}
        className={cn(
          "flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition-all hover:brightness-110 active:scale-95",
          buttonClassName,
        )}
        style={{ backgroundColor: "#02633E" }}
        type="button"
        aria-label={resolvedAria}
      >
        <Search className="h-5 w-5" />
      </button>
    </div>
  );
}
