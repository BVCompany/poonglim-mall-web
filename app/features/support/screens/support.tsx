import { useState } from "react";
import { Button } from "~/core/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/core/components/ui/card";
import { Badge } from "~/core/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/core/components/ui/accordion";
import { Phone, Mail, MessageCircle, Clock, Search, HelpCircle, FileText, Users } from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQCategory {
  category: string;
  questions: FAQ[];
}

const faqs: FAQCategory[] = [
  {
    category: "주문 및 배송",
    questions: [
      {
        question: "주문은 어떻게 하나요?",
        answer:
          "온라인 쇼핑몰에서 직접 주문하시거나, 전화(1588-1234) 또는 이메일(sales@pungrimfood.co.kr)로 주문하실 수 있습니다. B2B 고객의 경우 전담 영업팀을 통해 주문 가능합니다.",
      },
      {
        question: "배송은 얼마나 걸리나요?",
        answer:
          "일반 주문의 경우 주문 후 1-2일 내 배송됩니다. 대용량 주문이나 맞춤 제품의 경우 3-5일 정도 소요될 수 있습니다. 모든 제품은 콜드체인 시스템으로 신선하게 배송됩니다.",
      },
      {
        question: "배송비는 얼마인가요?",
        answer:
          "5만원 이상 주문 시 무료배송이며, 그 이하는 3,000원의 배송비가 부과됩니다. 제주도 및 도서산간 지역은 추가 배송비가 발생할 수 있습니다.",
      },
    ],
  },
  {
    category: "제품 정보",
    questions: [
      {
        question: "제품의 유통기한은 어떻게 되나요?",
        answer:
          "액상계란 제품은 냉장보관 시 제조일로부터 14일, 푸딩 제품은 21일입니다. 모든 제품에는 제조일과 유통기한이 명확히 표시되어 있습니다.",
      },
      {
        question: "알레르기 정보를 확인할 수 있나요?",
        answer:
          "모든 제품 포장지에 알레르기 유발 요소가 명시되어 있습니다. 계란, 우유, 대두 등의 알레르기 정보는 제품 상세 페이지에서도 확인하실 수 있습니다.",
      },
      {
        question: "보관 방법은 어떻게 되나요?",
        answer:
          "모든 제품은 냉장보관(0-4°C)이 필요합니다. 개봉 후에는 밀폐용기에 보관하시고 가능한 빨리 사용하시기 바랍니다.",
      },
    ],
  },
  {
    category: "B2B 서비스",
    questions: [
      {
        question: "B2B 할인 혜택은 무엇인가요?",
        answer:
          "수량에 따라 5-15%의 차등 할인을 제공합니다. 정기 주문 고객에게는 추가 할인 혜택이 있으며, 전담 영업팀을 통해 맞춤형 가격을 제안받으실 수 있습니다.",
      },
      {
        question: "맞춤형 제품 개발이 가능한가요?",
        answer:
          "네, 가능합니다. 최소 주문량과 개발 기간에 대해서는 별도 상담이 필요합니다. 전담 R&D팀이 고객의 요구사항에 맞는 제품을 개발해드립니다.",
      },
      {
        question: "정기 배송 서비스는 어떻게 이용하나요?",
        answer:
          "B2B 고객 대상으로 주 1-3회 정기 배송 서비스를 제공합니다. 배송 주기와 수량은 사업장 특성에 맞게 조정 가능하며, 긴급 주문도 대응 가능합니다.",
      },
    ],
  },
];

