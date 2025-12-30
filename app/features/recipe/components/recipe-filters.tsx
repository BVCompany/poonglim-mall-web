import { Card, CardContent, CardHeader, CardTitle } from "~/core/components/ui/card";
import { Button } from "~/core/components/ui/button";

interface Category {
  id: string;
  name: string;
  count: number;
}

interface Difficulty {
  id: string;
  name: string;
}

interface RecipeFiltersProps {
  categories: Category[];
  difficulties: Difficulty[];
  selectedCategory: string;
  selectedDifficulty: string;
  onCategoryChange: (category: string) => void;
  onDifficultyChange: (difficulty: string) => void;
}

export function RecipeFilters({
  categories,
  difficulties,
  selectedCategory,
  selectedDifficulty,
  onCategoryChange,
  onDifficultyChange,
}: RecipeFiltersProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>카테고리</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "ghost"}
              className="w-full justify-between"
              onClick={() => onCategoryChange(category.id)}
            >
              <span>{category.name}</span>
              <span className="text-sm text-muted-foreground">({category.count})</span>
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>난이도</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {difficulties.map((difficulty) => (
            <Button
              key={difficulty.id}
              variant={selectedDifficulty === difficulty.id ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => onDifficultyChange(difficulty.id)}
            >
              {difficulty.name}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

