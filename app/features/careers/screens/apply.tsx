import { useState } from "react";
import { Link, useParams } from "react-router";
import { Button } from "~/core/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/core/components/ui/card";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import { Textarea } from "~/core/components/ui/textarea";
import { Checkbox } from "~/core/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "~/core/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/core/components/ui/select";
import { ArrowLeft, Upload, FileText, CheckCircle } from "lucide-react";

interface FormData {
  // Personal Info
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  address: string;

  // Education
  education: string;
  university: string;
  major: string;
  graduationDate: string;

  // Experience
  experience: string;
  currentCompany: string;
  currentPosition: string;

  // Additional
  militaryService: string;
  motivation: string;

  // Files
  resume: File | null;
  coverLetter: File | null;
  portfolio: File | null;

  // Agreement
  privacyAgreement: boolean;
  marketingAgreement: boolean;
}

export default function CareerApplyScreen() {
  const { id } = useParams();
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
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

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field: "resume" | "coverLetter" | "portfolio", file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log("Submitting application:", formData);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="mb-4 text-3xl font-bold text-foreground">지원서가 성공적으로 제출되었습니다!</h1>
            <p className="mb-8 text-muted-foreground">
              지원해주셔서 감사합니다. 서류 검토 후 1주일 내에 개별 연락드리겠습니다.
            </p>
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <h3 className="mb-2 font-semibold">접수 정보</h3>
                <p className="text-sm text-muted-foreground">접수번호: APP-{Date.now()}</p>
                <p className="text-sm text-muted-foreground">접수일시: {new Date().toLocaleString("ko-KR")}</p>
              </div>
              <div className="flex justify-center gap-4">
                <Link to="/careers/positions">
                  <Button>다른 채용공고 보기</Button>
                </Link>
                <Link to="/">
                  <Button variant="outline">홈으로 돌아가기</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          to={`/careers/${id}`}
          className="mb-6 inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          채용공고로 돌아가기
        </Link>

        {/* Progress Steps */}
        <div className="mx-auto mb-8 max-w-4xl">
          <div className="mb-8 flex items-center justify-center gap-4">
            {[
              { step: 1, title: "기본정보" },
              { step: 2, title: "학력/경력" },
              { step: 3, title: "서류업로드" },
              { step: 4, title: "최종확인" },
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

          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>기본 정보</CardTitle>
                  <CardDescription>지원자의 기본 정보를 입력해주세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="name">이름 *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="홍길동"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">이메일 *</Label>
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
                      <Label htmlFor="phone">연락처 *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="010-1234-5678"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="birthDate">생년월일</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => handleInputChange("birthDate", e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">주소</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="서울특별시 강남구..."
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="button" onClick={() => setStep(2)}>
                      다음 단계
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Education & Experience */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>학력 및 경력</CardTitle>
                  <CardDescription>학력과 경력 사항을 입력해주세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Education */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">학력</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="education">최종학력 *</Label>
                        <Select value={formData.education} onValueChange={(value) => handleInputChange("education", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="선택해주세요" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high-school">고등학교 졸업</SelectItem>
                            <SelectItem value="college">전문대 졸업</SelectItem>
                            <SelectItem value="university">대학교 졸업</SelectItem>
                            <SelectItem value="master">석사 졸업</SelectItem>
                            <SelectItem value="phd">박사 졸업</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="university">학교명</Label>
                        <Input
                          id="university"
                          value={formData.university}
                          onChange={(e) => handleInputChange("university", e.target.value)}
                          placeholder="○○대학교"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="major">전공</Label>
                        <Input
                          id="major"
                          value={formData.major}
                          onChange={(e) => handleInputChange("major", e.target.value)}
                          placeholder="경영학과"
                        />
                      </div>
                      <div>
                        <Label htmlFor="graduationDate">졸업일</Label>
                        <Input
                          id="graduationDate"
                          type="month"
                          value={formData.graduationDate}
                          onChange={(e) => handleInputChange("graduationDate", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">경력</h3>
                    <div>
                      <Label>경력 구분 *</Label>
                      <RadioGroup
                        value={formData.experience}
                        onValueChange={(value) => handleInputChange("experience", value)}
                        className="mt-2 flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="fresh" id="fresh" />
                          <Label htmlFor="fresh">신입</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="experienced" id="experienced" />
                          <Label htmlFor="experienced">경력</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {formData.experience === "experienced" && (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label htmlFor="currentCompany">현재/최근 직장</Label>
                          <Input
                            id="currentCompany"
                            value={formData.currentCompany}
                            onChange={(e) => handleInputChange("currentCompany", e.target.value)}
                            placeholder="○○회사"
                          />
                        </div>
                        <div>
                          <Label htmlFor="currentPosition">직책/직급</Label>
                          <Input
                            id="currentPosition"
                            value={formData.currentPosition}
                            onChange={(e) => handleInputChange("currentPosition", e.target.value)}
                            placeholder="대리"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Military Service */}
                  <div>
                    <Label>병역사항</Label>
                    <RadioGroup
                      value={formData.militaryService}
                      onValueChange={(value) => handleInputChange("militaryService", value)}
                      className="mt-2 flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="completed" id="completed" />
                        <Label htmlFor="completed">군필</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="exempted" id="exempted" />
                        <Label htmlFor="exempted">면제</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="not-applicable" id="not-applicable" />
                        <Label htmlFor="not-applicable">해당없음</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="motivation">지원동기 및 포부 *</Label>
                    <Textarea
                      id="motivation"
                      value={formData.motivation}
                      onChange={(e) => handleInputChange("motivation", e.target.value)}
                      placeholder="지원동기와 입사 후 포부를 작성해주세요 (500자 이내)"
                      rows={5}
                      maxLength={500}
                      required
                    />
                    <div className="mt-1 text-right text-sm text-muted-foreground">{formData.motivation.length}/500</div>
                  </div>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep(1)}>
                      이전 단계
                    </Button>
                    <Button type="button" onClick={() => setStep(3)}>
                      다음 단계
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: File Upload */}
            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>서류 업로드</CardTitle>
                  <CardDescription>필요한 서류를 업로드해주세요 (PDF, DOC, DOCX 파일만 가능)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="resume">이력서 *</Label>
                      <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center">
                        <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">파일을 드래그하거나 클릭하여 업로드</p>
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
                          파일 선택
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
                      <Label htmlFor="coverLetter">자기소개서</Label>
                      <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center">
                        <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">파일을 드래그하거나 클릭하여 업로드</p>
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
                          파일 선택
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
                      <Label htmlFor="portfolioFile">포트폴리오 (선택)</Label>
                      <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center">
                        <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">파일을 드래그하거나 클릭하여 업로드</p>
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
                          파일 선택
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
                      이전 단계
                    </Button>
                    <Button type="button" onClick={() => setStep(4)}>
                      다음 단계
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Final Confirmation */}
            {step === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>최종 확인 및 제출</CardTitle>
                  <CardDescription>입력하신 정보를 확인하고 지원서를 제출해주세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Summary */}
                  <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                    <h3 className="font-semibold">지원 정보 요약</h3>
                    <div className="grid gap-4 text-sm md:grid-cols-2">
                      <div>
                        <span className="font-medium">이름:</span> {formData.name}
                      </div>
                      <div>
                        <span className="font-medium">이메일:</span> {formData.email}
                      </div>
                      <div>
                        <span className="font-medium">연락처:</span> {formData.phone}
                      </div>
                      <div>
                        <span className="font-medium">경력:</span> {formData.experience === "fresh" ? "신입" : "경력"}
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">업로드된 파일:</span>
                      <ul className="mt-1 space-y-1">
                        {formData.resume && <li>• 이력서: {formData.resume.name}</li>}
                        {formData.coverLetter && <li>• 자기소개서: {formData.coverLetter.name}</li>}
                        {formData.portfolio && <li>• 포트폴리오: {formData.portfolio.name}</li>}
                      </ul>
                    </div>
                  </div>

                  {/* Agreements */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="privacy"
                        checked={formData.privacyAgreement}
                        onCheckedChange={(checked) => handleInputChange("privacyAgreement", checked)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="privacy" className="text-sm font-medium leading-none">
                          개인정보 수집 및 이용 동의 (필수)
                        </Label>
                        <p className="text-xs text-muted-foreground">채용 전형을 위한 개인정보 수집 및 이용에 동의합니다.</p>
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
                          채용 정보 수신 동의 (선택)
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          향후 채용 정보 및 회사 소식을 이메일로 받아보시겠습니까?
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep(3)}>
                      이전 단계
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        !formData.privacyAgreement ||
                        !formData.name ||
                        !formData.email ||
                        !formData.phone ||
                        !formData.motivation
                      }
                    >
                      지원서 제출
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

