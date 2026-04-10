import { useState } from "react";
import { Link, data } from "react-router";
import type { Route } from "./+types/detail";
import { getProductById, hasAnyActiveProducts } from "../lib/queries.server";
import { ArrowUpRight } from "lucide-react";
import { Breadcrumb } from "~/core/components/breadcrumb";
import { SectionTitleStar } from "~/core/components/section-title-star";
import { pc1920 } from "~/core/lib/pc-fluid";

// ─── 목 데이터 (DB 연결 전 / 테스트용) ─────────────────────────────────────
interface MockProduct {
  product_id: number;
  name: string;
  description: string;
  category: string[];
  badge?: string;
  is_b2b: boolean;
  is_active: boolean;
  image_url: string;
  tags: string[];
  certifications: string[];
  shop_url?: string;
  volume?: string;
  storage_method?: string;
  expiry_info?: string;
  origin?: string;
  ingredients?: string;
  detail?: string;
}

const MOCK_MAP: Record<number, MockProduct> = {
  1:  { product_id: 1,  name: "짜먹는 에그샐러드 1kg",        category: ["liquid_egg"],  badge: "BEST", is_b2b: false, is_active: true, image_url: "/home/premium_egg.png", tags: ["#간편", "#간편식사", "#직장인", "#한끼해결"], certifications: ["HACCP 인증", "무항생제", "국산 100%"], volume: "1kg", storage_method: "냉장보관 (0~10℃)", expiry_info: "제조일로부터 14일", origin: "국산", ingredients: "계란 100%", description: "간편하게 즐기는 프리미엄 에그샐러드" },
  2:  { product_id: 2,  name: "짜먹는 콘버터 에그샐러드 1kg", category: ["liquid_egg"],  badge: "NEW",  is_b2b: true,  is_active: true, image_url: "/home/premium_egg.png", tags: ["#간편", "#간편식사", "#직장인", "#한끼해결"], certifications: ["HACCP 인증"], volume: "1kg", storage_method: "냉장보관 (0~10℃)", expiry_info: "제조일로부터 14일", origin: "국산", ingredients: "계란, 콘버터", description: "고소한 콘버터가 들어간 에그샐러드" },
  3:  { product_id: 3,  name: "짜먹는 단호박 에그샐러드 1kg", category: ["liquid_egg"],  is_b2b: false, is_active: true, image_url: "/home/premium_egg.png", tags: ["#간편", "#간편식사", "#직장인", "#한끼해결"], certifications: ["HACCP 인증", "국산 100%"], volume: "1kg", storage_method: "냉장보관 (0~10℃)", expiry_info: "제조일로부터 14일", origin: "국산", ingredients: "계란, 단호박", description: "영양 가득한 단호박 에그샐러드" },
  4:  { product_id: 4,  name: "짜먹는 김치 에그샐러드 1kg",   category: ["liquid_egg"],  badge: "BEST", is_b2b: false, is_active: true, image_url: "/home/premium_egg.png", tags: ["#간편", "#간편식사", "#직장인", "#한끼해결"], certifications: ["HACCP 인증", "국산 100%"], volume: "1kg", storage_method: "냉장보관 (0~10℃)", expiry_info: "제조일로부터 14일", origin: "국산", ingredients: "계란, 김치", description: "한국적인 맛의 김치 에그샐러드" },
  5:  { product_id: 5,  name: "커스터드 푸딩",                category: ["pudding"],     badge: "BEST", is_b2b: false, is_active: true, image_url: "/home/puding.png",      tags: ["#디저트", "#프리미엄", "#커스터드"], certifications: ["HACCP 인증"], volume: "100g × 4", storage_method: "냉장보관 (0~5℃)", expiry_info: "제조일로부터 7일", origin: "국산", ingredients: "계란, 우유, 설탕", description: "부드럽고 진한 커스터드 푸딩" },
  6:  { product_id: 6,  name: "카라멜 푸딩",                  category: ["pudding"],     badge: "NEW",  is_b2b: false, is_active: true, image_url: "/home/puding.png",      tags: ["#디저트", "#카라멜"], certifications: ["HACCP 인증"], volume: "100g × 4", storage_method: "냉장보관 (0~5℃)", expiry_info: "제조일로부터 7일", origin: "국산", ingredients: "계란, 우유, 카라멜시럽", description: "달콤한 카라멜 소스와 함께" },
  7:  { product_id: 7,  name: "계란찜",                       category: ["convenience"], badge: "BEST", is_b2b: false, is_active: true, image_url: "/home/solution.png",    tags: ["#간편식", "#업소용"], certifications: ["HACCP 인증"], volume: "200g", storage_method: "냉장보관 (0~10℃)", expiry_info: "제조일로부터 10일", origin: "국산", ingredients: "계란 100%", description: "부드러운 계란찜" },
  8:  { product_id: 8,  name: "계란말이",                     category: ["convenience"], is_b2b: false, is_active: true, image_url: "/home/solution.png",    tags: ["#간편식", "#업소용"], certifications: ["HACCP 인증"], volume: "150g", storage_method: "냉장보관 (0~10℃)", expiry_info: "제조일로부터 10일", origin: "국산", ingredients: "계란 100%", description: "폭신한 계란말이" },
  9:  { product_id: 9,  name: "스크램블 에그 파우더",          category: ["liquid_egg"],  badge: "NEW",  is_b2b: false, is_active: true, image_url: "/home/premium_egg.png", tags: ["#간편", "#파우더", "#아침식사"], certifications: ["HACCP 인증"], volume: "500g", storage_method: "실온 보관", expiry_info: "제조일로부터 12개월", origin: "국산", ingredients: "계란 100%", description: "빠르게 만드는 부드러운 스크램블 에그" },
  10: { product_id: 10, name: "프리미엄 구운 계란 12구",       category: ["convenience"], badge: "BEST", is_b2b: false, is_active: true, image_url: "/home/premium_egg.png", tags: ["#구운계란", "#간식", "#건강"], certifications: ["무항생제", "국산 100%"], volume: "12구", storage_method: "냉장보관 (0~10℃)", expiry_info: "제조일로부터 21일", origin: "국산", ingredients: "계란 100%", description: "전통 방식으로 구운 프리미엄 구운 계란" },
  11: { product_id: 11, name: "훈제 계란 10구",               category: ["convenience"], is_b2b: false, is_active: true, image_url: "/home/premium_egg.png", tags: ["#훈제", "#간식", "#건강식"], certifications: ["HACCP 인증"], volume: "10구", storage_method: "냉장보관 (0~10℃)", expiry_info: "제조일로부터 21일", origin: "국산", ingredients: "계란 100%", description: "향긋하게 훈제한 계란" },
  12: { product_id: 12, name: "녹차 계란 10구",               category: ["convenience"], is_b2b: false, is_active: true, image_url: "/home/premium_egg.png", tags: ["#녹차", "#건강", "#프리미엄"], certifications: ["무항생제", "국산 100%"], volume: "10구", storage_method: "냉장보관 (0~10℃)", expiry_info: "제조일로부터 21일", origin: "국산", ingredients: "계란 100%", description: "녹차 성분을 먹여 키운 닭의 계란" },
  13: { product_id: 13, name: "짜먹는 마요 에그샐러드 1kg",   category: ["liquid_egg"],  badge: "NEW",  is_b2b: false, is_active: true, image_url: "/home/premium_egg.png", tags: ["#마요", "#간편", "#샌드위치"], certifications: ["HACCP 인증"], volume: "1kg", storage_method: "냉장보관 (0~10℃)", expiry_info: "제조일로부터 14일", origin: "국산", ingredients: "계란, 마요네즈", description: "고소한 마요네즈 베이스 에그샐러드" },
  14: { product_id: 14, name: "바닐라 푸딩",                  category: ["pudding"],     is_b2b: false, is_active: true, image_url: "/home/puding.png",      tags: ["#바닐라", "#디저트", "#프리미엄"], certifications: ["HACCP 인증"], volume: "100g × 4", storage_method: "냉장보관 (0~5℃)", expiry_info: "제조일로부터 7일", origin: "국산", ingredients: "계란, 우유, 바닐라", description: "진한 바닐라 향의 부드러운 푸딩" },
  15: { product_id: 15, name: "딸기 푸딩",                    category: ["pudding"],     badge: "NEW",  is_b2b: false, is_active: true, image_url: "/home/puding.png",      tags: ["#딸기", "#디저트"], certifications: ["HACCP 인증"], volume: "100g × 4", storage_method: "냉장보관 (0~5℃)", expiry_info: "제조일로부터 7일", origin: "국산", ingredients: "계란, 우유, 딸기", description: "상큼한 딸기가 듬뿍 들어간 푸딩" },
  16: { product_id: 16, name: "업소용 액란 5L",               category: ["liquid_egg"],  is_b2b: true,  is_active: true, image_url: "/home/premium_egg.png", tags: ["#B2B", "#업소용", "#대용량"], certifications: ["HACCP 인증", "무항생제"], volume: "5L", storage_method: "냉장보관 (0~5℃)", expiry_info: "제조일로부터 14일", origin: "국산", ingredients: "계란 100%", description: "업소 전용 대용량 액란" },
  17: { product_id: 17, name: "계란 샌드위치 필링 2kg",       category: ["liquid_egg"],  badge: "BEST", is_b2b: false, is_active: true, image_url: "/home/premium_egg.png", tags: ["#샌드위치", "#필링", "#B2B"], certifications: ["HACCP 인증"], volume: "2kg", storage_method: "냉장보관 (0~10℃)", expiry_info: "제조일로부터 14일", origin: "국산", ingredients: "계란, 마요네즈, 채소", description: "샌드위치 가게를 위한 전문 필링" },
  18: { product_id: 18, name: "토마토 에그 솔루션",            category: ["convenience"], badge: "NEW",  is_b2b: false, is_active: true, image_url: "/home/solution.png",    tags: ["#토마토", "#간편식", "#건강"], certifications: ["HACCP 인증", "국산 100%"], volume: "200g", storage_method: "냉장보관 (0~10℃)", expiry_info: "제조일로부터 10일", origin: "국산", ingredients: "계란, 토마토", description: "토마토와 계란의 완벽한 조화" },
};

