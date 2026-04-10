/**
 * Footer Component
 *
 * 풍림푸드 푸터 — 피그마 시안(#003F2B, py60·px240, 연락처/네비/로고)
 */
import { ChevronDown, Facebook, Instagram } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import { cn } from "~/core/lib/utils";

/* ── 링크 데이터 ── */
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
    { name: "푸딩 시리즈", href: "/products/pudding", underline: true },
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
    { name: "수발주시스템", href: "http://wos.freshegg.co.kr/", external: true },
    { name: "수출문의", href: "/inquiry/export" },
  ],
};

/* ── 연락처 데이터 ── */
const contactGroups = [
  {
    label: "고객상담실",
    lines: ["080-299-9292", "평일 09:00 ~ 17:00 / 주말과 공휴일은 쉽니다."],
    mobileBody: "080-299-9292\n평일 09:00 ~ 17:00 / 주말과 공휴일은 쉽니다.",
  },
  {
    label: "본사/공장",
    lines: [
      "충청북도 진천군 이월면 궁동길 51-21",
      "TEL : 043-533-2285 / FAX : 043-533-2988",
    ],
    mobileBody: "본사/공장 : 충청북도 진천군 이월면 궁동길 51-21\nTEL : 043-533-2285 / FAX : 043-533-2988",
  },
  {
    label: "서울 사무소",
    lines: [
      "서울특별시 강남구 봉은사로 64번길 5",
      "TEL : 02-538-5617 / FAX : 02-538-5623",
    ],
    mobileBody: "서울특별시 강남구 봉은사로 64번길 5\nTEL : 02-538-5617 / FAX : 02-538-5623",
  },
];

type NavLink = { name: string; href: string; external?: boolean; underline?: boolean };

const navSections: { title: string; links: NavLink[] }[] = [
  { title: "회사정보", links: footerLinks.company },
  { title: "제품정보", links: footerLinks.products },
  { title: "고객지원", links: footerLinks.support },
  { title: "B2B/파트너십", links: footerLinks.business },
];

/* ── 공통 타이포 ── */
const labelClass =
  "font-sans font-bold text-[#FDFDF5] [font-size:clamp(12px,calc(14*100vw/1920),14px)] [line-height:clamp(16px,calc(18.2*100vw/1920),18.2px)]";
const bodyClass =
  "font-sans font-normal text-[rgba(253,253,245,0.60)] [font-size:clamp(12px,calc(14*100vw/1920),14px)] [line-height:clamp(18px,calc(21*100vw/1920),21px)]";
const navHeadClass =
  "font-sans font-extrabold text-[#FDFDF5] [font-size:clamp(15px,calc(20*100vw/1920),20px)] [line-height:clamp(22px,calc(26*100vw/1920),26px)]";
const navLinkClass =
  "font-sans font-normal text-[#FDFDF5] [font-size:clamp(13px,calc(16*100vw/1920),16px)] [line-height:clamp(22px,calc(25.6*100vw/1920),25.6px)] hover:opacity-70 transition-opacity";

