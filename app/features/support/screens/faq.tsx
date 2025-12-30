import { useTranslation } from "react-i18next";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQScreen() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqData = [
    {
      category: "주문/배송",
      items: [
        {
          question: "배송은 얼마나 걸리나요?",
          answer: "주문 확인 후 영업일 기준 2-3일 내 배송됩니다. 도서산간 지역은 1-2일 추가 소요될 수 있습니다."
        },
        {
          question: "배송비는 얼마인가요?",
          answer: "5만원 이상 구매 시 무료배송이며, 5만원 미만 주문 시 3,000원의 배송비가 부과됩니다."
        },
        {
          question: "주문 취소는 어떻게 하나요?",
          answer: "상품 발송 전에는 마이페이지에서 직접 취소 가능하며, 발송 후에는 고객센터로 문의해 주세요."
        }
      ]
    },
    {
      category: "교환/환불",
      items: [
        {
          question: "교환 및 반품이 가능한가요?",
          answer: "상품 수령 후 7일 이내 미개봉 상태에서 교환 및 반품이 가능합니다. 식품 특성상 개봉 후에는 교환/반품이 불가합니다."
        },
        {
          question: "환불은 언제 되나요?",
          answer: "반품 상품 확인 후 영업일 기준 3-5일 내 환불 처리됩니다. 카드 결제의 경우 승인 취소가 진행됩니다."
        }
      ]
    },
    {
      category: "제품",
      items: [
        {
          question: "제품의 유통기한은 어떻게 되나요?",
          answer: "모든 제품은 제조일로부터 최소 30일 이상 남은 신선한 상태로 배송됩니다. 개별 제품의 유통기한은 포장지에 표기되어 있습니다."
        },
        {
          question: "알레르기 유발 성분이 포함되어 있나요?",
          answer: "각 제품의 상세 페이지에서 알레르기 유발 성분을 확인하실 수 있습니다. 추가 문의사항은 고객센터로 연락 주세요."
        },
        {
          question: "제품 보관 방법은 어떻게 되나요?",
          answer: "냉장/냉동 제품은 수령 즉시 냉장고/냉동고에 보관해 주세요. 실온 제품은 직사광선을 피해 서늘한 곳에 보관하시면 됩니다."
        }
      ]
    },
    {
      category: "회원/혜택",
      items: [
        {
          question: "회원가입 혜택이 있나요?",
          answer: "신규 회원 가입 시 3,000원 할인 쿠폰이 즉시 지급되며, 구매 금액의 1%가 적립됩니다."
        },
        {
          question: "적립금은 어떻게 사용하나요?",
          answer: "적립금은 5,000원 이상부터 1,000원 단위로 사용 가능하며, 전 상품에 제한 없이 사용하실 수 있습니다."
        }
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-4xl font-bold">
          {t("navigation.support.faq")}
        </h1>
        <p className="text-muted-foreground mb-12 text-lg">
          자주 묻는 질문을 확인해 보세요
        </p>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {faqData.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h2 className="mb-4 text-2xl font-bold">{section.category}</h2>
              <div className="space-y-2">
                {section.items.map((item, itemIndex) => {
                  const globalIndex = sectionIndex * 100 + itemIndex;
                  const isOpen = openIndex === globalIndex;
                  
                  return (
                    <div
                      key={itemIndex}
                      className="overflow-hidden rounded-lg border bg-card"
                    >
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-accent"
                      >
                        <span className="font-medium">{item.question}</span>
                        <ChevronDown
                          className={`size-5 shrink-0 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="border-t bg-muted/50 p-4">
                          <p className="text-muted-foreground leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 rounded-lg bg-[#1F4E3A] p-8 text-white">
          <h3 className="mb-2 text-xl font-bold text-white">
            원하는 답변을 찾지 못하셨나요?
          </h3>
          <p className="mb-4 text-white opacity-90">
            고객센터로 문의해 주시면 친절하게 안내해 드리겠습니다.
          </p>
          <div className="flex flex-wrap gap-4">
            <div>
              <p className="text-sm text-white opacity-75">전화 문의</p>
              <p className="text-lg font-bold text-white">1588-1234</p>
            </div>
            <div>
              <p className="text-sm text-white opacity-75">운영 시간</p>
              <p className="text-lg font-bold text-white">평일 09:00 - 18:00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

