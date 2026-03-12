import { useState } from "react";
import { Link, data } from "react-router";
import type { Route } from "./+types/detail";
import { getRecipeById } from "../lib/queries.server";
import { ChevronRight } from "lucide-react";

// ─── 목 데이터 (DB 연결 전 테스트용) ─────────────────────────────────────────
interface MockRecipe {
  recipe_id: number;
  title: string;
  category: string;
  cooking_time?: number;
  servings?: number;
  difficulty?: string;
  thumbnail_url?: string;
  description?: string;
  tags?: string[];
  ingredients?: string; // JSON: [{name, amount}]
  steps?: string;       // JSON: [{step, description}]
  is_active: boolean;
}

const MOCK_MAP: Record<number, MockRecipe> = {
  1: {
    recipe_id: 1, title: "프리미엄 티라미수", category: "dessert", cooking_time: 45, servings: 4,
    thumbnail_url: "/recipe/recipe01.png",
    description: "카페 수준의 고급 티라미수 만들기. 풍림 계란으로 더욱 진하고 부드러운 티라미수를 완성하세요.",
    tags: ["디저트", "카페메뉴", "고급"],
    ingredients: JSON.stringify([
      { name: "풍림푸드 액란", amount: "3개분" },
      { name: "마스카포네 치즈", amount: "250g" },
      { name: "설탕", amount: "60g" },
      { name: "에스프레소", amount: "150ml" },
      { name: "레이디핑거 비스킷", amount: "20개" },
      { name: "코코아 파우더", amount: "적당량" },
    ]),
    steps: JSON.stringify([
      { step: 1, description: "계란 노른자와 설탕을 볼에 넣고 하얗게 될 때까지 잘 저어줍니다." },
      { step: 2, description: "마스카포네 치즈를 넣고 부드럽게 섞어줍니다." },
      { step: 3, description: "계란 흰자를 거품기로 단단하게 휘핑합니다." },
      { step: 4, description: "크림 혼합물에 흰자 거품을 살살 접어 섞습니다." },
      { step: 5, description: "레이디핑거를 에스프레소에 살짝 적셔 용기 바닥에 깔아줍니다." },
      { step: 6, description: "크림 혼합물을 올리고 코코아 파우더를 뿌려 냉장 보관합니다." },
    ]),
    is_active: true,
  },
  2: {
    recipe_id: 2, title: "부드러운 계란찜", category: "easy", cooking_time: 15, servings: 3,
    thumbnail_url: "/recipe/recipe02.png",
    description: "풍림푸드 액란으로 만드는 부드럽고 맛있는 계란찜입니다. 간단한 재료로 누구나 쉽게 만들 수 있어요.",
    tags: ["가정용", "2~3인분"],
    ingredients: JSON.stringify([
      { name: "풍림푸드 액란", amount: "200ml" },
      { name: "물", amount: "100ml" },
      { name: "소금", amount: "약간" },
      { name: "파", amount: "1대" },
      { name: "참기름", amount: "1티스푼" },
    ]),
    steps: JSON.stringify([
      { step: 1, description: "파는 송송 썰어 준비합니다." },
      { step: 2, description: "볼에 풍림푸드 액란과 물을 넣고 잘 섞어줍니다." },
      { step: 3, description: "소금으로 간을 맞추고 썰어둔 파를 넣습니다." },
      { step: 4, description: "찜기에 물을 끓인 후 그릇에 계란물을 부어 넣습니다." },
      { step: 5, description: "중불에서 12-15분간 쪄줍니다." },
      { step: 6, description: "완성된 계란찜에 참기름을 살짝 뿌려 마무리합니다." },
    ]),
    is_active: true,
  },
  3: { recipe_id: 3, title: "부드러운 계란말이", category: "easy", cooking_time: 10, servings: 2, thumbnail_url: "/recipe/recipe03.png", description: "촉촉하고 부드러운 프리미엄 계란말이", tags: ["간단요리", "도시락"], ingredients: JSON.stringify([{ name: "풍림푸드 액란", amount: "150ml" }, { name: "소금", amount: "약간" }, { name: "식용유", amount: "적당량" }]), steps: JSON.stringify([{ step: 1, description: "액란에 소금으로 간을 합니다." }, { step: 2, description: "팬에 기름을 두르고 약불로 달굽니다." }, { step: 3, description: "계란물을 조금씩 부으며 말아줍니다." }, { step: 4, description: "완성 후 먹기 좋게 썰어 냅니다." }]), is_active: true },
  4: { recipe_id: 4, title: "베리 스트로베리 푸딩", category: "dessert", cooking_time: 30, servings: 2, thumbnail_url: "/recipe/recipe04.png", description: "상큼한 딸기와 부드러운 푸딩의 조화", tags: ["디저트", "딸기"], ingredients: JSON.stringify([{ name: "풍림푸드 푸딩", amount: "2개" }, { name: "딸기", amount: "10개" }, { name: "딸기잼", amount: "2큰술" }]), steps: JSON.stringify([{ step: 1, description: "딸기를 깨끗이 씻어 반으로 자릅니다." }, { step: 2, description: "푸딩 위에 딸기잼을 살짝 올립니다." }, { step: 3, description: "딸기를 예쁘게 올려 완성합니다." }]), is_active: true },
  5: { recipe_id: 5, title: "불장닭 떡볶이", category: "easy", cooking_time: 20, servings: 3, thumbnail_url: "/recipe/recipe05.png", description: "진한 불맛과 쫄깃한 떡의 환상 조합", tags: ["매운맛", "떡볶이"], ingredients: JSON.stringify([{ name: "떡", amount: "300g" }, { name: "풍림 계란", amount: "2개" }, { name: "불장닭 소스", amount: "3큰술" }, { name: "물", amount: "200ml" }]), steps: JSON.stringify([{ step: 1, description: "떡을 물에 불려 준비합니다." }, { step: 2, description: "팬에 소스와 물을 넣고 끓입니다." }, { step: 3, description: "떡을 넣고 소스가 배도록 조려줍니다." }, { step: 4, description: "계란을 반숙으로 삶아 올려 마무리합니다." }]), is_active: true },
};

