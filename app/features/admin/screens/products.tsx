/**
 * Admin Products Management Screen
 * 
 * Product management page for admin panel.
 * Allows viewing, searching, editing, and deleting products.
 */

import { randomUUID } from "node:crypto";
import { useEffect, useState } from "react";
import { useFetcher, useRevalidator } from "react-router";
import type { Route } from "./+types/products";
import { requireAdminAuth } from "../utils/auth.server";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import { ProductAddModal, type ProductFormData } from "../components/product-add-modal";
import { getAllCategories } from "~/features/product-categories/lib/queries.server";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Badge } from "~/core/components/ui/badge";
import { Card } from "~/core/components/ui/card";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import type { AdminProduct } from "../types/product.types";
import { getAllProductsForAdmin } from "~/features/products/lib/queries.server";
import db from "~/core/db/drizzle-client.server";
import { products } from "~/features/products/schema";
import { and, asc, eq, ne } from "drizzle-orm";

const BADGE_MAP: Record<string, "best" | "new" | "b2b" | "sale"> = {
  best: "best",
  new: "new",
  sale: "sale",
  b2b: "b2b",
  recommended: "best",
};

const TG_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type AdminListProduct = {
  id: string;
  product_id: number;
  translation_group_id: string;
  locale: "ko" | "en";
  name: string;
  description: string;
  category: AdminProduct["category"];
  price: number | null;
  originalPrice?: number;
  image: string;
  tags: string[];
  badge: AdminProduct["badge"];
  status: AdminProduct["status"];
  sort_order: number;
  created_at: string;
  updated_at: string;
};

/** translation_group 단위 sort_order → 그룹 내 ko 우선 */
function sortAdminProductsByDisplayOrder(rows: AdminListProduct[]): AdminListProduct[] {
  const groupOrder = new Map<string, number>();
  for (const row of rows) {
    const group = row.translation_group_id;
    const order = row.sort_order ?? 0;
    const prev = groupOrder.get(group);
    groupOrder.set(group, prev === undefined ? order : Math.min(prev, order));
  }
  return [...rows].sort((a, b) => {
    if (a.translation_group_id === b.translation_group_id) {
      if (a.locale === "ko" && b.locale === "en") return -1;
      if (a.locale === "en" && b.locale === "ko") return 1;
      return a.product_id - b.product_id;
    }
    const oa = groupOrder.get(a.translation_group_id) ?? 0;
    const ob = groupOrder.get(b.translation_group_id) ?? 0;
    if (oa !== ob) return oa - ob;
    return a.product_id - b.product_id;
  });
}

function buildOrderedTranslationGroups(rows: AdminListProduct[]): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const row of sortAdminProductsByDisplayOrder(rows)) {
    if (seen.has(row.translation_group_id)) continue;
    seen.add(row.translation_group_id);
    ordered.push(row.translation_group_id);
  }
  return ordered;
}

/**
 * Loader: 관리자 인증 + DB 제품 목록
 */
export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminAuth(request);
  const [dbProducts, dbCategories] = await Promise.all([
    getAllProductsForAdmin().catch(() => []),
    getAllCategories().catch(() => []),
  ]);
  return { adminUser, dbProducts, dbCategories };
}

/**
 * Action: 제품 추가 / 삭제
 */
