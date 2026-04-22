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
  // English is used as the default fallback
  fallbackLng: "en",
  
  // The default namespace for translations
  // All general translations are stored in the 'common' namespace
  defaultNS: "common",
};
