import { useState } from "react";
import { Link, data } from "react-router";
import type { Route } from "./+types/detail";
import { getRecipeById, hasAnyActiveRecipes } from "../lib/queries.server";
import { Clock3, Users } from "lucide-react";
import { Breadcrumb } from "~/core/components/breadcrumb";
import { SectionTitleStar } from "~/core/components/section-title-star";
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

  let hasReal = false;
  try {
    hasReal = await hasAnyActiveRecipes();
  } catch {
    hasReal = false;
  }

  const dbRecipe = await getRecipeById(id).catch(() => null);
  if (dbRecipe && dbRecipe.is_active) return { recipe: dbRecipe, isMock: false };

  if (hasReal) {
    throw data("Not Found", { status: 404 });
  }

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

  const cookTime  = recipe.cooking_time ? String(recipe.cooking_time) : null;
  const servings  = recipe.servings ? String(recipe.servings) : null;
  const tags: string[] = recipe.tags ?? [];
  const categoryLabel = CATEGORY_LABELS[recipe.category] ?? recipe.category;

  const metaChipClass =
    "inline-flex items-center gap-1 overflow-hidden rounded-full px-[12.58px] py-[7.19px] bg-white";

  return (
    <div className="min-h-screen bg-[#F4F2E5]">

      {/* ── 브레드크럼 ── */}
      <Breadcrumb
        items={[
          { label: "레시피", href: "/recipe/main" },
          { label: categoryLabel, href: "/recipe/main" },
          { label: recipe.title },
        ]}
      />

      {/* ── 본문 ── */}
      <div className="mx-auto w-full max-w-[560px] space-y-5 px-4 pb-20 pt-5 md:max-w-[min(560px,calc(560*100vw/1920))] md:space-y-6 md:px-4 md:pt-0">

        {/* ① 이미지 카드 */}
        <div className="h-[343px] w-full overflow-hidden rounded-[20px] md:h-auto md:aspect-square md:rounded-3xl">
          <img
            src={imgError ? "/home/premium_egg.png" : (recipe.thumbnail_url ?? "/home/premium_egg.png")}
            alt={recipe.title}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        </div>

        {/* ② 레시피 정보 카드 */}
        <div className="rounded-[20px] p-5 md:rounded-3xl md:p-7" style={{ backgroundColor: "#EAE3C9" }}>

          {/* 제목 */}
          <h1 className="mb-2.5 flex items-center gap-2.5 leading-tight md:mb-3">
            <SectionTitleStar
              variant="product"
              className="h-[21px] w-[21px] flex-shrink-0 md:h-5 md:w-5"
            />
            <span
              className="md:hidden"
              style={{
                color: "#003F2B",
                fontFamily: "NanumSquareRound",
                fontWeight: 800,
                fontSize: "20px",
                lineHeight: "30px",
                letterSpacing: "-0.03em",
              }}
            >
              {recipe.title}
            </span>
            <span
              className="hidden font-extrabold md:inline"
              style={{ fontSize: pc1920(20, 26), letterSpacing: "-0.03em", color: "#003F2B" }}
            >
              {recipe.title}
            </span>
          </h1>

          {/* 설명 */}
          {recipe.description && (
            <>
              <p
                className="mb-4 md:hidden"
                style={{ color: "#003F2B", fontSize: "16px", fontFamily: "NanumSquareRound", fontWeight: 700, lineHeight: "24px" }}
              >
                {recipe.description}
              </p>
              <p
                className="mb-4 hidden leading-relaxed md:block"
                style={{ color: "#003F2B", fontSize: `clamp(13px, calc(15 * 100vw / 1920), 15px)` }}
              >
                {recipe.description}
              </p>
            </>
          )}

          {/* 메타: 모바일 — 조리시간·인분만 / 데스크탑 — 카테고리·태그 포함 */}
          <div className="flex flex-wrap items-center gap-2.5 md:gap-1.5">
            {categoryLabel && (
              <span
                className="hidden items-center rounded-full border px-3 py-1 text-xs font-medium md:inline-flex"
                style={{ borderColor: "#00000020", backgroundColor: "#ffffff", color: "#000000" }}
              >
                {categoryLabel}
              </span>
            )}
            {cookTime && (
              <span className={metaChipClass}>
                <Clock3 className="h-3.5 w-3.5 shrink-0 text-[#1F2121]" strokeWidth={2} />
                <span style={{ color: "#1F2121", fontSize: "12px", fontFamily: "Pretendard", fontWeight: 500, lineHeight: "12px" }}>
                  {cookTime}
                </span>
              </span>
            )}
            {servings && (
              <span className={metaChipClass}>
                <Users className="h-3.5 w-3.5 shrink-0 text-[#1F2121]" strokeWidth={2} />
                <span style={{ color: "#1F2121", fontSize: "12px", fontFamily: "Pretendard", fontWeight: 500, lineHeight: "12px" }}>
                  {servings}
                </span>
              </span>
            )}
            {tags.map((tag, i) => (
              <span
                key={i}
                className="hidden items-center rounded-full px-3 py-1 text-xs font-medium md:inline-flex"
                style={{ backgroundColor: "#003F2B18", color: "#003F2B", letterSpacing: "-0.02em" }}
              >
                {tag.startsWith("#") ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        </div>

        {/* ③ 재료 카드 */}
        {ingredients.length > 0 && (
          <div className="rounded-[20px] p-5 md:rounded-3xl md:px-7 md:py-5" style={{ backgroundColor: "#EAE3C9" }}>
            <h2 className="mb-2.5 font-extrabold md:mb-0 md:pb-4">
              <span
                className="md:hidden"
                style={{
                  color: "#003F2B",
                  fontSize: "16px",
                  fontFamily: "NanumSquareRound",
                  fontWeight: 800,
                  lineHeight: "24px",
                  letterSpacing: "-0.03em",
                }}
              >
                재료
              </span>
              <span
                className="hidden md:inline"
                style={{ fontSize: pc1920(14, 16), letterSpacing: "-0.03em", color: "#003F2B" }}
              >
                재료
              </span>
            </h2>
            <div className="flex flex-col md:pt-0">
              {ingredients.map((ing, i) => (
                <div key={`${ing.name}-${i}`}>
                  {i > 0 && <div className="h-px bg-white" />}
                  <div
                    className="flex items-start justify-between gap-5 py-2.5 md:py-4"
                  >
                    <span
                      style={{
                        width: "160px",
                        flexShrink: 0,
                        color: "#003F2B",
                        fontSize: "14px",
                        fontFamily: "NanumSquareRound",
                        fontWeight: 700,
                        lineHeight: "21px",
                      }}
                      className="md:text-sm"
                    >
                      {ing.name}
                    </span>
                    <span
                      className="text-right md:text-sm"
                      style={{
                        flex: 1,
                        color: "#1F2121",
                        fontSize: "14px",
                        fontFamily: "NanumSquareRound",
                        fontWeight: 700,
                        lineHeight: "21px",
                      }}
                    >
                      {ing.amount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ④ 만드는 법 */}
        {steps.length > 0 && (
          <div className="flex flex-col gap-2.5 pl-5 md:gap-4 md:pl-0 md:px-1 md:pb-2">
            <h2>
              <span
                className="md:hidden"
                style={{
                  color: "#003F2B",
                  fontSize: "20px",
                  fontFamily: "NanumSquareRound",
                  fontWeight: 800,
                  lineHeight: "30px",
                  letterSpacing: "-0.03em",
                }}
              >
                만드는 법
              </span>
              <span
                className="hidden font-bold md:inline"
                style={{ fontSize: pc1920(14, 16), letterSpacing: "-0.03em", color: "#003F2B" }}
              >
                만드는 법
              </span>
            </h2>
            <ol className="flex flex-col gap-2.5 md:gap-1">
              {steps.map((s, i) => (
                <li key={i} className="flex items-center gap-2.5 md:items-start md:gap-4 md:py-2.5">
                  <span
                    className="flex h-10 min-w-10 shrink-0 items-center justify-center rounded-full text-white md:h-6 md:w-6 md:text-xs"
                    style={{
                      backgroundColor: "#003F2B",
                      fontSize: "11px",
                      fontFamily: "NanumSquareRound",
                      fontWeight: 700,
                      lineHeight: "16.5px",
                    }}
                  >
                    {s.step ?? i + 1}
                  </span>
                  <p
                    className="flex-1 text-[#1F2121] md:text-sm md:leading-relaxed md:text-[#003F2B]"
                    style={{
                      fontSize: "14px",
                      fontFamily: "NanumSquareRound",
                      fontWeight: 800,
                      lineHeight: "21px",
                      letterSpacing: "-0.015em",
                    }}
                  >
                    {s.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* 목록으로 */}
        <div className="hidden pt-2 text-center md:block">
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
