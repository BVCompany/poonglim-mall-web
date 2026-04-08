/**
 * 계란안정성검사결과 페이지 (임시)
 */
import { ShieldCheck } from "lucide-react";
import type { Route } from "./+types/safety-test";
import { Breadcrumb } from "~/core/components/breadcrumb";

export function meta(_: Route.MetaArgs) {
  return [{ title: "계란안정성검사결과 | 풍림푸드" }];
}

const MOCK_RESULTS = [
  {
    period: "2025년 1분기",
    items: [
      { name: "살모넬라균", standard: "불검출", result: "불검출", pass: true },
      { name: "대장균", standard: "불검출", result: "불검출", pass: true },
      { name: "항생제 잔류", standard: "불검출", result: "불검출", pass: true },
      { name: "중금속(납)", standard: "0.1mg/kg 이하", result: "불검출", pass: true },
    ],
  },
  {
    period: "2024년 4분기",
    items: [
      { name: "살모넬라균", standard: "불검출", result: "불검출", pass: true },
      { name: "대장균", standard: "불검출", result: "불검출", pass: true },
      { name: "항생제 잔류", standard: "불검출", result: "불검출", pass: true },
      { name: "중금속(납)", standard: "0.1mg/kg 이하", result: "불검출", pass: true },
    ],
  },
];

export default function SafetyTestScreen() {
  return (
    <div className="min-h-screen bg-[#F5F2EB]">
      <Breadcrumb
        items={[
          { label: "고객지원", href: "/support" },
          { label: "계란안정성검사결과" },
        ]}
      />
      <div className="mx-auto max-w-[900px] px-4 py-16 md:px-6 lg:px-10">
        <div className="mb-4 flex items-center gap-3">
          <ShieldCheck className="h-8 w-8" style={{ color: "#003F2B" }} />
          <h1
            className="text-4xl font-extrabold"
            style={{ color: "#003F2B", letterSpacing: "-0.04em" }}
          >
            계란안정성검사결과
          </h1>
        </div>
        <p className="mb-10 text-gray-600">
          풍림푸드는 정기적인 안전성 검사를 통해 소비자에게 안전한 제품을 공급합니다.
          검사는 공인 식품 안전 기관에 의뢰하여 실시됩니다.
        </p>

        <div className="space-y-8">
          {MOCK_RESULTS.map((quarter) => (
            <div key={quarter.period} className="overflow-hidden rounded-3xl bg-white shadow-sm">
              <div className="px-6 py-4" style={{ backgroundColor: "#EAE3C9" }}>
                <h2 className="font-bold" style={{ color: "#003F2B" }}>{quarter.period}</h2>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#EAE3C9]">
                    <th className="px-6 py-3 text-left text-sm text-gray-500">검사 항목</th>
                    <th className="px-6 py-3 text-left text-sm text-gray-500">기준</th>
                    <th className="px-6 py-3 text-left text-sm text-gray-500">결과</th>
                    <th className="px-6 py-3 text-center text-sm text-gray-500">판정</th>
                  </tr>
                </thead>
                <tbody>
                  {quarter.items.map((item, i) => (
                    <tr
                      key={item.name}
                      style={i < quarter.items.length - 1 ? { borderBottom: "1px solid #EAE3C9" } : {}}
                    >
                      <td className="px-6 py-3 text-sm font-medium text-gray-800">{item.name}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{item.standard}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{item.result}</td>
                      <td className="px-6 py-3 text-center">
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold"
                          style={
                            item.pass
                              ? { backgroundColor: "#dcfce7", color: "#16a34a" }
                              : { backgroundColor: "#fee2e2", color: "#dc2626" }
                          }
                        >
                          {item.pass ? "적합" : "부적합"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-gray-400">
          * 현재 임시 데이터가 표시됩니다. 실제 검사결과는 순차적으로 업로드됩니다.
        </p>
      </div>
    </div>
  );
}
