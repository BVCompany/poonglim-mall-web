import { format } from "date-fns";
import { useState } from "react";
import { Link, useParams, useActionData, useNavigation } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/apply";
import { createJobApplication } from "../lib/queries.server";
import { Button } from "~/core/components/ui/button";
import { SECTION_VIEWPORT_BLEED } from "~/core/lib/section-viewport-bleed";
import { cn } from "~/core/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/core/components/ui/card";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import { Textarea } from "~/core/components/ui/textarea";
import { Checkbox } from "~/core/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "~/core/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/core/components/ui/select";
import { ArrowLeft, Upload, FileText, CheckCircle } from "lucide-react";
import { Breadcrumb } from "~/core/components/breadcrumb";
import { DatePicker } from "~/core/components/ui/date-picker";
import i18next from "~/core/lib/i18next.server";

export const meta: Route.MetaFunction = ({ data }) => [{ title: data?.metaTitle ?? "" }];

export async function loader({ request }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);
  return { metaTitle: t("pages.careers.apply.metaTitle") };
}

export async function action({ request, params }: Route.ActionArgs) {
  const t = await i18next.getFixedT(request);
  const fd = await request.formData();
  const jobId = Number(params.id);
  if (!jobId) return { success: false, error: t("pages.careers.apply.errors.invalidJob") };
  try {
    const app = await createJobApplication({
      job_id: jobId,
      applicant_name: fd.get("name") as string,
      email: fd.get("email") as string,
      phone: fd.get("phone") as string,
      birth_date: (fd.get("birthDate") as string) || null,
      address: (fd.get("address") as string) || null,
      cover_letter: (fd.get("motivation") as string) || null,
      resume_url: null,
      portfolio_url: (fd.get("portfolioUrl") as string) || null,
    });
    return { success: true, applicationId: app.application_id };
  } catch {
    return { success: false, error: t("pages.careers.apply.errors.submitFailed") };
  }
}

interface FormData {
  name: string;
  email: string;
  phone: string;
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
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [step, setStep] = useState(1);
  const isSubmitted = actionData?.success === true;
  const locale = i18n.language?.startsWith("en") ? "en-US" : "ko-KR";

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
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

  const handleInputChange = (field: keyof FormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field: "resume" | "coverLetter" | "portfolio", file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (step < 4) {
      e.preventDefault();
      setStep((s) => s + 1);
    }
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

  return (
    <div className={cn(SECTION_VIEWPORT_BLEED, "min-h-screen min-w-0 bg-[var(--site-chrome-header-bg,#FDFDF5)]")}>
      <Breadcrumb
        items={[
          { label: t("pages.careers.breadcrumb"), href: "/careers/positions" },
          { label: t("pages.careers.apply.breadcrumb") },
        ]}
      />
      <div className="container mx-auto px-4 py-8">
        <Link
          to={`/careers/${id}`}
          className="mb-6 inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("pages.careers.apply.backToPosting")}
        </Link>

        <div className="mx-auto mb-8 max-w-4xl">
          <div className="mb-8 flex items-center justify-center gap-4">
            {[
              { step: 1, title: t("pages.careers.apply.step1") },
              { step: 2, title: t("pages.careers.apply.step2") },
              { step: 3, title: t("pages.careers.apply.step3") },
              { step: 4, title: t("pages.careers.apply.step4") },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                    step >= item.step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.step}
                </div>
                <span className={`text-sm ${step >= item.step ? "text-foreground" : "text-muted-foreground"}`}>
                  {item.title}
                </span>
                {item.step < 4 && <div className="mx-2 h-0.5 w-8 bg-muted"></div>}
              </div>
            ))}
          </div>

