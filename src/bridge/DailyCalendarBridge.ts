/**
 * DailyCalendarBridge
 *
 * React Native ↔ Native Module 브릿지 인터페이스.
 * 총 80개 API + 4개 Event Emitter 정의.
 *
 * Phase 2에서는 MockBridge로 대체, Phase 3에서 NativeModules로 연결.
 */

import {NativeModules, NativeEventEmitter} from 'react-native';
import type {EmitterSubscription} from 'react-native';
import type {
  DailyComponentItem,
  CalendarEventDetail,
  CalendarItem,
  CalendarGroup,
  CalendarPeriod,
  CalendarRecurrence,
  CalendarAttendee,
  CalendarPoi,
  CalendarDate,
  CalendarSettingInfo,
  CalendarNotificationInfo,
  TimeZoneInfo,
  SubscriptionCalendarGroup,
  SubscribableCalendar,
  AISettingInfo,
  CalendarCategoryAsset,
  CalendarSyncState,
  CalendarChangeType,
  CalendarViewType,
  TextAnalyzeResult,
  ExternalCalendarProvider,
  ExternalCalendarStatus,
  ExternalCalendarConnection,
} from '../types/calendar';

// ============================================================
// Bridge Interface (80 APIs)
// ============================================================

export interface DailyCalendarModuleInterface {
  // ===== 1. 일정 조회 API (10개) =====

  /** 기간별 일정 목록 조회 */
  getEvents(
    startDate: string,
    endDate: string,
    calendarIds?: string[],
  ): Promise<DailyComponentItem[]>;

  /** 일정 상세 정보 조회 */
  getEventDetail(eventId: string): Promise<CalendarEventDetail>;

  /** UID로 일정 조회 (반복 일정의 모든 인스턴스) */
  getEventsByUid(uid: string): Promise<CalendarEventDetail[]>;

  /** 오늘 일정 조회 */
  getEventsForToday(): Promise<DailyComponentItem[]>;

  /** 다가오는 일정 조회 */
  getUpcomingEvents(count: number): Promise<DailyComponentItem[]>;

  /** 반복 일정 패턴 조회 */
  getRecurrencePattern(eventId: string): Promise<CalendarRecurrence | null>;

  /** 참석자 목록 조회 */
  getEventAttendees(eventId: string): Promise<CalendarAttendee[]>;

  /** 알람 목록 조회 */
  getEventAlarms(eventId: string): Promise<CalendarPeriod[]>;

  /** 일정 검색 (제목, 메모, 장소) */
  searchEvents(
    query: string,
    startDate?: string,
    endDate?: string,
  ): Promise<DailyComponentItem[]>;

  /** 위젯용 일정 조회 */
  getEventsForWidget(
    date: string,
    maxCount: number,
  ): Promise<DailyComponentItem[]>;

  // ===== 2. 일정 CRUD API (8개) =====

  /** 일정 생성 → 생성된 uniqueId 반환 */
  createEvent(event: Partial<CalendarEventDetail>): Promise<string>;

  /** 일정 수정 */
  updateEvent(
    eventId: string,
    event: Partial<CalendarEventDetail>,
  ): Promise<void>;

  /** 일정 삭제 */
  deleteEvent(eventId: string): Promise<void>;

  /** 반복 일정의 특정 인스턴스 수정 */
  updateEventInstance(
    eventId: string,
    instanceDate: string,
    event: Partial<CalendarEventDetail>,
  ): Promise<void>;

  /** 반복 일정의 특정 인스턴스 삭제 */
  deleteEventInstance(eventId: string, instanceDate: string): Promise<void>;

  /** 반복 일정의 모든 인스턴스 수정 */
  updateAllInstances(
    eventId: string,
    event: Partial<CalendarEventDetail>,
  ): Promise<void>;

  /** 일정을 다른 캘린더로 이동 */
  moveEventToCalendar(
    eventId: string,
    targetCalendarId: string,
  ): Promise<void>;

  /** 일정 복제 → 새 uniqueId 반환 */
  duplicateEvent(eventId: string, newStartDate?: string): Promise<string>;

  // ===== 3. 캘린더 관리 API (12개) =====

  /** 모든 캘린더 목록 */
  getCalendars(): Promise<CalendarItem[]>;

  /** 캘린더 그룹 목록 */
  getCalendarGroups(): Promise<CalendarGroup[]>;

  /** 특정 캘린더 조회 */
  getCalendarById(calendarId: string): Promise<CalendarItem>;

  /** 새 캘린더 생성 → href 반환 */
  createCalendar(
    name: string,
    color: string,
    groupId: string,
  ): Promise<string>;

  /** 캘린더 이름/색상 변경 */
  updateCalendarNameColor(
    calendarId: string,
    name: string,
    color: string,
  ): Promise<void>;

  /** 캘린더 삭제 */
  deleteCalendar(calendarId: string): Promise<void>;

