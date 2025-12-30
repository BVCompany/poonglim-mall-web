import { useState } from "react";
import { Link } from "react-router";
import { Button } from "~/core/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/core/components/ui/card";
import { Badge } from "~/core/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/core/components/ui/accordion";
import { Users, GraduationCap, MapPin, Clock, Search } from "lucide-react";

interface JobPosting {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  deadline: string;
  isNew?: boolean;
  isHot?: boolean;
  description: string;
}

const jobPostings: JobPosting[] = [
  {
    id: 1,
    title: "마케팅 전문가",
    department: "마케팅팀",
    location: "서울 본사",
    type: "정규직",
    experience: "경력 3-5년",
    deadline: "2024.12.31",
    isNew: true,
    description: "브랜드 마케팅 및 디지털 마케팅 전략 수립",
  },
  {
    id: 2,
    title: "생산관리 담당자",
    department: "생산팀",
    location: "경기 공장",
    type: "정규직",
    experience: "경력 2-4년",
    deadline: "2024.12.25",
    isHot: true,
    description: "생산 공정 관리 및 품질 관리 업무",
  },
  {
    id: 3,
    title: "R&D 연구원",
    department: "연구개발팀",
    location: "서울 본사",
    type: "정규직",
    experience: "신입/경력",
    deadline: "2025.01.15",
    isNew: true,
    description: "신제품 개발 및 기존 제품 개선 연구",
  },
  {
    id: 4,
    title: "영업 담당자",
    department: "영업팀",
    location: "전국",
    type: "정규직",
    experience: "경력 1-3년",
    deadline: "2024.12.20",
    description: "B2B 고객 관리 및 신규 고객 개발",
  },
];

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "지원 방법은 어떻게 되나요?",
    answer:
      "온라인 지원서 작성 후 이메일(hr@pungrimfood.co.kr)로 제출하시거나, 채용 공고 페이지에서 직접 지원하실 수 있습니다.",
  },
  {
    question: "제출해야 할 서류는 무엇인가요?",
    answer: "이력서, 자기소개서, 포트폴리오(해당 직무), 졸업증명서, 경력증명서(경력자)를 제출해주세요.",
  },
  {
    question: "전형 절차는 어떻게 진행되나요?",
    answer: "서류전형 → 1차 면접(실무진) → 2차 면접(임원진) → 최종 합격 순으로 진행됩니다.",
  },
  {
    question: "합격자 발표는 언제 하나요?",
    answer: "각 전형 단계별로 1주일 내에 개별 연락드리며, 최종 합격자는 면접 후 3일 내에 발표합니다.",
  },
];

export default function CareersPositionsScreen() {
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold text-foreground md:text-5xl">채용 공고</h1>
            <p className="mb-8 text-xl text-muted-foreground">
              풍림푸드와 함께 성장할 인재를 찾습니다. 현재 모집 중인 포지션을 확인해보세요.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link to="/careers/talent" viewTransition>
                <Button size="lg" variant="outline">
                  인재상 보기
                </Button>
              </Link>
              <Link to="/careers/benefits" viewTransition>
                <Button size="lg" variant="outline">
                  복리후생 보기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Job Postings */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">모집 중인 포지션</h2>
            <p className="text-muted-foreground">지금 지원 가능한 채용 공고를 확인하세요</p>
          </div>

          {/* Filters */}
          <div className="mx-auto mb-8 flex max-w-4xl flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-muted-foreground" />
              <input
                type="text"
                placeholder="직무명으로 검색..."
                className="w-full rounded-md border border-input py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <select className="rounded-md border border-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">전체 직무</option>
              <option value="marketing">마케팅</option>
              <option value="production">생산관리</option>
              <option value="rd">연구개발</option>
              <option value="sales">영업</option>
            </select>
            <select className="rounded-md border border-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">전체 근무지</option>
              <option value="seoul">서울</option>
              <option value="gyeonggi">경기</option>
              <option value="nationwide">전국</option>
            </select>
          </div>

          {/* Job Cards */}
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
            {jobPostings.map((job) => (
              <Card key={job.id} className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="mb-2 text-xl">{job.title}</CardTitle>
                      <CardDescription className="text-base">{job.department}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {job.isNew && <Badge className="bg-green-100 text-green-800">신규</Badge>}
                      {job.isHot && <Badge className="bg-red-100 text-red-800">급구</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{job.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{job.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span>{job.experience}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>~{job.deadline}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Link to={`/careers/${job.id}/apply`} className="flex-1" viewTransition>
                      <Button className="w-full">지원하기</Button>
                    </Link>
                    <Link to={`/careers/${job.id}`} viewTransition>
                      <Button variant="outline">상세보기</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & FAQ */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
            {/* Contact */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-foreground">채용 문의</h2>
              <Card>
                <CardContent className="p-6">
                  {formSubmitted ? (
                    <div className="py-8 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <svg
                          className="h-8 w-8 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="mb-2 text-xl font-semibold">문의가 접수되었습니다</h3>
                      <p className="text-muted-foreground">빠른 시일 내에 답변드리겠습니다.</p>
                    </div>
                  ) : (
                    <form className="space-y-4" onSubmit={handleSubmit}>
                      <div>
                        <label className="mb-2 block text-sm font-medium">이름 *</label>
                        <input
                          type="text"
                          className="w-full rounded-md border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="홍길동"
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">연락처 *</label>
                        <input
                          type="tel"
                          className="w-full rounded-md border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="010-1234-5678"
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">문의 내용 *</label>
                        <textarea
                          rows={4}
                          className="w-full rounded-md border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="궁금한 내용을 입력해주세요"
                          required
                        ></textarea>
                      </div>
                      <Button type="submit" className="w-full">
                        문의하기
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-foreground">자주 묻는 질문</h2>
              <Accordion type="single" collapsible className="space-y-2">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`} className="rounded-lg border border-border px-4">
                    <AccordionTrigger className="text-left hover:no-underline">{faq.question}</AccordionTrigger>
                    <AccordionContent className="pb-4 pt-2 text-muted-foreground">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
