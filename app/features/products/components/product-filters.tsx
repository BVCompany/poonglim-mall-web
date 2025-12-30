import { Card, CardContent, CardHeader, CardTitle } from "~/core/components/ui/card";
import { Button } from "~/core/components/ui/button";

interface Category {
  id: string;
  name: string;
  count: number;
}

interface ProductFiltersProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export function ProductFilters({ categories, selectedCategory, onCategoryChange }: ProductFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>제품 카테고리</CardTitle>
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
  );
}

