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

  // 파비콘
  FAVICON:              "favicon",
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];