  /** 캘린더 표시/숨김 */
  toggleCalendarVisibility(
    calendarId: string,
    visible: boolean,
  ): Promise<void>;

  /** 캘린더 음소거 */
  toggleCalendarMute(calendarId: string, mute: boolean): Promise<void>;

  /** 표시 중인 캘린더 목록 */
  getVisibleCalendars(): Promise<CalendarItem[]>;

  /** 음소거된 캘린더 목록 */
  getMutedCalendars(): Promise<CalendarItem[]>;

  /** 캘린더 순서 변경 */
  reorderCalendars(calendarIds: string[]): Promise<void>;

  /** 캘린더 통계 */
  getCalendarStatistics(
    calendarId: string,
  ): Promise<{totalEvents: number; upcomingEvents: number}>;

  // ===== 4. 동기화 API (8개) =====

  /** 전체 동기화 */
  syncAll(): Promise<void>;

  /** 특정 그룹 동기화 */
  syncGroup(groupId: string): Promise<void>;

  /** 특정 캘린더 동기화 */
  syncCalendar(calendarId: string): Promise<void>;

  /** 동기화 상태 조회 */
  getSyncStatus(): Promise<{
    state: CalendarSyncState;
    lastSyncDate?: string;
    error?: string;
  }>;

  /** 마지막 동기화 시간 */
  getLastSyncDate(): Promise<string | null>;

  /** 동기화 취소 */
  cancelSync(): Promise<void>;

  /** 알림 새로고침 (동기화 후) */
  refreshNotifications(): Promise<void>;

  /** 모든 데이터 삭제 (로그아웃 시) */
  clearAllData(): Promise<void>;

  // ===== 5. 외부 캘린더 API (6개) =====

  /** 외부 캘린더 연결 */
  connectExternalCalendar(
    provider: ExternalCalendarProvider,
    loginHint?: string,
  ): Promise<void>;

  /** 외부 캘린더 연결 해제 */
  disconnectExternalCalendar(providerId: string): Promise<void>;

  /** 외부 캘린더 연결 상태 */
  getExternalCalendarStatus(
    providerId: string,
  ): Promise<ExternalCalendarStatus>;

  /** 토큰 갱신 */
  refreshExternalCalendarToken(providerId: string): Promise<void>;

  /** 연결된 외부 캘린더 목록 */
  getExternalCalendars(): Promise<ExternalCalendarConnection[]>;

  /** 제공자 완전 삭제 */
  removeExternalProvider(providerId: string): Promise<void>;

  // ===== 6. 설정 API (15개) =====

  /** 전체 설정 조회 */
  getSettings(): Promise<CalendarSettingInfo>;

  /** 기본 캘린더 설정 */
  setDefaultCalendar(calendarId: string, groupId: string): Promise<void>;

  /** 기본 캘린더 조회 */
  getDefaultCalendar(): Promise<{calendarId: string; groupId: string} | null>;

  /** 일정 알림 활성화/비활성화 */
  toggleEventNotification(enabled: boolean): Promise<void>;

  /** AI 제안 활성화/비활성화 */
  toggleAISuggestion(enabled: boolean): Promise<void>;

  /** 기본 알람 시간 설정 */
  setDefaultAlarmTimes(
    allDay: CalendarPeriod,
    event: CalendarPeriod,
  ): Promise<void>;

  /** 기본 알람 시간 조회 */
  getDefaultAlarmTimes(): Promise<{
    allDay: CalendarPeriod;
    event: CalendarPeriod;
  }>;

  /** 일일 브리핑 활성화/비활성화 */
  toggleDailyBriefing(enabled: boolean, times?: string[]): Promise<void>;

  /** 브리핑 설정 조회 */
  getBriefingSettings(): Promise<{enabled: boolean; times: string[]}>;

  /** 기본 뷰 타입 설정 */
  setViewType(type: CalendarViewType): Promise<void>;

  /** 기본 뷰 타입 조회 */
  getViewType(): Promise<CalendarViewType>;

  /** AI 설정 조회 */
  getAISettings(): Promise<AISettingInfo>;

  /** AI 설정 업데이트 */
  updateAISettings(settings: Partial<AISettingInfo>): Promise<void>;

  /** 카테고리 에셋 조회 */
  getCategoryAssets(): Promise<Record<string, CalendarCategoryAsset>>;

  /** 설정 동기화 */
  syncSettings(): Promise<void>;

  // ===== 7. 알림 API (7개) =====

  /** 일정 알림 등록 → 알림 ID 반환 */
  registerEventNotification(
    eventId: string,
    alarmTime: CalendarPeriod,
  ): Promise<string>;

  /** 일정 알림 취소 */
  cancelEventNotification(notificationId: string): Promise<void>;

  /** 특정 일정의 모든 알림 취소 */
  cancelAllNotifications(eventId: string): Promise<void>;

  /** 일일 브리핑 등록 → 브리핑 ID 반환 */
  registerDailyBriefing(date: string, time: string): Promise<string>;

