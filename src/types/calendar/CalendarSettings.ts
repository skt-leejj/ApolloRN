/**
 * Calendar Settings Types
 *
 * 캘린더 설정 관련 타입 정의.
 */

import type { CalendarPeriod } from './CalendarModels';
import type { CalendarViewType, CalendarWeek } from './CalendarEnums';

// ============================================================
// 설정 정보
// ============================================================

/** 전체 캘린더 설정 (사용 빈도: 10회) */
export interface CalendarSettingInfo {
  /** 기본 캘린더 */
  defaultEventCalendar?: {
    calendarId: string;
    groupId: string;
  };
  /** 기본 뷰 타입 */
  viewType: CalendarViewType;
  /** 시작 요일 */
  startWeek: CalendarWeek;
  /** 일정 알림 활성화 */
  eventNotificationEnabled: boolean;
  /** 기본 알람 (종일 일정) */
  defaultAlarmAllDay: CalendarPeriod;
  /** 기본 알람 (시간 일정) */
  defaultAlarmEvent: CalendarPeriod;
  /** 일일 브리핑 */
  briefing: BriefingSettings;
  /** 숨긴 캘린더 ID 목록 */
  hiddenCalendarIds: string[];
  /** 음소거 캘린더 ID 목록 */
  mutedCalendarIds: string[];
  /** AI 설정 */
  aiSettings: AISettingInfo;
}

/** 일일 브리핑 설정 */
export interface BriefingSettings {
  enabled: boolean;
  /** 브리핑 시간 목록 (e.g. ["08:00", "18:00"]) */
  times: string[];
}

// ============================================================
// AI 설정
// ============================================================

/** AI 설정 정보 */
export interface AISettingInfo {
  /** AI 제안 활성화 */
  suggestionEnabled: boolean;
  /** AI 카테고리 분류 활성화 */
  categoryEnabled: boolean;
}

/** 카테고리 에셋 */
export interface CalendarCategoryAsset {
  id: string;
  name: string;
  /** HEX 색상 */
  color: string;
  /** 아이콘 이름 */
  icon?: string;
}
