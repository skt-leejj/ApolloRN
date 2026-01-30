/**
 * External Calendar Types
 *
 * Google, Outlook, CalDAV 등 외부 캘린더 연동 관련 타입.
 */

import type { CalendarItem } from './CalendarModels';

// ============================================================
// 외부 캘린더 프로바이더
// ============================================================

/** 외부 캘린더 제공자 */
export type ExternalCalendarProvider =
  | 'google'
  | 'outlook'
  | 'caldav';

/** 외부 캘린더 연결 상태 */
export interface ExternalCalendarStatus {
  connected: boolean;
  email?: string;
  lastSyncDate?: string;
}

/** 외부 캘린더 연결 정보 */
export interface ExternalCalendarConnection {
  provider: ExternalCalendarProvider;
  email: string;
  calendars: CalendarItem[];
}

// ============================================================
// OAuth
// ============================================================

/** OAuth 에러 */
export type CalendarOauthError =
  | 'cancelled'
  | 'networkError'
  | 'invalidToken'
  | 'serverError';