export default function SupportScreen() {
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
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold text-foreground md:text-5xl">고객 지원</h1>
            <p className="mb-8 text-xl text-muted-foreground">
              궁금한 점이 있으시면 언제든지 문의해주세요. 전문 상담원이 친절하게 도와드립니다.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg">
                <MessageCircle className="mr-2 h-5 w-5" />
                실시간 채팅
              </Button>
              <Button size="lg" variant="outline">
                <Phone className="mr-2 h-5 w-5" />
                전화 상담
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">연락 방법</h2>
            <p className="text-muted-foreground">다양한 방법으로 문의하실 수 있습니다</p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            <Card className="text-center transition-shadow hover:shadow-lg">
              <CardHeader>
                <Phone className="mx-auto mb-4 h-12 w-12 text-primary" />
                <CardTitle>전화 상담</CardTitle>
                <CardDescription>즉시 상담 가능</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-lg font-semibold">1588-1234</p>
                  <Badge variant="secondary" className="mt-1">
                    무료
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>평일 09:00 - 18:00</span>
                  </div>
                  <p>토요일 09:00 - 13:00</p>
                  <p>일요일 및 공휴일 휴무</p>
                </div>
                <Button className="w-full">지금 전화하기</Button>
              </CardContent>
            </Card>

            <Card className="text-center transition-shadow hover:shadow-lg">
              <CardHeader>
                <Mail className="mx-auto mb-4 h-12 w-12 text-primary" />
                <CardTitle>이메일 문의</CardTitle>
                <CardDescription>상세한 문의 가능</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-semibold">support@pungrimfood.co.kr</p>
                  <Badge variant="secondary" className="mt-1">
                    24시간 접수
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>1영업일 내 답변</p>
                  <p>첨부파일 전송 가능</p>
                  <p>상세한 문의 내용 작성 가능</p>
                </div>
                <Button className="w-full bg-transparent" variant="outline">
                  이메일 보내기
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center transition-shadow hover:shadow-lg">
              <CardHeader>
                <MessageCircle className="mx-auto mb-4 h-12 w-12 text-primary" />
                <CardTitle>실시간 채팅</CardTitle>
                <CardDescription>빠른 답변 제공</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-semibold">온라인 채팅</p>
                  <Badge variant="secondary" className="mt-1">
                    즉시 연결
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>평일 09:00 - 18:00</p>
                  <p>평균 응답시간 2분</p>
                  <p>간단한 문의에 최적</p>
                </div>
                <Button className="w-full">채팅 시작하기</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">자주 묻는 질문</h2>
            <p className="text-muted-foreground">고객님들이 자주 문의하시는 내용을 정리했습니다</p>
          </div>

          <div className="mx-auto max-w-4xl">
            {/* Search Bar */}
            <div className="relative mb-8">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-muted-foreground" />
              <input
                type="text"
                placeholder="궁금한 내용을 검색해보세요..."
                className="w-full rounded-lg border border-input py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* FAQ Categories */}
            <div className="space-y-8">
              {faqs.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    {category.category}
                  </h3>
                  <Accordion type="single" collapsible className="space-y-2">
                    {category.questions.map((faq, index) => (
                      <AccordionItem
                        key={index}
                        value={`${categoryIndex}-${index}`}
                        className="rounded-lg border border-border px-4"
                      >
                        <AccordionTrigger className="text-left hover:no-underline">{faq.question}</AccordionTrigger>
                        <AccordionContent className="pb-4 pt-2 text-muted-foreground">{faq.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground">문의하기</h2>
              <p className="text-muted-foreground">FAQ에서 답을 찾지 못하셨나요? 직접 문의해주세요.</p>
            </div>

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
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid gap-4 md:grid-cols-2">
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
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">이메일 *</label>
                      <input
                        type="email"
                        className="w-full rounded-md border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="example@email.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">문의 유형 *</label>
                      <select
                        className="w-full rounded-md border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      >
                        <option value="">선택해주세요</option>
                        <option value="order">주문 관련</option>
                        <option value="product">제품 문의</option>
                        <option value="delivery">배송 문의</option>
                        <option value="quality">품질 문의</option>
                        <option value="b2b">B2B 문의</option>
                        <option value="other">기타</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">제목 *</label>
                      <input
                        type="text"
                        className="w-full rounded-md border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="문의 제목을 입력해주세요"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">문의 내용 *</label>
                      <textarea
                        rows={5}
                        className="w-full rounded-md border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="문의하실 내용을 자세히 적어주세요"
                        required
                      ></textarea>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">첨부파일</label>
                      <input
                        type="file"
                        multiple
                        className="w-full rounded-md border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        최대 5MB, jpg, png, pdf 파일만 업로드 가능
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="privacy" className="rounded" required />
                      <label htmlFor="privacy" className="text-sm text-muted-foreground">
                        개인정보 수집 및 이용에 동의합니다 *
                      </label>
                    </div>

                    <Button type="submit" className="w-full" size="lg">
                      문의 접수하기
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">추가 자료</h2>
            <p className="text-muted-foreground">더 자세한 정보가 필요하시면 아래 자료를 참고해주세요</p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
            <Card className="text-center transition-shadow hover:shadow-lg">
              <CardHeader>
                <FileText className="mx-auto mb-4 h-12 w-12 text-primary" />
                <CardTitle>제품 카탈로그</CardTitle>
                <CardDescription>전체 제품 정보</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  풍림푸드의 모든 제품 정보와 영양성분, 사용법을 담은 종합 카탈로그
                </p>
                <Button variant="outline" className="w-full bg-transparent">
                  다운로드
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center transition-shadow hover:shadow-lg">
              <CardHeader>
                <Users className="mx-auto mb-4 h-12 w-12 text-primary" />
                <CardTitle>사용자 매뉴얼</CardTitle>
                <CardDescription>제품 활용 가이드</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  제품별 보관법, 조리법, 주의사항 등을 상세히 안내하는 매뉴얼
                </p>
                <Button variant="outline" className="w-full bg-transparent">
                  다운로드
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center transition-shadow hover:shadow-lg">
              <CardHeader>
                <HelpCircle className="mx-auto mb-4 h-12 w-12 text-primary" />
                <CardTitle>품질 인증서</CardTitle>
                <CardDescription>안전성 확인</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  HACCP, ISO 등 각종 품질 인증서와 검사 성적서 모음
                </p>
                <Button variant="outline" className="w-full bg-transparent">
                  다운로드
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
