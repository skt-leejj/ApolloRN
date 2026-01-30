/**
 * Mock Data
 *
 * Phase 2 화면 개발용 목 데이터.
 * 다양한 시나리오를 커버: 종일 일정, 반복 일정, 겹치는 일정, 외부 캘린더 등.
 */

import type {
  CalendarItem,
  CalendarGroup,
  CalendarEventDetail,
  DailyComponentItem,
  CalendarPoi,
  CalendarSettingInfo,
  TimeZoneInfo,
  SubscriptionCalendarGroup,
} from '../types/calendar';

// ============================================================
// 캘린더
// ============================================================

export const mockCalendars: CalendarItem[] = [
  {
    id: 'cal-personal',
    name: '내 캘린더',
    color: '#4285F4',
    groupId: 'group-local',
    isVisible: true,
    isReadOnly: false,
  },
  {
    id: 'cal-work',
    name: '업무',
    color: '#EA4335',
    groupId: 'group-local',
    isVisible: true,
    isReadOnly: false,
  },
  {
    id: 'cal-family',
    name: '가족',
    color: '#34A853',
    groupId: 'group-local',
    isVisible: true,
    isReadOnly: false,
  },
  {
    id: 'cal-google',
    name: 'Google 캘린더',
    color: '#FBBC05',
    groupId: 'group-google',
    isVisible: true,
    isReadOnly: false,
    accountId: 'google-user@gmail.com',
  },
  {
    id: 'cal-holiday',
    name: '대한민국 공휴일',
    color: '#9E9E9E',
    groupId: 'group-subscription',
    isVisible: true,
    isReadOnly: true,
    subscriptionUrl: 'https://calendar.google.com/calendar/ical/ko.south_korea%23holiday%40group.v.calendar.google.com/public/basic.ics',
  },
];

export const mockCalendarGroups: CalendarGroup[] = [
  {
    id: 'group-local',
    name: '내 캘린더',
    order: 0,
    calendars: mockCalendars.filter(c => c.groupId === 'group-local'),
  },
  {
    id: 'group-google',
    name: 'Google',
    order: 1,
    calendars: mockCalendars.filter(c => c.groupId === 'group-google'),
    account: 'google-user@gmail.com',
  },
  {
    id: 'group-subscription',
    name: '구독',
    order: 2,
    calendars: mockCalendars.filter(c => c.groupId === 'group-subscription'),
  },
];

// ============================================================
// 장소
// ============================================================

const mockLocations: CalendarPoi[] = [
  {
    name: '강남역 스타벅스',
    address: '서울 강남구 강남대로 396',
    latitude: 37.497942,
    longitude: 127.027621,
  },
  {
    name: '회의실 A',
    address: '서울 강남구 테헤란로 152',
    latitude: 37.500622,
    longitude: 127.036456,
  },
  {
    name: '잠실 롯데월드타워',
    address: '서울 송파구 올림픽로 300',
    latitude: 37.512483,
    longitude: 127.102539,
  },
];

// ============================================================
// 일정 상세
// ============================================================

