/**
 * Admin — 고객지원 자료실 (library_resources)
 */
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import type { Route } from "./+types/support-resources";
import { requireAdminAuth } from "../utils/auth.server";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import { Textarea } from "~/core/components/ui/textarea";
import { Badge } from "~/core/components/ui/badge";
import { Card } from "~/core/components/ui/card";
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
import { Plus, Search, Trash2, Pencil, FolderOpen } from "lucide-react";
import db from "~/core/db/drizzle-client.server";
import { libraryResources } from "~/features/support/schema";
import { eq, desc } from "drizzle-orm";
import type { LibraryResource } from "~/features/support/lib/queries.server";

const RESOURCE_CATEGORIES = ["카탈로그", "회사소개", "인증서", "기타"] as const;

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
      is_active: true,
    });
    return { success: true };
  }

  if (intent === "update") {
    const id = Number(fd.get("id"));
    if (!id) return { success: false };
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
      })
      .where(eq(libraryResources.resource_id, id));
    return { success: true };
  }

  if (intent === "delete") {
    const id = Number(fd.get("id"));
    if (id) await db.delete(libraryResources).where(eq(libraryResources.resource_id, id));
    return { success: true };
  }

  if (intent === "toggle") {
    const id = Number(fd.get("id"));
    const isActive = fd.get("isActive") === "true";
    if (id) {
      await db
        .update(libraryResources)
        .set({ is_active: !isActive })
        .where(eq(libraryResources.resource_id, id));
    }
    return { success: true };
  }

  return { success: false };
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
  };
}

export default function AdminSupportResourcesPage({ loaderData }: Route.ComponentProps) {
  const { adminUser, rows } = loaderData;
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LibraryResource | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const fetcher = useFetcher();

  useEffect(() => {
    if (!dialogOpen) return;
    setForm(editing ? rowToForm(editing) : emptyForm());
  }, [dialogOpen, editing]);

  const filtered = rows.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (r: LibraryResource) => {
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
    fetcher.submit(fd, { method: "POST" });
    setDialogOpen(false);
    setEditing(null);
  };

  const handleDelete = (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const fd = new FormData();
    fd.append("intent", "delete");
    fd.append("id", String(id));
    fetcher.submit(fd, { method: "POST" });
  };

  const handleToggle = (id: number, isActive: boolean) => {
    const fd = new FormData();
    fd.append("intent", "toggle");
    fd.append("id", String(id));
    fd.append("isActive", String(isActive));
    fetcher.submit(fd, { method: "POST" });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar adminUser={adminUser} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminNavbar />
        <div className="flex-1 overflow-auto p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">자료실 관리</h1>
              <p className="mt-1 text-sm text-gray-500">고객지원 자료실 파일·본문</p>
            </div>
            <Button onClick={openCreate} className="bg-[#204E3A] hover:bg-[#1a3f2e]">
              <Plus className="mr-2 h-4 w-4" />
              자료 등록
            </Button>
          </div>

          <div className="relative mb-5 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="제목·분류 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {filtered.length === 0 ? (
            <Card className="p-12 text-center text-gray-500">
              <FolderOpen className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p>등록된 자료가 없습니다.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((r) => (
                <Card key={r.resource_id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{r.category}</Badge>
                        {!r.is_active && <Badge variant="outline">비활성</Badge>}
                      </div>
                      <p className="font-medium text-gray-900">{r.title}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        조회 {r.view_count.toLocaleString("ko-KR")} ·{" "}
                        {r.created_at.toISOString().slice(0, 10)}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button size="sm" variant="outline" onClick={() => openEdit(r)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggle(r.resource_id, r.is_active)}
                      >
                        {r.is_active ? "숨김" : "표시"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(r.resource_id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
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
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "자료 수정" : "자료 등록"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="mt-2 space-y-3">
            <div className="space-y-1.5">
              <Label>분류</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger>
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
              <Label>제목 *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>본문</Label>
              <Textarea
                rows={4}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>글쓴이</Label>
              <Input
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>첨부 파일명 *</Label>
              <Input
                value={form.file_name}
                onChange={(e) => setForm({ ...form, file_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>파일 URL *</Label>
              <Input
                value={form.file_url}
                onChange={(e) => setForm({ ...form, file_url: e.target.value })}
                placeholder="https://..."
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label>용량 표시</Label>
                <Input
                  value={form.file_size_label}
                  onChange={(e) => setForm({ ...form, file_size_label: e.target.value })}
                  placeholder="312"
                />
              </div>
              <div className="space-y-1.5">
                <Label>확장자</Label>
                <Input
                  value={form.file_ext}
                  onChange={(e) => setForm({ ...form, file_ext: e.target.value })}
                  placeholder="PDF"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1 bg-[#204E3A] hover:bg-[#1a3f2e]">
                {editing ? "저장" : "등록"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setDialogOpen(false);
                  setEditing(null);
                }}
              >
                취소
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
