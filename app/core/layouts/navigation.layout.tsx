import type { Route } from "./+types/navigation.layout";

import { Suspense } from "react";
import { Await, Outlet } from "react-router";

import Footer from "../components/footer";
import FloatingButton from "../components/floating-button";
import { NavigationBar } from "../components/navigation-bar";
import makeServerClient from "../lib/supa-client.server";

export async function loader({ request }: Route.LoaderArgs) {
  // NOTE: Supabase temporarily disabled - return mock data
  // TODO: Re-enable when Supabase credentials are available
  
  try {
    // Check if Supabase is configured
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      const [client] = makeServerClient(request);
      const userPromise = client.auth.getUser();
      return { userPromise };
    }
  } catch (error) {
    console.log("Supabase not configured, using mock data");
  }
  
  // Return mock user promise for development without Supabase
  const mockUserPromise = Promise.resolve({ data: { user: null }, error: null });
  return { userPromise: mockUserPromise };
}

export default function NavigationLayout({ loaderData }: Route.ComponentProps) {
  const { userPromise } = loaderData;
  return (
    <div className="flex min-h-screen w-full flex-col justify-between" style={{ backgroundColor: "#F4F2E5" }}>
      {/* 헤더: max-w 밖에서 풀 너비 (모바일 뷰포트 전체) */}
      <Suspense fallback={<NavigationBar loading={true} />}>
        <Await resolve={userPromise}>
          {({ data: { user } }) =>
            user === null ? (
              <NavigationBar loading={false} />
            ) : (
              <NavigationBar
                name={user.user_metadata.name || "Anonymous"}
                email={user.email}
                avatarUrl={user.user_metadata.avatar_url}
                loading={false}
              />
            )
          }
        </Await>
      </Suspense>
      {/* 콘텐츠: max-w 적용 */}
      <div className="mt-[var(--header-height)] w-full flex-1">
        <div className="mx-auto w-full max-w-[1920px]">
          <Outlet />
        </div>
      </div>
      <Footer />
      <FloatingButton />
    </div>
  );
}
