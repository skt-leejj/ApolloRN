/**
 * Subscription Calendar & Utility Types
 *
 * 구독 캘린더 및 유틸리티 관련 타입 정의.
 */

// ============================================================
// 구독 캘린더
// ============================================================

/** 구독 가능한 캘린더 그룹 */
export interface SubscriptionCalendarGroup {
  id: string;
  name: string;
  calendars: SubscribableCalendar[];
}

/** 구독 가능한 캘린더 */
export interface SubscribableCalendar {
  /** 캘린더 href */
  href: string;
  name: string;
  description?: string;
  /** 현재 구독 중인지 여부 */
  isSubscribed: boolean;
}

// ============================================================
// 유틸리티
// ============================================================

/** 타임존 정보 */
export interface TimeZoneInfo {
  /** IANA timezone ID (e.g. "Asia/Seoul") */
  id: string;
  /** 표시 이름 (e.g. "서울 (KST)") */
  displayName: string;
  /** UTC 오프셋 (분, e.g. 540 = +09:00) */
  utcOffsetMinutes: number;
  /** 약어 (e.g. "KST") */
  abbreviation: string;
}

// ============================================================
// 텍스트 분석
// ============================================================

/** 텍스트 분석 결과 (빠른 등록) */
export interface TextAnalyzeResult {
  title: string;
  startDate?: import('./CalendarModels').CalendarDate;
  endDate?: import('./CalendarModels').CalendarDate;
  isAllDay: boolean;
  isLunar: boolean;
  recurrence?: import('./CalendarModels').CalendarRecurrence;
}
