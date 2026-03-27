/**
 * 보도자료 데모 데이터 삽입 스크립트
 *
 * 사용법:
 *   npx tsx scripts/seed-news-demo.ts
 *
 * 이미 동일 제목의 항목이 존재하면 건너뜁니다.
 * is_active=true 로 등록되므로, 이후 관리자에서 비활성화 처리 가능합니다.
 */

import { config } from "dotenv";
import path from "path";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";

config({ path: path.resolve(process.cwd(), ".env") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL 환경변수가 설정되어 있지 않습니다.");
  process.exit(1);
}

const DEMO_NEWS = [
  {
    type: "보도자료",
    title: "풍림푸드, 신선란 품질관리 시스템 혁신… '계란 품질 혁신' 신제품 라인업 공개",
    summary:
      "풍림푸드가 자체 개발한 첨단 품질관리 시스템을 적용한 신선란 라인업을 선보였다. 이번 제품은 생산부터 배송까지 전 과정의 온도 이력을 실시간 추적하는 콜드체인 기술을 도입해 신선도를 극대화한 것이 특징이다.",
    content: `<p>풍림푸드(대표 홍길동)가 자체 개발한 첨단 품질관리 시스템을 적용한 신선란 라인업을 공식 출시했다고 18일 밝혔다.</p>
<p>이번 제품은 생산부터 배송까지 전 과정의 온도 이력을 실시간 추적하는 콜드체인 기술을 도입해 소비자에게 최상의 신선도를 제공한다. 특히 HACCP(식품안전관리인증기준) 인증을 넘어 자체 기준의 '플래티넘 위생 등급' 시스템을 업계 최초로 도입한 점이 주목된다.</p>
<p>풍림푸드 품질연구소 관계자는 "산란 후 24시간 이내 소비자 식탁에 도달하는 물류 체계를 구현했다"며 "앞으로도 지속적인 R&D 투자를 통해 계란 산업의 품질 기준을 선도하겠다"고 말했다.</p>`,
    source: "식품산업신문",
    source_url: null,
    published_at: "2025-11-14",
    thumbnail_url: null,
  },
  {
    type: "사회공헌",
    title: "풍림푸드, ESG 경영 강화… 탄소중립 2035 로드맵 발표",
    summary:
      "풍림푸드가 2035년까지 탄소 순배출 제로를 달성하는 'Green Egg 2035' 로드맵을 발표했다. 태양광 발전 설비 확대, 친환경 포장재 전환, 음식물 폐기물 바이오가스화 사업 등 구체적인 실행 계획을 공개했다.",
    content: `<p>풍림푸드가 지속가능경영을 위한 'Green Egg 2035' 탄소중립 로드맵을 발표했다고 20일 밝혔다.</p>
<p>로드맵에는 ▲2027년까지 전 공장 100% 재생에너지 전환 ▲2030년까지 단계별 친환경 포장재 전면 교체 ▲2035년 탄소 순배출 제로 달성 등 핵심 목표가 담겼다. 아울러 양계 폐기물을 바이오가스로 전환하는 순환경제 모델도 시범 운영에 들어간다.</p>
<p>회사 관계자는 "ESG 경영은 단기 비용이 아닌 장기 성장 동력"이라며 "환경·사회·지배구조 모든 영역에서 업계 최고 수준의 기준을 만들어 가겠다"고 강조했다.</p>`,
    source: "환경일보",
    source_url: null,
    published_at: "2025-10-20",
    thumbnail_url: null,
  },
  {
    type: "수상",
    title: "풍림푸드, 2025 대한민국 식품브랜드 대상 '최우수상' 수상",
    summary:
      "풍림푸드가 '2025 대한민국 식품브랜드 대상'에서 축산물 부문 최우수상을 수상했다. 소비자 신뢰도와 품질 혁신 부문에서 높은 평가를 받아 2년 연속 수상의 영예를 안았다.",
    content: `<p>풍림푸드(대표 홍길동)가 한국소비자브랜드위원회가 주관하는 '2025 대한민국 식품브랜드 대상'에서 축산물 부문 최우수상을 수상했다고 5일 밝혔다.</p>
<p>이번 수상은 소비자 신뢰도 조사, 품질 혁신도, 브랜드 지속가능성 등 세 가지 평가 항목에서 모두 최고 점수를 받은 결과다. 특히 '품질 혁신도' 부문에서는 지난해에 이어 2년 연속 1위를 기록했다.</p>
<p>대표는 "이 상은 풍림푸드를 믿고 사랑해 주시는 소비자 여러분 덕분"이라며 "앞으로도 최상의 품질로 보답하겠다"고 소감을 밝혔다.</p>`,
    source: "한국소비자브랜드위원회",
    source_url: null,
    published_at: "2025-09-05",
    thumbnail_url: null,
  },
  {
    type: "사업확장",
    title: "풍림푸드, 청주 제2공장 증설 완공… 생산 능력 40% 확대",
    summary:
      "풍림푸드가 충북 청주에 제2공장 증설을 완료하고 본격 가동에 들어갔다. 이번 공장 증설로 일 생산 능력이 기존 대비 40% 이상 증가하며, 특수란 및 가공란 전문 라인이 신규 추가됐다.",
    content: `<p>풍림푸드가 충북 청주시 흥덕구에 위치한 제2공장 증설 공사를 마무리하고 2월 1일부터 본격 가동에 들어갔다고 밝혔다.</p>
<p>연면적 8,500㎡ 규모의 신규 동에는 기존 신선란 라인 외에도 액란(파란) 전문 가공 설비와 기능성 특수란 생산 라인이 추가됐다. 이를 통해 일 생산 능력은 기존 80만 개에서 115만 개 이상으로 늘어난다.</p>
<p>회사 관계자는 "B2B 대형 거래처와의 협약 확대에 대응하기 위한 전략적 증설"이라며 "2026년에는 수도권 제3 물류센터 설립도 추진할 계획"이라고 밝혔다.</p>`,
    source: "충청투데이",
    source_url: null,
    published_at: "2025-08-01",
    thumbnail_url: null,
  },
  {
    type: "보도자료",
    title: "풍림푸드, 전국 학교 급식 계란 공급 확대 협약 체결",
    summary:
      "풍림푸드가 교육부 산하 학교급식지원센터와 전국 1,200개 학교에 친환경 인증 계란을 공급하는 협약을 체결했다. 이번 협약으로 연간 2,400만 개 이상의 친환경 계란이 학생들의 급식에 공급될 예정이다.",
    content: `<p>풍림푸드가 교육부 산하 학교급식지원센터와 '친환경 계란 우선 공급 협약'을 체결했다고 15일 밝혔다.</p>
<p>협약에 따라 풍림푸드는 2025년 3월 신학기부터 전국 17개 시도 1,200개 학교에 동물복지 인증·친환경 인증을 획득한 계란을 우선 공급한다. 공급 물량은 연간 2,400만 개 이상으로, 기존 계약 대비 50% 이상 확대된 규모다.</p>
<p>풍림푸드 B2B 영업팀장은 "어린 학생들에게 안전하고 영양가 높은 계란을 제공하는 것이 기업의 사회적 책임"이라며 "앞으로도 공공급식 시장과의 상생 협력을 강화하겠다"고 말했다.</p>`,
    source: "급식뉴스",
    source_url: null,
    published_at: "2025-07-15",
    thumbnail_url: null,
  },
];

async function main() {
  const client = postgres(DATABASE_URL as string, { max: 1 });
  const db = drizzle(client);

  const { news } = await import("../app/features/media/schema.js");

  let inserted = 0;
  let skipped = 0;

  for (const item of DEMO_NEWS) {
    const existing = await db
      .select()
      .from(news)
      .where(eq(news.title, item.title))
      .limit(1);

    if (existing.length > 0) {
      console.log(`⏭  건너뜀 (이미 존재): ${item.title.slice(0, 30)}...`);
      skipped++;
      continue;
    }

    await db.insert(news).values({
      type: item.type,
      title: item.title,
      summary: item.summary,
      content: item.content,
      source: item.source,
      source_url: item.source_url,
      published_at: item.published_at,
      thumbnail_url: item.thumbnail_url,
      is_active: true,
    });
    console.log(`✅ 등록: ${item.title.slice(0, 30)}...`);
    inserted++;
  }

  console.log(`\n완료 — 등록: ${inserted}개, 건너뜀: ${skipped}개`);
  await client.end();
}

main().catch((err) => {
  console.error("❌ 오류:", err.message);
  process.exit(1);
});
