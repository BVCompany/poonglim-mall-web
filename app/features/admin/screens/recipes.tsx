/**
 * Admin Recipes Management Screen
 */
import { useState } from "react";
import { useFetcher } from "react-router";
import type { Route } from "./+types/recipes";
import { requireAdminAuth } from "../utils/auth.server";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import { RecipeAddModal, type RecipeFormData, type IngredientRow, type StepRow } from "../components/recipe-add-modal";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Badge } from "~/core/components/ui/badge";
import { Card } from "~/core/components/ui/card";
import { Plus, Search, Edit, Trash2, Clock, Users } from "lucide-react";
import { MOCK_RECIPES } from "../data/recipes";
import type { AdminRecipe } from "../types/recipe.types";
import { getRecipes } from "~/features/recipe/lib/queries.server";
import { getAllRecipeCategories } from "~/features/recipe-categories/lib/queries.server";
import db from "~/core/db/drizzle-client.server";
import { recipes } from "~/features/recipe/schema";
import { eq } from "drizzle-orm";

export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminAuth(request);
  const [dbRecipes, dbCategories] = await Promise.all([
    getRecipes().catch(() => []),
    getAllRecipeCategories().catch(() => []),
  ]);
  return { adminUser, dbRecipes, dbCategories };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdminAuth(request);
  const fd = await request.formData();
  const intent = fd.get("intent") as string;

  if (intent === "create") {
    // 재료, 만드는 법을 JSON 문자열로 받아 그대로 저장
    const ingredientsJson = fd.get("ingredients") as string;
    const stepsJson       = fd.get("steps") as string;

    await db.insert(recipes).values({
      title:        fd.get("name") as string,
      category:     (fd.get("category") as string) || "easy",
      description:  (fd.get("description") as string) || null,
      cooking_time: (fd.get("prepTime") as string) || null,
      servings:     (fd.get("servings") as string) || null,
      difficulty:   (fd.get("difficulty") as string) || null,
      ingredients:  ingredientsJson || null,
      steps:        stepsJson || null,
      thumbnail_url: (fd.get("image") as string) || null,
      tags: fd.get("tags")
        ? (fd.get("tags") as string).split(",").map((t) => t.trim()).filter(Boolean)
        : [],
      is_active: true,
    });
    return { success: true };
  }

  if (intent === "update") {
    const id = Number(fd.get("id"));
    if (!id) return { success: false };
    const ingredientsJson = fd.get("ingredients") as string;
    const stepsJson       = fd.get("steps") as string;

    await db.update(recipes).set({
      title:        fd.get("name") as string,
      category:     (fd.get("category") as string) || "easy",
      description:  (fd.get("description") as string) || null,
      cooking_time: (fd.get("prepTime") as string) || null,
      servings:     (fd.get("servings") as string) || null,
      difficulty:   (fd.get("difficulty") as string) || null,
      ingredients:  ingredientsJson || null,
      steps:        stepsJson || null,
      thumbnail_url: (fd.get("image") as string) || null,
      tags: fd.get("tags")
        ? (fd.get("tags") as string).split(",").map((t) => t.trim()).filter(Boolean)
        : [],
      updated_at: new Date(),
    }).where(eq(recipes.recipe_id, id));
    return { success: true };
  }

  if (intent === "delete") {
    const id = Number(fd.get("id"));
    if (id) await db.delete(recipes).where(eq(recipes.recipe_id, id));
    return { success: true };
  }

  return { success: false };
}

function makeCategoryLabel(dbCategories: { slug: string; name: string }[]) {
  const fallback: Record<string, string> = {
    easy: "가정용", dessert: "카페/베이커리", restaurant: "외식업체",
    home: "가정용", cafe: "카페/베이커리",
  };
  return (cat: string) =>
    dbCategories.find((c) => c.slug === cat)?.name ?? fallback[cat] ?? cat;
}

function getDifficultyLabel(diff: string): string {
  const map: Record<string, string> = { easy: "쉬움", medium: "보통", hard: "어려움" };
  return map[diff] ?? diff;
}

