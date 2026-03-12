/**
 * Admin Products Management Screen
 * 
 * Product management page for admin panel.
 * Allows viewing, searching, editing, and deleting products.
 */

import { useState } from "react";
import { useFetcher } from "react-router";
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
} from "lucide-react";
import { MOCK_PRODUCTS } from "../data/products";
import type { AdminProduct } from "../types/product.types";
import { getProducts } from "~/features/products/lib/queries.server";
import db from "~/core/db/drizzle-client.server";
import { products } from "~/features/products/schema";
import { eq } from "drizzle-orm";

const BADGE_MAP: Record<string, "best" | "new" | "b2b" | "sale"> = {
  best: "best",
  new: "new",
  sale: "sale",
  b2b: "b2b",
  recommended: "best",
};

/**
 * Loader: 관리자 인증 + DB 제품 목록
 */
export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminAuth(request);
  const [dbProducts, dbCategories] = await Promise.all([
    getProducts().catch(() => []),
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

    await db.insert(products).values({
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
      sort_order: sortOrderRaw ? Number(sortOrderRaw) : 0,
    });

    return { success: true };
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
    return { success: true };
  }

  if (intent === "delete") {
    const id = Number(formData.get("id"));
    if (id) {
      await db.delete(products).where(eq(products.product_id, id));
    }
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
  const fetcher = useFetcher();

  // DB 데이터가 있으면 사용, 없으면 더미
  const sourceProducts = dbProducts.length > 0
    ? dbProducts.map((p) => ({
        id: String(p.product_id),
        name: p.name,
        description: p.description,
        category: (Array.isArray(p.category) ? p.category[0] : p.category) as AdminProduct["category"],
        price: p.price ?? 0,
        originalPrice: p.original_price ?? undefined,
        image: p.image_url ?? "",
        tags: p.tags ?? [],
        badge: p.badge as AdminProduct["badge"],
        status: (p.is_active ? "active" : "inactive") as AdminProduct["status"],
        created_at: p.created_at.toISOString(),
        updated_at: p.updated_at.toISOString(),
      }))
    : MOCK_PRODUCTS;

  const filteredProducts = sourceProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddProduct = (productData: ProductFormData) => {
    const fd = new FormData();
    fd.append("intent", "create");
    fd.append("name", productData.name);
    fd.append("description", productData.description);
    fd.append("categories", JSON.stringify(productData.categories));
    fd.append("price", String(productData.price));
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
      name:           raw.name,
      categories:     Array.isArray(raw.category) ? raw.category : (raw.category ? [raw.category] : []),
      price:          raw.price ?? 0,
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
    fd.append("price",       String(productData.price));
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
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="제품명으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Products List */}
          <div className="space-y-4">
            {filteredProducts.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-gray-500">검색 결과가 없습니다.</p>
              </Card>
            ) : (
              filteredProducts.map((product) => (
                <Card key={product.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-6">
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
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {product.name}
                        </h3>
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
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(product.price)}원
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-400 line-through">
                            {formatPrice(product.originalPrice)}원
                          </span>
                        )}
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
              ))
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

