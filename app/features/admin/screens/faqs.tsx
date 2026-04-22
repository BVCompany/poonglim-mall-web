/**
 * Admin FAQ Management Screen
 * FAQ 관리 화면
 */
import { randomUUID } from "node:crypto";
import { useState } from "react";
import { useFetcher } from "react-router";
import type { Route } from "./+types/faqs";
import { requireAdminAuth } from "../utils/auth.server";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import db from "~/core/db/drizzle-client.server";
import { faqs } from "~/features/support/schema";
import { eq } from "drizzle-orm";
import { getAllFaqs } from "~/features/support/lib/queries.server";
import { FaqAddModal } from "../components/faq-add-modal";
import type { FaqFormData } from "../components/faq-add-modal";

export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminAuth(request);
  const dbFaqs = await getAllFaqs().catch(() => []);
  return { adminUser, dbFaqs };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdminAuth(request);
  const fd = await request.formData();
  const intent = fd.get("intent") as string;

  if (intent === "create") {
    const locale =
      ((fd.get("locale") as string) || "ko").toLowerCase() === "en" ? "en" : "ko";
    await db.insert(faqs).values({
      translation_group_id: randomUUID(),
      locale,
      category: (fd.get("category") as FaqFormData["category"]) ?? "general",
      question: fd.get("question") as string,
      answer: fd.get("answer") as string,
      sort_order: Number(fd.get("sort_order") ?? 0),
      is_active: fd.get("is_active") === "true",
    });
    return { success: true };
  }

  if (intent === "update") {
    const id = Number(fd.get("id"));
    if (id) {
      await db.update(faqs).set({
        category: (fd.get("category") as FaqFormData["category"]) ?? "general",
        question: fd.get("question") as string,
        answer: fd.get("answer") as string,
        sort_order: Number(fd.get("sort_order") ?? 0),
        is_active: fd.get("is_active") === "true",
        updated_at: new Date(),
      }).where(eq(faqs.faq_id, id));
    }
    return { success: true };
  }

  if (intent === "delete") {
    const id = Number(fd.get("id"));
    if (id) {
      const [row] = await db.select().from(faqs).where(eq(faqs.faq_id, id)).limit(1);
      if (row) {
        await db.delete(faqs).where(eq(faqs.translation_group_id, row.translation_group_id));
      }
    }
    return { success: true };
  }

  if (intent === "toggle_active") {
    const id = Number(fd.get("id"));
    const current = fd.get("is_active") === "true";
    if (id) {
      const [row] = await db.select().from(faqs).where(eq(faqs.faq_id, id)).limit(1);
      if (row) {
        await db
          .update(faqs)
          .set({ is_active: !current })
          .where(eq(faqs.translation_group_id, row.translation_group_id));
      }
    }
    return { success: true };
  }

  return { success: false };
}

/* ── 카테고리 라벨 ── */
const CAT_LABEL: Record<string, string> = {
  product:  "제품문의",
  delivery: "주문/배송",
  b2b:      "B2B",
  quality:  "품질/안전",
  general:  "기타",
};

const CAT_STYLE: Record<string, string> = {
  product:  "bg-[#003F2B] text-white",
  delivery: "bg-[#EAE3C9] text-[#003F2B]",
  b2b:      "bg-[#ffd55d] text-gray-800",
  quality:  "bg-blue-50 text-blue-700",
  general:  "bg-gray-100 text-gray-600",
};

/* ── 더미 데이터 ── */
const MOCK_FAQS = [
  { faq_id: 2, category: "product",  question: "액란 제품은 어떻게 냉장보관 하나요?",       answer: "액란 제품은 반드시 냉장(0~10°C)에서 보관해야 합니다.", sort_order: 0, is_active: true, created_at: new Date("2026-02-01"), updated_at: new Date() },
  { faq_id: 1, category: "delivery", question: "풍림 제품의 유통기한은 얼마나 되나요?",     answer: "제품마다 유통기한이 다릅니다. 포장재 표기를 참고해 주세요.", sort_order: 1, is_active: true, created_at: new Date("2026-01-15"), updated_at: new Date() },
];

