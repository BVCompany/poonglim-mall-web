/**
 * Admin News/Press Management Screen
 */

import { useState } from "react";
import { useFetcher } from "react-router";
import type { Route } from "./+types/media-news";
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "~/core/components/ui/select";
import { Plus, Search, Edit, Trash2, Newspaper } from "lucide-react";
import db from "~/core/db/drizzle-client.server";
import { news } from "~/features/media/schema";
import { eq, desc } from "drizzle-orm";

export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminAuth(request);
  const dbNews = await db.select().from(news).orderBy(desc(news.created_at)).catch(() => []);
  return { adminUser, dbNews };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdminAuth(request);
  const fd = await request.formData();
  const intent = fd.get("intent") as string;

  if (intent === "create") {
    await db.insert(news).values({
      type: (fd.get("type") as "news" | "press" | "announcement") ?? "news",
      title: fd.get("title") as string,
      content: fd.get("content") as string,
      summary: (fd.get("summary") as string) || null,
      thumbnail_url: (fd.get("thumbnail_url") as string) || null,
      source: (fd.get("source") as string) || null,
      published_at: (fd.get("published_at") as string) || null,
      is_active: true,
    });
    return { success: true };
  }

  if (intent === "delete") {
    const id = Number(fd.get("id"));
    if (id) await db.delete(news).where(eq(news.news_id, id));
    return { success: true };
  }

  if (intent === "toggle") {
    const id = Number(fd.get("id"));
    const isActive = fd.get("isActive") === "true";
    if (id) await db.update(news).set({ is_active: !isActive }).where(eq(news.news_id, id));
    return { success: true };
  }

  return { success: false };
}

const TYPE_LABEL: Record<string, string> = {
  news: "뉴스", press: "보도자료", announcement: "공지사항",
};
const TYPE_COLOR: Record<string, string> = {
  news: "bg-blue-100 text-blue-700",
  press: "bg-purple-100 text-purple-700",
  announcement: "bg-orange-100 text-orange-700",
};

export default function AdminMediaNewsPage({ loaderData }: Route.ComponentProps) {
  const { adminUser, dbNews } = loaderData;
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    type: "news" as "news" | "press" | "announcement",
    title: "",
    summary: "",
    content: "",
    thumbnail_url: "",
    source: "",
    published_at: "",
  });
  const fetcher = useFetcher();

  const filtered = dbNews.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("intent", "create");
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fetcher.submit(fd, { method: "POST" });
    setIsAddModalOpen(false);
    setForm({ type: "news", title: "", summary: "", content: "", thumbnail_url: "", source: "", published_at: "" });
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
              <h1 className="text-2xl font-bold text-gray-900">뉴스/보도자료 관리</h1>
              <p className="text-sm text-gray-500 mt-1">총 {dbNews.length}건</p>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)} className="bg-[#204E3A] hover:bg-[#1a3f2e]">
              <Plus className="w-4 h-4 mr-2" />
              새 뉴스 등록
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

          {/* List */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <Card className="p-12 text-center text-gray-500">
                <Newspaper className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p>등록된 뉴스/보도자료가 없습니다.</p>
              </Card>
            ) : (
              filtered.map((item) => (
                <Card key={item.news_id} className="p-4">
                  <div className="flex items-center gap-4">
                    {item.thumbnail_url && (
                      <img
                        src={item.thumbnail_url}
                        alt={item.title}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLOR[item.type]}`}>
                          {TYPE_LABEL[item.type]}
                        </span>
                        {!item.is_active && (
                          <Badge variant="secondary" className="text-xs">비활성</Badge>
                        )}
                      </div>
                      <p className="font-medium text-gray-900 truncate">{item.title}</p>
                      {item.summary && (
                        <p className="text-sm text-gray-500 truncate mt-0.5">{item.summary}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {item.published_at ?? item.created_at.toISOString().slice(0, 10)}
                        {item.source && ` · ${item.source}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggle(item.news_id, item.is_active)}
                        className="text-xs"
                      >
                        {item.is_active ? "비활성화" : "활성화"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(item.news_id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>새 뉴스/보도자료 등록</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>유형</Label>
              <Select value={form.type} onValueChange={(v: typeof form.type) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="news">뉴스</SelectItem>
                  <SelectItem value="press">보도자료</SelectItem>
                  <SelectItem value="announcement">공지사항</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>제목 *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>

            <div className="space-y-1.5">
              <Label>요약</Label>
              <Input value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="목록에 표시될 간단한 요약" />
            </div>

            <div className="space-y-1.5">
              <Label>내용 *</Label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={5} required />
            </div>

            <div className="space-y-1.5">
              <Label>썸네일 이미지</Label>
              <ImageUpload
                bucket="media"
                folder="news"
                value={form.thumbnail_url}
                onChange={(url) => setForm({ ...form, thumbnail_url: url })}
                aspectRatio="16/9"
                hint="JPG, PNG, WebP 최대 10MB"
              />
              <Input
                value={form.thumbnail_url}
                onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                placeholder="또는 이미지 URL 직접 입력"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>출처/매체</Label>
                <Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="매일경제, 연합뉴스 등" />
              </div>
              <div className="space-y-1.5">
                <Label>발행일</Label>
                <Input type="date" value={form.published_at} onChange={(e) => setForm({ ...form, published_at: e.target.value })} />
              </div>
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
