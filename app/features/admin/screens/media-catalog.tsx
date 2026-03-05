/**
 * Admin Catalog Management Screen
 */

import { useState } from "react";
import { useFetcher } from "react-router";
import type { Route } from "./+types/media-catalog";
import { requireAdminAuth } from "../utils/auth.server";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Badge } from "~/core/components/ui/badge";
import { Card } from "~/core/components/ui/card";
import { Label } from "~/core/components/ui/label";
import { Textarea } from "~/core/components/ui/textarea";
import { ImageUpload } from "~/core/components/image-upload";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "~/core/components/ui/dialog";
import { Plus, Search, Trash2, FileDown, BookOpen } from "lucide-react";
import db from "~/core/db/drizzle-client.server";
import { catalogs } from "~/features/media/schema";
import { eq, desc } from "drizzle-orm";

export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminAuth(request);
  const dbCatalogs = await db.select().from(catalogs).orderBy(desc(catalogs.created_at)).catch(() => []);
  return { adminUser, dbCatalogs };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdminAuth(request);
  const fd = await request.formData();
  const intent = fd.get("intent") as string;

  if (intent === "create") {
    await db.insert(catalogs).values({
      title: fd.get("title") as string,
      description: (fd.get("description") as string) || null,
      file_url: fd.get("file_url") as string,
      thumbnail_url: (fd.get("thumbnail_url") as string) || null,
      file_size: (fd.get("file_size") as string) || null,
      is_active: true,
    });
    return { success: true };
  }

  if (intent === "delete") {
    const id = Number(fd.get("id"));
    if (id) await db.delete(catalogs).where(eq(catalogs.catalog_id, id));
    return { success: true };
  }

  if (intent === "toggle") {
    const id = Number(fd.get("id"));
    const isActive = fd.get("isActive") === "true";
    if (id) await db.update(catalogs).set({ is_active: !isActive }).where(eq(catalogs.catalog_id, id));
    return { success: true };
  }

  return { success: false };
}

export default function AdminMediaCatalogPage({ loaderData }: Route.ComponentProps) {
  const { adminUser, dbCatalogs } = loaderData;
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    file_url: "",
    thumbnail_url: "",
    file_size: "",
  });
  const fetcher = useFetcher();

  const filtered = dbCatalogs.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.file_url) return;
    const fd = new FormData();
    fd.append("intent", "create");
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fetcher.submit(fd, { method: "POST" });
    setIsAddModalOpen(false);
    setForm({ title: "", description: "", file_url: "", thumbnail_url: "", file_size: "" });
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

      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminNavbar />

        <div className="flex-1 overflow-auto p-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">카탈로그 관리</h1>
              <p className="text-sm text-gray-500 mt-1">총 {dbCatalogs.length}건</p>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)} className="bg-[#204E3A] hover:bg-[#1a3f2e]">
              <Plus className="w-4 h-4 mr-2" />
              카탈로그 등록
            </Button>
          </div>

          {/* Search */}
          <div className="mb-5 relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="제목 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <Card className="p-12 text-center text-gray-500">
              <BookOpen className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p>등록된 카탈로그가 없습니다.</p>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((item) => (
                <Card key={item.catalog_id} className="overflow-hidden">
                  {/* Thumbnail */}
                  <div className="aspect-[3/4] bg-gray-100 relative">
                    {item.thumbnail_url ? (
                      <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    {!item.is_active && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Badge variant="secondary">비활성</Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">{item.title}</p>
                    {item.file_size && (
                      <p className="text-xs text-gray-400">{item.file_size}</p>
                    )}
                    <div className="flex gap-1.5 mt-3">
                      <a
                        href={item.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button size="sm" variant="outline" className="w-full text-xs">
                          <FileDown className="w-3 h-3 mr-1" />
                          다운로드
                        </Button>
                      </a>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggle(item.catalog_id, item.is_active)}
                        className="text-xs px-2"
                      >
                        {item.is_active ? "숨김" : "표시"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(item.catalog_id)}
                        className="text-red-600 hover:bg-red-50 px-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>카탈로그 등록</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>제목 *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>

            <div className="space-y-1.5">
              <Label>설명</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>

            <div className="space-y-1.5">
              <Label>PDF 파일 URL *</Label>
              <Input
                value={form.file_url}
                onChange={(e) => setForm({ ...form, file_url: e.target.value })}
                placeholder="https://..."
                required
              />
              <p className="text-xs text-gray-400">Supabase Storage에 업로드 후 URL을 입력하세요</p>
            </div>

            <div className="space-y-1.5">
              <Label>커버 이미지</Label>
              <ImageUpload
                bucket="documents"
                folder="catalog-covers"
                value={form.thumbnail_url}
                onChange={(url) => setForm({ ...form, thumbnail_url: url })}
                aspectRatio="3/4"
                hint="JPG, PNG, WebP 최대 10MB"
              />
              <Input
                value={form.thumbnail_url}
                onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                placeholder="또는 이미지 URL 직접 입력"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label>파일 크기</Label>
              <Input value={form.file_size} onChange={(e) => setForm({ ...form, file_size: e.target.value })} placeholder="예: 2.4MB" />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1 bg-[#204E3A] hover:bg-[#1a3f2e]">등록</Button>
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="flex-1">취소</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
