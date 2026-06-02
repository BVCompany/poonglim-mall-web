/**
 * Admin Instagram Section Management Page
 *
 * 메인 인스타그램 섹션에 직접 노출할 이미지를 관리(등록/수정/삭제/순서/활성)합니다.
 * 메타(인스타) 연동과 별개로, 연동 전/대체용으로 직접 등록한 이미지를 노출합니다.
 */

import {
  ChevronDown,
  ChevronUp,
  Edit,
  ImageOff,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useFetcher } from "react-router";

import { Button } from "~/core/components/ui/button";
import db from "~/core/db/drizzle-client.server";
import {
  getAllInstagramPosts,
} from "~/features/home/lib/queries.server";
import { instagramPosts as instagramPostsTable } from "~/features/home/schema";
import { eq } from "drizzle-orm";

import type { Route } from "./+types/settings-instagram";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import {
  InstagramPostAddModal,
  type InstagramPostFormData,
} from "../components/instagram-post-add-modal";
import { requireAdminAuth } from "../utils/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminAuth(request);
  const dbPosts = await getAllInstagramPosts().catch((e) => {
    console.error("[admin/instagram] DB 조회 실패:", e);
    return [];
  });
  return { adminUser, dbPosts };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdminAuth(request);
  const fd = await request.formData();
  const intent = fd.get("intent") as string;

  if (intent === "create") {
    await db.insert(instagramPostsTable).values({
      image_url: fd.get("imageUrl") as string,
      link_url: (fd.get("linkUrl") as string) || null,
      caption: (fd.get("caption") as string) || null,
      is_active: fd.get("isActive") !== "false",
      sort_order: 0,
    });
    return { success: true };
  }

  if (intent === "update") {
    const id = Number(fd.get("id"));
    if (id) {
      await db
        .update(instagramPostsTable)
        .set({
          image_url: fd.get("imageUrl") as string,
          link_url: (fd.get("linkUrl") as string) || null,
          caption: (fd.get("caption") as string) || null,
          is_active: fd.get("isActive") !== "false",
        })
        .where(eq(instagramPostsTable.instagram_post_id, id));
    }
    return { success: true };
  }

  if (intent === "delete") {
    const id = Number(fd.get("id"));
    if (id)
      await db
        .delete(instagramPostsTable)
        .where(eq(instagramPostsTable.instagram_post_id, id));
    return { success: true };
  }

  if (intent === "toggle") {
    const id = Number(fd.get("id"));
    const isActive = fd.get("isActive") === "true";
    if (id)
      await db
        .update(instagramPostsTable)
        .set({ is_active: !isActive })
        .where(eq(instagramPostsTable.instagram_post_id, id));
    return { success: true };
  }

  if (intent === "reorder") {
    const id = Number(fd.get("id"));
    const direction = fd.get("direction") as "up" | "down";
    const all = await db
      .select()
      .from(instagramPostsTable)
      .orderBy(instagramPostsTable.sort_order);
    const idx = all.findIndex((p) => p.instagram_post_id === id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (idx >= 0 && swapIdx >= 0 && swapIdx < all.length) {
      const a = all[idx];
      const b = all[swapIdx];
      const aOrder = a.sort_order ?? idx;
      const bOrder = b.sort_order ?? swapIdx;
      await db
        .update(instagramPostsTable)
        .set({ sort_order: bOrder })
        .where(eq(instagramPostsTable.instagram_post_id, a.instagram_post_id));
      await db
        .update(instagramPostsTable)
        .set({ sort_order: aOrder })
        .where(eq(instagramPostsTable.instagram_post_id, b.instagram_post_id));
    }
    return { success: true };
  }

  return { success: false };
}

interface InstaPost {
  id: string;
  order: number;
  imageUrl: string;
  linkUrl: string;
  caption: string;
  isActive: boolean;
  createdAt: string;
}

function InstaThumbnail({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div className="flex h-20 w-16 items-center justify-center rounded bg-gray-100">
        <ImageOff className="h-6 w-6 text-gray-300" />
      </div>
    );
  }
  return (
    <div className="h-20 w-16 overflow-hidden rounded bg-gray-100">
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}

