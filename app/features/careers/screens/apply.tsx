import { format } from "date-fns";
import { ko as koLocale } from "date-fns/locale";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useParams, useFetcher } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/apply";
import { createJobApplication } from "../lib/queries.server";
import { uploadFile } from "~/core/lib/storage.server";
import { Button } from "~/core/components/ui/button";
import { SECTION_VIEWPORT_BLEED } from "~/core/lib/section-viewport-bleed";
import { cn } from "~/core/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/core/components/ui/select";
import {
  ChevronDown,
  ChevronLeft,
  FileText,
  CheckCircle,
  X,
} from "lucide-react";
import { Breadcrumb } from "~/core/components/breadcrumb";
import { DatePicker } from "~/core/components/ui/date-picker";
import i18next from "~/core/lib/i18next.server";

const EMAIL_DOMAIN_CUSTOM = "__custom__";
const EMAIL_PRESETS = [
  "gmail.com",
  "naver.com",
  "kakao.com",
  "daum.net",
  "nate.com",
  "hanmail.net",
] as const;

/**
 * 단계별 필수 검증 스위치. `true`면 해당 단계 검증을 건너뜀(시안·내부 테스트용).
 * 실제 접수·스테이징/프로덕션 배포 시에는 모두 `false` 권장.
 */
const APPLY_SKIP_STEP1_VALIDATION = false;
const APPLY_SKIP_STEP2_VALIDATION = false;
const APPLY_SKIP_STEP3_RESUME_CHECK = false;

const nanum = "font-[family-name:var(--font-nanum)]";

/** 모바일: 16px · #003F2B / PC: 18px · #1F2121 (60px · 10px 라운드) */
const applyFieldCls = cn(
  nanum,
  "h-[60px] w-full min-h-[60px] rounded-[10px] border-0 bg-white px-4 py-[18px] text-base font-normal leading-5 text-[#003F2B] outline-none transition-[box-shadow]",
  "md:text-[18px] md:text-[#1F2121]",
  "placeholder:text-[#003F2B]/65 md:placeholder:text-[#1F2121]/60",
  "focus:ring-2 focus:ring-[#02633E]/25",
);

const applyTextareaCls = cn(
  applyFieldCls,
  "h-auto min-h-[200px] resize-none py-[18px] leading-[18px] md:leading-[18px]",
);

function ApplyFieldLabel({
  children,
  required,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-0.5">
      <span className={cn(nanum, "text-base font-bold text-black md:text-xl")}>
        {children}
      </span>
      {required ? (
        <span
          className="font-[Pretendard,system-ui,sans-serif] text-base font-medium text-[#F3372C] md:text-xl"
          aria-hidden
        >
          *
        </span>
      ) : null}
    </div>
  );
}

function ApplyPillRadioRow({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex min-h-[30px] flex-wrap items-center gap-5">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <label
            key={opt.value}
            className="flex cursor-pointer items-center gap-2.5"
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={selected}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            <span
              className={cn(
                "flex size-[18px] shrink-0 items-center justify-center rounded-full",
                selected ? "bg-[#02633E]" : "border border-[#DDDDDD] bg-white",
              )}
            >
              {selected ? (
                <span className="size-2 rounded-full bg-white" />
              ) : null}
            </span>
            <span
              className={cn(
                nanum,
                "text-base font-normal leading-4 text-[#1F2121] md:text-lg md:leading-[18px]",
              )}
            >
              {opt.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}

function ApplyUploadDropZone({
  inputId,
  accept,
  file,
  onChange,
  hint,
  chooseFileLabel,
  removeAria,
}: {
  inputId: string;
  accept: string;
  file: File | null;
  onChange: (f: File | null) => void;
  hint: string;
  chooseFileLabel: string;
  removeAria: string;
}) {
  const pick = (list: FileList | null) => {
    const f = list?.[0];
    if (f) onChange(f);
  };

  return (
    <div
      className={cn(
        "flex h-[130px] min-h-[130px] w-full flex-col items-center justify-center rounded-[10px] border border-[#1F2121]/50 px-4 transition-colors",
        !file && "cursor-pointer hover:bg-black/[0.02]",
      )}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        pick(e.dataTransfer.files);
      }}
      onClick={() => {
        if (!file) document.getElementById(inputId)?.click();
      }}
      onKeyDown={(e) => {
        if (!file && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          document.getElementById(inputId)?.click();
        }
      }}
      role={file ? undefined : "button"}
      tabIndex={file ? undefined : 0}
    >
      <input
        id={inputId}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          pick(e.target.files);
          e.target.value = "";
        }}
        onClick={(e) => e.stopPropagation()}
      />
      {file ? (
        <div
          className="flex w-full max-w-full items-center justify-center gap-5 px-2"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <div className="flex min-w-0 max-w-[calc(100%-2.5rem)] items-center justify-center gap-1.5">
            <FileText
              className="size-[26px] shrink-0 text-[#1F2121]"
              strokeWidth={1.25}
              aria-hidden
            />
            <span
              className={cn(
                nanum,
                "truncate text-lg font-normal leading-[25.2px] text-[#1F2121]",
              )}
            >
              {file.name}
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            className="flex size-[25px] shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5"
            aria-label={removeAria}
          >
            <X className="size-2.5 text-black" strokeWidth={3} />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2">
          <span className="sr-only">{hint}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              document.getElementById(inputId)?.click();
            }}
            className={cn(
              nanum,
              "rounded-[40px] bg-[#EAE3C9] px-5 py-2.5 text-base font-extrabold leading-[1.3] text-[#1F2121] transition-colors hover:brightness-95",
            )}
          >
            {chooseFileLabel}
          </button>
        </div>
      )}
    </div>
  );
}

function formatApplyBirth(iso: string, lng: string): string {
  if (!iso?.trim()) return "—";
  try {
    const d = new Date(`${iso}T12:00:00`);
    if (Number.isNaN(d.getTime())) return iso;
    return format(
      d,
      lng.startsWith("en") ? "MMM d, yyyy" : "yyyy년 M월 d일",
      lng.startsWith("en") ? undefined : { locale: koLocale },
    );
  } catch {
    return iso;
  }
}

function formatApplyGradMonth(ym: string, lng: string): string {
  if (!ym?.trim()) return "—";
  const [y, m] = ym.split("-");
  if (!y || !m) return ym;
  if (lng.startsWith("en")) return `${y}-${m}`;
  return `${y}년 ${Number(m)}월`;
}

