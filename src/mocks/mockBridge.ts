/**
 * Mock Bridge
 *
 * DailyCalendarModuleInterface의 Mock 구현.
 * Phase 2에서 Native Module 없이 화면 개발 가능하게 함.
 * 네트워크 지연을 시뮬레이션하기 위해 delay 적용.
 */

import type {DailyCalendarModuleInterface} from '../bridge/DailyCalendarBridge';
import type {
  DailyComponentItem,
  CalendarEventDetail,
  CalendarItem,
  CalendarGroup,
  CalendarPeriod,
  CalendarRecurrence,
  CalendarAttendee,
  CalendarPoi,
  CalendarSettingInfo,
  CalendarNotificationInfo,
  TimeZoneInfo,
  SubscriptionCalendarGroup,
  SubscribableCalendar,
  AISettingInfo,
  CalendarCategoryAsset,
  CalendarViewType,
  TextAnalyzeResult,
  ExternalCalendarProvider,
  ExternalCalendarStatus,
  ExternalCalendarConnection,
  CalendarSyncState,
} from '../types/calendar';
import {
  mockCalendars,
  mockCalendarGroups,
  mockEventDetails,
  mockDailyComponentItems,
  mockSettings,
  mockTimeZones,
  mockSubscriptionCalendarGroups,
  mockPOIHistory,
} from './mockData';

// ============================================================
// Helpers
// ============================================================

const delay = (ms = 300) => new Promise<void>(r => setTimeout(r, ms));

let nextId = 100;
const generateId = () => `mock-${nextId++}`;

/** Mutable state for mock data */
const state = {
  events: [...mockEventDetails],
  calendars: [...mockCalendars],
  groups: [...mockCalendarGroups],
  settings: {...mockSettings},
  poiHistory: [...mockPOIHistory],
};

function filterEventsByDateRange(
  startDate: string,
  endDate: string,
  calendarIds?: string[],
): DailyComponentItem[] {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate + 'T23:59:59').getTime();

  return mockDailyComponentItems.filter(item => {
    const eventStart = new Date(item.eventDetail.startDate.date).getTime();
    const inRange = eventStart >= start && eventStart <= end;
    const inCalendar =
      !calendarIds || calendarIds.includes(item.eventDetail.calendarId);
    return inRange && inCalendar;
  });
}

// ============================================================
// Mock Bridge Implementation
// ============================================================