export default function AdminInstagramPage({
  loaderData,
}: Route.ComponentProps) {
  const { adminUser, dbPosts } = loaderData;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<InstaPost | null>(null);
  const fetcher = useFetcher();

  const posts: InstaPost[] = dbPosts.map((p, idx) => ({
    id: String(p.instagram_post_id),
    order: p.sort_order ?? idx + 1,
    imageUrl: p.image_url,
    linkUrl: p.link_url ?? "",
    caption: p.caption ?? "",
    isActive: p.is_active,
    createdAt: new Date(p.created_at).toISOString().slice(0, 10),
  }));

  const handleAdd = (data: InstagramPostFormData) => {
    const fd = new FormData();
    fd.append("intent", "create");
    Object.entries(data).forEach(([k, v]) => fd.append(k, String(v ?? "")));
    fetcher.submit(fd, { method: "POST" });
    setIsAddModalOpen(false);
  };

  const handleUpdate = (data: InstagramPostFormData) => {
    if (!editTarget) return;
    const fd = new FormData();
    fd.append("intent", "update");
    fd.append("id", editTarget.id);
    Object.entries(data).forEach(([k, v]) => fd.append(k, String(v ?? "")));
    fetcher.submit(fd, { method: "POST" });
    setEditTarget(null);
  };

  const move = (id: string, direction: "up" | "down") => {
    const fd = new FormData();
    fd.append("intent", "reorder");
    fd.append("id", id);
    fd.append("direction", direction);
    fetcher.submit(fd, { method: "POST" });
  };

  const handleToggle = (post: InstaPost) => {
    const fd = new FormData();
    fd.append("intent", "toggle");
    fd.append("id", post.id);
    fd.append("isActive", String(post.isActive));
    fetcher.submit(fd, { method: "POST" });
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

      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminNavbar />

        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-gray-900">
                  인스타그램 섹션 관리
                </h1>
                <p className="text-gray-600">
                  메인 인스타그램 섹션에 직접 노출할 이미지를 관리하세요.
                  등록된 이미지가 있으면 메인에 우선 노출되며, 없으면 기본
                  이미지가 표시됩니다.
                </p>
              </div>
              <Button
                className="gap-2 bg-[#204E3A] hover:bg-[#1a3f2e]"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                이미지 추가
              </Button>
            </div>

            <div className="rounded-lg bg-white shadow">
              <div className="border-b px-6 py-4">
                <h2 className="font-semibold text-gray-900">이미지 목록</h2>
                <p className="mt-1 text-sm text-gray-600">
                  현재 등록된 이미지 ({posts.length}개)
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        순서
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        이미지
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        링크
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        메모
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        상태
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        등록일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        관리
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {posts.map((post, index) => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex flex-col items-center gap-1">
                            <button
                              onClick={() => move(post.id, "up")}
                              disabled={index === 0}
                              className="text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>
                            <span className="text-sm font-medium text-gray-900">
                              {post.order}
                            </span>
                            <button
                              onClick={() => move(post.id, "down")}
                              disabled={index === posts.length - 1}
                              className="text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <InstaThumbnail
                            src={post.imageUrl}
                            alt={post.caption || "instagram"}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs truncate text-sm text-gray-900">
                            {post.linkUrl || (
                              <span className="text-gray-400">
                                공식 계정으로 이동
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs truncate text-sm text-gray-600">
                            {post.caption || "—"}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={post.isActive}
                            onClick={() => handleToggle(post)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              post.isActive ? "bg-[#204E3A]" : "bg-gray-300"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                post.isActive ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {post.createdAt}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditTarget(post)}
                              className="h-8 w-8"
                              title="수정"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(post.id)}
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

              {posts.length === 0 && (
                <div className="py-12 text-center">
                  <ImageOff className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    등록된 이미지가 없습니다
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    이미지를 추가하지 않으면 메인에는 기본 인스타 이미지가
                    표시됩니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 추가 모달 */}
      <InstagramPostAddModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAdd}
      />

      {/* 수정 모달 */}
      <InstagramPostAddModal
        open={!!editTarget}
        onOpenChange={(o) => !o && setEditTarget(null)}
        onSubmit={handleUpdate}
        editId={editTarget?.id}
        initialData={
          editTarget
            ? {
                imageUrl: editTarget.imageUrl,
                linkUrl: editTarget.linkUrl,
                caption: editTarget.caption,
                isActive: editTarget.isActive,
              }
            : undefined
        }
      />
    </div>
  );
}
