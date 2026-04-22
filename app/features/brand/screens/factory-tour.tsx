import type { Route } from "./+types/factory-tour";

import { CalendarDays, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  type ChangeEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Form, useActionData, useNavigation } from "react-router";

import { Breadcrumb } from "~/core/components/breadcrumb";
import { PageContentMax } from "~/core/components/page-content-max";
import { SectionPageTitle } from "~/core/components/section-title-star";
import i18next from "~/core/lib/i18next.server";
import { pc1920 } from "~/core/lib/pc-fluid";
import { SECTION_VIEWPORT_BLEED } from "~/core/lib/section-viewport-bleed";
import { cn } from "~/core/lib/utils";

import { createFactoryTourApplication } from "../lib/queries.server";

function buildTourInfo(t: (key: string) => string): {
  num: string;
  title: string;
  body: ReactNode;
}[] {
  return [
    {
      num: "1",
      title: t("pages.brand.factoryTour.tourInfo.factory.title"),
      body: (
        <>
          <span className="font-bold">
            {t("pages.brand.factoryTour.tourInfo.factory.line1Bold")}
          </span>
          <br />
          <span className="font-normal">
            {t("pages.brand.factoryTour.tourInfo.factory.line2")}
          </span>
        </>
      ),
    },
    {
      num: "2",
      title: t("pages.brand.factoryTour.tourInfo.period.title"),
      body: (
        <>
          <span className="font-bold">
            {t("pages.brand.factoryTour.tourInfo.period.line1Bold")}
          </span>
          <br />
          <span className="font-normal">
            {t("pages.brand.factoryTour.tourInfo.period.line2")}
          </span>
        </>
      ),
    },
    {
      num: "3",
      title: t("pages.brand.factoryTour.tourInfo.hours.title"),
      body: (
        <>
          <span className="font-bold">
            {t("pages.brand.factoryTour.tourInfo.hours.line1Bold")}
          </span>
          <br />
          <span className="font-normal">
            {t("pages.brand.factoryTour.tourInfo.hours.line2")}
          </span>
        </>
      ),
    },
    {
      num: "4",
      title: t("pages.brand.factoryTour.tourInfo.audience.title"),
      body: (
        <>
          <span className="font-bold">
            {t("pages.brand.factoryTour.tourInfo.audience.line1Bold")}
          </span>
          <br />
          <span className="font-normal">
            {t("pages.brand.factoryTour.tourInfo.audience.line2")}
          </span>
        </>
      ),
    },
    {
      num: "5",
      title: t("pages.brand.factoryTour.tourInfo.capacity.title"),
      body: (
        <>
          <span className="font-bold">
            {t("pages.brand.factoryTour.tourInfo.capacity.line1Bold")}
          </span>
          <span className="font-normal">
            {t("pages.brand.factoryTour.tourInfo.capacity.line2")}
          </span>
          <br />
        </>
      ),
    },
    {
      num: "6",
      title: t("pages.brand.factoryTour.tourInfo.contact.title"),
      body: (
        <span className="font-bold">
          {t("pages.brand.factoryTour.tourInfo.contact.phone")}
          <br />
        </span>
      ),
    },
  ];
}

const EMAIL_DOMAINS = [
  "직접입력",
  "gmail.com",
  "naver.com",
  "kakao.com",
  "hanmail.net",
  "nate.com",
] as const;

/** 모바일: 60·10·Nanum·#003F2B / PC 견학신청 시안: Nanum 18·#1F2121·테두리 없음 (입사지원과 동계열) */
const ftInputClass = cn(
  "w-full border border-[#E5E0D4] bg-white outline-none transition-colors",
  "rounded-lg px-4 py-3 text-sm focus:border-[#02633E] focus:ring-1 focus:ring-[#02633E]",
  "max-lg:h-[60px] max-lg:rounded-[10px] max-lg:border-0 max-lg:px-4 max-lg:py-[18px]",
  "max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base max-lg:font-normal max-lg:leading-5 max-lg:text-[#003F2B]",
  "max-lg:placeholder:text-[#003F2B]/55 max-lg:focus:ring-2 max-lg:focus:ring-[#02633E]",
  "lg:h-[60px] lg:rounded-[10px] lg:border-0 lg:px-4 lg:py-[18px]",
  "lg:font-[family-name:var(--font-nanum)] lg:text-[18px] lg:font-normal lg:leading-5 lg:text-[#1F2121]",
  "lg:placeholder:text-[#1F2121]/60 lg:focus:ring-2 lg:focus:ring-[#02633E]",
);

const ftStarClass =
  "font-[Pretendard,system-ui,sans-serif] text-base font-medium text-[#F3372C] lg:text-xl lg:font-medium";

/** PC 폼 라벨 — Nanum 20 bold */
const ftLabelPc =
  "lg:font-[family-name:var(--font-nanum)] lg:text-xl lg:font-bold lg:text-black";

const labelCls =
  "mb-1.5 block text-sm font-semibold tracking-[-0.03em] text-gray-800";

