/**
 * Google Analytics 4 Data API — 서버 전용
 *
 * 환경변수가 설정된 경우 실제 GA4 데이터를 가져오고,
 * 미설정 시 데모 데이터를 반환합니다.
 *
 * 필요한 환경변수:
 *   GA4_PROPERTY_ID              — GA4 속성 ID (예: "123456789")
 *   GA4_SERVICE_ACCOUNT_EMAIL    — 서비스 계정 이메일
 *   GA4_SERVICE_ACCOUNT_PRIVATE_KEY — 서비스 계정 개인 키 (줄바꿈 \n 포함)
 */

export interface AnalyticsData {
  realtimeUsers: number;
  todayUsers: number;
  todayUsersChange: number;   // 전일 대비 % (소수점 1자리)
  weekUsers: number;
  weekUsersChange: number;    // 전주 대비 %
  isDemo: boolean;
}

// ─── 데모 데이터 ──────────────────────────────────────────────────────────────
const DEMO: AnalyticsData = {
  realtimeUsers: 3,
  todayUsers: 127,
  todayUsersChange: 12.5,
  weekUsers: 892,
  weekUsersChange: 8.3,
  isDemo: true,
};

// ─── GA4 실제 데이터 조회 ─────────────────────────────────────────────────────
export async function getAnalyticsData(): Promise<AnalyticsData> {
  const propertyId = process.env.GA4_PROPERTY_ID;
  const email      = process.env.GA4_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GA4_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");

  // 환경변수 미설정 시 데모 데이터 반환
  if (!propertyId || !email || !privateKey) {
    return DEMO;
  }

  try {
    const { BetaAnalyticsDataClient } = await import("@google-analytics/data");

    const client = new BetaAnalyticsDataClient({
      credentials: { client_email: email, private_key: privateKey },
    });

    // 실시간 접속자
    const [realtimeRes] = await client.runRealtimeReport({
      property: `properties/${propertyId}`,
      metrics: [{ name: "activeUsers" }],
    });
    const realtimeUsers = Number(realtimeRes.rows?.[0]?.metricValues?.[0]?.value ?? 0);

    // 오늘 / 어제 방문자
    const [dailyRes] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        { startDate: "today",     endDate: "today" },
        { startDate: "yesterday", endDate: "yesterday" },
      ],
      metrics: [{ name: "activeUsers" }],
    });
    const todayUsers     = Number(dailyRes.rows?.[0]?.metricValues?.[0]?.value ?? 0);
    const yesterdayUsers = Number(dailyRes.rows?.[1]?.metricValues?.[0]?.value ?? 1);
    const todayUsersChange = yesterdayUsers
      ? Math.round(((todayUsers - yesterdayUsers) / yesterdayUsers) * 1000) / 10
      : 0;

    // 이번 주 / 지난 주 방문자
    const [weeklyRes] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        { startDate: "7daysAgo", endDate: "today" },
        { startDate: "14daysAgo", endDate: "8daysAgo" },
      ],
      metrics: [{ name: "activeUsers" }],
    });
    const weekUsers      = Number(weeklyRes.rows?.[0]?.metricValues?.[0]?.value ?? 0);
    const lastWeekUsers  = Number(weeklyRes.rows?.[1]?.metricValues?.[0]?.value ?? 1);
    const weekUsersChange = lastWeekUsers
      ? Math.round(((weekUsers - lastWeekUsers) / lastWeekUsers) * 1000) / 10
      : 0;

    return { realtimeUsers, todayUsers, todayUsersChange, weekUsers, weekUsersChange, isDemo: false };
  } catch (err) {
    console.error("[GA4] 데이터 조회 실패, 데모 데이터 사용:", err);
    return DEMO;
  }
}
