import { Card, CardContent, CardHeader, CardTitle } from "~/core/components/ui/card";
import { Shield, GraduationCap, Gift, Coffee, Users, Heart, Building2 } from "lucide-react";

interface Benefit {
  icon: typeof Shield;
  title: string;
  description: string;
}

const benefits: Benefit[] = [
  { icon: Shield, title: "4대보험", description: "국민연금, 건강보험, 고용보험, 산재보험" },
  { icon: GraduationCap, title: "교육지원", description: "직무교육, 외부교육, 자격증 취득 지원" },
  { icon: Gift, title: "경조사비", description: "결혼, 출산, 상조 등 각종 경조사 지원" },
  { icon: Coffee, title: "식사제공", description: "중식 제공 및 간식 지원" },
  { icon: Users, title: "복지포인트", description: "연간 복지포인트 지급" },
  { icon: Heart, title: "건강검진", description: "정기 건강검진 및 의료비 지원" },
];

export default function CareersBenefitsScreen() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold text-foreground md:text-5xl">복리후생 및 근무환경</h1>
            <p className="text-xl text-muted-foreground">직원들의 성장과 행복을 지원합니다</p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">복리후생</h2>
            <p className="text-muted-foreground">직원들의 삶의 질을 높이는 다양한 혜택</p>
          </div>

          <div className="mb-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center transition-shadow hover:shadow-lg">
                <CardHeader>
                  <benefit.icon className="mx-auto mb-2 h-8 w-8 text-primary" />
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Work Environment */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">근무환경</h2>
            <p className="text-muted-foreground">쾌적하고 안전한 업무 공간</p>
          </div>

          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  근무환경 소개
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
                  <p className="text-muted-foreground">사무실 및 생산공장 사진</p>
                </div>
                <p className="text-muted-foreground">
                  쾌적하고 안전한 근무환경에서 직원들이 최고의 성과를 낼 수 있도록 지원합니다.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  직원 인터뷰
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <blockquote className="border-l-4 border-primary pl-4 italic">
                  "풍림푸드에서 일하며 느끼는 가장 큰 보람은 우리가 만든 제품이 고객들의 건강한 식탁에 오른다는 것입니다.
                  동료들과 함께 성장하며 의미 있는 일을 할 수 있어 행복합니다."
                </blockquote>
                <cite className="font-semibold text-primary">- 마케팅팀 김○○ 대리</cite>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Additional Benefits Details */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="mb-8 text-center text-3xl font-bold text-foreground">상세 복리후생 안내</h2>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>근무 시간 및 휴가</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground">
                <p>• 주 5일 근무 (월~금)</p>
                <p>• 연차휴가: 법정 연차 + 리프레시 휴가</p>
                <p>• 경조휴가: 본인 및 가족 경조사 시 유급휴가</p>
                <p>• 여름휴가: 하계휴가 지원</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>교육 및 성장 지원</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground">
                <p>• 신입사원 온보딩 프로그램</p>
                <p>• 직무별 전문 교육 과정</p>
                <p>• 외부 교육 및 세미나 참가 지원</p>
                <p>• 자격증 취득 비용 지원</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>건강 및 여가</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground">
                <p>• 종합 건강검진 (연 1회)</p>
                <p>• 의료비 지원</p>
                <p>• 사내 동호회 활동 지원</p>
                <p>• 체육시설 이용 지원</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

