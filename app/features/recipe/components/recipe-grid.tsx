import { useState, useEffect, useRef } from "react";
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

const MOCK_RECIPES: Recipe[] = [
  { id: 1,  title: "프리미엄 티라미수",        category: "dessert",    cookTime: "45분", servings: "4인분",   image: "/recipe/recipe01.png", description: "카페 수준의 고급 티라미수 만들기",            tags: ["디저트", "카페메뉴", "고급"] },
  { id: 2,  title: "부드러운 계란찜",           category: "easy",       cookTime: "15분", servings: "2~3인분", image: "/recipe/recipe02.png", description: "풍림 액란으로 만드는 부드럽고 맛있는 계란찜", tags: ["간단요리", "아이반찬", "단백질"] },
  { id: 3,  title: "부드러운 계란말이",         category: "easy",       cookTime: "10분", servings: "2인분",   image: "/recipe/recipe03.png", description: "촉촉하고 부드러운 프리미엄 계란말이",          tags: ["간단요리", "도시락", "단백질"] },
  { id: 4,  title: "베리 스트로베리 푸딩",      category: "dessert",    cookTime: "30분", servings: "2인분",   image: "/recipe/recipe04.png", description: "상큼한 딸기와 부드러운 푸딩의 조화",           tags: ["디저트", "딸기", "프리미엄"] },
  { id: 5,  title: "불장닭 떡볶이",             category: "easy",       cookTime: "20분", servings: "2~3인분", image: "/recipe/recipe05.png", description: "진한 불맛과 쫄깃한 떡의 환상 조합",            tags: ["매운맛", "떡볶이", "간편식"] },
  { id: 6,  title: "에그샐러드 김밥",           category: "easy",       cookTime: "25분", servings: "2인분",   image: "/recipe/recipe06.png", description: "에그샐러드를 가득 넣은 든든한 한 줄 김밥",     tags: ["도시락", "간편식", "한끼"] },
  { id: 7,  title: "홈메이드 푸딩",             category: "dessert",    cookTime: "20분", servings: "4인분",   image: "/recipe/recipe07.png", description: "집에서 쉽게 만드는 커스터드 푸딩",              tags: ["디저트", "간단", "아이간식"] },
  { id: 8,  title: "부서지는 에그샐러드",       category: "easy",       cookTime: "15분", servings: "2인분",   image: "/recipe/recipe08.png", description: "부드럽게 퍼지는 에그샐러드로 만드는 샌드위치",  tags: ["샌드위치", "브런치", "간편"] },
  { id: 9,  title: "부드러운 에그샐러드",       category: "easy",       cookTime: "10분", servings: "2인분",   image: "/recipe/recipe09.png", description: "풍림 에그샐러드 활용 레시피",                   tags: ["샌드위치", "간편", "아침"] },
  { id: 10, title: "대용량 스크램블에그",       category: "restaurant", cookTime: "10분", servings: "10인분",  image: "/recipe/recipe01.png", description: "외식업체를 위한 대용량 스크램블에그 조리법",    tags: ["업소용", "대용량", "간편"] },
  { id: 11, title: "베이커리 크림빵",           category: "dessert",    cookTime: "120분", servings: "8개",    image: "/recipe/recipe02.png", description: "전문 베이커리 수준의 크림빵 만들기",            tags: ["베이킹", "전문", "크림빵"] },
  { id: 12, title: "업소용 오믈렛",             category: "restaurant", cookTime: "8분",  servings: "1인분",   image: "/recipe/recipe03.png", description: "레스토랑 수준의 완벽한 오믈렛",                 tags: ["레스토랑", "오믈렛", "전문"] },
  { id: 13, title: "에그 수프",                 category: "restaurant", cookTime: "20분", servings: "4인분",   image: "/recipe/recipe04.png", description: "진한 육수에 풍림 액란을 풀어 넣은 고급 수프",   tags: ["수프", "레스토랑", "고급"] },
  { id: 14, title: "카스텔라 케이크",           category: "dessert",    cookTime: "60분", servings: "8인분",   image: "/recipe/recipe05.png", description: "촉촉하고 부드러운 수제 카스텔라",               tags: ["베이킹", "케이크", "카페"] },
  { id: 15, title: "에그 토스트",               category: "easy",       cookTime: "8분",  servings: "1인분",   image: "/recipe/recipe06.png", description: "바쁜 아침을 위한 간편 에그 토스트",             tags: ["아침", "토스트", "간편"] },
];

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

  return (
    <Link
      to={`/recipe/${recipe.id}`}
      viewTransition
      className="group relative block aspect-square overflow-hidden rounded-2xl bg-gray-200"
    >
      {/* 이미지 — 카드 전체 커버 */}
      <img
        src={imgError ? "/home/premium_egg.png" : recipe.image}
        alt={recipe.title}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        onError={() => setImgError(true)}
      />

      {/* 하단 그라데이션 오버레이 */}
      <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* 하단 텍스트 영역 */}
      <div className="absolute inset-x-0 bottom-0 px-5 pb-5 pt-3">
        {/* 제목 — black/20% 배경 + 라운드 */}
        <h3
          className="mb-2 inline-block rounded-lg px-2.5 py-1 font-bold leading-snug text-white"
          style={{
            fontSize: "clamp(15px, 1.4vw, 19px)",
            letterSpacing: "-0.02em",
            backgroundColor: "rgba(0,0,0,0.20)",
          }}
        >
          {recipe.title}
        </h3>

        {/* 설명 */}
        <p
          className="mb-2.5 line-clamp-1 text-white/75"
          style={{ fontSize: "clamp(11px, 1vw, 13px)", letterSpacing: "-0.01em" }}
        >
          {recipe.description}
        </p>

        {/* 시간 | 인분 */}
        {hasMeta && (
          <div className="flex items-center gap-0 text-white/65" style={{ fontSize: "clamp(11px, 1vw, 13px)" }}>
            {recipe.cookTime && recipe.cookTime !== "-" && (
              <span>{recipe.cookTime}</span>
            )}
            {recipe.cookTime && recipe.cookTime !== "-" && recipe.servings && recipe.servings !== "-" && (
              <span className="mx-2 h-3 w-px bg-white/40" aria-hidden />
            )}
            {recipe.servings && recipe.servings !== "-" && (
              <span>{recipe.servings}</span>
            )}
          </div>
        )}
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
  const [currentPage, setCurrentPage] = useState(1);
  const [slideDir, setSlideDir] = useState<"next" | "prev">("next");
  const [animKey, setAnimKey] = useState(0);
  const prevFilter = useRef("");

  const source: Recipe[] = dbRecipes.length > 0
    ? dbRecipes.map((r) => ({
        id: r.recipe_id,
        title: r.title,
        category: r.category,
        cookTime: r.cooking_time ?? "-",
        servings: r.servings ?? "-",
        image: r.thumbnail_url ?? "/home/premium_egg.png",
        description: r.description ?? "",
        tags: r.tags ?? [],
      }))
    : MOCK_RECIPES;

  const filtered = source.filter((r) => {
    const matchCat = selectedCategory === "all" || r.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortOption === "latest") return b.id - a.id;
    if (sortOption === "name") return a.title.localeCompare(b.title, "ko");
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

  if (filtered.length === 0) {
    return (
      <div className="py-20 text-center">
        <Search className="mx-auto mb-3 h-10 w-10 text-gray-300" />
        <p className="text-gray-500">검색 결과가 없습니다.</p>
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
        className="grid grid-cols-2 gap-4 md:grid-cols-3"
      >
        {pageItems.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>

      {/* 페이지네이션 — 메인 슬라이드 네비와 동일한 디자인 */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center gap-3">
          <div className="inline-flex overflow-hidden rounded-full bg-white">
            <button
              onClick={() => currentPage > 1 && goPage(currentPage - 1, "prev")}
              disabled={currentPage <= 1}
              className="flex h-10 w-10 items-center justify-center text-[#003F2B] transition-colors hover:bg-[#F4F2E5]/50 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="이전 페이지"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="w-px shrink-0 bg-[#EAE3C9]" aria-hidden />
            <button
              onClick={() => currentPage < totalPages && goPage(currentPage + 1, "next")}
              disabled={currentPage >= totalPages}
              className="flex h-10 w-10 items-center justify-center text-[#003F2B] transition-colors hover:bg-[#F4F2E5]/50 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="다음 페이지"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <span className="text-sm text-gray-500">
            <span className="font-bold text-[#003F2B]">{currentPage}</span>
            {" / "}
            {totalPages}
          </span>
        </div>
      )}
    </div>
  );
}