function today(hour: number, minute = 0): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function daysFromNow(days: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function dateOnly(daysOffset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

const cal = (id: string) => mockCalendars.find(c => c.id === id)!;

export const mockEventDetails: CalendarEventDetail[] = [
  // 오늘 - 일반 일정
  {
    id: 'evt-1',
    title: '팀 스탠드업 미팅',
    startDate: {date: today(9, 30), timeZone: 'Asia/Seoul', isAllDay: false},
    endDate: {date: today(10, 0), timeZone: 'Asia/Seoul', isAllDay: false},
    location: mockLocations[1],
    memo: '주간 업무 보고',
    isAllDay: false,
    status: 'confirmed',
    calendarId: 'cal-work',
    calendar: cal('cal-work'),
    attendees: [
      {email: 'kim@company.com', name: '김철수', status: 'accepted', isOptional: false},
      {email: 'lee@company.com', name: '이영희', status: 'tentative', isOptional: false},
    ],
    organizer: {email: 'me@company.com', name: '나'},
    alarms: [{minutes: -10, label: '10분 전'}],
    createdAt: '2026-01-20T10:00:00+09:00',
    updatedAt: '2026-01-25T15:30:00+09:00',
    isReadOnly: false,
  },

  // 오늘 - 겹치는 일정
  {
    id: 'evt-2',
    title: '프로젝트 리뷰',
    startDate: {date: today(9, 0), timeZone: 'Asia/Seoul', isAllDay: false},
    endDate: {date: today(10, 30), timeZone: 'Asia/Seoul', isAllDay: false},
    isAllDay: false,
    status: 'confirmed',
    calendarId: 'cal-work',
    calendar: cal('cal-work'),
    attendees: [],
    alarms: [{minutes: -30, label: '30분 전'}],
    createdAt: '2026-01-22T09:00:00+09:00',
    updatedAt: '2026-01-22T09:00:00+09:00',
    isReadOnly: false,
  },

  // 오늘 - 종일 일정
  {
    id: 'evt-3',
    title: '프로젝트 D-day',
    startDate: {date: dateOnly(), timeZone: 'Asia/Seoul', isAllDay: true},
    endDate: {date: dateOnly(), timeZone: 'Asia/Seoul', isAllDay: true},
    isAllDay: true,
    status: 'confirmed',
    calendarId: 'cal-personal',
    calendar: cal('cal-personal'),
    attendees: [],
    alarms: [{minutes: -1440, label: '1일 전'}],
    createdAt: '2026-01-15T10:00:00+09:00',
    updatedAt: '2026-01-15T10:00:00+09:00',
    isReadOnly: false,
  },

  // 오늘 - 점심
  {
    id: 'evt-4',
    title: '점심 약속',
    startDate: {date: today(12, 0), timeZone: 'Asia/Seoul', isAllDay: false},
    endDate: {date: today(13, 0), timeZone: 'Asia/Seoul', isAllDay: false},
    location: mockLocations[0],
    isAllDay: false,
    status: 'confirmed',
    calendarId: 'cal-personal',
    calendar: cal('cal-personal'),
    attendees: [],
    alarms: [{minutes: -60, label: '1시간 전'}],
    createdAt: '2026-01-24T18:00:00+09:00',
    updatedAt: '2026-01-24T18:00:00+09:00',
    isReadOnly: false,
  },

  // 오늘 - 오후 일정
  {
    id: 'evt-5',
    title: '코드 리뷰',
    startDate: {date: today(14, 0), timeZone: 'Asia/Seoul', isAllDay: false},
    endDate: {date: today(15, 30), timeZone: 'Asia/Seoul', isAllDay: false},
    memo: 'PR #123 리뷰',
    url: 'https://github.com/example/repo/pull/123',
    isAllDay: false,
    status: 'confirmed',
    calendarId: 'cal-work',
    calendar: cal('cal-work'),
    attendees: [
      {email: 'park@company.com', name: '박지민', status: 'accepted', isOptional: false},
    ],
    alarms: [{minutes: -15, label: '15분 전'}],
    createdAt: '2026-01-26T08:00:00+09:00',
    updatedAt: '2026-01-26T08:00:00+09:00',
    isReadOnly: false,
  },

  // 내일 - 반복 일정
  {
    id: 'evt-6',
    title: '운동',
    startDate: {date: daysFromNow(1, 7, 0), timeZone: 'Asia/Seoul', isAllDay: false},
    endDate: {date: daysFromNow(1, 8, 0), timeZone: 'Asia/Seoul', isAllDay: false},
    isAllDay: false,
    status: 'confirmed',
    calendarId: 'cal-personal',
    calendar: cal('cal-personal'),
    attendees: [],
    recurrence: {
      frequency: 'weekly',
      interval: 1,
      byWeekDay: [1, 3, 5],
    },
    alarms: [{minutes: -30, label: '30분 전'}],
    createdAt: '2026-01-01T10:00:00+09:00',
    updatedAt: '2026-01-01T10:00:00+09:00',
    isReadOnly: false,
  },

  // 이번 주 - 가족 일정
  {
    id: 'evt-7',
    title: '가족 저녁 식사',
    startDate: {date: daysFromNow(3, 18, 30), timeZone: 'Asia/Seoul', isAllDay: false},
    endDate: {date: daysFromNow(3, 20, 30), timeZone: 'Asia/Seoul', isAllDay: false},
    location: mockLocations[2],
    isAllDay: false,
    status: 'confirmed',
    calendarId: 'cal-family',
    calendar: cal('cal-family'),
    attendees: [],
    alarms: [{minutes: -120, label: '2시간 전'}],
    createdAt: '2026-01-20T12:00:00+09:00',
    updatedAt: '2026-01-20T12:00:00+09:00',
    isReadOnly: false,
  },

  // 구글 캘린더 일정
  {
    id: 'evt-8',
    title: '외부 미팅',
    startDate: {date: daysFromNow(2, 15, 0), timeZone: 'Asia/Seoul', isAllDay: false},
    endDate: {date: daysFromNow(2, 16, 0), timeZone: 'Asia/Seoul', isAllDay: false},
    isAllDay: false,
    status: 'tentative',
    calendarId: 'cal-google',
    calendar: cal('cal-google'),
    attendees: [
      {email: 'external@partner.com', name: '외부 파트너', status: 'needsAction', isOptional: false},
    ],
    organizer: {email: 'google-user@gmail.com', name: '나'},
    alarms: [{minutes: -15, label: '15분 전'}],
    createdAt: '2026-01-25T14:00:00+09:00',
    updatedAt: '2026-01-25T14:00:00+09:00',
    isReadOnly: false,
  },
];

// ============================================================
// DailyComponentItem (UI 모델)
// ============================================================

function toDailyComponentItem(
  detail: CalendarEventDetail,
  overlapIndex?: number,
  totalOverlaps?: number,
): DailyComponentItem {
  const start = new Date(detail.startDate.date);
  const end = new Date(detail.endDate.date);
  const now = new Date();

  return {
    id: detail.id,
    eventDetail: detail,
    displayStartDate: formatDisplayDate(start, detail.isAllDay),
    displayEndDate: formatDisplayDate(end, detail.isAllDay),
    durationMinutes: detail.isAllDay
      ? 1440
      : Math.round((end.getTime() - start.getTime()) / 60000),
    overlapIndex,
    totalOverlaps,
    isPast: end < now,
    isToday: isToday(start),
    isFuture: start > now,
  };
}

function formatDisplayDate(d: Date, isAllDay: boolean): string {
  if (isAllDay) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function isToday(d: Date): boolean {
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export const mockDailyComponentItems: DailyComponentItem[] = [
  // 겹치는 일정들 (evt-1, evt-2)
  toDailyComponentItem(mockEventDetails[0], 0, 2),
  toDailyComponentItem(mockEventDetails[1], 1, 2),
  // 나머지
  toDailyComponentItem(mockEventDetails[2]),
  toDailyComponentItem(mockEventDetails[3]),
  toDailyComponentItem(mockEventDetails[4]),
  toDailyComponentItem(mockEventDetails[5]),
  toDailyComponentItem(mockEventDetails[6]),
  toDailyComponentItem(mockEventDetails[7]),
];

// ============================================================
// 설정
// ============================================================

export const mockSettings: CalendarSettingInfo = {
  defaultEventCalendar: {
    calendarId: 'cal-personal',
    groupId: 'group-local',
  },
  viewType: 'month',
  startWeek: 'sunday',
  eventNotificationEnabled: true,
  defaultAlarmAllDay: {minutes: -1440, label: '1일 전'},
  defaultAlarmEvent: {minutes: -30, label: '30분 전'},
  briefing: {
    enabled: true,
    times: ['08:00', '18:00'],
  },
  hiddenCalendarIds: [],
  mutedCalendarIds: [],
  aiSettings: {
    suggestionEnabled: true,
    categoryEnabled: true,
  },
};

// ============================================================
// 타임존
// ============================================================

export const mockTimeZones: TimeZoneInfo[] = [
  {id: 'Asia/Seoul', displayName: '서울 (KST)', utcOffsetMinutes: 540, abbreviation: 'KST'},
  {id: 'Asia/Tokyo', displayName: '도쿄 (JST)', utcOffsetMinutes: 540, abbreviation: 'JST'},
  {id: 'America/New_York', displayName: '뉴욕 (EST)', utcOffsetMinutes: -300, abbreviation: 'EST'},
  {id: 'America/Los_Angeles', displayName: '로스앤젤레스 (PST)', utcOffsetMinutes: -480, abbreviation: 'PST'},
  {id: 'Europe/London', displayName: '런던 (GMT)', utcOffsetMinutes: 0, abbreviation: 'GMT'},
  {id: 'Europe/Paris', displayName: '파리 (CET)', utcOffsetMinutes: 60, abbreviation: 'CET'},
];

// ============================================================
// 구독 캘린더
// ============================================================

export const mockSubscriptionCalendarGroups: SubscriptionCalendarGroup[] = [
  {
    id: 'sub-group-holiday',
    name: '공휴일',
    calendars: [
      {href: 'sub-kr-holiday', name: '대한민국 공휴일', description: '대한민국의 법정 공휴일', isSubscribed: true},
      {href: 'sub-jp-holiday', name: '일본 공휴일', description: '일본의 법정 공휴일', isSubscribed: false},
      {href: 'sub-us-holiday', name: '미국 공휴일', description: '미국의 연방 공휴일', isSubscribed: false},
    ],
  },
  {
    id: 'sub-group-sports',
    name: '스포츠',
    calendars: [
      {href: 'sub-kbo', name: 'KBO 일정', description: 'KBO 프로야구 경기 일정', isSubscribed: false},
      {href: 'sub-epl', name: 'EPL 일정', description: '잉글랜드 프리미어리그 일정', isSubscribed: false},
    ],
  },
];

// ============================================================
// POI 히스토리
// ============================================================

export const mockPOIHistory: CalendarPoi[] = [
  ...mockLocations,
  {name: '서울역', address: '서울 용산구 한강대로 405', latitude: 37.555946, longitude: 126.972317},
  {name: '코엑스', address: '서울 강남구 영동대로 513', latitude: 37.511843, longitude: 127.059157},
];
