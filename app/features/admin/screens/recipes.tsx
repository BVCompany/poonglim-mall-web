/**
 * Admin Recipes Management Screen
 */
import { useEffect, useMemo, useState } from "react";
import { useFetcher } from "react-router";
import type { Route } from "./+types/recipes";
import { requireAdminAuth } from "../utils/auth.server";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import {
  RecipeAddModal,
  type RecipeFormData,
  type IngredientRow,
  type StepRow,
  ingredientsRowsToText,
  stepRowsToText,
  textToIngredientRows,
  textToStepRows,
} from "../components/recipe-add-modal";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Clock,
  Users,
  Settings,
  ImageIcon,
} from "lucide-react";
import { MOCK_RECIPES } from "../data/recipes";
import type { AdminRecipe } from "../types/recipe.types";
import { getAllRecipesForAdmin } from "~/features/recipe/lib/queries.server";
import { getAllRecipeCategories } from "~/features/recipe-categories/lib/queries.server";
import { getRecipeCategoriesAdminDemo } from "~/features/recipe-categories/lib/recipe-categories-demo";
import { toRecipeCategorySlug } from "~/features/recipe-categories/lib/slug";
import { recipeCategories } from "~/features/recipe-categories/schema";
import db from "~/core/db/drizzle-client.server";
import { recipes } from "~/features/recipe/schema";
import { count, eq, sql } from "drizzle-orm";
import { cn } from "~/core/lib/utils";
import { RecipeCategoryManageModal } from "../components/recipe-category-manage-modal";
import { newsCategoryBadgeClass } from "~/features/media/lib/news-category-badges";

const PROTECTED_RECIPE_CATEGORY_SLUG = "easy";

