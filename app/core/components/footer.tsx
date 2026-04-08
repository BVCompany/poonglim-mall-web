/**
 * Footer Component
 *
 * 풍림푸드 푸터 - 연락처, 네비게이션 링크, SNS
 */
import { ChevronDown, Facebook, Instagram } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import { PAGE_GUTTER_X } from "~/core/components/page-content-max";
import { cn } from "~/core/lib/utils";

function FooterAccordion({
  title,
  links,
}: {
  title: string;
  links: { name: string; href: string; external?: boolean }[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <h4 className="font-semibold text-white">{title}</h4>
        <ChevronDown
          className={`size-5 text-white/70 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <ul className="space-y-2 pb-4">
          {links.map((link) => (
            <li key={link.name}>
              {link.external ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/70 transition-colors hover:text-white"
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  to={link.href}
                  className="text-sm text-white/70 transition-colors hover:text-white"
                >
                  {link.name}
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const footerLinks = {
  company: [
    { name: "회사소개", href: "/brand/intro" },
    { name: "연혁", href: "/brand/history" },
    { name: "인증현황", href: "/brand/certifications" },
    { name: "공장 견학", href: "/brand/factory" },
    { name: "채용정보", href: "/careers/positions" },
  ],
  products: [
    { name: "액란 제품", href: "/products/egg" },
    { name: "푸딩 시리즈", href: "/products/pudding" },
    { name: "간편식", href: "/products/convenient" },
    { name: "전체제품", href: "/products/all" },
  ],
  support: [
    { name: "FAQ", href: "/support" },
    { name: "문의하기", href: "/support/inquiry" },
    { name: "자료실", href: "/support/resources" },
    { name: "고객후기", href: "/support/reviews" },
  ],
  business: [
    { name: "B2B상담", href: "/inquiry/b2b" },
    { name: "대량구매", href: "/inquiry/bulk" },
    { name: "파트너십", href: "/inquiry/partnership" },
    {
      name: "수발주시스템",
      href: "http://wos.freshegg.co.kr/",
      external: true,
    },
    { name: "수출문의", href: "/inquiry/export" },
  ],
};

/** SNS 아이콘 — 모바일은 좌측 열, lg~는 하단 행(로고와 baseline 정렬) */
function FooterSnsRow({ className }: { className?: string }) {
  return (
    <div className={cn("flex gap-4", className)}>
      <a
        href="https://www.facebook.com/poonglimfoods"
        target="_blank"
        rel="noopener noreferrer"
        className="text-white transition-colors hover:text-white/90"
        aria-label="Facebook"
      >
        <Facebook className="size-5 fill-white" />
      </a>
      <a
        href="https://www.instagram.com/poonglim_official"
        target="_blank"
        rel="noopener noreferrer"
        className="text-white/70 transition-colors hover:text-white"
        aria-label="Instagram"
      >
        <Instagram className="size-5" />
      </a>
      <a
        href="https://www.youtube.com/@poonglimfoods"
        target="_blank"
        rel="noopener noreferrer"
        className="text-white transition-colors hover:text-white/90"
        aria-label="YouTube"
      >
        <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden>
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      </a>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[var(--brand-green)] text-white">
      {/* gutter는 본문(PageContentMax)과 동일. 안쪽 max-width만 시안 비율로 축소 → 맥북 등에서 좌우 정렬 일치 */}
      <div className={cn(PAGE_GUTTER_X, "py-10 md:py-12 lg:py-14")}>
        {/* 모바일: 세로 스택 / lg~: 그리드 — 1행 연락처|네비, 2행 SNS|로고(하단선 맞춤) */}
        <div
          className={cn(
            "mx-auto flex min-h-0 w-full max-w-[var(--content-max-width)] flex-col gap-10",
            "lg:grid lg:min-h-[360px] lg:grid-cols-[min(363px,calc(363*100vw/1920))_minmax(0,1fr)]",
            "lg:items-stretch lg:gap-x-[min(121px,calc(121*100vw/1920))] lg:gap-y-[min(40px,calc(48*100vw/1920))]",
          )}
        >
        {/* 좌측 영역: 시안 363px — 그리드에서는 열 폭으로만 제한 */}
        <div className="flex w-full flex-shrink-0 flex-col gap-6 lg:col-start-1 lg:row-start-1 lg:w-auto lg:max-w-none">
          {/* 주소 그룹: 로고 + 연락처 */}
          <div className="flex flex-col gap-6 lg:pb-6">
            {/* 모바일: 로고 상단 */}
            <div className="lg:hidden">
              <Link to="/">
                <img
                  src="/home/poonglim-food-footer-logo.png"
                  alt="Poonglim Foods"
                  className="h-8 w-auto object-contain"
                />
              </Link>
            </div>
            <div>
              <h4 className="mb-2 font-semibold text-white">고객상담실</h4>
              <p className="text-sm text-white/80">1588-2311</p>
              <p className="mt-1 text-xs text-white/70">
                평일 09:00~17:00 / 주말과 공휴일은 쉽니다.
              </p>
            </div>
            <div>
              <p className="text-xs text-white/70">사업자등록번호: 219-86-00445</p>
              <p className="mt-1 text-xs text-white/70">대표이사: 김철수</p>
            </div>
            <div>
              <h4 className="mb-2 font-semibold text-white">본점</h4>
              <p className="text-sm text-white/80">
                대전 유성구 테크노2로 250(용산동)
              </p>
              <p className="mt-1 text-xs text-white/70">
                TEL: 042-930-3333 / FAX: 042-930-3300
              </p>
            </div>
            <div>
              <h4 className="mb-2 font-semibold text-white">지점</h4>
              <p className="text-sm text-white/80">
                충북 음성군 원남면 상경로 167-17
              </p>
              <p className="mt-1 text-xs text-white/70">
                TEL: 043-881-3072 / FAX: 043-881-3033
              </p>
            </div>
          </div>

          {/* 모바일·태블릿만: lg에서는 하단 행에서 네비와 같은 선상으로 배치 */}
          <FooterSnsRow className="pt-8 lg:hidden" />
        </div>

        {/* 우측: 네비만 (로고는 그리드 2행에서 전체 열 가운데) */}
        <div className="hidden w-full min-w-0 flex-col items-start md:flex lg:col-start-2 lg:row-start-1">
            <div className="flex w-full min-w-0 flex-1 flex-col gap-8 max-md:hidden">
              <div className="grid w-full min-w-0 grid-cols-4 gap-8">
                <div>
                  <h4 className="mb-4 font-semibold text-white">회사정보</h4>
                  <ul className="space-y-2">
                    {footerLinks.company.map((link) => (
                      <li key={link.name}>
                        <Link
                          to={link.href}
                          className="text-sm text-white/70 transition-colors hover:text-white"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="mb-4 font-semibold text-white">제품정보</h4>
                  <ul className="space-y-2">
                    {footerLinks.products.map((link) => (
                      <li key={link.name}>
                        <Link
                          to={link.href}
                          className="text-sm text-white/70 transition-colors hover:text-white"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="mb-4 font-semibold text-white">고객지원</h4>
                  <ul className="space-y-2">
                    {footerLinks.support.map((link) => (
                      <li key={link.name}>
                        <Link
                          to={link.href}
                          className="text-sm text-white/70 transition-colors hover:text-white"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="mb-4 font-semibold text-white">파트너십</h4>
                  <ul className="space-y-2">
                    {footerLinks.business.map((link) => (
                      <li key={link.name}>
                        {link.external ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-white/70 transition-colors hover:text-white"
                          >
                            {link.name}
                          </a>
                        ) : (
                          <Link
                            to={link.href}
                            className="text-sm text-white/70 transition-colors hover:text-white"
                          >
                            {link.name}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

        {/* lg~: 2행 전체 폭 — 로고는 max-width 박스 기준 정확히 가운데(우측 열 가운데가 아님), SNS는 좌하단 */}
        <div className="relative hidden min-h-10 lg:col-span-2 lg:row-start-2 lg:block">
          <div className="flex items-end">
            <FooterSnsRow className="relative z-10 w-[min(363px,calc(363*100vw/1920))] shrink-0" />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
            <Link to="/" className="pointer-events-auto inline-block leading-none">
              <img
                src="/home/poonglim-food-footer-logo.png"
                alt="Poonglim Foods"
                className="h-10 w-auto object-contain"
              />
            </Link>
          </div>
        </div>
        </div>
      </div>
    </footer>
  );
}
