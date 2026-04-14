import {
  ArrowUpRightIcon,
  ChevronDownIcon,
  ChevronLeft,
  MenuIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router";

import { cn } from "~/core/lib/utils";

import LangSwitcher from "./lang-switcher";
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
  SheetTrigger,
} from "./ui/sheet";

/* ─────────────────────────────────────────── */
/* 타입                                         */
/* ─────────────────────────────────────────── */
interface MenuItem {
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
/* 메뉴 빌더                                    */
/* ─────────────────────────────────────────── */
function buildMenuItems(
  _t: (key: string) => string,
  _productCategories: NavCategory[],
  _recipeCategories: NavCategory[],
): MenuItem[] {
  return [
    // ── 회사소개 ──
    {
      label: "회사소개",
      subItems: [
        { label: "회사소개", path: "/brand/intro" },
        { label: "연혁", path: "/brand/history" },
        { label: "품질 & 인증", path: "/brand/certifications" },
        { label: "채용", path: "/careers/positions" },
        { label: "오시는 길", path: "/brand/location" },
      ],
    },
    // ── 제품소개 ──
    {
      label: "제품소개",
      subItems: [
        { label: "계란이야기", path: "/products/egg-story" },
        { label: "제품보기", path: "/products/all" },
        { label: "레시피", path: "/recipe/main" },
      ],
    },
    // ── 홍보센터 ──
    {
      label: "홍보센터",
      subItems: [
        { label: "보도자료", path: "/media/news" },
        { label: "이벤트", path: "/event" },
        { label: "견학신청", path: "/brand/factory-tour" },
      ],
    },
    // ── 고객지원 ──
    {
      label: "고객지원",
      subItems: [
        { label: "공지사항", path: "/support/notice" },
        { label: "자료실", path: "/support/resources" },
        {
          label: "계란안전성검사결과",
          path: "https://www.foodsafetykorea.go.kr/portal/fooddanger/eggHazardList.do?menu_grp=MENU_NEW02&menu_no=3497",
          external: true,
        },
        { label: "등급판정서", path: "/support/grade-certificate" },
        { label: "FAQ", path: "/support/faq" },
        { label: "문의하기", path: "/support/contact" },
      ],
    },
  ];
}

/** PC 시안: 현재 섹션만 #02633E, 나머지 #1F2121 */
function isNavSectionActive(label: string, pathname: string): boolean {
  switch (label) {
    case "회사소개":
      if (pathname.includes("/factory-tour")) return false;
      return pathname.startsWith("/brand/") || pathname.startsWith("/careers");
    case "제품소개":
      return pathname.startsWith("/products") || pathname.startsWith("/recipe");
    case "홍보센터":
      return (
        pathname.startsWith("/media") ||
        pathname.startsWith("/event") ||
        pathname.includes("/factory-tour")
      );
    case "고객지원":
      return pathname.startsWith("/support");
    default:
      return false;
  }
}

function desktopNavItemClass(label: string, pathname: string) {
  return cn(
    "font-[family-name:var(--font-nanum)] text-[20px] font-extrabold uppercase tracking-normal transition-colors",
    isNavSectionActive(label, pathname)
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
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuItems = buildMenuItems(t, productCategories, recipeCategories);

  return (
    <div className="flex items-center gap-[80px]">
      {menuItems.map((item) => (
        <div
          key={item.label}
          className="relative"
          onMouseEnter={() => item.subItems && setOpenMenu(item.label)}
          onMouseLeave={() => setOpenMenu(null)}
        >
          {item.subItems ? (
            <button
              type="button"
              className={cn(
                "py-2.5 whitespace-nowrap",
                desktopNavItemClass(item.label, location.pathname),
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
                desktopNavItemClass(item.label, location.pathname),
              )}
            >
              {item.label}
            </Link>
          )}

          {item.subItems && openMenu === item.label && (
            <div className="absolute top-full left-0 z-50 pt-3">
              <div className="min-w-[180px] rounded-lg border border-black/[0.06] bg-white py-2 shadow-lg">
                {item.subItems.map((sub) =>
                  sub.external ? (
                    <a
                      key={sub.path}
                      href={sub.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-[#02633E]"
                    >
                      {sub.label}
                    </a>
                  ) : (
                    <Link
                      key={sub.path}
                      to={sub.path}
                      viewTransition
                      className="block px-4 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-[#02633E]"
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
  const [openSections, setOpenSections] = useState<string[]>([]);
  const menuItems = buildMenuItems(t, productCategories, recipeCategories);

  const toggle = (s: string) =>
    setOpenSections((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );

  return (
    <div className="flex flex-col gap-1 pt-4">
      <SheetClose asChild>
        <a
          href="https://smartstore.naver.com/poonglimfoods"
          target="_blank"
          rel="noopener noreferrer"
          className="mb-4 flex items-center justify-center gap-2 rounded-[8px] bg-[#0E5A3A] px-4 py-3 text-sm font-semibold text-white"
        >
          풍림몰 바로가기
          <ArrowUpRightIcon className="size-4" />
        </a>
      </SheetClose>

      {menuItems.map((item) =>
        item.subItems ? (
          <Collapsible
            key={item.label}
            open={openSections.includes(item.label)}
            onOpenChange={() => toggle(item.label)}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-[15px] font-medium text-[#111] hover:bg-black/5">
              {item.label}
              <ChevronDownIcon
                className={`size-4 opacity-50 transition-transform ${
                  openSections.includes(item.label) ? "rotate-180" : ""
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
          <SheetClose key={item.label} asChild>
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
  const isDetailMobileHeaderRoute =
    isProductDetailRoute ||
    isRecipeDetailRoute ||
    isNoticeDetailRoute ||
    isResourcesDetailRoute ||
    isGradeCertDetailRoute ||
    isNewsDetailRoute ||
    isEventDetailRoute;

  const detailHeaderConfig = isProductDetailRoute
    ? { label: "제품보기", to: "/products/all" }
    : isRecipeDetailRoute
      ? { label: "레시피", to: "/recipe/main" }
      : isNoticeDetailRoute
        ? { label: "공지사항", to: "/support/notice" }
        : isResourcesDetailRoute
          ? { label: "자료실", to: "/support/resources" }
        : isGradeCertDetailRoute
          ? { label: "등급판정서", to: "/support/grade-certificate" }
          : isNewsDetailRoute
            ? { label: "보도자료", to: "/media/news" }
            : isEventDetailRoute
              ? { label: "이벤트", to: "/event" }
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
              aria-label="검색창 닫기"
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
                    제품명, 레시피, 뉴스 등을 검색해보세요
                  </p>
                  <div className="flex w-full max-w-full items-center gap-1.5">
                    <input
                      ref={inputRef}
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="검색어를 입력해주세요."
                      className="h-[42px] min-w-0 flex-1 rounded-full border border-[#02633E] bg-white px-5 py-2.5 font-[family-name:var(--font-nanum)] text-sm leading-[21px] font-bold text-[#1F2121] outline-none placeholder:font-bold placeholder:text-[#A3A3A3]"
                      style={{ letterSpacing: "-0.02em" }}
                    />
                    <button
                      type="submit"
                      className="flex size-[42px] shrink-0 items-center justify-center rounded-full text-white transition-all hover:brightness-110"
                      style={{ backgroundColor: "#02633E" }}
                      aria-label="검색 실행"
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
                aria-label="검색 닫기"
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
                      alt="풍림푸드"
                      className="h-14 w-[200px] object-contain object-left"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-1 items-center gap-10">
                    <div className="flex min-w-0 flex-1 items-center gap-1.5">
                      <input
                        ref={desktopSearchInputRef}
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="검색어를 입력해주세요."
                        className="min-h-0 min-w-0 flex-1 rounded-[60px] border border-[#02633E] bg-white px-10 py-5 font-[family-name:var(--font-nanum)] text-base leading-6 font-bold text-[#1F2121] outline-none placeholder:text-[#666666] placeholder:opacity-100"
                      />
                      <button
                        type="submit"
                        className="flex shrink-0 items-center justify-center rounded-[60px] bg-[#02633E] p-5 text-white transition-all hover:brightness-110 active:scale-[0.99]"
                        aria-label="검색 실행"
                      >
                        <SearchIcon className="size-6" strokeWidth={2} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={closeSearch}
                      className="flex size-[30px] shrink-0 items-center justify-center text-black transition-colors hover:opacity-70"
                      aria-label="검색 닫기"
                    >
                      <XIcon className="size-[21px]" strokeWidth={2} />
                    </button>
                  </div>
                </div>

                <p className="max-w-[328px] text-center font-[family-name:var(--font-nanum)] text-sm leading-[21px] font-bold text-[#1F2121] opacity-60">
                  제품명, 레시피, 뉴스 등을 검색해보세요
                </p>
              </div>
            </form>
          </header>
        </>
      ) : (
        <header
          className="fixed top-0 right-0 left-0 z-50 w-full"
          style={{
            backgroundColor: "var(--site-chrome-header-bg, #F4F2E5)",
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
                      aria-label="검색"
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
                      풍림몰
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
                      수발주시스템
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
                      alt="풍림푸드"
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
                      aria-label="검색"
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
                      <SheetContent className="w-[300px] overflow-y-auto">
                        <SheetHeader>
                          <MobileNavigation
                            productCategories={productCategories}
                            recipeCategories={recipeCategories}
                          />
                        </SheetHeader>
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
            backgroundColor: "var(--site-chrome-header-bg, #F4F2E5)",
          }}
        >
          <div className="mx-auto flex h-[50px] w-full items-center justify-between px-3 sm:px-4 md:h-[68px] md:px-6">
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

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={openSearch}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#444] transition-colors hover:bg-black/5 active:bg-black/10 sm:h-10 sm:w-10"
                aria-label="검색"
              >
                <SearchIcon className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </button>
              <Sheet>
                <SheetTrigger className="flex h-9 w-9 items-center justify-center rounded-full text-[#333] transition-colors hover:bg-black/5 active:bg-black/10 sm:h-10 sm:w-10">
                  <MenuIcon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </SheetTrigger>
                <SheetContent className="w-[300px] overflow-y-auto">
                  <SheetHeader>
                    <MobileNavigation
                      productCategories={productCategories}
                      recipeCategories={recipeCategories}
                    />
                  </SheetHeader>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>
      )}
    </>
  );
}
