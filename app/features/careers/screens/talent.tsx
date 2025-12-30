import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/core/components/ui/card";
import { Heart, Shield, Lightbulb, Leaf, Users } from "lucide-react";

interface IdealTrait {
  icon: typeof Heart;
  title: string;
  description: string;
}

const idealCandidateTraits: IdealTrait[] = [
  {
    icon: Heart,
    title: "건강",
    description: "고객의 건강을 최우선으로 생각하는 마음",
  },
  {
    icon: Shield,
    title: "신뢰",
    description: "정직하고 책임감 있는 업무 태도",
  },
  {
    icon: Lightbulb,
    title: "혁신",
    description: "새로운 아이디어로 변화를 이끄는 창의성",
  },
  {
    icon: Leaf,
    title: "지속가능성",
    description: "미래를 생각하는 환경 친화적 사고",
  },
];

interface GrowthStory {
  name: string;
  department: string;
  years: string;
  story: string;
}

const growthStories: GrowthStory[] = [
  {
    name: "이○○ 팀장",
    department: "생산관리팀",
    years: "입사 8년차",
    story:
      "신입사원으로 입사해 현재 팀장까지 성장했습니다. 회사의 체계적인 교육 시스템과 동료들의 지원 덕분에 전문성을 키울 수 있었습니다.",
  },
  {
    name: "박○○ 연구원",
    department: "R&D팀",
    years: "입사 5년차",
    story:
      "지속가능한 제품 개발에 참여하며 환경을 생각하는 기업 문화를 직접 체험하고 있습니다. 의미 있는 연구를 통해 성취감을 느낍니다.",
  },
  {
    name: "김○○ 대리",
    department: "마케팅팀",
    years: "입사 3년차",
    story:
      "고객과 소통하며 브랜드 가치를 전달하는 일에 보람을 느낍니다. 회사의 성장과 함께 개인적으로도 많은 발전을 이룰 수 있었습니다.",
  },
];

export default function CareersTalentScreen() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold text-foreground md:text-5xl">풍림푸드가 추구하는 인재상</h1>
            <p className="text-xl text-muted-foreground">건강한 미래를 함께 만들어갈 동반자를 찾습니다</p>
          </div>
        </div>
      </section>

      {/* Ideal Candidate */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {idealCandidateTraits.map((trait, index) => (
              <Card key={index} className="text-center transition-shadow hover:shadow-lg">
                <CardHeader>
                  <trait.icon className="mx-auto mb-4 h-12 w-12 text-primary" />
                  <CardTitle className="text-xl">{trait.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{trait.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CEO Message */}
          <Card className="mx-auto mb-16 max-w-4xl border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="p-8">
              <div className="flex flex-col items-center gap-6 md:flex-row">
                <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-primary/20">
                  <Users className="h-12 w-12 text-primary" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="mb-3 text-xl font-bold text-foreground">대표이사 메시지</h3>
                  <blockquote className="text-lg leading-relaxed italic text-muted-foreground">
                    "풍림푸드는 단순히 제품을 만드는 회사가 아닙니다. 고객의 건강한 식탁을 책임지고, 지속가능한 미래를
                    만들어가는 기업입니다. 이런 가치를 함께 실현해나갈 열정적인 인재들을 기다리고 있습니다."
                  </blockquote>
                  <cite className="mt-4 block font-semibold text-primary">- 풍림푸드 대표이사 정연현</cite>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Growth Stories */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">풍림에서 성장한 사람들</h2>
            <p className="text-muted-foreground">ESG 가치와 함께 성장하는 직원들의 이야기</p>
          </div>

          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            {growthStories.map((story, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>{story.name}</CardTitle>
                  <CardDescription>
                    {story.department} • {story.years}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <blockquote className="italic text-muted-foreground">"{story.story}"</blockquote>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
