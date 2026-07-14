/**
 * Admin SEO Settings Screen
 * 검색엔진 최적화(SEO) 및 Analytics 설정 관리
 */

import { useState } from "react";
import { useFetcher } from "react-router";
import type { Route } from "./+types/settings-seo";
import { requireAdminAuth } from "../utils/auth.server";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import { Textarea } from "~/core/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/core/components/ui/card";
import { ImageUpload } from "~/core/components/image-upload";
import { Badge } from "~/core/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "~/core/components/ui/select";
import {
  BarChart2,
  CheckCircle2,
  Globe,
  ImageIcon,
  Search,
  Smartphone,
} from "lucide-react";
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

  const save = (key: string) => upsertSetting(key, (fd.get(key) as string) ?? "");

  if (intent === "save_meta") {
    await Promise.all([
      save(SETTING_KEYS.SEO_SITE_NAME),
      save(SETTING_KEYS.SEO_DESCRIPTION),
      save(SETTING_KEYS.SEO_OG_IMAGE),
      save(SETTING_KEYS.SEO_SITE_URL),
      save(SETTING_KEYS.SEO_ROBOTS),
    ]);
    return { success: true, section: "meta" };
  }

  if (intent === "save_html_meta") {
    await Promise.all([
      save(SETTING_KEYS.SEO_VIEWPORT_CONTENT),
      save(SETTING_KEYS.SEO_META_KEYWORDS),
      save(SETTING_KEYS.SEO_META_AUTHOR),
      save(SETTING_KEYS.SEO_HTTP_EQUIV_CONTENT_TYPE),
    ]);
    return { success: true, section: "html_meta" };
  }

  if (intent === "save_verification") {
    await Promise.all([
      save(SETTING_KEYS.SEO_GOOGLE_VERIFICATION),
      save(SETTING_KEYS.SEO_NAVER_VERIFICATION),
    ]);
    return { success: true, section: "verification" };
  }

  if (intent === "save_analytics") {
    await save(SETTING_KEYS.SEO_GA_ID);
    return { success: true, section: "analytics" };
  }

  if (intent === "save_favicon") {
    await save(SETTING_KEYS.FAVICON);
    return { success: true, section: "favicon" };
  }

  return { success: false };
}

function SavedBadge({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="flex items-center gap-1.5 text-sm text-emerald-600">
      <CheckCircle2 className="w-4 h-4" />
      저장되었습니다.
    </div>
  );
}

