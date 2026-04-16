import { ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

import { SectionPageTitle } from "~/core/components/section-title-star";
import { cn } from "~/core/lib/utils";

interface CompanyIntroProps {
  image?: string | null;
  title?: string | null;
  link?: string | null;
}

const DEFAULT_IMAGE = "/home/company_intro.jpg";
const DEFAULT_TITLE = "30년간 축적된 노하우와 혁신적인 기술로 고객의 건강하고 풍요로운 일상을 만들어가고 있습니다.";
const DEFAULT_LINK  = "/brand/intro";

export function CompanyIntro({ image, title, link }: CompanyIntroProps = {}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let triggered = false;
    const trigger = () => {
      if (triggered) return;
      triggered = true;
      setVisible(true);
      window.removeEventListener("scroll", onScroll);
    };

    const sectionOffsetTop = el.offsetTop;
    const triggerAt = Math.max(
      sectionOffsetTop - window.innerHeight * 0.5,
      100,
    );

    const onScroll = () => {
      if (window.scrollY >= triggerAt) trigger();
    };

    if (window.scrollY >= triggerAt) {
      trigger();
      return;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative mx-auto my-8 w-full overflow-hidden rounded-2xl px-4 md:my-12 md:w-[calc(100%-5rem)] md:rounded-3xl md:px-0"
    >
      {/* 모바일: 100% - 양쪽 1rem 패딩, 343:460 비율 / PC: 16:6 */}
      <div className="relative aspect-[343/460] overflow-hidden rounded-2xl md:aspect-[16/6] md:min-h-[360px] md:rounded-[2.5rem]">
        <div
          className={cn(
            "absolute inset-0 origin-center",
            /* 메인 히어로와 동일: 모바일·PC 모두 clip + 살짝 상승 + 페이드 — app.css .animate-hero-unfold-main */
            visible ? "animate-hero-unfold-main" : "opacity-0",
          )}
        >
          <img
            src={image || DEFAULT_IMAGE}
            alt="풍림푸드 공장"
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1920&h=800&fit=crop";
            }}
          />
          <div className="absolute inset-0 bg-black/55" />

          {/* Content - 모바일: space-between(상단: 카테고리+타이틀, 하단: Learn More) / PC: 기존 */}
          <div className="absolute inset-0 flex flex-col justify-between p-5 md:justify-start md:p-14 lg:px-30 lg:py-20">
            {/* 상단: 카테고리 + 타이틀 묶음 */}
            <div>
              <SectionPageTitle
                as="p"
                preset="none"
                starVariant="company"
                className="mb-3 flex items-center gap-2 text-sm md:mb-4"
                rootStyle={{ color: "#f1ecdb", letterSpacing: "-0.04em" }}
                markClassName="hidden h-3.5 w-3.5 flex-shrink-0 md:block"
                wrapTitle={false}
              >
                회사소개
              </SectionPageTitle>
              <h2
                className="max-w-md text-[18px] font-bold break-keep md:mb-8 md:text-[24px]"
                style={{
                  color: "#f1ecdb",
                  lineHeight: "140%",
                  letterSpacing: "-0.04em",
                }}
              >
                {title || DEFAULT_TITLE}
              </h2>
            </div>

            {/* 하단: Learn More 버튼 - 모바일 100% / PC w-fit */}
            <Link
              to={link || DEFAULT_LINK}
              className="flex w-full items-center justify-between gap-4 rounded-full border border-black/20 px-3 py-2.5 text-sm font-medium transition-colors md:w-[190px]"
              style={{
                backgroundColor: "#f1ecdb",
                color: "#1e463a",
              }}
            >
              <span>Learn More</span>
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: "#1e463a" }}
              >
                <ChevronRight className="h-3 w-3 text-white" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
