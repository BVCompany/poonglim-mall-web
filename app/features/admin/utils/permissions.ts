import {
  ADMIN_PERMISSIONS,
  type AdminUser,
  ROLE_PERMISSIONS,
} from "../types/auth.types";

const LEGACY_PERMISSION_GROUPS: Record<string, string[]> = {
  posts: [
    ADMIN_PERMISSIONS.NOTICES,
    ADMIN_PERMISSIONS.GRADE_CERTIFICATES,
    ADMIN_PERMISSIONS.FAQS,
    ADMIN_PERMISSIONS.CERTIFICATIONS,
    ADMIN_PERMISSIONS.EVENTS,
    ADMIN_PERMISSIONS.RECIPES,
    ADMIN_PERMISSIONS.RECIPE_CATEGORIES,
    ADMIN_PERMISSIONS.NEWS,
    ADMIN_PERMISSIONS.CATALOG,
    ADMIN_PERMISSIONS.RESOURCES,
  ],
  inquiries: [
    ADMIN_PERMISSIONS.CONSULTING_INQUIRIES,
    ADMIN_PERMISSIONS.FACTORY_TOURS,
  ],
  settings: [ADMIN_PERMISSIONS.POPUPS, ADMIN_PERMISSIONS.SEO],
};

export const ADMIN_MENU_OPTIONS: { value: string; label: string }[] = [
  { value: ADMIN_PERMISSIONS.PRODUCTS, label: "제품 관리" },
  { value: ADMIN_PERMISSIONS.PRODUCT_CATEGORIES, label: "제품 카테고리" },
  { value: ADMIN_PERMISSIONS.NOTICES, label: "공지사항" },
  { value: ADMIN_PERMISSIONS.GRADE_CERTIFICATES, label: "등급판정서" },
  { value: ADMIN_PERMISSIONS.FAQS, label: "FAQ" },
  { value: ADMIN_PERMISSIONS.CERTIFICATIONS, label: "품질 & 인증" },
  { value: ADMIN_PERMISSIONS.EVENTS, label: "이벤트" },
  { value: ADMIN_PERMISSIONS.RECIPES, label: "레시피" },
  { value: ADMIN_PERMISSIONS.RECIPE_CATEGORIES, label: "레시피 카테고리" },
  { value: ADMIN_PERMISSIONS.NEWS, label: "뉴스/보도자료" },
  { value: ADMIN_PERMISSIONS.CATALOG, label: "카탈로그" },
  { value: ADMIN_PERMISSIONS.RESOURCES, label: "자료실" },
  { value: ADMIN_PERMISSIONS.CAREERS, label: "채용 공고" },
  { value: ADMIN_PERMISSIONS.APPLICATIONS, label: "지원서" },
  { value: ADMIN_PERMISSIONS.CONSULTING_INQUIRIES, label: "상담 문의" },
  { value: ADMIN_PERMISSIONS.FACTORY_TOURS, label: "견학 신청" },
  { value: ADMIN_PERMISSIONS.BANNERS, label: "메인 배너" },
  { value: ADMIN_PERMISSIONS.PAGE_BANNERS, label: "페이지 배너" },
  { value: ADMIN_PERMISSIONS.SITE_HOME, label: "홈 섹션" },
  { value: ADMIN_PERMISSIONS.INSTAGRAM, label: "인스타그램" },
  { value: ADMIN_PERMISSIONS.POPUPS, label: "팝업" },
  { value: ADMIN_PERMISSIONS.SEO, label: "사이트/SEO 설정" },
];

export const CRUD_OPERATIONS = ["read", "create", "update", "delete"] as const;
export type CrudOperation = (typeof CRUD_OPERATIONS)[number];

export const CRUD_OPERATION_LABELS: Record<CrudOperation, string> = {
  read: "조회",
  create: "생성",
  update: "수정",
  delete: "삭제",
};

export const ADMIN_PERMISSION_OPTIONS = ADMIN_MENU_OPTIONS.flatMap((menu) =>
  CRUD_OPERATIONS.map((operation) => ({
    value: `${menu.value}.${operation}`,
    label: `${menu.label} - ${CRUD_OPERATION_LABELS[operation]}`,
    menu: menu.value,
    operation,
  })),
);

