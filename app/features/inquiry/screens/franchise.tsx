import { useTranslation } from "react-i18next";
import { Store, TrendingUp, Users } from "lucide-react";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";

export default function InquiryFranchiseScreen() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-4xl font-bold">
          {t("navigation.inquiry.franchise")}
        </h1>
        <p className="text-muted-foreground mb-12 text-lg">
          풍림푸드와 함께 성공적인 비즈니스를 시작하세요
        </p>

        {/* Hero Image */}
        <div className="mb-12 overflow-hidden rounded-lg">
          <img
            src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200"
            alt="가맹점"
            className="h-64 w-full object-cover"
          />
        </div>

        {/* Benefits */}
        <div className="mb-12 grid gap-6 md:grid-cols-3">
          <div className="flex flex-col items-center text-center p-6 rounded-lg border">
            <div className="bg-primary/10 text-primary mb-4 flex size-16 items-center justify-center rounded-full">
              <Store className="size-8" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">브랜드 파워</h3>
            <p className="text-muted-foreground text-sm">
              검증된 브랜드로 안정적 시작
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-lg border">
            <div className="bg-primary/10 text-primary mb-4 flex size-16 items-center justify-center rounded-full">
              <TrendingUp className="size-8" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">수익성</h3>
            <p className="text-muted-foreground text-sm">
              높은 마진율과 안정적 수익
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-lg border">
            <div className="bg-primary/10 text-primary mb-4 flex size-16 items-center justify-center rounded-full">
              <Users className="size-8" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">운영 지원</h3>
            <p className="text-muted-foreground text-sm">
              체계적인 교육 및 운영 지원
            </p>
          </div>
        </div>

        {/* Franchise Info */}
        <div className="mb-12 rounded-lg border bg-card p-8">
          <h2 className="mb-6 text-2xl font-semibold">가맹점 개설 절차</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-full font-bold">
                1
              </div>
              <div>
                <h3 className="mb-1 font-semibold">상담 신청</h3>
                <p className="text-muted-foreground text-sm">
                  가맹 문의를 통한 상담 신청
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-full font-bold">
                2
              </div>
              <div>
                <h3 className="mb-1 font-semibold">입지 분석</h3>
                <p className="text-muted-foreground text-sm">
                  점포 위치 및 상권 분석
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-full font-bold">
                3
              </div>
              <div>
                <h3 className="mb-1 font-semibold">계약 체결</h3>
                <p className="text-muted-foreground text-sm">
                  가맹 계약 및 교육
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-full font-bold">
                4
              </div>
              <div>
                <h3 className="mb-1 font-semibold">오픈</h3>
                <p className="text-muted-foreground text-sm">
                  점포 오픈 및 운영 시작
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="rounded-lg border bg-card p-8">
          <h2 className="mb-6 text-2xl font-semibold">가맹 문의하기</h2>
          <form className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="name">이름 *</Label>
                <Input id="name" placeholder="홍길동" required />
              </div>
              <div>
                <Label htmlFor="phone">연락처 *</Label>
                <Input id="phone" type="tel" placeholder="010-0000-0000" required />
              </div>
            </div>

            <div>
              <Label htmlFor="email">이메일 *</Label>
              <Input id="email" type="email" placeholder="example@email.com" required />
            </div>

            <div>
              <Label htmlFor="location">희망 지역</Label>
              <Input id="location" placeholder="예: 서울 강남구" />
            </div>

            <div>
              <Label htmlFor="message">문의 내용</Label>
              <textarea
                id="message"
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[120px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                placeholder="가맹 관련 문의사항을 입력해주세요"
              />
            </div>

            <Button type="submit" size="lg" className="w-full">
              상담 신청하기
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

