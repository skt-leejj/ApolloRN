/**
 * Calendar Data Models
 *
 * iOS CalendarCore의 데이터 모델을 TypeScript로 정의.
 * Swift DTO ↔ TypeScript 인터페이스 1:1 매핑.
 */

import type {
  CalendarComponentStatus,
  AttendeeStatus,
  RecurrenceFrequency,
} from './CalendarEnums';

// ============================================================
// 기본 모델
// ============================================================

/** 일정 시작/종료 시간 (사용 빈도: 19회) */
export interface CalendarDate {
  /** ISO 8601 format (e.g. "2026-01-26T14:00:00+09:00") */
  date: string;
  /** IANA timezone (e.g. "Asia/Seoul") */
  timeZone: string;
  /** 종일 일정 여부 */
  isAllDay: boolean;
}

/** 장소 정보 (사용 빈도: 19회) */
export interface CalendarPoi {
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  /** TMap POI ID */
  poiId?: string;
}

/** 알람 시간 간격 (사용 빈도: 15회) */
export interface CalendarPeriod {
  /** 분 단위 (음수 = 이전, e.g. -30 = 30분 전) */
  minutes: number;
  /** 표시 라벨 (e.g. "30분 전") */
  label: string;
}

/** 참석자 */
export interface CalendarAttendee {
  email: string;
  name?: string;
  status: AttendeeStatus;
  isOptional: boolean;
}

/** 주최자 */
export interface CalendarOrganizer {
  email: string;
  name?: string;
}

/** 반복 일정 규칙 (사용 빈도: 12회) */
export interface CalendarRecurrence {
  frequency: RecurrenceFrequency;
  /** 반복 간격 (1 = 매일/매주, 2 = 격일/격주) */
  interval: number;
  /** 반복 종료일 (ISO 8601) */
  endDate?: string;
  /** 반복 횟수 */
  count?: number;
  /** 요일 (0=일, 1=월, ..., 6=토) */
  byWeekDay?: number[];
  /** 월 중 날짜 (e.g. 15 = 매월 15일) */
  byMonthDay?: number;
}

// ============================================================
// 캘린더 모델
// ============================================================

/** 캘린더 기본 정보 (사용 빈도: 24회) */
export interface CalendarItem {
  /** 캘린더 고유 ID (href) */
  id: string;
  name: string;
  /** HEX 색상 (e.g. "#FF5733") */
  color: string;
  groupId?: string;
  isVisible: boolean;
  isReadOnly: boolean;
  /** 외부 계정 ID (Google, Outlook 등) */
  accountId?: string;
  /** 구독 캘린더 URL */
  subscriptionUrl?: string;
}

/** 캘린더 그룹 */
export interface CalendarGroup {
  id: string;
  name: string;
  order: number;
  calendars: CalendarItem[];
  /** 외부 캘린더 계정 정보 */
  account?: string;
}

// ============================================================
// 일정 상세 모델
// ============================================================

/** 일정 상세 정보 (사용 빈도: 16회) */
export interface CalendarEventDetail {
  /** 일정 고유 ID (uniqueId) */
  id: string;
  title: string;
  startDate: CalendarDate;
  endDate: CalendarDate;
  location?: CalendarPoi;
  memo?: string;
  url?: string;
  isAllDay: boolean;
  status: CalendarComponentStatus;
  /** 소속 캘린더 ID (href) */
  calendarId: string;
  /** 소속 캘린더 정보 */
  calendar: CalendarItem;

  // 참석자
  attendees: CalendarAttendee[];
  organizer?: CalendarOrganizer;

  // 반복 및 알람
  recurrence?: CalendarRecurrence;
  alarms: CalendarPeriod[];

  // 메타 정보
  /** ISO 8601 */
  createdAt: string;
  /** ISO 8601 */
  updatedAt: string;
  isReadOnly: boolean;
}

/** Daily UI 핵심 모델 (사용 빈도: 36회 - 최다) */
export interface DailyComponentItem {
  /** 인스턴스 고유 ID */
  id: string;
  eventDetail: CalendarEventDetail;

  // UI 표시용
  /** 포맷된 시작 시간 (e.g. "2026-01-26 14:00") */
  displayStartDate: string;
  /** 포맷된 종료 시간 */
  displayEndDate: string;
  /** 일정 길이 (분) */
  durationMinutes: number;

  // 겹침 처리 (타임라인 뷰용)
  overlapIndex?: number;
  totalOverlaps?: number;

  // 상태
  isPast: boolean;
  isToday: boolean;
  isFuture: boolean;
}

// ============================================================
// 알림 모델
// ============================================================

/** 알림 정보 */
export interface CalendarNotificationInfo {
  id: string;
  eventId: string;
  notifyDate: string;
  eventTitle: string;
}
