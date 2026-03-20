/**
 * 등급판정서 목록 페이지
 */
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { Search, ChevronLeft, ChevronRight, Check, Plus, Download } from "lucide-react";
import type { Route } from "./+types/grade-certificate";
import { PageBanner } from "~/core/components/page-banner";
import { getGradeCertificates } from "../lib/queries.server";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";

export const meta: Route.MetaFunction = () => [
  { title: "등급판정서 | 풍림푸드" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const tab = (url.searchParams.get("tab") ?? "current") as "current" | "archive";
  const certType = url.searchParams.get("type") ?? "전체";

  const [dbCerts, pageBanner] = await Promise.all([
    getGradeCertificates(tab, certType === "전체" ? undefined : certType).catch(() => []),
    getPageBanner("grade-certificate").catch(() => null),
  ]);

  return { dbCerts, pageBanner, activeTab: tab, activeType: certType };
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

const CERT_TYPES = ["전체", "포장란", "액란", "기타"];
const ITEMS_PER_PAGE = 10;

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
      if (type === "전체") p.delete("type"); else p.set("type", type);
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
      <div className="pt-[118px]">
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
        />
      </div>

      {/* ── 본문 ── */}
      <div className="mx-auto max-w-[1600px] px-4 py-10 md:px-6 lg:px-10">

        {/* ── 상단 탭 ── */}
        <div className="mb-6 flex overflow-hidden rounded-xl border border-[#D8D0BB]">
          <button
            onClick={() => handleTabChange("current")}
            className="flex flex-1 items-center justify-center gap-2 py-4 text-sm font-bold transition-colors"
            style={
              activeTab === "current"
                ? { backgroundColor: "#02633E", color: "#fff" }
                : { backgroundColor: "#F0EEDD", color: "#555" }
            }
          >
            {activeTab === "current" && <Plus className="h-4 w-4" />}
            등급판정서
          </button>
          <button
            onClick={() => handleTabChange("archive")}
            className="flex flex-1 items-center justify-center gap-2 py-4 text-sm font-medium transition-colors"
            style={
              activeTab === "archive"
                ? { backgroundColor: "#02633E", color: "#fff" }
                : { backgroundColor: "#F0EEDD", color: "#555" }
            }
          >
            등급판정서 (2022.11 이전)
          </button>
        </div>

        {/* ── 탭 설명 ── */}
        {activeTab === "current" && (
          <p className="mb-8 text-sm leading-relaxed text-gray-500">
            아래에 나타난 등급판정서는 실제로 등급 판정 대상이 되는 축산물품질평가원의 이지-시스, 축산물품질평가원/가축에서<br className="hidden md:block" />
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
                  className="flex items-center gap-1.5 rounded-full px-5 font-medium transition-colors"
                  style={{
                    fontSize: "18px",
                    letterSpacing: "-0.04em",
                    height: "43px",
                    ...(isActive
                      ? { backgroundColor: "#02633E", color: "#fff" }
                      : { backgroundColor: "#EAE3C9", color: "#003F2B" }),
                  }}
                >
                  {isActive && <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />}
                  {type}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="검색어를 입력해주세요."
              className="h-16 w-64 rounded-full border-0 bg-white px-5 text-sm outline-none"
            />
            <button
              onClick={handleSearch}
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition-all hover:brightness-110 active:scale-95"
              style={{ backgroundColor: "#02633E" }}
            >
              <Search className="h-5 w-5" />
            </button>
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
                <div
                  key={cert.cert_id}
                  className="group grid items-center gap-4 rounded-xl px-5 py-4"
                  style={{
                    backgroundColor: "#F0EEDD",
                    gridTemplateColumns: "56px 1fr 80px 120px 56px 40px",
                  }}
                >
                  {/* ① 번호 */}
                  <span className="text-center text-sm text-gray-400">{displayNum}</span>

                  {/* ② 제목 */}
                  <Link
                    to={`/support/grade-certificate/${cert.cert_id}`}
                    className="truncate text-sm font-medium text-gray-800 transition-colors hover:text-[#02633E]"
                  >
                    {cert.title}
                  </Link>

                  {/* ③ 구분 */}
                  <div className="hidden text-center sm:block">
                    <span
                      className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                      style={{ backgroundColor: "#EAE3C9", color: "#003F2B" }}
                    >
                      {cert.cert_type}
                    </span>
                  </div>

                  {/* ④ 날짜 */}
                  <span className="hidden text-center text-xs text-gray-400 md:block">
                    {formatDate(cert.created_at)}
                  </span>

                  {/* ⑤ 조회수 */}
                  <span className="text-right text-xs text-gray-400">{cert.view_count}</span>

                  {/* ⑥ 다운로드 */}
                  {cert.file_url && cert.file_url !== "#" ? (
                    <a
                      href={cert.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-center text-gray-400 transition-colors hover:text-[#02633E]"
                      title={cert.file_name ?? "파일 다운로드"}
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  ) : (
                    <span className="flex items-center justify-center text-gray-200">
                      <Download className="h-4 w-4" />
                    </span>
                  )}
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
