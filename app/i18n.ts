/**
 * Internationalization (i18n) Configuration
 * 
 * This file defines the core configuration for the application's
 * internationalization using i18next. It specifies supported languages,
 * fallback language, and the default namespace for translations.
 */

/**
 * List of supported languages on the public site (Korean + English only).
 */
export const supportedLngs = ["ko", "en"] as const;

/**
 * Default i18next configuration
 * This is used by both client and server rendering to ensure consistent
 * translation behavior throughout the application.
 */
export default {
  // List of languages the application supports
  supportedLngs,
  
  // Fallback language when user's preferred language is not supported
  // 한국 사이트이므로 신호(쿠키·Accept-Language)가 없을 때는 한국어로 표시한다.
  fallbackLng: "ko",
  
  // The default namespace for translations
  // All general translations are stored in the 'common' namespace
  defaultNS: "common",
};
