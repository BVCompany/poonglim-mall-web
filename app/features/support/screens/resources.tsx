/**
 * 자료실 페이지
 */
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Check, ChevronLeft, ChevronRight, Download } from "lucide-react";
import type { Route } from "./+types/resources";

export function meta(_: Route.MetaArgs) {
  return [{ title: "자료실 | 풍림푸드" }];
}

const CATEGORIES = ["전체 보기", "카탈로그", "회사소개", "인증서", "기타"];

const MOCK_FILES = [
  { id: 10, category: "인증서",     title: "2026년 풍림푸드 종합 제품 카탈로그", size: "312", date: "2026-02-18", ext: "PDF", url: "#" },
  { id: 9,  category: "카탈로그",   title: "2026년 풍림푸드 종합 제품 카탈로그", size: "312", date: "2026-02-15", ext: "PDF", url: "#" },
  { id: 8,  category: "기타",       title: "2026년 풍림푸드 종합 제품 카탈로그", size: "312", date: "2026-02-16", ext: "PDF", url: "#" },
  { id: 7,  category: "회사소개",   title: "2026년 풍림푸드 종합 제품 카탈로그", size: "312", date: "2026-02-16", ext: "PDF", url: "#" },
  { id: 6,  category: "인증서",     title: "2026년 풍림푸드 종합 제품 카탈로그", size: "312", date: "2026-02-15", ext: "PDF", url: "#" },
  { id: 5,  category: "회사소개",   title: "2026년 풍림푸드 종합 제품 카탈로그", size: "312", date: "2026-02-15", ext: "PDF", url: "#" },
  { id: 4,  category: "회사소개",   title: "2026년 풍림푸드 종합 제품 카탈로그", size: "312", date: "2026-02-15", ext: "PDF", url: "#" },
  { id: 3,  category: "인증서",     title: "2026년 풍림푸드 종합 제품 카탈로그", size: "312", date: "2026-02-15", ext: "PDF", url: "#" },
  { id: 2,  category: "회사소개",   title: "2026년 풍림푸드 종합 제품 카탈로그", size: "312", date: "2026-02-15", ext: "PDF", url: "#" },
  { id: 1,  category: "기타소개",   title: "2026년 풍림푸드 종합 제품 카탈로그", size: "317", date: "2026-02-15", ext: "PDF", url: "#" },
];

const ITEMS_PER_PAGE = 10;

export default function ResourcesScreen() {
  const [activeCategory, setActiveCategory] = useState("전체 보기");
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [activeCategory]);

  const filtered = activeCategory === "전체 보기"
    ? MOCK_FILES
    : MOCK_FILES.filter((f) => f.category === activeCategory);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalCount = filtered.length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F2EB" }}>
      {/* ── 상단 타이틀 (별 아이콘) ── */}
      <div className="px-4 pt-3">
        <div className="inline-flex items-center gap-1.5">
          <img src="/home/product-star.png" alt="" className="h-3.5 w-3.5 object-contain" />
          <h1 className="text-[24px] font-semibold tracking-[-0.04em] text-[#1F2121] md:text-[32px]">
            자료실
          </h1>
        </div>
      </div>

      {/* ── 본문 ── */}
      <div className="mx-auto max-w-[1600px] px-4 py-6 md:py-10 md:px-6 lg:px-10">

        {/* ── 필터 탭 ── */}
        <div className="mb-5 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = cat === activeCategory;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="flex items-center gap-1.5 rounded-full px-3 font-medium transition-colors md:px-5"
                style={{
                  fontSize: "clamp(13px, 2.5vw, 18px)",
                  letterSpacing: "-0.04em",
                  height: "clamp(34px, 5vw, 43px)",
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

        {/* ── 목록 ── */}
        {paginated.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">등록된 자료가 없습니다.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {paginated.map((file, idx) => {
              const displayNum = totalCount - ((page - 1) * ITEMS_PER_PAGE + idx);
              return (
                <div
                  key={file.id}
                  className="group grid grid-cols-[58px_1fr] items-start gap-x-3 gap-y-1 rounded-xl px-4 py-3 md:px-5 md:py-4"
                  style={{ backgroundColor: "#F0EEDD" }}
                >
                  {/* 왼쪽: 번호 + 카테고리 태그 */}
                  <div className="row-span-2 flex flex-col items-center gap-1.5 pt-0.5">
                    <span className="text-xs text-gray-500 md:text-sm">{displayNum}</span>
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold md:px-2.5 md:text-[11px]"
                      style={{ backgroundColor: "#EAE3C9", color: "#003F2B" }}
                    >
                      {file.category}
                    </span>
                  </div>

                  {/* 오른쪽: 제목 + 다운로드 */}
                  <div className="flex items-center gap-2">
                    <span className="flex-1 truncate text-[13px] font-medium text-gray-800 md:text-sm">
                      {file.title}
                    </span>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-gray-400 transition-colors hover:text-[#02633E]"
                    >
                      <Download className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    </a>
                  </div>

                  {/* 오른쪽 하단: 메타 */}
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 md:text-xs">
                    <span>{file.date}</span>
                    <span>{file.size}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── 페이지네이션 ── */}
        <div className="mt-10 flex items-center justify-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 transition-colors disabled:opacity-30 hover:border-[#02633E] hover:text-[#02633E]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
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
