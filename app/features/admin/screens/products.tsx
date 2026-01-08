/**
 * Admin Products Management Screen
 * 
 * Product management page for admin panel.
 * Allows viewing, searching, editing, and deleting products.
 */

import { useState } from "react";
import type { Route } from "./+types/products";
import { requireAdminAuth } from "../utils/auth.server";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import { ProductAddModal, type ProductFormData } from "../components/product-add-modal";
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

/**
 * Loader: Require admin authentication
 */
export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminAuth(request);
  return { adminUser };
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
  const { adminUser } = loaderData;
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter products based on search query
  const filteredProducts = MOCK_PRODUCTS.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddProduct = (productData: ProductFormData) => {
    // TODO: Add product to database
    console.log("Add product:", productData);
    // For now, just log the data
    alert(`제품이 추가되었습니다: ${productData.name}`);
  };

  const handleEdit = (productId: string) => {
    // TODO: Navigate to edit page
    console.log("Edit product:", productId);
  };

  const handleDelete = (productId: string) => {
    // TODO: Show confirmation dialog and delete
    console.log("Delete product:", productId);
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
                        onClick={() => handleEdit(product.id)}
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

      {/* Add Product Modal */}
      <ProductAddModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddProduct}
      />
    </div>
  );
}

