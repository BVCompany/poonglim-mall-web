/**
 * Admin Grade Certificates Management Screen
 * 등급판정서 관리 화면
 */
import { useEffect, useMemo, useState } from "react";
import { useFetcher } from "react-router";
import type { Route } from "./+types/grade-certificates";
import { requireAdminAuth } from "../utils/auth.server";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Plus, Search, Pencil, Trash2, Paperclip, Settings } from "lucide-react";
import db from "~/core/db/drizzle-client.server";
import { gradeCertificates, gradeCertCategories } from "~/features/support/schema";
import { count, eq, sql } from "drizzle-orm";
import { getAllGradeCerts, getGradeCertCategoriesOrdered } from "~/features/support/lib/queries.server";
import type { GradeCertificate } from "~/features/support/lib/queries.server";
import { GradeCertAddModal } from "../components/grade-cert-add-modal";
import type { GradeCertFormData } from "../components/grade-cert-add-modal";
import { GradeCertCategoryManageModal } from "../components/grade-cert-category-manage-modal";
import {
  ListSortSelect,
  sortByCreatedDesc,
  toTimestamp,
  type ListSortOrder,
} from "../components/list-sort-control";
import { newsCategoryBadgeClass } from "~/features/media/lib/news-category-badges";
import { cn } from "~/core/lib/utils";

const FALLBACK_GRADE_CERT_TYPES = ["액란", "포장란", "기타"] as const;
const PROTECTED_GRADE_CERT_CATEGORY = "기타";

export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminAuth(request);
  const [dbCerts, dbGradeCertCategories] = await Promise.all([
    getAllGradeCerts().catch(() => []),
    getGradeCertCategoriesOrdered(),
  ]);
  return { adminUser, dbCerts, dbGradeCertCategories };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdminAuth(request);
  const fd = await request.formData();
  const intent = fd.get("intent") as string;

  if (intent === "create") {
    await db.insert(gradeCertificates).values({
      tab: (fd.get("tab") as "current" | "archive") ?? "current",
      cert_type: (fd.get("cert_type") as string) || "포장란",
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
      await db
        .update(gradeCertificates)
        .set({
          tab: (fd.get("tab") as "current" | "archive") ?? "current",
          cert_type: (fd.get("cert_type") as string) || "포장란",
          title: fd.get("title") as string,
          content: (fd.get("content") as string) ?? "",
          author: (fd.get("author") as string) || "풍림푸드",
          file_url: (fd.get("file_url") as string) || null,
          file_name: (fd.get("file_name") as string) || null,
          updated_at: new Date(),
        })
        .where(eq(gradeCertificates.cert_id, id));
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
      await db
        .update(gradeCertificates)
        .set({ is_active: !current })
        .where(eq(gradeCertificates.cert_id, id));
    }
    return { success: true };
  }

  if (intent === "category_create") {
    const name = ((fd.get("name") as string) ?? "").trim();
    const color = ((fd.get("color") as string) ?? "").trim() || "sky";
    if (!name) return { success: false as const, error: "category_validation" as const };
    const [mx] = await db
      .select({ v: sql<number>`COALESCE(MAX(${gradeCertCategories.sort_order}), -1)` })
      .from(gradeCertCategories);
    const nextOrder = Number(mx?.v ?? -1) + 1;
    try {
      await db.insert(gradeCertCategories).values({ name, color, sort_order: nextOrder });
    } catch {
      return { success: false as const, error: "category_duplicate" as const };
    }
    return { success: true as const, intent: "category" as const };
  }

  if (intent === "category_update") {
    const id = Number(fd.get("id"));
    const newName = ((fd.get("name") as string) ?? "").trim();
    const color = ((fd.get("color") as string) ?? "").trim() || "sky";
    if (!id || !newName) return { success: false as const, error: "category_validation" as const };
    const [row] = await db
      .select()
      .from(gradeCertCategories)
      .where(eq(gradeCertCategories.category_id, id))
      .limit(1);
    if (!row) return { success: false as const, error: "category_not_found" as const };
    if (row.name === PROTECTED_GRADE_CERT_CATEGORY && newName !== PROTECTED_GRADE_CERT_CATEGORY) {
      return { success: false as const, error: "category_protected" as const };
    }
    if (newName !== row.name) {
      const [dup] = await db
        .select()
        .from(gradeCertCategories)
        .where(eq(gradeCertCategories.name, newName))
        .limit(1);
      if (dup && dup.category_id !== id) {
        return { success: false as const, error: "category_duplicate" as const };
      }
      await db.transaction(async (tx) => {
        await tx
          .update(gradeCertificates)
          .set({ cert_type: newName })
          .where(eq(gradeCertificates.cert_type, row.name));
        await tx
          .update(gradeCertCategories)
          .set({ name: newName, color, updated_at: new Date() })
          .where(eq(gradeCertCategories.category_id, id));
      });
    } else {
      await db
        .update(gradeCertCategories)
        .set({ color, updated_at: new Date() })
        .where(eq(gradeCertCategories.category_id, id));
    }
    return { success: true as const, intent: "category" as const };
  }

  if (intent === "category_delete") {
    const id = Number(fd.get("id"));
    if (!id) return { success: false as const, error: "category_validation" as const };
    const [row] = await db
      .select()
      .from(gradeCertCategories)
      .where(eq(gradeCertCategories.category_id, id))
      .limit(1);
    if (!row) return { success: false as const, error: "category_not_found" as const };
    if (row.name === PROTECTED_GRADE_CERT_CATEGORY) {
      return { success: false as const, error: "category_protected" as const };
    }
    const [{ n }] = await db
      .select({ n: count() })
      .from(gradeCertificates)
      .where(eq(gradeCertificates.cert_type, row.name));
    if (Number(n) > 0) return { success: false as const, error: "category_in_use" as const };
    await db.delete(gradeCertCategories).where(eq(gradeCertCategories.category_id, id));
    return { success: true as const, intent: "category" as const };
  }

  return { success: false };
}

