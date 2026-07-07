import { ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { SectionPageTitle } from "~/core/components/section-title-star";
import { cn } from "~/core/lib/utils";

interface CompanyIntroProps {
  image?: string | null;
  title?: string | null;
  link?: string | null;
}

const DEFAULT_IMAGE = "/home/intro-img.png";
/** 관리자 이미지 미설정 시 메인 회사소개 배경 영상 */
const DEFAULT_VIDEO = "/home/poonglim_main.mp4";
const DEFAULT_LINK = "/brand/intro";

function isVideoUrl(url: string) {
  return /\.mp4(\?|#|$)/i.test(url);
}

export function CompanyIntro({ image, title, link }: CompanyIntroProps = {}) {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);

  const useVideo = !image || isVideoUrl(image);
  const videoSrc = useVideo ? (image || DEFAULT_VIDEO) : null;

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

  useEffect(() => {
    if (!visible || !useVideo) return;
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {});
  }, [visible, useVideo, videoSrc]);

  return (
    <section
      ref={sectionRef}
      className="relative mx-auto my-8 w-full overflow-hidden rounded-[30px] px-4 md:my-12 md:w-[calc(100%-5rem)] md:rounded-3xl md:px-0"
    >
      {/* 모바일: 100% - 양쪽 1rem 패딩, 343:460 비율 / PC: 16:6 */}
      <div className="relative aspect-[343/460] overflow-hidden rounded-[30px] md:aspect-[16/6] md:min-h-[360px] md:rounded-[2.5rem]">
        <div
          className={cn(
            "absolute inset-0 origin-center",
            /* 메인 히어로와 동일: 모바일·PC 모두 clip + 살짝 상승 + 페이드 — app.css .animate-hero-unfold-main */
            visible ? "animate-hero-unfold-main" : "opacity-0",
          )}
        >
          {useVideo && videoSrc ? (
            <video
              ref={videoRef}
              src={videoSrc}
              poster={DEFAULT_IMAGE}
              className="absolute inset-0 h-full w-full object-cover"
              muted
              loop
              playsInline
              preload="metadata"
              aria-label={t("home.companyIntro.videoAriaLabel")}
            />
          ) : (
            <img
              src={image || DEFAULT_IMAGE}
              alt={t("home.companyIntro.factoryImageAlt")}
              className="absolute inset-0 h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1920&h=800&fit=crop";
              }}
            />
          )}
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
                {t("navigation.brand.intro")}
              </SectionPageTitle>
              <h2
                className="max-w-md text-[18px] font-bold break-keep md:mb-8 md:text-[24px]"
                style={{
                  color: "#f1ecdb",
                  lineHeight: "140%",
                  letterSpacing: "-0.04em",
                }}
              >
                {title || t("home.companyIntro.defaultTitle")}
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
              <span>{t("home.companyIntro.learnMore")}</span>
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