// ─── 타입 ─────────────────────────────────────────────────────────────────────
interface Ingredient { name: string; amount: string; }
interface Step       { step: number; description: string; }

const CATEGORY_LABELS: Record<string, string> = {
  easy: "가정용", dessert: "카페 & 베이커리", restaurant: "외식업체",
};

// ─── meta ────────────────────────────────────────────────────────────────────
export const meta: Route.MetaFunction = ({ data }) => {
  const title = (data as any)?.recipe?.title ?? "레시피 상세";
  return [
    { title: `${title} | 풍림푸드` },
    { name: "description", content: (data as any)?.recipe?.description ?? "" },
  ];
};

// ─── loader ───────────────────────────────────────────────────────────────────
export async function loader({ params }: Route.LoaderArgs) {
  const id = Number(params.id);
  if (!id) throw data("Not Found", { status: 404 });

  const dbRecipe = await getRecipeById(id).catch(() => null);
  if (dbRecipe && dbRecipe.is_active) return { recipe: dbRecipe, isMock: false };

  const mock = MOCK_MAP[id];
  if (mock) return { recipe: mock as any, isMock: true };

  throw data("Not Found", { status: 404 });
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default function RecipeDetailScreen({ loaderData }: Route.ComponentProps) {
  const { recipe } = loaderData;
  const [imgError, setImgError] = useState(false);

  // 재료 파싱
  const ingredients: Ingredient[] = (() => {
    try { return JSON.parse(recipe.ingredients ?? "[]") as Ingredient[]; }
    catch { return []; }
  })();

  // 만드는 법 파싱
  const steps: Step[] = (() => {
    try { return JSON.parse(recipe.steps ?? "[]") as Step[]; }
    catch { return []; }
  })();

  const cookTime  = recipe.cooking_time ? `${recipe.cooking_time}분` : null;
  const servings  = recipe.servings ? `${recipe.servings}인분` : null;
  const tags: string[] = recipe.tags ?? [];
  const categoryLabel = CATEGORY_LABELS[recipe.category] ?? recipe.category;

  return (
    <div className="min-h-screen bg-[#F5F2EB]">

      {/* ── 브레드크럼 — 네비바 로고 좌측 정렬 ── */}
      <div className="mx-auto w-full max-w-[1680px] px-3 pb-2 pt-6 sm:px-4 md:px-6 lg:px-10">
        <nav className="flex items-center gap-1 text-xs text-gray-400">
          <Link to="/" className="transition-colors hover:text-gray-600">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/recipe/main" className="transition-colors hover:text-gray-600">레시피</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-500">{categoryLabel}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-700">{recipe.title}</span>
        </nav>
      </div>

      {/* ── 본문 ── */}
      <div className="mx-auto max-w-[560px] space-y-4 px-4 pb-20">

        {/* ① 이미지 카드 */}
        <div className="aspect-square w-full overflow-hidden rounded-3xl">
          <img
            src={imgError ? "/home/premium_egg.png" : (recipe.thumbnail_url ?? "/home/premium_egg.png")}
            alt={recipe.title}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        </div>

        {/* ② 레시피 정보 카드 */}
        <div className="mt-8 rounded-3xl p-7" style={{ backgroundColor: "#EAE3C9" }}>

          {/* 제목 */}
          <h1
            className="mb-3 flex items-start gap-2 font-extrabold leading-tight"
            style={{ fontSize: "clamp(20px, 4vw, 26px)", letterSpacing: "-0.03em", color: "#003F2B" }}
          >
            <img src="/home/product-star.png" alt="" className="mt-0.5 h-5 w-5 flex-shrink-0 object-contain" />
            {recipe.title}
          </h1>

          {/* 설명 */}
          {recipe.description && (
            <p className="mb-4 text-sm leading-relaxed" style={{ color: "#003F2B" }}>
              {recipe.description}
            </p>
          )}

          {/* 태그 — 카테고리 + 인분 포함 */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categoryLabel && (
              <span
                className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium"
                style={{ borderColor: "#00000020", backgroundColor: "#ffffff", color: "#000000" }}
              >
                {categoryLabel}
              </span>
            )}
            {cookTime && (
              <span
                className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium"
                style={{ borderColor: "#00000020", backgroundColor: "#ffffff", color: "#000000" }}
              >
                {cookTime}
              </span>
            )}
            {servings && (
              <span
                className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium"
                style={{ borderColor: "#00000020", backgroundColor: "#ffffff", color: "#000000" }}
              >
                {servings}
              </span>
            )}
            {tags.map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                style={{ backgroundColor: "#003F2B18", color: "#003F2B", letterSpacing: "-0.02em" }}
              >
                {tag.startsWith("#") ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        </div>

        {/* ③ 재료 카드 */}
        {ingredients.length > 0 && (
          <div className="overflow-hidden rounded-3xl" style={{ backgroundColor: "#EAE3C9" }}>
            <div className="px-7 py-5">
              <h2 className="font-bold" style={{ fontSize: "16px", letterSpacing: "-0.03em", color: "#003F2B" }}>
                재료
              </h2>
            </div>
            <table className="w-full">
              <tbody>
                {ingredients.map((ing, i) => (
                  <>
                    <tr key={`row-${i}`}>
                      <td className="px-7 py-4 text-sm font-medium" style={{ color: "#003F2B", letterSpacing: "-0.02em" }}>
                        {ing.name}
                      </td>
                      <td className="px-7 py-4 text-right text-sm" style={{ color: "#003F2B", letterSpacing: "-0.02em" }}>
                        {ing.amount}
                      </td>
                    </tr>
                    {i < ingredients.length - 1 && (
                      <tr key={`sep-${i}`}>
                        <td colSpan={2} className="px-7 py-0">
                          <div className="h-px bg-white/60" />
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ④ 만드는 법 — 페이지 배경에 녹아드는 섹션 (카드 없음) */}
        {steps.length > 0 && (
          <div className="px-1 pb-2">
            <h2 className="mb-4 font-bold" style={{ fontSize: "16px", letterSpacing: "-0.03em", color: "#003F2B" }}>
              만드는 법
            </h2>
            <ol className="space-y-1">
              {steps.map((s, i) => (
                <li key={i} className="flex gap-4 py-2.5">
                  {/* 번호 뱃지 */}
                  <span
                    className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: "#003F2B" }}
                  >
                    {s.step ?? i + 1}
                  </span>
                  {/* 설명 */}
                  <p className="flex-1 text-sm leading-relaxed" style={{ color: "#003F2B", letterSpacing: "-0.015em" }}>
                    {s.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* 목록으로 */}
        <div className="pt-2 text-center">
          <Link
            to="/recipe/main"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-[#02633E]"
          >
            ← 레시피 목록으로 돌아가기
          </Link>
        </div>

      </div>
    </div>
  );
}