export const MockDailyCalendarBridge: DailyCalendarModuleInterface = {
  // ===== 1. 일정 조회 API =====

  async getEvents(startDate, endDate, calendarIds) {
    await delay();
    return filterEventsByDateRange(startDate, endDate, calendarIds);
  },

  async getEventDetail(eventId) {
    await delay(200);
    const event = state.events.find(e => e.id === eventId);
    if (!event) {
      throw new Error(`Event not found: ${eventId}`);
    }
    return event;
  },

  async getEventsByUid(uid) {
    await delay();
    return state.events.filter(e => e.id.includes(uid));
  },

  async getEventsForToday() {
    await delay();
    return mockDailyComponentItems.filter(item => item.isToday);
  },

  async getUpcomingEvents(count) {
    await delay();
    return mockDailyComponentItems
      .filter(item => item.isFuture)
      .slice(0, count);
  },

  async getRecurrencePattern(eventId) {
    await delay(100);
    const event = state.events.find(e => e.id === eventId);
    return event?.recurrence ?? null;
  },

  async getEventAttendees(eventId) {
    await delay(100);
    const event = state.events.find(e => e.id === eventId);
    return event?.attendees ?? [];
  },

  async getEventAlarms(eventId) {
    await delay(100);
    const event = state.events.find(e => e.id === eventId);
    return event?.alarms ?? [];
  },

  async searchEvents(query, startDate, endDate) {
    await delay(400);
    const q = query.toLowerCase();
    return mockDailyComponentItems.filter(item => {
      const detail = item.eventDetail;
      return (
        detail.title.toLowerCase().includes(q) ||
        detail.memo?.toLowerCase().includes(q) ||
        detail.location?.name.toLowerCase().includes(q)
      );
    });
  },

  async getEventsForWidget(date, maxCount) {
    await delay(200);
    return filterEventsByDateRange(date, date).slice(0, maxCount);
  },

  // ===== 2. 일정 CRUD API =====

  async createEvent(event) {
    await delay(500);
    const id = generateId();
    const newEvent: CalendarEventDetail = {
      id,
      title: event.title ?? '새 일정',
      startDate: event.startDate ?? {
        date: new Date().toISOString(),
        timeZone: 'Asia/Seoul',
        isAllDay: false,
      },
      endDate: event.endDate ?? {
        date: new Date().toISOString(),
        timeZone: 'Asia/Seoul',
        isAllDay: false,
      },
      isAllDay: event.isAllDay ?? false,
      status: event.status ?? 'confirmed',
      calendarId: event.calendarId ?? 'cal-personal',
      calendar: event.calendar ?? mockCalendars[0],
      attendees: event.attendees ?? [],
      alarms: event.alarms ?? [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isReadOnly: false,
      ...event,
    } as CalendarEventDetail;
    state.events.push(newEvent);
    console.log('[MockBridge] createEvent:', id, newEvent.title);
    return id;
  },

  async updateEvent(eventId, event) {
    await delay(400);
    const idx = state.events.findIndex(e => e.id === eventId);
    if (idx === -1) {
      throw new Error(`Event not found: ${eventId}`);
    }
    state.events[idx] = {
      ...state.events[idx],
      ...event,
      updatedAt: new Date().toISOString(),
    } as CalendarEventDetail;
    console.log('[MockBridge] updateEvent:', eventId);
  },

  async deleteEvent(eventId) {
    await delay(300);
    const idx = state.events.findIndex(e => e.id === eventId);
    if (idx === -1) {
      throw new Error(`Event not found: ${eventId}`);
    }
    state.events.splice(idx, 1);
    console.log('[MockBridge] deleteEvent:', eventId);
  },

  async updateEventInstance(eventId, instanceDate, event) {
    await delay(400);
    console.log('[MockBridge] updateEventInstance:', eventId, instanceDate);
  },

  async deleteEventInstance(eventId, instanceDate) {
    await delay(300);
    console.log('[MockBridge] deleteEventInstance:', eventId, instanceDate);
  },

  async updateAllInstances(eventId, event) {
    await delay(400);
    console.log('[MockBridge] updateAllInstances:', eventId);
  },

  async moveEventToCalendar(eventId, targetCalendarId) {
    await delay(300);
    const evt = state.events.find(e => e.id === eventId);
    if (evt) {
      evt.calendarId = targetCalendarId;
      evt.calendar = state.calendars.find(c => c.id === targetCalendarId) ?? evt.calendar;
    }
    console.log('[MockBridge] moveEventToCalendar:', eventId, targetCalendarId);
  },

  async duplicateEvent(eventId, newStartDate) {
    await delay(400);
    const original = state.events.find(e => e.id === eventId);
    if (!original) {
      throw new Error(`Event not found: ${eventId}`);
    }
    const newId = generateId();
    const duplicate = {...original, id: newId};
    if (newStartDate) {
      duplicate.startDate = {...duplicate.startDate, date: newStartDate};
    }
    state.events.push(duplicate);
    console.log('[MockBridge] duplicateEvent:', eventId, '→', newId);
    return newId;
  },

  // ===== 3. 캘린더 관리 API =====

  async getCalendars() {
    await delay();
    return state.calendars;
  },

  async getCalendarGroups() {
    await delay();
    return state.groups;
  },

  async getCalendarById(calendarId) {
    await delay(100);
    const cal = state.calendars.find(c => c.id === calendarId);
    if (!cal) {
      throw new Error(`Calendar not found: ${calendarId}`);
    }
    return cal;
  },

  async createCalendar(name, color, groupId) {
    await delay(400);
    const id = generateId();
    state.calendars.push({
      id,
      name,
      color,
      groupId,
      isVisible: true,
      isReadOnly: false,
    });
    console.log('[MockBridge] createCalendar:', id, name);
    return id;
  },

  async updateCalendarNameColor(calendarId, name, color) {
    await delay(300);
    const cal = state.calendars.find(c => c.id === calendarId);
    if (cal) {
      cal.name = name;
      cal.color = color;
    }
    console.log('[MockBridge] updateCalendarNameColor:', calendarId);
  },

  async deleteCalendar(calendarId) {
    await delay(300);
    const idx = state.calendars.findIndex(c => c.id === calendarId);
    if (idx !== -1) {
      state.calendars.splice(idx, 1);
    }
    console.log('[MockBridge] deleteCalendar:', calendarId);
  },

  async toggleCalendarVisibility(calendarId, visible) {
    await delay(200);
    const cal = state.calendars.find(c => c.id === calendarId);
    if (cal) {
      cal.isVisible = visible;
    }
  },

  async toggleCalendarMute(calendarId, mute) {
    await delay(200);
    if (mute) {
      state.settings.mutedCalendarIds.push(calendarId);
    } else {
      state.settings.mutedCalendarIds = state.settings.mutedCalendarIds.filter(
        id => id !== calendarId,
      );
    }
  },

  async getVisibleCalendars() {
    await delay();
    return state.calendars.filter(c => c.isVisible);
  },

  async getMutedCalendars() {
    await delay();
    return state.calendars.filter(c =>
      state.settings.mutedCalendarIds.includes(c.id),
    );
  },

  async reorderCalendars(calendarIds) {
    await delay(200);
    console.log('[MockBridge] reorderCalendars:', calendarIds);
  },

  async getCalendarStatistics(calendarId) {
    await delay(200);
    const total = state.events.filter(e => e.calendarId === calendarId).length;
    return {totalEvents: total, upcomingEvents: Math.ceil(total / 2)};
  },

  // ===== 4. 동기화 API =====

  async syncAll() {
    await delay(2000);
    console.log('[MockBridge] syncAll completed');
  },

  async syncGroup(groupId) {
    await delay(1500);
    console.log('[MockBridge] syncGroup:', groupId);
  },

  async syncCalendar(calendarId) {
    await delay(1000);
    console.log('[MockBridge] syncCalendar:', calendarId);
  },

  async getSyncStatus() {
    await delay(100);
    return {state: 'idle' as CalendarSyncState, lastSyncDate: new Date().toISOString()};
  },

  async getLastSyncDate() {
    await delay(100);
    return new Date().toISOString();
  },

  async cancelSync() {
    await delay(100);
    console.log('[MockBridge] cancelSync');
  },

  async refreshNotifications() {
    await delay(500);
    console.log('[MockBridge] refreshNotifications');
  },

  async clearAllData() {
    await delay(1000);
    state.events = [];
    state.calendars = [];
    state.groups = [];
    console.log('[MockBridge] clearAllData');
  },

  // ===== 5. 외부 캘린더 API =====

  async connectExternalCalendar(provider, loginHint) {
    await delay(2000);
    console.log('[MockBridge] connectExternalCalendar:', provider, loginHint);
  },

  async disconnectExternalCalendar(providerId) {
    await delay(1000);
    console.log('[MockBridge] disconnectExternalCalendar:', providerId);
  },

  async getExternalCalendarStatus(providerId) {
    await delay(200);
    return {
      connected: providerId === 'group-google',
      email: providerId === 'group-google' ? 'google-user@gmail.com' : undefined,
      lastSyncDate: new Date().toISOString(),
    };
  },

  async refreshExternalCalendarToken(providerId) {
    await delay(1000);
    console.log('[MockBridge] refreshExternalCalendarToken:', providerId);
  },

  async getExternalCalendars() {
    await delay();
    return [
      {
        provider: 'google',
        email: 'google-user@gmail.com',
        calendars: state.calendars.filter(c => c.accountId === 'google-user@gmail.com'),
      },
    ];
  },

  async removeExternalProvider(providerId) {
    await delay(1000);
    console.log('[MockBridge] removeExternalProvider:', providerId);
  },

  // ===== 6. 설정 API =====

  async getSettings() {
    await delay(200);
    return {...state.settings};
  },

  async setDefaultCalendar(calendarId, groupId) {
    await delay(200);
    state.settings.defaultEventCalendar = {calendarId, groupId};
  },

  async getDefaultCalendar() {
    await delay(100);
    return state.settings.defaultEventCalendar ?? null;
  },

  async toggleEventNotification(enabled) {
    await delay(200);
    state.settings.eventNotificationEnabled = enabled;
  },

  async toggleAISuggestion(enabled) {
    await delay(200);
    state.settings.aiSettings.suggestionEnabled = enabled;
  },

  async setDefaultAlarmTimes(allDay, event) {
    await delay(200);
    state.settings.defaultAlarmAllDay = allDay;
    state.settings.defaultAlarmEvent = event;
  },

  async getDefaultAlarmTimes() {
    await delay(100);
    return {
      allDay: state.settings.defaultAlarmAllDay,
      event: state.settings.defaultAlarmEvent,
    };
  },

  async toggleDailyBriefing(enabled, times) {
    await delay(200);
    state.settings.briefing.enabled = enabled;
    if (times) {
      state.settings.briefing.times = times;
    }
  },

  async getBriefingSettings() {
    await delay(100);
    return {...state.settings.briefing};
  },

  async setViewType(type) {
    await delay(100);
    state.settings.viewType = type;
  },

  async getViewType() {
    await delay(100);
    return state.settings.viewType;
  },

  async getAISettings() {
    await delay(100);
    return {...state.settings.aiSettings};
  },

  async updateAISettings(settings) {
    await delay(200);
    state.settings.aiSettings = {...state.settings.aiSettings, ...settings};
  },

  async getCategoryAssets() {
    await delay(200);
    return {
      work: {id: 'work', name: '업무', color: '#EA4335', icon: 'briefcase'},
      personal: {id: 'personal', name: '개인', color: '#4285F4', icon: 'person'},
      health: {id: 'health', name: '건강', color: '#34A853', icon: 'heart'},
      social: {id: 'social', name: '사교', color: '#FBBC05', icon: 'people'},
    };
  },

  async syncSettings() {
    await delay(500);
    console.log('[MockBridge] syncSettings');
  },

  // ===== 7. 알림 API =====

  async registerEventNotification(eventId, alarmTime) {
    await delay(200);
    const id = generateId();
    console.log('[MockBridge] registerEventNotification:', eventId, alarmTime);
    return id;
  },

  async cancelEventNotification(notificationId) {
    await delay(100);
    console.log('[MockBridge] cancelEventNotification:', notificationId);
  },

  async cancelAllNotifications(eventId) {
    await delay(200);
    console.log('[MockBridge] cancelAllNotifications:', eventId);
  },

  async registerDailyBriefing(date, time) {
    await delay(200);
    return generateId();
  },

  async cancelDailyBriefing(date) {
    await delay(100);
    console.log('[MockBridge] cancelDailyBriefing:', date);
  },

  async getPendingNotifications() {
    await delay(200);
    return state.events.slice(0, 3).map(e => ({
      id: `notif-${e.id}`,
      eventId: e.id,
      notifyDate: e.startDate.date,
      eventTitle: e.title,
    }));
  },

  async getSystemNotifications() {
    await delay(200);
    return [];
  },

  // ===== 8. 그룹 관리 API =====

  async createGroup(name, account) {
    await delay(300);
    const id = generateId();
    state.groups.push({id, name, order: state.groups.length, calendars: [], account});
    console.log('[MockBridge] createGroup:', id, name);
    return id;
  },

  async updateGroup(groupId, name) {
    await delay(200);
    const group = state.groups.find(g => g.id === groupId);
    if (group) {
      group.name = name;
    }
  },

  async deleteGroup(groupId) {
    await delay(300);
    const idx = state.groups.findIndex(g => g.id === groupId);
    if (idx !== -1) {
      state.groups.splice(idx, 1);
    }
  },

  async reorderGroups(groupIds) {
    await delay(200);
    console.log('[MockBridge] reorderGroups:', groupIds);
  },

  async moveCalendarToGroup(calendarId, targetGroupId) {
    await delay(200);
    const cal = state.calendars.find(c => c.id === calendarId);
    if (cal) {
      cal.groupId = targetGroupId;
    }
  },

  async getGroupStatistics(groupId) {
    await delay(200);
    const group = state.groups.find(g => g.id === groupId);
    const calCount = group?.calendars.length ?? 0;
    return {totalCalendars: calCount, totalEvents: calCount * 5};
  },

  // ===== 9. 텍스트 분석 API =====

  async analyzeText(text, seedDate, enableLunar) {
    await delay(800);

    // 간단한 패턴 매칭 시뮬레이션
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (text.includes('내일')) {
      const hourMatch = text.match(/(\d{1,2})시/);
      const hour = hourMatch ? parseInt(hourMatch[1], 10) : 9;
      tomorrow.setHours(hour, 0, 0, 0);

      const endTime = new Date(tomorrow);
      endTime.setHours(hour + 1);

      return {
        title: text.replace(/내일\s*(오전|오후)?\s*\d{1,2}시\s*/, '').trim() || text,
        startDate: {date: tomorrow.toISOString(), timeZone: 'Asia/Seoul', isAllDay: false},
        endDate: {date: endTime.toISOString(), timeZone: 'Asia/Seoul', isAllDay: false},
        isAllDay: false,
        isLunar: false,
      };
    }

    return {
      title: text,
      isAllDay: false,
      isLunar: false,
    };
  },

  // ===== 10. 구독 캘린더 API =====

  async getSubscriptionCalendars() {
    await delay();
    return mockSubscriptionCalendarGroups;
  },

  async subscribeCalendar(href) {
    await delay(500);
    console.log('[MockBridge] subscribeCalendar:', href);
  },

  async unsubscribeCalendar(href) {
    await delay(500);
    console.log('[MockBridge] unsubscribeCalendar:', href);
  },

  async getSubscribedCalendars() {
    await delay();
    return mockSubscriptionCalendarGroups
      .flatMap(g => g.calendars)
      .filter(c => c.isSubscribed);
  },

  // ===== 11. 유틸리티 API =====

  async searchTimeZone(keyword) {
    await delay(300);
    const q = keyword.toLowerCase();
    return mockTimeZones.filter(
      tz =>
        tz.id.toLowerCase().includes(q) ||
        tz.displayName.toLowerCase().includes(q),
    );
  },

  async getPOIHistory(limit = 20) {
    await delay(200);
    return state.poiHistory.slice(0, limit);
  },

  async savePOIToHistory(poi) {
    await delay(100);
    state.poiHistory.unshift(poi);
    console.log('[MockBridge] savePOIToHistory:', poi.name);
  },
};
