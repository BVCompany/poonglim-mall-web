/**
 * Footer Component
 *
 * A comprehensive footer with company information, navigation links, and contact details.
 * This component appears at the bottom of every page and provides essential information
 * and quick access to various sections of the website.
 *
 * Features:
 * - Responsive design with mobile accordion and desktop grid layout
 * - Company information and social media links
 * - Four sections: Company, Products, Support, Business
 * - Contact information (phone, email, address)
 * - Copyright and office information
 */
import { Link } from "react-router";
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * FooterAccordion Component
 * 
 * Mobile-only accordion component for collapsible footer sections
 */
function FooterAccordion({ title, links }: { title: string; links: { name: string; href: string; external?: boolean }[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-background/20">
      <button onClick={() => setIsOpen(!isOpen)} className="flex w-full items-center justify-between py-4 text-left">
        <h4 className="font-semibold">{title}</h4>
        <ChevronDown className={`size-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
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
                  className="text-sm text-background/70 transition-colors hover:text-background"
                >
                  {link.name}
                </a>
              ) : (
                <Link to={link.href} className="text-sm text-background/70 transition-colors hover:text-background">
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

/**
 * Main Footer Component
 */
export default function Footer() {
  const { t } = useTranslation();

  const footerLinks = {
    company: [
      { name: "브랜드 소개", href: "/brand/intro" },
      { name: "브랜드 히스토리", href: "/brand/history" },
      { name: "비전", href: "/brand/vision" },
      { name: "채용정보", href: "/careers/positions" },
    ],
    products: [
      { name: "제품 카테고리 1", href: "/products/category1" },
      { name: "제품 카테고리 2", href: "/products/category2" },
      { name: "제품 카테고리 3", href: "/products/category3" },
      { name: "전체 제품", href: "/products/all" },
    ],
    support: [
      { name: "FAQ", href: "/support" },
      { name: "문의하기", href: "/support" },
      { name: "고객후기", href: "/support" },
    ],
    business: [
      { name: "온라인 구매", href: "/inquiry/online" },
      { name: "대량구매", href: "/inquiry/bulk" },
      { name: "가맹점 문의", href: "/inquiry/franchise" },
      { name: "수발주시스템", href: "http://wos.freshegg.co.kr/", external: true },
    ],
  };

  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-screen-xl px-6 py-16">
        {/* Company Info */}
        <div className="mb-8">
          <h3 className="mb-4 text-2xl font-bold">풍림푸드</h3>
          <p className="text-pretty mb-6 text-sm text-background/70">
            건강하고 풍요로운 일상을 만드는
            <br />
            프리미엄 식품 전문기업
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-background/70 transition-colors hover:text-background">
              <Facebook className="size-5" />
            </a>
            <a href="#" className="text-background/70 transition-colors hover:text-background">
              <Instagram className="size-5" />
            </a>
            <a href="#" className="text-background/70 transition-colors hover:text-background">
              <Youtube className="size-5" />
            </a>
          </div>
        </div>

        {/* Mobile Accordion */}
        <div className="md:hidden">
          <FooterAccordion title="회사정보" links={footerLinks.company} />
          <FooterAccordion title="제품정보" links={footerLinks.products} />
          <FooterAccordion title="고객지원" links={footerLinks.support} />
          <FooterAccordion title="비즈니스" links={footerLinks.business} />
        </div>

        {/* Desktop Grid */}
        <div className="mb-12 hidden gap-8 md:grid md:grid-cols-4">
          <div>
            <h4 className="mb-4 font-semibold">회사정보</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-background/70 transition-colors hover:text-background">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">제품정보</h4>
            <ul className="space-y-2">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-background/70 transition-colors hover:text-background">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">고객지원</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-background/70 transition-colors hover:text-background">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">비즈니스</h4>
            <ul className="space-y-2">
              {footerLinks.business.map((link) => (
                <li key={link.name}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-background/70 transition-colors hover:text-background"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link to={link.href} className="text-sm text-background/70 transition-colors hover:text-background">
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 border-t border-background/20 pt-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <Phone className="size-5 text-background/70" />
              <div>
                <p className="text-sm font-medium">고객상담실</p>
                <p className="text-sm text-background/70">080-299-9292</p>
                <p className="mt-1 text-xs text-background/60">
                  평일 09:00 ~ 17:00
                  <br />
                  주말과 공휴일은 쉽니다.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="size-5 text-background/70" />
              <div>
                <p className="text-sm font-medium">이메일</p>
                <p className="text-sm text-background/70">Info@poonglim.co.kr</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="size-5 text-background/70" />
              <div>
                <p className="text-sm font-medium">본사/공장</p>
                <p className="text-sm text-background/70">충청북도 진천군 이월면 궁동길 51-21</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-background/20 pt-8">
          <div className="space-y-3 text-xs text-background/70">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <p>
                <span className="font-medium">본사/공장:</span> 충청북도 진천군 이월면 궁동길 51-21
                <br />
                TEL: 043-533-2285 / FAX: 043-533-2988
              </p>
              <p>
                <span className="font-medium">서울사무소:</span> 서울특별시 강남구 봉은사로 64길 5
                <br />
                TEL: 02-538-5617 / FAX: 02-538-5623
              </p>
            </div>
            <p className="pt-4 text-center">COPYRIGHT ⓒ (주)풍림푸드 ALL RIGHT RESERVED.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
