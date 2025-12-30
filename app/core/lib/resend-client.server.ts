/**
 * Email Client Module (Temporarily Disabled)
 *
 * NOTE: Resend service temporarily disabled for development
 * TODO: Replace with Korean email service (알리고, 카카오 알림톡, 네이버 클라우드 등)
 * 
 * This module creates and exports an email client for sending transactional emails
 * from the application. Originally configured with Resend, but will be replaced with
 * a Korean email service provider suitable for domestic clients.
 *
 * Recommended Korean Email Services:
 * - 알리고 (Aligo): https://smartsms.aligo.in/
 * - 카카오 알림톡: https://business.kakao.com/
 * - 네이버 클라우드 Simple & Easy Notification Service (SENS)
 * - 토스페이먼츠 알림톡
 *
 * The client can be used throughout the application for sending various types of emails:
 * - Verification emails for authentication
 * - Password reset emails
 * - Welcome emails
 * - Notification emails
 * - Order confirmation emails
 * - Shipping notifications
 *
 * This is used as part of the application's communication system to deliver
 * important messages to users via email/SMS/KakaoTalk.
 */

// Resend import temporarily commented out
// import { Resend } from "resend";

/**
 * Mock Email Client (Temporary Implementation)
 * 
 * This prevents errors during development when the email service is not yet configured.
 * All email sending attempts will be logged to the console instead of actually sending.
 * 
 * When you're ready to implement the email service:
 * 1. Choose a Korean email service provider
 * 2. Install the appropriate SDK (e.g., npm install aligo-api)
 * 3. Replace this mock client with the real implementation
 * 4. Update environment variables (.env) with API keys
 * 
 * @example Future implementation with Aligo:
 * ```typescript
 * import Aligo from 'aligo-api';
 * const emailClient = new Aligo({
 *   key: process.env.ALIGO_API_KEY,
 *   userId: process.env.ALIGO_USER_ID,
 * });
 * ```
 */
const resendClient = {
  emails: {
    send: async (params: any) => {
      // Log email attempt for debugging
      console.log("📧 [Mock Email] Would send email:", {
        from: params.from,
        to: params.to,
        subject: params.subject,
        // Don't log full content to keep logs clean
      });
      
      // Return mock success response that matches Resend's response format
      return {
        data: { id: `mock-email-${Date.now()}` },
        error: null,
      };
    },
  },
};

export default resendClient;
