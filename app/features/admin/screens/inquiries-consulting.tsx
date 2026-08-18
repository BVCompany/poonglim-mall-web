/**
 * Admin Consulting Inquiries Management Page
 * 문의하기 내역 관리 (contacts 테이블 사용)
 */
import type { Route } from "./+types/inquiries-consulting";

import {
  Building2,
  CheckCircle,
  Eye,
  Mail,
  Phone,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useFetcher } from "react-router";

import { Button } from "~/core/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/core/components/ui/dialog";
import { Input } from "~/core/components/ui/input";
import {
  deleteContact,
  getAllContacts,
  updateContactStatus,
} from "~/features/support/lib/queries.server";

import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import { ADMIN_PERMISSIONS } from "../types/auth.types";
import { requireAdminMutation, requireAdminPermission } from "../utils/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminPermission(
    request,
    ADMIN_PERMISSIONS.CONSULTING_INQUIRIES,
  );
  const dbContacts = await getAllContacts().catch(() => []);
  return { adminUser, dbContacts };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdminMutation(request, ADMIN_PERMISSIONS.CONSULTING_INQUIRIES, "consulting_inquiries");
  const fd = await request.formData();
  const intent = fd.get("intent") as string;

  if (intent === "complete") {
    const id = Number(fd.get("id"));
    if (id) await updateContactStatus(id, "completed");
  }
  if (intent === "pending") {
    const id = Number(fd.get("id"));
    if (id) await updateContactStatus(id, "pending");
  }
  if (intent === "delete") {
    const id = Number(fd.get("id"));
    if (id) await deleteContact(id);
  }
  return { success: true };
}

type Contact = {
  contact_id: number;
  inquiry_type: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  title: string;
  content: string;
  status: "pending" | "completed";
  admin_memo: string | null;
  created_at: Date | string;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "대기중",
  completed: "처리완료",
};
const STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  completed: "bg-green-100 text-green-800 border-green-200",
};

