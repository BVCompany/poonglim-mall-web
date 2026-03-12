import { useState } from "react";
import { Link, data } from "react-router";
import type { Route } from "./+types/detail";
import { getProductById } from "../lib/queries.server";
import { ChevronRight, ExternalLink, ShoppingBag } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  liquid_egg:  "액란가공품",
  pudding:     "푸딩 시리즈",
  convenience: "간편식",
  b2b:         "B2B 전용",
};

const BADGE_STYLE: Record<string, string> = {
  NEW:  "bg-[#5DB876] text-white",
  BEST: "bg-[#204E3A] text-white",
  SALE: "bg-orange-500 text-white",
  B2B:  "bg-blue-600 text-white",
};

export async function loader({ params }: Route.LoaderArgs) {
  const id = Number(params.id);
  if (!id) throw data("Not Found", { status: 404 });
  const product = await getProductById(id).catch(() => null);
  if (!product || !product.is_active) throw data("Not Found", { status: 404 });
  return { product };
}

export default function ProductDetailScreen({ loaderData }: Route.ComponentProps) {
  const { product } = loaderData;
  const [imgError, setImgError] = useState(false);

  const badge = product.badge?.toUpperCase();
  const certifications: string[] = (product as any).certifications ?? [];
  const specs = [
    { label: "용량",     value: (product as any).volume },
    { label: "보관방법", value: (product as any).storage_method },
    { label: "유통기한", value: (product as any).expiry_info },
    { label: "원산지",   value: (product as any).origin },
    { label: "성분",     value: (product as any).ingredients },
  ].filter((s) => s.value);

  return (
    <div className="min-h-screen bg-[#F5F2EB]">
      {/* 브레드크럼 */}
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-2">
        <nav className="flex items-center gap-1 text-xs text-gray-400">
          <Link to="/" className="hover:text-gray-600">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/products/all" className="hover:text-gray-600">제품 소개</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600">{product.name}</span>
        </nav>
      </div>

      {/* 본문 */}
      <div className="max-w-2xl mx-auto px-4 pb-16 space-y-5">

        {/* ── 제품 이미지 ── */}
        <div className="relative rounded-3xl overflow-hidden bg-[#F5E6C8] aspect-square w-full">
          <img
            src={imgError ? "/home/premium_egg.png" : (product.image_url ?? "/home/premium_egg.png")}
            alt={product.name}
            className="w-full h-full object-contain p-8"
            onError={() => setImgError(true)}
          />
          {badge && (
            <span className={`absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full ${BADGE_STYLE[badge] ?? "bg-gray-500 text-white"}`}>
              {badge}
            </span>
          )}
        </div>

        {/* ── 제품 정보 카드 ── */}
        <div className="rounded-2xl bg-white p-6 space-y-4">
          {/* 카테고리 */}
          <p className="text-xs font-medium text-[#204E3A] uppercase tracking-wide">
            {(Array.isArray(product.category) ? product.category : [product.category])
              .map((c) => CATEGORY_LABELS[c] ?? c)
              .join(" · ")}
          </p>

          {/* 제품명 */}
          <h1 className="text-2xl font-bold text-gray-900 leading-snug">
            ✦ {product.name}
          </h1>

          {/* 설명 */}
          <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>

          {/* 인증 태그 */}
          {certifications.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {certifications.map((cert, i) => (
                <span
                  key={i}
                  className="text-xs border border-[#204E3A]/30 text-[#204E3A] px-3 py-1 rounded-full"
                >
                  {cert}
                </span>
              ))}
            </div>
          )}

          {/* 일반 태그 */}
          {(product.tags ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {(product.tags ?? []).map((tag, i) => (
                <span key={i} className="text-xs text-gray-400">{tag}</span>
              ))}
            </div>
          )}

          {/* 풍림몰 구매 버튼 */}
          {(product as any).shop_url ? (
            <a
              href={(product as any).shop_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-[#204E3A] hover:bg-[#1a3f2e] text-white font-semibold py-3.5 rounded-xl transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              풍림몰 구매
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          ) : (
            <div className="flex items-center justify-center gap-2 w-full bg-[#204E3A] text-white font-semibold py-3.5 rounded-xl opacity-60 cursor-not-allowed">
              <ShoppingBag className="w-4 h-4" />
              풍림몰 구매
            </div>
          )}
        </div>

        {/* ── 제품 스펙 테이블 ── */}
        {specs.length > 0 && (
          <div className="rounded-2xl bg-white overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">제품 정보</h2>
            </div>
            <table className="w-full">
              <tbody>
                {specs.map((spec, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="px-6 py-3.5 text-sm text-gray-500 w-28 font-medium">{spec.label}</td>
                    <td className="px-6 py-3.5 text-sm text-gray-900 text-right">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── 상세 내용 ── */}
        {product.detail && (
          <div className="rounded-2xl bg-white p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">상세 설명</h2>
            <div
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: product.detail }}
            />
          </div>
        )}

        {/* 목록으로 */}
        <div className="text-center pt-2">
          <Link
            to="/products/all"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#204E3A] transition-colors"
          >
            ← 제품 목록으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
