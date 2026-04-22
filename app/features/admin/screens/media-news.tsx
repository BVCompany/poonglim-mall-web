/**
 * Admin News/Press Management Screen
 */

import { randomUUID } from "node:crypto";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFetcher } from "react-router";
import type { Route } from "./+types/media-news";
import { requireAdminAuth } from "../utils/auth.server";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Badge } from "~/core/components/ui/badge";
import { Label } from "~/core/components/ui/label";
import { Textarea } from "~/core/components/ui/textarea";
import { Checkbox } from "~/core/components/ui/checkbox";
import { Switch } from "~/core/components/ui/switch";
import { DatePicker } from "~/core/components/ui/date-picker";
import { ImageUpload } from "~/core/components/image-upload";
import { MultiImageUpload } from "~/core/components/multi-image-upload";
import { MediaThumbFallback } from "~/core/components/media-thumb-fallback";
import { parseNewsBodyImageUrls } from "~/features/media/lib/body-image-urls";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/core/components/ui/dialog";
import {
  Plus,
  Search,
  Trash2,
  Newspaper,
  ExternalLink,
  Pencil,
  Star,
  Settings,
} from "lucide-react";
import db from "~/core/db/drizzle-client.server";
import { news, newsCategories } from "~/features/media/schema";
import { and, asc, count, desc, eq, ne, sql } from "drizzle-orm";
import { cn } from "~/core/lib/utils";
import { NewsCategoryManageModal } from "../components/news-category-manage-modal";
import { newsCategoryBadgeClass } from "~/features/media/lib/news-category-badges";

const MAX_FEATURED = 6;
const PROTECTED_NEWS_CATEGORY = "보도자료";

function readBodyImageUrlsFromForm(fd: FormData): string | null {
  const raw = fd.get("body_image_urls") as string;
  try {
    const arr = JSON.parse(raw || "[]") as unknown;
    if (!Array.isArray(arr) || !arr.every((x) => typeof x === "string")) return null;
    const cleaned = arr.map((s) => s.trim()).filter(Boolean);
    return cleaned.length > 0 ? JSON.stringify(cleaned) : null;
  } catch {
    return null;
  }
}

async function countFeaturedExcluding(excludeId?: number): Promise<number> {
  const where =
    excludeId != null
      ? and(eq(news.is_featured, true), ne(news.news_id, excludeId))
      : eq(news.is_featured, true);
  const [row] = await db.select({ n: count() }).from(news).where(where);
  return Number(row?.n ?? 0);
}

