import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 9; // 3열 × 3행

// ─── 목 데이터 ───────────────────────────────────────────────────────────────
interface Recipe {
  id: number;
  title: string;
  category: string;
  cookTime: string;
  servings: string;
  image: string;
  description: string;
  tags: string[];
}


// ─── 인터페이스 ──────────────────────────────────────────────────────────────
interface DbRecipe {
  recipe_id: number;
  title: string;
  category: string;
  difficulty?: string | null;
  cooking_time?: string | null;
  servings?: string | null;
  thumbnail_url?: string | null;
  description?: string | null;
  tags?: string[] | null;
}

interface RecipeGridProps {
  selectedCategory: string;
  searchQuery: string;
  sortOption?: "recommended" | "latest" | "name";
  dbRecipes?: DbRecipe[];
  selectedDifficulty?: string; // 하위 호환성 유지 (현재 미사용)
}

// ─── 카드 컴포넌트 ────────────────────────────────────────────────────────────
function RecipeCard({ recipe }: { recipe: Recipe }) {
  const [imgError, setImgError] = useState(false);

  const hasMeta = (recipe.cookTime && recipe.cookTime !== "-") ||
                  (recipe.servings && recipe.servings !== "-");

  const servingsDisplay =
    recipe.servings && recipe.servings !== "-"
      ? recipe.servings.replace(/~/g, "-")
      : "";

  return (
    <Link
      to={`/recipe/${recipe.id}`}
      viewTransition
      className="group block md:rounded-[40px] md:bg-[#EAE3C9] md:p-[2px]"
    >
      <div className="relative aspect-square overflow-hidden rounded-[13px] bg-gray-200 md:rounded-[30px]">
        <img
          src={imgError ? "/home/premium_egg.png" : recipe.image}
          alt={recipe.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgError(true)}
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/80 via-black/40 to-transparent md:inset-0 md:h-full md:from-black/50 md:via-black/15 md:via-55% md:to-transparent" />

        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 px-2.5 pb-2.5 pt-2 md:gap-6 md:p-10">
          <div className="flex flex-col gap-3">
            <h3
              className="mb-0 inline-block max-w-full rounded-[13px] px-2 py-1 leading-snug text-white md:mb-0 md:rounded-[40px] md:px-5 md:py-2.5"
              style={{
                fontSize: "15px",
                fontFamily: "NanumSquareRound, sans-serif",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                backgroundColor: "rgba(0,0,0,0.20)",
              }}
            >
              <span className="md:hidden">{recipe.title}</span>
              <span
                className="hidden md:inline md:text-2xl md:leading-9"
                style={{ fontFamily: "NanumSquareRound, sans-serif" }}
              >
                {recipe.title}
              </span>
            </h3>

            <p
              className="line-clamp-2 text-white/90 md:line-clamp-1 md:text-white"
              style={{
                fontSize: "12px",
                fontFamily: "NanumSquareRound, sans-serif",
                fontWeight: 700,
                letterSpacing: "-0.01em",
              }}
            >
              <span className="md:hidden">{recipe.description}</span>
              <span className="hidden md:inline md:text-sm md:uppercase md:leading-[21px]">
                {recipe.description}
              </span>
            </p>
          </div>

          {hasMeta && (
            <div className="flex items-center gap-2.5 text-white md:px-5">
              {recipe.cookTime && recipe.cookTime !== "-" && (
                <span
                  className="text-[10px] md:text-sm md:uppercase md:leading-[19.6px]"
                  style={{ fontFamily: "NanumSquareRound, sans-serif", fontWeight: 400 }}
                >
                  {recipe.cookTime}
                </span>
              )}
              {recipe.cookTime &&
                recipe.cookTime !== "-" &&
                recipe.servings &&
                recipe.servings !== "-" && (
                  <span
                    className="text-[10px] leading-[14px] md:text-[10px]"
                    style={{ fontFamily: "NanumSquareRound, sans-serif", fontWeight: 400 }}
                    aria-hidden
                  >
                    |
                  </span>
                )}
              {recipe.servings && recipe.servings !== "-" && (
                <span
                  className="text-[10px] md:text-sm md:uppercase md:leading-[19.6px]"
                  style={{ fontFamily: "NanumSquareRound, sans-serif", fontWeight: 400 }}
                >
                  {servingsDisplay}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── 그리드 컴포넌트 ──────────────────────────────────────────────────────────
export function RecipeGrid({
  selectedCategory,
  searchQuery,
  sortOption = "recommended",
  dbRecipes = [],
}: RecipeGridProps) {
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [slideDir, setSlideDir] = useState<"next" | "prev">("next");
  const [animKey, setAnimKey] = useState(0);
  const prevFilter = useRef("");

  const source: Recipe[] = dbRecipes.map((r) => ({
    id: r.recipe_id,
    title: r.title,
    category: r.category,
    cookTime: r.cooking_time ?? "-",
    servings: r.servings ?? "-",
    image: r.thumbnail_url ?? "/home/premium_egg.png",
    description: r.description ?? "",
    tags: r.tags ?? [],
  }));

  const filtered = source.filter((r) => {
    const matchCat = selectedCategory === "all" || r.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortOption === "latest") return b.id - a.id;
    if (sortOption === "name") {
      const loc = i18n.language.startsWith("ko") ? "ko" : "en";
      return a.title.localeCompare(b.title, loc);
    }
    return 0;
  });

  // 카테고리·검색·정렬 변경 시 1페이지 리셋
  const filterKey = `${selectedCategory}__${searchQuery}__${sortOption}`;
  useEffect(() => {
    if (prevFilter.current !== filterKey) {
      prevFilter.current = filterKey;
      setCurrentPage(1);
      setSlideDir("next");
      setAnimKey((k) => k + 1);
    }
  }, [filterKey]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageItems = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const goPage = (page: number, dir: "next" | "prev") => {
    setSlideDir(dir);
    setCurrentPage(page);
    setAnimKey((k) => k + 1);
  };

  if (source.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-base text-gray-500">{t("empty.recipes")}</p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="py-20 text-center">
        <Search className="mx-auto mb-3 h-10 w-10 text-gray-300" />
        <p className="text-gray-500">{t("pages.recipes.grid.emptySearch")}</p>
      </div>
    );
  }

  const slideInStyle = slideDir === "next"
    ? { animation: "recipeSlideInFromRight 0.35s cubic-bezier(0.25,0.46,0.45,0.94) both" }
    : { animation: "recipeSlideInFromLeft 0.35s cubic-bezier(0.25,0.46,0.45,0.94) both" };

  return (
    <div>
      <style>{`
        @keyframes recipeSlideInFromRight {
          from { opacity: 0; transform: translateX(60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes recipeSlideInFromLeft {
          from { opacity: 0; transform: translateX(-60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* 레시피 그리드 — 3열, 정사각 카드 */}
      <div
        key={animKey}
        style={slideInStyle}
        className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-5"
      >
        {pageItems.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>

      {/* 페이지네이션 — 메인 슬라이드 네비와 동일한 디자인 */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center gap-3">
          <div className="inline-flex overflow-hidden rounded-full bg-white md:rounded-none">
            <button
              type="button"
              onClick={() => currentPage > 1 && goPage(currentPage - 1, "prev")}
              disabled={currentPage <= 1}
              className="flex h-10 w-10 items-center justify-center text-[#003F2B] transition-colors hover:bg-[#EAE3C9]/50 disabled:cursor-not-allowed disabled:opacity-30 md:h-[52px] md:w-[52px] md:rounded-bl-[40px] md:rounded-tl-[40px] md:bg-[#F0EEDD] md:hover:bg-[#E8E4D4]"
              aria-label={t("pages.recipes.grid.prevPage")}
            >
              <ChevronLeft className="h-5 w-5 md:h-[18px] md:w-[18px] md:text-[#02633E]" strokeWidth={2.5} />
            </button>
            <div className="w-px shrink-0 bg-[#EAE3C9] md:bg-[#E2E0D0]" aria-hidden />
            <button
              type="button"
              onClick={() => currentPage < totalPages && goPage(currentPage + 1, "next")}
              disabled={currentPage >= totalPages}
              className="flex h-10 w-10 items-center justify-center text-[#003F2B] transition-colors hover:bg-[#EAE3C9]/50 disabled:cursor-not-allowed disabled:opacity-30 md:h-[52px] md:w-[52px] md:rounded-br-[40px] md:rounded-tr-[40px] md:bg-[#F0EEDD] md:hover:bg-[#E8E4D4]"
              aria-label={t("pages.recipes.grid.nextPage")}
            >
              <ChevronRight className="h-5 w-5 md:h-[18px] md:w-[18px] md:text-[#02633E]" strokeWidth={2.5} />
            </button>
          </div>
          <span className="text-sm text-gray-500 md:hidden">
            <span className="font-bold text-[#003F2B]">{currentPage}</span>
            {" / "}
            {totalPages}
          </span>
        </div>
      )}
    </div>
  );
}
