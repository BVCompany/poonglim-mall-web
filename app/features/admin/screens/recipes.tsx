/**
 * Admin Recipes Management Screen
 * 
 * Recipe management page for admin panel.
 * Allows viewing, searching, editing, and deleting recipes.
 */

import { useState } from "react";
import { useFetcher } from "react-router";
import type { Route } from "./+types/recipes";
import { requireAdminAuth } from "../utils/auth.server";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import { RecipeAddModal, type RecipeFormData } from "../components/recipe-add-modal";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Badge } from "~/core/components/ui/badge";
import { Card } from "~/core/components/ui/card";
import { Plus, Search, Edit, Trash2, Clock, Users } from "lucide-react";
import { MOCK_RECIPES } from "../data/recipes";
import type { AdminRecipe } from "../types/recipe.types";
import { getRecipes } from "~/features/recipe/lib/queries.server";
import db from "~/core/db/drizzle-client.server";
import { recipes } from "~/features/recipe/schema";
import { eq } from "drizzle-orm";

export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminAuth(request);
  const dbRecipes = await getRecipes().catch(() => []);
  return { adminUser, dbRecipes };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdminAuth(request);
  const fd = await request.formData();
  const intent = fd.get("intent") as string;

  if (intent === "create") {
    const catRaw = fd.get("category") as string;
    const catMap: Record<string, "easy" | "dessert" | "restaurant"> = {
      home: "easy", cafe: "dessert", restaurant: "restaurant",
    };
    await db.insert(recipes).values({
      title: fd.get("name") as string,
      category: catMap[catRaw] ?? "easy",
      description: (fd.get("description") as string) || null,
      cooking_time: fd.get("prepTime") ? parseInt(fd.get("prepTime") as string) || null : null,
      servings: fd.get("servings") ? parseInt(fd.get("servings") as string) || null : null,
      difficulty: (fd.get("difficulty") as string) || null,
      ingredients: (fd.get("ingredients") as string) || null,
      steps: (fd.get("instructions") as string) || null,
      thumbnail_url: (fd.get("image") as string) || null,
      tags: fd.get("tags") ? (fd.get("tags") as string).split(",").map((t) => t.trim()).filter(Boolean) : [],
      is_active: true,
    });
    return { success: true };
  }

  if (intent === "delete") {
    const id = Number(fd.get("id"));
    if (id) await db.delete(recipes).where(eq(recipes.recipe_id, id));
    return { success: true };
  }

  return { success: false };
}

/**
 * Get category label in Korean
 */
function getCategoryLabel(category: AdminRecipe["category"]): string {
  switch (category) {
    case "home":
      return "가정용";
    case "cafe":
      return "카페";
    case "restaurant":
      return "레스토랑";
    default:
      return "";
  }
}

/**
 * Get difficulty label in Korean
 */
function getDifficultyLabel(difficulty: AdminRecipe["difficulty"]): string {
  switch (difficulty) {
    case "easy":
      return "쉬움";
    case "medium":
      return "보통";
    case "hard":
      return "어려움";
    default:
      return "";
  }
}

/**
 * Get difficulty badge color
 */
function getDifficultyVariant(difficulty: AdminRecipe["difficulty"]) {
  switch (difficulty) {
    case "easy":
      return "default";
    case "medium":
      return "secondary";
    case "hard":
      return "destructive";
    default:
      return "default";
  }
}

/**
 * Admin Recipes Component
 */
export default function AdminRecipes({ loaderData }: Route.ComponentProps) {
  const { adminUser, dbRecipes } = loaderData;
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const fetcher = useFetcher();

  const sourceRecipes: AdminRecipe[] = dbRecipes.length > 0
    ? dbRecipes.map((r) => ({
        id: String(r.recipe_id),
        title: r.title,
        description: r.description ?? "",
        category: (r.category === "dessert" ? "cafe" : r.category === "easy" ? "home" : "restaurant") as AdminRecipe["category"],
        difficulty: (r.difficulty ?? "easy") as AdminRecipe["difficulty"],
        cookingTime: r.cooking_time ?? 0,
        servings: r.servings ?? 0,
        image: r.thumbnail_url ?? "",
        tags: r.tags ?? [],
        created_at: r.created_at.toISOString(),
        updated_at: r.updated_at.toISOString(),
      }))
    : MOCK_RECIPES;

  const filteredRecipes = sourceRecipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddRecipe = (recipeData: RecipeFormData) => {
    const fd = new FormData();
    fd.append("intent", "create");
    fd.append("name", recipeData.name);
    fd.append("category", recipeData.category);
    fd.append("difficulty", recipeData.difficulty);
    fd.append("description", recipeData.description);
    fd.append("prepTime", recipeData.prepTime);
    fd.append("servings", recipeData.servings);
    fd.append("ingredients", recipeData.ingredients);
    fd.append("instructions", recipeData.instructions);
    fd.append("tags", recipeData.tags);
    if (recipeData.image) fd.append("image", recipeData.image);
    fetcher.submit(fd, { method: "POST" });
    setIsAddModalOpen(false);
  };

  const handleEdit = (recipeId: string) => {
    console.log("Edit recipe:", recipeId);
  };

  const handleDelete = (recipeId: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const fd = new FormData();
    fd.append("intent", "delete");
    fd.append("id", recipeId);
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
                레시피 관리
              </h1>
              <p className="text-gray-600">
                레시피를 추가, 수정, 삭제할 수 있습니다
              </p>
            </div>
            <Button 
              className="gap-2 bg-[#204E3A] hover:bg-[#1a3f2e]"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              레시피 추가
            </Button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="레시피명으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Recipes List */}
          <div className="space-y-4">
            {filteredRecipes.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-gray-500">검색 결과가 없습니다.</p>
              </Card>
            ) : (
              filteredRecipes.map((recipe) => (
                <Card key={recipe.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-6">
                    {/* Recipe Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </div>

                    {/* Recipe Info */}
                    <div className="flex-1 min-w-0">
                      {/* Title & Badges */}
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {recipe.title}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {getCategoryLabel(recipe.category)}
                        </Badge>
                        <Badge
                          variant={getDifficultyVariant(recipe.difficulty)}
                          className="text-xs"
                        >
                          {getDifficultyLabel(recipe.difficulty)}
                        </Badge>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-2">
                        {recipe.description}
                      </p>

                      {/* Time & Servings */}
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <Clock className="w-4 h-4" />
                          <span>{recipe.cookingTime}분</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <Users className="w-4 h-4" />
                          <span>{recipe.servings}인분</span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {recipe.tags.map((tag, index) => (
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
                        onClick={() => handleEdit(recipe.id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Edit className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(recipe.id)}
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
          {filteredRecipes.length > 0 && (
            <div className="mt-6 text-center text-sm text-gray-500">
              총 {filteredRecipes.length}개의 레시피
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Add Recipe Modal */}
      <RecipeAddModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddRecipe}
      />
    </div>
  );
}

