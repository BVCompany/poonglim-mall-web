/**
 * 자료실 페이지
 */
import { useState, useEffect } from "react";
import { Check, ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import type { Route } from "./+types/resources";
import { PageBanner } from "~/core/components/page-banner";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";

export function meta(_: Route.MetaArgs) {
  return [{ title: "자료실 | 풍림푸드" }];
}

export async function loader(_: Route.LoaderArgs) {
  const pageBanner = await getPageBanner("resources").catch(() => null);
  return { pageBanner };
}

const CATEGORIES = ["전체 보기", "카탈로그", "회사소개", "인증서", "기타"];

const MOCK_FILES = [
  { id: 10, category: "인증서", title: "2026년 풍림푸드 종합 제품 카탈로그", size: "312", date: "2026-02-18", ext: "PDF", url: "#" },
  { id: 9, category: "카탈로그", title: "2026년 풍림푸드 종합 제품 카탈로그", size: "312", date: "2026-02-15", ext: "PDF", url: "#" },
  { id: 8, category: "기타", title: "2026년 풍림푸드 종합 제품 카탈로그", size: "312", date: "2026-02-16", ext: "PDF", url: "#" },
  { id: 7, category: "회사소개", title: "2026년 풍림푸드 종합 제품 카탈로그", size: "312", date: "2026-02-16", ext: "PDF", url: "#" },
  { id: 6, category: "인증서", title: "2026년 풍림푸드 종합 제품 카탈로그", size: "312", date: "2026-02-15", ext: "PDF", url: "#" },
  { id: 5, category: "회사소개", title: "2026년 풍림푸드 종합 제품 카탈로그", size: "312", date: "2026-02-15", ext: "PDF", url: "#" },
  { id: 4, category: "회사소개", title: "2026년 풍림푸드 종합 제품 카탈로그", size: "312", date: "2026-02-15", ext: "PDF", url: "#" },
  { id: 3, category: "인증서", title: "2026년 풍림푸드 종합 제품 카탈로그", size: "312", date: "2026-02-15", ext: "PDF", url: "#" },
  { id: 2, category: "회사소개", title: "2026년 풍림푸드 종합 제품 카탈로그", size: "312", date: "2026-02-15", ext: "PDF", url: "#" },
  { id: 1, category: "기타", title: "2026년 풍림푸드 종합 제품 카탈로그", size: "317", date: "2026-02-15", ext: "PDF", url: "#" },
];

const ITEMS_PER_PAGE = 10;

export default function ResourcesScreen({ loaderData }: Route.ComponentProps) {
  const pageBanner = loaderData?.pageBanner ?? null;
  const [activeCategory, setActiveCategory] = useState("전체 보기");
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    setPage(1);
  }, [activeCategory, query]);

  const handleSearch = () => {
    setQuery(inputValue);
    setPage(1);
  };

  const byCategory =
    activeCategory === "전체 보기" ? MOCK_FILES : MOCK_FILES.filter((f) => f.category === activeCategory);

  const filtered = byCategory.filter((f) => f.title.toLowerCase().includes(query.toLowerCase()));

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalCount = filtered.length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F2EB" }}>
      <PageBanner
        imageUrl="/banner/report_banner_temp.png"
        title="자료실"
        subtitle="풍림푸드의 브로슈어·인증서 등 자료를 확인하세요."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "고객지원", href: "/support" },
          { label: "자료실" },
        ]}
        dbBanner={pageBanner}
        hideBreadcrumbOnMobile
      />

      <div className="px-4 pt-3 md:hidden">
        <div className="inline-flex items-center gap-1.5">
          <img src="/home/product-star.png" alt="" className="h-3.5 w-3.5 object-contain" />
          <h1 className="text-[24px] font-semibold tracking-[-0.04em] text-[#1F2121]">자료실</h1>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 py-6 md:py-10 md:px-6 lg:px-10">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const isActive = cat === activeCategory;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat);
                    setInputValue("");
                    setQuery("");
                  }}
                  className="flex h-[clamp(34px,5vw,43px)] items-center gap-1.5 rounded-full px-3 text-[clamp(13px,2.5vw,18px)] font-medium transition-colors md:h-[43px] md:px-5 md:text-lg"
                  style={{
                    letterSpacing: "-0.04em",
                    ...(isActive
                      ? { backgroundColor: "#02633E", color: "#fff" }
                      : { backgroundColor: "#EAE3C9", color: "#003F2B" }),
                  }}
                >
                  {isActive && <Check className="h-3 w-3 shrink-0 md:h-3.5 md:w-3.5" strokeWidth={2.5} />}
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="검색어를 입력해주세요."
              className="h-16 w-64 rounded-full border-0 bg-white px-5 text-sm outline-none"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition-all hover:brightness-110 active:scale-95"
              style={{ backgroundColor: "#02633E" }}
              aria-label="검색"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>

        {paginated.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            {query ? "검색 결과가 없습니다." : "등록된 자료가 없습니다."}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {paginated.map((file, idx) => {
              const displayNum = totalCount - ((page - 1) * ITEMS_PER_PAGE + idx);
              return (
                <div
                  key={file.id}
                  className="group grid grid-cols-[58px_1fr] items-start gap-x-3 gap-y-1 rounded-xl px-4 py-3 md:items-center md:gap-4 md:px-5 md:py-4 md:[grid-template-columns:56px_1fr_100px_120px_56px_40px]"
                  style={{ backgroundColor: "#F0EEDD" }}
                >
                  <div className="row-span-2 flex flex-col items-center gap-1.5 pt-0.5 md:row-span-1 md:pt-0">
                    <span className="text-xs text-gray-500 md:text-sm">{displayNum}</span>
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold md:hidden"
                      style={{ backgroundColor: "#EAE3C9", color: "#003F2B" }}
                    >
                      {file.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex-1 truncate text-[13px] font-medium text-gray-800 md:text-sm">
                      {file.title}
                    </span>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-gray-400 transition-colors hover:text-[#02633E] md:hidden"
                    >
                      <Download className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    </a>
                  </div>

                  <div className="hidden text-center md:block">
                    <span
                      className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                      style={{ backgroundColor: "#EAE3C9", color: "#003F2B" }}
                    >
                      {file.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-gray-400 md:contents">
                    <span className="md:hidden">{file.date}</span>
                    <span className="md:hidden">{file.size}</span>
                    <span className="hidden text-center text-xs text-gray-400 md:block">{file.date}</span>
                    <span className="hidden text-right text-xs text-gray-400 md:block">{file.size}</span>
                    <div className="hidden md:block">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center text-gray-400 transition-colors hover:text-[#02633E]"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 transition-colors disabled:opacity-30 hover:border-[#02633E] hover:text-[#02633E]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors"
              style={
                p === page
                  ? { backgroundColor: "#02633E", color: "#fff" }
                  : { backgroundColor: "transparent", color: "#555" }
              }
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 transition-colors disabled:opacity-30 hover:border-[#02633E] hover:text-[#02633E]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
