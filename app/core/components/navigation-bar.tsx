/**
 * Navigation Bar Component
 *
 * A responsive navigation header that adapts to different screen sizes and user authentication states.
 * This component provides the main navigation interface for the application, including:
 *
 * - Responsive design with desktop and mobile layouts
 * - User authentication state awareness (logged in vs. logged out)
 * - User profile menu with avatar and dropdown options
 * - Theme switching functionality
 * - Language switching functionality
 * - Mobile-friendly navigation drawer
 *
 * The component handles different states:
 * - Loading state with skeleton placeholders
 * - Authenticated state with user profile information
 * - Unauthenticated state with sign in/sign up buttons
 */
import {
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CogIcon,
  HomeIcon,
  LogOutIcon,
  MenuIcon,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import LangSwitcher from "./lang-switcher";
import ThemeSwitcher from "./theme-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Separator } from "./ui/separator";
import {
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTrigger,
} from "./ui/sheet";

/**
 * UserMenu Component
 *
 * Displays the authenticated user's profile menu with avatar and dropdown options.
 * This component is shown in the navigation bar when a user is logged in and provides
 * quick access to user-specific actions and information.
 *
 * Features:
 * - Avatar display with image or fallback initials
 * - User name and email display
 * - Quick navigation to dashboard
 * - Logout functionality
 *
 * @param name - The user's display name
 * @param email - The user's email address (optional)
 * @param avatarUrl - URL to the user's avatar image (optional)
 * @returns A dropdown menu component with user information and actions
 */
function UserMenu({
  name,
  email,
  avatarUrl,
}: {
  name: string;
  email?: string;
  avatarUrl?: string | null;
}) {
  return (
    <DropdownMenu>
      {/* Avatar as the dropdown trigger */}
      <DropdownMenuTrigger asChild>
        <Avatar className="size-8 cursor-pointer rounded-lg">
          <AvatarImage src={avatarUrl ?? undefined} />
          <AvatarFallback>{name.slice(0, 2)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      {/* Dropdown content with user info and actions */}
      <DropdownMenuContent className="w-56">
        {/* User information display */}
        <DropdownMenuLabel className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold">{name}</span>
          <span className="truncate text-xs">{email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Dashboard link */}
        <DropdownMenuItem asChild>
          <SheetClose asChild>
            <Link to="/dashboard" viewTransition>
              <HomeIcon className="size-4" />
              Dashboard
            </Link>
          </SheetClose>
        </DropdownMenuItem>

        {/* Logout link */}
        <DropdownMenuItem asChild>
          <SheetClose asChild>
            <Link to="/logout" viewTransition>
              <LogOutIcon className="size-4" />
              Log out
            </Link>
          </SheetClose>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * AuthButtons Component
 *
 * Displays authentication buttons (Sign in and Sign up) for unauthenticated users.
 * This component is shown in the navigation bar when no user is logged in and provides
 * quick access to authentication screens.
 *
 * Features:
 * - Sign in button with ghost styling (less prominent)
 * - Sign up button with default styling (more prominent)
 * - View transitions for smooth navigation to auth screens
 * - Compatible with mobile navigation drawer (SheetClose integration)
 *
 * @returns Fragment containing sign in and sign up buttons
 */
function AuthButtons() {
  return (
    <>
      {/* Sign in button (less prominent) */}
      <Button variant="ghost" asChild>
        <SheetClose asChild>
          <Link to="/login" viewTransition>
            Sign in
          </Link>
        </SheetClose>
      </Button>

      {/* Sign up button (more prominent) */}
      <Button variant="default" asChild>
        <SheetClose asChild>
          <Link to="/join" viewTransition>
            Sign up
          </Link>
        </SheetClose>
      </Button>
    </>
  );
}

/**
 * Actions Component
 *
 * Displays utility actions and settings in the navigation bar, including:
 * - Debug/settings dropdown menu with links to monitoring tools
 * - Theme switcher for toggling between light and dark mode
 * - Language switcher for changing the application language
 *
 * This component is shown in the navigation bar for all users regardless of
 * authentication state and provides access to application-wide settings and tools.
 *
 * @returns Fragment containing settings dropdown, theme switcher, and language switcher
 */
function Actions() {
  return (
    <>
      {/* Settings/debug dropdown menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="cursor-pointer">
          <Button variant="ghost" size="icon">
            <CogIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* Sentry monitoring link */}
          <DropdownMenuItem asChild>
            <SheetClose asChild>
              <Link to="/debug/sentry" viewTransition>
                Sentry
              </Link>
            </SheetClose>
          </DropdownMenuItem>
          {/* Google Analytics link */}
          <DropdownMenuItem asChild>
            <SheetClose asChild>
              <Link to="/debug/analytics" viewTransition>
                Google Tag
              </Link>
            </SheetClose>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Theme switcher component (light/dark mode) */}
      <ThemeSwitcher />

      {/* Language switcher component */}
      <LangSwitcher />
    </>
  );
}

/**
 * Main Navigation Menu Structure
 * Defines the GNB (Global Navigation Bar) menu items with their sub-menus
 */
interface MenuItem {
  label: string;
  path?: string;
  subItems?: { label: string; path: string }[];
}

/**
 * Desktop Navigation Menu Component
 * Displays the main menu with dropdown submenus on desktop
 */
function DesktopNavigation() {
  const { t } = useTranslation();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const menuItems: MenuItem[] = [
    {
      label: t("navigation.brand.title"),
      subItems: [
        { label: t("navigation.brand.intro"), path: "/brand/intro" },
        { label: t("navigation.brand.history"), path: "/brand/history" },
        {
          label: t("navigation.brand.certifications"),
          path: "/brand/certifications",
        },
        {
          label: t("navigation.brand.factoryTour"),
          path: "/brand/factory-tour",
        },
      ],
    },
    {
      label: t("navigation.products.title"),
      subItems: [
        {
          label: t("navigation.products.all"),
          path: "/products/all",
        },
        {
          label: t("navigation.products.liquidEggs"),
          path: "/products/liquid-eggs",
        },
        {
          label: t("navigation.products.puddings"),
          path: "/products/puddings",
        },
        {
          label: t("navigation.products.convenience"),
          path: "/products/convenience",
        },
      ],
    },
    {
      label: t("navigation.recipe.title"),
      subItems: [
        { label: t("navigation.recipe.all"), path: "/recipe/main" },
        { label: t("navigation.recipe.home"), path: "/recipe/easy" },
        { label: t("navigation.recipe.cafe"), path: "/recipe/dessert" },
        {
          label: t("navigation.recipe.restaurant"),
          path: "/recipe/restaurant",
        },
      ],
    },
    {
      label: t("navigation.event.title"),
      path: "/event",
      subItems: undefined,
    },
    {
      label: t("navigation.inquiry.title"),
      subItems: [
        { label: t("navigation.inquiry.general"), path: "/inquiry/online" },
        { label: t("navigation.inquiry.b2b"), path: "/inquiry/bulk" },
      ],
    },
    {
      label: t("navigation.support.title"),
      path: "/support",
      subItems: undefined,
    },
    {
      label: t("navigation.careers.title"),
      subItems: [
        {
          label: t("navigation.careers.positions"),
          path: "/careers/positions",
        },
        {
          label: t("navigation.careers.benefits"),
          path: "/careers/benefits",
        },
        { label: t("navigation.careers.talent"), path: "/careers/talent" },
      ],
    },
  ];

  return (
    <>
      {menuItems.map((item) => (
        <div
          key={item.label}
          className="group relative"
          onMouseEnter={() => item.subItems && setOpenMenu(item.label)}
          onMouseLeave={() => setOpenMenu(null)}
        >
          {item.subItems ? (
            <button className="text-foreground hover:text-primary flex items-center gap-1 text-sm leading-6 font-medium whitespace-nowrap transition-colors">
              {item.label}
              <ChevronDownIcon className="h-3.5 w-3.5" />
            </button>
          ) : (
            <Link
              to={item.path!}
              viewTransition
              className="text-foreground hover:text-primary flex items-center gap-1 text-sm leading-6 font-medium whitespace-nowrap transition-colors"
            >
              {item.label}
            </Link>
          )}

          {item.subItems && openMenu === item.label && (
            <div className="visible absolute top-full left-0 pt-2 opacity-100 transition-all duration-200">
              <div className="bg-background border-border min-w-[180px] rounded-lg border py-2 shadow-lg">
                {item.subItems.map((subItem) => (
                  <Link
                    key={subItem.path}
                    to={subItem.path}
                    viewTransition
                    className="text-foreground hover:bg-muted hover:text-primary block px-4 py-2.5 text-sm transition-colors"
                  >
                    {subItem.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </>
  );
}

/**
 * Mobile Navigation Menu Component
 * Displays the mobile menu with collapsible sections
 */
function MobileNavigation() {
  const { t } = useTranslation();
  const [openSections, setOpenSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section],
    );
  };

  const menuItems: MenuItem[] = [
    {
      label: t("navigation.brand.title"),
      subItems: [
        { label: t("navigation.brand.intro"), path: "/brand/intro" },
        { label: t("navigation.brand.history"), path: "/brand/history" },
        {
          label: t("navigation.brand.certifications"),
          path: "/brand/certifications",
        },
        {
          label: t("navigation.brand.factoryTour"),
          path: "/brand/factory-tour",
        },
      ],
    },
    {
      label: t("navigation.products.title"),
      subItems: [
        {
          label: t("navigation.products.all"),
          path: "/products/all",
        },
        {
          label: t("navigation.products.liquidEggs"),
          path: "/products/liquid-eggs",
        },
        {
          label: t("navigation.products.puddings"),
          path: "/products/puddings",
        },
        {
          label: t("navigation.products.convenience"),
          path: "/products/convenience",
        },
      ],
    },
    {
      label: t("navigation.recipe.title"),
      subItems: [
        { label: t("navigation.recipe.all"), path: "/recipe/main" },
        { label: t("navigation.recipe.home"), path: "/recipe/easy" },
        { label: t("navigation.recipe.cafe"), path: "/recipe/dessert" },
        {
          label: t("navigation.recipe.restaurant"),
          path: "/recipe/restaurant",
        },
      ],
    },
    {
      label: t("navigation.event.title"),
      path: "/event",
      subItems: undefined,
    },
    {
      label: t("navigation.inquiry.title"),
      subItems: [
        { label: t("navigation.inquiry.general"), path: "/inquiry/online" },
        { label: t("navigation.inquiry.b2b"), path: "/inquiry/bulk" },
      ],
    },
    {
      label: t("navigation.support.title"),
      path: "/support",
      subItems: undefined,
    },
    {
      label: t("navigation.careers.title"),
      subItems: [
        {
          label: t("navigation.careers.positions"),
          path: "/careers/positions",
        },
        {
          label: t("navigation.careers.benefits"),
          path: "/careers/benefits",
        },
        { label: t("navigation.careers.talent"), path: "/careers/talent" },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      {/* 풍림몰 버튼 - 모바일 */}
      <SheetClose asChild>
        <Link
          to="/"
          className="mb-4 flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium text-white transition-all"
          style={{ backgroundColor: "#1F4E3A" }}
        >
          {t("navigation.mall")}
          <ArrowRightIcon className="size-4" />
        </Link>
      </SheetClose>

      {menuItems.map((item) =>
        item.subItems ? (
          <Collapsible
            key={item.label}
            open={openSections.includes(item.label)}
            onOpenChange={() => toggleSection(item.label)}
          >
            <CollapsibleTrigger className="hover:bg-accent flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium">
              {item.label}
              <ChevronDownIcon
                className={`size-4 transition-transform ${
                  openSections.includes(item.label) ? "rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4">
              {item.subItems?.map((subItem) => (
                <SheetClose key={subItem.path} asChild>
                  <Link
                    to={subItem.path}
                    viewTransition
                    className="hover:bg-accent block rounded-md px-3 py-2 text-sm"
                  >
                    {subItem.label}
                  </Link>
                </SheetClose>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <SheetClose key={item.label} asChild>
            <Link
              to={item.path!}
              viewTransition
              className="hover:bg-accent block rounded-md px-3 py-2 text-sm font-medium"
            >
              {item.label}
            </Link>
          </SheetClose>
        ),
      )}
    </div>
  );
}

/**
 * NavigationBar Component
 *
 * The main navigation header for the application that adapts to different screen sizes
 * and user authentication states. This component serves as the primary navigation
 * interface and combines several sub-components to create a complete navigation experience.
 *
 * Features:
 * - Two-tier header structure (utility bar + main navigation)
 * - Responsive design with desktop navigation and mobile drawer
 * - Application branding with localized title
 * - Main navigation links (회사소개, 제품소개, 홍보센터, 고객지원, 채용)
 * - User authentication state handling (loading, authenticated, unauthenticated)
 * - User profile menu with avatar for authenticated users
 * - Sign in/sign up buttons for unauthenticated users
 * - Theme and language switching options
 * - 풍림몰 button with signature color (#1F4E3A)
 *
 * @param name - The authenticated user's name (if available)
 * @param email - The authenticated user's email (if available)
 * @param avatarUrl - The authenticated user's avatar URL (if available)
 * @param loading - Boolean indicating if the auth state is still loading
 * @returns The complete navigation bar component
 */
export function NavigationBar({
  name,
  email,
  avatarUrl,
  loading,
}: {
  name?: string;
  email?: string;
  avatarUrl?: string | null;
  loading: boolean;
}) {
  // Get translation function for internationalization
  const { t } = useTranslation();

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 fixed top-0 z-50 w-full backdrop-blur">
      {/* Top Utility Bar - 상단 유틸리티 바 */}
      <div className="bg-muted/30 border-border/40 border-b">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-10 items-center justify-end gap-6">
            {/* 수발주시스템 */}
            <a
              href="http://wos.freshegg.co.kr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
            >
              수발주시스템
            </a>

            {/* 풍림몰 바로가기 */}
            <a
              href="https://smartstore.naver.com/poonglimfoods"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold text-white transition-all hover:opacity-90 hover:shadow-md"
              style={{ backgroundColor: "#1F4E3A" }}
            >
              {t("navigation.mall")}
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </a>

            {/* Language Switcher */}
            <LangSwitcher />

            {/* Theme Switcher */}
            <ThemeSwitcher />

            {/* Auth State */}
            {/* {loading ? (
              <div className="bg-muted-foreground/20 size-6 animate-pulse rounded-full" />
            ) : (
              <>
                {name ? (
                  <UserMenu name={name} email={email} avatarUrl={avatarUrl} />
                ) : (
                  <div className="hidden items-center gap-2 md:flex">
                    <Link
                      to="/login"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      로그인
                    </Link>
                    <span className="text-muted-foreground/50">|</span>
                    <Link
                      to="/join"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      회원가입
                    </Link>
                  </div>
                )}
              </>
            )} */}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar - 메인 네비게이션 바 */}
      <nav className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-border border-b backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between p-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="-m-1.5 shrink-0 p-1.5">
            <img
              src="/home/poonglim-logo.png"
              alt="풍림푸드"
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:gap-x-8">
            <DesktopNavigation />

            {/* Search Button */}
            <Button variant="ghost" size="icon" className="ml-2 h-9 w-9">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </Button>

            {/* Settings (Debug) - Disabled */}
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild className="cursor-pointer">
                <Button variant="ghost" size="icon">
                  <CogIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/debug/sentry" viewTransition>
                    Sentry
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/debug/analytics" viewTransition>
                    Google Tag
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}
          </div>

          {/* Mobile Menu Trigger */}
          <SheetTrigger className="size-6 md:hidden">
            <MenuIcon />
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <MobileNavigation />
            </SheetHeader>
            {loading ? (
              <div className="flex items-center">
                <div className="bg-muted-foreground h-4 w-24 animate-pulse rounded-full" />
              </div>
            ) : (
              <SheetFooter>
                {name ? (
                  <div className="grid grid-cols-3">
                    <div className="col-span-2 flex w-full justify-between">
                      <ThemeSwitcher />
                    </div>
                    <div className="flex justify-end">
                      <UserMenu
                        name={name}
                        email={email}
                        avatarUrl={avatarUrl}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-5">
                    <div className="flex justify-between">
                      <ThemeSwitcher />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <AuthButtons />
                    </div>
                  </div>
                )}
              </SheetFooter>
            )}
          </SheetContent>
        </div>
      </nav>
    </header>
  );
}
