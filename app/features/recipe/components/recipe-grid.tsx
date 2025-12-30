import { Link } from "react-router";
import { Clock, Users, Star, ChefHat } from "lucide-react";
import { Card, CardContent } from "~/core/components/ui/card";
import { Badge } from "~/core/components/ui/badge";

interface Recipe {
  id: number;
  title: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  cookTime: string;
  servings: string;
  rating: number;
  reviewCount: number;
  image: string;
  description: string;
  tags: string[];
}

// Mock recipe data
const allRecipes: Recipe[] = [
  {
    id: 1,
    title: "부드러운 계란찜",
    category: "home",
    difficulty: "easy",
    cookTime: "15분",
    servings: "2-3인분",
    rating: 4.8,
    reviewCount: 124,
    image: "/home/premium_egg.png",
    description: "풍림푸드 액란으로 만드는 부드럽고 맛있는 계란찜",
    tags: ["간단요리", "아이반찬", "단백질"],
  },
  {
    id: 2,
    title: "프리미엄 티라미수",
    category: "cafe",
    difficulty: "medium",
    cookTime: "45분",
    servings: "4인분",
    rating: 4.9,
    reviewCount: 89,
    image: "/home/puding.png",
    description: "카페 수준의 고급 티라미수 만들기",
    tags: ["디저트", "카페메뉴", "고급"],
  },
  {
    id: 3,
    title: "대용량 스크램블에그",
    category: "restaurant",
    difficulty: "easy",
    cookTime: "10분",
    servings: "10인분",
    rating: 4.7,
    reviewCount: 56,
    image: "/home/solution.png",
    description: "외식업체를 위한 대용량 스크램블에그 조리법",
    tags: ["업소용", "대용량", "간편"],
  },
  {
    id: 4,
    title: "홈메이드 푸딩 파르페",
    category: "home",
    difficulty: "easy",
    cookTime: "20분",
    servings: "2인분",
    rating: 4.6,
    reviewCount: 78,
    image: "/home/puding.png",
    description: "집에서 쉽게 만드는 푸딩 파르페",
    tags: ["디저트", "간단", "아이간식"],
  },
  {
    id: 5,
    title: "베이커리 크림빵",
    category: "cafe",
    difficulty: "hard",
    cookTime: "120분",
    servings: "8개",
    rating: 4.8,
    reviewCount: 45,
    image: "/home/puding.png",
    description: "전문 베이커리 수준의 크림빵 만들기",
    tags: ["베이킹", "전문", "크림빵"],
  },
  {
    id: 6,
    title: "업소용 오믈렛",
    category: "restaurant",
    difficulty: "medium",
    cookTime: "8분",
    servings: "1인분",
    rating: 4.5,
    reviewCount: 32,
    image: "/home/premium_egg.png",
    description: "레스토랑 수준의 완벽한 오믈렛",
    tags: ["레스토랑", "오믈렛", "전문"],
  },
];

interface RecipeGridProps {
  selectedCategory: string;
  selectedDifficulty: string;
  searchQuery: string;
}

export function RecipeGrid({ selectedCategory, selectedDifficulty, searchQuery }: RecipeGridProps) {
  const filteredRecipes = allRecipes.filter((recipe) => {
    const matchesCategory = selectedCategory === "all" || recipe.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "all" || recipe.difficulty === selectedDifficulty;
    const matchesSearch =
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "쉬움";
      case "medium":
        return "보통";
      case "hard":
        return "어려움";
      default:
        return difficulty;
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-muted-foreground">총 {filteredRecipes.length}개 레시피</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRecipes.map((recipe) => (
          <Card key={recipe.id} className="group overflow-hidden transition-shadow hover:shadow-lg">
            <div className="relative">
              <img
                src={recipe.image}
                alt={recipe.title}
                className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <Badge className={`absolute left-4 top-4 ${getDifficultyColor(recipe.difficulty)}`}>
                {getDifficultyText(recipe.difficulty)}
              </Badge>
            </div>

            <CardContent className="p-6">
              <h3 className="mb-2 text-xl font-semibold text-foreground">{recipe.title}</h3>
              <p className="mb-4 text-pretty text-muted-foreground">{recipe.description}</p>

              <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{recipe.cookTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{recipe.servings}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current text-yellow-400" />
                  <span>{recipe.rating}</span>
                  <span>({recipe.reviewCount})</span>
                </div>
              </div>

              <div className="mb-4 flex flex-wrap gap-1">
                {recipe.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <Link
                to={`/recipe/${recipe.id}`}
                viewTransition
                className="inline-flex items-center gap-2 font-medium text-primary hover:text-primary/80"
              >
                <ChefHat className="h-4 w-4" />
                레시피 보기
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">검색 조건에 맞는 레시피가 없습니다.</p>
        </div>
      )}
    </div>
  );
}