export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminAuth(request);
  const [dbRecipes, dbCategoriesRaw] = await Promise.all([
    getAllRecipesForAdmin().catch(() => []),
    getAllRecipeCategories().catch(() => []),
  ]);
  const usingDemoCategories = dbCategoriesRaw.length === 0;
  const dbCategories = usingDemoCategories
    ? getRecipeCategoriesAdminDemo()
    : dbCategoriesRaw;
  return { adminUser, dbRecipes, dbCategories, usingDemoCategories };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdminAuth(request);
  const fd = await request.formData();
  const intent = fd.get("intent") as string;

  if (intent === "create") {
    const ingredientsJson = fd.get("ingredients") as string;
    const stepsJson = fd.get("steps") as string;

    await db.insert(recipes).values({
      title: fd.get("name") as string,
      category: (fd.get("category") as string) || "easy",
      description: (fd.get("description") as string) || null,
      cooking_time: (fd.get("prepTime") as string) || null,
      servings: (fd.get("servings") as string) || null,
      difficulty: (fd.get("difficulty") as string) || null,
      ingredients: ingredientsJson || null,
      steps: stepsJson || null,
      thumbnail_url: (fd.get("image") as string) || null,
      tags: fd.get("tags")
        ? (fd.get("tags") as string)
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      is_active: true,
    });
    return { success: true };
  }

  if (intent === "update") {
    const id = Number(fd.get("id"));
    if (!id) return { success: false };
    const ingredientsJson = fd.get("ingredients") as string;
    const stepsJson = fd.get("steps") as string;

    await db
      .update(recipes)
      .set({
        title: fd.get("name") as string,
        category: (fd.get("category") as string) || "easy",
        description: (fd.get("description") as string) || null,
        cooking_time: (fd.get("prepTime") as string) || null,
        servings: (fd.get("servings") as string) || null,
        difficulty: (fd.get("difficulty") as string) || null,
        ingredients: ingredientsJson || null,
        steps: stepsJson || null,
        thumbnail_url: (fd.get("image") as string) || null,
        tags: fd.get("tags")
          ? (fd.get("tags") as string)
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        updated_at: new Date(),
      })
      .where(eq(recipes.recipe_id, id));
    return { success: true };
  }

  if (intent === "delete") {
    const id = Number(fd.get("id"));
    if (id) await db.delete(recipes).where(eq(recipes.recipe_id, id));
    return { success: true };
  }

  if (intent === "category_create") {
    const name = ((fd.get("name") as string) ?? "").trim();
    const color = ((fd.get("color") as string) ?? "").trim() || "sky";
    const slug =
      ((fd.get("slug") as string) ?? "").trim() || toRecipeCategorySlug(name);
    if (!name || !slug) return { success: false as const, error: "category_validation" as const };
    const [dup] = await db
      .select()
      .from(recipeCategories)
      .where(eq(recipeCategories.slug, slug))
      .limit(1);
    if (dup) return { success: false as const, error: "category_duplicate" as const };
    const [mx] = await db
      .select({ v: sql<number>`COALESCE(MAX(${recipeCategories.sort_order}), -1)` })
      .from(recipeCategories);
    const nextOrder = Number(mx?.v ?? -1) + 1;
    try {
      await db.insert(recipeCategories).values({
        name,
        slug,
        color,
        sort_order: nextOrder,
        is_active: true,
      });
    } catch {
      return { success: false as const, error: "category_duplicate" as const };
    }
    return { success: true as const, intent: "category" as const };
  }

  if (intent === "category_update") {
    const id = Number(fd.get("id"));
    const newName = ((fd.get("name") as string) ?? "").trim();
    const newSlug = ((fd.get("slug") as string) ?? "").trim();
    const color = ((fd.get("color") as string) ?? "").trim() || "sky";
    if (!id || !newName || !newSlug) {
      return { success: false as const, error: "category_validation" as const };
    }
    const [row] = await db
      .select()
      .from(recipeCategories)
      .where(eq(recipeCategories.category_id, id))
      .limit(1);
    if (!row) return { success: false as const, error: "category_not_found" as const };
    if (row.slug === PROTECTED_RECIPE_CATEGORY_SLUG && newSlug !== row.slug) {
      return { success: false as const, error: "category_protected" as const };
    }
    if (newSlug !== row.slug) {
      const [dup] = await db
        .select()
        .from(recipeCategories)
        .where(eq(recipeCategories.slug, newSlug))
        .limit(1);
      if (dup && dup.category_id !== id) {
        return { success: false as const, error: "category_duplicate" as const };
      }
      await db.transaction(async (tx) => {
        await tx
          .update(recipes)
          .set({ category: newSlug })
          .where(eq(recipes.category, row.slug));
        await tx
          .update(recipeCategories)
          .set({ name: newName, slug: newSlug, color, updated_at: new Date() })
          .where(eq(recipeCategories.category_id, id));
      });
    } else {
      await db
        .update(recipeCategories)
        .set({ name: newName, color, updated_at: new Date() })
        .where(eq(recipeCategories.category_id, id));
    }
    return { success: true as const, intent: "category" as const };
  }

  if (intent === "category_delete") {
    const id = Number(fd.get("id"));
    if (!id) return { success: false as const, error: "category_validation" as const };
    const [row] = await db
      .select()
      .from(recipeCategories)
      .where(eq(recipeCategories.category_id, id))
      .limit(1);
    if (!row) return { success: false as const, error: "category_not_found" as const };
    if (row.slug === PROTECTED_RECIPE_CATEGORY_SLUG) {
      return { success: false as const, error: "category_protected" as const };
    }
    const [{ n }] = await db
      .select({ n: count() })
      .from(recipes)
      .where(eq(recipes.category, row.slug));
    if (Number(n) > 0) return { success: false as const, error: "category_in_use" as const };
    await db.delete(recipeCategories).where(eq(recipeCategories.category_id, id));
    return { success: true as const, intent: "category" as const };
  }

  return { success: false };
}

function makeCategoryLabel(dbCategories: { slug: string; name: string }[]) {
  const fallback: Record<string, string> = {
    easy: "가정용",
    dessert: "카페/베이커리",
    restaurant: "외식업체",
    home: "가정용",
    cafe: "카페",
  };
  return (cat: string) =>
    dbCategories.find((c) => c.slug === cat)?.name ?? fallback[cat] ?? cat;
}

function getDifficultyLabel(diff: string): string {
  const map: Record<string, string> = { easy: "쉬움", medium: "보통", hard: "어려움" };
  return map[diff] ?? diff;
}

function formPayloadFromRecipeData(recipeData: RecipeFormData) {
  const validIngredients = textToIngredientRows(recipeData.ingredientsText).filter((r) =>
    r.name.trim(),
  );
  const validSteps = textToStepRows(recipeData.stepsText)
    .filter((s) => s.description.trim())
    .map((s, i) => ({ step: i + 1, description: s.description }));

  const fd = new FormData();
  fd.append("name", recipeData.name);
  fd.append("category", recipeData.category);
  fd.append("difficulty", recipeData.difficulty);
  fd.append("description", recipeData.description);
  fd.append("prepTime", recipeData.prepTime);
  fd.append("servings", recipeData.servings);
  fd.append("tags", recipeData.tags);
  fd.append("ingredients", JSON.stringify(validIngredients));
  fd.append("steps", JSON.stringify(validSteps));
  if (recipeData.image?.trim()) fd.append("image", recipeData.image.trim());
  return fd;
}