export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminAuth(request);
  const [dbNews, dbNewsCategories] = await Promise.all([
    db.select().from(news).orderBy(desc(news.created_at)).catch(() => []),
    db.select().from(newsCategories).orderBy(asc(newsCategories.sort_order)).catch(() => []),
  ]);
  return { adminUser, dbNews, dbNewsCategories };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdminAuth(request);
  const fd = await request.formData();
  const intent = fd.get("intent") as string;

  const readBool = (key: string) => fd.get(key) === "true";

  if (intent === "create") {
    const wantsFeatured = readBool("is_featured");
    const title = ((fd.get("title") as string) ?? "").trim();
    const summary = ((fd.get("summary") as string) ?? "").trim();
    const content = ((fd.get("content") as string) ?? "").trim();
    const published_at = ((fd.get("published_at") as string) ?? "").trim();
    const body_image_urls = readBodyImageUrlsFromForm(fd);

    if (!title || !summary || !published_at) {
      return { success: false as const, error: "validation" as const, intent: "create" as const };
    }
    if (!content && !body_image_urls) {
      return { success: false as const, error: "need_body" as const, intent: "create" as const };
    }

    if (wantsFeatured && (await countFeaturedExcluding()) >= MAX_FEATURED) {
      return { success: false as const, error: "max_featured" as const, intent: "create" as const };
    }
    const localeRaw = ((fd.get("locale") as string) || "ko").toLowerCase();
    const locale = localeRaw === "en" ? "en" : "ko";
    if (locale === "en" && wantsFeatured) {
      return { success: false as const, error: "featured_ko_only" as const, intent: "create" as const };
    }
    const groupFromForm = (fd.get("translation_group_id") as string)?.trim();
    const translation_group_id =
      groupFromForm && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(groupFromForm)
        ? groupFromForm
        : randomUUID();
    await db.insert(news).values({
      translation_group_id,
      locale,
      type: (fd.get("type") as string) || "보도자료",
      title,
      content: content || "",
      summary,
      thumbnail_url: (fd.get("thumbnail_url") as string) || null,
      source: (fd.get("source") as string) || null,
      source_url: (fd.get("source_url") as string) || null,
      published_at: published_at || null,
      body_image_urls,
      is_active: readBool("is_active"),
      is_featured: wantsFeatured,
    });
    return { success: true as const, intent: "create" as const };
  }

  if (intent === "create_translation") {
    const baseId = Number(fd.get("base_id"));
    const targetLocale = ((fd.get("target_locale") as string) || "en").toLowerCase() === "en" ? "en" : "ko";
    if (!baseId) return { success: false as const };
    const [base] = await db.select().from(news).where(eq(news.news_id, baseId)).limit(1);
    if (!base) return { success: false as const };
    const [exists] = await db
      .select({ id: news.news_id })
      .from(news)
      .where(and(eq(news.translation_group_id, base.translation_group_id), eq(news.locale, targetLocale)))
      .limit(1);
    if (exists) return { success: false as const, error: "translation_exists" as const };
    await db.insert(news).values({
      translation_group_id: base.translation_group_id,
      locale: targetLocale,
      type: base.type,
      title: "",
      content: "",
      summary: "",
      thumbnail_url: base.thumbnail_url,
      source: base.source,
      source_url: base.source_url,
      published_at: base.published_at,
      body_image_urls: base.body_image_urls,
      is_active: base.is_active,
      is_featured: false,
    });
    return { success: true as const, intent: "create_translation" as const };
  }

  if (intent === "delete") {
    const id = Number(fd.get("id"));
    if (id) {
      const [row] = await db.select().from(news).where(eq(news.news_id, id)).limit(1);
      if (row) {
        await db.delete(news).where(eq(news.translation_group_id, row.translation_group_id));
      }
    }
    return { success: true as const };
  }

  if (intent === "update") {
    const id = Number(fd.get("id"));
    if (id) {
      const wantsFeatured = readBool("is_featured");
      const title = ((fd.get("title") as string) ?? "").trim();
      const summary = ((fd.get("summary") as string) ?? "").trim();
      const content = ((fd.get("content") as string) ?? "").trim();
      const published_at = ((fd.get("published_at") as string) ?? "").trim();
      const body_image_urls = readBodyImageUrlsFromForm(fd);

      if (!title || !summary || !published_at) {
        return { success: false as const, error: "validation" as const, intent: "update" as const };
      }
      if (!content && !body_image_urls) {
        return { success: false as const, error: "need_body" as const, intent: "update" as const };
      }

      const [editing] = await db.select().from(news).where(eq(news.news_id, id)).limit(1);
      const wasFeatured = editing?.is_featured === true;
      if (wantsFeatured && !wasFeatured && (await countFeaturedExcluding(id)) >= MAX_FEATURED) {
        return { success: false as const, error: "max_featured" as const, intent: "update" as const };
      }
      if (editing?.locale === "en" && wantsFeatured) {
        return { success: false as const, error: "featured_ko_only" as const, intent: "update" as const };
      }
      await db
        .update(news)
        .set({
          type: (fd.get("type") as string) || "보도자료",
          title,
          content: content || "",
          summary,
          thumbnail_url: (fd.get("thumbnail_url") as string) || null,
          source: (fd.get("source") as string) || null,
          source_url: (fd.get("source_url") as string) || null,
          published_at: published_at || null,
          body_image_urls,
          is_active: readBool("is_active"),
          is_featured: wantsFeatured,
        })
        .where(eq(news.news_id, id));
      if (editing) {
        await db
          .update(news)
          .set({ is_active: readBool("is_active") })
          .where(eq(news.translation_group_id, editing.translation_group_id));
      }
    }
    return { success: true as const, intent: "update" as const };
  }

  if (intent === "toggle_featured") {
    const id = Number(fd.get("id"));
    const currently = fd.get("isFeatured") === "true";
    if (!id) return { success: false as const };

    const [row] = await db.select().from(news).where(eq(news.news_id, id)).limit(1);
    if (row?.locale === "en") return { success: false as const, error: "featured_ko_only" as const };

    if (!currently && (await countFeaturedExcluding(id)) >= MAX_FEATURED) {
      return { success: false as const, error: "max_featured" as const };
    }
    await db.update(news).set({ is_featured: !currently }).where(eq(news.news_id, id));
    return { success: true as const };
  }

  if (intent === "category_create") {
    const name = ((fd.get("name") as string) ?? "").trim();
    const color = ((fd.get("color") as string) ?? "").trim() || "sky";
    if (!name) return { success: false as const, error: "category_validation" as const };
    const [mx] = await db
      .select({ v: sql<number>`COALESCE(MAX(${newsCategories.sort_order}), -1)` })
      .from(newsCategories);
    const nextOrder = Number(mx?.v ?? -1) + 1;
    try {
      await db.insert(newsCategories).values({ name, color, sort_order: nextOrder });
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
      .from(newsCategories)
      .where(eq(newsCategories.category_id, id))
      .limit(1);
    if (!row) return { success: false as const, error: "category_not_found" as const };
    if (row.name === PROTECTED_NEWS_CATEGORY && newName !== PROTECTED_NEWS_CATEGORY) {
      return { success: false as const, error: "category_protected" as const };
    }
    if (newName !== row.name) {
      const [dup] = await db
        .select()
        .from(newsCategories)
        .where(eq(newsCategories.name, newName))
        .limit(1);
      if (dup && dup.category_id !== id) {
        return { success: false as const, error: "category_duplicate" as const };
      }
      await db.transaction(async (tx) => {
        await tx.update(news).set({ type: newName }).where(eq(news.type, row.name));
        await tx
          .update(newsCategories)
          .set({ name: newName, color, updated_at: new Date() })
          .where(eq(newsCategories.category_id, id));
      });
    } else {
      await db
        .update(newsCategories)
        .set({ color, updated_at: new Date() })
        .where(eq(newsCategories.category_id, id));
    }
    return { success: true as const, intent: "category" as const };
  }

  if (intent === "category_delete") {
    const id = Number(fd.get("id"));
    if (!id) return { success: false as const, error: "category_validation" as const };
    const [row] = await db
      .select()
      .from(newsCategories)
      .where(eq(newsCategories.category_id, id))
      .limit(1);
    if (!row) return { success: false as const, error: "category_not_found" as const };
    if (row.name === PROTECTED_NEWS_CATEGORY) {
      return { success: false as const, error: "category_protected" as const };
    }
    const [{ n }] = await db.select({ n: count() }).from(news).where(eq(news.type, row.name));
    if (Number(n) > 0) return { success: false as const, error: "category_in_use" as const };
    await db.delete(newsCategories).where(eq(newsCategories.category_id, id));
    return { success: true as const, intent: "category" as const };
  }

  return { success: false as const };
}

