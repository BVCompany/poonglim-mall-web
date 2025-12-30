import type { Route } from "./+types/navigation.layout";

import { Suspense } from "react";
import { Await, Outlet } from "react-router";

import Footer from "../components/footer";
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
    <div className="flex min-h-screen flex-col justify-between">
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
      {/* Add padding-top to account for two-tier fixed header (h-10 + h-16 = 104px) */}
      <div className="mt-[104px] w-full">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