export default function AdminRecipes({ loaderData }: Route.ComponentProps) {
  const { adminUser, dbRecipes, dbCategories } = loaderData;
  const getCategoryLabel = makeCategoryLabel(dbCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>(undefined);
  const [editingData, setEditingData] = useState<RecipeFormData | undefined>(undefined);
  const fetcher = useFetcher();

  const sourceRecipes: AdminRecipe[] = dbRecipes.length > 0
    ? dbRecipes.map((r) => ({
        id: String(r.recipe_id),
        title: r.title,
        description: r.description ?? "",
        category: r.category as AdminRecipe["category"],
        difficulty: (r.difficulty ?? "easy") as AdminRecipe["difficulty"],
        cookingTime: r.cooking_time ?? "",
        servings: r.servings ?? "",
        image: r.thumbnail_url ?? "",
        tags: r.tags ?? [],
        created_at: r.created_at.toISOString(),
        updated_at: r.updated_at.toISOString(),
      }))
    : MOCK_RECIPES;

  const filteredRecipes = sourceRecipes.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddRecipe = (recipeData: RecipeFormData) => {
    const fd = new FormData();
    fd.append("intent", "create");
    fd.append("name",        recipeData.name);
    fd.append("category",    recipeData.category);
    fd.append("difficulty",  recipeData.difficulty);
    fd.append("description", recipeData.description);
    fd.append("prepTime",    recipeData.prepTime);
    fd.append("servings",    recipeData.servings);
    fd.append("tags",        recipeData.tags);

    // 재료: [{name, amount}] JSON
    const validIngredients = recipeData.ingredients.filter((r) => r.name.trim());
    fd.append("ingredients", JSON.stringify(validIngredients));

    // 만드는 법: [{step, description}] JSON
    const validSteps = recipeData.steps
      .filter((s) => s.description.trim())
      .map((s, i) => ({ step: i + 1, description: s.description }));
    fd.append("steps", JSON.stringify(validSteps));

    if (recipeData.image) fd.append("image", recipeData.image);

    fetcher.submit(fd, { method: "POST" });
    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (recipeId: string) => {
    const raw = dbRecipes.find((r) => String(r.recipe_id) === recipeId);
    if (!raw) return;

    let ingredients: IngredientRow[] = [{ name: "", amount: "" }];
    let steps: StepRow[] = [{ description: "" }];
    try {
      if (raw.ingredients) {
        const parsed = JSON.parse(raw.ingredients);
        if (Array.isArray(parsed) && parsed.length > 0) ingredients = parsed;
      }
    } catch {}
    try {
      if (raw.steps) {
        const parsed = JSON.parse(raw.steps);
        if (Array.isArray(parsed) && parsed.length > 0)
          steps = parsed.map((s: { description: string }) => ({ description: s.description }));
      }
    } catch {}

    setEditingId(raw.recipe_id);
    setEditingData({
      name:        raw.title,
      category:    raw.category,
      difficulty:  raw.difficulty ?? "easy",
      prepTime:    String(raw.cooking_time ?? ""),
      servings:    String(raw.servings ?? ""),
      description: raw.description ?? "",
      ingredients,
      steps,
      tags:        (raw.tags ?? []).join(", "),
      image:       raw.thumbnail_url ?? "",
    });
  };

  const handleEditRecipe = (recipeData: RecipeFormData) => {
    if (!editingId) return;
    const fd = new FormData();
    fd.append("intent",      "update");
    fd.append("id",          String(editingId));
    fd.append("name",        recipeData.name);
    fd.append("category",    recipeData.category);
    fd.append("difficulty",  recipeData.difficulty);
    fd.append("description", recipeData.description);
    fd.append("prepTime",    recipeData.prepTime);
    fd.append("servings",    recipeData.servings);
    fd.append("tags",        recipeData.tags);

    const validIngredients = recipeData.ingredients.filter((r) => r.name.trim());
    fd.append("ingredients", JSON.stringify(validIngredients));

    const validSteps = recipeData.steps
      .filter((s) => s.description.trim())
      .map((s, i) => ({ step: i + 1, description: s.description }));
    fd.append("steps", JSON.stringify(validSteps));

    if (recipeData.image) fd.append("image", recipeData.image);

    fetcher.submit(fd, { method: "POST" });
    setEditingId(undefined);
    setEditingData(undefined);
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
      <AdminSidebar adminUser={adminUser} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminNavbar />

        <div className="flex-1 overflow-auto">
          <div className="p-8">

            {/* 헤더 */}
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-gray-900">레시피 관리</h1>
                <p className="text-gray-600">레시피를 추가, 수정, 삭제할 수 있습니다</p>
              </div>
              <Button className="gap-2 bg-[#204E3A] hover:bg-[#1a3f2e]" onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4" />
                레시피 추가
              </Button>
            </div>

            {/* 검색 */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="레시피명으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* 목록 */}
            <div className="space-y-4">
              {filteredRecipes.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-gray-500">검색 결과가 없습니다.</p>
                </Card>
              ) : (
                filteredRecipes.map((recipe) => (
                  <Card key={recipe.id} className="p-6 transition-shadow hover:shadow-md">
                    <div className="flex items-center gap-6">
                      <div className="flex-shrink-0">
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          className="h-20 w-20 rounded-lg object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">{recipe.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {getCategoryLabel(recipe.category)}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {getDifficultyLabel(recipe.difficulty)}
                          </Badge>
                        </div>

                        <p className="mb-2 text-sm text-gray-600">{recipe.description}</p>

                        <div className="mb-2 flex items-center gap-4">
                          {recipe.cookingTime && (
                            <div className="flex items-center gap-1 text-sm text-gray-700">
                              <Clock className="h-4 w-4" />
                              <span>{recipe.cookingTime}</span>
                            </div>
                          )}
                          {recipe.servings && (
                            <div className="flex items-center gap-1 text-sm text-gray-700">
                              <Users className="h-4 w-4" />
                              <span>{recipe.servings}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {recipe.tags.map((tag, i) => (
                            <span key={i} className="text-xs text-gray-500">#{tag}</span>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-shrink-0 items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(recipe.id)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Edit className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(recipe.id)}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {filteredRecipes.length > 0 && (
              <div className="mt-6 text-center text-sm text-gray-500">
                총 {filteredRecipes.length}개의 레시피
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 등록 모달 */}
      <RecipeAddModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddRecipe}
        dbCategories={dbCategories.map((c) => ({ slug: c.slug, name: c.name }))}
      />

      {/* 수정 모달 */}
      <RecipeAddModal
        open={editingId !== undefined}
        onOpenChange={(o) => { if (!o) { setEditingId(undefined); setEditingData(undefined); } }}
        onSubmit={handleEditRecipe}
        editId={editingId}
        initialData={editingData}
        dbCategories={dbCategories.map((c) => ({ slug: c.slug, name: c.name }))}
      />
    </div>
  );
}
