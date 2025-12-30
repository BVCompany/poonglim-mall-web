import { Button } from "~/core/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/core/components/ui/card";
import { ShoppingCart, Building2, Phone, Mail, MapPin, CheckCircle } from "lucide-react";
import { Link } from "react-router";

export default function OnlineInquiryScreen() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="mb-4 text-balance text-4xl font-bold md:text-5xl">구매 및 상담</h1>
          <p className="text-pretty text-xl opacity-90">풍림푸드의 프리미엄 제품을 만나보세요</p>
        </div>
      </section>

      {/* Purchase Options */}
      <section className="bg-background py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            {/* B2C Section */}
            <Card className="border-2 transition-colors hover:border-primary/50">
              <CardHeader className="pb-4 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <ShoppingCart className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">일반 소비자</CardTitle>
                <CardDescription>가정용 프리미엄 제품</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>온라인 쇼핑몰 직접 주문</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>전국 대형마트 매장 구매</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>소량 주문 가능</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>빠른 배송 서비스</span>
                  </div>
                </div>
                <div className="pt-4">
                  <Button asChild className="w-full" size="lg">
                    <a href="https://smartstore.naver.com/poonglimfoods" target="_blank" rel="noopener noreferrer">
                      온라인 쇼핑몰 바로가기
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* B2B Section */}
            <Card className="border-2 transition-colors hover:border-primary/50">
              <CardHeader className="pb-4 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">사업자</CardTitle>
                <CardDescription>카페, 베이커리, 레스토랑</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>대용량 주문 할인</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>맞춤형 제품 개발</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>전담 영업 담당자</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>정기 배송 서비스</span>
                  </div>
                </div>
                <div className="pt-4">
                  <Button asChild className="w-full" size="lg" variant="outline">
                    <Link to="/inquiry/bulk" viewTransition>
                      B2B 상담 신청
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">상담 및 문의</h2>
            <p className="text-muted-foreground">전문 상담원이 친절하게 도와드립니다</p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            <Card>
              <CardHeader className="text-center">
                <Phone className="mx-auto mb-2 h-8 w-8 text-primary" />
                <CardTitle>전화 상담</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-center">
                <p className="text-lg font-semibold">043-878-7800</p>
                <p className="text-sm text-muted-foreground">평일 09:00 - 18:00</p>
                <p className="text-sm text-muted-foreground">토요일 09:00 - 13:00</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Mail className="mx-auto mb-2 h-8 w-8 text-primary" />
                <CardTitle>이메일 문의</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-center">
                <p className="font-semibold">info@poonglim.co.kr</p>
                <p className="text-sm text-muted-foreground">24시간 접수</p>
                <p className="text-sm text-muted-foreground">1영업일 내 답변</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <MapPin className="mx-auto mb-2 h-8 w-8 text-primary" />
                <CardTitle>방문 상담</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-center">
                <p className="text-sm">충청북도 진천군 이월면 사석리</p>
                <p className="text-sm text-muted-foreground">사전 예약 필수</p>
                <Button variant="outline" size="sm" className="mt-2">
                  예약하기
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="bg-background py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground">상담 신청</h2>
              <p className="text-muted-foreground">간단한 정보를 입력해주시면 전문 상담원이 연락드립니다</p>
            </div>

            <Card>
              <CardContent className="p-6">
                <form className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium">이름 *</label>
                      <input
                        type="text"
                        className="w-full rounded-md border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="홍길동"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">연락처 *</label>
                      <input
                        type="tel"
                        className="w-full rounded-md border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="010-1234-5678"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">이메일</label>
                    <input
                      type="email"
                      className="w-full rounded-md border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="example@email.com"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">상담 유형 *</label>
                    <select className="w-full rounded-md border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="">선택해주세요</option>
                      <option value="b2c">일반 소비자 문의</option>
                      <option value="b2b">사업자 문의</option>
                      <option value="product">제품 문의</option>
                      <option value="partnership">파트너십 문의</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">문의 내용 *</label>
                    <textarea
                      rows={4}
                      className="w-full rounded-md border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="문의하실 내용을 자세히 적어주세요"
                    ></textarea>
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="privacy" className="rounded" />
                    <label htmlFor="privacy" className="text-sm text-muted-foreground">
                      개인정보 수집 및 이용에 동의합니다
                    </label>
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    상담 신청하기
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
