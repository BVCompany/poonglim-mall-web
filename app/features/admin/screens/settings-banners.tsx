/**
 * Admin Banner Management Page
 *
 * Allows admins to manage main page banners (view, create, edit, delete, reorder).
 */

import { useState } from "react";
import { useFetcher } from "react-router";
import type { Route } from "./+types/settings-banners";
import { requireAdminAuth } from "../utils/auth.server";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import { BannerAddModal, type BannerFormData } from "../components/banner-add-modal";
import { Button } from "~/core/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "~/core/components/ui/dialog";
import { ChevronUp, ChevronDown, Eye, Edit, Trash2, Plus, ImageOff, X } from "lucide-react";
import { getActiveBanners } from "~/features/home/lib/queries.server";
import db from "~/core/db/drizzle-client.server";
import { banners as bannersTable } from "~/features/home/schema";
import { eq } from "drizzle-orm";

export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminAuth(request);
  const dbBanners = await getActiveBanners().catch(() => []);
  return { adminUser, dbBanners };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdminAuth(request);
  const fd = await request.formData();
  const intent = fd.get("intent") as string;

  if (intent === "create") {
    await db.insert(bannersTable).values({
      title: fd.get("title") as string,
      subtitle: (fd.get("subtitle") as string) || null,
      image_url: fd.get("imageUrl") as string,
      link_url: (fd.get("linkUrl") as string) || null,
      button_text: (fd.get("buttonText") as string) || null,
      is_active: fd.get("isActive") !== "false",
      sort_order: 0,
    });
    return { success: true };
  }

  if (intent === "delete") {
    const id = Number(fd.get("id"));
    if (id) await db.delete(bannersTable).where(eq(bannersTable.banner_id, id));
    return { success: true };
  }

  if (intent === "toggle") {
    const id = Number(fd.get("id"));
    const isActive = fd.get("isActive") === "true";
    if (id) await db.update(bannersTable).set({ is_active: !isActive }).where(eq(bannersTable.banner_id, id));
    return { success: true };
  }

  if (intent === "update") {
    const id = Number(fd.get("id"));
    if (id) {
      await db.update(bannersTable).set({
        title: fd.get("title") as string,
        subtitle: (fd.get("subtitle") as string) || null,
        image_url: fd.get("imageUrl") as string,
        link_url: (fd.get("linkUrl") as string) || null,
        button_text: (fd.get("buttonText") as string) || null,
        is_active: fd.get("isActive") !== "false",
      }).where(eq(bannersTable.banner_id, id));
    }
    return { success: true };
  }

  if (intent === "reorder") {
    const id = Number(fd.get("id"));
    const direction = fd.get("direction") as "up" | "down";
    const allBanners = await db.select().from(bannersTable).orderBy(bannersTable.sort_order);
    const idx = allBanners.findIndex((b) => b.banner_id === id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (idx >= 0 && swapIdx >= 0 && swapIdx < allBanners.length) {
      const a = allBanners[idx];
      const b = allBanners[swapIdx];
      const aOrder = a.sort_order ?? idx;
      const bOrder = b.sort_order ?? swapIdx;
      await db.update(bannersTable).set({ sort_order: bOrder }).where(eq(bannersTable.banner_id, a.banner_id));
      await db.update(bannersTable).set({ sort_order: aOrder }).where(eq(bannersTable.banner_id, b.banner_id));
    }
    return { success: true };
  }

  return { success: false };
}

interface Banner {
  id: string;
  order: number;
  imageUrl: string;
  title: string;
  subtitle: string;
  linkUrl: string;
  buttonText: string;
  isActive: boolean;
  createdAt: string;
}

const MOCK_BANNERS: Banner[] = [
  {
    id: "1",
    order: 1,
    imageUrl: "/home/hero_1.jpg",
    title: "건강하고 풍요로운 일상",
    subtitle: "신뢰할 수 있는 품질과 혁신적인 기술로 만드는 풍림푸드 제품을 만나보세요",
    linkUrl: "/products",
    buttonText: "제품 둘러보기",
    isActive: true,
    createdAt: "2024-01-01",
  },
];

