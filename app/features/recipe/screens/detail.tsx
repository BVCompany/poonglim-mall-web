import { useState } from "react";
import { useParams, Link } from "react-router";
import { Button } from "~/core/components/ui/button";
import { Card, CardContent } from "~/core/components/ui/card";
import { Badge } from "~/core/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/core/components/ui/tabs";
import { Clock, Users, ChefHat, Star, Heart, Share2, Printer as Print, CheckCircle } from "lucide-react";

interface Recipe {
  id: number;
  title: string;
  category: string;
  difficulty: string;
  cookTime: string;
  servings: string;
  rating: number;
  reviewCount: number;
  image: string;
  description: string;
  ingredients: { name: string; amount: string }[];
  instructions: string[];
  tips: string[];
  nutrition: {
    calories: string;
    protein: string;
    fat: string;
    carbs: string;
  };
  tags: string[];
}

// Mock recipe data
const recipeData: Record<number, Recipe> = {
  1: {
    id: 1,
    title: "부드러운 계란찜",
    category: "가정용",
    difficulty: "쉬움",
    cookTime: "15분",
    servings: "2-3인분",
    rating: 4.8,
    reviewCount: 124,
    image: "/home/premium_egg.png",
    description: "풍림푸드 액란으로 만드는 부드럽고 맛있는 계란찜입니다. 간단한 재료로 누구나 쉽게 만들 수 있어요.",
    ingredients: [
      { name: "풍림푸드 액란", amount: "200ml" },
      { name: "물", amount: "100ml" },
      { name: "소금", amount: "약간" },
      { name: "파", amount: "1대" },
      { name: "참기름", amount: "1티스푼" },
    ],
    instructions: [
      "파는 송송 썰어 준비합니다.",
      "볼에 풍림푸드 액란과 물을 넣고 잘 섞어줍니다.",
      "소금으로 간을 맞추고 썰어둔 파를 넣습니다.",
      "찜기에 물을 끓인 후 그릇에 계란물을 부어 넣습니다.",
      "중불에서 12-15분간 쪄줍니다.",
      "완성된 계란찜에 참기름을 살짝 뿌려 마무리합니다.",
    ],
    tips: [
      "계란물을 체에 한 번 걸러주면 더욱 부드러운 식감을 얻을 수 있습니다.",
      "찜기 뚜껑에 면보를 씌우면 물방울이 떨어지는 것을 방지할 수 있어요.",
      "기호에 따라 새우, 버섯 등을 추가해도 좋습니다.",
    ],
    nutrition: {
      calories: "145kcal",
      protein: "12.5g",
      fat: "9.8g",
      carbs: "2.1g",
    },
    tags: ["간단요리", "아이반찬", "단백질"],
  },
};

export default function RecipeDetailScreen() {
  const { id } = useParams();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const recipe = recipeData[Number(id) || 1];

  if (!recipe) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">레시피를 찾을 수 없습니다.</h1>
          <Button asChild>
            <Link to="/recipe/main">레시피 목록으로 돌아가기</Link>
          </Button>
        </div>
      </div>
    );
  }

  const toggleStep = (stepIndex: number) => {
    setCompletedSteps((prev) => (prev.includes(stepIndex) ? prev.filter((i) => i !== stepIndex) : [...prev, stepIndex]));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "쉬움":
        return "bg-green-100 text-green-800";
      case "보통":
        return "bg-yellow-100 text-yellow-800";
      case "어려움":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="py-8">
        <div className="mx-auto max-w-4xl px-6">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              홈
            </Link>{" "}
            &gt;{" "}
            <Link to="/recipe/main" className="hover:text-foreground">
              활용법 & 레시피
            </Link>{" "}
            &gt; <span>{recipe.category}</span> &gt; <span className="text-foreground">{recipe.title}</span>
          </nav>

          {/* Recipe Header */}
          <div className="mb-8">
            <div className="relative mb-6">
              <img src={recipe.image} alt={recipe.title} className="h-80 w-full rounded-lg object-cover" />
              <Badge className={`absolute left-4 top-4 ${getDifficultyColor(recipe.difficulty)}`}>
                {recipe.difficulty}
              </Badge>
            </div>

            <div className="mb-4 flex items-start justify-between">
              <div>
                <h1 className="mb-2 text-balance text-3xl font-bold text-foreground">{recipe.title}</h1>
                <p className="mb-4 text-pretty text-lg text-muted-foreground">{recipe.description}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Print className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mb-6 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span>{recipe.cookTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span>{recipe.servings}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-current text-yellow-400" />
                <span>{recipe.rating}</span>
                <span className="text-muted-foreground">({recipe.reviewCount}개 리뷰)</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Recipe Content */}
          <Tabs defaultValue="ingredients" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="ingredients">재료</TabsTrigger>
              <TabsTrigger value="instructions">조리법</TabsTrigger>
              <TabsTrigger value="tips">팁</TabsTrigger>
              <TabsTrigger value="nutrition">영양정보</TabsTrigger>
            </TabsList>

            <TabsContent value="ingredients" className="mt-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4 text-xl font-semibold">필요한 재료</h3>
                  <div className="space-y-3">
                    {recipe.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex items-center justify-between border-b border-border py-2">
                        <span className="font-medium">{ingredient.name}</span>
                        <span className="text-muted-foreground">{ingredient.amount}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="instructions" className="mt-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4 text-xl font-semibold">조리 과정</h3>
                  <div className="space-y-4">
                    {recipe.instructions.map((instruction, index) => (
                      <div key={index} className="flex gap-4">
                        <button
                          onClick={() => toggleStep(index)}
                          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                            completedSteps.includes(index)
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:border-primary"
                          }`}
                        >
                          {completedSteps.includes(index) ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <span className="text-sm font-medium">{index + 1}</span>
                          )}
                        </button>
                        <div className="flex-1">
                          <p
                            className={`text-pretty ${
                              completedSteps.includes(index) ? "text-muted-foreground line-through" : ""
                            }`}
                          >
                            {instruction}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="mt-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4 text-xl font-semibold">요리 팁</h3>
                  <div className="space-y-4">
                    {recipe.tips.map((tip, index) => (
                      <div key={index} className="flex gap-3">
                        <ChefHat className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                        <p className="text-pretty">{tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="nutrition" className="mt-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4 text-xl font-semibold">영양 정보 (1인분 기준)</h3>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {Object.entries(recipe.nutrition).map(([key, value]) => (
                      <div key={key} className="rounded-lg bg-muted p-4 text-center">
                        <div className="mb-1 text-2xl font-bold text-primary">{value}</div>
                        <div className="text-sm text-muted-foreground">
                          {key === "calories"
                            ? "칼로리"
                            : key === "protein"
                              ? "단백질"
                              : key === "fat"
                                ? "지방"
                                : "탄수화물"}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Related Products */}
          <Card className="mt-8">
            <CardContent className="p-6">
              <h3 className="mb-4 text-xl font-semibold">사용된 풍림푸드 제품</h3>
              <div className="flex items-center gap-4 rounded-lg bg-muted p-4">
                <img src="/home/premium_egg.png" alt="풍림푸드 액란" className="h-16 w-16 rounded object-cover" />
                <div className="flex-1">
                  <h4 className="font-semibold">프리미엄 액란 1L</h4>
                  <p className="text-sm text-muted-foreground">신선하고 안전한 액상 계란</p>
                </div>
                <Button asChild variant="outline">
                  <Link to="/products/liquid-eggs" viewTransition>
                    제품 보기
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

