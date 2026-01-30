/**
 * Calendar Enums & Constants
 *
 * iOS CalendarCore의 열거형을 TypeScript로 정의.
 */

// ============================================================
// 일정 상태
// ============================================================

/** 일정 컴포넌트 상태 */
export type CalendarComponentStatus =
  | 'confirmed'
  | 'tentative'
  | 'cancelled';

/** 일정 컴포넌트 타입 */
export type CalendarComponentType =
  | 'event'
  | 'todo'
  | 'journal';

// ============================================================
// 참석자
// ============================================================

/** 참석자 응답 상태 */
export type AttendeeStatus =
  | 'accepted'
  | 'declined'
  | 'tentative'
  | 'needsAction';

// ============================================================
// 반복 일정
// ============================================================

/** 반복 주기 */
export type RecurrenceFrequency =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly';

// ============================================================
// 요일
// ============================================================

/** 요일 (시작 요일 설정용) */
export type CalendarWeek =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

/** 요일 숫자 매핑 (0=일, 1=월, ..., 6=토) */
export const CALENDAR_WEEK_INDEX: Record<CalendarWeek, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

// ============================================================
// 뷰 타입
// ============================================================

/** 캘린더 뷰 타입 */
export type CalendarViewType =
  | 'month'
  | 'week'
  | 'day'
  | 'threeDays';

// ============================================================
// 동기화
// ============================================================

/** 동기화 상태 */
export type CalendarSyncState =
  | 'idle'
  | 'syncing'
  | 'success'
  | 'failed';

/** 동기화 사유 */
export type CalendarSyncReason =
  | 'manual'
  | 'auto'
  | 'push'
  | 'background';

// ============================================================
// 변경 이벤트
// ============================================================

/** 일정 변경 타입 */
export type CalendarChangeType =
  | 'create'
  | 'update'
  | 'delete';

// ============================================================
// 에러
// ============================================================

/** 캘린더 에러 코드 */
export type CalendarErrorCode =
  | 'INVALID_DATE'
  | 'NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'NETWORK_ERROR'
  | 'SYNC_ERROR'
  | 'CREATE_EVENT_ERROR'
  | 'UPDATE_EVENT_ERROR'
  | 'DELETE_EVENT_ERROR'
  | 'GET_EVENTS_ERROR'
  | 'GET_CALENDARS_ERROR'
  | 'OAUTH_ERROR'
  | 'UNKNOWN_ERROR';

/** 캘린더 UI 에러 */
export type CalendarUiError =
  | 'loadFailed'
  | 'saveFailed'
  | 'deleteFailed'
  | 'syncFailed'
  | 'permissionDenied';

// ============================================================
// 설정 그룹 타입
// ============================================================

/** 설정 화면 그룹 타입 */
export type CalendarSettingGroupType =
  | 'general'
  | 'notification'
  | 'calendar'
  | 'ai'
  | 'account'
  | 'about';