function applyEducationSummary(
  t: (key: string) => string,
  applyNs: string,
  value: string,
): string {
  const map: Record<string, string> = {
    "high-school": "eduHigh",
    college: "eduCollege",
    university: "eduUniv",
    master: "eduMaster",
    phd: "eduPhd",
  };
  const k = map[value];
  return k ? t(`${applyNs}.${k}`) : value?.trim() || "—";
}

function ApplyConsentCheck({
  id,
  checked,
  onChange,
  title,
  hint,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  hint: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <label
        htmlFor={id}
        className="flex cursor-pointer items-start gap-2.5 rounded-sm outline-none focus-within:ring-2 focus-within:ring-[#02633E]/35"
      >
        <span
          className={cn(
            "flex size-[18px] shrink-0 items-center justify-center rounded-full",
            checked ? "bg-[#02633E]" : "border border-[#DDDDDD] bg-white",
          )}
          aria-hidden
        >
          {checked ? (
            <span className="size-2 rounded-full bg-white" />
          ) : null}
        </span>
        <span className="flex min-w-0 flex-col gap-2.5">
          <span
            className={cn(
              nanum,
              "text-base font-normal leading-4 text-[#1F2121]",
            )}
          >
            {title}
          </span>
          <span
            className={cn(
              nanum,
              "text-[13px] font-normal leading-[13px] text-[#1F2121]",
            )}
          >
            {hint}
          </span>
        </span>
      </label>
    </div>
  );
}

export const meta: Route.MetaFunction = ({ data }) => [{ title: data?.metaTitle ?? "" }];

export async function loader({ request }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);
  return { metaTitle: t("pages.careers.apply.metaTitle") };
}

function formText(requestForm: globalThis.FormData, key: string): string | null {
  const v = requestForm.get(key);
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s || null;
}

async function optionalUploadToDocuments(
  requestForm: globalThis.FormData,
  field: string,
  folder: string,
): Promise<string | null> {
  const f = requestForm.get(field);
  if (!(f instanceof File) || f.size === 0) return null;
  const buf = await f.arrayBuffer();
  const ct =
    f.type && f.type !== "" ? f.type : "application/octet-stream";
  const { url } = await uploadFile("documents", folder, buf, f.name, ct);
  return url;
}

export async function action({ request, params }: Route.ActionArgs) {
  const t = await i18next.getFixedT(request);
  const fd = await request.formData();
  const jobId = Number(params.id);
  if (!jobId) return { success: false, error: t("pages.careers.apply.errors.invalidJob") };
  const applicantName = formText(fd, "name");
  const email = formText(fd, "email");
  const phone = formText(fd, "phone");
  const lookupPassword = formText(fd, "lookupPassword");
  if (!applicantName || !email || !phone) {
    return { success: false, error: t("pages.careers.apply.errors.submitFailed") };
  }
  if (!lookupPassword) {
    return {
      success: false,
      error: t("pages.careers.apply.errors.passwordRequired"),
    };
  }
  try {
    const uploadFolder = `careers/jobs/${jobId}/applications`;
    const [resume_url, self_intro_file_url, portfolio_url] = await Promise.all([
      optionalUploadToDocuments(fd, "resume", uploadFolder),
      optionalUploadToDocuments(fd, "coverLetter", uploadFolder),
      optionalUploadToDocuments(fd, "portfolio", uploadFolder),
    ]);

    const app = await createJobApplication({
      job_id: jobId,
      applicant_name: applicantName,
      email,
      phone,
      lookup_password: lookupPassword,
      birth_date: formText(fd, "birthDate"),
      address: formText(fd, "address"),
      cover_letter: formText(fd, "motivation"),
      resume_url,
      portfolio_url,
      education_level: formText(fd, "educationLevel"),
      school_name: formText(fd, "schoolName"),
      major: formText(fd, "major"),
      graduation_month: formText(fd, "graduationMonth"),
      experience_kind: formText(fd, "experienceKind"),
      current_company: formText(fd, "currentCompany"),
      current_position: formText(fd, "currentPosition"),
      military_service: formText(fd, "militaryService"),
      self_intro_file_url,
      marketing_opt_in: fd.get("marketingOptIn") === "true",
    });
    return { success: true, applicationId: app.application_id };
  } catch {
    return { success: false, error: t("pages.careers.apply.errors.submitFailed") };
  }
}

interface ApplyWizardState {
  name: string;
  email: string;
  phone: string;
  password: string;
  birthDate: string;
  address: string;
  education: string;
  university: string;
  major: string;
  graduationDate: string;
  experience: string;
  currentCompany: string;
  currentPosition: string;
  militaryService: string;
  motivation: string;
  resume: File | null;
  coverLetter: File | null;
  portfolio: File | null;
  privacyAgreement: boolean;
  marketingAgreement: boolean;
}

