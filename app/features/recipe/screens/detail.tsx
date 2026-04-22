import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, data, redirect } from "react-router";
import type { Route } from "./+types/detail";
import { normalizeContentLocale } from "~/core/db/content-locale.server";
import {
  getRecipeById,
  getRecipeSiblingByLocale,
  hasAnyActiveRecipes,
} from "../lib/queries.server";
import { Clock3, Users } from "lucide-react";
import { Breadcrumb } from "~/core/components/breadcrumb";
import { SECTION_VIEWPORT_BLEED } from "~/core/lib/section-viewport-bleed";
import { cn } from "~/core/lib/utils";
import { SectionPageTitle } from "~/core/components/section-title-star";
import i18next from "~/core/lib/i18next.server";
import { pc1920 } from "~/core/lib/pc-fluid";

// ─── 목 데이터 (DB 연결 전 테스트용) ─────────────────────────────────────────
interface MockRecipe {
  recipe_id: number;
  title: string;
  category: string;
  cooking_time?: string;
  servings?: string;
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
    recipe_id: 1, title: "프리미엄 티라미수", category: "dessert", cooking_time: "45분", servings: "4인분",
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
    recipe_id: 2, title: "부드러운 계란찜", category: "easy", cooking_time: "15분", servings: "2~3인분",
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
  3: { recipe_id: 3, title: "부드러운 계란말이", category: "easy", cooking_time: "10분", servings: "2인분", thumbnail_url: "/recipe/recipe03.png", description: "촉촉하고 부드러운 프리미엄 계란말이", tags: ["간단요리", "도시락"], ingredients: JSON.stringify([{ name: "풍림푸드 액란", amount: "150ml" }, { name: "소금", amount: "약간" }, { name: "식용유", amount: "적당량" }]), steps: JSON.stringify([{ step: 1, description: "액란에 소금으로 간을 합니다." }, { step: 2, description: "팬에 기름을 두르고 약불로 달굽니다." }, { step: 3, description: "계란물을 조금씩 부으며 말아줍니다." }, { step: 4, description: "완성 후 먹기 좋게 썰어 냅니다." }]), is_active: true },
  4: { recipe_id: 4, title: "베리 스트로베리 푸딩", category: "dessert", cooking_time: "30분", servings: "2인분", thumbnail_url: "/recipe/recipe04.png", description: "상큼한 딸기와 부드러운 푸딩의 조화", tags: ["디저트", "딸기"], ingredients: JSON.stringify([{ name: "풍림푸드 푸딩", amount: "2개" }, { name: "딸기", amount: "10개" }, { name: "딸기잼", amount: "2큰술" }]), steps: JSON.stringify([{ step: 1, description: "딸기를 깨끗이 씻어 반으로 자릅니다." }, { step: 2, description: "푸딩 위에 딸기잼을 살짝 올립니다." }, { step: 3, description: "딸기를 예쁘게 올려 완성합니다." }]), is_active: true },
  5: { recipe_id: 5, title: "불장닭 떡볶이", category: "easy", cooking_time: "20분", servings: "2~3인분", thumbnail_url: "/recipe/recipe05.png", description: "진한 불맛과 쫄깃한 떡의 환상 조합", tags: ["매운맛", "떡볶이"], ingredients: JSON.stringify([{ name: "떡", amount: "300g" }, { name: "풍림 계란", amount: "2개" }, { name: "불장닭 소스", amount: "3큰술" }, { name: "물", amount: "200ml" }]), steps: JSON.stringify([{ step: 1, description: "떡을 물에 불려 준비합니다." }, { step: 2, description: "팬에 소스와 물을 넣고 끓입니다." }, { step: 3, description: "떡을 넣고 소스가 배도록 조려줍니다." }, { step: 4, description: "계란을 반숙으로 삶아 올려 마무리합니다." }]), is_active: true },
};

// ─── 타입 ─────────────────────────────────────────────────────────────────────
interface Ingredient { name: string; amount: string; }
interface Step       { step: number; description: string; }

const RECIPE_CATEGORY_TO_I18N: Record<
  string,
  "easy" | "dessert" | "restaurant"