/** 썸네일 셀 — 이미지 로드 실패 시 아이콘으로 대체 */
function BannerThumbnail({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div className="h-16 w-24 rounded bg-gray-100 flex items-center justify-center">
        <ImageOff className="h-6 w-6 text-gray-300" />
      </div>
    );
  }
  return (
    <div className="h-16 w-24 rounded overflow-hidden bg-gray-100">
      <img src={src} alt={alt} className="h-full w-full object-cover" onError={() => setError(true)} />
    </div>
  );
}

/** 실제 메인 페이지 히어로 배너처럼 보이는 미리보기 모달 */
function BannerPreviewModal({ banner, open, onClose }: { banner: Banner | null; open: boolean; onClose: () => void }) {
  const [imgError, setImgError] = useState(false);

  if (!banner) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="!max-w-[95vw] !w-[95vw] p-0 overflow-hidden bg-transparent border-none shadow-none">
        <DialogTitle className="sr-only">{banner.title} 배너 미리보기</DialogTitle>

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-50 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* 배너 미리보기 — 실제 히어로 섹션 비율 재현 */}
        <div className="relative w-full aspect-[1840/800] rounded-2xl overflow-hidden bg-gray-200">
          {/* 배경 이미지 */}
          {banner.imageUrl && !imgError ? (
            <img
              src={banner.imageUrl}
              alt={banner.title}
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
              <ImageOff className="h-16 w-16 text-gray-300" />
            </div>
          )}

          {/* 어두운 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

          {/* 텍스트 영역 — 실제 히어로와 동일한 위치 */}
          <div className="absolute bottom-8 left-10 flex flex-col gap-2 max-w-xl">
            {/* 제목 (위 작은 글씨) */}
            {banner.title && (
              <p
                className="text-sm font-medium text-[#204E3A] opacity-90"
                style={{ letterSpacing: "-0.04em" }}
              >
                {banner.title}
              </p>
            )}
            {/* 부제목 (굵고 큰 글씨) */}
            {(banner.subtitle || banner.buttonText) && (
              <h2
                className="text-2xl font-bold text-[#204E3A] leading-snug"
                style={{ letterSpacing: "-0.04em" }}
              >
                {banner.subtitle}
                {banner.subtitle && banner.buttonText && " "}
                {banner.buttonText}
              </h2>
            )}
            {/* 링크 표시 */}
            {banner.linkUrl && (
              <p className="text-xs text-[#204E3A]/70 mt-1">
                🔗 {banner.linkUrl}
              </p>
            )}
          </div>

          {/* 슬라이드 카운터 배지 (참고용) */}
          <div className="absolute bottom-8 left-10 mt-20" style={{ top: "auto", bottom: "1.5rem", left: "2.5rem" }}>
          </div>

          {/* 미리보기 라벨 */}
          <div className="absolute top-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            미리보기
          </div>
        </div>

        {/* 배너 정보 요약 */}
        <div className="bg-white rounded-b-xl px-5 py-3 flex items-center gap-6 text-sm text-gray-600 border-t">
          <span><span className="font-medium text-gray-800">제목:</span> {banner.title || "—"}</span>
          <span><span className="font-medium text-gray-800">부제목:</span> {banner.subtitle || "—"}</span>
          {banner.linkUrl && <span><span className="font-medium text-gray-800">링크:</span> {banner.linkUrl}</span>}
          <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${banner.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {banner.isActive ? "활성" : "비활성"}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminBannersPage({ loaderData }: Route.ComponentProps) {
  const { adminUser, dbBanners } = loaderData;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Banner | null>(null);
  const [previewTarget, setPreviewTarget] = useState<Banner | null>(null);
  const fetcher = useFetcher();

  const banners: Banner[] = dbBanners.length > 0
    ? dbBanners.map((b, idx) => ({
        id: String(b.banner_id),
        order: b.sort_order ?? idx + 1,
        imageUrl: b.image_url,
        title: b.title,
        subtitle: b.subtitle ?? "",
        linkUrl: b.link_url ?? "",
        buttonText: b.button_text ?? "",
        isActive: b.is_active,
        createdAt: b.created_at.toISOString().slice(0, 10),
      }))
    : MOCK_BANNERS;

  const handleAddBanner = (bannerData: BannerFormData) => {
    const fd = new FormData();
    fd.append("intent", "create");
    Object.entries(bannerData).forEach(([k, v]) => fd.append(k, String(v ?? "")));
    fetcher.submit(fd, { method: "POST" });
    setIsAddModalOpen(false);
  };

  const handleUpdateBanner = (bannerData: BannerFormData) => {
    if (!editTarget) return;
    const fd = new FormData();
    fd.append("intent", "update");
    fd.append("id", editTarget.id);
    Object.entries(bannerData).forEach(([k, v]) => fd.append(k, String(v ?? "")));
    fetcher.submit(fd, { method: "POST" });
    setEditTarget(null);
  };

  const handleMoveUp = (id: string) => {
    const fd = new FormData();
    fd.append("intent", "reorder");
    fd.append("id", id);
    fd.append("direction", "up");
    fetcher.submit(fd, { method: "POST" });
  };

  const handleMoveDown = (id: string) => {
    const fd = new FormData();
    fd.append("intent", "reorder");
    fd.append("id", id);
    fd.append("direction", "down");
    fetcher.submit(fd, { method: "POST" });
  };

  const handleToggleActive = (id: string) => {
    const banner = banners.find((b) => b.id === id);
    if (!banner) return;
    const fd = new FormData();
    fd.append("intent", "toggle");
    fd.append("id", id);
    fd.append("isActive", String(banner.isActive));
    fetcher.submit(fd, { method: "POST" });
  };

  const handleEdit = (id: string) => {
    const banner = banners.find((b) => b.id === id);
    if (banner) setEditTarget(banner);
  };

  const handleDelete = (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const fd = new FormData();
    fd.append("intent", "delete");
    fd.append("id", id);
    fetcher.submit(fd, { method: "POST" });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar adminUser={adminUser} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminNavbar />

        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">메인 배너 관리</h1>
                <p className="text-gray-600">홈페이지 메인 배너를 관리하세요</p>
              </div>
              <Button
                className="gap-2 bg-[#204E3A] hover:bg-[#1a3f2e]"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                배너 추가
              </Button>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h2 className="font-semibold text-gray-900">배너 목록</h2>
                <p className="text-sm text-gray-600 mt-1">현재 등록된 배너 ({banners.length}개)</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">순서</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">썸네일</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">링크</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">등록일</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {banners.map((banner, index) => (
                      <tr key={banner.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1 items-center">
                            <button
                              onClick={() => handleMoveUp(banner.id)}
                              disabled={index === 0}
                              className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>
                            <span className="text-sm font-medium text-gray-900">{banner.order}</span>
                            <button
                              onClick={() => handleMoveDown(banner.id)}
                              disabled={index === banners.length - 1}
                              className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <BannerThumbnail src={banner.imageUrl} alt={banner.title} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <p className="text-sm font-medium text-gray-900 truncate">{banner.title}</p>
                            <p className="text-xs text-gray-500 truncate mt-1">{banner.subtitle}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{banner.linkUrl || "—"}</div>
                          <div className="text-xs text-gray-500 mt-1">{banner.buttonText}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={banner.isActive}
                            onClick={() => handleToggleActive(banner.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              banner.isActive ? "bg-[#204E3A]" : "bg-gray-300"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                banner.isActive ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {banner.createdAt}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setPreviewTarget(banner)}
                              className="h-8 w-8 text-blue-500 hover:text-blue-600"
                              title="배너 미리보기"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(banner.id)}
                              className="h-8 w-8"
                              title="수정"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(banner.id)}
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                              title="삭제"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {banners.length === 0 && (
                <div className="text-center py-12">
                  <Eye className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">등록된 배너가 없습니다</h3>
                  <p className="mt-2 text-sm text-gray-500">새 배너를 추가하여 메인 페이지를 꾸며보세요</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 배너 추가 모달 */}
      <BannerAddModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddBanner}
      />

      {/* 배너 수정 모달 */}
      <BannerAddModal
        open={!!editTarget}
        onOpenChange={(o) => !o && setEditTarget(null)}
        onSubmit={handleUpdateBanner}
        editId={editTarget?.id}
        initialData={editTarget ? {
          title: editTarget.title,
          subtitle: editTarget.subtitle,
          imageUrl: editTarget.imageUrl,
          linkUrl: editTarget.linkUrl,
          buttonText: editTarget.buttonText,
          isActive: editTarget.isActive,
        } : undefined}
      />

      {/* 배너 미리보기 모달 */}
      <BannerPreviewModal
        banner={previewTarget}
        open={!!previewTarget}
        onClose={() => setPreviewTarget(null)}
      />
    </div>
  );
}
