/**
 * Language Switcher Component
 *
 * A dropdown menu component that allows users to switch between different application languages.
 * This component provides internationalization (i18n) support throughout the application.
 *
 * Features:
 * - Visual indication of the current language with country flag emoji
 * - Dropdown menu with language options
 * - Integration with i18next for language switching
 * - Server-side persistence of language preference
 * - Korean and English only on the storefront
 * - Translated language names in the current language
 */
import { GlobeIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useFetcher } from "react-router";

import { cn } from "~/core/lib/utils";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const LOCALES = ["ko", "en"] as const;
type LocaleCode = (typeof LOCALES)[number];

function useLocaleChange() {
  const { i18n } = useTranslation();
  const fetcher = useFetcher();

  const handleLocaleChange = async (locale: LocaleCode) => {
    i18n.changeLanguage(locale);
    await fetcher.submit(null, {
      method: "POST",
      action: "/api/settings/locale?locale=" + locale,
    });
  };

  const currentLocale: LocaleCode = i18n.language?.startsWith("en") ? "en" : "ko";

  return { handleLocaleChange, currentLocale };
}

/**
 * LangSwitcher component for changing the application language
 * 
 * This component uses i18next and React Router to handle language switching.
 * It displays a dropdown menu with language options, with the current language
 * indicated by the appropriate country flag emoji on the trigger button.
 * 
 * When a language is selected, it:
 * 1. Changes the language in the i18n context (client-side)
 * 2. Persists the language preference on the server via an API call
 * 
 * @returns A dropdown menu component for switching languages
 */
export default function LangSwitcher() {
  const { t } = useTranslation();
  const { handleLocaleChange } = useLocaleChange();

  return (
    <DropdownMenu>
      {/* Dropdown trigger button with current language flag */}
      <DropdownMenuTrigger
        asChild
        className="cursor-pointer"
        data-testid="lang-switcher" // For testing purposes
      >
        <Button variant="ghost" size="icon" className="text-[#444]">
          <GlobeIcon className="h-[17px] w-[17px]" />
        </Button>
      </DropdownMenuTrigger>
      
      {/* Dropdown menu with language options */}
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleLocaleChange("ko")}>
          🇰🇷 {t("navigation.kr")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLocaleChange("en")}>
          🇬🇧 {t("navigation.en")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** 모바일 햄버거 메뉴용 인라인 언어 전환 */
export function LangSwitcherMobile() {
  const { t } = useTranslation();
  const { handleLocaleChange, currentLocale } = useLocaleChange();

  return (
    <div className="mt-auto border-t border-[#EAE3C9] pt-4">
      <p className="mb-2 px-3 text-xs font-medium text-gray-500">
        {t("navChrome.language")}
      </p>
      <div className="flex gap-2 px-3">
        {LOCALES.map((locale) => (
          <button
            key={locale}
            type="button"
            onClick={() => handleLocaleChange(locale)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              currentLocale === locale
                ? "bg-[#0E5A3A] text-white"
                : "bg-[#EAE3C9]/60 text-[#1F2121] hover:bg-[#EAE3C9]",
            )}
            aria-pressed={currentLocale === locale}
          >
            {locale === "ko" ? "🇰🇷" : "🇬🇧"}
            {locale === "ko" ? t("navigation.kr") : t("navigation.en")}
          </button>
        ))}
      </div>
    </div>
  );
}