/** YYYY-M-D 형태를 정규화·검증 (유효하지 않으면 null) */
function parseIsoDateLoose(s: string): string | null {
  const t = s.trim();
  if (!/^\d{4}-\d{1,2}-\d{1,2}$/.test(t)) return null;
  const [y, m, d] = t.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  if (
    Number.isNaN(dt.getTime()) ||
    dt.getFullYear() !== y ||
    dt.getMonth() !== m - 1 ||
    dt.getDate() !== d
  ) {
    return null;
  }
  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

type FactoryTourVisitDateFieldProps = {
  visitDateStr: string;
  setVisitDateStr: (v: string) => void;
  visitDateOpen: boolean;
  setVisitDateOpen: (open: boolean) => void;
  /** 모바일/PC 중 실제로 보이는 필드만 달력 showPicker 시도 */
  active: boolean;
  disabled: boolean;
  required: boolean;
  mobile: boolean;
  setPopoverRoot: (el: HTMLDivElement | null) => void;
};

function FactoryTourVisitDateField({
  visitDateStr,
  setVisitDateStr,
  visitDateOpen,
  setVisitDateOpen,
  active,
  disabled,
  required,
  mobile,
  setPopoverRoot,
}: FactoryTourVisitDateFieldProps) {
  const { t } = useTranslation();
  const datePickerRef = useRef<HTMLInputElement>(null);
  const [dateTextDraft, setDateTextDraft] = useState(visitDateStr);

  useEffect(() => {
    if (visitDateOpen) setDateTextDraft(visitDateStr);
  }, [visitDateOpen, visitDateStr]);

  useEffect(() => {
    if (!visitDateOpen || !active || disabled) return;
    const id = window.requestAnimationFrame(() => {
      datePickerRef.current?.focus({ preventScroll: true });
      datePickerRef.current?.showPicker?.();
    });
    return () => window.cancelAnimationFrame(id);
  }, [visitDateOpen, active, disabled]);

  const triggerCls = cn(
    ftInputClass,
    "flex cursor-pointer items-center gap-2.5 !py-0 max-lg:h-[60px]",
    mobile ? "" : "lg:!px-4",
  );

  return (
    <div
      ref={setPopoverRoot}
      className="relative w-full"
    >
      <input
        type="hidden"
        name="date"
        value={visitDateStr}
        disabled={disabled}
        required={required}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setVisitDateOpen(!visitDateOpen);
        }}
        className={cn(
          triggerCls,
          "w-full text-left font-[family-name:var(--font-nanum)]",
          mobile ? "text-base text-[#003F2B]" : "text-[18px] text-[#1F2121]",
        )}
      >
        <span className="min-w-0 flex-1 truncate">
          {visitDateStr
            ? visitDateStr
            : mobile
              ? t("pages.brand.factoryTour.form.datePlaceholderMobile")
              : t("pages.brand.factoryTour.form.datePlaceholderDesktop")}
        </span>
        <CalendarDays
          className={cn(
            "shrink-0 text-[#2A343D]",
            mobile ? "size-5" : "size-6",
          )}
          aria-hidden
        />
      </button>
      {visitDateOpen && !disabled ? (
        <div className="absolute left-0 right-0 z-30 mt-2 rounded-[10px] border border-[#E5E0D4] bg-white p-4 shadow-lg">
          <p className="mb-2 font-[family-name:var(--font-nanum)] text-xs font-bold text-[#1F2121]">
            {t("pages.brand.factoryTour.form.datePickerPick")}
          </p>
          <input
            ref={datePickerRef}
            type="date"
            value={visitDateStr}
            onChange={(e) => {
              const v = e.target.value;
              setVisitDateStr(v);
              setDateTextDraft(v);
            }}
            className={cn(ftInputClass, "mb-4")}
          />
          <p className="mb-2 font-[family-name:var(--font-nanum)] text-xs font-bold text-[#1F2121]">
            {t("pages.brand.factoryTour.form.dateManualHint")}
          </p>
          <input
            type="text"
            inputMode="numeric"
            placeholder={t(
              "pages.brand.factoryTour.form.dateExamplePlaceholder",
            )}
            value={dateTextDraft}
            onChange={(e) => setDateTextDraft(e.target.value)}
            onBlur={() => {
              const trimmed = dateTextDraft.trim();
              if (!trimmed) {
                setVisitDateStr("");
                return;
              }
              const normalized = parseIsoDateLoose(trimmed);
              if (normalized) {
                setVisitDateStr(normalized);
                setDateTextDraft(normalized);
              } else {
                setDateTextDraft(visitDateStr);
              }
            }}
            className={ftInputClass}
          />
          <button
            type="button"
            className="mt-3 w-full rounded-lg border border-[#E5E0D4] py-2 font-[family-name:var(--font-nanum)] text-sm font-bold text-[#1F2121] hover:bg-[#FDFDF5]"
            onClick={() => setVisitDateOpen(false)}
          >
            {t("pages.brand.factoryTour.form.close")}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export const meta: Route.MetaFunction = ({ data }) => [
  { title: data?.metaTitle },
];

export async function loader({ request }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);
  return { metaTitle: t("pages.brand.factoryTour.metaTitle") };
}

export async function action({ request }: Route.ActionArgs) {
  const t = await i18next.getFixedT(request);
  const fd = await request.formData();
  const factory = (fd.get("factory") as string) || "충북 진천공장";
  const visitTime = fd.get("visit_time") as string;
  const purposeSelect = fd.get("purpose") as string;
  const purposeText = fd.get("purpose_text") as string;
  const purpose = (purposeText?.trim() || purposeSelect || "").trim();
  const purposeFull = [
    factory && `공장: ${factory}`,
    visitTime && `방문시간: ${visitTime}`,
    purpose && `방문목적: ${purpose}`,
  ]
    .filter(Boolean)
    .join(" / ");

  const emailLocal = (fd.get("email_local") as string)?.trim() || "";
  const emailDomain = (fd.get("email_domain") as string)?.trim() || "";
  const emailCustom = (fd.get("email_domain_custom") as string)?.trim() || "";
  const domainPart =
    emailDomain && emailDomain !== "직접입력" ? emailDomain : emailCustom;
  const email = emailLocal && domainPart ? `${emailLocal}@${domainPart}` : null;

  const participants = Number(
    fd.get("participants_mobile") ||
      fd.get("participants") ||
      fd.get("quantity") ||
      10,
  );

  try {
    await createFactoryTourApplication({
      applicant_name: fd.get("manager_name") as string,
      organization: (fd.get("organization") as string) || null,
      phone: fd.get("phone") as string,
      email,
      participants: Number.isFinite(participants) ? participants : 10,
      purpose: purposeFull || purpose || "견학",
      requested_date: new Date(fd.get("date") as string),
      message: (fd.get("message") as string) || null,
    });
    return { success: true };
  } catch {
    return {
      success: false,
      error: t("pages.brand.factoryTour.form.errorGeneric"),
    };
  }
}

export default function FactoryTourScreen(_props: Route.ComponentProps) {
  const { t } = useTranslation();
  const tourInfo = useMemo(() => buildTourInfo(t), [t]);
  const scenePhotos = useMemo(
    () => [
      { src: "/visit/01.png", label: t("pages.brand.factoryTour.scenes.intro") },
      {
        src: "/visit/02.png",
        label: t("pages.brand.factoryTour.scenes.quality"),
      },
      {
        src: "/visit/03.png",
        label: t("pages.brand.factoryTour.scenes.production"),
      },
      {
        src: "/visit/04.png",
        label: t("pages.brand.factoryTour.scenes.tasting"),
      },
    ],
    [t],
  );
  const notices = useMemo(
    () => [
      t("pages.brand.factoryTour.notices.n1"),
      t("pages.brand.factoryTour.notices.n2"),
      t("pages.brand.factoryTour.notices.n3"),
      t("pages.brand.factoryTour.notices.n4"),
      t("pages.brand.factoryTour.notices.n5"),
    ],
    [t],
  );
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const submitted = actionData?.success === true;
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  /** null: 하이드레이션 전 — 모바일/데스크 필드 모두 비활성화로 중복 name 제출 방지 */
  const [isNarrow, setIsNarrow] = useState<boolean | null>(null);
  const [emailLocal, setEmailLocal] = useState("");
  const [emailDomain, setEmailDomain] = useState("");
  const [emailDomainCustom, setEmailDomainCustom] = useState("");
  const [visitDateStr, setVisitDateStr] = useState("");
  const [visitDateOpen, setVisitDateOpen] = useState(false);
  const emailLocalInputMRef = useRef<HTMLInputElement>(null);
  const emailLocalInputPRef = useRef<HTMLInputElement>(null);
  const emailCustomInputMRef = useRef<HTMLInputElement>(null);
  const emailCustomInputPRef = useRef<HTMLInputElement>(null);
  const visitDateRootMRef = useRef<HTMLDivElement | null>(null);
  const visitDateRootPRef = useRef<HTMLDivElement | null>(null);

  const mobile = isNarrow === true;
  const formLocked = isNarrow === null;

  const setVisitDateRootM = useCallback((el: HTMLDivElement | null) => {
    visitDateRootMRef.current = el;
  }, []);
  const setVisitDateRootP = useCallback((el: HTMLDivElement | null) => {
    visitDateRootPRef.current = el;
  }, []);

  const handleEmailDomainChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>, viewportMobile: boolean) => {
      const v = e.target.value;
      setEmailDomain(v);
      if (v !== "") {
        setEmailDomainCustom("");
        queueMicrotask(() => {
          emailLocalInputMRef.current?.blur();
          emailLocalInputPRef.current?.blur();
          emailCustomInputMRef.current?.blur();
          emailCustomInputPRef.current?.blur();
        });
      } else {
        queueMicrotask(() => {
          if (viewportMobile) emailCustomInputMRef.current?.focus();
          else emailCustomInputPRef.current?.focus();
        });
      }
    },
    [],
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => setIsNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!visitDateOpen) return;
    const onPointerDown = (e: MouseEvent | PointerEvent) => {
      const t = e.target as Node;
      if (
        visitDateRootMRef.current?.contains(t) ||
        visitDateRootPRef.current?.contains(t)
      ) {
        return;
      }
      setVisitDateOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVisitDateOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [visitDateOpen]);

  return (
    <div className={cn(SECTION_VIEWPORT_BLEED, "min-h-screen min-w-0 bg-[var(--site-chrome-header-bg,#FDFDF5)]")}>
      {/* ── 브레드크럼 + PC(lg+) 히어로 텍스트 배너 — 모바일 텍스트 배너 제거됨 ── */}
      <section>
        <Breadcrumb
          variant="productDetail"
          items={[
            { label: t("navigation.mega.promo"), href: "/media/news" },
            { label: t("pages.brand.factoryTour.breadcrumbCurrent") },
          ]}
        />

        <PageContentMax className="hidden lg:block lg:pt-0 lg:pb-6">
          <div className="flex min-h-[240px] w-full flex-col items-center justify-center overflow-hidden px-10 py-12">
            <div className="flex max-w-[487px] flex-col items-center justify-center gap-[30px] text-center">
              <h1
                className="font-[family-name:var(--font-nanum)] font-extrabold tracking-[-0.04em] text-[#003F2B]"
                style={{
                  fontSize: pc1920(32, 60),
                  lineHeight: pc1920(48, 84),
                }}
              >
                {t("pages.brand.factoryTour.heroTitle")}
              </h1>
              <p
                className="font-[family-name:var(--font-nanum)] font-normal tracking-[-0.02em] text-[#003F2B]"
                style={{
                  fontSize: pc1920(12, 16),
                  lineHeight: pc1920(18, 19.2),
                }}
              >
                {t("pages.brand.factoryTour.heroSubtitle")}
              </p>
            </div>
          </div>
        </PageContentMax>
      </section>

      {/* ── 섹션 1: 견학 안내 ── */}
      <section>
        <PageContentMax className="py-6 pb-10 lg:py-[100px]">
          {/* 모바일 시안 */}
          <div className="flex flex-col gap-10 lg:hidden">
            {/* 제목과 히어로 이미지 사이 간격 없음 */}
            <div className="flex flex-col">
              <SectionPageTitle
                as="h2"
                preset="default"
                starVariant="brandIntro"
                className="px-0 pb-4"
                titleClassName="font-[family-name:var(--font-nanum)] text-[18px] leading-[30px] font-extrabold text-[#1F2121]"
              >
                {t("pages.brand.factoryTour.mobileSectionTitle")}
              </SectionPageTitle>
              <div className="overflow-hidden rounded-[30px]">
                <img
                  src="/visit/00.png"
                  alt={t("pages.brand.factoryTour.factoryImageAlt")}
                  className="h-[343px] w-full object-cover sm:h-[380px]"
                />
              </div>
            </div>
            <div className="flex flex-col gap-5">
              {tourInfo.map((item) => (
                <div
                  key={item.num}
                  className="flex min-h-[126px] flex-col gap-5 rounded-[10px] bg-white p-5"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#003F2B] font-[family-name:var(--font-nanum)] text-sm leading-[21px] font-bold text-white">
                      {item.num}
                    </span>
                    <p className="font-[family-name:var(--font-nanum)] text-[18px] leading-[27px] font-extrabold text-[#003F2B]">
                      {item.title}
                    </p>
                  </div>
                  <div className="font-[family-name:var(--font-nanum)] text-base leading-6 text-[#1F2121]">
                    {item.body}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 데스크톱 — 왼쪽 정사각 이미지 높이에 맞춰 오른쪽 2×3 카드를 3행 균등 분할(min-h-0으로 행 높이는 이미지 기준) */}
          <div
            className={cn(
              "hidden items-stretch gap-[30px] lg:grid",
              "lg:grid-cols-[minmax(0,min(650px,42vw))_minmax(0,1fr)]",
            )}
          >
            <div className="relative aspect-square min-h-0 w-full min-w-0 overflow-hidden rounded-[10px]">
              <img
                src="/visit/00.png"
                alt={t("pages.brand.factoryTour.factoryImageAlt")}
                className="h-full w-full object-cover"
              />
              <div className="absolute right-0 bottom-0 left-0 flex flex-col gap-6 px-6 pt-8 pb-10 lg:px-8 lg:pt-10 lg:pb-12 xl:px-10 xl:pt-10 xl:pb-[70px]">
                <div className="inline-flex w-fit max-w-[calc(100%-2rem)] rounded-[40px] bg-black/20 px-4 py-2 xl:px-5 xl:py-2.5">
                  <p className="font-[family-name:var(--font-nanum)] text-lg leading-8 font-extrabold text-white xl:text-2xl xl:leading-9">
                    {t("pages.brand.factoryTour.desktopImageBadge")}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={cn(
                "grid h-full min-h-0 min-w-0 grid-cols-2 gap-[10px] self-stretch",
                "[grid-template-rows:repeat(3,minmax(0,1fr))]",
              )}
            >
              {tourInfo.map((item) => (
                <div
                  key={item.num}
                  className="flex h-full min-h-0 min-w-0 flex-col gap-5 rounded-[10px] bg-white px-10 py-[30px]"
                >
                  <div className="flex min-w-0 shrink-0 items-start gap-3">
                    <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-[#003F2B] font-[family-name:var(--font-nanum)] text-base leading-6 font-bold text-white">
                      {item.num}
                    </span>
                    <p className="min-w-0 font-[family-name:var(--font-nanum)] text-xl leading-[30px] font-extrabold text-[#003F2B]">
                      {item.title}
                    </p>
                  </div>
                  <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-end overflow-y-auto">
                    <div className="font-[family-name:var(--font-nanum)] text-lg leading-[27px] break-words text-[#1F2121]">
                      {item.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PageContentMax>
      </section>

      {/* ── 섹션 2: 한눈에 보는 공장견학 ── */}
      <section className="bg-[#003F2B]">
        <PageContentMax className="pt-5 pb-10 md:py-16 lg:py-[100px] lg:pt-[100px]">
          {/* 모바일: 노란 포인트 + 가로 스크롤 */}
          <div className="lg:hidden">
            <SectionPageTitle
              as="h2"
              preset="default"
              starVariant="yellowStar"
              className="px-0 py-5"
              titleClassName="font-[family-name:var(--font-nanum)] text-[18px] leading-[30px] font-extrabold text-white"
            >
              {t("pages.brand.factoryTour.scenesTitle")}
            </SectionPageTitle>
            {/* PageContentMax 우측 gutter(px-4/md:px-6)만큼 당겨 슬라이드가 화면 오른쪽까지 붙도록 */}
            <div className="max-lg:-mr-4 md:max-lg:-mr-6">
              <div className="flex gap-5 overflow-x-auto pb-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {scenePhotos.map((photo, i) => (
                  <div
                    key={photo.label}
                    className="flex w-[min(243px,calc(100vw-5rem))] shrink-0 snap-start snap-always flex-col gap-3"
                  >
                    <div className="aspect-[243/400] w-full overflow-hidden rounded-[10px]">
                      <img
                        src={photo.src}
                        alt={photo.label}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white font-[family-name:var(--font-nanum)] text-sm leading-[21px] font-bold text-[#003F2B]">
                        {i + 1}
                      </span>
                      <span className="font-[family-name:var(--font-nanum)] text-lg leading-[23.4px] font-bold text-white">
                        {photo.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 데스크톱 */}
          <div className="hidden lg:block">
            <SectionPageTitle
              as="h2"
              preset="none"
              starVariant="yellowStar"
              className="mb-[30px] flex items-start gap-2.5"
              markClassName="mt-2.5 h-[21px] w-[21px] shrink-0"
              titleClassName="max-w-[1200px] font-[family-name:var(--font-nanum)] text-[28px] font-bold leading-[42px] text-white"
            >
              {t("pages.brand.factoryTour.scenesTitle")}
            </SectionPageTitle>

            <div className="flex gap-5">
              {scenePhotos.map((photo, i) => (
                <div
                  key={photo.label}
                  className="flex min-w-0 flex-1 flex-col gap-3"
                >
                  <div className="aspect-[385/634] w-full overflow-hidden rounded-[10px]">
                    <img
                      src={photo.src}
                      alt={photo.label}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white font-[family-name:var(--font-nanum)] text-base leading-6 font-bold text-[#003F2B]">
                      {i + 1}
                    </span>
                    <span className="font-[family-name:var(--font-nanum)] text-xl leading-[26px] font-bold text-white">
                      {photo.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PageContentMax>
      </section>

      {/* ── 섹션 3: 견학 신청 ── */}
      <section>
        <PageContentMax className="py-10 md:py-16 lg:py-[100px]">
          <div
            className={cn(
              "grid w-full min-w-0 gap-10",
              "lg:grid-cols-[minmax(0,min(580px,48%))_minmax(0,1fr)]",
              "lg:items-start lg:gap-8 xl:gap-12 2xl:gap-[100px]",
              /* 1920+ : 좌·우 열 고정 + 총폭 1430으로 묶어 가운데 정렬 */
              "min-[1920px]:mx-auto min-[1920px]:max-w-[1430px] min-[1920px]:grid-cols-[580px_minmax(0,750px)] min-[1920px]:gap-[100px]",
            )}
          >
            {/* 데스크톱: 왼쪽 안내 카드 (시안: 최대 580·rounded 40·p 반응형) */}
            <div className="hidden w-full max-w-[580px] min-w-0 rounded-[40px] bg-white lg:block lg:justify-self-start lg:p-8 xl:p-10 2xl:p-[60px]">
              <div className="flex flex-col gap-10">
                <div className="flex flex-col gap-3">
                  <h2 className="font-[family-name:var(--font-nanum)] text-[28px] leading-[42px] font-extrabold text-[#1F2121]">
                    {t("pages.brand.factoryTour.form.applyTitle")}
                  </h2>
                  <p className="font-[family-name:var(--font-nanum)] text-lg leading-[27px] font-bold text-[#1F2121]">
                    {t("pages.brand.factoryTour.form.applyIntroDesktop")
                      .split("\n")
                      .map((line, i, arr) => (
                        <span key={i}>
                          {line}
                          {i < arr.length - 1 ? <br /> : null}
                        </span>
                      ))}
                  </p>
                </div>

                <div className="border-t border-[#1F2121]/20 pt-10">
                  <div className="mb-5 flex items-center gap-2.5">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#003F2B] font-[family-name:var(--font-nanum)] text-base leading-6 font-bold text-white">
                      !
                    </span>
                    <p className="font-[family-name:var(--font-nanum)] text-lg leading-[27px] font-extrabold text-[#003F2B]">
                      {t("pages.brand.factoryTour.form.cautionsTitle")}
                    </p>
                  </div>
                  <ul className="flex flex-col gap-1">
                    {notices.map((n, i) => (
                      <li
                        key={i}
                        className="font-[family-name:var(--font-nanum)] text-base leading-6 font-normal text-[#1F2121]"
                      >
                        - {n}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 모바일: 안내 + 유의사항 (흰 카드) */}
            <div className="rounded-[10px] bg-white p-5 lg:hidden">
              <h2 className="font-[family-name:var(--font-nanum)] text-[18px] leading-[27px] font-extrabold text-[#1F2121]">
                {t("pages.brand.factoryTour.form.applyTitle")}
              </h2>
              <p className="mt-3 font-[family-name:var(--font-nanum)] text-base leading-6 font-bold text-[#1F2121]">
                {t("pages.brand.factoryTour.form.applyIntroMobile")
                  .split("\n")
                  .map((line, i, arr) => (
                    <span key={i}>
                      {line}
                      {i < arr.length - 1 ? <br /> : null}
                    </span>
                  ))}
              </p>
              <div className="mt-5 border-t border-[#1F2121]/20 pt-5">
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#003F2B] font-[family-name:var(--font-nanum)] text-[13px] leading-5 font-bold text-white">
                    !
                  </span>
                  <p className="font-[family-name:var(--font-nanum)] text-base leading-6 font-extrabold text-[#003F2B]">
                    {t("pages.brand.factoryTour.form.cautionsTitle")}
                  </p>
                </div>
                <ul className="space-y-1">
                  {notices.map((n, i) => (
                    <li
                      key={i}
                      className="font-[family-name:var(--font-nanum)] text-sm leading-[21px] font-normal text-[#1F2121]"
                    >
                      - {n}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 신청 폼 — 고정 750px+shrink-0는 좁은 PC에서 가로 오버플로 유발 → 1열에서 줄어들 수 있게 */}
            <div className="w-full max-w-[750px] min-w-0 lg:justify-self-start">
              {submitted ? (
                <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-center lg:rounded-2xl">
                  <div
                    className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                    style={{ backgroundColor: "#02633E" }}
                  >
                    <Check className="h-7 w-7 text-white" />
                  </div>
                  <p className="text-base font-bold text-gray-900">
                    {t("pages.brand.factoryTour.form.successTitle")}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    {t("pages.brand.factoryTour.form.successSubtitle")}
                  </p>
                </div>
              ) : (
                <Form
                  method="post"
                  className="min-w-0 space-y-4 lg:space-y-[30px]"
                >
                  {/* ── 모바일 전용 필드 ── */}
                  <div className={cn("space-y-5", "lg:hidden")}>
                    <div>
                      <div className="mb-0 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-0.5">
                          <span className="font-[family-name:var(--font-nanum)] text-base font-bold text-black">
                            {t("pages.brand.factoryTour.form.labels.organization")}
                          </span>
                          <span className={ftStarClass}>*</span>
                        </div>
                        <span className="text-right font-[family-name:var(--font-nanum)] text-xs font-normal text-black">
                          <span className="text-[#F3372C]">* </span>
                          {t("pages.brand.factoryTour.form.requiredHint")}
                        </span>
                      </div>
                      <input
                        type="text"
                        name="organization"
                        required={mobile}
                        disabled={formLocked || !mobile}
                        placeholder={t(
                          "pages.brand.factoryTour.form.placeholders.organization",
                        )}
                        className={cn(ftInputClass, "mt-5")}
                      />
                    </div>

                    <div className="flex flex-col gap-5">
                      <div className="flex max-w-[200px] items-center gap-0.5">
                        <span className="font-[family-name:var(--font-nanum)] text-base font-bold text-black">
                          {t("pages.brand.factoryTour.form.labels.managerName")}
                        </span>
                        <span className={ftStarClass}>*</span>
                      </div>
                      <input
                        type="text"
                        name="manager_name"
                        required={mobile}
                        disabled={formLocked || !mobile}
                        placeholder={t(
                          "pages.brand.factoryTour.form.placeholders.managerName",
                        )}
                        className={ftInputClass}
                      />
                    </div>

                    <div className="flex flex-col gap-5">
                      <div className="flex max-w-[200px] items-center gap-0.5">
                        <span className="font-[family-name:var(--font-nanum)] text-base font-bold text-black">
                          {t("pages.brand.factoryTour.form.labels.phone")}
                        </span>
                        <span className={ftStarClass}>*</span>
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        required={mobile}
                        disabled={formLocked || !mobile}
                        placeholder={t(
                          "pages.brand.factoryTour.form.placeholders.phone",
                        )}
                        className={ftInputClass}
                      />
                    </div>

                    <div className="flex flex-col gap-5">
                      <label className="block font-[family-name:var(--font-nanum)] text-base font-bold text-black">
                        {t("pages.brand.factoryTour.form.labels.email")}
                      </label>
                      <div className="flex flex-col gap-5">
                        <input
                          ref={emailLocalInputMRef}
                          name="email_local"
                          value={emailLocal}
                          onChange={(e) => setEmailLocal(e.target.value)}
                          disabled={formLocked || !mobile}
                          placeholder={t(
                            "pages.brand.factoryTour.form.placeholders.emailLocal",
                          )}
                          autoComplete="email"
                          className={ftInputClass}
                        />
                        <span className="font-[Pretendard,system-ui,sans-serif] text-lg leading-5 font-light text-[#7B7B7B]">
                          @
                        </span>
                        {emailDomain === "" && (
                          <input
                            ref={emailCustomInputMRef}
                            name="email_domain_custom"
                            value={emailDomainCustom}
                            onChange={(e) =>
                              setEmailDomainCustom(e.target.value)
                            }
                            disabled={formLocked || !mobile}
                            placeholder={t(
                              "pages.brand.factoryTour.form.placeholders.emailDomain",
                            )}
                            className={cn(
                              ftInputClass,
                              "font-[Pretendard,system-ui,sans-serif] text-lg font-light text-[#7B7B7B] placeholder:text-[#7B7B7B]/40",
                            )}
                          />
                        )}
                        <select
                          name="email_domain"
                          value={emailDomain}
                          onChange={(ev) =>
                            handleEmailDomainChange(ev, true)
                          }
                          disabled={formLocked || !mobile}
                          className={ftInputClass}
                        >
                          <option value="">
                            {t("pages.brand.factoryTour.form.emailCustom")}
                          </option>
                          {EMAIL_DOMAINS.slice(1).map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-5">
                      <div className="flex max-w-[200px] items-center gap-0.5">
                        <span className="font-[family-name:var(--font-nanum)] text-base font-bold text-black">
                          {t("pages.brand.factoryTour.form.labels.visitDate")}
                        </span>
                        <span className={ftStarClass}>*</span>
                      </div>
                      <FactoryTourVisitDateField
                        visitDateStr={visitDateStr}
                        setVisitDateStr={setVisitDateStr}
                        visitDateOpen={visitDateOpen}
                        setVisitDateOpen={setVisitDateOpen}
                        active={mobile}
                        disabled={formLocked || !mobile}
                        required={mobile}
                        mobile
                        setPopoverRoot={setVisitDateRootM}
                      />
                    </div>

                    <div className="flex flex-col gap-5">
                      <div className="flex max-w-[200px] items-center gap-0.5">
                        <span className="font-[family-name:var(--font-nanum)] text-base font-bold text-black">
                          {t("pages.brand.factoryTour.form.labels.visitTime")}
                        </span>
                        <span className={ftStarClass}>*</span>
                      </div>
                      <select
                        name="visit_time"
                        required={mobile}
                        disabled={formLocked || !mobile}
                        className={ftInputClass}
                      >
                        <option value="">
                          {t("pages.brand.factoryTour.form.visitTimeSelect")}
                        </option>
                        <option value="오전 10:00">
                          {t("pages.brand.factoryTour.form.visitTimeAm")}
                        </option>
                        <option value="오후 14:00">
                          {t("pages.brand.factoryTour.form.visitTimePm")}
                        </option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-5">
                      <div className="flex max-w-[200px] items-center gap-0.5">
                        <span className="font-[family-name:var(--font-nanum)] text-base font-bold text-black">
                          {t("pages.brand.factoryTour.form.labels.participants")}
                        </span>
                        <span className={ftStarClass}>*</span>
                      </div>
                      <input
                        type="number"
                        name="participants_mobile"
                        min={10}
                        max={40}
                        required={mobile}
                        disabled={formLocked || !mobile}
                        placeholder={t(
                          "pages.brand.factoryTour.form.placeholders.participants",
                        )}
                        className={ftInputClass}
                      />
                    </div>

                    <div className="flex flex-col gap-5">
                      <div className="flex max-w-[200px] items-center gap-0.5">
                        <span className="font-[family-name:var(--font-nanum)] text-base font-bold text-black">
                          {t("pages.brand.factoryTour.form.labels.purpose")}
                        </span>
                        <span className={ftStarClass}>*</span>
                      </div>
                      <input
                        type="text"
                        name="purpose_text"
                        required={mobile}
                        disabled={formLocked || !mobile}
                        placeholder={t(
                          "pages.brand.factoryTour.form.placeholders.purpose",
                        )}
                        className={ftInputClass}
                      />
                    </div>

                    <div className="flex flex-col gap-5">
                      <div className="flex max-w-[200px] items-center gap-0.5">
                        <span className="font-[family-name:var(--font-nanum)] text-base font-bold text-black">
                          {t("pages.brand.factoryTour.form.labels.message")}
                        </span>
                        <span className={ftStarClass}>*</span>
                      </div>
                      <textarea
                        name="message"
                        required={mobile}
                        disabled={formLocked || !mobile}
                        rows={5}
                        placeholder={t(
                          "pages.brand.factoryTour.form.placeholders.message",
                        )}
                        className={cn(
                          ftInputClass,
                          "h-auto min-h-[120px] max-lg:h-auto max-lg:min-h-[200px] max-lg:py-[18px] max-lg:leading-5",
                        )}
                      />
                    </div>
                  </div>

                  {/* ── PC 전용 필드 — 시안과 모바일 동일 필드·name (비활성으로 중복 제출 방지) ── */}
                  <div className={cn("hidden flex-col gap-5", "lg:flex")}>
                    <div className="flex flex-col gap-5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-0.5">
                          <span className={ftLabelPc}>
                            {t("pages.brand.factoryTour.form.labels.organization")}
                          </span>
                          <span className={ftStarClass}>*</span>
                        </div>
                        <span className="shrink-0 text-right font-[family-name:var(--font-nanum)] text-[13px] font-normal text-black">
                          <span className="text-[#F3372C]">* </span>
                          {t("pages.brand.factoryTour.form.requiredHint")}
                        </span>
                      </div>
                      <input
                        type="text"
                        name="organization"
                        required={!mobile}
                        disabled={formLocked || mobile}
                        placeholder={t(
                          "pages.brand.factoryTour.form.placeholders.organization",
                        )}
                        className={ftInputClass}
                      />
                    </div>

                    <div className="flex flex-col gap-5">
                      <div className="flex items-center gap-0.5">
                        <span className={ftLabelPc}>
                          {t("pages.brand.factoryTour.form.labels.managerName")}
                        </span>
                        <span className={ftStarClass}>*</span>
                      </div>
                      <input
                        type="text"
                        name="manager_name"
                        required={!mobile}
                        disabled={formLocked || mobile}
                        placeholder={t(
                          "pages.brand.factoryTour.form.placeholders.managerName",
                        )}
                        className={ftInputClass}
                      />
                    </div>

                    <div className="flex flex-col gap-5">
                      <div className="flex items-center gap-0.5">
                        <span className={ftLabelPc}>
                          {t("pages.brand.factoryTour.form.labels.phone")}
                        </span>
                        <span className={ftStarClass}>*</span>
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        required={!mobile}
                        disabled={formLocked || mobile}
                        placeholder={t(
                          "pages.brand.factoryTour.form.placeholders.phone",
                        )}
                        className={ftInputClass}
                      />
                    </div>

                    <div className="flex flex-col gap-5">
                      <label
                        className={cn(labelCls, ftLabelPc, "lg:mb-0 lg:block")}
                      >
                        {t("pages.brand.factoryTour.form.labels.email")}
                      </label>
                      <div className="flex w-full min-w-0 flex-col gap-5 lg:flex-row lg:flex-wrap lg:items-center lg:gap-2.5">
                        <input
                          ref={emailLocalInputPRef}
                          name="email_local"
                          value={emailLocal}
                          onChange={(e) => setEmailLocal(e.target.value)}
                          disabled={formLocked || mobile}
                          placeholder={t(
                            "pages.brand.factoryTour.form.placeholders.emailLocal",
                          )}
                          autoComplete="email"
                          className={cn(ftInputClass, "lg:min-w-0 lg:flex-1")}
                        />
                        <span className="font-[family-name:var(--font-nanum)] text-xl font-bold text-black lg:shrink-0">
                          @
                        </span>
                        {emailDomain === "" && (
                          <input
                            ref={emailCustomInputPRef}
                            name="email_domain_custom"
                            value={emailDomainCustom}
                            onChange={(e) =>
                              setEmailDomainCustom(e.target.value)
                            }
                            disabled={formLocked || mobile}
                            placeholder={t(
                              "pages.brand.factoryTour.form.placeholders.emailDomain",
                            )}
                            className={cn(
                              ftInputClass,
                              "font-[Pretendard,system-ui,sans-serif] text-lg font-light text-[#7B7B7B] placeholder:text-[#7B7B7B]/40 lg:min-w-0 lg:flex-1 lg:text-[18px]",
                            )}
                          />
                        )}
                        <select
                          name="email_domain"
                          value={emailDomain}
                          onChange={(ev) =>
                            handleEmailDomainChange(ev, false)
                          }
                          disabled={formLocked || mobile}
                          className={cn(ftInputClass, "lg:min-w-0 lg:flex-1")}
                        >
                          <option value="">
                            {t("pages.brand.factoryTour.form.emailCustom")}
                          </option>
                          {EMAIL_DOMAINS.slice(1).map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-5">
                      <div className="flex items-center gap-0.5">
                        <span className={ftLabelPc}>
                          {t("pages.brand.factoryTour.form.labels.visitDate")}
                        </span>
                        <span className={ftStarClass}>*</span>
                      </div>
                      <FactoryTourVisitDateField
                        visitDateStr={visitDateStr}
                        setVisitDateStr={setVisitDateStr}
                        visitDateOpen={visitDateOpen}
                        setVisitDateOpen={setVisitDateOpen}
                        active={!mobile}
                        disabled={formLocked || mobile}
                        required={!mobile}
                        mobile={false}
                        setPopoverRoot={setVisitDateRootP}
                      />
                    </div>

                    <div className="flex flex-col gap-5">
                      <div className="flex items-center gap-0.5">
                        <span className={ftLabelPc}>
                          {t("pages.brand.factoryTour.form.labels.visitTime")}
                        </span>
                        <span className={ftStarClass}>*</span>
                      </div>
                      <select
                        name="visit_time"
                        required={!mobile}
                        disabled={formLocked || mobile}
                        className={ftInputClass}
                      >
                        <option value="">
                          {t("pages.brand.factoryTour.form.visitTimeSelect")}
                        </option>
                        <option value="오전 10:00">
                          {t("pages.brand.factoryTour.form.visitTimeAm")}
                        </option>
                        <option value="오후 14:00">
                          {t("pages.brand.factoryTour.form.visitTimePm")}
                        </option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-5">
                      <div className="flex items-center gap-0.5">
                        <span className={ftLabelPc}>
                          {t("pages.brand.factoryTour.form.labels.participants")}
                        </span>
                        <span className={ftStarClass}>*</span>
                      </div>
                      <input
                        type="number"
                        name="participants_mobile"
                        min={10}
                        max={40}
                        required={!mobile}
                        disabled={formLocked || mobile}
                        placeholder={t(
                          "pages.brand.factoryTour.form.placeholders.participants",
                        )}
                        className={ftInputClass}
                      />
                    </div>

                    <div className="flex flex-col gap-5">
                      <div className="flex items-center gap-0.5">
                        <span className={ftLabelPc}>
                          {t("pages.brand.factoryTour.form.labels.purpose")}
                        </span>
                        <span className={ftStarClass}>*</span>
                      </div>
                      <input
                        type="text"
                        name="purpose_text"
                        required={!mobile}
                        disabled={formLocked || mobile}
                        placeholder={t(
                          "pages.brand.factoryTour.form.placeholders.purpose",
                        )}
                        className={ftInputClass}
                      />
                    </div>

                    <div className="flex flex-col gap-5">
                      <div className="flex items-center gap-0.5">
                        <span className={ftLabelPc}>
                          {t("pages.brand.factoryTour.form.labels.message")}
                        </span>
                        <span className={ftStarClass}>*</span>
                      </div>
                      <textarea
                        name="message"
                        required={!mobile}
                        disabled={formLocked || mobile}
                        rows={6}
                        placeholder={t(
                          "pages.brand.factoryTour.form.placeholders.message",
                        )}
                        className={cn(
                          ftInputClass,
                          "h-auto min-h-[200px] resize-none lg:py-[18px]",
                        )}
                      />
                    </div>
                  </div>

                  {/* 개인정보 동의 — 체크박스 오른쪽 정렬 */}
                  <label
                    className={cn(
                      "flex min-w-0 cursor-pointer items-start justify-between gap-3 rounded-[10px] bg-[#EAE3C9] p-5",
                      "lg:items-center lg:gap-4 lg:bg-black/10 lg:px-[30px] lg:py-5",
                    )}
                  >
                    <span className="min-w-0 flex-1 font-[family-name:var(--font-nanum)] text-sm leading-[21px] font-bold break-words text-[#1F2121] lg:font-[Pretendard,system-ui,sans-serif] lg:text-lg lg:leading-normal lg:font-medium">
                      {t("pages.brand.factoryTour.form.privacy")}
                    </span>
                    <input
                      type="checkbox"
                      checked={privacyAgreed}
                      onChange={(e) => setPrivacyAgreed(e.target.checked)}
                      className="mt-0.5 size-[18px] shrink-0 rounded-full border border-[#DDDDDD] accent-[#02633E] lg:mt-0"
                    />
                  </label>

                  {actionData?.error && (
                    <p className="text-sm text-red-500">{actionData.error}</p>
                  )}

                  <div className="flex justify-center pt-2 lg:pt-[30px]">
                    <button
                      type="submit"
                      disabled={formLocked || !privacyAgreed || isSubmitting}
                      className={cn(
                        "w-full rounded-full px-12 py-3.5 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-40",
                        "max-lg:rounded-[60px] max-lg:px-10 max-lg:py-5 max-lg:font-[family-name:var(--font-nanum)] max-lg:text-lg max-lg:leading-[23.4px] max-lg:font-extrabold",
                        "lg:w-auto lg:rounded-[60px] lg:px-10 lg:py-5 lg:font-[family-name:var(--font-nanum)] lg:text-[18px] lg:leading-[23.4px] lg:font-extrabold",
                      )}
                      style={{ backgroundColor: "#02633E" }}
                    >
                      {isSubmitting
                        ? t("pages.brand.factoryTour.form.submitting")
                        : t("pages.brand.factoryTour.form.submit")}
                    </button>
                  </div>
                </Form>
              )}
            </div>
          </div>
        </PageContentMax>
      </section>
    </div>
  );
}
