/**
 * Admin Index Route
 * 
 * Redirects to appropriate page based on authentication status:
 * - Not authenticated -> /admin/login
 * - Authenticated -> /admin/dashboard
 */

import { redirect } from "react-router";
import type { Route } from "./+types/index";
import { getAdminUser } from "../utils/auth.server";

/**
 * Loader: Check authentication and redirect
 */
export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await getAdminUser(request);
  
  if (!adminUser) {
    // Not authenticated, redirect to login
    throw redirect("/admin/login");
  }
  
  // Authenticated, redirect to dashboard
  throw redirect("/admin/dashboard");
}

/**
 * Component (never rendered due to loader redirect)
 */
export default function AdminIndex() {
  return null;
}

