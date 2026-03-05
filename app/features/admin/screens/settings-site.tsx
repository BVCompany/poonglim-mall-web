/**
 * Admin Site Settings Screen
 * 회사소개 배너 등 사이트 전반 설정 관리
 */

import { useState } from "react";
import { useFetcher } from "react-router";
import type { Route } from "./+types/settings-site";
import { requireAdminAuth } from "../utils/auth.server";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import { Textarea } from "~/core/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/core/components/ui/card";
import { ImageUpload } from "~/core/components/image-upload";
import { CheckCircle2, Building2 } from "lucide-react";
import { getAllSettings, upsertSetting } from "~/features/site-settings/lib/queries.server";
import { SETTING_KEYS } from "~/features/site-settings/schema";

export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminAuth(request);
  const settings = await getAllSettings().catch(() => ({} as Record<string, string>));
  return { adminUser, settings };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdminAuth(request);
  const fd = await request.formData();
  const intent = fd.get("intent") as string;

  if (intent === "save_company_intro") {
    await Promise.all([
      upsertSetting(SETTING_KEYS.COMPANY_INTRO_IMAGE, fd.get("image") as string ?? ""),
      upsertSetting(SETTING_KEYS.COMPANY_INTRO_TITLE, fd.get("title") as string ?? ""),
      upsertSetting(SETTING_KEYS.COMPANY_INTRO_LINK,  fd.get("link")  as string ?? ""),
    ]);
    return { success: true };
  }

  return { success: false };
}

export default function AdminSiteSettingsPage({ loaderData }: Route.ComponentProps) {
  const { adminUser, settings } = loaderData;
  const fetcher = useFetcher();

  const [companyIntro, setCompanyIntro] = useState({
    image: settings[SETTING_KEYS.COMPANY_INTRO_IMAGE] ?? "",
    title: settings[SETTING_KEYS.COMPANY_INTRO_TITLE] ?? "",
    link:  settings[SETTING_KEYS.COMPANY_INTRO_LINK]  ?? "",
  });

  const isSaving = fetcher.state === "submitting";
  const saved = fetcher.data?.success === true;

  const handleSaveCompanyIntro = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("intent", "save_company_intro");
    fd.append("image", companyIntro.image);
    fd.append("title", companyIntro.title);
    fd.append("link",  companyIntro.link);
    fetcher.submit(fd, { method: "POST" });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar adminUser={adminUser} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminNavbar />

        <div className="flex-1 overflow-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">홈 섹션 관리</h1>
            <p className="mt-1 text-sm text-gray-500">
              홈 화면 각 섹션의 이미지·텍스트를 관리합니다.
            </p>
          </div>

          <div className="max-w-2xl space-y-8">

            {/* 회사소개 배너 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#204E3A]" />
                  <CardTitle>회사소개 배너</CardTitle>
                </div>
                <CardDescription>
                  홈 화면 중간에 표시되는 회사 소개 섹션의 이미지와 텍스트를 관리합니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveCompanyIntro} className="space-y-5">
                  {/* 배너 이미지 미리보기 */}
                  {companyIntro.image && (
                    <div className="relative w-full aspect-[16/6] overflow-hidden rounded-xl">
                      <img
                        src={companyIntro.image}
                        alt="회사소개 배너 미리보기"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-end p-4">
                        <p className="text-white text-sm font-medium line-clamp-2">
                          {companyIntro.title || "제목 없음"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 이미지 업로드 */}
                  <div className="space-y-1.5">
                    <Label>배너 이미지</Label>
                    <ImageUpload
                      bucket="media"
                      folder="company-intro"
                      value={companyIntro.image}
                      onChange={(url) => setCompanyIntro({ ...companyIntro, image: url })}
                      aspectRatio="16/6"
                      hint="JPG, PNG, WebP 최대 10MB (권장 비율 16:6)"
                    />
                    <Input
                      value={companyIntro.image}
                      onChange={(e) => setCompanyIntro({ ...companyIntro, image: e.target.value })}
                      placeholder="또는 이미지 URL 직접 입력"
                      className="text-xs"
                    />
                  </div>

                  {/* 소개 문구 */}
                  <div className="space-y-1.5">
                    <Label>소개 문구</Label>
                    <Textarea
                      value={companyIntro.title}
                      onChange={(e) => setCompanyIntro({ ...companyIntro, title: e.target.value })}
                      placeholder="30년간 축적된 노하우와 혁신적인 기술로 고객의 건강하고 풍요로운 일상을 만들어가고 있습니다."
                      rows={3}
                    />
                    <p className="text-xs text-gray-400">
                      배너 위에 표시될 메인 문구입니다. 비워두면 기본 문구가 표시됩니다.
                    </p>
                  </div>

                  {/* 링크 URL */}
                  <div className="space-y-1.5">
                    <Label>
                      "Learn More" 링크
                      <span className="ml-1.5 text-xs font-normal text-gray-400">(선택)</span>
                    </Label>
                    <Input
                      value={companyIntro.link}
                      onChange={(e) => setCompanyIntro({ ...companyIntro, link: e.target.value })}
                      placeholder="/brand/intro"
                    />
                  </div>

                  {/* 저장 버튼 */}
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="bg-[#204E3A] hover:bg-[#1a3f2e]"
                    >
                      {isSaving ? "저장 중..." : "저장"}
                    </Button>
                    {saved && !isSaving && (
                      <div className="flex items-center gap-1.5 text-sm text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" />
                        저장되었습니다.
                      </div>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* 향후 추가 설정 섹션들이 여기에 */}

          </div>
        </div>
      </div>
    </div>
  );
}
