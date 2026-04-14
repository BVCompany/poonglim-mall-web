import { Link, data } from "react-router";
import type { Route } from "./+types/detail";
import { Button } from "~/core/components/ui/button";
import { Breadcrumb } from "~/core/components/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/core/components/ui/card";
import { Badge } from "~/core/components/ui/badge";
import { Separator } from "~/core/components/ui/separator";
import { MapPin, Clock, Users, GraduationCap, Building2, CheckCircle, ArrowLeft } from "lucide-react";
import { getJobPostingById } from "../lib/queries.server";

const JOB_TYPE_LABEL: Record<string, string> = {
  full_time: "정규직", part_time: "파트타임", contract: "계약직", intern: "인턴",
};
const EXP_LABEL: Record<string, string> = {
  entry: "신입", experienced: "경력", senior: "시니어", all: "신입/경력",
};

export async function loader({ params }: Route.LoaderArgs) {
  const id = Number(params.id);
  if (!id) throw data("Not Found", { status: 404 });

  const job = await getJobPostingById(id).catch(() => null);
  if (!job || job.status !== "open") throw data("Not Found", { status: 404 });

  return { job };
}

const HIRING_PROCESS = ["서류전형", "1차 면접 (실무진)", "2차 면접 (임원진)", "최종 합격"];

export default function CareerDetailScreen({ loaderData }: Route.ComponentProps) {
  const { job } = loaderData;

  const requirements = job.requirements
    ? job.requirements.split("\n").filter(Boolean)
    : [];
  const benefits = job.benefits
    ? job.benefits.split("\n").filter(Boolean)
    : [];

  const isNew = job.created_at
    ? (Date.now() - new Date(job.created_at).getTime()) < 1000 * 60 * 60 * 24 * 14
    : false;

  const deadlineStr = job.deadline
    ? new Date(job.deadline).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
    : "상시 모집";

  return (
    <div className="min-h-screen bg-[var(--site-chrome-header-bg,#F4F2E5)]">
      <Breadcrumb
        items={[
          { label: "채용", href: "/careers/positions" },
          { label: "채용공고" },
        ]}
      />
      <div className="container mx-auto px-4 py-8">
        <Link to="/careers/positions" className="mb-6 inline-flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          채용 공고 목록으로 돌아가기
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Job Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="mb-2 text-2xl">{job.title}</CardTitle>
                    <CardDescription className="text-lg">{job.department}</CardDescription>
                  </div>
                  {isNew && (
                    <Badge className="bg-green-100 text-green-800">신규</Badge>
                  )}
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{JOB_TYPE_LABEL[job.job_type] ?? job.job_type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{EXP_LABEL[job.experience_level] ?? job.experience_level}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">~{deadlineStr}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-muted-foreground">{job.description}</p>
              </CardContent>
            </Card>

            {/* Requirements */}
            {requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>지원 자격</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {requirements.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {benefits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>복리후생</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 md:grid-cols-2">
                    {benefits.map((benefit, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 flex-shrink-0 text-primary" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Selection Process */}
            <Card>
              <CardHeader>
                <CardTitle>전형 절차</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4 md:flex-row">
                  {HIRING_PROCESS.map((step, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                          {i + 1}
                        </div>
                        <span className="font-medium">{step}</span>
                      </div>
                      {i < HIRING_PROCESS.length - 1 && (
                        <div className="hidden h-0.5 w-8 bg-muted md:block" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-center">지원하기</CardTitle>
                <CardDescription className="text-center">마감일: {deadlineStr}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link to={`/careers/${job.job_id}/apply`} viewTransition>
                  <Button className="w-full" size="lg">온라인 지원하기</Button>
                </Link>
                <div className="text-center text-sm text-muted-foreground">
                  <p>지원서 작성 시간: 약 5-10분</p>
                </div>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  회사 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-semibold">풍림푸드</h4>
                  <p className="text-sm text-muted-foreground">식품 제조업</p>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">설립</p>
                    <p className="text-muted-foreground">1984년</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">모집 인원</p>
                    <p className="text-muted-foreground">{job.headcount ?? 1}명</p>
                  </div>
                </div>
                <Link to="/brand/intro" viewTransition>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    회사 소개 보기
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle>채용 문의</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">인사팀</p>
                <p>hr@pungrimfood.co.kr</p>
                <p>평일 09:00 - 18:00</p>
                <p className="text-xs">(점심시간 12:00 - 13:00 제외)</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