export async function action({ request }: Route.ActionArgs) {
  await requireAdminAuth(request);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "create") {
    const name             = formData.get("name") as string;
    const description      = formData.get("description") as string;
    const detail           = formData.get("detail") as string;
    const categoriesRaw    = formData.get("categories") as string;
    const priceRaw         = formData.get("price") as string;
    const originalPriceRaw = formData.get("originalPrice") as string;
    const badgeRaw         = formData.get("badge") as string;
    const imageUrl         = formData.get("image") as string;
    const tagsRaw          = formData.get("tags") as string;
    const shopUrl          = formData.get("shopUrl") as string;
    const sortOrderRaw     = formData.get("sort_order") as string;
    const localeRaw        = ((formData.get("locale") as string) || "ko").toLowerCase();
    const locale           = localeRaw === "en" ? "en" : "ko";
    // 제품 정보 스펙
    const volume           = formData.get("volume") as string;
    const storageMethod    = formData.get("storageMethod") as string;
    const expiryInfo       = formData.get("expiryInfo") as string;
    const origin           = formData.get("origin") as string;
    const ingredients      = formData.get("ingredients") as string;
    const certificationsRaw = formData.get("certifications") as string;

    const parsedCategories: string[] = (() => {
      try { return JSON.parse(categoriesRaw) as string[]; } catch { return []; }
    })();

    const parsedCertifications: string[] = certificationsRaw
      ? certificationsRaw.split(",").map((c) => c.trim()).filter(Boolean)
      : [];

    const groupFromForm = (formData.get("translation_group_id") as string)?.trim();
    const translation_group_id =
      groupFromForm && TG_UUID_RE.test(groupFromForm) ? groupFromForm : randomUUID();

    const maxRows = await db
      .select({ sort_order: products.sort_order })
      .from(products)
      .orderBy(asc(products.sort_order));
    const nextOrder =
      maxRows.length > 0 ? (maxRows[maxRows.length - 1].sort_order ?? 0) + 1 : 0;

    await db.insert(products).values({
      translation_group_id,
      locale,
      name,
      description,
      detail: detail || null,
      category: parsedCategories,
      price: priceRaw ? Number(priceRaw) : null,
      original_price: originalPriceRaw ? Number(originalPriceRaw) : null,
      badge: badgeRaw ? (BADGE_MAP[badgeRaw] ?? null) : null,
      image_url: imageUrl || null,
      tags: tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [],
      shop_url: shopUrl || null,
      volume: volume || null,
      storage_method: storageMethod || null,
      expiry_info: expiryInfo || null,
      origin: origin || null,
      ingredients: ingredients || null,
      certifications: parsedCertifications,
      is_active: true,
      sort_order: sortOrderRaw ? Number(sortOrderRaw) : nextOrder,
    });

    return { success: true };
  }

  if (intent === "create_translation") {
    const baseId = Number(formData.get("base_id"));
    const targetLocale =
      ((formData.get("target_locale") as string) || "en").toLowerCase() === "en" ? "en" : "ko";
    if (!baseId) return { success: false as const, error: "translation" as const };
    const [base] = await db.select().from(products).where(eq(products.product_id, baseId)).limit(1);
    if (!base) return { success: false as const, error: "translation" as const };
    const [exists] = await db
      .select({ id: products.product_id })
      .from(products)
      .where(and(eq(products.translation_group_id, base.translation_group_id), eq(products.locale, targetLocale)))
      .limit(1);
    if (exists) return { success: false as const, error: "translation_exists" as const };
    await db.insert(products).values({
      translation_group_id: base.translation_group_id,
      locale: targetLocale,
      name: "",
      description: "",
      detail: null,
      category: base.category,
      badge: base.badge,
      image_url: base.image_url,
      image_urls: base.image_urls,
      price: base.price,
      original_price: base.original_price,
      is_b2b: base.is_b2b,
      is_active: base.is_active,
      sort_order: base.sort_order,
      shop_url: base.shop_url,
      volume: null,
      storage_method: null,
      expiry_info: null,
      origin: null,
      ingredients: null,
      certifications: [],
      tags: [],
    });
    return { success: true as const };
  }

  if (intent === "update") {
    const id = Number(formData.get("id"));
    if (!id) return { success: false };

    const name             = formData.get("name") as string;
    const description      = formData.get("description") as string;
    const detail           = formData.get("detail") as string;
    const categoriesRaw    = formData.get("categories") as string;
    const priceRaw         = formData.get("price") as string;
    const originalPriceRaw = formData.get("originalPrice") as string;
    const badgeRaw         = formData.get("badge") as string;
    const imageUrl         = formData.get("image") as string;
    const tagsRaw          = formData.get("tags") as string;
    const shopUrl          = formData.get("shopUrl") as string;
    const volume           = formData.get("volume") as string;
    const storageMethod    = formData.get("storageMethod") as string;
    const expiryInfo       = formData.get("expiryInfo") as string;
    const origin           = formData.get("origin") as string;
    const ingredientsVal   = formData.get("ingredients") as string;
    const certificationsRaw = formData.get("certifications") as string;

    const parsedCategories: string[] = (() => {
      try { return JSON.parse(categoriesRaw) as string[]; } catch { return []; }
    })();

    const parsedCertifications: string[] = certificationsRaw
      ? certificationsRaw.split(",").map((c) => c.trim()).filter(Boolean)
      : [];

    const [editing] = await db.select().from(products).where(eq(products.product_id, id)).limit(1);
    if (!editing) return { success: false };

    await db.update(products).set({
      name,
      description,
      detail: detail || null,
      category: parsedCategories,
      price: priceRaw ? Number(priceRaw) : null,
      original_price: originalPriceRaw ? Number(originalPriceRaw) : null,
      badge: badgeRaw ? (BADGE_MAP[badgeRaw] ?? null) : null,
      image_url: imageUrl || null,
      tags: tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [],
      shop_url: shopUrl || null,
      volume: volume || null,
      storage_method: storageMethod || null,
      expiry_info: expiryInfo || null,
      origin: origin || null,
      ingredients: ingredientsVal || null,
      certifications: parsedCertifications,
      updated_at: new Date(),
    }).where(eq(products.product_id, id));

    await db
      .update(products)
      .set({
        category: parsedCategories,
        badge: badgeRaw ? (BADGE_MAP[badgeRaw] ?? null) : null,
        image_url: imageUrl || null,
        price: priceRaw ? Number(priceRaw) : null,
        original_price: originalPriceRaw ? Number(originalPriceRaw) : null,
        shop_url: shopUrl || null,
        updated_at: new Date(),
      })
      .where(and(eq(products.translation_group_id, editing.translation_group_id), ne(products.product_id, id)));

    return { success: true };
  }

  if (intent === "delete") {
    const id = Number(formData.get("id"));
    if (id) {
      const [row] = await db.select().from(products).where(eq(products.product_id, id)).limit(1);
      if (row) {
        await db.delete(products).where(eq(products.translation_group_id, row.translation_group_id));
      }
    }
    return { success: true };
  }

  if (intent === "reorder") {
    const translationGroupId = (formData.get("translation_group_id") as string)?.trim();
    const direction = formData.get("direction") as "up" | "down";
    if (!translationGroupId || (direction !== "up" && direction !== "down")) {
      return { success: false };
    }

    const allRows = await db
      .select()
      .from(products)
      .orderBy(asc(products.sort_order), asc(products.product_id));

    const seen = new Set<string>();
    const orderedGroupIds: string[] = [];
    for (const row of allRows) {
      if (seen.has(row.translation_group_id)) continue;
      seen.add(row.translation_group_id);
      orderedGroupIds.push(row.translation_group_id);
    }

    const idx = orderedGroupIds.indexOf(translationGroupId);
    if (idx < 0) return { success: false };

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= orderedGroupIds.length) {
      return { success: true };
    }

    const newOrder = [...orderedGroupIds];
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];

    await Promise.all(
      newOrder.map((groupId, order) =>
        db
          .update(products)
          .set({ sort_order: order })
          .where(eq(products.translation_group_id, groupId)),
      ),
    );

    return { success: true };
  }

  return { success: false };
}

