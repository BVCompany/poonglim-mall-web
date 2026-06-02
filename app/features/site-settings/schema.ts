/**
 * Site Settings Schema
 *
 * 사이트 전반의 설정을 키-값으로 저장하는 테이블
 *
 * 사용 예시:
 *   key: "company_intro_image"  value: "https://..."
 *   key: "company_intro_title"  value: "30년간 축적된 노하우와..."
 *   key: "company_intro_link"   value: "/brand/intro"
 *
 * RLS 전략:
 *   - anon: SELECT만 허용 (공개 설정 읽기)
 *   - 관리자 CRUD: service_role (RLS 우회)
 */
import { sql } from "drizzle-orm";
import { pgPolicy, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { anonRole } from "drizzle-orm/supabase";

export const siteSettings = pgTable(
  "site_settings",
  {
    key: text().primaryKey(),
    value: text(),
    updated_at: timestamp().notNull().defaultNow(),
  },
  () => [
    pgPolicy("site-settings-anon-select", {
      for: "select",
      to: anonRole,
      as: "permissive",
      using: sql`true`,
    }),
  ],
);

/** 관리 가능한 설정 키 목록 */
export const SETTING_KEYS = {
  // 회사소개 섹션
  COMPANY_INTRO_IMAGE:   "company_intro_image",
  COMPANY_INTRO_TITLE:   "company_intro_title",
  COMPANY_INTRO_LINK:    "company_intro_link",

  // SEO — 기본 메타 정보
  SEO_SITE_NAME:        "seo_site_name",
  SEO_DESCRIPTION:      "seo_description",
  SEO_OG_IMAGE:         "seo_og_image",
  SEO_SITE_URL:         "seo_site_url",

  // SEO — 검색엔진 인증
  SEO_GOOGLE_VERIFICATION:  "seo_google_verification",
  SEO_NAVER_VERIFICATION:   "seo_naver_verification",

  // SEO — Analytics
  SEO_GA_ID:            "seo_ga_id",

  // SEO — robots
  SEO_ROBOTS:           "seo_robots",   // "index,follow" | "noindex,nofollow"

  /** `<meta name="viewport" content="…">` 전체 content 문자열. 비우면 `width=device-width, initial-scale=1` */
  SEO_VIEWPORT_CONTENT: "seo_viewport_content",

  /** `<meta name="keywords" content="…">` */
  SEO_META_KEYWORDS:    "seo_meta_keywords",

  /** `<meta name="author" content="…">` */
  SEO_META_AUTHOR:      "seo_meta_author",

  /**
   * `<meta http-equiv="Content-Type" content="…">` 의 content 값만 저장 (예: text/html; charset=utf-8).
   * 비우면 태그 미출력(문서는 이미 `<meta charSet="utf-8" />` 사용).
   */
  SEO_HTTP_EQUIV_CONTENT_TYPE: "seo_http_equiv_content_type",

  // 파비콘
  FAVICON:              "favicon",

  // 공장 견학 신청 — 운영 시기에 따라 신청 폼 on/off
  /** "true" | "false" — 비우면 활성(true)으로 간주 */
  FACTORY_TOUR_ENABLED:          "factory_tour_enabled",
  /** 비활성 시 노출할 안내 문구 (비우면 i18n 기본 문구 사용) */
  FACTORY_TOUR_DISABLED_MESSAGE: "factory_tour_disabled_message",
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];
