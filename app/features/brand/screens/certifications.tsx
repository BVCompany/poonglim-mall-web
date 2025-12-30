import { Card, CardContent } from "~/core/components/ui/card";
import { CheckCircle, Award, Shield, Leaf } from "lucide-react";

const certifications = [
  {
    icon: Shield,
    name: "HACCP",
    description: "식품안전관리인증기준",
    details: "원료 입고부터 제품 출하까지 전 과정 안전 관리",
    year: "2010년 인증",
  },
  {
    icon: Award,
    name: "ISO 22000",
    description: "식품안전경영시스템",
    details: "국제 표준 식품안전 경영시스템 구축 및 운영",
    year: "2015년 인증",
  },
  {
    icon: CheckCircle,
    name: "KS 인증",
    description: "한국산업표준 인증",
    details: "국가 표준 품질 기준 충족 제품 생산",
    year: "2018년 인증",
  },
  {
    icon: Leaf,
    name: "친환경 인증",
    description: "환경친화적 제품 인증",
    details: "지속가능한 생산 공정과 친환경 포장재 사용",
    year: "2020년 인증",
  },
];

export default function CertificationsScreen() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-foreground py-24 text-background">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h1 className="mb-4 text-5xl font-bold">인증 현황</h1>
            <p className="text-lg opacity-90">
              국내외 공인 기관의 엄격한 품질 인증 현황
            </p>
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="bg-background py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-balance mb-4 text-4xl font-bold text-foreground">
              품질 인증 현황
            </h2>
            <p className="text-pretty text-xl text-muted-foreground">
              국내외 공인 기관의 엄격한 인증을 통해 품질을 보장합니다
            </p>
          </div>

          <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {certifications.map((cert, index) => (
              <Card
                key={index}
                className="text-center transition-shadow hover:shadow-lg"
              >
                <CardContent className="p-8">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <cert.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">
                    {cert.name}
                  </h3>
                  <p className="mb-3 text-sm text-muted-foreground">
                    {cert.description}
                  </p>
                  <p className="text-pretty mb-3 text-xs text-muted-foreground">
                    {cert.details}
                  </p>
                  <p className="text-xs font-medium text-primary">
                    {cert.year}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="rounded-lg bg-muted p-8">
            <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
              <div>
                <div className="mb-2 text-3xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">원료 검사율</div>
              </div>
              <div>
                <div className="mb-2 text-3xl font-bold text-primary">
                  24시간
                </div>
                <div className="text-sm text-muted-foreground">
                  품질 모니터링
                </div>
              </div>
              <div>
                <div className="mb-2 text-3xl font-bold text-primary">0건</div>
                <div className="text-sm text-muted-foreground">
                  최근 3년 품질 사고
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
