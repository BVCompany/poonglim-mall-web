import { useState, useEffect } from "react";
import { Form, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/login";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import { Checkbox } from "~/core/components/ui/checkbox";
import { AlertCircle, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import {
  redirectIfAdminAuthenticated,
  loginAdmin,
  createAdminSession,
} from "../utils/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  await redirectIfAdminAuthenticated(request);
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const remember = formData.get("remember") === "on";

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력해주세요.", email };
  }

  const adminUser = await loginAdmin({ email, password, remember });

  if (!adminUser) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다.", email };
  }

  return createAdminSession(adminUser);
}

export default function AdminLogin() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("dark");
    html.classList.add("light");
    return () => {
      html.classList.remove("light");
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#204E3A] flex items-center justify-center p-4">
      {/* 배경 패턴 */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />

      <div className="relative w-full max-w-md">
        {/* 카드 */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* 상단 헤더 */}
          <div className="bg-[#204E3A] px-8 pt-10 pb-8 text-center">
            <div className="flex justify-center mb-5">
              <img
                src="/home/poonglim-logo-eng.png"
                alt="Poonglim"
                className="h-10 brightness-0 invert"
              />
            </div>
            <div className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
              <p className="text-emerald-100 text-xs font-medium">관리자 포털</p>
            </div>
          </div>

          {/* 폼 영역 */}
          <div className="px-8 py-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 text-center">
              로그인
            </h2>

            {/* 오류 메시지 */}
            {actionData?.error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{actionData.error}</p>
              </div>
            )}

            <Form method="post" className="space-y-5">
              {/* 이메일 */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  이메일
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@poonglim.com"
                    defaultValue={actionData?.email ?? ""}
                    required
                    disabled={isSubmitting}
                    autoComplete="email"
                    className="pl-9 h-11"
                  />
                </div>
              </div>

              {/* 비밀번호 */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  비밀번호
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    disabled={isSubmitting}
                    autoComplete="current-password"
                    className="pl-9 pr-10 h-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 로그인 상태 유지 */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  name="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={isSubmitting}
                />
                <Label htmlFor="remember" className="text-sm font-normal text-gray-600 cursor-pointer">
                  로그인 상태 유지
                </Label>
              </div>

              {/* 로그인 버튼 */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-[#204E3A] hover:bg-[#1a3f2e] text-white font-medium rounded-lg transition-colors"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    로그인 중...
                  </span>
                ) : "로그인"}
              </Button>
            </Form>
          </div>

          {/* 하단 푸터 */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              © {new Date().getFullYear()} 풍림푸드 — 관리자 전용 페이지
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

