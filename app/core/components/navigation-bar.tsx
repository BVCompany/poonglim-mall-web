import {
  ArrowUpRightIcon,
  ChevronDownIcon,
  ChevronLeft,
  MenuIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import type { TFunction } from "i18next";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router";

import {
  getMegaNavSections,
  isMegaSectionActive,
  type MegaSectionId,
} from "~/core/lib/public-mega-nav";
import { cn } from "~/core/lib/utils";

import LangSwitcher, { LangSwitcherMobile } from "./lang-switcher";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

/* ─────────────────────────────────────────── */
/* 타입                                         */
/* ─────────────────────────────────────────── */
interface MenuItem {
  id: MegaSectionId;
  label: string;
  path?: string;
  subItems?: { label: string; path: string; external?: boolean }[];
}

interface NavCategory {
  name: string;
  slug: string;
}

interface NavProps {
  name?: string;
  email?: string;
  avatarUrl?: string | null;
  loading: boolean;
  productCategories?: NavCategory[];
  recipeCategories?: NavCategory[];
}

/* ─────────────────────────────────────────── */
/* 메뉴 빌더 (i18n — ko / en)                  */
/* ─────────────────────────────────────────── */
function buildMenuItems(
  t: TFunction,
  _productCategories: NavCategory[],
  _recipeCategories: NavCategory[],
): MenuItem[] {
  return getMegaNavSections(t).map((s) => ({
    id: s.id,
    label: s.title,
    subItems: s.links.map((l) => ({
      label: l.name,
      path: l.href,
      external: l.external,
    })),
  }));
}

function desktopNavItemClass(id: MegaSectionId, pathname: string) {
  return cn(
    "font-[family-name:var(--font-nanum)] text-[20px] font-extrabold uppercase tracking-normal transition-colors",
    isMegaSectionActive(id, pathname)
      ? "text-[#02633E]"
      : "text-[#1F2121] hover:text-[#02633E]",
  );
}

/* ─────────────────────────────────────────── */
/* 데스크탑 네비게이션                           */
/* ─────────────────────────────────────────── */
function DesktopNavigation({
  productCategories,
  recipeCategories,
}: {
  productCategories: NavCategory[];
  recipeCategories: NavCategory[];
}) {
  const { t } = useTranslation();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState<MegaSectionId | null>(null);
  const menuItems = buildMenuItems(t, productCategories, recipeCategories);

  return (
    <div className="flex items-center gap-[80px]">
      {menuItems.map((item) => (
        <div
          key={item.id}
          className="relative"
          onMouseEnter={() => item.subItems && setOpenMenu(item.id)}
          onMouseLeave={() => setOpenMenu(null)}
        >
          {item.subItems ? (
            <button
              type="button"
              className={cn(
                "py-2.5 whitespace-nowrap",
                desktopNavItemClass(item.id, location.pathname),
              )}
            >
              {item.label}
            </button>
          ) : (
            <Link
              to={item.path!}
              viewTransition
              className={cn(
                "py-2.5 whitespace-nowrap",
                desktopNavItemClass(item.id, location.pathname),
              )}
            >
              {item.label}
            </Link>
          )}

          {item.subItems && openMenu === item.id && (
            <div className="absolute top-full left-0 z-50 pt-3">
              <div className="min-w-[180px] rounded-lg border border-black/[0.06] bg-white py-2 shadow-lg">
                {item.subItems.map((sub) =>
                  sub.external ? (
                    <a
                      key={sub.path}
                      href={sub.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2.5 text-lg text-gray-600 transition-colors hover:bg-gray-50 hover:text-[#02633E]"
                    >
                      {sub.label}
                    </a>
                  ) : (
                    <Link
                      key={sub.path}
                      to={sub.path}
                      viewTransition
                      className="block px-4 py-2.5 text-lg text-gray-600 transition-colors hover:bg-gray-50 hover:text-[#02633E]"
                    >
                      {sub.label}
                    </Link>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────── */
/* 모바일 네비게이션                             */
/* ─────────────────────────────────────────── */
function MobileNavigation({
  productCategories,
  recipeCategories,
}: {
  productCategories: NavCategory[];
  recipeCategories: NavCategory[];
}) {
  const { t } = useTranslation();
  const [openSections, setOpenSections] = useState<MegaSectionId[]>([]);
  const menuItems = buildMenuItems(t, productCategories, recipeCategories);

  const toggle = (s: MegaSectionId) =>
    setOpenSections((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#EAE3C9] bg-[var(--site-chrome-header-bg,#FDFDF5)] px-4 py-3">
        <SheetClose asChild>
          <Link
            to="/"
            viewTransition
            className="flex min-w-0 max-w-[200px] items-center py-1"
            aria-label={t("navChrome.goHome")}
          >
            <img
              src="/home/poonglim-logo-eng.png"
              alt=""
              className="h-8 w-auto max-w-full object-contain object-left"
            />
          </Link>
        </SheetClose>
        <SheetClose
          type="button"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[#1F2121] transition-colors hover:bg-black/5 active:bg-black/10"
          aria-label={t("navChrome.closeMenu")}
        >
          <XIcon className="size-7" strokeWidth={2} aria-hidden />
        </SheetClose>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-4 pt-4 pb-6">
        <SheetClose asChild>
          <a
            href="https://smartstore.naver.com/poonglimfoods"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-4 flex items-center justify-center gap-2 rounded-[8px] bg-[#0E5A3A] px-4 py-3 text-sm font-semibold text-white"
          >
            {t("navChrome.mallFull")}
            <ArrowUpRightIcon className="size-4" />
          </a>
        </SheetClose>

        {menuItems.map((item) =>
        item.subItems ? (
          <Collapsible
            key={item.id}
            open={openSections.includes(item.id)}
            onOpenChange={() => toggle(item.id)}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-[15px] font-medium text-[#111] hover:bg-black/5">
              {item.label}
              <ChevronDownIcon
                className={`size-4 opacity-50 transition-transform ${
                  openSections.includes(item.id) ? "rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4">
              {item.subItems.map((sub) =>
                sub.external ? (
                  <a
                    key={sub.path}
                    href={sub.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-black/5"
                  >
                    {sub.label}
                  </a>
                ) : (
                  <SheetClose key={sub.path} asChild>
                    <Link
                      to={sub.path}
                      viewTransition
                      className="block rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-black/5"
                    >
                      {sub.label}
                    </Link>
                  </SheetClose>
                ),
              )}
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <SheetClose key={item.id} asChild>
            <Link
              to={item.path!}
              viewTransition
              className="block rounded-md px-3 py-2.5 text-[15px] font-medium text-[#111] hover:bg-black/5"
            >
              {item.label}
            </Link>
          </SheetClose>
        ),
      )}
        <LangSwitcherMobile />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/* NavigationBar — 2단 구조 + 검색 오버레이     */
/* ─────────────────────────────────────────── */
export function NavigationBar({
  loading: _loading,
  productCategories = [],
  recipeCategories = [],
}: NavProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isProductDetailRoute = /^\/products\/\d+$/.test(location.pathname);
  const isRecipeDetailRoute = /^\/recipe\/\d+$/.test(location.pathname);
  const isNoticeDetailRoute = /^\/support\/notice\/\d+$/.test(
    location.pathname,
  );
  const isResourcesDetailRoute = /^\/support\/resources\/\d+$/.test(
    location.pathname,
  );
  const isGradeCertDetailRoute = /^\/support\/grade-certificate\/\d+$/.test(
    location.pathname,
  );
  const isNewsDetailRoute = /^\/media\/news\/\d+$/.test(location.pathname);
  const isEventDetailRoute = /^\/event\/\d+$/.test(location.pathname);
  const isEggStoryRoute = location.pathname === "/products/egg-story";
  const isDetailMobileHeaderRoute =
    isProductDetailRoute ||
    isRecipeDetailRoute ||
    isNoticeDetailRoute ||
    isResourcesDetailRoute ||
    isGradeCertDetailRoute ||
    isNewsDetailRoute ||
    isEventDetailRoute ||
    isEggStoryRoute;

  /** 모바일·태블릿 전용 상단바 (`lg:hidden`) — PC(lg+)에서는 기본 네비만 노출 */
  type DetailHeaderConfig =
    | { label: string; to: string }
    | { label: string; back: "history" };

  const detailHeaderConfig: DetailHeaderConfig | null = isProductDetailRoute
    ? { label: t("detailNav.productList"), to: "/products/all" }
    : isRecipeDetailRoute
      ? { label: t("detailNav.recipes"), to: "/recipe/main" }
      : isNoticeDetailRoute
        ? { label: t("detailNav.notices"), to: "/support/notice" }
        : isResourcesDetailRoute
          ? { label: t("detailNav.resources"), to: "/support/resources" }
          : isGradeCertDetailRoute
            ? { label: t("detailNav.gradeCert"), to: "/support/grade-certificate" }
            : isNewsDetailRoute
              ? { label: t("detailNav.press"), to: "/media/news" }
              : isEventDetailRoute
                ? { label: t("detailNav.event"), to: "/event" }
                : isEggStoryRoute
                  ? { label: t("detailNav.eggStory"), back: "history" }
                  : null;

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const desktopSearchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isSearchOpen) return;
    const id = requestAnimationFrame(() => {
      if (typeof window !== "undefined" && window.innerWidth >= 1024) {
        desktopSearchInputRef.current?.focus();
      } else {
        inputRef.current?.focus();
      }
    });
    return () => cancelAnimationFrame(id);
  }, [isSearchOpen]);

  const openSearch = () => {
    setIsSearchOpen(true);
    // autoFocus 는 input의 autoFocus prop으로 처리
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchInput("");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = searchInput.trim();
    if (term) {
      navigate(`/search?q=${encodeURIComponent(term)}`);
      closeSearch();
    }
  };

  return (
    <>
      {isSearchOpen ? (
        <>
          {/* 모바일·태블릿: 시안 — 딤 + 흰 패널 + 하단 닫기(원형) */}
          <div
            className="fixed inset-0 z-[100] flex flex-col lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="nav-search-mobile-title"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/20"
              onClick={closeSearch}
              aria-label={t("search.ariaCloseOverlay")}
            />
            <div className="relative z-[1] w-full bg-white shadow-sm">
              <form
                onSubmit={handleSearchSubmit}
                className="mx-auto flex w-full flex-col items-center px-4 pt-2.5 pb-8"
              >
                <div className="flex w-full flex-col items-center gap-2.5">
                  <p
                    id="nav-search-mobile-title"
                    className="mx-auto max-w-[328px] text-center font-[family-name:var(--font-nanum)] text-sm leading-[21px] font-bold text-[#1F2121]"
                  >
                    {t("search.hint")}
                  </p>
                  <div className="flex w-full max-w-full items-center gap-1.5">
                    <input
                      ref={inputRef}
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder={t("search.placeholder")}
                      className="h-[42px] min-w-0 flex-1 rounded-full border border-[#02633E] bg-white px-5 py-2.5 font-[family-name:var(--font-nanum)] text-sm leading-[21px] font-bold text-[#1F2121] outline-none placeholder:font-bold placeholder:text-[#A3A3A3]"
                      style={{ letterSpacing: "-0.02em" }}
                    />
                    <button
                      type="submit"
                      className="flex size-[42px] shrink-0 items-center justify-center rounded-full text-white transition-all hover:brightness-110"
                      style={{ backgroundColor: "#02633E" }}
                      aria-label={t("search.ariaSubmit")}
                    >
                      <SearchIcon className="size-5" strokeWidth={1.8} />
                    </button>
                  </div>
                </div>
              </form>
            </div>
            <div className="relative z-[1] flex flex-1 justify-center pt-6">
              <button
                type="button"
                onClick={closeSearch}
                className="flex size-[42px] items-center justify-center rounded-full bg-white text-[#1F2121] shadow-[0_2px_12px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.06]"
                aria-label={t("search.ariaCloseBar")}
              >
                <XIcon className="size-[21px]" strokeWidth={1.4} />
              </button>
            </div>
          </div>

          {/* 데스크톱: PC 시안 — 흰 패널 · max 1000px · 로고↔검색 gap 60 · pill 필 + 분리 검색 버튼 */}
          <header className="fixed top-0 right-0 left-0 z-50 hidden w-full bg-white lg:block">
            <form
              onSubmit={handleSearchSubmit}
              className="flex w-full flex-col items-center px-6 py-10 lg:px-12 xl:px-[160px] xl:py-[60px]"
            >
              <div className="flex w-full max-w-[1000px] flex-col items-center gap-[30px]">
                <div className="flex w-full items-center gap-[60px]">
                  <Link
                    to="/"
                    onClick={closeSearch}
                    className="flex shrink-0 items-center gap-[18px]"
                  >
                    <img
                      src="/home/poonglim-logo-eng.png"
                      alt={t("navChrome.brandAlt")}
                      className="h-14 w-[200px] object-contain object-left"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-1 items-center gap-10">
                    <div className="flex min-w-0 flex-1 items-center gap-1.5">
                      <input
                        ref={desktopSearchInputRef}
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder={t("search.placeholder")}
                        className="min-h-0 min-w-0 flex-1 rounded-[60px] border border-[#02633E] bg-white px-10 py-5 font-[family-name:var(--font-nanum)] text-base leading-6 font-bold text-[#1F2121] outline-none placeholder:text-[#666666] placeholder:opacity-100"
                      />
                      <button
                        type="submit"
                        className="flex shrink-0 items-center justify-center rounded-[60px] bg-[#02633E] p-5 text-white transition-all hover:brightness-110 active:scale-[0.99]"
                        aria-label={t("search.ariaSubmit")}
                      >
                        <SearchIcon className="size-6" strokeWidth={2} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={closeSearch}
                      className="flex size-[30px] shrink-0 items-center justify-center text-black transition-colors hover:opacity-70"
                      aria-label={t("search.ariaCloseBar")}
                    >
                      <XIcon className="size-[21px]" strokeWidth={2} />
                    </button>
                  </div>
                </div>

                <p className="max-w-[328px] text-center font-[family-name:var(--font-nanum)] text-sm leading-[21px] font-bold text-[#1F2121] opacity-60">
                  {t("search.hint")}
                </p>
              </div>
            </form>
          </header>
        </>
      ) : (
        <header
          className="fixed top-0 right-0 left-0 z-50 w-full"
          style={{
            backgroundColor: "var(--site-chrome-header-bg, #FDFDF5)",
          }}
        >
          {/* ── 일반 모드 — PC 시안: 좌우 (100vw−1600)/2, 본문 max 1600 ── */}
          <div
            className={cn(
              "w-full min-w-0 px-3 sm:px-4 md:px-6 lg:px-[max(1rem,calc((100vw-var(--content-max-width))/2))]",
              isDetailMobileHeaderRoute && "hidden lg:block",
            )}
          >
            <div className="mx-auto w-full max-w-[var(--content-max-width)]">
              {/* ── TOP BAR — 데스크톱만 (아이콘 30×30, CTA 44px·#32AF32 / #003F2B·하단 10px 라운드) ── */}
              <div className="hidden w-full lg:flex lg:min-h-[32px] lg:items-center lg:justify-end">
                <div className="flex w-full items-center justify-end gap-5">
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={openSearch}
                      className="flex h-[30px] w-[30px] items-center justify-center text-[#1F2121] transition-colors hover:bg-black/5"
                      aria-label={t("navChrome.openSearch")}
                    >
                      <SearchIcon
                        className="h-[18px] w-[18px]"
                        strokeWidth={1.8}
                      />
                    </button>
                    <div className="flex h-[30px] w-[30px] items-center justify-center text-[#1F2121] [&_button]:h-[30px] [&_button]:w-[30px] [&_button]:rounded-none [&_button]:text-[#1F2121]">
                      <LangSwitcher />
                    </div>
                  </div>
                  <div className="flex items-stretch">
                    <a
                      href="https://smartstore.naver.com/poonglimfoods"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-11 items-center gap-1.5 rounded-bl-[10px] px-5 py-1.5 text-[13px] font-bold text-white uppercase transition-all hover:brightness-110"
                      style={{
                        backgroundColor: "#32AF32",
                        fontFamily: "NanumSquareRound, sans-serif",
                      }}
                    >
                      {t("navChrome.mall")}
                      <ArrowUpRightIcon
                        className="h-5 w-5 text-[#FDFDF5]"
                        strokeWidth={2.5}
                      />
                    </a>
                    <a
                      href="http://wos.freshegg.co.kr/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-11 items-center gap-1.5 rounded-br-[10px] px-5 py-1.5 text-[13px] font-bold text-white uppercase transition-all hover:brightness-110"
                      style={{
                        backgroundColor: "#003F2B",
                        fontFamily: "NanumSquareRound, sans-serif",
                      }}
                    >
                      {t("navChrome.orderSystem")}
                      <ArrowUpRightIcon
                        className="h-5 w-5 text-[#FDFDF5]"
                        strokeWidth={2.5}
                      />
                    </a>
                  </div>
                </div>
              </div>

              {/* ── MAIN NAV ── PC 하단 pb 20px, 로고·메뉴 flex-end 정렬 ── */}
              <nav className="h-[50px] w-full min-w-0 md:h-[68px] lg:h-auto lg:min-h-0 lg:pb-5">
                <div className="flex h-full w-full min-w-0 items-center justify-between gap-2 lg:items-end">
                  <Link
                    to="/"
                    className="flex min-w-0 shrink-0 items-center lg:pb-0"
                  >
                    <img
                      src="/home/poonglim-logo-eng.png"
                      alt={t("navChrome.brandAlt")}
                      className="h-[30px] w-auto object-contain object-left sm:h-9 sm:w-24 md:h-10 md:w-28 lg:h-[56px] lg:w-[200px]"
                    />
                  </Link>

                  {/* 데스크톱 메뉴 */}
                  <div className="hidden items-center lg:flex lg:pb-0">
                    <DesktopNavigation
                      productCategories={productCategories}
                      recipeCategories={recipeCategories}
                    />
                  </div>

                  {/* 모바일: 검색 + 햄버거 */}
                  <div className="flex shrink-0 items-center gap-1 sm:gap-2 lg:hidden">
                    <button
                      onClick={openSearch}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-[#444] transition-colors hover:bg-black/5 active:bg-black/10 sm:h-10 sm:w-10"
                      aria-label={t("navChrome.openSearch")}
                    >
                      <SearchIcon
                        className="h-[18px] w-[18px]"
                        strokeWidth={1.5}
                      />
                    </button>
                    <Sheet>
                      <SheetTrigger className="flex h-9 w-9 items-center justify-center rounded-full text-[#333] transition-colors hover:bg-black/5 active:bg-black/10 sm:h-10 sm:w-10">
                        <MenuIcon
                          className="h-[18px] w-[18px]"
                          strokeWidth={1.5}
                        />
                      </SheetTrigger>
                      <SheetContent
                        hideCloseButton
                        className="flex h-full w-[300px] max-w-[300px] flex-col gap-0 overflow-hidden p-0"
                      >
                        <SheetHeader className="sr-only">
                          <SheetTitle>{t("navChrome.mainMenuTitle")}</SheetTitle>
                        </SheetHeader>
                        <MobileNavigation
                          productCategories={productCategories}
                          recipeCategories={recipeCategories}
                        />
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </header>
      )}

      {/* ── 제품 상세 전용 모바일/태블릿 헤더 ── */}
      {!isSearchOpen && isDetailMobileHeaderRoute && detailHeaderConfig && (
        <header
          className="fixed top-0 right-0 left-0 z-50 w-full lg:hidden"
          style={{
            backgroundColor: "var(--site-chrome-header-bg, #FDFDF5)",
          }}
        >
          <div className="mx-auto flex h-[50px] w-full items-center justify-between px-3 sm:px-4 md:h-[68px] md:px-6">
            {"to" in detailHeaderConfig ? (
              <Link
                to={detailHeaderConfig.to}
                className="inline-flex items-center gap-1.5 text-[16px] font-semibold tracking-[-0.03em] text-[#1F2121] md:text-[18px]"
              >
                <ChevronLeft
                  className="h-[22px] w-[22px] shrink-0 md:h-6 md:w-6"
                  strokeWidth={2.25}
                  aria-hidden
                />
                {detailHeaderConfig.label}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 text-[16px] font-semibold tracking-[-0.03em] text-[#1F2121] md:text-[18px]"
                aria-label={t("navChrome.previousScreen")}
              >
                <ChevronLeft
                  className="h-[22px] w-[22px] shrink-0 md:h-6 md:w-6"
                  strokeWidth={2.25}
                  aria-hidden
                />
                {detailHeaderConfig.label}
              </button>
            )}

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={openSearch}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#444] transition-colors hover:bg-black/5 active:bg-black/10 sm:h-10 sm:w-10"
                aria-label={t("navChrome.openSearch")}
              >
                <SearchIcon className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </button>
              <Sheet>
                <SheetTrigger className="flex h-9 w-9 items-center justify-center rounded-full text-[#333] transition-colors hover:bg-black/5 active:bg-black/10 sm:h-10 sm:w-10">
                  <MenuIcon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </SheetTrigger>
                <SheetContent
                  hideCloseButton
                  className="flex h-full w-[300px] max-w-[300px] flex-col gap-0 overflow-hidden p-0"
                >
                  <SheetHeader className="sr-only">
                    <SheetTitle>{t("navChrome.mainMenuTitle")}</SheetTitle>
                  </SheetHeader>
                  <MobileNavigation
                    productCategories={productCategories}
                    recipeCategories={recipeCategories}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>
      )}
    </>
  );
}
