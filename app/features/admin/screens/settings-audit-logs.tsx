import type { Route } from "./+types/settings-audit-logs";

import { and, desc, eq, gte, ilike, lte } from "drizzle-orm";
import { Form } from "react-router";

import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";

import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import { adminAuditLogs } from "../schema";
import { requireSuperAdmin } from "../utils/auth.server";
import { getPermissionLabel } from "../utils/permissions";

export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireSuperAdmin(request);
  const url = new URL(request.url);
  const admin = url.searchParams.get("admin")?.trim() ?? "";
  const menu = url.searchParams.get("menu")?.trim() ?? "";
  const action = url.searchParams.get("action")?.trim() ?? "";
  const from = url.searchParams.get("from")?.trim() ?? "";
  const to = url.searchParams.get("to")?.trim() ?? "";
  const conditions = [];

  if (admin) conditions.push(ilike(adminAuditLogs.admin_email, `%${admin}%`));
  if (menu) conditions.push(eq(adminAuditLogs.menu, menu));
  if (action) conditions.push(eq(adminAuditLogs.action, action));
  if (from) conditions.push(gte(adminAuditLogs.created_at, new Date(`${from}T00:00:00`)));
  if (to) conditions.push(lte(adminAuditLogs.created_at, new Date(`${to}T23:59:59.999`)));

  const db = (await import("~/core/db/drizzle-client.server")).default;
  const logs = await db
    .select()
    .from(adminAuditLogs)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(adminAuditLogs.created_at))
    .limit(500);

  return { adminUser, logs, filters: { admin, menu, action, from, to } };
}

function formatDetails(details: Record<string, unknown>): string {
  return JSON.stringify(details, null, 2);
}

export default function AdminAuditLogsPage({ loaderData }: Route.ComponentProps) {
  const { adminUser, logs, filters } = loaderData;

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar adminUser={adminUser} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 overflow-auto p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">관리자 변경 이력</h1>
            <p className="mt-2 text-sm text-gray-600">
              이 기록은 조회만 가능하며 관리자도 수정하거나 삭제할 수 없습니다.
            </p>
          </div>

          <Form method="get" className="mb-6 grid grid-cols-1 gap-3 rounded-lg bg-white p-4 shadow sm:grid-cols-6">
            <Input name="admin" defaultValue={filters.admin} placeholder="관리자 이메일" />
            <Input name="menu" defaultValue={filters.menu} placeholder="메뉴 키" />
            <Input name="action" defaultValue={filters.action} placeholder="작업(create 등)" />
            <Input name="from" type="date" defaultValue={filters.from} aria-label="시작일" />
            <Input name="to" type="date" defaultValue={filters.to} aria-label="종료일" />
            <Button type="submit" className="bg-[#204E3A] hover:bg-[#1a3f2e]">
              검색
            </Button>
          </Form>

          <div className="overflow-x-auto rounded-lg bg-white shadow">
            <table className="w-full min-w-[1000px] text-sm">
              <thead className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">일시</th>
                  <th className="px-4 py-3">관리자</th>
                  <th className="px-4 py-3">메뉴</th>
                  <th className="px-4 py-3">작업</th>
                  <th className="px-4 py-3">대상</th>
                  <th className="px-4 py-3">요청 정보</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logs.map((log) => (
                  <tr key={log.audit_log_id} className="align-top">
                    <td className="whitespace-nowrap px-4 py-3">
                      {log.created_at.toLocaleString("ko-KR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{log.admin_name}</div>
                      <div className="text-xs text-gray-500">{log.admin_email}</div>
                    </td>
                    <td className="px-4 py-3">{getPermissionLabel(log.menu)}</td>
                    <td className="px-4 py-3 font-medium">{log.action}</td>
                    <td className="px-4 py-3">{log.target_id ?? "—"}</td>
                    <td className="max-w-md px-4 py-3">
                      <details>
                        <summary className="cursor-pointer text-[#204E3A]">상세 보기</summary>
                        <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded bg-gray-50 p-3 text-xs">
                          {formatDetails(log.details)}
                        </pre>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length === 0 && (
              <div className="py-12 text-center text-sm text-gray-500">변경 이력이 없습니다.</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