const NEW_BADGE_DAYS = 7;

function isDemoCertRow(id: number) {
  return id < 0;
}

function isNewCert(createdAt: Date | string) {
  const created = new Date(createdAt).getTime();
  const cutoff = Date.now() - NEW_BADGE_DAYS * 24 * 60 * 60 * 1000;
  return created >= cutoff;
}

/* ── 더미 데이터 (DB 비어 있을 때만) ── */

type CertRow = GradeCertificate;

export default function AdminGradeCertsScreen({ loaderData }: Route.ComponentProps) {
  const { adminUser, dbCerts, dbGradeCertCategories } = loaderData;
  const fetcher = useFetcher<typeof action>();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<ListSortOrder>("newest");
  const [listTab, setListTab] = useState<"current" | "archive">("current");
  const [categoryChip, setCategoryChip] = useState<string>("");
  const [categoryManageOpen, setCategoryManageOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>();
  const [editingData, setEditingData] = useState<GradeCertFormData | undefined>();

  const sourceCerts = useMemo(
    () => dbCerts as CertRow[],
    [dbCerts],
  );

  const certTypeNamesFromRows = useMemo(() => {
    const set = new Set<string>();
    for (const c of sourceCerts) {
      if (c.cert_type?.trim()) set.add(c.cert_type.trim());
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ko"));
  }, [sourceCerts]);

  const categorySelectOptions = useMemo(() => {
    const ordered = dbGradeCertCategories.map((c) => c.name);
    const extra = certTypeNamesFromRows.filter((t) => !ordered.includes(t));
    if (ordered.length === 0) {
      const merged = new Set<string>([...FALLBACK_GRADE_CERT_TYPES]);
      for (const t of certTypeNamesFromRows) merged.add(t);
      return Array.from(merged);
    }
    return [...ordered, ...extra.sort((a, b) => a.localeCompare(b, "ko"))];
  }, [dbGradeCertCategories, certTypeNamesFromRows]);

  const categoryColorByName = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of dbGradeCertCategories) m.set(c.name, c.color || "slate");
    return m;
  }, [dbGradeCertCategories]);

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) return;
    const d = fetcher.data;
    if ("error" in d && d.error === "category_protected") {
      window.alert(`「${PROTECTED_GRADE_CERT_CATEGORY}」 카테고리는 삭제하거나 이름을 바꿀 수 없습니다.`);
      return;
    }
    if ("error" in d && d.error === "category_in_use") {
      window.alert("이 카테고리를 사용 중인 등급판정서가 있어 삭제할 수 없습니다. 먼저 해당 문서의 카테고리를 변경하세요.");
      return;
    }
    if ("error" in d && d.error === "category_duplicate") {
      window.alert("이미 같은 이름의 카테고리가 있습니다.");
      return;
    }
    if ("error" in d && d.error === "category_validation") {
      window.alert("카테고리 이름을 입력해 주세요.");
      return;
    }
    if ("error" in d && d.error === "category_not_found") {
      window.alert("카테고리를 찾을 수 없습니다.");
      return;
    }
    if ("success" in d && d.success && "intent" in d && d.intent === "category") {
      setCategoryManageOpen(false);
    }
  }, [fetcher.state, fetcher.data]);

  const submitCategoryAction = (intent: string, fields: Record<string, string>) => {
    const fd = new FormData();
    fd.append("intent", intent);
    for (const [k, v] of Object.entries(fields)) fd.append(k, v);
    fetcher.submit(fd, { method: "POST" });
  };

  const stats = useMemo(() => {
    const total = sourceCerts.length;
    const archive = sourceCerts.filter((c) => c.tab === "archive").length;
    const liquid = sourceCerts.filter((c) => c.cert_type === "액란").length;
    const shell = sourceCerts.filter((c) => c.cert_type === "포장란").length;
    return { total, archive, liquid, shell };
  }, [sourceCerts]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const rows = sourceCerts.filter((c) => {
      if (c.tab !== listTab) return false;
      if (categoryChip && c.cert_type !== categoryChip) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        (c.content ?? "").toLowerCase().includes(q) ||
        (c.file_name ?? "").toLowerCase().includes(q)
      );
    });
    return sortByCreatedDesc(
      rows,
      sortOrder,
      (c) => c.cert_id,
      (c) => toTimestamp(c.created_at),
      (c) => c.cert_id,
    );
  }, [sourceCerts, listTab, categoryChip, searchQuery, sortOrder]);

  const formatDate = (d: Date | string) => {
    const date = new Date(d);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const handleOpenEdit = (id: number) => {
    if (isDemoCertRow(id)) {
      window.alert(
        "예시 더미 데이터는 수정할 수 없습니다. 실제 데이터를 등록하면 더미 목록은 표시되지 않습니다.",
      );
      return;
    }
    const c = sourceCerts.find((x) => x.cert_id === id);
    if (!c) return;
    setEditingData({
      tab: c.tab as "current" | "archive",
      cert_type: c.cert_type,
      title: c.title,
      content: c.content ?? "",
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
    if (isDemoCertRow(id)) {
      window.alert("예시 더미 데이터는 삭제할 수 없습니다.");
      return;
    }
    if (!confirm("등급판정서를 삭제하시겠습니까?")) return;
    const fd = new FormData();
    fd.append("intent", "delete");
    fd.append("id", String(id));
    fetcher.submit(fd, { method: "post" });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar adminUser={adminUser} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">등급판정서 관리</h1>
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-gray-600">
                  계란 등급판정 결과를 관리합니다
                </p>
                {dbCerts.length === 0 ? (
                  <p className="mt-2 text-xs text-amber-800/90">
                    등록된 데이터가 없을 때는 예시 더미 목록이 표시됩니다. 항목을 추가하면 실제 데이터만
                    보입니다.
                  </p>
                ) : null}
              </div>
              <Button
                onClick={() => setAddOpen(true)}
                className="shrink-0 bg-[#02633E] text-white hover:bg-[#014d30]"
              >
                <Plus className="mr-2 h-4 w-4" />
                등급판정서 추가
              </Button>
            </div>

            {/* 통계 카드 */}
            <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { label: "전체 등급판정서", value: stats.total },
                { label: "이전 자료", value: stats.archive },
                { label: "액란", value: stats.liquid },
                { label: "포장란", value: stats.shell },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
                >
                  <p className="text-xs font-medium text-gray-500">{card.label}</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900">{card.value}</p>
                </div>
              ))}
            </div>

            {/* 메인 탭 */}
            <div className="mb-4 flex rounded-xl border border-gray-200 bg-gray-100/90 p-1">
              <button
                type="button"
                onClick={() => setListTab("current")}
                className={cn(
                  "flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors",
                  listTab === "current"
                    ? "bg-[#02633E] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900",
                )}
              >
                등급판정서
              </button>
              <button
                type="button"
                onClick={() => setListTab("archive")}
                className={cn(
                  "flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors",
                  listTab === "archive"
                    ? "bg-[#02633E] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900",
                )}
              >
                등급판정서 (2022.11 이전)
              </button>
            </div>

            {/* 필터 + 검색 */}
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryChip("")}
                  className={cn(
                    "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                    categoryChip === ""
                      ? "bg-[#02633E] text-white shadow-sm"
                      : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                  )}
                >
                  전체보기
                </button>
                {categorySelectOptions.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategoryChip(c)}
                    className={cn(
                      "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                      categoryChip === c
                        ? "bg-[#02633E] text-white shadow-sm"
                        : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                    )}
                  >
                    {c}
                  </button>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0 border-[#02633E]/30 text-[#02633E]"
                  title="카테고리 관리"
                  onClick={() => setCategoryManageOpen(true)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex w-full items-center gap-2 lg:max-w-md">
                <div className="relative min-w-0 flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    className="border-[#02633E]/25 pl-9"
                    placeholder="검색어를 입력해주세요"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <ListSortSelect value={sortOrder} onChange={setSortOrder} />
              </div>
            </div>

            {/* 테이블 */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[960px] table-fixed text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/90 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="w-14 px-4 py-3">번호</th>
                      <th className="px-4 py-3" style={{ width: "44%" }}>
                        제목
                      </th>
                      <th className="w-[100px] px-4 py-3">카테고리</th>
                      <th className="w-[112px] px-4 py-3">등록일</th>
                      <th className="w-20 px-4 py-3 text-center">조회수</th>
                      <th className="w-16 px-4 py-3 text-center">파일</th>
                      <th className="w-[100px] px-4 py-3 text-center">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-14 text-center text-sm text-gray-500">
                          등록된 등급판정서가 없습니다.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((cert, idx) => {
                        const rowNo = filtered.length - idx;
                        const fileCount = cert.file_name || cert.file_url ? 1 : 0;
                        return (
                          <tr
                            key={cert.cert_id}
                            className="border-b border-gray-100 text-gray-800 last:border-b-0 hover:bg-gray-50/80"
                          >
                            <td className="px-4 py-3.5 tabular-nums text-gray-500">{rowNo}</td>
                            <td className="px-4 py-3.5">
                              <div className="flex min-w-0 items-center gap-2">
                                <span className="min-w-0 flex-1 truncate font-medium text-gray-900">
                                  {cert.title}
                                </span>
                                {isNewCert(cert.created_at) ? (
                                  <span className="shrink-0 rounded bg-[#02633E] px-1 py-0.5 text-[10px] font-bold leading-none text-white">
                                    N
                                  </span>
                                ) : null}
                                {fileCount > 0 ? (
                                  <Paperclip
                                    className="h-3.5 w-3.5 shrink-0 text-gray-400"
                                    aria-hidden
                                  />
                                ) : null}
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className={cn(
                                  "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
                                  newsCategoryBadgeClass(categoryColorByName.get(cert.cert_type) ?? "slate"),
                                )}
                              >
                                {cert.cert_type}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 tabular-nums text-gray-600">
                              {formatDate(cert.created_at)}
                            </td>
                            <td className="px-4 py-3.5 text-center tabular-nums text-gray-600">
                              {cert.view_count}
                            </td>
                            <td className="px-4 py-3.5 text-center tabular-nums text-gray-600">
                              {fileCount}
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center justify-center gap-1.5">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 border-gray-200 text-gray-600 shadow-sm hover:bg-white hover:text-[#02633E]"
                                  onClick={() => handleOpenEdit(cert.cert_id)}
                                  title="수정"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 border-gray-200 text-gray-600 shadow-sm hover:bg-white hover:text-red-600"
                                  onClick={() => handleDelete(cert.cert_id)}
                                  title="삭제"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
        </main>
      </div>

      <GradeCertAddModal
        open={addOpen}
        onOpenChange={setAddOpen}
        listTabForCreate={listTab}
        certTypeOptions={categorySelectOptions}
        onSubmit={(data) => {
          submitCert({ ...data, tab: listTab }, "create");
          setAddOpen(false);
        }}
      />

      {editingId !== undefined && (
        <GradeCertAddModal
          open={editingId !== undefined}
          onOpenChange={(o) => {
            if (!o) setEditingId(undefined);
          }}
          certTypeOptions={categorySelectOptions}
          onSubmit={(data) => {
            submitCert(data, "update", editingId);
            setEditingId(undefined);
          }}
          editId={editingId}
          initialData={editingData}
        />
      )}

      <GradeCertCategoryManageModal
        open={categoryManageOpen}
        onOpenChange={setCategoryManageOpen}
        categories={dbGradeCertCategories}
        onSubmitCategory={submitCategoryAction}
      />
    </div>
  );
}
