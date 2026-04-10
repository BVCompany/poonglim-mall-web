import type { Route } from "./+types/factory-tour";

import { CalendarDays, Check } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { Form, useActionData, useNavigation } from "react-router";

import { Breadcrumb } from "~/core/components/breadcrumb";
import { PageContentMax } from "~/core/components/page-content-max";
import { SectionTitleStar } from "~/core/components/section-title-star";
import { pc1920 } from "~/core/lib/pc-fluid";
import { cn } from "~/core/lib/utils";

import { createFactoryTourApplication } from "../lib/queries.server";

/* ── 견학 안내 카드 (본문: 시안 bold/regular 분리) ── */
const TOUR_INFO: {
  num: string;
  title: string;
  body: ReactNode;
  /** 데스크톱 그리드용 한 줄 요약 */
  desc: string;
}[] = [
  {
    num: "1",
    title: "견학공장",
    desc: "충청북도 진천군 이월면 공동길 51-21 (본사/공장)",
    body: (
      <>
        <span className="font-bold">충청북도 진천군 이월면 공동길 51-21 </span>
        <br />
        <span className="font-normal">(본사/공장)</span>
      </>
    ),
  },
  {
    num: "2",
    title: "견학기간",
    desc: "견학기간(3~6월, 9~11월)\n(7~8월, 12~2월은 견학을 실시하지 않습니다)",
    body: (
      <>
        <span className="font-bold">견학기간3~6월, 9~11월 </span>
        <br />
        <span className="font-normal">
          (7~8월, 12~2월은 견학을 실시하지 않습니다)
        </span>
      </>
    ),
  },
  {
    num: "3",
    title: "견학시간",
    desc: "오전 10:00 / 오후 14:00\n(약 1시간 30분 소요)",
    body: (
      <>
        <span className="font-bold">오전 10:00 / 오후 14:00</span>
        <br />
        <span className="font-normal">(약 1시간 30분 소요)</span>
      </>
    ),
  },
  {
    num: "4",
    title: "견학대상",
    desc: "10명 이상 단체\n(단, 유아/어린이 체험 견학 시 가능)",
    body: (
      <>
        <span className="font-bold">10명 이상 단체 </span>
        <br />
        <span className="font-normal">(단, 유아/어린이 체험 견학 시 가능)</span>
      </>
    ),
  },
  {
    num: "5",
    title: "견학인원",
    desc: "1회당 40명 (최소 10명)",
    body: (
      <>
        <span className="font-bold">1회당 40명 </span>
        <span className="font-normal">(최소 10명)</span>
        <br />
      </>
    ),
  },
  {
    num: "6",
    title: "견학문의",
    desc: "043-533-2285",
    body: (
      <span className="font-bold">
        043-533-2285
        <br />
      </span>
    ),
  },
];

/* ── 한눈에 보는 공장견학 사진 ── */
const SCENE_PHOTOS = [
  { src: "/visit/01.png", label: "회사 및 공장소개" },
  { src: "/visit/02.png", label: "품질관리실 견학" },
  { src: "/visit/03.png", label: "생산라인 견학" },
  { src: "/visit/04.png", label: "제품 시식" },
];

/* ── 유의사항 ── */
const NOTICES = [
  "견학 예정일 7일 전까지 신청해주세요.",
  "견학 취소는 3일 전까지 연락 부탁드립니다.",
  "안전을 위해 견학 시 지정된 경로만 이동 가능합니다.",
  "위생 관리를 위해 위생복과 위생모를 착용합니다.",
  "공장 내 촬영은 담당자 안내에 따라주세요.",
];

const FACTORY_OPTIONS = ["충북 진천공장", "전북 완주공장"];
const PURPOSE_OPTIONS = ["견학", "업무방문", "기타"];

const EMAIL_DOMAINS = [
  "직접입력",
  "gmail.com",
  "naver.com",
  "kakao.com",
  "hanmail.net",
  "nate.com",
] as const;