export default function AdminFaqsScreen({ loaderData }: Route.ComponentProps) {
  const { adminUser, dbFaqs } = loaderData;
  const fetcher = useFetcher();
  const [searchQuery, setSearchQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>();
  const [editingData, setEditingData] = useState<FaqFormData | undefined>();

  const sourceFaqs = (dbFaqs.length > 0 ? dbFaqs : MOCK_FAQS) as typeof MOCK_FAQS;

  const filtered = sourceFaqs.filter((f) =>
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleOpenEdit = (id: number) => {
    const f = sourceFaqs.find((x) => x.faq_id === id);
    if (!f) return;
    setEditingData({
      locale: (f as { locale?: string }).locale === "en" ? "en" : "ko",
      category: f.category as FaqFormData["category"],
      question: f.question,
      answer: f.answer,
      sort_order: f.sort_order,
      is_active: f.is_active,
    });
    setEditingId(id);
  };

  const submitFaq = (data: FaqFormData, intent: "create" | "update", id?: number) => {
    const fd = new FormData();
    fd.append("intent", intent);
    if (id) fd.append("id", String(id));
    if (intent === "create") fd.append("locale", data.locale);
    fd.append("category", data.category);
    fd.append("question", data.question);
    fd.append("answer", data.answer);
    fd.append("sort_order", String(data.sort_order));
    fd.append("is_active", String(data.is_active));
    fetcher.submit(fd, { method: "post" });
  };

  const handleDelete = (id: number) => {
    if (!confirm("FAQ를 삭제하시겠습니까?")) return;
    const fd = new FormData();
    fd.append("intent", "delete");
    fd.append("id", String(id));
    fetcher.submit(fd, { method: "post" });
  };

  const handleToggleActive = (id: number, current: boolean) => {
    const fd = new FormData();
    fd.append("intent", "toggle_active");
    fd.append("id", String(id));
    fd.append("is_active", String(current));
    fetcher.submit(fd, { method: "post" });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <AdminSidebar adminUser={adminUser} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
            {/* 헤더 */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">FAQ 관리</h1>
                <p className="mt-1 text-sm text-gray-500">전체 {filtered.length}건</p>
              </div>
              <Button
                onClick={() => setAddOpen(true)}
                className="flex shrink-0 items-center gap-2 bg-[#204E3A] text-white hover:bg-[#204E3A]/90"
              >
                <Plus className="h-4 w-4" />
                새 FAQ 등록
              </Button>
            </div>

            {/* 검색 */}
            <div className="mb-4 flex w-full max-w-xl items-center gap-2 lg:max-w-2xl">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="질문/답변 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* 테이블 */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-sm font-semibold text-gray-600">
                    <th className="px-5 py-3 text-center">순서</th>
                    <th className="px-5 py-3 text-left">카테고리</th>
                    <th className="px-5 py-3 text-left">질문</th>
                    <th className="px-5 py-3 text-left">답변 (요약)</th>
                    <th className="px-5 py-3 text-center">공개</th>
                    <th className="px-5 py-3 text-center">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-sm text-gray-400">
                        등록된 FAQ가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((faq, idx) => (
                      <tr
                        key={faq.faq_id}
                        className="border-b border-gray-50 text-sm transition-colors hover:bg-gray-50"
                        style={idx === filtered.length - 1 ? { borderBottom: "none" } : {}}
                      >
                        <td className="px-5 py-3 text-center text-gray-400">{faq.sort_order}</td>
                        <td className="px-5 py-3">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${CAT_STYLE[faq.category] ?? "bg-gray-100 text-gray-600"}`}
                          >
                            {CAT_LABEL[faq.category] ?? faq.category}
                          </span>
                        </td>
                        <td className="min-w-0 max-w-xl px-5 py-3">
                          <span className="line-clamp-2 font-medium text-gray-800">
                            {faq.question}
                          </span>
                        </td>
                        <td className="min-w-0 max-w-2xl px-5 py-3">
                          <span className="line-clamp-2 text-gray-500">{faq.answer}</span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <button
                            onClick={() => handleToggleActive(faq.faq_id, faq.is_active)}
                            className="transition-colors"
                            title={faq.is_active ? "비활성화" : "활성화"}
                          >
                            {faq.is_active ? (
                              <Eye className="h-4 w-4 text-[#02633E]" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-gray-300" />
                            )}
                          </button>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(faq.faq_id)}
                              className="h-7 w-7 p-0 text-gray-500 hover:text-blue-600"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(faq.faq_id)}
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
        </main>
      </div>

      {/* 추가 모달 */}
      <FaqAddModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={(data) => { submitFaq(data, "create"); setAddOpen(false); }}
      />

      {/* 수정 모달 */}
      {editingId !== undefined && (
        <FaqAddModal
          open={editingId !== undefined}
          onOpenChange={(o) => { if (!o) setEditingId(undefined); }}
          onSubmit={(data) => { submitFaq(data, "update", editingId); setEditingId(undefined); }}
          editId={editingId}
          initialData={editingData}
        />
      )}
    </div>
  );
}