/* ── SNS 버튼 행 ── */
function FooterSns({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-[clamp(8px,calc(12*100vw/1920),12px)]", className)}>
      {/* Facebook */}
      <a
        href="https://www.facebook.com/poonglimfoods"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
        className="flex h-[clamp(32px,calc(40*100vw/1920),40px)] w-[clamp(32px,calc(40*100vw/1920),40px)] items-center justify-center rounded-full bg-[#003F2B] ring-1 ring-white/20 transition-opacity hover:opacity-70"
      >
        <Facebook className="h-[clamp(14px,calc(20*100vw/1920),20px)] w-[clamp(14px,calc(20*100vw/1920),20px)] fill-[#FDFDF5] text-[#FDFDF5]" />
      </a>
      {/* Instagram */}
      <a
        href="https://www.instagram.com/poonglim_official"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className="flex h-[clamp(32px,calc(40*100vw/1920),40px)] w-[clamp(32px,calc(40*100vw/1920),40px)] items-center justify-center rounded-full bg-[#003F2B] ring-1 ring-white/20 transition-opacity hover:opacity-70"
      >
        <Instagram className="h-[clamp(14px,calc(20*100vw/1920),20px)] w-[clamp(14px,calc(20*100vw/1920),20px)] text-[#FDFDF5]" />
      </a>
      {/* YouTube */}
      <a
        href="https://www.youtube.com/@poonglimfoods"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="YouTube"
        className="flex h-[clamp(32px,calc(40*100vw/1920),40px)] w-[clamp(32px,calc(40*100vw/1920),40px)] items-center justify-center rounded-full bg-[#003F2B] ring-1 ring-white/20 transition-opacity hover:opacity-70"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-[clamp(14px,calc(20*100vw/1920),20px)] w-[clamp(14px,calc(20*100vw/1920),20px)] fill-[#FDFDF5]"
          aria-hidden
        >
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      </a>
    </div>
  );
}

/* ── 모바일 아코디언 ── */
function FooterAccordion({
  title,
  links,
}: {
  title: string;
  links: { name: string; href: string; external?: boolean; underline?: boolean }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className={navHeadClass}>{title}</span>
        <ChevronDown
          className={cn(
            "size-4 text-[#FDFDF5]/60 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>
      {isOpen && (
        <ul className="flex flex-col gap-3 pb-4">
          {links.map((link) =>
            link.external ? (
              <li key={link.name}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(navLinkClass, link.underline && "underline")}
                >
                  {link.name}
                </a>
              </li>
            ) : (
              <li key={link.name}>
                <Link
                  to={link.href}
                  className={cn(navLinkClass, link.underline && "underline")}
                >
                  {link.name}
                </Link>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="w-full">
      {/*
        모바일: 본문(Outlet)과 딥그린 푸터 사이 140px — navigation.layout 배경(#F4F2E5)과 동일.
        페이지별 pb 중복 없이 여기서만 유지.
      */}
      <div
        className="block h-[140px] w-full shrink-0 bg-[#F4F2E5] md:hidden"
        aria-hidden
      />

      <div className="w-full bg-[#003F2B]">
      {/* ════════════════════════════════════
          모바일 푸터 (md 미만)
          구조: 로고 → 연락처 → SNS
          ════════════════════════════════════ */}
      <div className="flex flex-col gap-10 border-t border-[#DDDDDD] px-4 py-[60px] md:hidden">
        <div className="flex flex-col gap-[30px]">

          {/* 로고 */}
          <Link to="/" className="inline-block leading-none">
            <img
              src="/home/poonglim-food-footer-logo.png"
              alt="Poonglim Foods"
              className="h-[38px] w-auto object-contain"
            />
          </Link>

          {/* 연락처 + SNS */}
          <div className="flex flex-col gap-[60px]">
            {/* 연락처 그룹 */}
            <div className="flex flex-col gap-5">
              {contactGroups.map((g) => (
                <div key={g.label} className="flex flex-col gap-[10px]">
                  <p
                    className="text-[14px] font-bold leading-[18.2px] text-[#FDFDF5]"
                    style={{ fontFamily: "NanumSquareRound" }}
                  >
                    {g.label}
                  </p>
                  <p
                    className="whitespace-pre-line text-[14px] font-normal leading-[21px]"
                    style={{ color: "rgba(253,253,245,0.60)", fontFamily: "NanumSquareRound" }}
                  >
                    {g.mobileBody}
                  </p>
                </div>
              ))}
            </div>

            {/* SNS */}
            <FooterSns />
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
          PC 푸터 (md 이상)
          ════════════════════════════════════ */}
      <div
        className="hidden md:flex md:flex-col md:gap-[clamp(24px,calc(60*100vw/1920),60px)]"
        style={{
          paddingTop: "clamp(32px, calc(60 * 100vw / 1920), 60px)",
          paddingBottom: "clamp(32px, calc(60 * 100vw / 1920), 60px)",
          paddingLeft: "clamp(16px, calc(240 * 100vw / 1920), 240px)",
          paddingRight: "clamp(16px, calc(240 * 100vw / 1920), 240px)",
        }}
      >
        {/* ── 메인 행: 좌(연락처) | 우(네비+로고) ── */}
        <div className="flex flex-col gap-10 lg:flex-row lg:items-stretch lg:justify-between">

          {/* ── 좌: 연락처 + SNS ── */}
          <div
            className={cn(
              "flex flex-col justify-between gap-[clamp(24px,calc(60*100vw/1920),60px)]",
              "lg:w-[clamp(240px,calc(363*100vw/1920),363px)] lg:shrink-0",
              "lg:border-r lg:border-[rgba(253,253,245,0.10)] lg:pr-[clamp(16px,calc(40*100vw/1920),40px)]",
              "lg:min-h-[clamp(240px,calc(360*100vw/1920),360px)]",
            )}
          >
            {/* 연락처 그룹 */}
            <div className="flex flex-col gap-[clamp(16px,calc(20*100vw/1920),20px)]">
              {contactGroups.map((g) => (
                <div
                  key={g.label}
                  className="flex flex-col gap-[clamp(6px,calc(10*100vw/1920),10px)]"
                >
                  <p className={labelClass}>{g.label}</p>
                  <div className="flex flex-col gap-[clamp(6px,calc(12*100vw/1920),12px)]">
                    {g.lines.map((line) => (
                      <p key={line} className={bodyClass}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* SNS */}
            <FooterSns />
          </div>

          {/* ── 우: 네비 + 로고 ── */}
          <div className="flex min-w-0 flex-1 flex-col justify-between gap-[clamp(24px,calc(60*100vw/1920),60px)]">
            {/* 네비 — md~lg 아코디언 / lg+ 4열 그리드 */}
            <div className="block lg:hidden">
              {navSections.map((s) => (
                <FooterAccordion key={s.title} title={s.title} links={s.links} />
              ))}
            </div>

            <div className="hidden min-w-0 flex-1 lg:grid lg:grid-cols-4 lg:items-start lg:gap-[clamp(8px,calc(12*100vw/1920),12px)]">
              {navSections.map((s) => (
                <div
                  key={s.title}
                  className="flex flex-col gap-[clamp(12px,calc(20*100vw/1920),20px)]"
                >
                  <p className={navHeadClass}>{s.title}</p>
                  <ul className="flex flex-col gap-[clamp(6px,calc(12*100vw/1920),12px)]">
                    {s.links.map((link) =>
                      link.external ? (
                        <li key={link.name}>
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(navLinkClass, link.underline && "underline")}
                          >
                            {link.name}
                          </a>
                        </li>
                      ) : (
                        <li key={link.name}>
                          <Link
                            to={link.href}
                            className={cn(navLinkClass, link.underline && "underline")}
                          >
                            {link.name}
                          </Link>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              ))}
            </div>

            {/* 로고 */}
            <div className="flex items-end">
              <Link to="/" className="inline-block leading-none">
                <img
                  src="/home/poonglim-food-footer-logo.png"
                  alt="Poonglim Foods"
                  className="h-auto w-auto object-contain"
                  style={{ maxHeight: "clamp(36px, calc(60 * 100vw / 1920), 60px)" }}
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
    </footer>
  );
}
