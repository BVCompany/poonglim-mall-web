/**
 * Admin Logout Handler
 * 
 * Handles admin logout by destroying the session.
 */

import type { Route } from "./+types/logout";
import { destroyAdminSession } from "../utils/auth.server";

/**
 * Action: Handle logout
 */
export async function action({ request }: Route.ActionArgs) {
  return destroyAdminSession(request);
}

/**
 * Loader: Redirect to login if accessed via GET
 */
export async function loader() {
  return { redirect: "/admin/login" };
}

/**
 * Logout Component (not rendered)
 */
export default function AdminLogout() {
  return null;
}

