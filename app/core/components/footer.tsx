/**
 * Footer Component
 *
 * 풍림푸드 푸터 — 피그마 시안(#003F2B, py60·px240, 연락처/네비/로고)
 */
import type { TFunction } from "i18next";
import { ChevronDown, Instagram } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";

import { getMegaNavSections, type MegaSectionId } from "~/core/lib/public-mega-nav";
import { cn } from "~/core/lib/utils";

type NavLink = { name: string; href: string; external?: boolean; underline?: boolean };

function buildFooterContacts(t: TFunction) {
  return [
    {
      label: t("footer.customerServiceLabel"),
      lines: ["080-299-9292", t("footer.customerServiceHours")],
      mobileBody: t("footer.customerServiceMobileBlock"),
    },
    {
      label: t("footer.hqLabel"),
      lines: [t("footer.hqAddress"), t("footer.hqTelFax")],
      mobileBody: t("footer.hqMobileBlock"),
    },
    {
      label: t("footer.seoulLabel"),
      lines: [t("footer.seoulAddress"), t("footer.seoulTelFax")],
      mobileBody: t("footer.seoulMobileBlock"),
    },
  ];
}

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
      {/* Instagram */}
      <a
        href="https://www.instagram.com/poonglim.official"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className="flex h-[clamp(32px,calc(40*100vw/1920),40px)] w-[clamp(32px,calc(40*100vw/1920),40px)] items-center justify-center rounded-full bg-[#003F2B] ring-1 ring-white/20 transition-opacity hover:opacity-70"
      >
        <Instagram className="h-[clamp(14px,calc(20*100vw/1920),20px)] w-[clamp(14px,calc(20*100vw/1920),20px)] text-[#FDFDF5]" />
      </a>
    </div>
  );
}

/* ── 모바일 아코디언 ── */
function FooterAccordion({
  sectionId,
  title,
  links,
}: {
  sectionId: MegaSectionId;
  title: string;
  links: { name: string; href: string; external?: boolean; underline?: boolean }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/10" data-footer-section={sectionId}>
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
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const contactGroups = buildFooterContacts(t);
  const navSections = getMegaNavSections(t).map((s) => ({
    id: s.id,
    title: s.title,
    links: s.links.map((l) => ({
      name: l.name,
      href: l.href,
      external: l.external,
    })) as NavLink[],
  }));
  /** 계란이야기: 모바일 CTA(아이보리)가 푸터로 바로 이어지도록 크림 스페이서 생략 */
  const showMobileChromeSpacer = pathname !== "/products/egg-story";

  return (
    <footer className="w-full">
      {/*
        모바일: 본문(Outlet)과 딥그린 푸터 사이 140px — navigation.layout의 --site-chrome-bg와 동일.
        계란이야기(/products/egg-story) 모바일만 예외. 페이지별 pb 중복 없이 여기서만 유지.
      */}
      {showMobileChromeSpacer ? (
        <div
          className="block h-[140px] w-full shrink-0 bg-[var(--site-chrome-bg,#FDFDF5)] md:hidden"
          aria-hidden
        />
      ) : null}

      <div className="w-full bg-[#003F2B]">
      {/* 본문(pc-fluid-root max-w-[1920px])과 동일 폭으로 중앙 정렬 — 초대형 뷰포트에서 푸터만 퍼지는 현상 방지 */}
      <div className="mx-auto w-full max-w-[1920px]">
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
        className={cn(
          "hidden md:flex md:flex-col md:gap-[clamp(24px,calc(60*100vw/1920),60px)] md:px-6 md:py-[clamp(32px,calc(60*100vw/1920),60px)]",
          /* 피그마 PC: 좌우 padding 240px @1920 — md~lg는 기존 px-6 유지 */
          "lg:px-[clamp(40px,calc(240*100vw/1920),240px)]",
        )}
      >
        {/* ── 메인 행: 좌(연락처+SNS) | gap | 우(네비+로고) — 피그마: 좌우 패딩 240@1920, 열 사이 Auto 간격 → clamp gap ── */}
        <div className="flex flex-col gap-10 lg:flex-row lg:items-stretch lg:justify-start lg:gap-[clamp(28px,calc(120*100vw/1920),120px)]">

          {/* ── 좌: 연락처 + SNS (363×360, border-r, 내부 gap 60) ── */}
          <div
            className={cn(
              "flex flex-col justify-between gap-[clamp(24px,calc(60*100vw/1920),60px)]",
              "lg:w-[clamp(240px,calc(363*100vw/1920),363px)] lg:shrink-0",
              "lg:border-r lg:border-[rgba(253,253,245,0.10)] lg:pr-[clamp(16px,calc(40*100vw/1920),40px)]",
              "lg:min-h-[clamp(240px,calc(360*100vw/1920),360px)]",
            )}
          >
            {/* 연락처 그룹 — 피그마: flex 1 1 0, 열 간 gap 20px */}
            <div className="flex flex-col gap-[clamp(16px,calc(20*100vw/1920),20px)] lg:min-h-0 lg:flex-1">
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

            <FooterSns />
          </div>

          {/* ── 우: 네비 + 로고 (피그마: 세로 gap 60, 네비 행 열 gap 12, 4×230) ── */}
          <div
            className={cn(
              "flex min-w-0 flex-1 flex-col justify-between gap-[clamp(24px,calc(60*100vw/1920),60px)]",
              "lg:min-h-[clamp(240px,calc(360*100vw/1920),360px)]",
            )}
          >
            {/* 네비 — md~lg 아코디언 / lg+ 4열 그리드 */}
            <div className="block lg:hidden">
              {navSections.map((s) => (
                <FooterAccordion
                  key={s.id}
                  sectionId={s.id}
                  title={s.title}
                  links={s.links}
                />
              ))}
            </div>

            <div className="hidden min-w-0 flex-1 lg:grid lg:grid-cols-4 lg:items-start lg:gap-[clamp(8px,calc(12*100vw/1920),12px)]">
              {navSections.map((s) => (
                <div
                  key={s.id}
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

            {/* 로고 — 피그마: 약 462×60.69 */}
            <div className="flex items-end">
              <Link to="/" className="inline-block max-w-full leading-none">
                <img
                  src="/home/poonglim-food-footer-logo.png"
                  alt="Poonglim Foods"
                  className="h-auto w-auto max-w-[min(462px,100%)] object-contain"
                  style={{ maxHeight: "clamp(36px, calc(60.69 * 100vw / 1920), 60.69px)" }}
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
      </div>
    </footer>
  );
}