const CATEGORY_LABELS: Record<string, string> = {
  liquid_egg:  "액란가공품",
  pudding:     "푸딩 시리즈",
  convenience: "간편식",
  b2b:         "B2B 전용",
};

const BADGE_STYLE: Record<string, { bg: string; text: string }> = {
  BEST: { bg: "#f4f2e5", text: "#204E3A" },
  NEW:  { bg: "#ffd55d", text: "#1a1a1a" },
  SALE: { bg: "#f97316", text: "#ffffff" },
  B2B:  { bg: "#32af32", text: "#ffffff" },
};

// ─── meta ────────────────────────────────────────────────────────────────────
export const meta: Route.MetaFunction = ({ data }) => {
  const name = (data as any)?.product?.name ?? "제품 상세";
  return [
    { title: `${name} | 풍림푸드` },
    { name: "description", content: (data as any)?.product?.description ?? "" },
  ];
};

// ─── loader ──────────────────────────────────────────────────────────────────
export async function loader({ params }: Route.LoaderArgs) {
  const id = Number(params.id);
  if (!id) throw data("Not Found", { status: 404 });

  let hasReal = false;
  try {
    hasReal = await hasAnyActiveProducts();
  } catch {
    hasReal = false;
  }

  const dbProduct = await getProductById(id).catch(() => null);
  if (dbProduct && dbProduct.is_active) {
    return { product: dbProduct, isMock: false };
  }

  if (hasReal) {
    throw data("Not Found", { status: 404 });
  }

  const mock = MOCK_MAP[id];
  if (mock) return { product: mock as any, isMock: true };

  throw data("Not Found", { status: 404 });
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default function ProductDetailScreen({ loaderData }: Route.ComponentProps) {
  const { product } = loaderData;
  const [imgError, setImgError] = useState(false);

  const badge = product.badge?.toUpperCase();
  const badgeStyle = badge ? BADGE_STYLE[badge] : null;
  const certifications: string[] = (product as any).certifications ?? [];
  const tags: string[] = product.tags ?? [];

  const specs = [
    { label: "용량",     value: (product as any).volume },
    { label: "보관방법", value: (product as any).storage_method },
    { label: "유통기한", value: (product as any).expiry_info },
    { label: "원산지",   value: (product as any).origin },
    { label: "성분",     value: (product as any).ingredients },
  ].filter((s) => s.value);

  const categoryLabel = (Array.isArray(product.category) ? product.category : [product.category])
    .map((c: string) => CATEGORY_LABELS[c] ?? c)
    .filter(Boolean)
    .join(" · ");

  const shopUrl = (product as any).shop_url;

  return (
    <div className="min-h-screen bg-[#F5F2EB]">
      {/* ── 브레드크럼 ── */}
      <Breadcrumb
        items={[
          { label: "제품소개", href: "/products/all" },
          ...(categoryLabel ? [{ label: categoryLabel, href: "/products/all" }] : []),
          { label: product.name },
        ]}
      />

      {/* ── 본문 컨테이너 ── */}
      <div
        className="mx-auto w-full max-w-[560px] px-4 pb-20 pt-4 md:max-w-[min(750px,calc(750*100vw/1920))]"
        style={{ paddingTop: `clamp(16px, calc(60 * 100vw / 1920), 60px)` }}
      >

        {/* ① 이미지 카드 */}
        <div
          className="h-[343px] w-full overflow-hidden md:aspect-square md:h-auto"
          style={{ borderRadius: `clamp(20px, calc(80 * 100vw / 1920), 80px)` }}
        >
          <img
            src={imgError ? "/home/premium_egg.png" : (product.image_url ?? "/home/premium_egg.png")}
            alt={product.name}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        </div>

        {/* 카드 섹션 — 이미지와의 간격: 모바일 16px / 데스크탑 최대 60px */}
        <div
          className="space-y-4 md:space-y-5"
          style={{ marginTop: `clamp(16px, calc(60 * 100vw / 1920), 60px)` }}
        >

          {/* ② 제품 정보 카드 — 배경 #EAE3C9 */}
          <div
            style={{
              backgroundColor: "#EAE3C9",
              borderRadius: `clamp(20px, calc(40 * 100vw / 1920), 40px)`,
              padding: `clamp(20px, calc(40 * 100vw / 1920), 40px)`,
            }}
          >
            {/* 제품명 */}
            <h1
              className="mb-3 flex items-center gap-2.5 leading-tight"
              style={{ color: "#003F2B", letterSpacing: "-0.03em" }}
            >
              <SectionTitleStar
                variant="product"
                className="h-[21px] w-[21px] flex-shrink-0"
              />
              <span
                style={{
                  fontFamily: "NanumSquareRound",
                  fontWeight: 800,
                  fontSize: `clamp(20px, calc(36 * 100vw / 1920), 36px)`,
                  lineHeight: 1.5,
                }}
              >
                {product.name}
              </span>
            </h1>

            {/* 설명 */}
            <p
              className="mb-4 leading-[1.5]"
              style={{ color: "#003F2B", fontSize: "16px", fontFamily: "NanumSquareRound", fontWeight: 700, lineHeight: "24px" }}
            >
              {product.description}
            </p>

            {/* 인증 태그 */}
            {certifications.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-2.5">
                {certifications.map((cert, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center overflow-hidden rounded-full px-[12.58px] py-[7.19px]"
                    style={{
                      backgroundColor: "#ffffff",
                      color: "#1F2121",
                      fontSize: `clamp(11px, calc(12 * 100vw / 1920), 12px)`,
                      fontFamily: "Pretendard",
                      fontWeight: 500,
                    }}
                  >
                    {cert}
                  </span>
                ))}
              </div>
            )}

            {/* 일반 태그 — 데스크탑만 표시 */}
            {tags.length > 0 && (
              <div className="mb-6 hidden flex-wrap items-center gap-1.5 md:flex">
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
            )}

            {/* 풍림몰 구매 버튼 */}
            {shopUrl ? (
              <a
                href={shopUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-4 rounded-full transition-all hover:brightness-110"
                style={{
                  backgroundColor: "#003F2B",
                  color: "#ffffff",
                  fontSize: `clamp(16px, calc(24 * 100vw / 1920), 24px)`,
                  fontFamily: "NanumSquareRound",
                  fontWeight: 700,
                  padding: "20px",
                  borderRadius: "35px",
                }}
              >
                풍림몰 구매
                <ArrowUpRight className="h-[14px] w-[14px]" strokeWidth={2.5} />
              </a>
            ) : (
              <div
                className="flex w-full cursor-not-allowed items-center justify-center gap-4"
                style={{
                  backgroundColor: "#003F2B55",
                  color: "#003F2B99",
                  fontSize: `clamp(16px, calc(24 * 100vw / 1920), 24px)`,
                  fontFamily: "NanumSquareRound",
                  fontWeight: 700,
                  padding: "20px",
                  borderRadius: "35px",
                }}
              >
                풍림몰 구매
                <ArrowUpRight className="h-[14px] w-[14px]" strokeWidth={2.5} />
              </div>
            )}
          </div>

          {/* ③ 제품 정보 스펙 카드 */}
          {specs.length > 0 && (
            <div
              className="overflow-hidden"
              style={{
                backgroundColor: "#EAE3C9",
                borderRadius: `clamp(20px, calc(40 * 100vw / 1920), 40px)`,
              }}
            >
              <div
                style={{ padding: `clamp(16px, calc(40 * 100vw / 1920), 40px)` }}
              >
                <h2
                  style={{
                    color: "#003F2B",
                    fontSize: `clamp(16px, calc(24 * 100vw / 1920), 24px)`,
                    fontFamily: "NanumSquareRound",
                    fontWeight: 800,
                    lineHeight: 1.5,
                    marginBottom: `clamp(12px, calc(30 * 100vw / 1920), 30px)`,
                  }}
                >
                  제품 정보
                </h2>
                <div className="flex flex-col">
                  {specs.map((spec, i) => (
                    <div key={spec.label}>
                      {i > 0 && <div className="h-px bg-white" />}
                      <div
                        className="flex items-start justify-between gap-5"
                        style={{ paddingTop: `clamp(10px, calc(20 * 100vw / 1920), 20px)`, paddingBottom: `clamp(10px, calc(20 * 100vw / 1920), 20px)` }}
                      >
                        <span
                          style={{
                            width: "160px",
                            flexShrink: 0,
                            color: "#003F2B",
                            fontSize: `clamp(14px, calc(18 * 100vw / 1920), 18px)`,
                            fontFamily: "NanumSquareRound",
                            fontWeight: 700,
                            lineHeight: 1.5,
                          }}
                        >
                          {spec.label}
                        </span>
                        <span
                          className="text-right"
                          style={{
                            flex: 1,
                            color: "#1F2121",
                            fontSize: `clamp(14px, calc(18 * 100vw / 1920), 18px)`,
                            fontFamily: "NanumSquareRound",
                            fontWeight: 700,
                            lineHeight: 1.5,
                          }}
                        >
                          {spec.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ④ 상세 설명 (HTML 콘텐츠) */}
          {product.detail && (
            <div className="rounded-2xl bg-white p-5 shadow-sm md:rounded-3xl md:p-7">
              <h2
                className="mb-4 font-bold text-gray-900"
                style={{ fontSize: pc1920(14, 16), letterSpacing: "-0.03em" }}
              >
                상세 설명
              </h2>
              <div
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: product.detail }}
              />
            </div>
          )}

          {/* 목록으로 */}
          <div className="hidden pt-2 text-center md:block">
            <Link
              to="/products/all"
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-[#02633E]"
            >
              ← 제품 목록으로 돌아가기
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
