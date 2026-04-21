/**
 * Admin — 고객지원 자료실 (library_resources)
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFetcher } from "react-router";
import type { Route } from "./+types/support-resources";
import { requireAdminAuth } from "../utils/auth.server";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import { Textarea } from "~/core/components/ui/textarea";
import { Checkbox } from "~/core/components/ui/checkbox";
import { Badge } from "~/core/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/core/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/core/components/ui/select";
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  FolderOpen,
  Settings,
  Download,
  UploadCloud,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import db from "~/core/db/drizzle-client.server";
import { libraryResources } from "~/features/support/schema";
import { eq, desc } from "drizzle-orm";
import type { LibraryResource } from "~/features/support/lib/queries.server";
import {
  getLibraryDemoAdminRows,
  isLibraryDemoAdminRow,
} from "~/features/support/lib/library-resources-demo";
import { cn } from "~/core/lib/utils";

const RESOURCE_CATEGORIES = ["카탈로그", "회사소개", "인증서", "기타"] as const;

const PAGE_SIZE = 10;

const DOC_INPUT_ACCEPT =
  ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,application/pdf,application/zip,application/x-zip-compressed";

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extFromFileName(name: string): string {
  const e = name.split(".").pop()?.toUpperCase() ?? "FILE";
  return e.slice(0, 12);
}

function categoryBadgeClass(cat: string) {
  switch (cat) {
    case "카탈로그":
      return "border-blue-200 bg-blue-50 text-blue-800";
    case "회사소개":
      return "border-violet-200 bg-violet-50 text-violet-800";
    case "인증서":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    default:
      return "border-amber-200 bg-amber-50 text-amber-900";
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminAuth(request);
  const rows = await db
    .select()
    .from(libraryResources)
    .orderBy(desc(libraryResources.created_at))
    .catch(() => []);
  return { adminUser, rows };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdminAuth(request);
  const fd = await request.formData();
  const intent = fd.get("intent") as string;
  const readBool = (k: string) => fd.get(k) === "true";

  if (intent === "create") {
    await db.insert(libraryResources).values({
      category: fd.get("category") as string,
      title: fd.get("title") as string,
      content: (fd.get("content") as string) || "",
      author: (fd.get("author") as string) || "풍림푸드",
      file_name: fd.get("file_name") as string,
      file_url: fd.get("file_url") as string,
      file_size_label: (fd.get("file_size_label") as string) || null,
      file_ext: (fd.get("file_ext") as string) || "PDF",
      is_active: readBool("is_active"),
    });
    return { success: true as const };
  }

  if (intent === "update") {
    const id = Number(fd.get("id"));
    if (!id) return { success: false as const };
    await db
      .update(libraryResources)
      .set({
        category: fd.get("category") as string,
        title: fd.get("title") as string,
        content: (fd.get("content") as string) || "",
        author: (fd.get("author") as string) || "풍림푸드",
        file_name: fd.get("file_name") as string,
        file_url: fd.get("file_url") as string,
        file_size_label: (fd.get("file_size_label") as string) || null,
        file_ext: (fd.get("file_ext") as string) || "PDF",
        is_active: readBool("is_active"),
      })
      .where(eq(libraryResources.resource_id, id));
    return { success: true as const };
  }

  if (intent === "delete") {
    const id = Number(fd.get("id"));
    if (id) await db.delete(libraryResources).where(eq(libraryResources.resource_id, id));
    return { success: true as const };
  }

  return { success: false as const };
}

type FormState = {
  category: string;
  title: string;
  content: string;
  author: string;
  file_name: string;
  file_url: string;
  file_size_label: string;
  file_ext: string;
  is_active: boolean;
};

const emptyForm = (): FormState => ({
  category: "카탈로그",
  title: "",
  content: "",
  author: "풍림푸드",
  file_name: "",
  file_url: "",
  file_size_label: "",
  file_ext: "PDF",
  is_active: true,
});

function rowToForm(r: LibraryResource): FormState {
  return {
    category: r.category,
    title: r.title,
    content: r.content ?? "",
    author: r.author,
    file_name: r.file_name,
    file_url: r.file_url,
    file_size_label: r.file_size_label ?? "",
    file_ext: r.file_ext ?? "PDF",
    is_active: r.is_active !== false,
  };
}

function LibraryFileDropzone({
  fileUrl,
  fileName,
  onUploaded,
  disabled,
}: {
  fileUrl: string;
  fileName: string;
  onUploaded: (url: string, name: string, sizeLabel: string, ext: string) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "uploading" | "error">("idle");
  const [err, setErr] = useState("");
  const [drag, setDrag] = useState(false);

  const upload = useCallback(async (file: File) => {
    setState("uploading");
    setErr("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", "documents");
    fd.append("folder", "library-resources");
    try {
      const res = await fetch("/admin/api/upload", { method: "POST", body: fd });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? "업로드에 실패했습니다.");
      const url = json.url!;
      onUploaded(url, file.name, formatFileSize(file.size), extFromFileName(file.name));
      setState("idle");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "업로드 오류");
      setState("error");
    }
  }, [onUploaded]);

  const onPick = (files: FileList | null) => {
    const f = files?.[0];
    if (f) void upload(f);
  };

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 transition-colors",
          drag ? "border-[#02633E] bg-[#02633E]/5" : "border-gray-200 bg-gray-50",
          disabled || state === "uploading" ? "pointer-events-none opacity-60" : "hover:border-[#02633E]/50",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (!disabled) onPick(e.dataTransfer.files);
        }}
        onClick={() => {
          if (!disabled && state !== "uploading") inputRef.current?.click();
        }}
      >
        {state === "uploading" ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-[#02633E]" />
            <span className="text-sm text-gray-600">업로드 중...</span>
          </>
        ) : (
          <>
            <UploadCloud className="h-8 w-8 text-gray-400" />
            <p className="text-center text-sm font-medium text-gray-700">클릭하여 파일 업로드</p>
            <p className="text-center text-xs text-gray-500">또는 파일을 여기로 드래그하세요</p>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={DOC_INPUT_ACCEPT}
        disabled={disabled || state === "uploading"}
        onChange={(e) => onPick(e.target.files)}
      />
      {fileUrl && fileName ? (
        <p className="text-xs text-gray-600">
          선택된 파일: <span className="font-medium text-gray-900">{fileName}</span>
        </p>
      ) : null}
      {state === "error" && err ? <p className="text-xs text-red-500">{err}</p> : null}
    </div>
  );
}

export default function AdminSupportResourcesPage({ loaderData }: Route.ComponentProps) {
  const { adminUser, rows } = loaderData;
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LibraryResource | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const fetcher = useFetcher<typeof action>();

  useEffect(() => {
    if (!dialogOpen) return;
    setForm(editing ? rowToForm(editing) : emptyForm());
  }, [dialogOpen, editing]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, categoryFilter]);

  const prevFetcherState = useRef(fetcher.state);
  useEffect(() => {
    const prev = prevFetcherState.current;
    prevFetcherState.current = fetcher.state;
    if (prev !== "submitting" || fetcher.state !== "idle") return;
    if (!fetcher.data?.success || !dialogOpen) return;
    setDialogOpen(false);
    setEditing(null);
  }, [fetcher.state, fetcher.data, dialogOpen]);

  const baseRows = useMemo(
    () => (rows.length > 0 ? rows : getLibraryDemoAdminRows()),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return baseRows.filter((r) => {
      if (categoryFilter && r.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        (r.content ?? "").toLowerCase().includes(q) ||
        r.file_name.toLowerCase().includes(q)
      );
    });
  }, [baseRows, searchQuery, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (r: LibraryResource) => {
    if (isLibraryDemoAdminRow(r.resource_id)) {
      window.alert(
        "더미 데이터는 수정할 수 없습니다. 실제 자료를 한 건 이상 등록하면 더미 목록은 표시되지 않습니다.",
      );
      return;
    }
    setEditing(r);
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.file_url.trim() || !form.file_name.trim()) return;
    const fd = new FormData();
    fd.append("intent", editing ? "update" : "create");
    if (editing) fd.append("id", String(editing.resource_id));
    fd.append("category", form.category);
    fd.append("title", form.title);
    fd.append("content", form.content);
    fd.append("author", form.author);
    fd.append("file_name", form.file_name);
    fd.append("file_url", form.file_url);
    fd.append("file_size_label", form.file_size_label);
    fd.append("file_ext", form.file_ext);
    fd.append("is_active", form.is_active ? "true" : "false");
    fetcher.submit(fd, { method: "POST" });
  };

  const handleDelete = (id: number) => {
    if (isLibraryDemoAdminRow(id)) return;
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const fd = new FormData();
    fd.append("intent", "delete");
    fd.append("id", String(id));
    fetcher.submit(fd, { method: "POST" });
  };

  const onFileUploaded = (url: string, name: string, sizeLabel: string, ext: string) => {
    setForm((f) => ({
      ...f,
      file_url: url,
      file_name: name,
      file_size_label: sizeLabel,
      file_ext: ext,
    }));
  };

  return (
    <div className="flex h-screen bg-white">
      <AdminSidebar adminUser={adminUser} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminNavbar />
        <div className="flex-1 overflow-auto p-6 md:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">자료실 관리</h1>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-gray-600">
                카탈로그, 인증서, 회사소개 자료 등 고객지원 자료실에 노출되는 파일과 설명을 관리합니다.
              </p>
              {rows.length === 0 ? (
                <p className="mt-2 text-xs text-amber-800/90">
                  등록된 자료가 없을 때는 예시 더미 목록이 표시됩니다. 자료를 추가하면 더미는 사라지고 실제
                  데이터만 보입니다.
                </p>
              ) : null}
            </div>
            <Button
              type="button"
              onClick={openCreate}
              className="shrink-0 bg-[#02633E] hover:bg-[#014d30]"
            >
              <Plus className="mr-2 h-4 w-4" />
              자료 추가
            </Button>
          </div>

          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setCategoryFilter("")}
                className={cn(
                  "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                  categoryFilter === ""
                    ? "bg-[#02633E] text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                )}
              >
                전체
              </button>
              {RESOURCE_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategoryFilter(c)}
                  className={cn(
                    "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                    categoryFilter === c
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
                title="추가 설정 (준비 중)"
                disabled
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            <div className="relative min-w-0 w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                className="border-[#02633E]/25 pl-9"
                placeholder="검색어를 입력하세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center text-gray-500 shadow-sm">
              <FolderOpen className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p>등록된 자료가 없습니다.</p>
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px] table-fixed text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <th className="w-14 shrink-0 px-4 py-3 whitespace-nowrap">번호</th>
                        <th className="min-w-0 px-4 py-3">
                          <span className="block min-w-[280px]">제목</span>
                        </th>
                        <th className="w-[118px] shrink-0 px-4 py-3 whitespace-nowrap">카테고리</th>
                        <th className="w-28 shrink-0 px-4 py-3 whitespace-nowrap">등록일</th>
                        <th className="w-[4.5rem] shrink-0 px-4 py-3 whitespace-nowrap text-right">조회수</th>
                        <th className="w-14 shrink-0 px-4 py-3 text-center whitespace-nowrap">파일</th>
                        <th className="w-[5.5rem] shrink-0 px-4 py-3 text-center whitespace-nowrap">관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageRows.map((r, idx) => {
                        const no = (safePage - 1) * PAGE_SIZE + idx + 1;
                        const dateStr = r.created_at.toISOString().slice(0, 10);
                        const isDemo = isLibraryDemoAdminRow(r.resource_id);
                        return (
                          <tr
                            key={r.resource_id}
                            className="border-b border-gray-50 transition-colors hover:bg-gray-50/50"
                          >
                            <td className="px-4 py-3 text-gray-500 tabular-nums">{no}</td>
                            <td className="min-w-0 px-4 py-3">
                              <span className="block break-words font-medium text-gray-900">{r.title}</span>
                              {isDemo && (
                                <Badge variant="outline" className="ml-2 text-[10px] text-gray-500">
                                  더미
                                </Badge>
                              )}
                              {!r.is_active && (
                                <span className="ml-2 text-xs text-amber-600">(비노출)</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={cn(
                                  "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
                                  categoryBadgeClass(r.category),
                                )}
                              >
                                {r.category}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600 tabular-nums">{dateStr}</td>
                            <td className="px-4 py-3 text-right text-gray-600 tabular-nums">
                              {r.view_count.toLocaleString("ko-KR")}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {isDemo || r.file_url === "#" ? (
                                <span
                                  className="inline-flex rounded-lg border border-dashed border-gray-200 bg-gray-50 p-2 text-gray-300"
                                  title="더미 데이터"
                                >
                                  <Download className="h-4 w-4" />
                                </span>
                              ) : (
                                <a
                                  href={r.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex rounded-lg border border-gray-200 bg-white p-2 text-[#02633E] shadow-sm transition-colors hover:bg-[#FDFDF5]"
                                  title="다운로드"
                                >
                                  <Download className="h-4 w-4" />
                                </a>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-row items-center justify-center gap-1">
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  disabled={isDemo}
                                  className="rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:border-[#02633E]/45 hover:bg-[#FDFDF5] hover:shadow-md text-gray-500 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
                                  title={isDemo ? "더미 데이터는 수정할 수 없습니다" : "수정"}
                                  onClick={() => openEdit(r)}
                                >
                                  <Pencil className="h-4 w-4" strokeWidth={2} />
                                </Button>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  disabled={isDemo}
                                  className="rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:border-red-300 hover:bg-red-50/60 hover:shadow-md text-gray-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                                  title={isDemo ? "더미 데이터는 삭제할 수 없습니다" : "삭제"}
                                  onClick={() => handleDelete(r.resource_id)}
                                >
                                  <Trash2 className="h-4 w-4" strokeWidth={2} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {totalPages > 1 ? (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-[#02633E]/30"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    이전
                  </Button>
                  <div className="flex flex-wrap items-center justify-center gap-1 px-2">
                    {(() => {
                      const maxBtns = 7;
                      let start = 1;
                      let end = totalPages;
                      if (totalPages > maxBtns) {
                        start = Math.max(1, safePage - 3);
                        end = Math.min(totalPages, start + maxBtns - 1);
                        if (end - start < maxBtns - 1) start = Math.max(1, end - maxBtns + 1);
                      }
                      return Array.from({ length: end - start + 1 }, (_, i) => start + i).map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setPage(n)}
                          className={cn(
                            "flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors",
                            safePage === n
                              ? "bg-[#02633E] text-white shadow-sm"
                              : "text-gray-600 hover:bg-gray-100",
                          )}
                        >
                          {n}
                        </button>
                      ));
                    })()}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-[#02633E]/30"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    다음
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditing(null);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-[520px] gap-0 overflow-y-auto p-6 sm:max-w-[540px]">
          <DialogHeader className="space-y-1 pb-4 text-left">
            <DialogTitle className="text-xl font-bold text-gray-900">
              {editing ? "자료 수정" : "자료 추가"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-800">제목</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="자료 제목을 입력하세요"
                className="rounded-lg border-gray-200"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-800">카테고리</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger className="rounded-lg border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-800">내용</Label>
              <Textarea
                rows={4}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="자료에 대한 설명을 입력하세요"
                className="min-h-[100px] resize-y rounded-lg border-gray-200"
              />
            </div>

            <div className="space-y-2">
              <div>
                <Label className="text-sm font-medium text-gray-800">첨부파일</Label>
                <p className="mt-1 text-xs text-gray-500">
                  PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, ZIP 형식 · 최대 50MB
                </p>
              </div>
              <LibraryFileDropzone
                fileUrl={form.file_url}
                fileName={form.file_name}
                onUploaded={onFileUploaded}
                disabled={fetcher.state === "submitting"}
              />
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2">
              <Checkbox
                id="resource-active"
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v === true })}
              />
              <Label htmlFor="resource-active" className="cursor-pointer text-sm font-normal text-gray-800">
                사이트 자료실에 노출
              </Label>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-lg border-gray-300 text-base font-semibold sm:min-w-[120px]"
                onClick={() => {
                  setDialogOpen(false);
                  setEditing(null);
                }}
              >
                취소
              </Button>
              <Button
                type="submit"
                className="h-11 rounded-lg bg-[#02633E] text-base font-semibold hover:bg-[#014d30] sm:min-w-[120px]"
                disabled={fetcher.state === "submitting"}
              >
                {editing ? "저장" : "등록"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
