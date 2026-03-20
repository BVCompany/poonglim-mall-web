/**
 * Admin Grade Certificates Management Screen
 * 등급판정서 관리 화면
 */
import { useState } from "react";
import { useFetcher } from "react-router";
import type { Route } from "./+types/grade-certificates";
import { requireAdminAuth } from "../utils/auth.server";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Plus, Search, Edit, Trash2, Download, Paperclip } from "lucide-react";
import db from "~/core/db/drizzle-client.server";
import { gradeCertificates } from "~/features/support/schema";
import { eq } from "drizzle-orm";
import { getAllGradeCerts } from "~/features/support/lib/queries.server";
import { GradeCertAddModal } from "../components/grade-cert-add-modal";
import type { GradeCertFormData } from "../components/grade-cert-add-modal";

export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminAuth(request);
  const dbCerts = await getAllGradeCerts().catch(() => []);
  return { adminUser, dbCerts };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdminAuth(request);
  const fd = await request.formData();
  const intent = fd.get("intent") as string;

  if (intent === "create") {
    await db.insert(gradeCertificates).values({
      tab: (fd.get("tab") as "current" | "archive") ?? "current",
      cert_type: (fd.get("cert_type") as "포장란" | "액란" | "기타") ?? "포장란",
      title: fd.get("title") as string,
      content: (fd.get("content") as string) ?? "",
      author: (fd.get("author") as string) || "풍림푸드",
      file_url: (fd.get("file_url") as string) || null,
      file_name: (fd.get("file_name") as string) || null,
      is_active: true,
    });
    return { success: true };
  }

  if (intent === "update") {
    const id = Number(fd.get("id"));
    if (id) {
      await db.update(gradeCertificates).set({
        tab: (fd.get("tab") as "current" | "archive") ?? "current",
        cert_type: (fd.get("cert_type") as "포장란" | "액란" | "기타") ?? "포장란",
        title: fd.get("title") as string,
        content: (fd.get("content") as string) ?? "",
        author: (fd.get("author") as string) || "풍림푸드",
        file_url: (fd.get("file_url") as string) || null,
        file_name: (fd.get("file_name") as string) || null,
        updated_at: new Date(),
      }).where(eq(gradeCertificates.cert_id, id));
    }
    return { success: true };
  }

  if (intent === "delete") {
    const id = Number(fd.get("id"));
    if (id) await db.delete(gradeCertificates).where(eq(gradeCertificates.cert_id, id));
    return { success: true };
  }

  if (intent === "toggle_active") {
    const id = Number(fd.get("id"));
    const current = fd.get("is_active") === "true";
    if (id) {
      await db.update(gradeCertificates).set({ is_active: !current })
        .where(eq(gradeCertificates.cert_id, id));
    }
    return { success: true };
  }

  return { success: false };
}

/* ── 탭 배지 스타일 ── */
const TAB_STYLE: Record<string, string> = {
  current: "bg-[#003F2B] text-white",
  archive: "bg-[#EAE3C9] text-[#003F2B]",
};

const TAB_LABEL: Record<string, string> = {
  current: "등급판정서",
  archive: "2022.11 이전",
};

/* ── 더미 데이터 ── */
const MOCK_CERTS = [
  { cert_id: 2, tab: "current", cert_type: "액란",   title: "02/25 등급판정서 (액란용)",   file_url: null, file_name: "6004-02250002.pdf", view_count: 88,  is_active: true, author: "풍림푸드", content: "", created_at: new Date("2026-02-18") },
  { cert_id: 1, tab: "current", cert_type: "포장란", title: "02/24 등급판정서 (포장란용)", file_url: null, file_name: "6004-02250001.pdf", view_count: 55,  is_active: true, author: "풍림푸드", content: "", created_at: new Date("2026-02-17") },
];

