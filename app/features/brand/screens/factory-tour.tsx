import { useState } from "react";

import type { Route } from "./+types/factory-tour";

import { Check } from "lucide-react";
import { Form, useActionData, useNavigation } from "react-router";

import { Breadcrumb } from "~/core/components/breadcrumb";
import { PageContentMax } from "~/core/components/page-content-max";
import { pc1920 } from "~/core/lib/pc-fluid";

import { createFactoryTourApplication } from "../lib/queries.server";

/* ── 견학 안내 카드 ── */
const TOUR_INFO = [
  {
    num: "1",
    title: "견학공장",
    desc: "충청북도 진천군 이월면 공동길 51-21 (본사/공장)",
  },
  {
    num: "2",
    title: "견학기간",
    desc: "견학기간(3~6월, 9~11월)\n(7~8월, 12~2월은 견학을 실시하지 않습니다)",
  },
  {
    num: "3",
    title: "견학시간",
    desc: "오전 10:00 / 오후 14:00\n(약 1시간 30분 소요)",
  },
  {
    num: "4",
    title: "견학대상",
    desc: "10명 이상 단체\n(단, 유아/어린이 제품 견학 시 가능)",
  },
  {
    num: "5",
    title: "견학인원",
    desc: "1회당 40명 (최소 10명)",
  },
  {
    num: "6",
    title: "견학문의",
    desc: "043-533-2285",
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

export const meta: Route.MetaFunction = () => [{ title: "공장견학 | 풍림푸드" }];

export async function action({ request }: Route.ActionArgs) {
  const fd = await request.formData();
  const factory = fd.get("factory") as string;
  const visitTime = fd.get("visit_time") as string;
  const purpose = fd.get("purpose") as string;
  const purposeFull = [
    factory && `공장: ${factory}`,
    visitTime && `방문시간: ${visitTime}`,
    purpose && `방문목적: ${purpose}`,
  ]
    .filter(Boolean)
    .join(" / ");

  try {
    await createFactoryTourApplication({
      applicant_name: fd.get("manager_name") as string,
      organization: (fd.get("organization") as string) || null,
      phone: fd.get("phone") as string,
      email: null,
      participants: Number(fd.get("participants") || fd.get("quantity") || 1),
      purpose: purposeFull || purpose,
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

const labelCls =
  "mb-1.5 block text-sm font-semibold tracking-[-0.03em] text-gray-800";
const inputCls =
  "w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none focus:border-[#02633E] focus:ring-1 focus:ring-[#02633E]";
const selectCls =
  "w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none focus:border-[#02633E] appearance-none cursor-pointer";

export default function FactoryTourScreen() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const submitted = actionData?.success === true;
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f4f2e5" }}>

      {/* ── 브레드크럼 + 타이틀 ── */}
      <section>
        {/* 브레드크럼 */}
        <Breadcrumb
          items={[
            { label: "회사소개", href: "/brand/intro" },
            { label: "공장견학" },
          ]}
        />

        {/* 타이틀 + 서브타이틀 */}
        <PageContentMax className="py-12 text-center md:py-16" innerClassName="text-center">
          <h1
            className="tracking-[-0.04em]"
            style={{ color: "#003F2B", fontSize: pc1920(32, 60), fontWeight: 800 }}
          >
            공장견학
          </h1>
          <p
            className="mt-3 tracking-[-0.02em]"
            style={{ color: "#003F2B", fontSize: pc1920(12, 16), fontWeight: 400 }}
          >
            풍림푸드의 생산 현장을 직접 눈으로 확인하세요.
          </p>
        </PageContentMax>
      </section>

      {/* ── 섹션 1: 견학 안내 ── */}
      <section>
        <PageContentMax className="py-14 md:py-20">
          <div className="flex flex-col gap-[10px] lg:flex-row lg:gap-[clamp(16px,calc(70*100vw/1920),70px)]">

            {/* 공장 이미지 — 모바일은 전폭+정사각, lg~ 에서만 1920 시안 비율 */}
            <div
              className="relative aspect-square w-full shrink-0 overflow-hidden rounded-2xl lg:aspect-auto lg:h-[min(650px,calc(650*100vw/1920))] lg:w-[min(650px,calc(650*100vw/1920))]"
            >
              <img
                src="/visit/00.png"
                alt="충북 진천공장 전경"
                className="h-full w-full object-cover"
              />
              <div
                className="absolute bottom-0 left-0 right-0 px-6 py-4"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)" }}
              >
                <p className="text-sm font-semibold text-white">풍림 공장견학 안내</p>
              </div>
            </div>

            {/* 안내 카드 그리드 */}
            <div className="grid flex-1 grid-cols-1 gap-[10px] sm:grid-cols-2 lg:grid-cols-2">
              {TOUR_INFO.map((item) => (
                <div
                  key={item.num}
                  className="flex w-full flex-col justify-center rounded-2xl px-5 py-6 sm:px-8 sm:py-7 lg:h-[clamp(160px,calc(210*100vw/1920),210px)] lg:w-[min(455px,calc(455*100vw/1920))]"
                  style={{
                    backgroundColor: "#ffffff",
                  }}
                >
                  {/* 번호 + 타이틀 */}
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
                  {/* 설명 */}
                  <p
                    className="mt-3 whitespace-pre-line leading-relaxed tracking-[-0.04em] text-gray-600"
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
      <section style={{ backgroundColor: "#003F2B" }}>
        <PageContentMax className="py-12 md:py-16">
          {/* 타이틀 */}
          <div className="mb-8 flex items-center gap-2">
            <img
              src="/home/intro-star.png"
              alt="star"
              className="h-5 w-5 object-contain"
            />
            <h2
              className="text-2xl tracking-[-0.04em] text-white md:text-[clamp(20px,calc(24*100vw/1920),24px)]"
              style={{ fontWeight: 800 }}
            >
              한눈에 보는 공장견학
            </h2>
          </div>

          {/* 4컷 사진 + 라벨 */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {SCENE_PHOTOS.map((photo, i) => (
              <div key={photo.label} className="flex flex-col gap-3">
                {/* 사진 */}
                <div
                  className="aspect-[385/634] w-full overflow-hidden rounded-2xl lg:aspect-auto lg:h-[clamp(280px,calc(634*100vw/1920),634px)] lg:w-[min(385px,calc(385*100vw/1920))]"
                >
                  <img
                    src={photo.src}
                    alt={photo.label}
                    className="h-full w-full object-cover"
                  />
                </div>
                {/* 번호 + 라벨 (사진 아래) */}
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                    style={{ backgroundColor: "#ffffff", color: "#003F2B" }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-white">{photo.label}</span>
                </div>
              </div>
            ))}
          </div>
        </PageContentMax>
      </section>

      {/* ── 섹션 3: 견학 신청 ── */}
      <section>
        <PageContentMax className="py-14 md:py-20">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-[clamp(24px,calc(70*100vw/1920),70px)]">

            {/* 왼쪽: 견학신청하기 안내 (580px 시안) */}
            <div className="w-full shrink-0 rounded-2xl bg-white px-6 py-8 md:px-10 md:py-10 lg:w-[min(580px,calc(580*100vw/1920))]">
              <h2
                className="mb-3 tracking-[-0.04em] text-gray-900"
                style={{ fontSize: pc1920(16, 24), fontWeight: 800 }}
              >
                견학신청하기
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-gray-600">
                현재 견학 신청을 받고 있습니다.<br />
                참여를 원하시는 분은 오른쪽 신청서를 작성해 주세요.
              </p>
              <hr className="mb-8 border-gray-300" />

              {/* 공장견학 유의사항 */}
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
                    <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-gray-600">
                      <span className="shrink-0">-</span>
                      <span>{n}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 오른쪽: 신청 폼 (750px) */}
            <div className="w-full min-w-0 shrink-0 lg:w-[min(750px,calc(750*100vw/1920))]">
              {submitted ? (
                <div
                  className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-center"
                >
                  <div
                    className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                    style={{ backgroundColor: "#02633E" }}
                  >
                    <Check className="h-7 w-7 text-white" />
                  </div>
                  <p className="text-base font-bold text-gray-900">신청이 완료되었습니다!</p>
                  <p className="mt-2 text-sm text-gray-500">
                    담당자가 확인 후 빠르게 연락드리겠습니다.
                  </p>
                </div>
              ) : (
                <Form method="post" className="space-y-4">
                  {/* 견학날짜 */}
                  <div>
                    <label className={labelCls}>견학날짜 선택</label>
                    <input
                      type="date"
                      name="date"
                      required
                      className={inputCls}
                      style={{ borderColor: "#E5E0D4" }}
                    />
                  </div>

                  {/* 공장명 */}
                  <div>
                    <label className={labelCls}>공장명 *</label>
                    <select
                      name="factory"
                      required
                      className={selectCls}
                      style={{ borderColor: "#E5E0D4" }}
                    >
                      <option value="">선택해주세요</option>
                      {FACTORY_OPTIONS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>

                  {/* 방문목적 */}
                  <div>
                    <label className={labelCls}>방문목적 *</label>
                    <select
                      name="purpose"
                      required
                      className={selectCls}
                      style={{ borderColor: "#E5E0D4" }}
                    >
                      <option value="">선택해주세요</option>
                      {PURPOSE_OPTIONS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  {/* 단체명 + 수량 */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label className={labelCls}>단체명 *</label>
                      <input
                        type="text"
                        name="organization"
                        required
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
                        placeholder="수량"
                        className={inputCls}
                        style={{ borderColor: "#E5E0D4" }}
                      />
                    </div>
                  </div>

                  {/* 방문인원 */}
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className={labelCls}>방문인원 *</label>
                      <span className="text-xs text-gray-400">최소 10명, 최대 30명</span>
                    </div>
                    <select
                      name="participants"
                      required
                      className={selectCls}
                      style={{ borderColor: "#E5E0D4" }}
                    >
                      <option value="">인원 선택</option>
                      {Array.from({ length: 5 }, (_, i) => (i + 2) * 5).map((n) => (
                        <option key={n} value={n}>{n}명</option>
                      ))}
                    </select>
                  </div>

                  {/* 방문 시간대 */}
                  <div>
                    <label className={labelCls}>방문 *</label>
                    <select
                      name="visit_time"
                      required
                      className={selectCls}
                      style={{ borderColor: "#E5E0D4" }}
                    >
                      <option value="">시간 선택</option>
                      <option value="오전 10:00">오전 10:00</option>
                      <option value="오후 14:00">오후 14:00</option>
                    </select>
                  </div>

                  {/* 담당자명 */}
                  <div>
                    <label className={labelCls}>담당자명 *</label>
                    <input
                      type="text"
                      name="manager_name"
                      required
                      placeholder="담당자명을 입력해 주세요"
                      className={inputCls}
                      style={{ borderColor: "#E5E0D4" }}
                    />
                  </div>

                  {/* 연락처 */}
                  <div>
                    <label className={labelCls}>연락처 *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="연락처를 입력해 주세요"
                      className={inputCls}
                      style={{ borderColor: "#E5E0D4" }}
                    />
                  </div>

                  {/* 문의사항 */}
                  <div>
                    <label className={labelCls}>문의사항</label>
                    <textarea
                      name="message"
                      rows={4}
                      placeholder="문의사항을 자유롭게 입력해 주세요."
                      className="w-full resize-none rounded-lg border bg-white px-4 py-3 text-sm outline-none focus:border-[#02633E] focus:ring-1 focus:ring-[#02633E]"
                      style={{ borderColor: "#E5E0D4" }}
                    />
                  </div>

                  {/* 개인정보 동의 */}
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={privacyAgreed}
                      onChange={(e) => setPrivacyAgreed(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-[#02633E]"
                    />
                    <span className="text-xs text-gray-600">
                      <strong className="text-gray-800">[필수]</strong>{" "}
                      개인정보 수집 및 이용에 동의합니다. 견학 신청을 위한
                      개인정보(이름, 연락처 등)를 수집·이용합니다.
                    </span>
                  </label>

                  {actionData?.error && (
                    <p className="text-sm text-red-500">{actionData.error}</p>
                  )}

                  {/* 제출 버튼 */}
                  <div className="flex justify-center pt-2">
                    <button
                      type="submit"
                      disabled={!privacyAgreed || isSubmitting}
                      className="rounded-full px-12 py-3.5 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-40"
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
