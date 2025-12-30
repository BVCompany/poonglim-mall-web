import { Link, useParams } from "react-router";
import { Button } from "~/core/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/core/components/ui/card";
import { Badge } from "~/core/components/ui/badge";
import { Separator } from "~/core/components/ui/separator";
import { MapPin, Clock, Users, GraduationCap, Building2, CheckCircle, ArrowLeft } from "lucide-react";

interface JobDetail {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  deadline: string;
  isNew?: boolean;
  description: string;
  responsibilities: string[];
  requirements: string[];
  preferred: string[];
  benefits: string[];
  process: string[];
}

// Mock data - in real app this would come from database
const jobDetails: Record<number, JobDetail> = {
  1: {
    id: 1,
    title: "마케팅 전문가",
    department: "마케팅팀",
    location: "서울 본사",
    type: "정규직",
    experience: "경력 3-5년",
    deadline: "2024.12.31",
    isNew: true,
    description: "브랜드 마케팅 및 디지털 마케팅 전략 수립",
    responsibilities: [
      "브랜드 마케팅 전략 수립 및 실행",
      "디지털 마케팅 캠페인 기획 및 운영",
      "시장 조사 및 경쟁사 분석",
      "마케팅 성과 분석 및 보고서 작성",
      "외부 에이전시 및 파트너사 관리",
    ],
    requirements: [
      "마케팅 관련 학과 졸업 또는 관련 경력 3년 이상",
      "디지털 마케팅 경험 필수",
      "데이터 분석 능력 및 관련 툴 활용 가능",
      "원활한 커뮤니케이션 및 협업 능력",
      "식품업계 경험자 우대",
    ],
    preferred: [
      "Google Analytics, Facebook Business Manager 활용 경험",
      "콘텐츠 기획 및 제작 경험",
      "브랜드 런칭 경험",
      "영어 가능자 우대",
    ],
    benefits: [
      "4대보험 완비",
      "연차 15일 + 리프레시 휴가",
      "교육비 지원",
      "중식 제공",
      "경조사비 지원",
      "건강검진 지원",
    ],
    process: ["서류전형", "1차 면접 (실무진)", "2차 면접 (임원진)", "최종 합격"],
  },
  2: {
    id: 2,
    title: "생산관리 담당자",
    department: "생산팀",
    location: "경기 공장",
    type: "정규직",
    experience: "경력 2-4년",
    deadline: "2024.12.25",
    description: "생산 공정 관리 및 품질 관리 업무",
    responsibilities: [
      "생산 공정 관리 및 개선",
      "품질관리 및 HACCP 시스템 운영",
      "생산 계획 수립 및 실행",
      "생산 효율성 분석 및 개선",
      "안전 관리 및 환경 관리",
    ],
    requirements: [
      "식품공학, 화학공학 등 관련 학과 졸업",
      "생산관리 경력 2년 이상",
      "품질관리 및 안전관리 지식 보유",
      "ERP 시스템 활용 가능",
      "HACCP 인증 경험자 우대",
    ],
    preferred: ["식품안전기사 자격증 보유", "HACCP 관리자 과정 이수", "공장 자동화 시스템 경험", "팀 리더십 경험"],
    benefits: [
      "4대보험 완비",
      "연차 15일 + 리프레시 휴가",
      "교육비 지원",
      "중식 제공",
      "경조사비 지원",
      "건강검진 지원",
    ],
    process: ["서류전형", "1차 면접 (실무진)", "2차 면접 (임원진)", "최종 합격"],
  },
  3: {
    id: 3,
    title: "R&D 연구원",
    department: "연구개발팀",
    location: "서울 본사",
    type: "정규직",
    experience: "신입/경력",
    deadline: "2025.01.15",
    isNew: true,
    description: "신제품 개발 및 기존 제품 개선 연구",
    responsibilities: [
      "신제품 개발 연구 및 실험",
      "기존 제품 개선 연구",
      "연구 결과 분석 및 보고서 작성",
      "특허 출원 및 관리",
      "외부 연구기관과의 협업",
    ],
    requirements: [
      "식품공학, 생명공학 등 관련 학과 석사 이상",
      "식품 연구개발 경험 (신입 가능)",
      "실험 설계 및 데이터 분석 능력",
      "논문 작성 및 프레젠테이션 능력",
      "새로운 기술에 대한 호기심과 열정",
    ],
    preferred: ["식품 관련 특허 출원 경험", "국제 학술지 논문 게재 경험", "영어 능통자", "산학협력 프로젝트 경험"],
    benefits: [
      "4대보험 완비",
      "연차 15일 + 리프레시 휴가",
      "교육비 지원",
      "중식 제공",
      "경조사비 지원",
      "건강검진 지원",
    ],
    process: ["서류전형", "1차 면접 (실무진)", "2차 면접 (임원진)", "최종 합격"],
  },
  4: {
    id: 4,
    title: "영업 담당자",
    department: "영업팀",
    location: "전국",
    type: "정규직",
    experience: "경력 1-3년",
    deadline: "2024.12.20",
    description: "B2B 고객 관리 및 신규 고객 개발",
    responsibilities: [
      "B2B 고객 관리 및 영업 활동",
      "신규 고객 발굴 및 시장 개척",
      "영업 목표 달성 및 실적 관리",
      "고객 니즈 파악 및 제안서 작성",
      "계약 체결 및 사후 관리",
    ],
    requirements: [
      "영업 경력 1년 이상 (식품업계 우대)",
      "고객 응대 및 협상 능력",
      "운전면허 보유 (필수)",
      "MS Office 활용 능력",
      "출장 가능자",
    ],
    preferred: ["식품업계 영업 경험", "대형 유통업체 영업 경험", "영업 실적 우수자", "네트워크 보유자"],
    benefits: [
      "4대보험 완비",
      "연차 15일 + 리프레시 휴가",
      "교육비 지원",
      "중식 제공",
      "경조사비 지원",
      "건강검진 지원",
      "영업 인센티브",
    ],
    process: ["서류전형", "1차 면접 (실무진)", "2차 면접 (임원진)", "최종 합격"],
  },
};