  /** 일일 브리핑 취소 */
  cancelDailyBriefing(date: string): Promise<void>;

  /** 대기 중인 알림 목록 */
  getPendingNotifications(): Promise<CalendarNotificationInfo[]>;

  /** 시스템 알림 정보 (디버깅용) */
  getSystemNotifications(): Promise<CalendarNotificationInfo[]>;

  // ===== 8. 그룹 관리 API (6개) =====

  /** 그룹 생성 → 그룹 ID 반환 */
  createGroup(name: string, account?: string): Promise<string>;

  /** 그룹 수정 */
  updateGroup(groupId: string, name: string): Promise<void>;

  /** 그룹 삭제 */
  deleteGroup(groupId: string): Promise<void>;

  /** 그룹 순서 변경 */
  reorderGroups(groupIds: string[]): Promise<void>;

  /** 캘린더를 다른 그룹으로 이동 */
  moveCalendarToGroup(
    calendarId: string,
    targetGroupId: string,
  ): Promise<void>;

  /** 그룹 통계 */
  getGroupStatistics(
    groupId: string,
  ): Promise<{totalCalendars: number; totalEvents: number}>;

  // ===== 9. 텍스트 분석 API (1개) =====

  /** 자연어 텍스트 분석 (빠른 등록) */
  analyzeText(
    text: string,
    seedDate?: string,
    enableLunar?: boolean,
  ): Promise<TextAnalyzeResult | null>;

  // ===== 10. 구독 캘린더 API (4개) =====

  /** 구독 가능한 캘린더 목록 */
  getSubscriptionCalendars(): Promise<SubscriptionCalendarGroup[]>;

  /** 캘린더 구독 */
  subscribeCalendar(href: string): Promise<void>;

  /** 캘린더 구독 해제 */
  unsubscribeCalendar(href: string): Promise<void>;

  /** 현재 구독 중인 캘린더 */
  getSubscribedCalendars(): Promise<SubscribableCalendar[]>;

  // ===== 11. 유틸리티 API (3개) =====

  /** 타임존 검색 */
  searchTimeZone(keyword: string): Promise<TimeZoneInfo[]>;

  /** POI 검색 히스토리 */
  getPOIHistory(limit?: number): Promise<CalendarPoi[]>;

  /** POI 히스토리에 저장 */
  savePOIToHistory(poi: CalendarPoi): Promise<void>;
}

// ============================================================
// Event Emitter Types
// ============================================================

export interface CalendarChangedEvent {
  eventId: string;
  changeType: CalendarChangeType;
}

export interface SyncStateChangedEvent {
  state: CalendarSyncState;
  error?: string;
}

export interface NotificationReceivedEvent {
  eventId: string;
  title: string;
  body: string;
}

// ============================================================
// Bridge Instance
// ============================================================

/**
 * 개발 환경에서는 MockBridge, 프로덕션에서는 NativeModules 사용.
 * Phase 2: MockBridge → Phase 3: NativeModules.DailyCalendarModule
 */
function createBridge(): DailyCalendarModuleInterface {
  if (__DEV__ && !NativeModules.DailyCalendarModule) {
    // Mock Bridge 사용 (Phase 2)
    return require('../mocks/mockBridge').MockDailyCalendarBridge;
  }
  return NativeModules.DailyCalendarModule as DailyCalendarModuleInterface;
}

export const DailyCalendarBridge: DailyCalendarModuleInterface = createBridge();

// ============================================================
// Event Emitter
// ============================================================

function createEventEmitter(): NativeEventEmitter | null {
  if (__DEV__ && !NativeModules.DailyCalendarModule) {
    return null;
  }
  return new NativeEventEmitter(NativeModules.DailyCalendarModule);
}

const eventEmitter = createEventEmitter();

export const CalendarEvents = {
  /** 일정이 변경되었을 때 (생성/수정/삭제) */
  onCalendarChanged(
    callback: (event: CalendarChangedEvent) => void,
  ): EmitterSubscription | null {
    return eventEmitter?.addListener('CalendarChanged', callback) ?? null;
  },

  /** 동기화 상태가 변경되었을 때 */
  onSyncStateChanged(
    callback: (state: SyncStateChangedEvent) => void,
  ): EmitterSubscription | null {
    return eventEmitter?.addListener('SyncStateChanged', callback) ?? null;
  },

  /** 설정이 변경되었을 때 */
  onSettingChanged(
    callback: (setting: CalendarSettingInfo) => void,
  ): EmitterSubscription | null {
    return eventEmitter?.addListener('SettingChanged', callback) ?? null;
  },

  /** 알림을 수신했을 때 (앱 실행 중) */
  onNotificationReceived(
    callback: (notification: NotificationReceivedEvent) => void,
  ): EmitterSubscription | null {
    return (
      eventEmitter?.addListener('NotificationReceived', callback) ?? null
    );
  },
};
