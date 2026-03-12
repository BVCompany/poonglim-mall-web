/**
 * Admin Top Navigation Bar
 *
 * Top navigation bar for admin panel with site title and link to main website.
 */
import { ExternalLink } from "lucide-react";
import { Link, useLocation } from "react-router";
import { useEffect } from "react";

/** 관리자 페이지는 항상 라이트 모드 고정 */
function useForceLight() {
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("dark");
    html.classList.add("light");
    return () => {
      html.classList.remove("light");
    };
  }, []);
}

const PAGE_TITLE_MAP: Record<string, string> = {
  "/admin/dashboard":              "대시보드",
  "/admin/products":               "제품 관리",
  "/admin/events":                 "이벤트/공지 관리",
  "/admin/recipes":                "레시피 관리",
  "/admin/careers":                "채용공고 관리",
  "/admin/applications":           "채용 지원서",
  "/admin/inquiries/consulting":   "상담 문의",
  "/admin/inquiries/tour":         "공장 견학 신청",
  "/admin/settings/banners":       "메인 배너 관리",
  "/admin/settings/page-banners":  "페이지 배너 관리",
  "/admin/settings/popups":        "팝업 관리",
  "/admin/settings/site":          "홈 섹션 관리",
  "/admin/settings/seo":           "사이트 설정",
  "/admin/settings/admins":        "관리자 계정",
  "/admin/media/news":             "뉴스/보도자료",
  "/admin/media/catalog":          "카탈로그",
};

const APP_TITLE = "풍림 Admin";

export function AdminNavbar() {
  const { pathname } = useLocation();
  useForceLight();

  useEffect(() => {
    const pageTitle = PAGE_TITLE_MAP[pathname];
    document.title = pageTitle ? `${pageTitle} | ${APP_TITLE}` : APP_TITLE;
  }, [pathname]);

  const pageTitle = PAGE_TITLE_MAP[pathname];

  return (
    <div className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Left: Current page title */}
      <p className="text-sm font-medium text-gray-700">
        {pageTitle ?? ""}
      </p>

      {/* Right: Website Link */}
      <Link
        to="/"
        className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900"
      >
        <span>웹사이트 보기</span>
        <ExternalLink className="h-4 w-4" />
      </Link>
    </div>
  );
}
