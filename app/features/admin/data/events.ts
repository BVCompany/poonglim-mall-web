/**
 * Admin Event/Notice Mock Data
 * 
 * Temporary event and notice data for admin panel.
 * TODO: Replace with Supabase queries when DB is configured.
 */

import type { AdminEvent } from "../types/event.types";

export const MOCK_EVENTS: AdminEvent[] = [
  {
    id: "event-001",
    title: "신제품 출시 기념 이벤트",
    description: "새로운 프리미엄 액란 제품 출시를 기념하여 특별 할인 이벤트를 진행합니다",
    category: "event",
    image: "https://images.unsplash.com/photo-1513128034602-7814ccaddd4e?w=400",
    tags: ["할인", "신제품", "프로모션"],
    badge: "hot",
    status: "active",
    startDate: "2024-01-01",
    endDate: "2024-01-31",
    created_at: "2023-12-25T00:00:00Z",
    updated_at: "2024-01-08T00:00:00Z",
  },
  {
    id: "event-002",
    title: "겨울 시즌 특별 프로모션",
    description: "따뜻한 겨울을 위한 푸딩 제품 할인 행사",
    category: "promotion",
    image: "https://images.unsplash.com/photo-1543362906-acfc16c67564?w=400",
    tags: ["겨울", "할인", "푸딩"],
    badge: "ending-soon",
    status: "active",
    startDate: "2023-12-01",
    endDate: "2024-01-15",
    created_at: "2023-11-25T00:00:00Z",
    updated_at: "2024-01-05T00:00:00Z",
  },
  {
    id: "event-003",
    title: "[공지] 설 연휴 배송 안내",
    description: "설 연휴 기간 동안의 주문 및 배송 일정을 안내드립니다",
    category: "notice",
    image: "https://images.unsplash.com/photo-1464639351491-a172c2aa2911?w=400",
    tags: ["공지", "배송", "연휴"],
    badge: "important",
    status: "active",
    startDate: "2024-01-20",
    endDate: "2024-02-15",
    created_at: "2024-01-08T00:00:00Z",
    updated_at: "2024-01-08T00:00:00Z",
  },
  {
    id: "event-004",
    title: "레시피 콘테스트 개최",
    description: "풍림푸드 제품을 활용한 창의적인 레시피를 공모합니다",
    category: "event",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
    tags: ["레시피", "콘테스트", "이벤트"],
    badge: "new",
    status: "active",
    startDate: "2024-01-05",
    endDate: "2024-02-29",
    created_at: "2024-01-05T00:00:00Z",
    updated_at: "2024-01-08T00:00:00Z",
  },
  {
    id: "event-005",
    title: "B2B 파트너사 모집 공고",
    description: "함께 성장할 B2B 파트너사를 모집합니다",
    category: "news",
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400",
    tags: ["B2B", "파트너", "모집"],
    status: "active",
    startDate: "2024-01-01",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-07T00:00:00Z",
  },
  {
    id: "event-006",
    title: "공장 견학 프로그램 안내",
    description: "풍림푸드 공장을 직접 방문하여 제조 과정을 체험해보세요",
    category: "notice",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400",
    tags: ["견학", "공장", "체험"],
    status: "active",
    startDate: "2024-01-10",
    created_at: "2024-01-08T00:00:00Z",
    updated_at: "2024-01-08T00:00:00Z",
  },
];