export default function CareerDetailScreen() {
  const { id } = useParams();
  const job = jobDetails[Number(id) || 1];

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="mb-4 text-2xl font-bold">채용 공고를 찾을 수 없습니다</h1>
          <Link to="/careers/positions">
            <Button>채용 페이지로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
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
                  <div className="flex gap-2">
                    {job.isNew && <Badge className="bg-green-100 text-green-800">신규</Badge>}
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{job.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{job.experience}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">~{job.deadline}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{job.description}</p>
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>주요 업무</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.responsibilities.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>지원 자격</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="mb-3 font-semibold">필수 요건</h4>
                  <ul className="space-y-2">
                    {job.requirements.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Separator />
                <div>
                  <h4 className="mb-3 font-semibold">우대 사항</h4>
                  <ul className="space-y-2">
                    {job.preferred.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>복리후생</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 md:grid-cols-2">
                  {job.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 flex-shrink-0 text-primary" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Selection Process */}
            <Card>
              <CardHeader>
                <CardTitle>전형 절차</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4 md:flex-row">
                  {job.process.map((step, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                          {index + 1}
                        </div>
                        <span className="font-medium">{step}</span>
                      </div>
                      {index < job.process.length - 1 && <div className="hidden h-0.5 w-8 bg-muted md:block"></div>}
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
                <CardDescription className="text-center">마감일: {job.deadline}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link to={`/careers/${job.id}/apply`} viewTransition>
                  <Button className="w-full" size="lg">
                    온라인 지원하기
                  </Button>
                </Link>
                <Button variant="outline" className="w-full bg-transparent">
                  관심 공고 저장
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  <p>지원서 작성 시간: 약 10-15분</p>
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
                <div>
                  <h4 className="font-semibold">설립</h4>
                  <p className="text-sm text-muted-foreground">1984년</p>
                </div>
                <div>
                  <h4 className="font-semibold">직원 수</h4>
                  <p className="text-sm text-muted-foreground">200명</p>
                </div>
                <div>
                  <h4 className="font-semibold">주요 사업</h4>
                  <p className="text-sm text-muted-foreground">액상계란, 푸딩, 편의식품 제조</p>
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
              <CardContent className="space-y-2">
                <div>
                  <h4 className="font-semibold">인사팀</h4>
                  <p className="text-sm text-muted-foreground">hr@pungrimfood.co.kr</p>
                  <p className="text-sm text-muted-foreground">02-1234-5678</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>평일 09:00 - 18:00</p>
                  <p>(점심시간 12:00 - 13:00 제외)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