          <form method="post" onSubmit={handleSubmit}>
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("pages.careers.apply.step1Title")}</CardTitle>
                  <CardDescription>{t("pages.careers.apply.step1Desc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="name">{t("pages.careers.apply.labelName")}</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder={t("pages.careers.apply.phName")}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">{t("pages.careers.apply.labelEmail")}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="hong@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="phone">{t("pages.careers.apply.labelPhone")}</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="010-1234-5678"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="birthDate">{t("pages.careers.apply.labelBirth")}</Label>
                      <DatePicker
                        value={
                          formData.birthDate
                            ? new Date(`${formData.birthDate}T12:00:00`)
                            : undefined
                        }
                        onChange={(d) =>
                          handleInputChange("birthDate", d ? format(d, "yyyy-MM-dd") : "")
                        }
                        placeholder={t("pages.careers.apply.labelBirth")}
                        className="rounded-md border border-input bg-background"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">{t("pages.careers.apply.labelAddress")}</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder={t("pages.careers.apply.phAddress")}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="button" onClick={() => setStep(2)}>
                      {t("pages.careers.apply.next")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("pages.careers.apply.step2Title")}</CardTitle>
                  <CardDescription>{t("pages.careers.apply.step2Desc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">{t("pages.careers.apply.eduHeading")}</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="education">{t("pages.careers.apply.labelEduLevel")}</Label>
                        <Select
                          value={formData.education}
                          onValueChange={(value) => handleInputChange("education", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t("pages.careers.apply.phSelect")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high-school">{t("pages.careers.apply.eduHigh")}</SelectItem>
                            <SelectItem value="college">{t("pages.careers.apply.eduCollege")}</SelectItem>
                            <SelectItem value="university">{t("pages.careers.apply.eduUniv")}</SelectItem>
                            <SelectItem value="master">{t("pages.careers.apply.eduMaster")}</SelectItem>
                            <SelectItem value="phd">{t("pages.careers.apply.eduPhd")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="university">{t("pages.careers.apply.labelSchool")}</Label>
                        <Input
                          id="university"
                          value={formData.university}
                          onChange={(e) => handleInputChange("university", e.target.value)}
                          placeholder="○○ University"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="major">{t("pages.careers.apply.labelMajor")}</Label>
                        <Input
                          id="major"
                          value={formData.major}
                          onChange={(e) => handleInputChange("major", e.target.value)}
                          placeholder="Business administration"
                        />
                      </div>
                      <div>
                        <Label htmlFor="graduationDate">{t("pages.careers.apply.labelGradMonth")}</Label>
                        <Input
                          id="graduationDate"
                          type="month"
                          value={formData.graduationDate}
                          onChange={(e) => handleInputChange("graduationDate", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">{t("pages.careers.apply.careerHeading")}</h3>
                    <div>
                      <Label>{t("pages.careers.apply.careerType")}</Label>
                      <RadioGroup
                        value={formData.experience}
                        onValueChange={(value) => handleInputChange("experience", value)}
                        className="mt-2 flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="fresh" id="fresh" />
                          <Label htmlFor="fresh">{t("pages.careers.apply.careerFresh")}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="experienced" id="experienced" />
                          <Label htmlFor="experienced">{t("pages.careers.apply.careerExp")}</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {formData.experience === "experienced" && (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label htmlFor="currentCompany">{t("pages.careers.apply.labelCurrentCompany")}</Label>
                          <Input
                            id="currentCompany"
                            value={formData.currentCompany}
                            onChange={(e) => handleInputChange("currentCompany", e.target.value)}
                            placeholder="○○ Inc."
                          />
                        </div>
                        <div>
                          <Label htmlFor="currentPosition">{t("pages.careers.apply.labelCurrentRole")}</Label>
                          <Input
                            id="currentPosition"
                            value={formData.currentPosition}
                            onChange={(e) => handleInputChange("currentPosition", e.target.value)}
                            placeholder="Assistant manager"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>{t("pages.careers.apply.military")}</Label>
                    <RadioGroup
                      value={formData.militaryService}
                      onValueChange={(value) => handleInputChange("militaryService", value)}
                      className="mt-2 flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="completed" id="completed" />
                        <Label htmlFor="completed">{t("pages.careers.apply.milDone")}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="exempted" id="exempted" />
                        <Label htmlFor="exempted">{t("pages.careers.apply.milExempt")}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="not-applicable" id="not-applicable" />
                        <Label htmlFor="not-applicable">{t("pages.careers.apply.milNa")}</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="motivation">{t("pages.careers.apply.labelMotivation")}</Label>
                    <Textarea
                      id="motivation"
                      value={formData.motivation}
                      onChange={(e) => handleInputChange("motivation", e.target.value)}
                      placeholder={t("pages.careers.apply.phMotivation")}
                      rows={5}
                      maxLength={500}
                      required
                    />
                    <div className="mt-1 text-right text-sm text-muted-foreground">
                      {formData.motivation.length}/500
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep(1)}>
                      {t("pages.careers.apply.prev")}
                    </Button>
                    <Button type="button" onClick={() => setStep(3)}>
                      {t("pages.careers.apply.next")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("pages.careers.apply.step3Title")}</CardTitle>
                  <CardDescription>{t("pages.careers.apply.step3Desc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="resume">{t("pages.careers.apply.labelResume")}</Label>
                      <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center">
                        <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">{t("pages.careers.apply.uploadDrop")}</p>
                        <input
                          type="file"
                          id="resume"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload("resume", e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById("resume")?.click()}
                        >
                          {t("pages.careers.apply.chooseFile")}
                        </Button>
                        {formData.resume && (
                          <p className="mt-2 text-sm text-primary">
                            <FileText className="mr-1 inline h-4 w-4" />
                            {formData.resume.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="coverLetter">{t("pages.careers.apply.labelCl")}</Label>
                      <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center">
                        <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">{t("pages.careers.apply.uploadDrop")}</p>
                        <input
                          type="file"
                          id="coverLetter"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload("coverLetter", e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById("coverLetter")?.click()}
                        >
                          {t("pages.careers.apply.chooseFile")}
                        </Button>
                        {formData.coverLetter && (
                          <p className="mt-2 text-sm text-primary">
                            <FileText className="mr-1 inline h-4 w-4" />
                            {formData.coverLetter.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="portfolioFile">{t("pages.careers.apply.labelPortfolio")}</Label>
                      <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center">
                        <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">{t("pages.careers.apply.uploadDrop")}</p>
                        <input
                          type="file"
                          id="portfolioFile"
                          accept=".pdf,.doc,.docx,.ppt,.pptx"
                          onChange={(e) => handleFileUpload("portfolio", e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById("portfolioFile")?.click()}
                        >
                          {t("pages.careers.apply.chooseFile")}
                        </Button>
                        {formData.portfolio && (
                          <p className="mt-2 text-sm text-primary">
                            <FileText className="mr-1 inline h-4 w-4" />
                            {formData.portfolio.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep(2)}>
                      {t("pages.careers.apply.prev")}
                    </Button>
                    <Button type="button" onClick={() => setStep(4)}>
                      {t("pages.careers.apply.next")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("pages.careers.apply.step4Title")}</CardTitle>
                  <CardDescription>{t("pages.careers.apply.step4Desc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                    <h3 className="font-semibold">{t("pages.careers.apply.summaryTitle")}</h3>
                    <div className="grid gap-4 text-sm md:grid-cols-2">
                      <div>
                        <span className="font-medium">{t("pages.careers.apply.summaryName")}</span> {formData.name}
                      </div>
                      <div>
                        <span className="font-medium">{t("pages.careers.apply.summaryEmail")}</span> {formData.email}
                      </div>
                      <div>
                        <span className="font-medium">{t("pages.careers.apply.summaryPhone")}</span> {formData.phone}
                      </div>
                      <div>
                        <span className="font-medium">{t("pages.careers.apply.summaryCareer")}</span>{" "}
                        {formData.experience === "fresh"
                          ? t("pages.careers.apply.summaryFresh")
                          : t("pages.careers.apply.summaryExp")}
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">{t("pages.careers.apply.summaryFiles")}</span>
                      <ul className="mt-1 space-y-1">
                        {formData.resume && (
                          <li>
                            • {t("pages.careers.apply.fileResume")} {formData.resume.name}
                          </li>
                        )}
                        {formData.coverLetter && (
                          <li>
                            • {t("pages.careers.apply.fileCl")} {formData.coverLetter.name}
                          </li>
                        )}
                        {formData.portfolio && (
                          <li>
                            • {t("pages.careers.apply.filePortfolio")} {formData.portfolio.name}
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="privacy"
                        checked={formData.privacyAgreement}
                        onCheckedChange={(checked) => handleInputChange("privacyAgreement", checked)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="privacy" className="text-sm font-medium leading-none">
                          {t("pages.careers.apply.privacyRequired")}
                        </Label>
                        <p className="text-xs text-muted-foreground">{t("pages.careers.apply.privacyHint")}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="marketing"
                        checked={formData.marketingAgreement}
                        onCheckedChange={(checked) => handleInputChange("marketingAgreement", checked)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="marketing" className="text-sm font-medium leading-none">
                          {t("pages.careers.apply.marketingOptional")}
                        </Label>
                        <p className="text-xs text-muted-foreground">{t("pages.careers.apply.marketingHint")}</p>
                      </div>
                    </div>
                  </div>

                  {actionData?.error && <p className="text-sm text-red-500">{actionData.error}</p>}

                  <input type="hidden" name="name" value={formData.name} />
                  <input type="hidden" name="email" value={formData.email} />
                  <input type="hidden" name="phone" value={formData.phone} />
                  <input type="hidden" name="birthDate" value={formData.birthDate} />
                  <input type="hidden" name="address" value={formData.address} />
                  <input type="hidden" name="motivation" value={formData.motivation} />

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep(3)}>
                      {t("pages.careers.apply.prev")}
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        !formData.privacyAgreement ||
                        !formData.name ||
                        !formData.email ||
                        !formData.phone
                      }
                    >
                      {isSubmitting ? t("pages.careers.apply.submitting") : t("pages.careers.apply.submit")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
