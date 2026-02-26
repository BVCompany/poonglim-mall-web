/**
 * Admin Top Navigation Bar
 *
 * Top navigation bar for admin panel with site title and link to main website.
 */
import { ExternalLink } from "lucide-react";
import { Link } from "react-router";

export function AdminNavbar() {
  return (
    <div className="flex h-16 items-center justify-end border-b border-gray-200 bg-white px-6">
      {/* Left: Logo/Title */}

      {/* Right: Website Link */}
      <Link
        to="/"
        className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900"
      >
        <span>웹사이트 보기</span>
        <ExternalLink className="h-4 w-4" />
      </Link>
    </div>
  );
}