/** 모바일 시안: 60px·10px·Nanum 16·#003F2B */
const ftInputClass = cn(
  "w-full border border-[#E5E0D4] bg-white outline-none transition-colors",
  "rounded-lg px-4 py-3 text-sm focus:border-[#02633E] focus:ring-1 focus:ring-[#02633E]",
  "max-lg:h-[60px] max-lg:rounded-[10px] max-lg:border-0 max-lg:px-4 max-lg:py-[18px]",
  "max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base max-lg:font-normal max-lg:leading-5 max-lg:text-[#003F2B]",
  "max-lg:placeholder:text-[#003F2B]/55 max-lg:focus:ring-2 max-lg:focus:ring-[#02633E]",
);

const ftStarClass =
  "font-[Pretendard,system-ui,sans-serif] text-base font-medium text-[#F3372C]";

const labelCls =
  "mb-1.5 block text-sm font-semibold tracking-[-0.03em] text-gray-800";
const inputCls =
  "w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none focus:border-[#02633E] focus:ring-1 focus:ring-[#02633E]";
const selectCls =
  "w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none focus:border-[#02633E] appearance-none cursor-pointer";

export const meta: Route.MetaFunction = () => [
  { title: "공장견학 | 풍림푸드" },
];

export async function action({ request }: Route.ActionArgs) {
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
      error: "신청 중 오류가 발생했습니다. 다시 시도해주세요.",
    };
  }
}

