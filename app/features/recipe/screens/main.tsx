import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RecipeGrid } from "../components/recipe-grid";
import { RecipeFilters } from "../components/recipe-filters";
import { RecipeSearch } from "../components/recipe-search";

const categories = [
  { id: "all", name: "전체 레시피", count: 6 },
  { id: "home", name: "가정용", count: 2 },
  { id: "cafe", name: "카페 & 베이커리", count: 2 },
  { id: "restaurant", name: "외식업체", count: 2 },
];

const difficulties = [
  { id: "all", name: "전체 난이도" },
  { id: "easy", name: "쉬움" },
  { id: "medium", name: "보통" },
  { id: "hard", name: "어려움" },
];

export default function RecipeMainScreen() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="mb-4 text-balance text-4xl font-bold md:text-5xl">
            활용법 & 레시피
          </h1>
          <p className="text-pretty text-xl opacity-90">
            풍림푸드 제품으로 만드는 다양한 요리를 경험해보세요
          </p>
        </div>
      </section>

      {/* Recipes Section with Filters */}
      <section className="bg-background py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Filters Sidebar */}
            <div className="flex-shrink-0 lg:w-64">
              <RecipeFilters
                categories={categories}
                difficulties={difficulties}
                selectedCategory={selectedCategory}
                selectedDifficulty={selectedDifficulty}
                onCategoryChange={setSelectedCategory}
                onDifficultyChange={setSelectedDifficulty}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="mb-8">
                <RecipeSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />
              </div>

              <RecipeGrid
                selectedCategory={selectedCategory}
                selectedDifficulty={selectedDifficulty}
                searchQuery={searchQuery}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