export default function AdminGradeCertsScreen({ loaderData }: Route.ComponentProps) {
  const { adminUser, dbCerts } = loaderData;
  const fetcher = useFetcher();
  const [searchQuery, setSearchQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>();
  const [editingData, setEditingData] = useState<GradeCertFormData | undefined>();

  const sourceCerts = (dbCerts.length > 0 ? dbCerts : MOCK_CERTS) as typeof MOCK_CERTS;

  const filtered = sourceCerts.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const formatDate = (d: Date | string) => {
    const date = new Date(d);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const handleOpenEdit = (id: number) => {
    const c = sourceCerts.find((x) => x.cert_id === id);
    if (!c) return;
    setEditingData({
      tab: c.tab as "current" | "archive",
      cert_type: c.cert_type as "포장란" | "액란" | "기타",
      title: c.title,
      content: c.content,
      author: c.author,
      file_url: c.file_url ?? "",
      file_name: c.file_name ?? "",
    });
    setEditingId(id);
  };

  const submitCert = (data: GradeCertFormData, intent: "create" | "update", id?: number) => {
    const fd = new FormData();
    fd.append("intent", intent);
    if (id) fd.append("id", String(id));
    fd.append("tab", data.tab);
    fd.append("cert_type", data.cert_type);
    fd.append("title", data.title);
    fd.append("content", data.content);
    fd.append("author", data.author);
    fd.append("file_url", data.file_url);
    fd.append("file_name", data.file_name);
    fetcher.submit(fd, { method: "post" });
  };

  const handleDelete = (id: number) => {
    if (!confirm("등급판정서를 삭제하시겠습니까?")) return;
    const fd = new FormData();
    fd.append("intent", "delete");
    fd.append("id", String(id));
    fetcher.submit(fd, { method: "post" });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar adminUser={adminUser} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-6xl">
            {/* 헤더 */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">등급판정서 관리</h1>
                <p className="mt-1 text-sm text-gray-500">전체 {filtered.length}건</p>
              </div>
              <Button
                onClick={() => setAddOpen(true)}
                className="flex items-center gap-2 bg-[#204E3A] text-white hover:bg-[#204E3A]/90"
              >
                <Plus className="h-4 w-4" />
                새 등급판정서 등록
              </Button>
            </div>

            {/* 검색 */}
            <div className="mb-4 flex max-w-sm items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="등급판정서 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* 테이블 */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-sm font-semibold text-gray-600">
                    <th className="px-5 py-3 text-left">탭</th>
                    <th className="px-5 py-3 text-left">종류</th>
                    <th className="px-5 py-3 text-left">제목</th>
                    <th className="px-5 py-3 text-center">첨부</th>
                    <th className="px-5 py-3 text-center">조회</th>
                    <th className="px-5 py-3 text-center">등록일</th>
                    <th className="px-5 py-3 text-center">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-sm text-gray-400">
                        등록된 등급판정서가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((cert, idx) => (
                      <tr
                        key={cert.cert_id}
                        className="border-b border-gray-50 text-sm transition-colors hover:bg-gray-50"
                        style={idx === filtered.length - 1 ? { borderBottom: "none" } : {}}
                      >
                        <td className="px-5 py-3">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${TAB_STYLE[cert.tab] ?? "bg-gray-100 text-gray-600"}`}
                          >
                            {TAB_LABEL[cert.tab] ?? cert.tab}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="rounded-full bg-[#F0EEDD] px-2.5 py-0.5 text-xs font-medium text-[#003F2B]">
                            {cert.cert_type}
                          </span>
                        </td>
                        <td className="max-w-xs px-5 py-3">
                          <span className="truncate font-medium text-gray-800">{cert.title}</span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          {cert.file_name ? (
                            <a
                              href={cert.file_url ?? "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={cert.file_name}
                              className="inline-flex items-center justify-center text-[#003F2B] transition-colors hover:text-[#02633E]"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          ) : (
                            <span className="text-gray-300">
                              <Paperclip className="inline h-4 w-4" />
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-center text-gray-500">
                          {cert.view_count}
                        </td>
                        <td className="px-5 py-3 text-center text-gray-400">
                          {formatDate(cert.created_at)}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(cert.cert_id)}
                              className="h-7 w-7 p-0 text-gray-500 hover:text-blue-600"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(cert.cert_id)}
                              className="h-7 w-7 p-0 text-gray-500 hover:text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* 추가 모달 */}
      <GradeCertAddModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={(data) => { submitCert(data, "create"); setAddOpen(false); }}
      />

      {/* 수정 모달 */}
      {editingId !== undefined && (
        <GradeCertAddModal
          open={editingId !== undefined}
          onOpenChange={(o) => { if (!o) setEditingId(undefined); }}
          onSubmit={(data) => { submitCert(data, "update", editingId); setEditingId(undefined); }}
          editId={editingId}
          initialData={editingData}
        />
      )}
    </div>
  );
}