export default function FactoryTourScreen() {
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

  const mobile = isNarrow === true;
  const formLocked = isNarrow === null;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => setIsNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F2E5]">
      {/* ── 브레드크럼 + 타이틀 ── */}
      <section>
        <Breadcrumb
          items={[
            { label: "회사소개", href: "/brand/intro" },
            { label: "공장견학" },
          ]}
        />

        <PageContentMax
          className="hidden py-12 text-center md:py-16 lg:block"
          innerClassName="text-center"
        >
          <h1
            className="tracking-[-0.04em]"
            style={{
              color: "#003F2B",
              fontSize: pc1920(32, 60),
              fontWeight: 800,
            }}
          >
            공장견학
          </h1>
          <p
            className="mt-3 tracking-[-0.02em]"
            style={{
              color: "#003F2B",
              fontSize: pc1920(12, 16),
              fontWeight: 400,
            }}
          >
            풍림푸드의 생산 현장을 직접 눈으로 확인하세요.
          </p>
        </PageContentMax>
      </section>

      {/* ── 섹션 1: 견학 안내 ── */}
      <section>
        <PageContentMax className="py-6 pb-10 lg:py-14 lg:pb-20">
          {/* 모바일 시안 */}
          <div className="flex flex-col gap-10 lg:hidden">
            {/* 제목과 히어로 이미지 사이 간격 없음 */}
            <div className="flex flex-col">
              <div className="flex items-center gap-[11px] px-0 pt-5 pb-0">
                <SectionTitleStar
                  variant="brandIntro"
                  className="h-[21px] w-[21px] shrink-0"
                />
                <h2 className="font-[family-name:var(--font-nanum)] text-[18px] leading-[30px] font-extrabold text-[#1F2121]">
                  풍림 공장견학 안내
                </h2>
              </div>
              <div className="overflow-hidden rounded-[30px]">
                <img
                  src="/visit/00.png"
                  alt="충북 진천공장 전경"
                  className="h-[343px] w-full object-cover sm:h-[380px]"
                />
              </div>
            </div>
            <div className="flex flex-col gap-5">
              {TOUR_INFO.map((item) => (
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

          {/* 데스크톱 */}
          <div className="hidden flex-col gap-[10px] lg:flex lg:flex-row lg:gap-[clamp(16px,calc(70*100vw/1920),70px)]">
            <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-2xl lg:aspect-auto lg:h-[min(650px,calc(650*100vw/1920))] lg:w-[min(650px,calc(650*100vw/1920))]">
              <img
                src="/visit/00.png"
                alt="충북 진천공장 전경"
                className="h-full w-full object-cover"
              />
              <div
                className="absolute right-0 bottom-0 left-0 px-6 py-4"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.55), transparent)",
                }}
              >
                <p className="text-sm font-semibold text-white">
                  풍림 공장견학 안내
                </p>
              </div>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-[10px] sm:grid-cols-2 lg:grid-cols-2">
              {TOUR_INFO.map((item) => (
                <div
                  key={item.num}
                  className="flex w-full flex-col justify-center rounded-2xl px-5 py-6 sm:px-8 sm:py-7 lg:h-[clamp(160px,calc(210*100vw/1920),210px)] lg:w-[min(455px,calc(455*100vw/1920))]"
                  style={{ backgroundColor: "#ffffff" }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: "#02633E" }}
                    >
                      {item.num}
                    </span>
                    <p
                      className="tracking-[-0.04em] text-gray-900"
                      style={{ fontSize: pc1920(14, 20), fontWeight: 800 }}
                    >
                      {item.title}
                    </p>
                  </div>
                  <p
                    className="mt-3 leading-relaxed tracking-[-0.04em] whitespace-pre-line text-gray-600"
                    style={{ fontSize: pc1920(12, 18), fontWeight: 700 }}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </PageContentMax>
      </section>

      {/* ── 섹션 2: 한눈에 보는 공장견학 ── */}
      <section className="bg-[#003F2B]">
        <PageContentMax className="pt-5 pb-10 md:py-16 lg:pt-12">
          {/* 모바일: 노란 포인트 + 가로 스크롤 */}
          <div className="lg:hidden">
            <div className="flex items-center gap-[11px] px-0 py-5">
              <SectionTitleStar
                variant="intro"
                className="h-[21px] w-[21px] shrink-0"
              />
              <h2 className="font-[family-name:var(--font-nanum)] text-[18px] leading-[30px] font-extrabold text-white">
                한눈에 보는 공장견학
              </h2>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {SCENE_PHOTOS.map((photo, i) => (
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

          {/* 데스크톱 */}
          <div className="hidden lg:block">
            <div className="mb-8 flex items-center gap-2">
              <SectionTitleStar variant="onDark" className="h-5 w-5" />
              <h2
                className="text-2xl tracking-[-0.04em] text-white md:text-[clamp(20px,calc(24*100vw/1920),24px)]"
                style={{ fontWeight: 800 }}
              >
                한눈에 보는 공장견학
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {SCENE_PHOTOS.map((photo, i) => (
                <div key={photo.label} className="flex flex-col gap-3">
                  <div className="aspect-[385/634] w-full overflow-hidden rounded-2xl lg:aspect-auto lg:h-[clamp(280px,calc(634*100vw/1920),634px)] lg:w-[min(385px,calc(385*100vw/1920))]">
                    <img
                      src={photo.src}
                      alt={photo.label}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                      style={{ backgroundColor: "#ffffff", color: "#003F2B" }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-white">
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
        <PageContentMax className="py-10 md:py-16 lg:py-20">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-[clamp(24px,calc(70*100vw/1920),70px)]">
            {/* 데스크톱: 왼쪽 안내 카드 */}
            <div className="hidden w-full shrink-0 rounded-2xl bg-white px-6 py-8 md:px-10 md:py-10 lg:block lg:w-[min(580px,calc(580*100vw/1920))]">
              <h2
                className="mb-3 tracking-[-0.04em] text-gray-900"
                style={{ fontSize: pc1920(16, 24), fontWeight: 800 }}
              >
                견학신청하기
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-gray-600">
                현재 견학 신청을 받고 있습니다.
                <br />
                참여를 원하시는 분은 오른쪽 신청서를 작성해 주세요.
              </p>
              <hr className="mb-8 border-gray-300" />

              <div>
                <div className="mb-5 flex items-center gap-2">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: "#02633E" }}
                  >
                    !
                  </span>
                  <p
                    className="tracking-[-0.04em] text-gray-900"
                    style={{ fontSize: pc1920(14, 16), fontWeight: 700 }}
                  >
                    공장견학 유의사항
                  </p>
                </div>
                <ul className="space-y-3">
                  {NOTICES.map((n, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm leading-relaxed text-gray-600"
                    >
                      <span className="shrink-0">-</span>
                      <span>{n}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 모바일: 안내 + 유의사항 (흰 카드) */}
            <div className="rounded-[10px] bg-white p-5 lg:hidden">
              <h2 className="font-[family-name:var(--font-nanum)] text-[18px] leading-[27px] font-extrabold text-[#1F2121]">
                견학신청하기
              </h2>
              <p className="mt-3 font-[family-name:var(--font-nanum)] text-base leading-6 font-bold text-[#1F2121]">
                현재 견학 신청을 받고 있습니다.
                <br />
                참여를 원하시는 분은 신청서를 작성해 주세요.
              </p>
              <div className="mt-5 border-t border-[#1F2121]/20 pt-5">
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#003F2B] font-[family-name:var(--font-nanum)] text-[13px] leading-5 font-bold text-white">
                    !
                  </span>
                  <p className="font-[family-name:var(--font-nanum)] text-base leading-6 font-extrabold text-[#003F2B]">
                    공장견학 유의사항
                  </p>
                </div>
                <ul className="space-y-1">
                  {NOTICES.map((n, i) => (
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

            {/* 신청 폼 */}
            <div className="w-full min-w-0 shrink-0 lg:w-[min(750px,calc(750*100vw/1920))]">
              {submitted ? (
                <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-center lg:rounded-2xl">
                  <div
                    className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                    style={{ backgroundColor: "#02633E" }}
                  >
                    <Check className="h-7 w-7 text-white" />
                  </div>
                  <p className="text-base font-bold text-gray-900">
                    신청이 완료되었습니다!
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    담당자가 확인 후 빠르게 연락드리겠습니다.
                  </p>
                </div>
              ) : (
                <Form method="post" className="space-y-4 lg:space-y-4">
                  {/* ── 모바일 전용 필드 ── */}
                  <div className={cn("space-y-5", "lg:hidden")}>
                    <div>
                      <div className="mb-0 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-0.5">
                          <span className="font-[family-name:var(--font-nanum)] text-base font-bold text-black">
                            단체/기관명
                          </span>
                          <span className={ftStarClass}>*</span>
                        </div>
                        <span className="text-right font-[family-name:var(--font-nanum)] text-xs font-normal text-black">
                          <span className="text-[#F3372C]">* </span>필수
                          입력사항
                        </span>
                      </div>
                      <input
                        type="text"
                        name="organization"
                        required={mobile}
                        disabled={formLocked || !mobile}
                        placeholder="예 : 00초등학교"
                        className={cn(ftInputClass, "mt-5")}
                      />
                    </div>

                    <div className="flex flex-col gap-5">
                      <div className="flex max-w-[200px] items-center gap-0.5">
                        <span className="font-[family-name:var(--font-nanum)] text-base font-bold text-black">
                          담당자 성함
                        </span>
                        <span className={ftStarClass}>*</span>
                      </div>
                      <input
                        type="text"
                        name="manager_name"
                        required={mobile}
                        disabled={formLocked || !mobile}
                        placeholder="홍길동"
                        className={ftInputClass}
                      />
                    </div>

                    <div className="flex flex-col gap-5">
                      <div className="flex max-w-[200px] items-center gap-0.5">
                        <span className="font-[family-name:var(--font-nanum)] text-base font-bold text-black">
                          연락처
                        </span>
                        <span className={ftStarClass}>*</span>
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        required={mobile}
                        disabled={formLocked || !mobile}
                        placeholder="연락처를 입력해주세요."
                        className={ftInputClass}
                      />
                    </div>

                    <div className="flex flex-col gap-5">
                      <label className="block font-[family-name:var(--font-nanum)] text-base font-bold text-black">
                        이메일
                      </label>
                      <div className="flex flex-col gap-5">
                        <input
                          name="email_local"
                          value={emailLocal}
                          onChange={(e) => setEmailLocal(e.target.value)}
                          disabled={formLocked || !mobile}
                          placeholder="이메일을 입력해주세요."
                          autoComplete="email"
                          className={ftInputClass}
                        />
                        <span className="font-[Pretendard,system-ui,sans-serif] text-lg leading-5 font-light text-[#7B7B7B]">
                          @
                        </span>
                        <select
                          name="email_domain"
                          value={emailDomain}
                          onChange={(e) => setEmailDomain(e.target.value)}
                          disabled={formLocked || !mobile}
                          className={ftInputClass}
                        >
                          <option value="">직접입력</option>
                          {EMAIL_DOMAINS.slice(1).map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                        {emailDomain === "" && (
                          <input
                            name="email_domain_custom"
                            value={emailDomainCustom}
                            onChange={(e) =>
                              setEmailDomainCustom(e.target.value)
                            }
                            disabled={formLocked || !mobile}
                            placeholder=" "
                            className={cn(
                              ftInputClass,
                              "font-[Pretendard,system-ui,sans-serif] text-lg font-light text-[#7B7B7B] placeholder:text-[#7B7B7B]/40",
                            )}
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-5">
                      <div className="flex max-w-[200px] items-center gap-0.5">
                        <span className="font-[family-name:var(--font-nanum)] text-base font-bold text-black">
                          희망 견학일
                        </span>
                        <span className={ftStarClass}>*</span>
                      </div>
                      <div
                        className={cn(
                          ftInputClass,
                          "flex items-center gap-2.5 !py-0 max-lg:h-[60px]",
                        )}
                      >
                        <input
                          type="date"
                          name="date"
                          required={mobile}
                          disabled={formLocked || !mobile}
                          className="min-w-0 flex-1 border-0 bg-transparent p-0 font-[family-name:var(--font-nanum)] text-base outline-none focus:ring-0 max-lg:text-[#003F2B]"
                        />
                        <CalendarDays
                          className="size-5 shrink-0 text-[#2A343D]"
                          aria-hidden
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-5">
                      <div className="flex max-w-[200px] items-center gap-0.5">
                        <span className="font-[family-name:var(--font-nanum)] text-base font-bold text-black">
                          희망 시간대
                        </span>
                        <span className={ftStarClass}>*</span>
                      </div>
                      <select
                        name="visit_time"
                        required={mobile}
                        disabled={formLocked || !mobile}
                        className={ftInputClass}
                      >
                        <option value="">선택</option>
                        <option value="오전 10:00">오전 10:00</option>
                        <option value="오후 14:00">오후 14:00</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-5">
                      <div className="flex max-w-[200px] items-center gap-0.5">
                        <span className="font-[family-name:var(--font-nanum)] text-base font-bold text-black">
                          예상 인원
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
                        placeholder="예 : 30"
                        className={ftInputClass}
                      />
                    </div>

                    <div className="flex flex-col gap-5">
                      <div className="flex max-w-[200px] items-center gap-0.5">
                        <span className="font-[family-name:var(--font-nanum)] text-base font-bold text-black">
                          견학 목적
                        </span>
                        <span className={ftStarClass}>*</span>
                      </div>
                      <input
                        type="text"
                        name="purpose_text"
                        required={mobile}
                        disabled={formLocked || !mobile}
                        placeholder="예 : 현장학습, 기업탐방 등"
                        className={ftInputClass}
                      />
                    </div>

                    <div className="flex flex-col gap-5">
                      <div className="flex max-w-[200px] items-center gap-0.5">
                        <span className="font-[family-name:var(--font-nanum)] text-base font-bold text-black">
                          요청사항
                        </span>
                        <span className={ftStarClass}>*</span>
                      </div>
                      <textarea
                        name="message"
                        required={mobile}
                        disabled={formLocked || !mobile}
                        rows={5}
                        placeholder="기타 문의사항이나 요청사항을 입력해주세요"
                        className={cn(
                          ftInputClass,
                          "h-auto min-h-[120px] max-lg:h-auto max-lg:min-h-[200px] max-lg:py-[18px] max-lg:leading-5",
                        )}
                      />
                    </div>
                  </div>

                  {/* ── 데스크톱 전용 필드 ── */}
                  <div className={cn("hidden space-y-4", "lg:block")}>
                    <div>
                      <label className={labelCls}>견학날짜 선택</label>
                      <input
                        type="date"
                        name="date"
                        required={!mobile}
                        disabled={formLocked || mobile}
                        className={inputCls}
                        style={{ borderColor: "#E5E0D4" }}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>공장명 *</label>
                      <select
                        name="factory"
                        required={!mobile}
                        disabled={formLocked || mobile}
                        className={selectCls}
                        style={{ borderColor: "#E5E0D4" }}
                      >
                        <option value="">선택해주세요</option>
                        {FACTORY_OPTIONS.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>방문목적 *</label>
                      <select
                        name="purpose"
                        required={!mobile}
                        disabled={formLocked || mobile}
                        className={selectCls}
                        style={{ borderColor: "#E5E0D4" }}
                      >
                        <option value="">선택해주세요</option>
                        {PURPOSE_OPTIONS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <label className={labelCls}>단체명 *</label>
                        <input
                          type="text"
                          name="organization"
                          required={!mobile}
                          disabled={formLocked || mobile}
                          placeholder="단체명을 입력해 주세요"
                          className={inputCls}
                          style={{ borderColor: "#E5E0D4" }}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>수량</label>
                        <input
                          type="number"
                          name="quantity"
                          min="1"
                          disabled={formLocked || mobile}
                          placeholder="수량"
                          className={inputCls}
                          style={{ borderColor: "#E5E0D4" }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <label className={labelCls}>방문인원 *</label>
                        <span className="text-xs text-gray-400">
                          최소 10명, 최대 30명
                        </span>
                      </div>
                      <select
                        name="participants"
                        required={!mobile}
                        disabled={formLocked || mobile}
                        className={selectCls}
                        style={{ borderColor: "#E5E0D4" }}
                      >
                        <option value="">인원 선택</option>
                        {Array.from({ length: 5 }, (_, i) => (i + 2) * 5).map(
                          (n) => (
                            <option key={n} value={n}>
                              {n}명
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>방문 *</label>
                      <select
                        name="visit_time"
                        required={!mobile}
                        disabled={formLocked || mobile}
                        className={selectCls}
                        style={{ borderColor: "#E5E0D4" }}
                      >
                        <option value="">시간 선택</option>
                        <option value="오전 10:00">오전 10:00</option>
                        <option value="오후 14:00">오후 14:00</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>담당자명 *</label>
                      <input
                        type="text"
                        name="manager_name"
                        required={!mobile}
                        disabled={formLocked || mobile}
                        placeholder="담당자명을 입력해 주세요"
                        className={inputCls}
                        style={{ borderColor: "#E5E0D4" }}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>연락처 *</label>
                      <input
                        type="tel"
                        name="phone"
                        required={!mobile}
                        disabled={formLocked || mobile}
                        placeholder="연락처를 입력해 주세요"
                        className={inputCls}
                        style={{ borderColor: "#E5E0D4" }}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>문의사항</label>
                      <textarea
                        name="message"
                        rows={4}
                        disabled={formLocked || mobile}
                        placeholder="문의사항을 자유롭게 입력해 주세요."
                        className="w-full resize-none rounded-lg border bg-white px-4 py-3 text-sm outline-none focus:border-[#02633E] focus:ring-1 focus:ring-[#02633E]"
                        style={{ borderColor: "#E5E0D4" }}
                      />
                    </div>
                  </div>

                  {/* 개인정보 동의 */}
                  <label className="flex cursor-pointer items-start gap-3 rounded-[10px] bg-[#EAE3C9] p-5 lg:rounded-none lg:bg-transparent lg:p-0">
                    <input
                      type="checkbox"
                      checked={privacyAgreed}
                      onChange={(e) => setPrivacyAgreed(e.target.checked)}
                      className="mt-0.5 size-[18px] shrink-0 rounded-full border border-[#DDDDDD] accent-[#02633E]"
                    />
                    <span className="font-[family-name:var(--font-nanum)] text-sm leading-[21px] font-bold text-[#1F2121] lg:text-xs lg:font-normal lg:text-gray-600">
                      <span className="lg:hidden">
                        개인정보 수집 및 이용에 동의합니다. 수집된 정보는 문의
                        답변 목적으로만 사용되며, 답변 완료 후 일정 기간 보관 후
                        파기됩니다
                      </span>
                      <span className="hidden lg:inline">
                        <strong className="text-gray-800">[필수]</strong>{" "}
                        개인정보 수집 및 이용에 동의합니다. 견학 신청을 위한
                        개인정보(이름, 연락처 등)를 수집·이용합니다.
                      </span>
                    </span>
                  </label>

                  {actionData?.error && (
                    <p className="text-sm text-red-500">{actionData.error}</p>
                  )}

                  <div className="flex justify-center pt-2 lg:pt-2">
                    <button
                      type="submit"
                      disabled={formLocked || !privacyAgreed || isSubmitting}
                      className={cn(
                        "w-full rounded-full px-12 py-3.5 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-40",
                        "max-lg:rounded-[60px] max-lg:px-10 max-lg:py-5 max-lg:font-[family-name:var(--font-nanum)] max-lg:text-lg max-lg:leading-[23.4px] max-lg:font-extrabold lg:w-auto",
                      )}
                      style={{ backgroundColor: "#02633E" }}
                    >
                      {isSubmitting ? "신청 중..." : "견학 신청하기"}
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
