/**
 * 자료실 더미 데이터 — DB에 활성 자료가 없을 때만 노출 (관리자·공개 공통 소스)
 */
import type { LibraryResource } from "./queries.server";

export type LibraryDemoDetail = {
  id: number;
  category: string;
  title: string;
  content: string;
  author: string;
  view_count: number;
  created_at: string;
  file_name: string;
  file_url: string;
  file_size_label: string;
  file_ext: string;
};

/** 공개 목록·카드용 (resources.tsx) */
export type LibraryDemoPublic = {
  id: number;
  category: string;
  title: string;
  size: string;
  date: string;
  ext: string;
  url: string;
};

const DEMO_ENTRIES: LibraryDemoDetail[] = [
  {
    id: 10,
    category: "인증서",
    title: "ISO 22000 식품안전경영시스템 인증서",
    content:
      "풍림푸드의 식품안전경영시스템 인증 현황입니다. 첨부 파일을 내려받아 참고해 주세요.",
    author: "풍림푸드",
    view_count: 1520,
    created_at: "2026-04-18T14:00:00.000Z",
    file_name: "Poonglim_ISO22000_2026.pdf",
    file_url: "#",
    file_size_label: "2.1 MB",
    file_ext: "PDF",
  },
  {
    id: 9,
    category: "카탈로그",
    title: "2026년 풍림푸드 종합 제품 카탈로그",
    content: "액란·가공품·디저트 라인업을 한눈에 보실 수 있는 종합 카탈로그입니다.",
    author: "풍림푸드",
    view_count: 3890,
    created_at: "2026-04-15T11:30:00.000Z",
    file_name: "Poonglim_Catalog_2026.pdf",
    file_url: "#",
    file_size_label: "8.4 MB",
    file_ext: "PDF",
  },
  {
    id: 8,
    category: "회사소개",
    title: "풍림푸드 기업소개서 (Company Profile)",
    content: "연혁, 사업 영역, 주요 시설 및 품질 철학을 담은 기업소개서입니다.",
    author: "풍림푸드",
    view_count: 2100,
    created_at: "2026-04-12T09:00:00.000Z",
    file_name: "Poonglim_Company_Profile_2026.pdf",
    file_url: "#",
    file_size_label: "5.2 MB",
    file_ext: "PDF",
  },
  {
    id: 7,
    category: "기타",
    title: "계란 선별·포장 공정 안내 자료",
    content: "원료 수급부터 출하까지 계란 품질 관리 공정을 설명한 자료입니다.",
    author: "풍림푸드",
    view_count: 640,
    created_at: "2026-04-08T16:20:00.000Z",
    file_name: "egg_process_guide.pdf",
    file_url: "#",
    file_size_label: "1.3 MB",
    file_ext: "PDF",
  },
  {
    id: 6,
    category: "인증서",
    title: "무항생제·동물복지 인증 관련 서류",
    content: "사육 환경 및 인증 기준을 요약한 자료입니다.",
    author: "풍림푸드",
    view_count: 980,
    created_at: "2026-03-28T10:15:00.000Z",
    file_name: "antibiotic_free_cert.pdf",
    file_url: "#",
    file_size_label: "920 KB",
    file_ext: "PDF",
  },
  {
    id: 5,
    category: "카탈로그",
    title: "B2B 액란·가공품 라인업 요약",
    content: "외식·제조 고객사용 제품 스펙 및 납품 단위 안내입니다.",
    author: "풍림푸드",
    view_count: 1750,
    created_at: "2026-03-20T13:45:00.000Z",
    file_name: "B2B_lineup_summary.pdf",
    file_url: "#",
    file_size_label: "3.7 MB",
    file_ext: "PDF",
  },
  {
    id: 4,
    category: "회사소개",
    title: "ESG·지속가능경영 활동 요약",
    content: "환경·사회·지배구조 관련 주요 활동과 목표를 정리했습니다.",
    author: "풍림푸드",
    view_count: 1120,
    created_at: "2026-03-10T08:00:00.000Z",
    file_name: "ESG_summary_2026.pdf",
    file_url: "#",
    file_size_label: "1.8 MB",
    file_ext: "PDF",
  },
  {
    id: 3,
    category: "인증서",
    title: "할랄(HALAL) 인증서",
    content: "수출 및 유통 관련 할랄 인증 사본입니다.",
    author: "풍림푸드",
    view_count: 430,
    created_at: "2026-02-26T15:30:00.000Z",
    file_name: "HALAL_certificate.pdf",
    file_url: "#",
    file_size_label: "640 KB",
    file_ext: "PDF",
  },
  {
    id: 2,
    category: "기타",
    title: "협력사·납품 파트너 가이드",
    content: "납품 절차, 서류 요구사항, 품질 기준을 안내합니다.",
    author: "풍림푸드",
    view_count: 890,
    created_at: "2026-02-14T12:00:00.000Z",
    file_name: "partner_supply_guide.pdf",
    file_url: "#",
    file_size_label: "2.4 MB",
    file_ext: "PDF",
  },
  {
    id: 1,
    category: "카탈로그",
    title: "신제품·시즌 디저트 브로슈어",
    content: "신제품 라인 및 프로모션용 브로슈어입니다.",
    author: "풍림푸드",
    view_count: 2560,
    created_at: "2026-02-01T09:30:00.000Z",
    file_name: "new_products_brochure.pdf",
    file_url: "#",
    file_size_label: "4.1 MB",
    file_ext: "PDF",
  },
];

export function getLibraryDemoPublicList(): LibraryDemoPublic[] {
  return DEMO_ENTRIES.map((d) => ({
    id: d.id,
    category: d.category,
    title: d.title,
    size: d.file_size_label,
    date: d.created_at.slice(0, 10),
    ext: d.file_ext,
    url: d.file_url,
  }));
}

export function getLibraryDemoDetailMap(): Record<number, LibraryDemoDetail> {
  return Object.fromEntries(DEMO_ENTRIES.map((d) => [d.id, d]));
}

/** 관리자 테이블용 — `resource_id < 0` 이면 더미(수정·삭제 불가) */
export function getLibraryDemoAdminRows(): LibraryResource[] {
  return DEMO_ENTRIES.map((d) => ({
    resource_id: -d.id,
    category: d.category,
    title: d.title,
    content: d.content,
    author: d.author,
    file_name: d.file_name,
    file_url: d.file_url,
    file_size_label: d.file_size_label,
    file_ext: d.file_ext,
    view_count: d.view_count,
    is_active: true,
    created_at: new Date(d.created_at),
    updated_at: new Date(d.created_at),
  }));
}

export function isLibraryDemoAdminRow(resourceId: number): boolean {
  return resourceId < 0;
}
