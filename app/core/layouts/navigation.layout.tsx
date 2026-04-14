import type { Route } from "./+types/navigation.layout";

import type { CSSProperties } from "react";
import { Suspense } from "react";
import { Await, Outlet } from "react-router";

import Footer from "../components/footer";
import FloatingButton from "../components/floating-button";
import { NavigationBar } from "../components/navigation-bar";
import makeServerClient from "../lib/supa-client.server";
import { getActiveCategories } from "~/features/product-categories/lib/queries.server";
import { getActiveRecipeCategories } from "~/features/recipe-categories/lib/queries.server";

export async function loader({ request }: Route.LoaderArgs) {
  // 제품·레시피 카테고리 (DB 오류 시 빈 배열 fallback)
  const [productCategories, recipeCategories] = await Promise.all([
    getActiveCategories().catch(() => []),
    getActiveRecipeCategories().catch(() => []),
  ]);

  try {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      const [client] = makeServerClient(request);
      const userPromise = client.auth.getUser();
      return { userPromise, productCategories, recipeCategories };
    }
  } catch {
    // Supabase 미설정 시 무시
  }

  const mockUserPromise = Promise.resolve({ data: { user: null }, error: null });
  return { userPromise: mockUserPromise, productCategories, recipeCategories };
}

/** 사이트 공통: 본문(셸)과 헤더 배경을 동일 톤으로 통일 (#F4F2E5) */
const SITE_CHROME = {
  shell: "#F4F2E5",
  header: "#F4F2E5",
} as const;

export default function NavigationLayout({ loaderData }: Route.ComponentProps) {
  const { userPromise, productCategories, recipeCategories } = loaderData;
  const chrome = SITE_CHROME;

  return (
    <div
      className="flex min-h-screen w-full flex-col justify-between"
      style={
        {
          backgroundColor: chrome.shell,
          "--site-chrome-bg": chrome.shell,
          "--site-chrome-header-bg": chrome.header,
          overflowX: "clip",
        } as CSSProperties
      }
    >
      <Suspense fallback={<NavigationBar loading={true} productCategories={[]} recipeCategories={[]} />}>
        <Await resolve={userPromise}>
          {({ data: { user } }) =>
            user === null ? (
              <NavigationBar
                loading={false}
                productCategories={productCategories}
                recipeCategories={recipeCategories}
              />
            ) : (
              <NavigationBar
                name={user.user_metadata.name || "Anonymous"}
                email={user.email}
                avatarUrl={user.user_metadata.avatar_url}
                loading={false}
                productCategories={productCategories}
                recipeCategories={recipeCategories}
              />
            )
          }
        </Await>
      </Suspense>
      <div className="mt-[var(--header-height)] w-full flex-1">
        <div
          className="pc-fluid-root mx-auto w-full max-w-[1920px]"
          style={{ overflowX: "clip" }}
        >
          <Outlet />
        </div>
      </div>
      <Footer />
      <FloatingButton />
    </div>
  );
}
