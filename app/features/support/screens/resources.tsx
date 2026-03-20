/**
 * 자료실 페이지 (임시)
 */
import { FileText, Download } from "lucide-react";
import type { Route } from "./+types/resources";

export function meta(_: Route.MetaArgs) {
  return [{ title: "자료실 | 풍림푸드" }];
}

const CATEGORIES = ["전체", "카탈로그", "인증서", "시험성적서", "기타"];

const MOCK_FILES = [
  { id: 1, category: "카탈로그", title: "풍림푸드 제품 카탈로그 2025", size: "8.2MB", date: "2025-01-10", ext: "PDF" },
  { id: 2, category: "인증서", title: "HACCP 인증서", size: "1.1MB", date: "2024-12-01", ext: "PDF" },
  { id: 3, category: "인증서", title: "ISO 22000 인증서", size: "0.9MB", date: "2024-12-01", ext: "PDF" },
  { id: 4, category: "시험성적서", title: "액란 품질검사 성적서 (2024 하반기)", size: "2.3MB", date: "2024-11-15", ext: "PDF" },
  { id: 5, category: "카탈로그", title: "풍림푸드 회사 소개서", size: "5.7MB", date: "2024-10-01", ext: "PDF" },
];

export default function ResourcesScreen() {
  return (
    <div className="min-h-screen bg-[#F5F2EB]">
      <div className="mx-auto max-w-[900px] px-4 py-16 md:px-6 lg:px-10">
        <div className="mb-10 flex items-center gap-3">
          <FileText className="h-8 w-8" style={{ color: "#003F2B" }} />
          <h1
            className="text-4xl font-extrabold"
            style={{ color: "#003F2B", letterSpacing: "-0.04em" }}
          >
            자료실
          </h1>
        </div>

        {/* 카테고리 탭 */}
        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat}
              className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
              style={
                i === 0
                  ? { backgroundColor: "#003F2B", color: "#fff" }
                  : { backgroundColor: "#EAE3C9", color: "#003F2B" }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 파일 목록 */}
        <div className="space-y-3">
          {MOCK_FILES.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
                  style={{ backgroundColor: "#003F2B" }}
                >
                  {file.ext}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{file.title}</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {file.category} · {file.size} · {file.date}
                  </p>
                </div>
              </div>
              <button
                className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors hover:brightness-110"
                style={{ backgroundColor: "#EAE3C9", color: "#003F2B" }}
              >
                <Download className="h-4 w-4" />
                다운로드
              </button>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-gray-400">
          * 현재 임시 데이터가 표시됩니다. 실제 자료는 관리자 페이지에서 등록 예정입니다.
        </p>
      </div>
    </div>
  );
}