export default function CareerApplyScreen() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const fetcher = useFetcher<typeof action>();
  const actionData = fetcher.data;
  const isSubmitting = fetcher.state === "submitting";
  const [step, setStep] = useState(1);
  const isSubmitted = actionData?.success === true;
  const locale = i18n.language?.startsWith("en") ? "en-US" : "ko-KR";
  const applyNs = "pages.careers.apply";

  const [emailLocal, setEmailLocal] = useState("");
  const [emailDomain, setEmailDomain] = useState("");
  const [emailPreset, setEmailPreset] = useState<string>(EMAIL_DOMAIN_CUSTOM);

  const [formData, setFormData] = useState<ApplyWizardState>({
    name: "",
    email: "",
    phone: "",
    password: "",
    birthDate: "",
    address: "",
    education: "",
    university: "",
    major: "",
    graduationDate: "",
    experience: "",
    currentCompany: "",
    currentPosition: "",
    militaryService: "",
    motivation: "",
    resume: null,
    coverLetter: null,
    portfolio: null,
    privacyAgreement: false,
    marketingAgreement: false,
  });

  const handleInputChange = (field: keyof ApplyWizardState, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field: "resume" | "coverLetter" | "portfolio", file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  useEffect(() => {
    const local = emailLocal.trim();
    const domain = emailDomain.trim();
    setFormData((prev) => ({
      ...prev,
      email: local && domain ? `${local}@${domain}` : "",
    }));
  }, [emailLocal, emailDomain]);

  const handleEmailPresetChange = (value: string) => {
    setEmailPreset(value);
    if (value !== EMAIL_DOMAIN_CUSTOM) {
      setEmailDomain(value);
    }
  };

  const handleDraftSave = () => {
    if (typeof window === "undefined" || !id) return;
    try {
      localStorage.setItem(
        `career-apply-draft-${id}`,
        JSON.stringify({
          formData,
          emailLocal,
          emailDomain,
          emailPreset,
          step,
        }),
      );
    } catch {
      /* ignore quota / private mode */
    }
  };

  const handleStep1Next = () => {
    if (APPLY_SKIP_STEP1_VALIDATION) {
      setStep(2);
      return;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
    if (
      !formData.name.trim() ||
      !emailOk ||
      !formData.phone.trim() ||
      !formData.password.trim()
    ) {
      return;
    }
    setStep(2);
  };

  const step1NextDisabled =
    !APPLY_SKIP_STEP1_VALIDATION &&
    (!formData.name.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()) ||
      !formData.phone.trim() ||
      !formData.password.trim());

  const handleStep2Next = () => {
    if (APPLY_SKIP_STEP2_VALIDATION) {
      setStep(3);
      return;
    }
    if (!formData.education) return;
    if (!formData.university.trim()) return;
    if (!formData.experience) return;
    if (formData.experience === "experienced") {
      if (
        !formData.currentCompany.trim() ||
        !formData.currentPosition.trim()
      ) {
        return;
      }
    }
    if (
      !formData.motivation.trim() ||
      formData.motivation.length > 500
    ) {
      return;
    }
    setStep(3);
  };

  const step2NextDisabled =
    !APPLY_SKIP_STEP2_VALIDATION &&
    (!formData.education ||
      !formData.university.trim() ||
      !formData.experience ||
      (formData.experience === "experienced" &&
        (!formData.currentCompany.trim() ||
          !formData.currentPosition.trim())) ||
      !formData.motivation.trim() ||
      formData.motivation.length > 500);

  const handleStep3Next = () => {
    if (!APPLY_SKIP_STEP3_RESUME_CHECK && !formData.resume) return;
    setStep(4);
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  const handleFinalSubmit = () => {
    if (
      !formData.privacyAgreement ||
      !formData.name?.trim() ||
      !formData.email?.trim() ||
      !formData.phone?.trim() ||
      !formData.password.trim()
    ) {
      return;
    }
    if (!id) return;
    const fd = new FormData();
    fd.append("name", formData.name.trim());
    fd.append("email", formData.email.trim());
    fd.append("phone", formData.phone.trim());
    fd.append("lookupPassword", formData.password.trim());
    fd.append("birthDate", formData.birthDate);
    fd.append("address", formData.address);
    fd.append("motivation", formData.motivation);
    fd.append("educationLevel", formData.education);
    fd.append("schoolName", formData.university);
    fd.append("major", formData.major);
    fd.append("graduationMonth", formData.graduationDate);
    fd.append("experienceKind", formData.experience);
    fd.append("currentCompany", formData.currentCompany);
    fd.append("currentPosition", formData.currentPosition);
    fd.append("militaryService", formData.militaryService);
    fd.append("marketingOptIn", formData.marketingAgreement ? "true" : "false");
    if (formData.resume) fd.append("resume", formData.resume);
    if (formData.coverLetter) fd.append("coverLetter", formData.coverLetter);
    if (formData.portfolio) fd.append("portfolio", formData.portfolio);
    fetcher.submit(fd, { method: "post", encType: "multipart/form-data" });
  };

  if (isSubmitted) {
    return (
      <div className={cn(SECTION_VIEWPORT_BLEED, "min-h-screen min-w-0 bg-[var(--site-chrome-header-bg,#FDFDF5)]")}>
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="mb-4 text-3xl font-bold text-foreground">{t("pages.careers.apply.successTitle")}</h1>
            <p className="mb-8 text-muted-foreground">{t("pages.careers.apply.successBody")}</p>
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <h3 className="mb-2 font-semibold">{t("pages.careers.apply.receiptInfo")}</h3>
                {actionData?.applicationId && (
                  <p className="text-sm text-muted-foreground">
                    {t("pages.careers.apply.receiptNo", { id: actionData.applicationId })}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {t("pages.careers.apply.receiptAt", {
                    datetime: new Date().toLocaleString(locale),
                  })}
                </p>
              </div>
              <div className="flex justify-center gap-4">
                <Link to="/careers/positions">
                  <Button>{t("pages.careers.apply.otherPostings")}</Button>
                </Link>
                <Link to="/">
                  <Button variant="outline">{t("pages.careers.apply.home")}</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stepperItems = [
    { n: 1 as const, title: t(`${applyNs}.step1`) },
    { n: 2 as const, title: t(`${applyNs}.step2`) },
    { n: 3 as const, title: t(`${applyNs}.step3`) },
    { n: 4 as const, title: t(`${applyNs}.step4`) },
  ];

  const lng = i18n.language ?? "ko";
  const birthSummary = formatApplyBirth(formData.birthDate, lng);
  const gradSummary = formatApplyGradMonth(formData.graduationDate, lng);
  const eduSummary = applyEducationSummary(t, applyNs, formData.education);
  const militarySummary =
    formData.militaryService === "completed"
      ? t(`${applyNs}.milDone`)
      : formData.militaryService === "exempted"
        ? t(`${applyNs}.milExempt`)
        : formData.militaryService === "not-applicable"
          ? t(`${applyNs}.milNa`)
          : "—";
  const careerSummary =
    formData.experience === "fresh"
      ? t(`${applyNs}.summaryFresh`)
      : formData.experience === "experienced"
        ? t(`${applyNs}.summaryExp`)
        : "—";
  const roleSummary =
    formData.experience === "experienced"
      ? formData.currentPosition.trim() || "—"
      : "—";

  const reviewLine = (labelKey: string, value: string) =>
    `${t(`${applyNs}.${labelKey}`)} : ${value || "—"}`;

  return (
    <div
      className={cn(
        SECTION_VIEWPORT_BLEED,
        "min-h-screen min-w-0 bg-[var(--site-chrome-header-bg,#FDFDF5)]",
      )}
    >
      <Breadcrumb
        items={[
          { label: t("navigation.mega.company"), href: "/brand/intro" },
          { label: t("pages.careers.breadcrumb"), href: "/careers/positions" },
          { label: t(`${applyNs}.breadcrumb`) },
        ]}
      />
      <div className="mx-auto max-w-[1600px] px-4 pb-16 pt-10 md:px-10 xl:px-[160px] xl:pt-[100px]">
        <Link
          to="/careers/positions"
          viewTransition
          className="mb-5 inline-flex items-center gap-2 rounded-[40px] outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#02633E]/40"
        >
          <ChevronLeft
            className="size-[18px] shrink-0 text-[#02633E]"
            strokeWidth={2.5}
            aria-hidden
          />
          <span
            className={cn(
              nanum,
              "text-base font-bold leading-[1.3] text-[#003F2B]",
            )}
          >
            {t(`${applyNs}.backToPosting`)}
          </span>
        </Link>

        <div className="mx-auto flex w-full max-w-[750px] flex-col items-center gap-5 md:gap-[60px]">
          {/* 모바일: 현재 단계만 라벨 · PC: 단계별 균등 + 라벨 */}
          <div
            className={cn(
              "w-full rounded-[40px] bg-[#EAE3C9] px-5 py-2.5 md:px-10",
            )}
          >
            <div className="flex min-h-12 w-full items-center gap-[9px] overflow-x-auto md:gap-0 md:overflow-visible">
              {stepperItems.map((item) => {
                const isFuture = item.n > step;
                const isActive = item.n === step;
                return (
                  <div
                    key={item.n}
                    className={cn(
                      "flex items-center gap-[9px]",
                      isActive
                        ? "min-w-0 flex-1"
                        : "shrink-0",
                      "md:min-w-0 md:flex-1 md:justify-center md:gap-2.5",
                      isFuture && "opacity-30",
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-[26px] shrink-0 items-center justify-center rounded-full text-base font-bold leading-6 text-white md:size-[30px]",
                        isFuture ? "bg-[#1F2121] text-[#F0EEDD]" : "bg-[#02633E]",
                      )}
                    >
                      {item.n}
                    </div>
                    <span
                      className={cn(
                        nanum,
                        "truncate text-base font-extrabold leading-6 md:inline",
                        isActive ? "text-[#003F2B]" : "text-[#1F2121]",
                        !isActive && "hidden md:inline",
                      )}
                    >
                      {item.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <form
            method="post"
            onSubmit={handleFormSubmit}
            className="w-full"
          >
            {step === 1 && (
              <div className="flex w-full flex-col gap-10 md:gap-[60px]">
                <div className="w-full">
                  <div className="flex flex-col gap-2.5 py-5 md:gap-0 md:py-0">
                    <div className="flex items-start justify-between gap-2 md:pb-[60px]">
                      <h2
                        className={cn(
                          nanum,
                          "text-xl font-extrabold leading-[30px] text-[#1F2121] md:text-[32px] md:leading-tight md:text-black",
                        )}
                      >
                        {t(`${applyNs}.step1Title`)}
                      </h2>
                      <p
                        className={cn(
                          nanum,
                          "shrink-0 text-xs font-normal md:hidden",
                        )}
                      >
                        <span className="text-[#F3372C]">* </span>
                        <span className="text-black">
                          {t(`${applyNs}.requiredFieldsNote`)}
                        </span>
                      </p>
                    </div>
                    <p
                      className={cn(
                        nanum,
                        "text-base font-normal leading-6 text-[#1F2121] md:hidden",
                      )}
                    >
                      {t(`${applyNs}.step1Desc`)}
                    </p>
                    <div className="hidden md:flex md:flex-row md:items-center md:justify-between md:pb-[60px]">
                      <p
                        className={cn(
                          nanum,
                          "text-xl font-normal leading-5 text-[#1F2121]/60",
                        )}
                      >
                        {t(`${applyNs}.step1Desc`)}
                      </p>
                      <p
                        className={cn(
                          nanum,
                          "shrink-0 text-center text-[13px] font-normal md:text-right",
                        )}
                      >
                        <span className="text-[#F3372C]">* </span>
                        <span className="text-black">
                          {t(`${applyNs}.requiredFieldsNote`)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-black/60 pt-10 md:pt-[60px]">
                    <div className="flex flex-col gap-5 md:gap-[30px]">
                      {/* 성함 */}
                      <div className="flex flex-col gap-5">
                        <ApplyFieldLabel required>
                          {t(`${applyNs}.labelNamePlain`)}
                        </ApplyFieldLabel>
                        <input
                          id="apply-name"
                          autoComplete="name"
                          value={formData.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          placeholder={t(`${applyNs}.phName`)}
                          className={applyFieldCls}
                        />
                      </div>

                      {/* 이메일 */}
                      <div className="flex flex-col gap-5">
                        <ApplyFieldLabel required>
                          {t(`${applyNs}.labelEmailPlain`)}
                        </ApplyFieldLabel>
                        <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-2.5">
                          <input
                            id="apply-email-local"
                            autoComplete="email"
                            value={emailLocal}
                            onChange={(e) => setEmailLocal(e.target.value)}
                            placeholder={t(`${applyNs}.phEmailLocal`)}
                            className={cn(applyFieldCls, "min-w-0 flex-1")}
                          />
                          <span
                            className={cn(
                              nanum,
                              "hidden shrink-0 text-center text-xl font-bold leading-none text-black md:block",
                            )}
                          >
                            @
                          </span>
                          <input
                            id="apply-email-domain"
                            value={emailDomain}
                            readOnly={emailPreset !== EMAIL_DOMAIN_CUSTOM}
                            onChange={(e) => setEmailDomain(e.target.value)}
                            placeholder=""
                            className={cn(
                              applyFieldCls,
                              "min-w-0 flex-1",
                              emailPreset === EMAIL_DOMAIN_CUSTOM &&
                                "placeholder:font-[Pretendard,system-ui,sans-serif] placeholder:font-light placeholder:text-[#7B7B7B]",
                            )}
                            aria-label={t(`${applyNs}.labelEmailPlain`)}
                          />
                          <div className="relative min-w-0 flex-1">
                            <select
                              value={emailPreset}
                              onChange={(e) =>
                                handleEmailPresetChange(e.target.value)
                              }
                              className={cn(
                                applyFieldCls,
                                "cursor-pointer appearance-none pr-10",
                              )}
                              aria-label={t(
                                "pages.careers.positions.emailDirectInput",
                              )}
                            >
                              <option value={EMAIL_DOMAIN_CUSTOM}>
                                {t("pages.careers.positions.emailDirectInput")}
                              </option>
                              {EMAIL_PRESETS.map((d) => (
                                <option key={d} value={d}>
                                  {d}
                                </option>
                              ))}
                            </select>
                            <ChevronDown
                              className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-[#1F2121]/55"
                              aria-hidden
                            />
                          </div>
                        </div>
                      </div>

                      {/* 연락처 */}
                      <div className="flex flex-col gap-5">
                        <ApplyFieldLabel required>
                          {t(`${applyNs}.labelPhonePlain`)}
                        </ApplyFieldLabel>
                        <input
                          id="apply-phone"
                          autoComplete="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          placeholder={t(`${applyNs}.phPhone`)}
                          className={applyFieldCls}
                        />
                      </div>

                      {/* 생년월일 */}
                      <div className="flex flex-col gap-5">
                        <ApplyFieldLabel>
                          {t(`${applyNs}.labelBirth`)}
                        </ApplyFieldLabel>
                        <DatePicker
                          value={
                            formData.birthDate
                              ? new Date(`${formData.birthDate}T12:00:00`)
                              : undefined
                          }
                          onChange={(d) =>
                            handleInputChange(
                              "birthDate",
                              d ? format(d, "yyyy-MM-dd") : "",
                            )
                          }
                          placeholder={t(`${applyNs}.phBirthDate`)}
                          disableFuture
                          yearMonthDropdowns
                          triggerVariant="outline"
                          className={cn(
                            applyFieldCls,
                            "!h-[60px] flex w-full flex-row-reverse justify-between gap-2 border-0 !px-4 shadow-none hover:bg-white",
                            "[&_svg]:ml-0 [&_svg]:mr-0 [&_svg]:size-6 [&_svg]:shrink-0 [&_svg]:text-[#2A343D]",
                          )}
                        />
                      </div>

                      {/* 주소 */}
                      <div className="flex flex-col gap-5">
                        <ApplyFieldLabel>
                          {t(`${applyNs}.labelAddress`)}
                        </ApplyFieldLabel>
                        <input
                          id="apply-address"
                          autoComplete="street-address"
                          value={formData.address}
                          onChange={(e) =>
                            handleInputChange("address", e.target.value)
                          }
                          placeholder={t(`${applyNs}.phAddress`)}
                          className={applyFieldCls}
                        />
                      </div>

                      {/* 비밀번호 */}
                      <div className="flex flex-col gap-5">
                        <ApplyFieldLabel required>
                          {t(`${applyNs}.labelPasswordPlain`)}
                        </ApplyFieldLabel>
                        <input
                          id="apply-password"
                          type="password"
                          autoComplete="new-password"
                          value={formData.password}
                          onChange={(e) =>
                            handleInputChange("password", e.target.value)
                          }
                          placeholder={t(`${applyNs}.phPassword`)}
                          className={applyFieldCls}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-4">
                  <button
                    type="button"
                    onClick={handleDraftSave}
                    className={cn(
                      nanum,
                      "order-2 mx-auto rounded-[40px] bg-[#EAE3C9] px-5 py-2.5 text-base font-extrabold leading-[1.3] text-[#1F2121] transition-colors hover:brightness-95 md:order-1 md:mx-0",
                    )}
                  >
                    {t(`${applyNs}.draftSave`)}
                  </button>
                  <button
                    type="button"
                    onClick={handleStep1Next}
                    disabled={step1NextDisabled}
                    className={cn(
                      nanum,
                      "order-1 w-full rounded-[60px] bg-[#02633E] px-10 py-5 text-lg font-extrabold leading-[1.3] text-white transition-colors hover:brightness-110 md:order-2 md:w-auto",
                      step1NextDisabled &&
                        "cursor-not-allowed opacity-50 hover:brightness-100",
                    )}
                  >
                    {t(`${applyNs}.next`)}
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex w-full flex-col gap-10 md:gap-[60px]">
                <div className="w-full">
                  <div className="flex flex-col gap-2.5 py-5 md:gap-0 md:py-0">
                    <div className="flex items-start justify-between gap-2 md:pb-[60px]">
                      <h2
                        className={cn(
                          nanum,
                          "text-xl font-extrabold leading-[30px] text-[#1F2121] md:text-[32px] md:leading-tight md:text-black",
                        )}
                      >
                        {t(`${applyNs}.step2Title`)}
                      </h2>
                      <p
                        className={cn(
                          nanum,
                          "shrink-0 text-xs font-normal md:hidden",
                        )}
                      >
                        <span className="text-[#F3372C]">* </span>
                        <span className="text-black">
                          {t(`${applyNs}.requiredFieldsNote`)}
                        </span>
                      </p>
                    </div>
                    <p
                      className={cn(
                        nanum,
                        "text-base font-normal leading-6 text-[#1F2121] md:hidden",
                      )}
                    >
                      {t(`${applyNs}.step2Desc`)}
                    </p>
                    <div className="hidden md:flex md:flex-row md:items-center md:justify-between md:pb-[60px]">
                      <p
                        className={cn(
                          nanum,
                          "text-xl font-normal leading-5 text-[#1F2121]/60",
                        )}
                      >
                        {t(`${applyNs}.step2Desc`)}
                      </p>
                      <p
                        className={cn(
                          nanum,
                          "shrink-0 text-center text-[13px] font-normal md:text-right",
                        )}
                      >
                        <span className="text-[#F3372C]">* </span>
                        <span className="text-black">
                          {t(`${applyNs}.requiredFieldsNote`)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-black/60 pt-10 md:pt-[60px]">
                    <div className="flex flex-col gap-5 md:gap-[30px]">
                      {/* 최종학력 */}
                      <div className="flex flex-col gap-5">
                        <ApplyFieldLabel required>
                          {t(`${applyNs}.labelEduLevelPlain`)}
                        </ApplyFieldLabel>
                        <Select
                          value={formData.education || undefined}
                          onValueChange={(value) =>
                            handleInputChange("education", value)
                          }
                        >
                          <SelectTrigger
                            className={cn(
                              applyFieldCls,
                              "flex !h-[60px] w-full items-center justify-between gap-2 border-0 shadow-none",
                              "data-[placeholder]:text-[#003F2B]/65 md:data-[placeholder]:text-[#1F2121]/60",
                              "[&>span]:line-clamp-1 [&>span]:text-left [&>span]:text-[#003F2B] md:[&>span]:text-[#1F2121]",
                              !formData.education &&
                                "[&>span]:text-[#003F2B]/65 md:[&>span]:text-[#1F2121]/60",
                            )}
                          >
                            <SelectValue
                              placeholder={t(`${applyNs}.phSelect`)}
                            />
                          </SelectTrigger>
                          <SelectContent className="z-[220]">
                            <SelectItem value="high-school">
                              {t(`${applyNs}.eduHigh`)}
                            </SelectItem>
                            <SelectItem value="college">
                              {t(`${applyNs}.eduCollege`)}
                            </SelectItem>
                            <SelectItem value="university">
                              {t(`${applyNs}.eduUniv`)}
                            </SelectItem>
                            <SelectItem value="master">
                              {t(`${applyNs}.eduMaster`)}
                            </SelectItem>
                            <SelectItem value="phd">
                              {t(`${applyNs}.eduPhd`)}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* 학교명 */}
                      <div className="flex flex-col gap-5">
                        <ApplyFieldLabel required>
                          {t(`${applyNs}.labelSchool`)}
                        </ApplyFieldLabel>
                        <input
                          id="apply-university"
                          value={formData.university}
                          onChange={(e) =>
                            handleInputChange("university", e.target.value)
                          }
                          placeholder={t(`${applyNs}.phSchool`)}
                          className={applyFieldCls}
                        />
                      </div>

                      {/* 전공 */}
                      <div className="flex flex-col gap-5">
                        <ApplyFieldLabel>
                          {t(`${applyNs}.labelMajor`)}
                        </ApplyFieldLabel>
                        <input
                          id="apply-major"
                          value={formData.major}
                          onChange={(e) =>
                            handleInputChange("major", e.target.value)
                          }
                          placeholder={t(`${applyNs}.phMajor`)}
                          className={applyFieldCls}
                        />
                      </div>

                      {/* 졸업일 */}
                      <div className="flex flex-col gap-5">
                        <ApplyFieldLabel>
                          {t(`${applyNs}.labelGradMonth`)}
                        </ApplyFieldLabel>
                        <input
                          id="apply-graduation"
                          type="month"
                          value={formData.graduationDate}
                          onChange={(e) =>
                            handleInputChange(
                              "graduationDate",
                              e.target.value,
                            )
                          }
                          className={cn(
                            applyFieldCls,
                            !formData.graduationDate &&
                              "text-[#003F2B]/65 md:text-[#1F2121]/60",
                          )}
                          aria-label={t(`${applyNs}.labelGradMonth`)}
                        />
                      </div>

                      {/* 경력구분 + 직장/직급 */}
                      <div className="flex flex-col gap-5">
                        <ApplyFieldLabel required>
                          {t(`${applyNs}.labelCareerTypePlain`)}
                        </ApplyFieldLabel>
                        <ApplyPillRadioRow
                          name="career-experience"
                          value={formData.experience}
                          onChange={(v) => handleInputChange("experience", v)}
                          options={[
                            {
                              value: "fresh",
                              label: t(`${applyNs}.careerFresh`),
                            },
                            {
                              value: "experienced",
                              label: t(`${applyNs}.careerExp`),
                            },
                          ]}
                        />
                        {formData.experience === "experienced" ? (
                          <div className="flex flex-col gap-5 md:flex-row md:items-start md:gap-2.5">
                            <div className="flex min-w-0 flex-1 flex-col gap-5">
                              <ApplyFieldLabel>
                                {t(`${applyNs}.labelCurrentCompany`)}
                              </ApplyFieldLabel>
                              <input
                                id="apply-company"
                                value={formData.currentCompany}
                                onChange={(e) =>
                                  handleInputChange(
                                    "currentCompany",
                                    e.target.value,
                                  )
                                }
                                placeholder={t(`${applyNs}.phCompany`)}
                                className={applyFieldCls}
                              />
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col gap-5">
                              <ApplyFieldLabel>
                                {t(`${applyNs}.labelCurrentRole`)}
                              </ApplyFieldLabel>
                              <input
                                id="apply-position"
                                value={formData.currentPosition}
                                onChange={(e) =>
                                  handleInputChange(
                                    "currentPosition",
                                    e.target.value,
                                  )
                                }
                                placeholder={t(`${applyNs}.phPosition`)}
                                className={applyFieldCls}
                              />
                            </div>
                          </div>
                        ) : null}
                      </div>

                      {/* 병역 */}
                      <div className="flex flex-col gap-5">
                        <ApplyFieldLabel>
                          {t(`${applyNs}.military`)}
                        </ApplyFieldLabel>
                        <ApplyPillRadioRow
                          name="career-military"
                          value={formData.militaryService}
                          onChange={(v) =>
                            handleInputChange("militaryService", v)
                          }
                          options={[
                            {
                              value: "completed",
                              label: t(`${applyNs}.milDone`),
                            },
                            {
                              value: "exempted",
                              label: t(`${applyNs}.milExempt`),
                            },
                            {
                              value: "not-applicable",
                              label: t(`${applyNs}.milNa`),
                            },
                          ]}
                        />
                      </div>

                      {/* 지원동기 */}
                      <div className="flex flex-col gap-5">
                        <ApplyFieldLabel required>
                          {t(`${applyNs}.labelMotivationPlain`)}
                        </ApplyFieldLabel>
                        <div className="flex flex-col gap-2.5">
                          <textarea
                            id="apply-motivation"
                            value={formData.motivation}
                            onChange={(e) =>
                              handleInputChange(
                                "motivation",
                                e.target.value,
                              )
                            }
                            placeholder={t(`${applyNs}.phMotivation`)}
                            maxLength={500}
                            rows={8}
                            className={cn(
                              applyTextareaCls,
                              "h-[200px] min-h-[200px] resize-none md:h-auto md:min-h-[200px]",
                            )}
                          />
                          <div className="flex justify-end">
                            <span
                              className={cn(
                                nanum,
                                "text-sm font-normal leading-[14px] text-[#1F2121] opacity-60",
                              )}
                            >
                              {formData.motivation.length}/500
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-4">
                  <button
                    type="button"
                    onClick={handleStep2Next}
                    disabled={step2NextDisabled}
                    className={cn(
                      nanum,
                      "order-1 w-full rounded-[60px] bg-[#02633E] px-10 py-5 text-lg font-extrabold leading-[1.3] text-white transition-colors hover:brightness-110 md:order-2 md:w-auto",
                      step2NextDisabled &&
                        "cursor-not-allowed opacity-50 hover:brightness-100",
                    )}
                  >
                    {t(`${applyNs}.next`)}
                  </button>
                  <div className="order-2 flex w-full gap-1.5 md:order-1 md:w-auto md:flex-wrap md:gap-1">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className={cn(
                        nanum,
                        "inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-[40px] bg-[#EAE3C9] px-5 py-2.5 text-base font-extrabold leading-[1.3] text-[#1F2121] transition-colors hover:brightness-95 md:flex-initial",
                      )}
                    >
                      <ChevronLeft
                        className="size-[18px] shrink-0 text-[#4F4F4F]"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                      {t(`${applyNs}.prevStep`)}
                    </button>
                    <button
                      type="button"
                      onClick={handleDraftSave}
                      className={cn(
                        nanum,
                        "min-h-[44px] flex-1 rounded-[40px] bg-[#EAE3C9] px-5 py-2.5 text-base font-extrabold leading-[1.3] text-[#1F2121] transition-colors hover:brightness-95 md:flex-initial",
                      )}
                    >
                      {t(`${applyNs}.draftSave`)}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex w-full flex-col gap-10 md:gap-[60px]">
                <div className="w-full">
                  <div className="flex flex-col gap-2.5 py-5 md:gap-0 md:py-0">
                    <div className="flex items-start justify-between gap-2 md:pb-[60px]">
                      <h2
                        className={cn(
                          nanum,
                          "text-xl font-extrabold leading-[30px] text-[#1F2121] md:text-[32px] md:leading-tight md:text-black",
                        )}
                      >
                        {t(`${applyNs}.step3Title`)}
                      </h2>
                      <p
                        className={cn(
                          nanum,
                          "shrink-0 text-xs font-normal md:hidden",
                        )}
                      >
                        <span className="text-[#F3372C]">* </span>
                        <span className="text-black">
                          {t(`${applyNs}.requiredFieldsNote`)}
                        </span>
                      </p>
                    </div>
                    <p
                      className={cn(
                        nanum,
                        "whitespace-pre-line text-base font-normal leading-6 text-[#1F2121] md:hidden",
                      )}
                    >
                      {t(`${applyNs}.step3Desc`)}
                    </p>
                    <div className="hidden md:flex md:flex-row md:items-center md:justify-between md:pb-[60px]">
                      <p
                        className={cn(
                          nanum,
                          "whitespace-pre-line text-xl font-normal leading-5 text-[#1F2121]/60 md:whitespace-normal",
                        )}
                      >
                        {t(`${applyNs}.step3Desc`)}
                      </p>
                      <p
                        className={cn(
                          nanum,
                          "shrink-0 text-center text-[13px] font-normal md:text-right",
                        )}
                      >
                        <span className="text-[#F3372C]">* </span>
                        <span className="text-black">
                          {t(`${applyNs}.requiredFieldsNote`)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-black/60 pt-10 md:pt-[60px]">
                    <div className="flex flex-col gap-5 md:gap-[30px]">
                      <div className="flex flex-col gap-5">
                        <ApplyFieldLabel required>
                          {t(`${applyNs}.labelResumePlain`)}
                        </ApplyFieldLabel>
                        <ApplyUploadDropZone
                          inputId="apply-file-resume"
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          file={formData.resume}
                          onChange={(f) => handleFileUpload("resume", f)}
                          hint={t(`${applyNs}.uploadDrop`)}
                          chooseFileLabel={t(`${applyNs}.chooseFile`)}
                          removeAria={t(`${applyNs}.removeUploadedFile`)}
                        />
                      </div>

                      <div className="flex flex-col gap-5">
                        <ApplyFieldLabel>
                          {t(`${applyNs}.labelClPlain`)}
                        </ApplyFieldLabel>
                        <ApplyUploadDropZone
                          inputId="apply-file-cover"
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          file={formData.coverLetter}
                          onChange={(f) => handleFileUpload("coverLetter", f)}
                          hint={t(`${applyNs}.uploadDrop`)}
                          chooseFileLabel={t(`${applyNs}.chooseFile`)}
                          removeAria={t(`${applyNs}.removeUploadedFile`)}
                        />
                      </div>

                      <div className="flex flex-col gap-5">
                        <ApplyFieldLabel>
                          {t(`${applyNs}.labelPortfolioPlain`)}
                        </ApplyFieldLabel>
                        <ApplyUploadDropZone
                          inputId="apply-file-portfolio"
                          accept=".pdf,.doc,.docx,.ppt,.pptx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                          file={formData.portfolio}
                          onChange={(f) => handleFileUpload("portfolio", f)}
                          hint={t(`${applyNs}.uploadDrop`)}
                          chooseFileLabel={t(`${applyNs}.chooseFile`)}
                          removeAria={t(`${applyNs}.removeUploadedFile`)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-4">
                  <button
                    type="button"
                    onClick={handleStep3Next}
                    className={cn(
                      nanum,
                      "order-1 w-full rounded-[60px] bg-[#02633E] px-10 py-5 text-lg font-extrabold leading-[1.3] text-white transition-colors hover:brightness-110 md:order-2 md:w-auto",
                      !APPLY_SKIP_STEP3_RESUME_CHECK &&
                        !formData.resume &&
                        "cursor-not-allowed opacity-50 hover:brightness-100",
                    )}
                    disabled={
                      !APPLY_SKIP_STEP3_RESUME_CHECK && !formData.resume
                    }
                  >
                    {t(`${applyNs}.next`)}
                  </button>
                  <div className="order-2 flex w-full gap-1.5 md:order-1 md:w-auto md:flex-wrap md:gap-1">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className={cn(
                        nanum,
                        "inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-[40px] bg-[#EAE3C9] px-5 py-2.5 text-base font-extrabold leading-[1.3] text-[#1F2121] transition-colors hover:brightness-95 md:flex-initial",
                      )}
                    >
                      <ChevronLeft
                        className="size-[18px] shrink-0 text-[#4F4F4F]"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                      {t(`${applyNs}.prevStep`)}
                    </button>
                    <button
                      type="button"
                      onClick={handleDraftSave}
                      className={cn(
                        nanum,
                        "min-h-[44px] flex-1 rounded-[40px] bg-[#EAE3C9] px-5 py-2.5 text-base font-extrabold leading-[1.3] text-[#1F2121] transition-colors hover:brightness-95 md:flex-initial",
                      )}
                    >
                      {t(`${applyNs}.draftSave`)}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="flex w-full flex-col gap-10 md:gap-[60px]">
                <div className="w-full">
                  <div className="flex flex-col gap-2.5 py-5 md:gap-0 md:py-0 md:pb-[60px]">
                    <h2
                      className={cn(
                        nanum,
                        "text-xl font-extrabold leading-[30px] text-[#1F2121] md:text-[32px] md:leading-tight md:text-black",
                      )}
                    >
                      {t(`${applyNs}.step4Title`)}
                    </h2>
                    <p
                      className={cn(
                        nanum,
                        "text-base font-normal leading-6 text-[#1F2121] md:text-xl md:leading-6",
                      )}
                    >
                      {t(`${applyNs}.step4Desc`)}
                    </p>
                  </div>

                  <div
                    className={cn(
                      nanum,
                      "rounded-[20px] bg-white p-5 text-[#1F2121] md:p-[30px]",
                    )}
                  >
                    <div className="flex flex-col gap-5">
                      <h3
                        className={cn(
                          nanum,
                          "text-base font-bold text-black",
                        )}
                      >
                        {t(`${applyNs}.summaryTitle`)}
                      </h3>
                      <div className="flex flex-col gap-10">
                        <div className="flex flex-col gap-3">
                          <p
                            className={cn(
                              nanum,
                              "min-w-0 text-base font-normal leading-[22.4px] text-[#1F2121]",
                            )}
                          >
                            {reviewLine("reviewName", formData.name)}
                          </p>
                          <p
                            className={cn(
                              nanum,
                              "min-w-0 break-all text-base font-normal leading-[22.4px] text-[#1F2121]",
                            )}
                          >
                            {reviewLine("reviewEmail", formData.email)}
                          </p>
                          <p
                            className={cn(
                              nanum,
                              "min-w-0 text-base font-normal leading-[22.4px] text-[#1F2121]",
                            )}
                          >
                            {reviewLine("reviewBirth", birthSummary)}
                          </p>
                          <p
                            className={cn(
                              nanum,
                              "min-w-0 text-base font-normal leading-[22.4px] text-[#1F2121]",
                            )}
                          >
                            {reviewLine("reviewPhone", formData.phone)}
                          </p>
                          <p
                            className={cn(
                              nanum,
                              "min-w-0 text-base font-normal leading-[22.4px] text-[#1F2121]",
                            )}
                          >
                            {reviewLine("reviewAddress", formData.address)}
                          </p>
                        </div>

                        <div className="flex flex-col gap-3">
                          <p
                            className={cn(
                              nanum,
                              "min-w-0 text-base font-normal leading-[22.4px] text-[#1F2121]",
                            )}
                          >
                            {reviewLine("reviewEdu", eduSummary)}
                          </p>
                          <p
                            className={cn(
                              nanum,
                              "min-w-0 text-base font-normal leading-[22.4px] text-[#1F2121]",
                            )}
                          >
                            {reviewLine("reviewCareer", careerSummary)}
                          </p>
                          <p
                            className={cn(
                              nanum,
                              "min-w-0 text-base font-normal leading-[22.4px] text-[#1F2121]",
                            )}
                          >
                            {reviewLine("reviewMajor", formData.major)}
                          </p>
                          <p
                            className={cn(
                              nanum,
                              "min-w-0 text-base font-normal leading-[22.4px] text-[#1F2121]",
                            )}
                          >
                            {reviewLine("reviewGrad", gradSummary)}
                          </p>
                          <p
                            className={cn(
                              nanum,
                              "min-w-0 text-base font-normal leading-[22.4px] text-[#1F2121]",
                            )}
                          >
                            {reviewLine("reviewMilitary", militarySummary)}
                          </p>
                          <p
                            className={cn(
                              nanum,
                              "min-w-0 text-base font-normal leading-[22.4px] text-[#1F2121]",
                            )}
                          >
                            {reviewLine("reviewRole", roleSummary)}
                          </p>
                          <p
                            className={cn(
                              nanum,
                              "min-w-0 whitespace-pre-wrap text-base font-normal leading-[22.4px] text-[#1F2121]",
                            )}
                          >
                            {reviewLine(
                              "reviewMotivation",
                              formData.motivation,
                            )}
                          </p>
                        </div>

                        <div className="flex flex-col gap-3">
                          {formData.resume ? (
                            <p
                              className={cn(
                                nanum,
                                "min-w-0 break-all text-base font-normal leading-[22.4px] text-[#1F2121]",
                              )}
                            >
                              {t(`${applyNs}.reviewUploadedFile`, {
                                name: formData.resume.name,
                              })}
                            </p>
                          ) : null}
                          {formData.coverLetter ? (
                            <p
                              className={cn(
                                nanum,
                                "min-w-0 break-all text-base font-normal leading-[22.4px] text-[#1F2121]",
                              )}
                            >
                              {t(`${applyNs}.reviewUploadedFile`, {
                                name: formData.coverLetter.name,
                              })}
                            </p>
                          ) : null}
                          {formData.portfolio ? (
                            <p
                              className={cn(
                                nanum,
                                "min-w-0 break-all text-base font-normal leading-[22.4px] text-[#1F2121]",
                              )}
                            >
                              {t(`${applyNs}.reviewUploadedFile`, {
                                name: formData.portfolio.name,
                              })}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 pt-5">
                    <div className="flex flex-col gap-5 md:gap-5">
                      <ApplyConsentCheck
                        id="apply-privacy"
                        checked={formData.privacyAgreement}
                        onChange={(v) =>
                          handleInputChange("privacyAgreement", v)
                        }
                        title={t(`${applyNs}.privacyRequired`)}
                        hint={t(`${applyNs}.privacyHint`)}
                      />
                      <ApplyConsentCheck
                        id="apply-marketing"
                        checked={formData.marketingAgreement}
                        onChange={(v) =>
                          handleInputChange("marketingAgreement", v)
                        }
                        title={t(`${applyNs}.marketingOptional`)}
                        hint={t(`${applyNs}.marketingHint`)}
                      />
                    </div>
                  </div>
                </div>

                {actionData?.error ? (
                  <p className="text-sm text-red-600">{actionData.error}</p>
                ) : null}

                <div className="flex w-full flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-4">
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={
                      isSubmitting ||
                      !formData.privacyAgreement ||
                      !formData.name ||
                      !formData.email ||
                      !formData.phone ||
                      !formData.password.trim()
                    }
                    className={cn(
                      nanum,
                      "order-1 w-full rounded-[60px] bg-[#02633E] px-10 py-5 text-lg font-extrabold leading-[1.3] text-white transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100 md:order-2 md:w-auto",
                    )}
                  >
                    {isSubmitting
                      ? t(`${applyNs}.submitting`)
                      : t(`${applyNs}.submit`)}
                  </button>
                  <div className="order-2 flex w-full gap-1.5 md:order-1 md:w-auto md:flex-wrap md:gap-1">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className={cn(
                        nanum,
                        "inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-[40px] bg-[#EAE3C9] px-5 py-2.5 text-base font-extrabold leading-[1.3] text-[#1F2121] transition-colors hover:brightness-95 md:flex-initial",
                      )}
                    >
                      <ChevronLeft
                        className="size-[18px] shrink-0 text-[#4F4F4F]"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                      {t(`${applyNs}.prevStep`)}
                    </button>
                    <button
                      type="button"
                      onClick={handleDraftSave}
                      className={cn(
                        nanum,
                        "min-h-[44px] flex-1 rounded-[40px] bg-[#EAE3C9] px-5 py-2.5 text-base font-extrabold leading-[1.3] text-[#1F2121] transition-colors hover:brightness-95 md:flex-initial",
                      )}
                    >
                      {t(`${applyNs}.draftSave`)}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