export default function AdminSeoSettingsPage({ loaderData }: Route.ComponentProps) {
  const { adminUser, settings } = loaderData;
  const fetcher = useFetcher();

  const isSaving = fetcher.state === "submitting";
  const savedSection = fetcher.data?.success ? fetcher.data.section : null;

  // 기본 메타 정보
  const [meta, setMeta] = useState({
    [SETTING_KEYS.SEO_SITE_NAME]:   settings[SETTING_KEYS.SEO_SITE_NAME]   ?? "",
    [SETTING_KEYS.SEO_DESCRIPTION]: settings[SETTING_KEYS.SEO_DESCRIPTION] ?? "",
    [SETTING_KEYS.SEO_OG_IMAGE]:    settings[SETTING_KEYS.SEO_OG_IMAGE]    ?? "",
    [SETTING_KEYS.SEO_SITE_URL]:    settings[SETTING_KEYS.SEO_SITE_URL]    ?? "",
    [SETTING_KEYS.SEO_ROBOTS]:      settings[SETTING_KEYS.SEO_ROBOTS]      ?? "index,follow",
  });

  // 검색엔진 인증
  const [verification, setVerification] = useState({
    [SETTING_KEYS.SEO_GOOGLE_VERIFICATION]: settings[SETTING_KEYS.SEO_GOOGLE_VERIFICATION] ?? "",
    [SETTING_KEYS.SEO_NAVER_VERIFICATION]:  settings[SETTING_KEYS.SEO_NAVER_VERIFICATION]  ?? "",
  });

  // Analytics
  const [analytics, setAnalytics] = useState({
    [SETTING_KEYS.SEO_GA_ID]: settings[SETTING_KEYS.SEO_GA_ID] ?? "",
  });

  // 전역 HTML 메타 (viewport, keywords, author 등)
  const [htmlMeta, setHtmlMeta] = useState({
    [SETTING_KEYS.SEO_VIEWPORT_CONTENT]:
      settings[SETTING_KEYS.SEO_VIEWPORT_CONTENT] ?? "",
    [SETTING_KEYS.SEO_META_KEYWORDS]:
      settings[SETTING_KEYS.SEO_META_KEYWORDS] ?? "",
    [SETTING_KEYS.SEO_META_AUTHOR]: settings[SETTING_KEYS.SEO_META_AUTHOR] ?? "",
    [SETTING_KEYS.SEO_HTTP_EQUIV_CONTENT_TYPE]:
      settings[SETTING_KEYS.SEO_HTTP_EQUIV_CONTENT_TYPE] ?? "",
  });

  // 파비콘
  const [faviconUrl, setFaviconUrl] = useState(settings[SETTING_KEYS.FAVICON] ?? "");

  const submit = (intent: string, data: Record<string, string>) => {
    const fd = new FormData();
    fd.append("intent", intent);
    Object.entries(data).forEach(([k, v]) => fd.append(k, v));
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
            <h1 className="text-2xl font-bold text-gray-900">사이트 설정</h1>
            <p className="mt-1 text-sm text-gray-500">
              검색엔진 최적화(SEO), Analytics, 사이트 전반 설정을 관리합니다.
            </p>
          </div>

          <div className="max-w-2xl space-y-8">

            {/* ─── 1. 기본 메타 정보 ─── */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#204E3A]" />
                  <CardTitle>기본 메타 정보</CardTitle>
                </div>
                <CardDescription>
                  검색결과와 SNS 공유 시 표시되는 사이트 기본 정보입니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => { e.preventDefault(); submit("save_meta", meta); }}
                  className="space-y-5"
                >
                  <div className="space-y-1.5">
                    <Label>사이트명</Label>
                    <Input
                      value={meta[SETTING_KEYS.SEO_SITE_NAME]}
                      onChange={(e) => setMeta({ ...meta, [SETTING_KEYS.SEO_SITE_NAME]: e.target.value })}
                      placeholder="풍림푸드"
                    />
                    <p className="text-xs text-gray-400">브라우저 탭과 검색결과 제목 끝에 붙는 이름입니다.</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label>기본 설명 (meta description)</Label>
                    <Textarea
                      value={meta[SETTING_KEYS.SEO_DESCRIPTION]}
                      onChange={(e) => setMeta({ ...meta, [SETTING_KEYS.SEO_DESCRIPTION]: e.target.value })}
                      placeholder="30년 전통의 액란·푸딩·간편식 전문 식품 기업 풍림푸드입니다."
                      rows={3}
                      maxLength={160}
                    />
                    <p className="text-xs text-gray-400">
                      검색결과 미리보기 텍스트입니다. 80–160자 권장
                      <span className="ml-1 text-gray-500">({meta[SETTING_KEYS.SEO_DESCRIPTION].length}/160)</span>
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label>기본 OG 이미지 <span className="ml-1 text-xs font-normal text-gray-400">(SNS 공유 썸네일)</span></Label>
                    <ImageUpload
                      bucket="media"
                      folder="seo"
                      value={meta[SETTING_KEYS.SEO_OG_IMAGE]}
                      onChange={(url) => setMeta({ ...meta, [SETTING_KEYS.SEO_OG_IMAGE]: url })}
                      aspectRatio="1200/630"
                      hint="1200×630px 권장 · 가로형 로고는 잘릴 수 있어 여백 있는 이미지 사용"
                    />
                    <p className="text-xs text-gray-400">
                      비워두면 기본 이미지(<code className="text-[11px]">/og/share.png</code>)가 사용됩니다.
                      카카오·페이스북 등은 1.91:1 비율로 크롭하므로 로고 주변에 충분한 여백이 필요합니다.
                    </p>
                    <Input
                      value={meta[SETTING_KEYS.SEO_OG_IMAGE]}
                      onChange={(e) => setMeta({ ...meta, [SETTING_KEYS.SEO_OG_IMAGE]: e.target.value })}
                      placeholder="또는 이미지 URL 직접 입력"
                      className="text-xs"
                    />
                    {meta[SETTING_KEYS.SEO_OG_IMAGE] && (
                      <img
                        src={meta[SETTING_KEYS.SEO_OG_IMAGE]}
                        alt="OG 미리보기"
                        className="mt-1 w-full max-w-sm rounded-lg border object-cover aspect-[1200/630]"
                      />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label>사이트 URL</Label>
                    <Input
                      value={meta[SETTING_KEYS.SEO_SITE_URL]}
                      onChange={(e) => setMeta({ ...meta, [SETTING_KEYS.SEO_SITE_URL]: e.target.value })}
                      placeholder="https://www.poonglimfood.co.kr"
                    />
                    <p className="text-xs text-gray-400">canonical URL 및 OG url 기본값으로 사용됩니다.</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label>robots 설정</Label>
                    <Select
                      value={meta[SETTING_KEYS.SEO_ROBOTS]}
                      onValueChange={(v) => setMeta({ ...meta, [SETTING_KEYS.SEO_ROBOTS]: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="index,follow">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-700 text-xs">권장</Badge>
                            index, follow — 검색엔진 수집 허용
                          </div>
                        </SelectItem>
                        <SelectItem value="noindex,nofollow">
                          noindex, nofollow — 검색엔진 수집 차단
                        </SelectItem>
                        <SelectItem value="noindex,follow">
                          noindex, follow — 인덱싱 차단, 링크 수집 허용
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-400">사이트 전체에 적용되는 기본 robots 태그입니다.</p>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button type="submit" disabled={isSaving} className="bg-[#204E3A] hover:bg-[#1a3f2e]">
                      {isSaving && fetcher.formData?.get("intent") === "save_meta" ? "저장 중..." : "저장"}
                    </Button>
                    <SavedBadge show={!isSaving && savedSection === "meta"} />
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* ─── 2. 전역 HTML 메타 (viewport · keywords · author) ─── */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-[#204E3A]" />
                  <CardTitle>전역 HTML 메타</CardTitle>
                </div>
                <CardDescription>
                  모든 페이지의{" "}
                  <code className="rounded bg-gray-100 px-1">&lt;head&gt;</code>에 출력되는
                  viewport·keywords·author 등입니다. 비우면 기본값 또는 태그 생략입니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submit("save_html_meta", htmlMeta);
                  }}
                  className="space-y-5"
                >
                  <div className="space-y-1.5">
                    <Label>viewport content</Label>
                    <Input
                      value={htmlMeta[SETTING_KEYS.SEO_VIEWPORT_CONTENT]}
                      onChange={(e) =>
                        setHtmlMeta({
                          ...htmlMeta,
                          [SETTING_KEYS.SEO_VIEWPORT_CONTENT]: e.target.value,
                        })
                      }
                      placeholder='width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=yes'
                      className="font-mono text-xs"
                    />
                    <p className="text-xs text-gray-400">
                      비우면{" "}
                      <code className="rounded bg-gray-100 px-1">
                        width=device-width, initial-scale=1
                      </code>{" "}
                      이 사용됩니다.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label>meta keywords</Label>
                    <Input
                      value={htmlMeta[SETTING_KEYS.SEO_META_KEYWORDS]}
                      onChange={(e) =>
                        setHtmlMeta({
                          ...htmlMeta,
                          [SETTING_KEYS.SEO_META_KEYWORDS]: e.target.value,
                        })
                      }
                      placeholder="풍림푸드, 액란, 푸딩, 간편식"
                    />
                    <p className="text-xs text-gray-400">
                      쉼표로 구분해 검색엔진용 키워드를 입력합니다. 비우면 태그를 넣지 않습니다.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label>meta author</Label>
                    <Input
                      value={htmlMeta[SETTING_KEYS.SEO_META_AUTHOR]}
                      onChange={(e) =>
                        setHtmlMeta({
                          ...htmlMeta,
                          [SETTING_KEYS.SEO_META_AUTHOR]: e.target.value,
                        })
                      }
                      placeholder="풍림푸드"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>http-equiv Content-Type (content 값만)</Label>
                    <Input
                      value={htmlMeta[SETTING_KEYS.SEO_HTTP_EQUIV_CONTENT_TYPE]}
                      onChange={(e) =>
                        setHtmlMeta({
                          ...htmlMeta,
                          [SETTING_KEYS.SEO_HTTP_EQUIV_CONTENT_TYPE]: e.target.value,
                        })
                      }
                      placeholder="text/html; charset=utf-8"
                      className="font-mono text-xs"
                    />
                    <p className="text-xs text-gray-400">
                      HTML5에서는{" "}
                      <code className="rounded bg-gray-100 px-1">charset=utf-8</code> 메타와
                      중복될 수 있습니다. 특별히 필요할 때만 입력하세요. 비우면 태그를 넣지 않습니다.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="bg-[#204E3A] hover:bg-[#1a3f2e]"
                    >
                      {isSaving && fetcher.formData?.get("intent") === "save_html_meta"
                        ? "저장 중..."
                        : "저장"}
                    </Button>
                    <SavedBadge show={!isSaving && savedSection === "html_meta"} />
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* ─── 3. 검색엔진 인증 ─── */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-[#204E3A]" />
                  <CardTitle>검색엔진 인증</CardTitle>
                </div>
                <CardDescription>
                  Google Search Console 및 네이버 웹마스터 도구 소유권 인증 코드입니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => { e.preventDefault(); submit("save_verification", verification); }}
                  className="space-y-5"
                >
                  <div className="space-y-1.5">
                    <Label>Google Search Console 인증 코드</Label>
                    <Input
                      value={verification[SETTING_KEYS.SEO_GOOGLE_VERIFICATION]}
                      onChange={(e) => setVerification({ ...verification, [SETTING_KEYS.SEO_GOOGLE_VERIFICATION]: e.target.value })}
                      placeholder="예: AbCdEfGhIjKlMnOpQrStUvWxYz123456789"
                    />
                    <p className="text-xs text-gray-400">
                      Search Console → 속성 추가 → HTML 태그 방식의 <code className="bg-gray-100 px-1 rounded">content</code> 값만 입력하세요.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label>네이버 웹마스터 인증 코드</Label>
                    <Input
                      value={verification[SETTING_KEYS.SEO_NAVER_VERIFICATION]}
                      onChange={(e) => setVerification({ ...verification, [SETTING_KEYS.SEO_NAVER_VERIFICATION]: e.target.value })}
                      placeholder="예: abcdef1234567890abcdef1234567890"
                    />
                    <p className="text-xs text-gray-400">
                      네이버 서치어드바이저 → 사이트 등록 → HTML 태그의 <code className="bg-gray-100 px-1 rounded">content</code> 값만 입력하세요.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button type="submit" disabled={isSaving} className="bg-[#204E3A] hover:bg-[#1a3f2e]">저장</Button>
                    <SavedBadge show={!isSaving && savedSection === "verification"} />
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* ─── 4. Analytics ─── */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-[#204E3A]" />
                  <CardTitle>Analytics</CardTitle>
                </div>
                <CardDescription>
                  사이트 방문자 분석 도구를 연결합니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => { e.preventDefault(); submit("save_analytics", analytics); }}
                  className="space-y-5"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Label>GA4 측정 ID 또는 Tag Manager 컨테이너 ID</Label>
                      <Badge variant="outline" className="text-xs">Analytics</Badge>
                    </div>
                    <Input
                      value={analytics[SETTING_KEYS.SEO_GA_ID]}
                      onChange={(e) => setAnalytics({ ...analytics, [SETTING_KEYS.SEO_GA_ID]: e.target.value })}
                      placeholder="G-XXXXXXXXXX 또는 GTM-XXXXXXX"
                    />
                    <p className="text-xs text-gray-400">
                      <span className="font-medium text-gray-600">직연동:</span> GA4 데이터 스트림 측정 ID (
                      <code className="rounded bg-gray-100 px-1">G-</code>).{" "}
                      <span className="font-medium text-gray-600">Tag Manager:</span> 컨테이너 ID (
                      <code className="rounded bg-gray-100 px-1">GTM-</code>) — GTM 안에서 GA4 태그만 켜면 되고,{" "}
                      <code className="rounded bg-gray-100 px-1">G-</code>는 이 칸에 넣지 마세요(중복 수집 방지).
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button type="submit" disabled={isSaving} className="bg-[#204E3A] hover:bg-[#1a3f2e]">저장</Button>
                    <SavedBadge show={!isSaving && savedSection === "analytics"} />
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* ─── 5. 파비콘 ─── */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#204E3A]" />
                  <CardTitle>파비콘</CardTitle>
                </div>
                <CardDescription>
                  브라우저 탭과 북마크에 표시되는 사이트 아이콘입니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData();
                    fd.append("intent", "save_favicon");
                    fd.append(SETTING_KEYS.FAVICON, faviconUrl);
                    fetcher.submit(fd, { method: "POST" });
                  }}
                  className="space-y-5"
                >
                  <div className="flex gap-6 items-start">
                    {/* 미리보기 */}
                    <div className="flex-shrink-0">
                      <p className="text-xs text-gray-500 mb-2 font-medium">현재 파비콘</p>
                      <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden">
                        {faviconUrl ? (
                          <img src={faviconUrl} alt="파비콘 미리보기" className="w-10 h-10 object-contain" />
                        ) : (
                          <img src="/favicon.png" alt="기본 파비콘" className="w-10 h-10 object-contain" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5 text-center">
                        {faviconUrl ? "업로드됨" : "기본값"}
                      </p>
                    </div>

                    {/* 업로드 */}
                    <div className="flex-1 space-y-3">
                      <div className="space-y-1.5">
                        <Label>파비콘 이미지 업로드</Label>
                        <ImageUpload
                          bucket="media"
                          folder="favicon"
                          value={faviconUrl}
                          onChange={(url) => setFaviconUrl(url)}
                          hint="PNG · ICO · SVG · 권장 크기 32×32 또는 64×64px"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-500">또는 URL 직접 입력</Label>
                        <Input
                          value={faviconUrl}
                          onChange={(e) => setFaviconUrl(e.target.value)}
                          placeholder="/favicon.png"
                          className="text-xs"
                        />
                      </div>
                      <p className="text-xs text-gray-400">
                        비워두면 기본 파비콘(<code className="bg-gray-100 px-1 rounded">/favicon.png</code>)이 사용됩니다.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button type="submit" disabled={isSaving} className="bg-[#204E3A] hover:bg-[#1a3f2e]">저장</Button>
                    <SavedBadge show={!isSaving && savedSection === "favicon"} />
                  </div>
                </form>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
