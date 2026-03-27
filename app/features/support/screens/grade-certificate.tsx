/**
 * 등급판정서 목록 페이지
 */
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { ChevronLeft, ChevronRight, Check, Download } from "lucide-react";
import type { Route } from "./+types/grade-certificate";
import { PageBanner } from "~/core/components/page-banner";
import { SearchBar } from "~/core/components/search-bar";
import { getGradeCertificates } from "../lib/queries.server";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";

export const meta: Route.MetaFunction = () => [
  { title: "등급판정서 | 풍림푸드" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const tab = (url.searchParams.get("tab") ?? "current") as "current" | "archive";
  const certType = url.searchParams.get("type") ?? "전체보기";
  const normalizedCertType = certType === "전체" ? "전체보기" : certType;

  const [dbCerts, pageBanner] = await Promise.all([
    getGradeCertificates(
      tab,
      normalizedCertType === "전체보기" ? undefined : normalizedCertType,
    ).catch(() => []),
    getPageBanner("grade-certificate").catch(() => null),
  ]);

  return { dbCerts, pageBanner, activeTab: tab, activeType: normalizedCertType };
}

/* ── 더미 데이터 ── */
const MOCK_CERTS = [
  { cert_id: 12, tab: "current", cert_type: "포장란", title: "2026년 2월 계란 안전성 검사결과", file_url: "#", file_name: "6004-02260002.pdf", view_count: 246, is_active: true, content: "", author: "풍림푸드", created_at: "2026-02-18", is_pinned: false },
  { cert_id: 11, tab: "current", cert_type: "액란",   title: "2026년 1월 계란 안전성 검사결과", file_url: "#", file_name: "6004-02260001.pdf", view_count: 312, is_active: true, content: "", author: "풍림푸드", created_at: "2026-01-18", is_pinned: false },
  { cert_id: 10, tab: "current", cert_type: "포장란", title: "2025년 12월 계란 안전성 검사결과", file_url: "#", file_name: "6004-02251202.pdf", view_count: 180, is_active: true, content: "", author: "풍림푸드", created_at: "2025-12-15", is_pinned: false },
  { cert_id: 9,  tab: "current", cert_type: "액란",   title: "2025년 11월 계란 안전성 검사결과", file_url: "#", file_name: "6004-02251101.pdf", view_count: 215, is_active: true, content: "", author: "풍림푸드", created_at: "2025-11-15", is_pinned: false },
  { cert_id: 8,  tab: "current", cert_type: "포장란", title: "2026년 10월 계란 안전성 검사결과", file_url: "#", file_name: "6004-02251002.pdf", view_count: 423, is_active: true, content: "", author: "풍림푸드", created_at: "2025-10-15", is_pinned: false },
  { cert_id: 7,  tab: "current", cert_type: "액란",   title: "2025년 9월 계란 안전성 검사결과",  file_url: "#", file_name: "6004-02250901.pdf", view_count: 199, is_active: true, content: "", author: "풍림푸드", created_at: "2025-09-15", is_pinned: false },
  { cert_id: 6,  tab: "current", cert_type: "포장란", title: "2025년 8월 계란 안전성 검사결과",  file_url: "#", file_name: "6004-02250802.pdf", view_count: 215, is_active: true, content: "", author: "풍림푸드", created_at: "2025-08-15", is_pinned: false },
  { cert_id: 5,  tab: "current", cert_type: "액란",   title: "2025년 7월 계란 안전성 검사결과",  file_url: "#", file_name: "6004-02250701.pdf", view_count: 234, is_active: true, content: "", author: "풍림푸드", created_at: "2025-07-15", is_pinned: false },
  { cert_id: 4,  tab: "current", cert_type: "포장란", title: "2025년 6월 계란 안전성 검사결과",  file_url: "#", file_name: "6004-02250602.pdf", view_count: 142, is_active: true, content: "", author: "풍림푸드", created_at: "2025-06-15", is_pinned: false },
  { cert_id: 3,  tab: "current", cert_type: "액란",   title: "2025년 5월 계란 안전성 검사결과",  file_url: "#", file_name: "6004-02250501.pdf", view_count: 125, is_active: true, content: "", author: "풍림푸드", created_at: "2025-05-15", is_pinned: false },
  { cert_id: 2,  tab: "archive", cert_type: "포장란", title: "2022년 11월 등급판정서 (포장란)",   file_url: "#", file_name: "6004-old-0001.pdf", view_count: 88,  is_active: true, content: "", author: "풍림푸드", created_at: "2022-11-01", is_pinned: false },
  { cert_id: 1,  tab: "archive", cert_type: "액란",   title: "2022년 10월 등급판정서 (액란)",     file_url: "#", file_name: "6004-old-0002.pdf", view_count: 55,  is_active: true, content: "", author: "풍림푸드", created_at: "2022-10-01", is_pinned: false },
];

const CERT_TYPES = ["전체보기", "액란용", "포장란용"];
const ITEMS_PER_PAGE = 10;
const showBanner = false;

export default function GradeCertificateScreen({ loaderData }: Route.ComponentProps) {
  const { dbCerts, pageBanner, activeTab, activeType } = loaderData;
  const [, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [page, setPage] = useState(1);

  const allCerts = (dbCerts.length > 0 ? dbCerts : MOCK_CERTS) as typeof MOCK_CERTS;
  const sourceCerts = allCerts.filter((c) => c.tab === activeTab);

  useEffect(() => { setPage(1); }, [activeTab, activeType, query]);

  const filtered = sourceCerts.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalCount = filtered.length;

  const handleSearch = () => { setQuery(inputValue); setPage(1); };

  const handleTabChange = (tab: "current" | "archive") => {
    setInputValue(""); setQuery(""); setPage(1);
    setSearchParams((p) => { p.set("tab", tab); p.delete("type"); return p; });
  };

  const handleTypeChange = (type: string) => {
    setInputValue(""); setQuery(""); setPage(1);
    setSearchParams((p) => {
      if (type === "전체보기") p.delete("type"); else p.set("type", type);
      return p;
    });
  };

  const formatDate = (val: string | Date) => {
    const d = new Date(val);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F2EB" }}>
      {/* ── 배너 ── */}
      {showBanner && (
        <PageBanner
          imageUrl="/banner/rating_banner_temp.png"
          title="등급판정서"
          subtitle="계란 농장판정 결과를 공개하여 품질 신뢰를 높이고 있습니다."
          breadcrumb={[
            { label: "Home", href: "/" },
            { label: "고객지원", href: "/support" },
            { label: "등급판정서" },
          ]}
          dbBanner={pageBanner}
          hideBreadcrumbOnMobile
        />
      )}

      {/* ── 상단 타이틀 (별 아이콘) ── */}
      <div className="px-4 pt-3">
        <div className="inline-flex items-center gap-1.5">
          <img src="/home/product-star.png" alt="" className="h-3.5 w-3.5 object-contain" />
          <h1 className="text-[24px] font-semibold tracking-[-0.04em] text-[#1F2121] md:text-[32px]">
            등급판정서
          </h1>
        </div>
      </div>

      {/* ── 본문 ── */}
      <div className="mx-auto max-w-[1600px] px-4 py-6 md:py-10 md:px-6 lg:px-10">

        {/* ── 상단 탭 ── */}
        <div className="mb-6 flex overflow-hidden rounded-full border border-[#D8D0BB] md:rounded-xl">
          <button
            onClick={() => handleTabChange("current")}
            className="flex h-16 flex-1 items-center justify-center gap-2 px-2 text-[16px] font-extrabold tracking-[-0.04em] transition-colors md:h-auto md:py-4 md:text-sm md:font-bold md:tracking-normal"
            style={
              activeTab === "current"
                ? { backgroundColor: "#32AF32", color: "#fff" }
                : { backgroundColor: "#F0EEDD", color: "#555" }
            }
          >
            {activeTab === "current" && (
              <img
                src="/home/star_icon.png"
                alt=""
                className="h-3.5 w-3.5 object-contain md:h-4 md:w-4"
              />
            )}
            등급판정서
          </button>
          <button
            onClick={() => handleTabChange("archive")}
            className="flex h-16 flex-1 items-center justify-center gap-2 px-2 text-[16px] font-extrabold tracking-[-0.04em] transition-colors md:h-auto md:py-4 md:text-sm md:font-medium md:tracking-normal"
            style={
              activeTab === "archive"
                ? { backgroundColor: "#32AF32", color: "#fff" }
                : { backgroundColor: "#F0EEDD", color: "#555" }
            }
          >
            등급판정서
            <span className="text-[10px] md:text-xs">(2022.11 이전)</span>
          </button>
        </div>

        {/* ── 탭 설명 ── */}
        {activeTab === "current" && (
          <p className="mb-6 text-xs leading-relaxed text-gray-500 md:mb-8 md:text-sm">
            아래에 나타난 등급판정서는 실제로 등급 판정 대상이 되는 축산물품질평가원의 이지-시스, 축산물품질평가원/가축에서
            7+등급 또는 기등급 판정 완료 현재 완성된 판정서를 올려드리고 있습니다. 매달 판정을 올려드리므로 아래 판정서에서 수정된 내용을 참고해 판정서 열람이 가능합니다.
          </p>
        )}

        {/* ── 필터 탭 + 검색 ── */}
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {CERT_TYPES.map((type) => {
              const isActive = type === activeType;
              return (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
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
                  {type}
                </button>
              );
            })}
          </div>

          <div className="hidden md:block">
            <SearchBar value={inputValue} onChange={setInputValue} onSearch={handleSearch} />
          </div>
        </div>

        {/* ── 목록 ── */}
        {paginated.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">검색 결과가 없습니다.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {paginated.map((cert, idx) => {
              const displayNum = totalCount - ((page - 1) * ITEMS_PER_PAGE + idx);
              return (
                <Link
                  key={cert.cert_id}
                  to={`/support/grade-certificate/${cert.cert_id}`}
                  className="group grid grid-cols-[58px_1fr] items-start gap-x-3 gap-y-1 rounded-xl px-4 py-3 transition-all hover:brightness-[0.97] md:px-5 md:py-4"
                  style={{ backgroundColor: "#F0EEDD" }}
                >
                  {/* 왼쪽: 번호 + 카테고리 태그 */}
                  <div className="row-span-2 flex flex-col items-center gap-1.5 pt-0.5">
                    <span className="text-xs text-gray-500 md:text-sm">{displayNum}</span>
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold md:px-2.5 md:text-[11px]"
                      style={{ backgroundColor: "#EAE3C9", color: "#003F2B" }}
                    >
                      {cert.cert_type}
                    </span>
                  </div>

                  {/* 오른쪽: 제목 + 다운로드 */}
                  <div className="flex items-center gap-2">
                    <span className="flex-1 truncate text-[13px] font-medium text-gray-800 transition-colors group-hover:text-[#02633E] md:text-sm">
                      {cert.title}
                    </span>
                    {cert.file_url && cert.file_url !== "#" ? (
                      <a
                        href={cert.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="shrink-0 text-gray-400 transition-colors hover:text-[#02633E]"
                      >
                        <Download className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      </a>
                    ) : (
                      <span className="shrink-0 text-gray-200"><Download className="h-3.5 w-3.5 md:h-4 md:w-4" /></span>
                    )}
                  </div>

                  {/* 오른쪽 하단: 메타 */}
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 md:text-xs">
                    <span>{formatDate(cert.created_at)}</span>
                    <span>{cert.view_count}</span>
                  </div>
                </Link>
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