export default function AdminConsultingInquiriesPage({
  loaderData,
}: Route.ComponentProps) {
  const { adminUser, dbContacts } = loaderData;
  const fetcher = useFetcher();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "completed"
  >("all");
  const [selected, setSelected] = useState<Contact | null>(null);

  const contacts = dbContacts as Contact[];

  const filtered = contacts.filter((c) => {
    const matchSearch =
      !search ||
      c.name.includes(search) ||
      c.title.includes(search) ||
      c.content.includes(search) ||
      (c.email ?? "").includes(search) ||
      (c.phone ?? "").includes(search);
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const formatDate = (d: Date | string) =>
    new Date(d).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar adminUser={adminUser} />
      <div className="flex flex-1 flex-col">
        <AdminNavbar />
        <main className="flex-1 p-6">
          {/* 헤더 */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                상담 문의 관리
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                총 {contacts.length}건 · 대기중{" "}
                {contacts.filter((c) => c.status === "pending").length}건
              </p>
            </div>
          </div>

          {/* 통계 카드 */}
          <div className="mb-6 grid grid-cols-3 gap-4">
            {[
              {
                label: "전체 문의",
                value: contacts.length,
                color: "text-gray-900",
              },
              {
                label: "대기중",
                value: contacts.filter((c) => c.status === "pending").length,
                color: "text-orange-500",
              },
              {
                label: "처리완료",
                value: contacts.filter((c) => c.status === "completed").length,
                color: "text-emerald-600",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className={`mt-1 text-4xl font-bold ${s.color}`}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* 필터 + 검색 */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            {(["all", "pending", "completed"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  filterStatus === s
                    ? "bg-[#02633E] text-white"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {s === "all" ? "전체" : STATUS_LABEL[s]}
              </button>
            ))}
            <div className="relative ml-auto">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="이름, 제목, 내용, 이메일 검색..."
                className="w-72 pl-9"
              />
            </div>
          </div>

          {/* 테이블 */}
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-gray-100 bg-white py-20 text-center text-gray-400 shadow-sm">
              접수된 문의가 없습니다.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                    <th className="px-4 py-3">번호</th>
                    <th className="px-4 py-3">문의유형</th>
                    <th className="px-4 py-3">이름</th>
                    <th className="px-4 py-3">연락처</th>
                    <th className="px-4 py-3">제목</th>
                    <th className="px-4 py-3">상태</th>
                    <th className="px-4 py-3">접수일</th>
                    <th className="px-4 py-3 text-right">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, idx) => (
                    <tr
                      key={c.contact_id}
                      className="border-b transition-colors last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-gray-400">
                        {filtered.length - idx}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-[#F0EEDD] px-2 py-0.5 text-xs font-medium text-gray-700">
                          {c.inquiry_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {c.name}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        <div>{c.phone ?? "-"}</div>
                        <div className="text-xs text-gray-400">{c.email}</div>
                      </td>
                      <td className="max-w-xs px-4 py-3">
                        <button
                          onClick={() => setSelected(c)}
                          className="truncate text-left font-medium text-gray-800 hover:text-[#02633E] hover:underline"
                        >
                          {c.title}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[c.status]}`}
                        >
                          {STATUS_LABEL[c.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {formatDate(c.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelected(c)}
                            title="상세보기"
                          >
                            <Eye className="h-4 w-4 text-gray-500" />
                          </Button>
                          {c.status === "pending" ? (
                            <fetcher.Form method="post">
                              <input
                                type="hidden"
                                name="intent"
                                value="complete"
                              />
                              <input
                                type="hidden"
                                name="id"
                                value={c.contact_id}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                type="submit"
                                title="처리완료"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                            </fetcher.Form>
                          ) : (
                            <fetcher.Form method="post">
                              <input
                                type="hidden"
                                name="intent"
                                value="pending"
                              />
                              <input
                                type="hidden"
                                name="id"
                                value={c.contact_id}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                type="submit"
                                title="대기중으로 변경"
                              >
                                <CheckCircle className="h-4 w-4 text-gray-400" />
                              </Button>
                            </fetcher.Form>
                          )}
                          <fetcher.Form method="post">
                            <input type="hidden" name="intent" value="delete" />
                            <input
                              type="hidden"
                              name="id"
                              value={c.contact_id}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              type="submit"
                              title="삭제"
                              onClick={(e) => {
                                if (!confirm("이 문의를 삭제하시겠습니까?"))
                                  e.preventDefault();
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </Button>
                          </fetcher.Form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* 상세보기 모달 */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden sm:max-w-2xl">
          <DialogHeader className="shrink-0">
            <DialogTitle>문의 상세</DialogTitle>
          </DialogHeader>
          {selected && (
            <>
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1 text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[selected.status]}`}
                  >
                    {STATUS_LABEL[selected.status]}
                  </span>
                  <span className="rounded-full bg-[#F0EEDD] px-2 py-0.5 text-xs font-medium text-gray-700">
                    {selected.inquiry_type}
                  </span>
                  <span className="ml-auto text-gray-400">
                    {formatDate(selected.created_at)}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-gray-900">
                  {selected.title}
                </h2>

                <div className="grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="font-medium text-gray-700">이름:</span>
                    {selected.name}
                  </div>
                  {selected.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4 shrink-0" />
                      {selected.phone}
                    </div>
                  )}
                  {selected.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4 shrink-0" />
                      {selected.email}
                    </div>
                  )}
                  {selected.company && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building2 className="h-4 w-4 shrink-0" />
                      {selected.company}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-4">
                  <p className="leading-relaxed whitespace-pre-wrap break-words text-gray-700">
                    {selected.content}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 justify-end gap-2 border-t border-gray-100 pt-4">
                {selected.status === "pending" ? (
                  <fetcher.Form method="post">
                    <input type="hidden" name="intent" value="complete" />
                    <input
                      type="hidden"
                      name="id"
                      value={selected.contact_id}
                    />
                    <Button
                      type="submit"
                      className="bg-[#02633E] text-white hover:bg-[#024d31]"
                      onClick={() => setSelected(null)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      처리완료로 변경
                    </Button>
                  </fetcher.Form>
                ) : (
                  <fetcher.Form method="post">
                    <input type="hidden" name="intent" value="pending" />
                    <input
                      type="hidden"
                      name="id"
                      value={selected.contact_id}
                    />
                    <Button
                      type="submit"
                      variant="outline"
                      onClick={() => setSelected(null)}
                    >
                      대기중으로 변경
                    </Button>
                  </fetcher.Form>
                )}
                <Button variant="outline" onClick={() => setSelected(null)}>
                  닫기
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
