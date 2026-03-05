/**
 * Recipe Add Modal Component
 * 
 * Modal for adding new recipes in admin panel.
 */

import { useState } from "react";
import { Button } from "~/core/components/ui/button";
import { ImageUpload } from "~/core/components/image-upload";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import { Textarea } from "~/core/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/core/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/core/components/ui/select";
import type { RecipeCategory, RecipeDifficulty } from "../types/recipe.types";

interface RecipeAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (recipe: RecipeFormData) => void;
}

export interface RecipeFormData {
  name: string;
  category: RecipeCategory;
  difficulty: RecipeDifficulty;
  prepTime: string;
  servings: string;
  description: string;
  ingredients: string;
  instructions: string;
  tags: string;
  image?: string;
}

const CATEGORY_OPTIONS: { value: RecipeCategory; label: string }[] = [
  { value: "home", label: "가정용" },
  { value: "cafe", label: "카페/베이커리" },
  { value: "restaurant", label: "레스토랑" },
];

const DIFFICULTY_OPTIONS: { value: RecipeDifficulty; label: string }[] = [
  { value: "easy", label: "쉬움" },
  { value: "medium", label: "보통" },
  { value: "hard", label: "어려움" },
];

export function RecipeAddModal({
  open,
  onOpenChange,
  onSubmit,
}: RecipeAddModalProps) {
  const [formData, setFormData] = useState<RecipeFormData>({
    name: "",
    category: "home",
    difficulty: "easy",
    prepTime: "",
    servings: "",
    description: "",
    ingredients: "",
    instructions: "",
    tags: "",
    image: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const recipeData: RecipeFormData = {
      ...formData,
      image: formData.image || undefined,
    };

    onSubmit(recipeData);

    // Reset form
    setFormData({
      name: "",
      category: "home",
      difficulty: "easy",
      prepTime: "",
      servings: "",
      description: "",
      ingredients: "",
      instructions: "",
      tags: "",
      image: "",
    });
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      name: "",
      category: "home",
      difficulty: "easy",
      prepTime: "",
      servings: "",
      description: "",
      ingredients: "",
      instructions: "",
      tags: "",
      image: "",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">새 레시피 추가</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Recipe Name */}
          <div className="space-y-2">
            <Label htmlFor="name">레시피명</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="레시피 이름을 입력하세요"
              required
            />
          </div>

          {/* Category & Difficulty */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">카테고리</Label>
              <Select
                value={formData.category}
                onValueChange={(value: RecipeCategory) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">난이도</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value: RecipeDifficulty) =>
                  setFormData({ ...formData, difficulty: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="난이도 선택" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Prep Time & Servings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prepTime">조리시간</Label>
              <Input
                id="prepTime"
                value={formData.prepTime}
                onChange={(e) =>
                  setFormData({ ...formData, prepTime: e.target.value })
                }
                placeholder="15분"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="servings">인분</Label>
              <Input
                id="servings"
                value={formData.servings}
                onChange={(e) =>
                  setFormData({ ...formData, servings: e.target.value })
                }
                placeholder="2인분"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="레시피에 대한 간단한 설명을 입력하세요"
              rows={3}
              required
            />
          </div>

          {/* Ingredients */}
          <div className="space-y-2">
            <Label htmlFor="ingredients">재료</Label>
            <Textarea
              id="ingredients"
              value={formData.ingredients}
              onChange={(e) =>
                setFormData({ ...formData, ingredients: e.target.value })
              }
              placeholder="재료를 줄표로 구분하여 입력하세요"
              rows={4}
              required
            />
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">조리방법</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) =>
                setFormData({ ...formData, instructions: e.target.value })
              }
              placeholder="각 단계를 줄바꿈으로 구분하여 입력하세요"
              rows={5}
              required
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">태그 (쉼표로 구분)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              placeholder="간편, 아침식사, 도시락"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>대표 이미지</Label>
            <ImageUpload
              bucket="media"
              folder="recipes"
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
              aspectRatio="4/3"
              hint="JPG, PNG, WebP 최대 10MB"
            />
            <Input
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="또는 이미지 URL 직접 입력"
              className="text-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-[#204E3A] hover:bg-[#1a3f2e]"
            >
              추가
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              취소
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