> = {
  easy: "easy",
  home: "easy",
  dessert: "dessert",
  cafe: "dessert",
  restaurant: "restaurant",
};

// ─── meta ────────────────────────────────────────────────────────────────────
export const meta: Route.MetaFunction = ({ data }) => {
  const d = data as { metaTitle?: string; metaDescription?: string } | undefined;
  return [
    { title: d?.metaTitle ?? "" },
    { name: "description", content: d?.metaDescription ?? "" },
  ];
};

// ─── loader ───────────────────────────────────────────────────────────────────
export async function loader({ params, request }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);
  const id = Number(params.id);
  if (!id) throw data("Not Found", { status: 404 });
  const contentLocale = normalizeContentLocale(await i18next.getLocale(request));

  let hasReal = false;
  try {
    hasReal = await hasAnyActiveRecipes();
  } catch {
    hasReal = false;
  }

  const withMeta = (recipe: typeof MOCK_MAP[1], isMock: boolean) => ({
    recipe,
    isMock,
    metaTitle: t("pages.recipes.detail.metaTitle", { name: recipe.title }),
    metaDescription:
      (recipe.description && String(recipe.description).trim()) ||
      t("pages.recipes.detail.metaDescriptionFallback"),
  });

  const dbRecipe = await getRecipeById(id).catch(() => null);
  if (dbRecipe && dbRecipe.is_active) {
    if (dbRecipe.locale !== contentLocale) {
      const sib = await getRecipeSiblingByLocale(dbRecipe.translation_group_id, contentLocale);
      if (sib) throw redirect(`/recipe/${sib.recipe_id}`);
    }
    return withMeta(dbRecipe as unknown as typeof MOCK_MAP[1], false);
  }

  if (hasReal) {
    throw data("Not Found", { status: 404 });
  }

  const mock = MOCK_MAP[id];
  if (mock) return withMeta(mock, true);

  throw data("Not Found", { status: 404 });
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default function RecipeDetailScreen({ loaderData }: Route.ComponentProps) {
  const { recipe } = loaderData;
  const { t } = useTranslation();
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

  const cookTime  = recipe.cooking_time ? String(recipe.cooking_time) : null;
  const servings  = recipe.servings ? String(recipe.servings) : null;
  const tags: string[] = recipe.tags ?? [];
  const catKey = RECIPE_CATEGORY_TO_I18N[recipe.category];
  const categoryLabel = catKey
    ? t(`pages.recipes.detail.categories.${catKey}`)
    : recipe.category;

  const metaChipClass =
    "inline-flex items-center gap-1 overflow-hidden rounded-full px-[12.58px] py-[7.19px] bg-white";

  const servingsChip =
    servings ? String(servings).replace(/~/g, "-") : null;

  return (
    <div className={cn(SECTION_VIEWPORT_BLEED, "min-h-screen min-w-0 bg-[var(--site-chrome-header-bg,#FDFDF5)]")}>

      <Breadcrumb
        variant="productDetail"
        items={[
          { label: t("pages.products.shared.breadcrumbProducts"), href: "/products/all" },
          { label: t("navigation.recipe.title"), href: "/recipe/main" },
          { label: recipe.title },
        ]}
      />

      <div className="w-full px-4 pb-20 pt-4 md:px-[max(1rem,calc((100vw-min(750px,calc(750*100vw/1920)))/2))] md:pb-24 md:pt-[60px]">
        <div className="mx-auto flex w-full max-w-[560px] flex-col gap-5 md:max-w-[min(750px,calc(750*100vw/1920))] md:gap-[60px] md:px-0">

          <div
            className="h-[343px] w-full overflow-hidden md:aspect-square md:h-auto"
            style={{ borderRadius: `clamp(20px, calc(80 * 100vw / 1920), 80px)` }}
          >
            <img
              src={imgError ? "/home/premium_egg.png" : (recipe.thumbnail_url ?? "/home/premium_egg.png")}
              alt={recipe.title}
              className="h-full w-full object-cover"
              onError={() => setImgError(true)}
            />
          </div>

          <div className="flex flex-col gap-5 md:gap-5">
            <div
              className="rounded-[20px] p-5 md:rounded-[40px] md:p-10"
              style={{ backgroundColor: "#EAE3C9" }}
            >
              <SectionPageTitle
                as="h1"
                preset="none"
                starVariant="product"
                className="mb-2.5 flex items-start gap-2.5 leading-tight md:mb-0 md:items-center md:gap-3"
                markClassName="mt-0.5 h-[21px] w-[21px] shrink-0 md:mt-0"
                wrapTitle={false}
              >
                <span
                  className="md:hidden"
                  style={{
                    color: "#003F2B",
                    fontFamily: "NanumSquareRound, sans-serif",
                    fontWeight: 800,
                    fontSize: "20px",
                    lineHeight: "30px",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {recipe.title}
                </span>
                <span
                  className="hidden md:inline"
                  style={{
                    color: "#003F2B",
                    fontFamily: "NanumSquareRound, sans-serif",
                    fontWeight: 800,
                    fontSize: pc1920(20, 36),
                    lineHeight: pc1920(30, 54),
                    letterSpacing: "-0.04em",
                  }}
                >
                  {recipe.title}
                </span>
              </SectionPageTitle>

              {recipe.description && (
                <>
                  <p
                    className="mb-4 mt-3 md:hidden"
                    style={{
                      color: "#003F2B",
                      fontSize: "16px",
                      fontFamily: "NanumSquareRound, sans-serif",
                      fontWeight: 700,
                      lineHeight: "24px",
                    }}
                  >
                    {recipe.description}
                  </p>
                  <p
                    className="mb-0 mt-3 hidden md:mb-0 md:mt-5 md:block"
                    style={{
                      color: "#003F2B",
                      fontSize: pc1920(14, 16),
                      fontFamily: "NanumSquareRound, sans-serif",
                      fontWeight: 700,
                      lineHeight: pc1920(21, 24),
                    }}
                  >
                    {recipe.description}
                  </p>
                </>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2.5 md:mt-5 md:gap-6">
                {categoryLabel && (
                  <span
                    className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium md:hidden"
                    style={{ borderColor: "#00000020", backgroundColor: "#ffffff", color: "#000000" }}
                  >
                    {categoryLabel}
                  </span>
                )}
                {cookTime && (
                  <span className={metaChipClass}>
                    <Clock3 className="h-3.5 w-3.5 shrink-0 text-[#1F2121]" strokeWidth={2} />
                    <span
                      style={{
                        color: "#1F2121",
                        fontSize: "12px",
                        fontFamily: "Pretendard, sans-serif",
                        fontWeight: 500,
                        lineHeight: "12px",
                      }}
                    >
                      {cookTime}
                    </span>
                  </span>
                )}
                {servingsChip && (
                  <span className={metaChipClass}>
                    <Users className="h-3.5 w-3.5 shrink-0 text-[#1F2121]" strokeWidth={2} />
                    <span
                      style={{
                        color: "#1F2121",
                        fontSize: "12px",
                        fontFamily: "Pretendard, sans-serif",
                        fontWeight: 500,
                        lineHeight: "12px",
                      }}
                    >
                      {servingsChip}
                    </span>
                  </span>
                )}
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium md:hidden"
                    style={{ backgroundColor: "#003F2B18", color: "#003F2B", letterSpacing: "-0.02em" }}
                  >
                    {tag.startsWith("#") ? tag : `#${tag}`}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-8 md:gap-[60px]">
              {ingredients.length > 0 && (
                <div
                  className="rounded-[20px] p-5 md:rounded-[40px] md:p-10"
                  style={{ backgroundColor: "#EAE3C9" }}
                >
                  <h2 className="mb-2.5 md:mb-5">
                    <span
                      className="md:hidden"
                      style={{
                        color: "#003F2B",
                        fontSize: "16px",
                        fontFamily: "NanumSquareRound, sans-serif",
                        fontWeight: 800,
                        lineHeight: "24px",
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {t("pages.recipes.detail.ingredients")}
                    </span>
                    <span
                      className="hidden md:inline"
                      style={{
                        color: "#003F2B",
                        fontFamily: "NanumSquareRound, sans-serif",
                        fontWeight: 800,
                        fontSize: pc1920(18, 24),
                        lineHeight: pc1920(27, 36),
                        letterSpacing: "-0.04em",
                      }}
                    >
                      {t("pages.recipes.detail.ingredients")}
                    </span>
                  </h2>
                  <div className="flex flex-col divide-y divide-white">
                    {ingredients.map((ing, i) => (
                      <div
                        key={`${ing.name}-${i}`}
                        className="flex items-start justify-between gap-5 py-2.5 first:pt-0 md:gap-5 md:py-5 md:first:pt-0"
                      >
                        <span
                          className="w-[120px] shrink-0 md:w-[160px]"
                          style={{
                            color: "#003F2B",
                            fontSize: "14px",
                            fontFamily: "NanumSquareRound, sans-serif",
                            fontWeight: 700,
                            lineHeight: "21px",
                          }}
                        >
                          <span className="md:hidden">{ing.name}</span>
                          <span
                            className="hidden md:inline"
                            style={{ fontSize: pc1920(15, 18), lineHeight: pc1920(22.5, 27) }}
                          >
                            {ing.name}
                          </span>
                        </span>
                        <span
                          className="min-w-0 flex-1 text-right"
                          style={{
                            color: "#1F2121",
                            fontSize: "14px",
                            fontFamily: "NanumSquareRound, sans-serif",
                            fontWeight: 700,
                            lineHeight: "21px",
                          }}
                        >
                          <span className="md:hidden">{ing.amount}</span>
                          <span
                            className="hidden md:inline"
                            style={{ fontSize: pc1920(15, 18), lineHeight: pc1920(22.5, 27) }}
                          >
                            {ing.amount}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {steps.length > 0 && (
                <div className="flex flex-col gap-2.5 pl-5 md:gap-[30px] md:pl-0">
                  <h2>
                    <span
                      className="md:hidden"
                      style={{
                        color: "#003F2B",
                        fontSize: "20px",
                        fontFamily: "NanumSquareRound, sans-serif",
                        fontWeight: 800,
                        lineHeight: "30px",
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {t("pages.recipes.detail.directions")}
                    </span>
                    <span
                      className="hidden md:inline"
                      style={{
                        color: "#003F2B",
                        fontFamily: "NanumSquareRound, sans-serif",
                        fontWeight: 800,
                        fontSize: pc1920(18, 24),
                        lineHeight: pc1920(27, 36),
                        letterSpacing: "-0.04em",
                      }}
                    >
                      {t("pages.recipes.detail.directions")}
                    </span>
                  </h2>
                  <ol className="flex flex-col gap-2.5 md:gap-5">
                    {steps.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 md:items-center md:gap-5"
                      >
                        <span
                          className="flex h-10 min-w-10 shrink-0 items-center justify-center rounded-full text-white md:h-10 md:w-10 md:min-w-10"
                          style={{
                            backgroundColor: "#003F2B",
                            fontSize: "11px",
                            fontFamily: "NanumSquareRound, sans-serif",
                            fontWeight: 700,
                            lineHeight: "16.5px",
                          }}
                        >
                          <span className="md:hidden">{s.step ?? i + 1}</span>
                          <span
                            className="hidden md:inline"
                            style={{ fontSize: pc1920(14, 16), lineHeight: pc1920(21, 24) }}
                          >
                            {s.step ?? i + 1}
                          </span>
                        </span>
                        <p
                          className="min-w-0 flex-1 text-[#1F2121]"
                          style={{
                            fontSize: "14px",
                            fontFamily: "NanumSquareRound, sans-serif",
                            fontWeight: 800,
                            lineHeight: "21px",
                            letterSpacing: "-0.015em",
                          }}
                        >
                          <span className="md:hidden">{s.description}</span>
                          <span
                            className="hidden md:inline"
                            style={{
                              fontSize: pc1920(15, 18),
                              lineHeight: pc1920(22.5, 27),
                            }}
                          >
                            {s.description}
                          </span>
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>

          <div className="hidden pt-4 text-center md:block">
            <Link
              to="/recipe/main"
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-[#02633E]"
            >
              {t("pages.recipes.detail.backToList")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