/**
 * Format price with comma separator
 */
function formatPrice(price: number): string {
  return price.toLocaleString("ko-KR");
}

/**
 * Get badge color based on badge type
 */
function getBadgeVariant(badge?: AdminProduct["badge"]) {
  switch (badge) {
    case "best":
      return "default";
    case "new":
      return "secondary";
    case "sale":
      return "destructive";
    case "recommended":
      return "outline";
    default:
      return "default";
  }
}

/**
 * Get badge label in Korean
 */
function getBadgeLabel(badge?: AdminProduct["badge"]) {
  switch (badge) {
    case "best":
      return "BEST";
    case "new":
      return "NEW";
    case "sale":
      return "SALE";
    case "recommended":
      return "추천";
    default:
      return "";
  }
}

/**
 * Admin Products Component
 */
export default function AdminProducts({ loaderData }: Route.ComponentProps) {
  const { adminUser, dbProducts, dbCategories } = loaderData;
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>(undefined);
  const [editingData, setEditingData] = useState<ProductFormData | undefined>(undefined);
  const fetcher = useFetcher<typeof action>();
  const revalidator = useRevalidator();

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) return;
    if ("error" in fetcher.data && fetcher.data.error === "translation_exists") {
      window.alert("이미 같은 그룹에 EN 행이 있습니다.");
    }
    if ("success" in fetcher.data && fetcher.data.success) {
      revalidator.revalidate();
    }
  }, [fetcher.state, fetcher.data, revalidator]);

  // DB 데이터가 있으면 사용, 없으면 더미
  const sourceProducts: AdminListProduct[] = dbProducts.length > 0
    ? dbProducts.map((p) => ({
        id: String(p.product_id),
        product_id: p.product_id,
        translation_group_id: p.translation_group_id,
        locale: p.locale as "ko" | "en",
        name: p.name,
        description: p.description,
        category: (Array.isArray(p.category) ? p.category[0] : p.category) as AdminProduct["category"],
        price: p.price ?? null,
        originalPrice: p.original_price ?? undefined,
        image: p.image_url ?? "",
        tags: p.tags ?? [],
        badge: p.badge as AdminProduct["badge"],
        status: (p.is_active ? "active" : "inactive") as AdminProduct["status"],
        sort_order: p.sort_order ?? 0,
        created_at: p.created_at.toISOString(),
        updated_at: p.updated_at.toISOString(),
      }))
    : [];

  const orderedGroupIds = buildOrderedTranslationGroups(sourceProducts);
  const groupIndexMap = new Map(orderedGroupIds.map((id, index) => [id, index]));

  const filteredProducts = sortAdminProductsByDisplayOrder(
    sourceProducts.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  );

  const submitEnTranslation = (productId: number) => {
    const fd = new FormData();
    fd.append("intent", "create_translation");
    fd.append("base_id", String(productId));
    fd.append("target_locale", "en");
    fetcher.submit(fd, { method: "POST" });
  };

  const handleAddProduct = (productData: ProductFormData) => {
    const fd = new FormData();
    fd.append("intent", "create");
    fd.append("locale", productData.locale ?? "ko");
    fd.append("name", productData.name);
    fd.append("description", productData.description);
    fd.append("categories", JSON.stringify(productData.categories));
    if (productData.price != null && Number.isFinite(productData.price)) {
      fd.append("price", String(productData.price));
    } else {
      fd.append("price", "");
    }
    if (productData.originalPrice) fd.append("originalPrice", String(productData.originalPrice));
    if (productData.badge) fd.append("badge", productData.badge);
    fd.append("image", productData.image ?? "");
    fd.append("tags", productData.tags.join(","));
    if (productData.shopUrl)       fd.append("shopUrl", productData.shopUrl);
    if (productData.detail)        fd.append("detail", productData.detail);
    if (productData.volume)        fd.append("volume", productData.volume);
    if (productData.storageMethod) fd.append("storageMethod", productData.storageMethod);
    if (productData.expiryInfo)    fd.append("expiryInfo", productData.expiryInfo);
    if (productData.origin)        fd.append("origin", productData.origin);
    if (productData.ingredients)   fd.append("ingredients", productData.ingredients);
    if (productData.certifications) fd.append("certifications", productData.certifications);
    fetcher.submit(fd, { method: "POST" });
    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (productId: string) => {
    const raw = dbProducts.find((p) => String(p.product_id) === productId);
    if (!raw) return;

    setEditingId(raw.product_id);
    setEditingData({
      locale:         raw.locale === "en" ? "en" : "ko",
      name:           raw.name,
      categories:     Array.isArray(raw.category) ? raw.category : (raw.category ? [raw.category] : []),
      price:          raw.price ?? undefined,
      originalPrice:  raw.original_price ?? undefined,
      badge:          raw.badge ?? undefined,
      description:    raw.description ?? "",
      detail:         raw.detail ?? "",
      tags:           raw.tags ?? [],
      image:          raw.image_url ?? "",
      shopUrl:        raw.shop_url ?? "",
      volume:         raw.volume ?? "",
      storageMethod:  raw.storage_method ?? "",
      expiryInfo:     raw.expiry_info ?? "",
      origin:         raw.origin ?? "",
      ingredients:    raw.ingredients ?? "",
      certifications: (raw.certifications ?? []).join(", "),
    });
  };

  const handleEditProduct = (productData: ProductFormData) => {
    if (!editingId) return;
    const fd = new FormData();
    fd.append("intent",      "update");
    fd.append("id",          String(editingId));
    fd.append("name",        productData.name);
    fd.append("description", productData.description);
    fd.append("categories",  JSON.stringify(productData.categories));
    if (productData.price != null && Number.isFinite(productData.price)) {
      fd.append("price", String(productData.price));
    } else {
      fd.append("price", "");
    }
    if (productData.originalPrice) fd.append("originalPrice", String(productData.originalPrice));
    if (productData.badge)         fd.append("badge",         productData.badge);
    fd.append("image",       productData.image ?? "");
    fd.append("tags",        productData.tags.join(","));
    if (productData.shopUrl)       fd.append("shopUrl",       productData.shopUrl);
    if (productData.detail)        fd.append("detail",        productData.detail);
    if (productData.volume)        fd.append("volume",        productData.volume);
    if (productData.storageMethod) fd.append("storageMethod", productData.storageMethod);
    if (productData.expiryInfo)    fd.append("expiryInfo",    productData.expiryInfo);
    if (productData.origin)        fd.append("origin",        productData.origin);
    if (productData.ingredients)   fd.append("ingredients",   productData.ingredients);
    if (productData.certifications) fd.append("certifications", productData.certifications);

    fetcher.submit(fd, { method: "POST" });
    setEditingId(undefined);
    setEditingData(undefined);
  };

  const handleDelete = (productId: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const fd = new FormData();
    fd.append("intent", "delete");
    fd.append("id", productId);
    fetcher.submit(fd, { method: "POST" });
  };

  const handleReorder = (translationGroupId: string, direction: "up" | "down") => {
    const fd = new FormData();
    fd.append("intent", "reorder");
    fd.append("translation_group_id", translationGroupId);
    fd.append("direction", direction);
    fetcher.submit(fd, { method: "POST" });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar adminUser={adminUser} />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation Bar */}
        <AdminNavbar />

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                제품 관리
              </h1>
              <p className="text-gray-600">
                제품을 추가, 수정, 삭제할 수 있습니다
              </p>
            </div>
            <Button 
              className="gap-2 bg-[#204E3A] hover:bg-[#1a3f2e]"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              제품 추가
            </Button>
          </div>

          {/* Search Bar */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="제품명으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-sm text-gray-500">표시 순서대로 정렬 · KO 행에서 ↑↓ 로 순서 변경</p>
          </div>

          {/* Products List */}
          <div className="space-y-4">
            {filteredProducts.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-gray-500">검색 결과가 없습니다.</p>
              </Card>
            ) : (
              filteredProducts.map((product) => {
                const groupIdx = groupIndexMap.get(product.translation_group_id);
                const displayOrder = groupIdx !== undefined ? groupIdx + 1 : null;
                const canMoveUp = product.locale === "ko" && groupIdx !== undefined && groupIdx > 0;
                const canMoveDown =
                  product.locale === "ko" &&
                  groupIdx !== undefined &&
                  groupIdx < orderedGroupIds.length - 1;

                return (
                <Card key={product.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-6">
                    {product.locale === "ko" ? (
                      <div className="flex flex-col items-center gap-0.5 flex-shrink-0 w-10">
                        <button
                          type="button"
                          disabled={!canMoveUp || fetcher.state !== "idle"}
                          onClick={() =>
                            handleReorder(product.translation_group_id, "up")
                          }
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="위로 이동"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <span
                          className="text-sm font-semibold text-[#204E3A] tabular-nums"
                          aria-label={`표시 순서 ${displayOrder}`}
                        >
                          {displayOrder}
                        </span>
                        <button
                          type="button"
                          disabled={!canMoveDown || fetcher.state !== "idle"}
                          onClick={() =>
                            handleReorder(product.translation_group_id, "down")
                          }
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="아래로 이동"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center flex-shrink-0 w-10">
                        <span className="text-sm font-medium text-gray-400 tabular-nums">
                          {displayOrder}
                        </span>
                      </div>
                    )}
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      {/* Name & Badge */}
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {product.name}
                        </h3>
                        {"locale" in product && product.locale ? (
                          <Badge variant="outline" className="text-[10px] font-semibold uppercase">
                            {product.locale}
                          </Badge>
                        ) : null}
                        {product.badge && (
                          <Badge
                            variant={getBadgeVariant(product.badge)}
                            className="text-xs"
                          >
                            {getBadgeLabel(product.badge)}
                          </Badge>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-2">
                        {product.description}
                      </p>

                      {/* Price */}
                      <div className="flex items-center gap-2 mb-2">
                        {product.price != null ? (
                          <span className="text-lg font-bold text-gray-900">
                            {formatPrice(product.price)}원
                          </span>
                        ) : (
                          <span className="text-sm font-medium text-gray-500">가격 미표기</span>
                        )}
                        {product.originalPrice != null && product.originalPrice > 0 ? (
                          <span className="text-sm text-gray-400 line-through">
                            {formatPrice(product.originalPrice)}원
                          </span>
                        ) : null}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs text-gray-600"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {dbProducts.length > 0 &&
                      "locale" in product &&
                      product.locale === "ko" &&
                      "product_id" in product &&
                      product.product_id != null &&
                      "translation_group_id" in product &&
                      !dbProducts.some(
                        (p) =>
                          p.translation_group_id === product.translation_group_id &&
                          p.locale === "en",
                      ) ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs border-[#204E3A]/40 text-[#204E3A]"
                          onClick={() =>
                            "product_id" in product && product.product_id != null
                              ? submitEnTranslation(product.product_id)
                              : undefined
                          }
                        >
                          EN 추가
                        </Button>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(product.id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Edit className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </Card>
                );
              })
            )}
          </div>

          {/* Results Count */}
          {filteredProducts.length > 0 && (
            <div className="mt-6 text-center text-sm text-gray-500">
              총 {filteredProducts.length}개의 제품
            </div>
          )}
        </div>
      </div>
      </div>

      {/* 등록 모달 */}
      <ProductAddModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddProduct}
        dbCategories={dbCategories.map((c) => ({ slug: c.slug, name: c.name }))}
      />

      {/* 수정 모달 */}
      <ProductAddModal
        open={editingId !== undefined}
        onOpenChange={(o) => { if (!o) { setEditingId(undefined); setEditingData(undefined); } }}
        onSubmit={handleEditProduct}
        editId={editingId}
        initialData={editingData}
        dbCategories={dbCategories.map((c) => ({ slug: c.slug, name: c.name }))}
      />
    </div>
  );
}

