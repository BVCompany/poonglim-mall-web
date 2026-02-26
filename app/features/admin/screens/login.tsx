/**
 * Admin Login Screen
 * 
 * Login page for admin users to access the admin panel.
 * Currently uses temporary authentication with test credentials.
 * TODO: Integrate with Supabase authentication when DB is configured.
 */

import { useState } from "react";
import { Form, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/login";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import { Checkbox } from "~/core/components/ui/checkbox";
import { AlertCircle } from "lucide-react";
import {
  redirectIfAdminAuthenticated,
  loginAdmin,
  createAdminSession,
} from "../utils/auth.server";

/**
 * Loader: Redirect if already authenticated
 */
export async function loader({ request }: Route.LoaderArgs) {
  await redirectIfAdminAuthenticated(request);
  return null;
}

/**
 * Action: Handle login form submission
 */
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const remember = formData.get("remember") === "on";

  // Validate input
  if (!email || !password) {
    return {
      error: "이메일과 비밀번호를 입력해주세요.",
    };
  }

  // Attempt login
  const adminUser = await loginAdmin({ email, password, remember });

  if (!adminUser) {
    return {
      error: "이메일 또는 비밀번호가 올바르지 않습니다.",
    };
  }

  // Create session and redirect
  return createAdminSession(adminUser);
}

/**
 * Admin Login Screen Component
 */
export default function AdminLogin() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [rememberMe, setRememberMe] = useState(false);
  
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              풍림푸드
            </h1>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              관리자 로그인
            </h2>
            <p className="text-sm text-gray-500">
              관리자 계정으로 로그인하여 웹사이트를 관리하세요
            </p>
          </div>

          {/* Error Message */}
          {actionData?.error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{actionData.error}</p>
            </div>
          )}

          {/* Login Form */}
          <Form method="post" className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@poonglim.com"
                required
                disabled={isSubmitting}
                className="w-full"
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                disabled={isSubmitting}
                className="w-full"
                autoComplete="current-password"
              />
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                name="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={isSubmitting}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-normal cursor-pointer"
              >
                아이디 저장
              </Label>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#204E3A] hover:bg-[#1a3f2e] text-white py-6"
            >
              {isSubmitting ? "로그인 중..." : "로그인"}
            </Button>
          </Form>

          {/* Test Account Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              테스트 계정: admin@poonglim.com / poonglim2024
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