export default function AdminMediaNewsPage({ loaderData }: Route.ComponentProps) {
  const { adminUser, dbNews, dbNewsCategories } = loaderData;
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [categoryManageOpen, setCategoryManageOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    locale: "ko" as "ko" | "en",
    type: "보도자료",
    title: "",
    summary: "",
    content: "",
    thumbnail_url: "",
    body_image_urls: [] as string[],
    source: "",
    source_url: "",
    published_at: "",
    is_featured: false,
    is_active: true,
  });
  const fetcher = useFetcher<typeof action>();

  const typeOptions = useMemo(() => {
    const set = new Set<string>();
    for (const n of dbNews) {
      if (n.type?.trim()) set.add(n.type.trim());
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ko"));
  }, [dbNews]);

  const categoryColorByName = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of dbNewsCategories) m.set(c.name, c.color || "slate");
    return m;
  }, [dbNewsCategories]);

  const categorySelectOptions = useMemo(() => {
    const ordered = dbNewsCategories.map((c) => c.name);
    const extra = typeOptions.filter((t) => !ordered.includes(t));
    if (ordered.length === 0) {
      const base = ["보도자료", "뉴스", "공지"];
      const merged = new Set(base);
      for (const t of typeOptions) merged.add(t);
      return Array.from(merged);
    }
    return [...ordered, ...extra.sort((a, b) => a.localeCompare(b, "ko"))];
  }, [dbNewsCategories, typeOptions]);

  const featuredCount = useMemo(() => dbNews.filter((n) => n.is_featured).length, [dbNews]);

  const toInputDate = (value: string | Date | null | undefined) => {
    if (!value) return "";
    if (typeof value === "string") return value.slice(0, 10);
    return value.toISOString().slice(0, 10);
  };

  const q = searchQuery.trim().toLowerCase();
  const filtered = dbNews.filter((n) => {
    if (categoryFilter && n.type !== categoryFilter) return false;
    if (!q) return true;
    const inTitle = n.title.toLowerCase().includes(q);
    const inSummary = (n.summary ?? "").toLowerCase().includes(q);
    const inContent = (n.content ?? "").toLowerCase().includes(q);
    return inTitle || inSummary || inContent;
  });

  const resetForm = useCallback(
    () =>
      setForm({
        locale: "ko",
        type: "보도자료",
        title: "",
        summary: "",
        content: "",
        thumbnail_url: "",
        body_image_urls: [],
        source: "",
        source_url: "",
        published_at: new Date().toISOString().slice(0, 10),
        is_featured: false,
        is_active: true,
      }),
    [],
  );

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) return;
    if ("error" in fetcher.data && fetcher.data.error === "max_featured") {
      window.alert(`주요 보도는 최대 ${MAX_FEATURED}건까지 지정할 수 있습니다.`);
      return;
    }
    if ("error" in fetcher.data && fetcher.data.error === "validation") {
      window.alert("필수 항목(제목, 카테고리, 작성일, 요약)을 입력해 주세요.");
      return;
    }
    if ("error" in fetcher.data && fetcher.data.error === "need_body") {
      window.alert("본문 내용 또는 본문 이미지를 최소 하나 등록해 주세요.");
      return;
    }
    if ("error" in fetcher.data && fetcher.data.error === "featured_ko_only") {
      window.alert("주요 보도는 한국어(ko) 글에서만 지정할 수 있습니다.");
      return;
    }
    if ("error" in fetcher.data && fetcher.data.error === "translation_exists") {
      window.alert("이미 해당 언어 버전이 있습니다.");
      return;
    }
    if ("error" in fetcher.data && fetcher.data.error === "category_protected") {
      window.alert(`「${PROTECTED_NEWS_CATEGORY}」 카테고리는 삭제하거나 이름을 바꿀 수 없습니다.`);
      return;
    }
    if ("error" in fetcher.data && fetcher.data.error === "category_in_use") {
      window.alert("이 카테고리를 사용 중인 보도자료가 있어 삭제할 수 없습니다. 먼저 해당 글의 카테고리를 변경하세요.");
      return;
    }
    if ("error" in fetcher.data && fetcher.data.error === "category_duplicate") {
      window.alert("이미 같은 이름의 카테고리가 있습니다.");
      return;
    }
    if ("error" in fetcher.data && fetcher.data.error === "category_validation") {
      window.alert("카테고리 이름을 입력해 주세요.");
      return;
    }
    if ("success" in fetcher.data && fetcher.data.success && "intent" in fetcher.data) {
      if (fetcher.data.intent === "create_translation") {
        window.alert("영문 초안이 추가되었습니다. 목록에서 해당 글을 열어 내용을 입력해 주세요.");
      }
      if (fetcher.data.intent === "create") {
        setIsAddModalOpen(false);
        resetForm();
      }
      if (fetcher.data.intent === "update") {
        setIsEditModalOpen(false);
        setEditingId(null);
        resetForm();
      }
      if (fetcher.data.intent === "category") {
        setCategoryManageOpen(false);
      }
    }
  }, [fetcher.state, fetcher.data, resetForm]);

  const submitCategoryAction = (intent: string, fields: Record<string, string>) => {
    const fd = new FormData();
    fd.append("intent", intent);
    for (const [k, v] of Object.entries(fields)) fd.append(k, v);
    fetcher.submit(fd, { method: "POST" });
  };

  const appendFormFields = (fd: FormData) => {
    fd.append("locale", form.locale);
    fd.append("type", form.type);
    fd.append("title", form.title);
    fd.append("summary", form.summary);
    fd.append("content", form.content);
    fd.append("thumbnail_url", form.thumbnail_url);
    fd.append("source", form.source);
    fd.append("source_url", form.source_url);
    fd.append("published_at", form.published_at);
    fd.append("body_image_urls", JSON.stringify(form.body_image_urls.filter(Boolean)));
    fd.append("is_featured", form.is_featured ? "true" : "false");
    fd.append("is_active", form.is_active ? "true" : "false");
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("intent", "create");
    appendFormFields(fd);
    fetcher.submit(fd, { method: "POST" });
  };

  const handleDelete = (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const fd = new FormData();
    fd.append("intent", "delete");
    fd.append("id", String(id));
    fetcher.submit(fd, { method: "POST" });
  };

  const handleAddTranslation = (baseId: number, targetLocale: "ko" | "en") => {
    const fd = new FormData();
    fd.append("intent", "create_translation");
    fd.append("base_id", String(baseId));
    fd.append("target_locale", targetLocale);
    fetcher.submit(fd, { method: "POST" });
  };

  const handleOpenEdit = (item: (typeof dbNews)[number]) => {
    setEditingId(item.news_id);
    setForm({
      locale: (item.locale === "en" ? "en" : "ko") as "ko" | "en",
      type: item.type || "보도자료",
      title: item.title || "",
      summary: item.summary || "",
      content: item.content || "",
      thumbnail_url: item.thumbnail_url || "",
      body_image_urls: parseNewsBodyImageUrls(item.body_image_urls),
      source: item.source || "",
      source_url: item.source_url || "",
      published_at: toInputDate(item.published_at) || new Date().toISOString().slice(0, 10),
      is_featured: item.is_featured === true,
      is_active: item.is_active !== false,
    });
    setIsEditModalOpen(true);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    const fd = new FormData();
    fd.append("intent", "update");
    fd.append("id", String(editingId));
    appendFormFields(fd);
    fetcher.submit(fd, { method: "POST" });
  };

  const handleToggleFeatured = (id: number, isFeatured: boolean) => {
    const fd = new FormData();
    fd.append("intent", "toggle_featured");
    fd.append("id", String(id));
    fd.append("isFeatured", String(isFeatured));
    fetcher.submit(fd, { method: "POST" });
  };

  return (
    <div className="flex h-screen bg-white">
      <AdminSidebar adminUser={adminUser} />

      <NewsCategoryManageModal
        open={categoryManageOpen}
        onOpenChange={setCategoryManageOpen}
        categories={dbNewsCategories}
        onSubmitCategory={submitCategoryAction}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminNavbar />

        <div className="flex-1 overflow-auto p-6 md:p-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">보도자료 관리</h1>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-gray-600">
                보도자료를 추가·수정·삭제할 수 있습니다.{" "}
                <span className="font-medium text-[#003F2B]">주요 보도: {featuredCount}건</span>
                <span className="text-gray-500"> (홈 보도자료 상단 슬라이더 최대 {MAX_FEATURED}건)</span>
              </p>
              <p className="mt-1 text-xs text-gray-500">총 {dbNews.length}건 · 목록 {filtered.length}건</p>
            </div>
            <Button
              type="button"
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="shrink-0 bg-[#02633E] hover:bg-[#014d30]"
            >
              <Plus className="mr-2 h-4 w-4" />
              보도자료 추가
            </Button>
          </div>

          <div className="mb-6 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="제목·요약·내용 검색…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-[#02633E]/25 pl-9"
              />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-10 min-w-[140px] rounded-md border border-[#02633E]/30 bg-white px-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#02633E]/30"
                aria-label="카테고리(타입) 필터"
              >
                <option value="">전체 카테고리</option>
                {categorySelectOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
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
          </div>

          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center text-gray-500 shadow-sm">
                <Newspaper className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                <p>조건에 맞는 보도자료가 없습니다.</p>
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.news_id}
                  className={cn(
                    "overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-shadow",
                    item.is_featured && "ring-2 ring-[#02633E]",
                  )}
                >
                  <div className="flex gap-4 p-4 md:gap-5 md:p-5">
                    <div
                      className={cn(
                        "relative h-[100px] w-[100px] shrink-0 overflow-hidden rounded-xl md:h-[120px] md:w-[120px] md:rounded-2xl",
                      )}
                    >
                      {item.thumbnail_url ? (
                        <img
                          src={item.thumbnail_url}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        <MediaThumbFallback className="size-full rounded-xl md:rounded-2xl" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        {item.is_featured && (
                          <span className="inline-flex items-center rounded-full bg-[#02633E] px-2.5 py-0.5 text-xs font-semibold text-white">
                            주요
                          </span>
                        )}
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold",
                            item.locale === "en"
                              ? "border-blue-200 bg-blue-50 text-blue-800"
                              : "border-gray-200 bg-gray-50 text-gray-800",
                          )}
                        >
                          {item.locale === "en" ? "EN" : "KO"}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold",
                            newsCategoryBadgeClass(categoryColorByName.get(item.type) ?? "slate"),
                          )}
                        >
                          {item.type}
                        </span>
                        {!item.is_active && (
                          <Badge variant="secondary" className="text-xs">
                            비노출
                          </Badge>
                        )}
                      </div>
                      <p className="truncate font-semibold text-gray-900">{item.title}</p>
                      {item.summary && (
                        <p className="mt-1 line-clamp-2 text-sm text-gray-600">{item.summary}</p>
                      )}
                      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400">
                        <span>
                          {item.published_at ?? item.created_at.toISOString().slice(0, 10)}
                          {item.source && ` · ${item.source}`}
                          {` · 조회 ${Number.parseInt(String(item.view_count ?? "0"), 10).toLocaleString("ko-KR")}`}
                        </span>
                        {item.source_url && (
                          <a
                            href={item.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-0.5 text-[#02633E] hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            원문
                          </a>
                        )}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col items-center gap-0.5 md:gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className={cn(
                          "rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:border-[#02633E]/45 hover:shadow-md",
                          "text-gray-500 hover:text-[#02633E] hover:bg-[#FDFDF5]",
                          item.is_featured &&
                            "border-[#02633E]/35 text-[#02633E] shadow-[0_2px_6px_rgba(2,99,62,0.12)]",
                        )}
                        title={item.is_featured ? "주요 보도 해제" : "주요 보도로 지정"}
                        onClick={() => handleToggleFeatured(item.news_id, item.is_featured)}
                      >
                        <Star
                          className={cn("h-5 w-5", item.is_featured && "fill-current")}
                          strokeWidth={2}
                        />
                      </Button>
                      {item.locale === "ko" ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-9 shrink-0 rounded-lg border-blue-200 text-xs text-blue-800"
                          title="영문 버전 초안 추가"
                          onClick={() => handleAddTranslation(item.news_id, "en")}
                        >
                          EN 추가
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:border-[#02633E]/45 hover:bg-[#FDFDF5] hover:shadow-md text-gray-500 hover:text-gray-900"
                        title="수정"
                        onClick={() => handleOpenEdit(item)}
                      >
                        <Pencil className="h-5 w-5" strokeWidth={2} />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:border-red-300 hover:bg-red-50/60 hover:shadow-md text-gray-500 hover:text-red-600"
                        title="삭제"
                        onClick={() => handleDelete(item.news_id)}
                      >
                        <Trash2 className="h-5 w-5" strokeWidth={2} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-[520px] gap-0 overflow-y-auto p-6 sm:max-w-[540px]">
          <DialogHeader className="space-y-1 pb-4 text-left">
            <DialogTitle className="text-xl font-bold text-gray-900">보도자료 추가</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-800">언어</Label>
              <select
                value={form.locale}
                onChange={(e) => setForm({ ...form, locale: e.target.value as "ko" | "en" })}
                className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#02633E]/25"
                aria-label="게시 언어"
              >
                <option value="ko">한국어 (ko)</option>
                <option value="en">English (en)</option>
              </select>
              <p className="text-xs text-gray-500">영문은 별도 행으로 저장되며, 이후 「EN 추가」로 묶을 수도 있습니다.</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-800">
                제목 <span className="text-red-500">*</span>
              </Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="보도자료 제목을 입력하세요"
                className="rounded-lg border-gray-200"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-800">
                  카테고리 <span className="text-red-500">*</span>
                </Label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#02633E]/25"
                  aria-label="카테고리"
                >
                  {categorySelectOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-800">
                  작성일 <span className="text-red-500">*</span>
                </Label>
                <DatePicker
                  value={form.published_at ? new Date(`${form.published_at}T12:00:00`) : undefined}
                  onChange={(d) =>
                    setForm({
                      ...form,
                      published_at: d ? d.toISOString().slice(0, 10) : "",
                    })
                  }
                  placeholder="연도. 월. 일."
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50/90 px-4 py-3">
              <div className="min-w-0 space-y-0.5">
                <Label htmlFor="add-featured-switch" className="text-sm font-medium text-gray-900">
                  주요 보도로 설정
                </Label>
                <p className="text-xs text-gray-500">메인 페이지 상단 슬라이더에 노출됩니다</p>
              </div>
              <Switch
                id="add-featured-switch"
                checked={form.is_featured}
                onCheckedChange={(v) => setForm({ ...form, is_featured: v })}
                className="shrink-0"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-800">
                요약 <span className="text-red-500">*</span>
              </Label>
              <Textarea
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                placeholder="목록에 표시될 요약 내용을 입력하세요"
                rows={3}
                className="min-h-[88px] resize-y rounded-lg border-gray-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-800">본문 내용</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="보도자료 전체 내용을 입력하세요 (텍스트 없이 페이지만 등록 가능)"
                rows={5}
                className="min-h-[120px] resize-y rounded-lg border-gray-200"
              />
              <p className="text-xs text-gray-500">텍스트 없이 이미지로만 구성할 수 있습니다</p>
            </div>

            <div className="space-y-2">
              <div>
                <Label className="text-sm font-medium text-gray-800">본문 이미지 (통이미지 업로드용)</Label>
                <p className="mt-1 text-xs text-gray-500">
                  보도자료를 이미지로 올릴 경우 여기에 추가하세요. 여러 장 등록 가능합니다.
                </p>
              </div>
              <MultiImageUpload
                bucket="media"
                folder="news/body"
                value={form.body_image_urls}
                onChange={(urls) => setForm({ ...form, body_image_urls: urls })}
                minHeightClassName="min-h-[200px]"
                hint="클릭하여 이미지 업로드 또는 파일을 여기로 드래그하세요. PNG, JPG, GIF (최대 10MB)"
              />
            </div>

            <div className="space-y-2">
              <div>
                <Label className="text-sm font-medium text-gray-800">대표 이미지 (선택)</Label>
                <p className="mt-1 text-xs text-gray-500">목록에서 보여지는 썸네일 이미지입니다.</p>
              </div>
              <ImageUpload
                bucket="media"
                folder="news"
                value={form.thumbnail_url}
                onChange={(url) => setForm({ ...form, thumbnail_url: url })}
                aspectRatio="16/9"
                hint="클릭하여 업로드. 이미지가 없으면 로고가 표시됩니다."
              />
            </div>

            <p className="text-xs text-gray-400">저장 시 사이트에 공개(활성) 상태로 등록됩니다.</p>

            <div className="flex gap-3 border-t border-gray-100 pt-4">
              <Button type="submit" className="h-11 flex-1 rounded-lg bg-[#02633E] text-base font-semibold hover:bg-[#014d30]">
                추가
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="h-11 flex-1 rounded-lg border-gray-300 text-base font-semibold"
              >
                취소
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) setEditingId(null);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-[520px] gap-0 overflow-y-auto p-6 sm:max-w-[540px]">
          <DialogHeader className="space-y-1 pb-4 text-left">
            <DialogTitle className="text-xl font-bold text-gray-900">보도자료 수정</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-800">
                제목 <span className="text-red-500">*</span>
              </Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="보도자료 제목을 입력하세요"
                className="rounded-lg border-gray-200"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-800">
                  카테고리 <span className="text-red-500">*</span>
                </Label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#02633E]/25"
                >
                  {categorySelectOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-800">
                  작성일 <span className="text-red-500">*</span>
                </Label>
                <DatePicker
                  value={form.published_at ? new Date(`${form.published_at}T12:00:00`) : undefined}
                  onChange={(d) =>
                    setForm({
                      ...form,
                      published_at: d ? d.toISOString().slice(0, 10) : "",
                    })
                  }
                  placeholder="연도. 월. 일."
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50/90 px-4 py-3">
              <div className="min-w-0 space-y-0.5">
                <Label htmlFor="edit-featured-switch" className="text-sm font-medium text-gray-900">
                  주요 보도로 설정
                </Label>
                <p className="text-xs text-gray-500">메인 페이지 상단 슬라이더에 노출됩니다</p>
              </div>
              <Switch
                id="edit-featured-switch"
                checked={form.is_featured}
                onCheckedChange={(v) => setForm({ ...form, is_featured: v })}
                className="shrink-0"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-800">
                요약 <span className="text-red-500">*</span>
              </Label>
              <Textarea
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                placeholder="목록에 표시될 요약 내용을 입력하세요"
                rows={3}
                className="min-h-[88px] resize-y rounded-lg border-gray-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-800">본문 내용</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="보도자료 전체 내용을 입력하세요 (텍스트 없이 페이지만 등록 가능)"
                rows={5}
                className="min-h-[120px] resize-y rounded-lg border-gray-200"
              />
              <p className="text-xs text-gray-500">텍스트 없이 이미지로만 구성할 수 있습니다</p>
            </div>

            <div className="space-y-2">
              <div>
                <Label className="text-sm font-medium text-gray-800">본문 이미지 (통이미지 업로드용)</Label>
                <p className="mt-1 text-xs text-gray-500">
                  보도자료를 이미지로 올릴 경우 여기에 추가하세요. 여러 장 등록 가능합니다.
                </p>
              </div>
              <MultiImageUpload
                bucket="media"
                folder="news/body"
                value={form.body_image_urls}
                onChange={(urls) => setForm({ ...form, body_image_urls: urls })}
                minHeightClassName="min-h-[200px]"
                hint="클릭하여 이미지 업로드 또는 파일을 여기로 드래그하세요. PNG, JPG, GIF (최대 10MB)"
              />
            </div>

            <div className="space-y-2">
              <div>
                <Label className="text-sm font-medium text-gray-800">대표 이미지 (선택)</Label>
                <p className="mt-1 text-xs text-gray-500">목록에서 보여지는 썸네일 이미지입니다.</p>
              </div>
              <ImageUpload
                bucket="media"
                folder="news"
                value={form.thumbnail_url}
                onChange={(url) => setForm({ ...form, thumbnail_url: url })}
                aspectRatio="16/9"
                hint="클릭하여 업로드. 이미지가 없으면 로고가 표시됩니다."
              />
              <Input
                value={form.thumbnail_url}
                onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                placeholder="또는 이미지 URL 직접 입력"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-sm text-gray-800">출처/매체 (선택)</Label>
                <Input
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  className="rounded-lg border-gray-200"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-sm text-gray-800">출처 링크 URL (선택)</Label>
                <Input
                  type="url"
                  value={form.source_url}
                  onChange={(e) => setForm({ ...form, source_url: e.target.value })}
                  placeholder="https://…"
                  className="rounded-lg border-gray-200"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2">
              <Checkbox
                id="edit-active"
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v === true })}
              />
              <Label htmlFor="edit-active" className="cursor-pointer text-sm font-normal text-gray-800">
                사이트에 노출 (활성)
              </Label>
            </div>

            <div className="flex gap-3 border-t border-gray-100 pt-4">
              <Button
                type="submit"
                className="h-11 flex-1 rounded-lg bg-[#02633E] text-base font-semibold hover:bg-[#014d30]"
              >
                저장
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="h-11 flex-1 rounded-lg border-gray-300 text-base font-semibold"
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