export default function AdminRecipes({ loaderData }: Route.ComponentProps) {
  const { adminUser, dbRecipes, dbCategories, usingDemoCategories } = loaderData;
  const getCategoryLabel = makeCategoryLabel(dbCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [categoryManageOpen, setCategoryManageOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>(undefined);
  const [editingData, setEditingData] = useState<RecipeFormData | undefined>(undefined);
  const fetcher = useFetcher<typeof action>();

  const categoryColorBySlug = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of dbCategories) m.set(c.slug, c.color || "slate");
    return m;
  }, [dbCategories]);

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) return;
    const d = fetcher.data;
    if ("error" in d && d.error === "category_protected") {
      window.alert("기본 카테고리(가정용)는 삭제하거나 슬러그를 바꿀 수 없습니다.");
      return;
    }
    if ("error" in d && d.error === "category_in_use") {
      window.alert("이 카테고리를 사용 중인 레시피가 있어 삭제할 수 없습니다. 먼저 해당 레시피의 카테고리를 변경하세요.");
      return;
    }
    if ("error" in d && d.error === "category_duplicate") {
      window.alert("이미 같은 슬러그의 카테고리가 있습니다.");
      return;
    }
    if ("error" in d && d.error === "category_validation") {
      window.alert("이름과 슬러그를 입력해 주세요.");
      return;
    }
    if ("error" in d && d.error === "category_not_found") {
      window.alert("카테고리를 찾을 수 없습니다.");
      return;
    }
    if ("success" in d && d.success && "intent" in d && d.intent === "category") {
      setCategoryManageOpen(false);
    }
  }, [fetcher.state, fetcher.data]);

  const submitCategoryAction = (intent: string, fields: Record<string, string>) => {
    const fd = new FormData();
    fd.append("intent", intent);
    for (const [k, v] of Object.entries(fields)) fd.append(k, v);
    fetcher.submit(fd, { method: "POST" });
  };

  const usingMockData = dbRecipes.length === 0;

  const sourceRecipes: AdminRecipe[] = useMemo(
    () =>
      dbRecipes.length > 0
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
        : MOCK_RECIPES,
    [dbRecipes],
  );

  const filteredRecipes = sourceRecipes.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  const handleAddRecipe = (recipeData: RecipeFormData) => {
    const fd = formPayloadFromRecipeData(recipeData);
    fd.append("intent", "create");
    fetcher.submit(fd, { method: "POST" });
    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (recipeId: string) => {
    if (usingMockData) {
      window.alert(
        "예시 더미 데이터는 수정할 수 없습니다. 실제 레시피를 등록하면 더미 목록은 표시되지 않습니다.",
      );
      return;
    }
    const raw = dbRecipes.find((r) => String(r.recipe_id) === recipeId);
    if (!raw) return;

    let ingredients: IngredientRow[] = [{ name: "", amount: "" }];
    let steps: StepRow[] = [{ description: "" }];
    try {
      if (raw.ingredients) {
        const parsed = JSON.parse(raw.ingredients) as unknown;
        if (Array.isArray(parsed) && parsed.length > 0) ingredients = parsed as IngredientRow[];
      }
    } catch {
      /* ignore */
    }
    try {
      if (raw.steps) {
        const parsed = JSON.parse(raw.steps) as unknown;
        if (Array.isArray(parsed) && parsed.length > 0)
          steps = parsed.map((s: { description: string }) => ({ description: s.description }));
      }
    } catch {
      /* ignore */
    }

    setEditingId(raw.recipe_id);
    setEditingData({
      name: raw.title,
      category: raw.category,
      difficulty: raw.difficulty ?? "easy",
      prepTime: String(raw.cooking_time ?? ""),
      servings: String(raw.servings ?? ""),
      description: raw.description ?? "",
      ingredientsText: ingredientsRowsToText(ingredients),
      stepsText: stepRowsToText(steps),
      tags: (raw.tags ?? []).join(", "),
      image: raw.thumbnail_url ?? "",
    });
  };

  const handleEditRecipe = (recipeData: RecipeFormData) => {
    if (!editingId) return;
    const fd = formPayloadFromRecipeData(recipeData);
    fd.append("intent", "update");
    fd.append("id", String(editingId));
    fetcher.submit(fd, { method: "POST" });
    setEditingId(undefined);
    setEditingData(undefined);
  };

  const handleDelete = (recipeId: string) => {
    if (usingMockData) {
      window.alert(
        "예시 더미 데이터는 삭제할 수 없습니다. 실제 레시피를 등록하면 더미 목록은 표시되지 않습니다.",
      );
      return;
    }
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const fd = new FormData();
    fd.append("intent", "delete");
    fd.append("id", recipeId);
    fetcher.submit(fd, { method: "POST" });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar adminUser={adminUser} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminNavbar />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">레시피 관리</h1>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-gray-600">
                레시피를 추가, 수정, 삭제할 수 있습니다
              </p>
              {usingMockData ? (
                <p className="mt-2 text-xs text-amber-800/90">
                  등록된 데이터가 없을 때는 예시 더미 목록이 표시됩니다. 레시피를 추가하면 실제 데이터만
                  보입니다.
                </p>
              ) : null}
              {usingDemoCategories ? (
                <p className="mt-2 text-xs text-amber-800/90">
                  DB에 레시피 카테고리가 없을 때는 예시 카테고리(가정용·카페 등)가 표시됩니다. 마이그레이션을
                  적용하거나 카테고리 관리에서 항목을 추가하면 실제 데이터로 바뀝니다.
                </p>
              ) : null}
            </div>
            <Button
              className="shrink-0 gap-2 bg-[#02633E] text-white hover:bg-[#014d30]"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              레시피 추가
            </Button>
          </div>

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="레시피명으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-[#02633E]/25 pl-9"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="shrink-0 gap-2 border-[#02633E]/30 text-[#02633E] sm:whitespace-nowrap"
              onClick={() => setCategoryManageOpen(true)}
            >
              <Settings className="h-4 w-4" />
              카테고리 관리
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            {filteredRecipes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center text-sm text-gray-500 shadow-sm">
                {searchQuery.trim() ? "검색 결과가 없습니다." : "등록된 레시피가 없습니다."}
              </div>
            ) : (
              filteredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:items-center md:gap-5 md:p-5"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-4 md:items-center">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 md:h-24 md:w-24">
                      {recipe.image ? (
                        <img
                          src={recipe.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                          <ImageIcon className="h-8 w-8" aria-hidden />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-gray-900">{recipe.title}</h3>
                        <span
                          className={cn(
                            "inline-flex shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-semibold",
                            newsCategoryBadgeClass(categoryColorBySlug.get(recipe.category) ?? "slate"),
                          )}
                        >
                          {getCategoryLabel(recipe.category)}
                        </span>
                        <span className="inline-flex shrink-0 rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-800">
                          {getDifficultyLabel(recipe.difficulty)}
                        </span>
                      </div>

                      {recipe.description ? (
                        <p className="mb-2 line-clamp-2 text-sm text-gray-600">{recipe.description}</p>
                      ) : null}

                      <div className="mb-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        {recipe.cookingTime ? (
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                            <span>{recipe.cookingTime}</span>
                          </div>
                        ) : null}
                        {recipe.servings ? (
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                            <span>{recipe.servings}</span>
                          </div>
                        ) : null}
                      </div>

                      {recipe.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {recipe.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center justify-end gap-1.5 self-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-gray-200 text-gray-600 shadow-sm hover:bg-white hover:text-[#02633E]"
                      onClick={() => handleOpenEdit(recipe.id)}
                      title="수정"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-gray-200 text-gray-600 shadow-sm hover:bg-white hover:text-red-600"
                      onClick={() => handleDelete(recipe.id)}
                      title="삭제"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      <RecipeAddModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddRecipe}
        dbCategories={dbCategories.map((c) => ({ slug: c.slug, name: c.name }))}
      />

      <RecipeAddModal
        open={editingId !== undefined && editingData !== undefined}
        onOpenChange={(o) => {
          if (!o) {
            setEditingId(undefined);
            setEditingData(undefined);
          }
        }}
        onSubmit={handleEditRecipe}
        editId={editingId}
        initialData={editingData}
        dbCategories={dbCategories.map((c) => ({ slug: c.slug, name: c.name }))}
      />

      <RecipeCategoryManageModal
        open={categoryManageOpen}
        onOpenChange={setCategoryManageOpen}
        categories={dbCategories}
        onSubmitCategory={submitCategoryAction}
        demoMode={usingDemoCategories}
      />
    </div>
  );
}
