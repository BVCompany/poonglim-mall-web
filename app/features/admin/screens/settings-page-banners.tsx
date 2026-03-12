/**
 * Admin Page Banner Management
 * 각 페이지 상단 배너를 관리하는 화면
 */
import { useState } from "react";
import { useFetcher } from "react-router";
import type { Route } from "./+types/settings-page-banners";
import { requireAdminAuth } from "../utils/auth.server";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import { ImageUpload } from "~/core/components/image-upload";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/core/components/ui/card";
import { CheckCircle2, ImageOff } from "lucide-react";
import { getAllPageBanners } from "~/features/page-banners/lib/queries.server";
import { pageBanners, PAGE_KEY_LABELS } from "~/features/page-banners/schema";
import db from "~/core/db/drizzle-client.server";
import { eq } from "drizzle-orm";

export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminAuth(request);
  const dbBanners = await getAllPageBanners().catch(() => []);
  return { adminUser, dbBanners };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdminAuth(request);
  const fd = await request.formData();
  const intent = fd.get("intent") as string;

  if (intent === "upsert") {
    const pageKey   = fd.get("page_key") as string;
    const existing  = await db.select().from(pageBanners)
      .where(eq(pageBanners.page_key, pageKey)).limit(1);

    const values = {
      page_key:  pageKey,
      title:     (fd.get("title") as string) ?? "",
      subtitle:  (fd.get("subtitle") as string) || null,
      image_url: (fd.get("image_url") as string) || null,
      link_url:  (fd.get("link_url") as string) || null,
      link_text: (fd.get("link_text") as string) || null,
      is_active: fd.get("is_active") !== "false",
    };

    if (existing.length > 0) {
      await db.update(pageBanners).set(values)
        .where(eq(pageBanners.page_key, pageKey));
    } else {
      await db.insert(pageBanners).values(values);
    }
    return { success: true, page_key: pageKey };
  }

  if (intent === "delete") {
    const pageKey = fd.get("page_key") as string;
    await db.delete(pageBanners).where(eq(pageBanners.page_key, pageKey));
    return { success: true };
  }

  return { success: false };
}

type DbBanner = {
  page_banner_id: number;
  page_key: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
  link_text: string | null;
  is_active: boolean;
};

const PAGE_KEYS = Object.keys(PAGE_KEY_LABELS);

function BannerForm({ pageKey, banner, savedKey }: {
  pageKey: string;
  banner?: DbBanner;
  savedKey: string | null;
}) {
  const fetcher = useFetcher();
  const isSaving = fetcher.state === "submitting";
  const isSaved = !isSaving && fetcher.data?.success && fetcher.data?.page_key === pageKey;

  const [imageUrl, setImageUrl] = useState(banner?.image_url ?? "");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{PAGE_KEY_LABELS[pageKey]}</CardTitle>
            <CardDescription className="text-xs mt-0.5">/{pageKey} 페이지 상단 배너</CardDescription>
          </div>
          {banner && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              banner.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            }`}>
              {banner.is_active ? "활성" : "비활성"}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <fetcher.Form method="POST" className="space-y-4">
          <input type="hidden" name="intent" value="upsert" />
          <input type="hidden" name="page_key" value={pageKey} />
          <input type="hidden" name="image_url" value={imageUrl} />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">제목 *</Label>
              <Input
                name="title"
                defaultValue={banner?.title ?? ""}
                placeholder="예: 계란이야기"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">부제목</Label>
              <Input
                name="subtitle"
                defaultValue={banner?.subtitle ?? ""}
                placeholder="예: 대한민국의 대표 계란 풍림푸드의 이야기"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">링크 URL</Label>
              <Input
                name="link_url"
                defaultValue={banner?.link_url ?? ""}
                placeholder="예: /brand/intro"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">버튼 텍스트</Label>
              <Input
                name="link_text"
                defaultValue={banner?.link_text ?? ""}
                placeholder="예: 더 알아보기"
              />
            </div>
          </div>

          {/* 배경 이미지 */}
          <div className="space-y-2">
            <Label className="text-xs">배경 이미지</Label>
            <div className="flex gap-4 items-start">
              {/* 썸네일 */}
              <div className="w-32 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center border">
                {imageUrl ? (
                  <img src={imageUrl} alt="배너 미리보기" className="w-full h-full object-cover" />
                ) : (
                  <ImageOff className="w-6 h-6 text-gray-300" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <ImageUpload
                  bucket="banners"
                  folder={`page/${pageKey}`}
                  value={imageUrl}
                  onChange={setImageUrl}
                  hint="JPG/PNG · 1920×400px 권장"
                />
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="또는 URL 직접 입력"
                  className="text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                size="sm"
                disabled={isSaving}
                className="bg-[#204E3A] hover:bg-[#1a3f2e]"
              >
                {isSaving ? "저장 중..." : "저장"}
              </Button>
              {banner && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => {
                    if (!confirm("배너를 삭제하시겠습니까?")) return;
                    const f = new FormData();
                    f.append("intent", "delete");
                    f.append("page_key", pageKey);
                    fetcher.submit(f, { method: "POST" });
                  }}
                >
                  삭제
                </Button>
              )}
            </div>
            {isSaved && (
              <div className="flex items-center gap-1.5 text-sm text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                저장되었습니다.
              </div>
            )}
          </div>
        </fetcher.Form>
      </CardContent>
    </Card>
  );
}

export default function AdminPageBannersPage({ loaderData }: Route.ComponentProps) {
  const { adminUser, dbBanners } = loaderData;

  const bannerMap = Object.fromEntries(
    dbBanners.map((b) => [b.page_key, b as DbBanner])
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar adminUser={adminUser} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminNavbar />
        <div className="flex-1 overflow-auto p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">페이지 배너 관리</h1>
            <p className="mt-1 text-sm text-gray-500">
              각 페이지 상단에 표시되는 배너를 관리합니다. 저장하지 않은 페이지는 배너가 표시되지 않습니다.
            </p>
          </div>

          <div className="space-y-4 max-w-3xl">
            {PAGE_KEYS.map((key) => (
              <BannerForm
                key={key}
                pageKey={key}
                banner={bannerMap[key]}
                savedKey={null}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
