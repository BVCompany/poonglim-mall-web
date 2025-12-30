import { useState } from "react";
import type React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import { Textarea } from "~/core/components/ui/textarea";
import { Card, CardContent } from "~/core/components/ui/card";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
} from "lucide-react";

export default function FactoryTourScreen() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="text-balance mb-4 text-4xl font-bold md:text-5xl">
            공장 견학 신청
          </h1>
          <p className="text-pretty text-xl opacity-90">
            풍림푸드의 첨단 생산 시설과 품질 관리 시스템을 직접 확인해보세요
          </p>
        </div>
      </section>

      {/* Tour Information */}
      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-balance mb-12 text-center text-3xl font-bold">
            견학 안내
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold">운영 일정</h3>
                    <p className="text-sm text-muted-foreground">
                      월~금 (공휴일 제외)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold">견학 시간</h3>
                    <p className="text-sm text-muted-foreground">
                      오전 10시 / 오후 2시
                      <br />
                      (약 2시간 소요)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold">인원</h3>
                    <p className="text-sm text-muted-foreground">
                      최소 10명 ~ 최대 30명
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold">위치</h3>
                    <p className="text-sm text-muted-foreground">
                      충청북도 음성군
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tour Program */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-balance mb-12 text-center text-3xl font-bold">
            견학 프로그램
          </h2>
          <div className="space-y-6">
            {[
              {
                time: "10:00",
                title: "오리엔테이션",
                desc: "회사 소개 및 안전 교육",
              },
              {
                time: "10:30",
                title: "생산 시설 견학",
                desc: "액란 가공 라인 및 제품 생산 과정 관람",
              },
              {
                time: "11:00",
                title: "품질 관리실 방문",
                desc: "HACCP 시스템 및 품질 검사 과정 소개",
              },
              {
                time: "11:30",
                title: "제품 시식 및 Q&A",
                desc: "풍림푸드 제품 시식 및 질의응답",
              },
            ].map((item, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {item.time}
                        </span>
                      </div>
                      <h3 className="mb-1 text-lg font-semibold">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-balance mb-4 text-center text-3xl font-bold">
            견학 신청
          </h2>
          <p className="mb-12 text-center text-muted-foreground">
            신청서를 작성해주시면 담당자가 확인 후 연락드리겠습니다
          </p>

          {submitted && (
            <Card className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="font-medium">
                    신청이 완료되었습니다. 담당자가 곧 연락드리겠습니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="organization">단체명/회사명 *</Label>
                    <Input id="organization" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">신청자 성함 *</Label>
                    <Input id="name" required />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">연락처 *</Label>
                    <Input id="phone" type="tel" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">이메일 *</Label>
                    <Input id="email" type="email" required />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date">희망 날짜 *</Label>
                    <Input id="date" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">희망 시간 *</Label>
                    <select
                      id="time"
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">선택하세요</option>
                      <option value="10:00">오전 10시</option>
                      <option value="14:00">오후 2시</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="participants">참가 인원 *</Label>
                  <Input
                    id="participants"
                    type="number"
                    min="10"
                    max="30"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">견학 목적</Label>
                  <Textarea id="purpose" rows={4} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">기타 문의사항</Label>
                  <Textarea id="message" rows={4} />
                </div>

                <Button type="submit" size="lg" className="w-full">
                  신청하기
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-balance mb-12 text-center text-3xl font-bold">
            문의하기
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold">전화 문의</h3>
                    <p className="text-muted-foreground">043-000-0000</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      평일 09:00 - 18:00
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold">이메일 문의</h3>
                    <p className="text-muted-foreground">tour@poonglim.com</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      24시간 접수 가능
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
