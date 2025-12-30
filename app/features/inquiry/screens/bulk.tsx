import { Button } from "~/core/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/core/components/ui/card";
import { Badge } from "~/core/components/ui/badge";
import { Users, TrendingUp, Shield, Truck, HeadphonesIcon } from "lucide-react";

export default function BulkInquiryScreen() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4">B2B 전용</Badge>
            <h1 className="mb-6 text-4xl font-bold text-foreground md:text-5xl">사업자 전용 서비스</h1>
            <p className="mb-8 text-xl text-muted-foreground">
              카페, 베이커리, 레스토랑을 위한 프리미엄 식자재 솔루션
            </p>
            <Button size="lg" className="mr-4">
              상담 신청하기
            </Button>
            <Button size="lg" variant="outline">
              카탈로그 다운로드
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">B2B 서비스 혜택</h2>
            <p className="text-muted-foreground">사업 성공을 위한 차별화된 서비스</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="text-center">
              <CardHeader>
                <TrendingUp className="mx-auto mb-4 h-12 w-12 text-primary" />
                <CardTitle>대용량 할인</CardTitle>
                <CardDescription>수량에 따른 차등 할인 혜택</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 100개 이상: 5% 할인</li>
                  <li>• 500개 이상: 10% 할인</li>
                  <li>• 1000개 이상: 15% 할인</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="mx-auto mb-4 h-12 w-12 text-primary" />
                <CardTitle>품질 보장</CardTitle>
                <CardDescription>엄격한 품질 관리 시스템</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• HACCP 인증 시설</li>
                  <li>• 실시간 품질 모니터링</li>
                  <li>• 100% 품질 보증</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Truck className="mx-auto mb-4 h-12 w-12 text-primary" />
                <CardTitle>정기 배송</CardTitle>
                <CardDescription>안정적인 공급 시스템</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 주 1-3회 정기 배송</li>
                  <li>• 콜드체인 시스템</li>
                  <li>• 긴급 주문 대응</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">B2B 전용 제품군</h2>
            <p className="text-muted-foreground">업종별 맞춤형 제품 라인업</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "카페 전용",
                description: "음료 및 디저트용 프리미엄 액상계란",
                products: ["라떼용 액상계란", "디저트용 푸딩믹스", "베이킹용 계란물"],
                badge: "인기",
              },
              {
                title: "베이커리 전용",
                description: "제빵 전문가를 위한 고품질 재료",
                products: ["제빵용 액상계란", "크림용 푸딩베이스", "케이크용 계란믹스"],
                badge: "신제품",
              },
              {
                title: "레스토랑 전용",
                description: "요리 전문가를 위한 대용량 제품",
                products: ["요리용 액상계란", "소스용 계란베이스", "대용량 푸딩"],
                badge: "할인",
              },
            ].map((category, index) => (
              <Card key={index} className="relative">
                {category.badge && <Badge className="absolute -right-2 -top-2 z-10">{category.badge}</Badge>}
                <CardHeader>
                  <CardTitle>{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="mb-4 space-y-2">
                    {category.products.map((product, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground">
                        • {product}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full">
                    자세히 보기
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Support */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">전담 지원 서비스</h2>
            <p className="text-muted-foreground">성공적인 사업 운영을 위한 토탈 솔루션</p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <Users className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>전담 영업팀</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">업종별 전문 영업 담당자가 배정되어 맞춤형 서비스를 제공합니다.</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• 정기 방문 상담</li>
                  <li>• 신제품 우선 소개</li>
                  <li>• 맞춤형 솔루션 제안</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <HeadphonesIcon className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>24시간 고객지원</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">언제든지 문의하실 수 있는 전용 고객지원 서비스를 운영합니다.</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• 긴급 주문 대응</li>
                  <li>• 기술 지원 서비스</li>
                  <li>• 품질 관련 즉시 대응</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">지금 시작하세요</h2>
          <p className="mb-8 text-xl opacity-90">풍림푸드와 함께 더 나은 비즈니스를 만들어가세요</p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary">
              무료 상담 신청
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              제품 카탈로그 받기
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