const ADMIN_PERMISSION_LABELS: Record<string, string> = {
  ...Object.fromEntries(
    ADMIN_PERMISSION_OPTIONS.map((option) => [option.value, option.label]),
  ),
  news: "뉴스/보도자료 관리",
  notices: "공지사항 관리",
  support: "자료실 관리",
  certifications: "품질 & 인증 관리",
  grade_certificates: "등급판정서 관리",
  catalog: "카탈로그 관리",
  applications: "지원서 관리",
  manage_products: "제품 관리",
  manage_recipes: "레시피 관리",
  manage_events: "이벤트/공지 관리",
  manage_news: "뉴스/보도자료 관리",
  manage_blog: "게시물 관리",
  manage_applications: "지원서 관리",
  manage_inquiries: "고객 문의",
  manage_banners: "배너/홈 관리",
  manage_settings: "사이트 설정",
  manage_admins: "관리자 관리",
  products: "제품 관리",
  product_categories: "제품 카테고리",
  recipes: "레시피 관리",
  recipe_categories: "레시피 카테고리",
  events: "이벤트 관리",
  careers: "채용 공고 관리",
  inquiries: "고객 문의 전체 관리",
  consulting_inquiries: "상담 문의 관리",
  factory_tours: "견학 신청 관리",
  banners: "메인 배너 관리",
  page_banners: "페이지 배너 관리",
  site_home: "홈 섹션 관리",
  instagram: "인스타그램 관리",
  popups: "팝업 관리",
  seo: "사이트/SEO 설정",
  faqs: "FAQ 관리",
  resources: "자료실 관리",
  admins: "관리자 관리",
  audit_logs: "변경 이력",
  posts: "게시물 전체 관리",
  settings: "사이트 설정 전체 관리",
};

function permissionMatches(granted: string[], required: string): boolean {
  if (granted.includes(required)) return true;
  const [requiredMenu] = required.split(".");
  // 기존 메뉴 단위 권한은 배포 후 권한을 다시 저장하기 전까지 전체 CRUD로 해석한다.
  if (requiredMenu && granted.includes(requiredMenu)) return true;
  return Object.entries(LEGACY_PERMISSION_GROUPS).some(
    ([legacy, children]) =>
      granted.includes(legacy) &&
      children.some(
        (child) => required === child || required.startsWith(`${child}.`),
      ),
  );
}

export function getPermissionLabel(permission: string): string {
  const normalized = permission.trim();
  const directLabel = ADMIN_PERMISSION_LABELS[normalized];
  if (directLabel) return directLabel;

  const separatorIndex = normalized.lastIndexOf(".");
  if (separatorIndex > 0) {
    const menu = normalized.slice(0, separatorIndex);
    const operation = normalized.slice(separatorIndex + 1) as CrudOperation;
    const menuLabel =
      ADMIN_MENU_OPTIONS.find((option) => option.value === menu)?.label ??
      ADMIN_PERMISSION_LABELS[menu];
    const operationLabel = CRUD_OPERATION_LABELS[operation];
    if (menuLabel && operationLabel) {
      return `${menuLabel} - ${operationLabel}`;
    }
  }

  if (normalized.startsWith("upload:")) {
    const menu = normalized.slice("upload:".length);
    return `${ADMIN_PERMISSION_LABELS[menu] ?? menu} 파일 업로드`;
  }

  return normalized || "권한 없음";
}

export function hasPermission(
  adminUser: AdminUser,
  permission: string,
): boolean {
  if (adminUser.role === "super_admin") return true;

  const userPermissions = adminUser.permissions;
  if (userPermissions) {
    return permissionMatches(userPermissions, permission);
  }

  const rolePermissions = ROLE_PERMISSIONS[adminUser.role] || [];
  return permissionMatches(rolePermissions, permission);
}

export function menuPermission(
  menu: string,
  operation: CrudOperation,
): string {
  return `${menu}.${operation}`;
}

export function hasAnyMenuPermission(
  adminUser: AdminUser,
  menu: string,
): boolean {
  return CRUD_OPERATIONS.some((operation) =>
    hasPermission(adminUser, menuPermission(menu, operation)),
  );
}

export function expandPermissionsForEditing(granted: string[]): string[] {
  return ADMIN_PERMISSION_OPTIONS.filter((option) =>
    permissionMatches(granted, option.value),
  ).map((option) => option.value);
}
