/**
 * 계란이야기 페이지
 */
import type { Route } from "./+types/egg-story";

export function meta(_: Route.MetaArgs) {
  return [{ title: "계란이야기 | 풍림푸드" }];
}

const SECTIONS = [
  {
    icon: "🥚",
    title: "신선한 계란의 시작",
    desc: "풍림푸드는 HACCP 인증을 받은 최첨단 설비에서 매일 아침 신선한 계란을 선별합니다. 엄격한 위생 기준과 철저한 온도 관리로 소비자에게 최고 품질의 제품을 届합니다.",
  },
  {
    icon: "🔬",
    title: "계란의 영양 성분",
    desc: "계란 하나에는 완전 단백질, 비타민 A·D·E·B12, 콜린, 루테인 등 인체 필수 영양소가 풍부하게 함유되어 있습니다. '자연이 만든 완전식품'으로 불리는 이유입니다.",
  },
  {
    icon: "🏭",
    title: "액란(液卵) 가공 기술",
    desc: "풍림푸드의 액란은 껍데기를 제거한 계란을 저온 살균 처리하여 안전하고 편리하게 사용할 수 있도록 가공합니다. 식품 제조업체, 베이커리, 대형 급식소에 최적화된 솔루션입니다.",
  },
  {
    icon: "✅",
    title: "품질 관리 시스템",
    desc: "생산부터 유통까지 전 과정에 HACCP, ISO 22000 기반의 품질 관리 시스템을 적용합니다. 정기적인 미생물 검사와 이화학적 분석을 통해 제품의 안전성을 보증합니다.",
  },
  {
    icon: "🌱",
    title: "친환경 축산 파트너십",
    desc: "무항생제·동물복지 인증 농가와의 협력을 통해 건강한 닭에서 얻은 계란만을 사용합니다. 지속가능한 먹거리 생태계를 위해 끊임없이 노력합니다.",
  },
  {
    icon: "🚚",
    title: "콜드체인 물류",
    desc: "수확 후 24시간 이내 처리, 0~10℃ 냉장 유통 체계로 소비자에게 도달하는 순간까지 신선도를 유지합니다. 전국 당일 배송 네트워크를 운영하고 있습니다.",
  },
];

import { Breadcrumb } from "~/core/components/breadcrumb";

export default function EggStoryScreen() {
  return (
    <div className="min-h-screen bg-[#F5F2EB]">
      <Breadcrumb
        items={[
          { label: "제품소개", href: "/products/all" },
          { label: "계란이야기" },
        ]}
      />
      {/* 히어로 */}
      <div
        className="flex items-center justify-center py-24 text-center"
        style={{ background: "linear-gradient(135deg, #003F2B 0%, #02633E 100%)" }}
      >
        <div className="px-4">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/60">
            Egg Story
          </p>
          <h1 className="mb-4 text-4xl font-extrabold text-white md:text-[clamp(2.25rem,calc(3rem*100vw/1920),3rem)]">
            계란이야기
          </h1>
          <p className="mx-auto max-w-xl text-lg text-white/75">
            자연이 만든 완전식품, 계란의 모든 것을 풍림푸드가 알려드립니다.
          </p>
        </div>
      </div>

      {/* 섹션 그리드 */}
      <div className="mx-auto w-full max-w-[1200px] px-4 py-16 md:max-w-[min(1200px,calc(1200*100vw/1920))] md:px-6 lg:px-10">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((s) => (
            <div
              key={s.title}
              className="rounded-3xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 text-4xl">{s.icon}</div>
              <h2
                className="mb-3 text-xl font-bold"
                style={{ color: "#003F2B" }}
              >
                {s.title}
              </h2>
              <p className="leading-relaxed text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* 하단 CTA */}
        <div className="mt-16 rounded-3xl bg-[#EAE3C9] p-10 text-center">
          <h2 className="mb-3 text-2xl font-bold" style={{ color: "#003F2B" }}>
            풍림푸드의 계란 제품이 궁금하신가요?
          </h2>
          <p className="mb-6 text-gray-600">
            다양한 액란·신선란·가공란 제품을 확인해보세요.
          </p>
          <a
            href="/products/all"
            className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-bold text-white transition-all hover:brightness-110"
            style={{ backgroundColor: "#003F2B" }}
          >
            제품 보러가기
          </a>
        </div>
      </div>
    </div>
  );
}
