import {
  ArrowUpRightIcon,
  ChevronDownIcon,
  MenuIcon,
  SearchIcon,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import LangSwitcher from "./lang-switcher";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
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
  subItems?: { label: string; path: string }[];
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
        { label: "회사소개",   path: "/brand/intro" },
        { label: "연혁",       path: "/brand/history" },
        { label: "품질 & 인증", path: "/brand/certifications" },
        { label: "채용",       path: "/careers/positions" },
        { label: "오시는 길",  path: "/brand/location" },
      ],
    },
    // ── 제품소개 ──
    {
      label: "제품소개",
      subItems: [
        { label: "계란이야기", path: "/products/egg-story" },
        { label: "제품보기",   path: "/products/all" },
        { label: "레시피",     path: "/recipe/main" },
      ],
    },
    // ── 홍보센터 ──
    {
      label: "홍보센터",
      subItems: [
        { label: "보도자료", path: "/blog" },
        { label: "이벤트",   path: "/event" },
        { label: "견학신청", path: "/brand/factory-tour" },
      ],
    },
    // ── 고객지원 ──
    {
      label: "고객지원",
      subItems: [
        { label: "공지사항",         path: "/support/notice" },
        { label: "자료실",           path: "/support/resources" },
        { label: "계란안정성검사결과", path: "/support/safety-test" },
        { label: "등급판정서",        path: "/support/grade-certificate" },
        { label: "FAQ",              path: "/support/faq" },
        { label: "문의하기",          path: "/support/contact" },
      ],
    },
  ];
}

/* ─────────────────────────────────────────── */
/* 데스크탑 네비게이션                           */
/* ─────────────────────────────────────────── */
function DesktopNavigation({ productCategories, recipeCategories }: {
  productCategories: NavCategory[];
  recipeCategories: NavCategory[];
}) {
  const { t } = useTranslation();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuItems = buildMenuItems(t, productCategories, recipeCategories);

  return (
    <div className="flex items-center gap-20">
      {menuItems.map((item) => (
        <div
          key={item.label}
          className="relative"
          onMouseEnter={() => item.subItems && setOpenMenu(item.label)}
          onMouseLeave={() => setOpenMenu(null)}
        >
          {item.subItems ? (
            <button className="whitespace-nowrap text-[20px] font-bold text-[#111] transition-colors hover:text-[#0E5A3A]">
              {item.label}
            </button>
          ) : (
            <Link
              to={item.path!}
              viewTransition
              className="whitespace-nowrap text-[20px] font-bold text-[#111] transition-colors hover:text-[#0E5A3A]"
            >
              {item.label}
            </Link>
          )}

          {item.subItems && openMenu === item.label && (
            <div className="absolute left-0 top-full z-50 pt-3">
              <div className="min-w-[180px] rounded-lg border border-black/[0.06] bg-white py-2 shadow-lg">
                {item.subItems.map((sub) => (
                  <Link
                    key={sub.path}
                    to={sub.path}
                    viewTransition
                    className="block px-4 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-[#0E5A3A]"
                  >
                    {sub.label}
                  </Link>
                ))}
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
function MobileNavigation({ productCategories, recipeCategories }: {
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
              {item.subItems.map((sub) => (
                <SheetClose key={sub.path} asChild>
                  <Link
                    to={sub.path}
                    viewTransition
                    className="block rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-black/5"
                  >
                    {sub.label}
                  </Link>
                </SheetClose>
              ))}
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
/* NavigationBar — 2단 구조                     */
/* ─────────────────────────────────────────── */
export function NavigationBar({
  loading: _loading,
  productCategories = [],
  recipeCategories = [],
}: NavProps) {
  const { t } = useTranslation();

  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 w-full"
      style={{ backgroundColor: "rgba(244, 242, 229, 0.95)" }}
    >
      <div className="mx-auto w-full min-w-0 md:max-w-[1680px]">
        {/* ── TOP BAR — 데스크톱만 표시 ── */}
        <div className="hidden w-full lg:block" style={{ height: "40px" }}>
          <div className="flex h-full w-full items-center justify-end gap-2 px-6 lg:px-10">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#444] transition-colors hover:bg-black/5"
              aria-label="검색"
            >
              <SearchIcon className="h-[17px] w-[17px]" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full text-[#444] transition-colors hover:bg-black/5">
              <LangSwitcher />
            </div>
            <div
              className="flex h-full overflow-hidden"
              style={{ borderRadius: "0 0 12px 12px" }}
            >
              <a
                href="https://smartstore.naver.com/poonglimfoods"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 text-[13px] font-semibold text-white transition-all hover:brightness-110"
                style={{ backgroundColor: "#2DB96B" }}
              >
                풍림몰
                <ArrowUpRightIcon className="h-4 w-4" />
              </a>
              <a
                href="http://wos.freshegg.co.kr/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 text-[13px] font-semibold text-white transition-all hover:brightness-110"
                style={{ backgroundColor: "#003F2B" }}
              >
                수발주시스템
                <ArrowUpRightIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* ── MAIN NAV ── */}
        <nav className="h-[50px] w-full min-w-0 md:h-[68px]">
          <div className="flex h-full w-full min-w-0 items-center justify-between gap-2 px-3 sm:px-4 md:px-6 lg:px-10">
            <Link to="/" className="flex min-w-0 shrink-0 items-center">
              <img
                src="/home/poonglim-logo-eng.png"
                alt="풍림푸드"
                className="h-[30px] w-auto object-contain object-left sm:h-9 sm:w-24 md:h-10 md:w-28 lg:h-[56px] lg:w-[200px]"
              />
            </Link>

            {/* 데스크톱 메뉴 */}
            <div className="hidden items-center lg:flex">
              <DesktopNavigation
                productCategories={productCategories}
                recipeCategories={recipeCategories}
              />
            </div>

            {/* 모바일: 검색 + 햄버거 */}
            <div className="flex shrink-0 items-center gap-1 sm:gap-2 lg:hidden">
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#444] transition-colors hover:bg-black/5 active:bg-black/10 sm:h-10 sm:w-10"
                aria-label="검색"
              >
                <SearchIcon className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </button>
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
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
