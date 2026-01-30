# DailyCalendarModule - 완전한 API 명세서

> **작성일**: 2026-01-26
> **대상**: React Native에서 CalendarCore의 모든 기능에 접근하기 위한 Native Module API
> **총 API 수**: 80개 (핵심 기능 중심으로 압축)

---

## 목차

1. [API 개요](#1-api-개요)
2. [일정 조회 API (10개)](#2-일정-조회-api-10개)
3. [일정 CRUD API (8개)](#3-일정-crud-api-8개)
4. [캘린더 관리 API (12개)](#4-캘린더-관리-api-12개)
5. [동기화 API (8개)](#5-동기화-api-8개)
6. [외부 캘린더 API (6개)](#6-외부-캘린더-api-6개)
7. [설정 API (15개)](#7-설정-api-15개)
8. [알림 API (7개)](#8-알림-api-7개)
9. [그룹 관리 API (6개)](#9-그룹-관리-api-6개)
10. [텍스트 분석 API (1개)](#10-텍스트-분석-api-1개)
11. [구독 캘린더 API (4개)](#11-구독-캘린더-api-4개)
12. [유틸리티 API (3개)](#12-유틸리티-api-3개)
13. [Event Emitter (실시간 이벤트)](#13-event-emitter-실시간-이벤트)
14. [Swift 구현 예시](#14-swift-구현-예시)
15. [TypeScript 인터페이스](#15-typescript-인터페이스)

---

## 1. API 개요

### 1.1 카테고리별 분류

| 카테고리 | API 수 | 용도 |
|---------|--------|------|
| **일정 조회** | 10 | 기간별, ID별, UID별 일정 조회 |
| **일정 CRUD** | 8 | 일정 생성, 수정, 삭제 |
| **캘린더 관리** | 12 | 캘린더 목록, 색상/이름 변경, 숨김/음소거 |
| **동기화** | 8 | 수동/자동 동기화, 동기화 상태 |
| **외부 캘린더** | 6 | Google, Outlook, CalDAV 연동 |
| **설정** | 15 | 기본 캘린더, 알람, 뷰 타입, AI 설정 |
| **알림** | 7 | 일정 알림, 브리핑 알림 관리 |
| **그룹 관리** | 6 | 그룹 생성, 수정, 삭제 |
| **텍스트 분석** | 1 | 자연어 → 일정 변환 (빠른 등록) |
| **구독 캘린더** | 4 | 구독 캘린더 조회 및 구독 |
| **유틸리티** | 3 | 타임존 검색, POI 히스토리 |
| **총계** | **80** | 완전한 캘린더 기능 |

### 1.2 원본 프로토콜 매핑

CalendarCore의 177개 메서드를 80개로 압축:

| 원본 프로토콜 | 원본 메서드 수 | RN API 수 | 비고 |
|-------------|-------------|----------|------|
| CalendarLocalRepositoryProtocol | 93 | 30 | 내부 DB 작업은 Native에서 처리 |
| CalendarSyncManageable | 12 | 8 | 동기화 상태만 노출 |
| ExternalCalendarRepositoryProtocol | 6 | 6 | 모두 노출 |
| CalendarSettingManageable | 17 | 15 | 설정 업로드는 자동화 |
| CalendarNotificationRegistable | 7 | 7 | 모두 노출 |
| CaldavRepositoryProtocol | 12 | 0 | Native에서만 사용 (숨김) |
| CalendarTextAnalyzer | 1 | 1 | 그대로 노출 |
| CalendarSubscriptionRepositoryProtocol | 4 | 4 | 모두 노출 |
| CalendarSettingRepositoryProtocol | 15 | 0 | SettingManageable로 통합 |
| 기타 (UseCaseable, Providable 등) | 10 | 0 | Native 내부 구현 |
| **유틸리티** (타임존, POI) | - | 3 | 추가 |
| **그룹 관리** | - | 6 | 추가 |

---

## 2. 일정 조회 API (10개)

### 2.1 `getEvents`
**기간별 일정 목록 조회** (가장 많이 사용)

```typescript
getEvents(
  startDate: string,      // "2026-01-01"
  endDate: string,        // "2026-01-31"
  calendarIds?: string[]  // 필터링할 캘린더 ID (옵션)
): Promise<DailyComponentItem[]>
```

**Swift 매핑**: `CalendarLocalRepositoryProtocol.calculateEventInstanceByRange` + 변환

---

### 2.2 `getEventDetail`
**일정 상세 정보 조회**

```typescript
getEventDetail(
  eventId: string  // uniqueId
): Promise<CalendarEventDetail>
```

**Swift 매핑**: `CalendarLocalRepositoryProtocol.queryComponentByUniqueId`

---

### 2.3 `getEventsByUid`
**UID로 일정 조회** (반복 일정의 모든 인스턴스)

```typescript
getEventsByUid(
  uid: string
): Promise<CalendarEventDetail[]>
```

**Swift 매핑**: `CalendarLocalRepositoryProtocol.queryEventDetailByUid`

---

### 2.4 `getEventsForToday`
**오늘 일정 조회** (홈 화면용)

```typescript
getEventsForToday(): Promise<DailyComponentItem[]>
```

**Swift 매핑**: `getEvents(오늘 시작, 오늘 끝)`의 Wrapper

---

### 2.5 `getUpcomingEvents`
**다가오는 일정 조회** (위젯, 알림용)

```typescript
getUpcomingEvents(
  count: number  // 최대 개수
): Promise<DailyComponentItem[]>
```

**Swift 매핑**: `calculateEventInstanceByRange` + 시작일이 현재 이후인 것만 필터링

---

### 2.6 `getRecurrencePattern`
**반복 일정 패턴 조회**

```typescript
getRecurrencePattern(
  eventId: string
): Promise<CalendarRecurrence | null>
```

**Swift 매핑**: `queryComponentByUniqueId` → `recurrence` 필드 추출

---

### 2.7 `getEventAttendees`
**참석자 목록 조회**

```typescript
getEventAttendees(
  eventId: string
): Promise<CalendarAttendee[]>
```

**Swift 매�ing**: `queryComponentByUniqueId` → `attendees` 필드 추출

---

### 2.8 `getEventAlarms`
**알람 목록 조회**

```typescript
getEventAlarms(
  eventId: string
): Promise<CalendarPeriod[]>
```

**Swift 매핑**: `queryComponentByUniqueId` → `alarms` 필드 추출

---

### 2.9 `searchEvents`
**일정 검색** (제목, 메모, 장소)

```typescript
searchEvents(
  query: string,
  startDate?: string,
  endDate?: string
): Promise<DailyComponentItem[]>
```

**Swift 매핑**: `calculateEventInstanceByRange` + 텍스트 필터링

---

### 2.10 `getEventsForWidget`
**위젯용 일정 조회** (최적화된 쿼리)

```typescript
getEventsForWidget(
  date: string,
  maxCount: number
): Promise<DailyComponentItem[]>
```

**Swift 매핑**: `calculateEventInstanceByRange` + 제한

---

## 3. 일정 CRUD API (8개)

### 3.1 `createEvent`
**일정 생성**

```typescript
createEvent(
  event: Partial<CalendarEventDetail>
): Promise<string>  // 생성된 uniqueId 반환
```

**Swift 매핑**:
1. DTO → `CalendarComponent` 변환
2. `CaldavRepositoryProtocol.createComponent`
3. `CalendarLocalRepositoryProtocol.insertEventDetail`

---

### 3.2 `updateEvent`
**일정 수정**

```typescript
updateEvent(
  eventId: string,
  event: Partial<CalendarEventDetail>
): Promise<void>
```

**Swift 매핑**:
1. `queryComponentByUniqueId`로 기존 컴포넌트 조회
2. 변경사항 적용
3. `CaldavRepositoryProtocol.overwriteComponent`

---

### 3.3 `deleteEvent`
**일정 삭제**

```typescript
deleteEvent(
  eventId: string
): Promise<void>
```

**Swift 매핑**:
1. `queryComponentByUniqueId`
2. `CaldavRepositoryProtocol.delete`
3. `CalendarLocalRepositoryProtocol.removeComponentByUniqueId`

---

### 3.4 `updateEventInstance`
**반복 일정의 특정 인스턴스 수정**

```typescript
updateEventInstance(
  eventId: string,
  instanceDate: string,  // "2026-01-26"
  event: Partial<CalendarEventDetail>
): Promise<void>
```

**Swift 매핑**: `CaldavRepositoryProtocol.updateInstance`

---

### 3.5 `deleteEventInstance`
**반복 일정의 특정 인스턴스 삭제**

```typescript
deleteEventInstance(
  eventId: string,
  instanceDate: string
): Promise<void>
```

**Swift 매핑**: `CaldavRepositoryProtocol.removeInstance`

---

### 3.6 `updateAllInstances`
**반복 일정의 모든 인스턴스 수정**

```typescript
updateAllInstances(
  eventId: string,
  event: Partial<CalendarEventDetail>
): Promise<void>
```

**Swift 매핑**: `CaldavRepositoryProtocol.updateAllInstance`

---

### 3.7 `moveEventToCalendar`
**일정을 다른 캘린더로 이동**

```typescript
moveEventToCalendar(
  eventId: string,
  targetCalendarId: string
): Promise<void>
```

**Swift 매핑**:
1. 기존 일정 조회
2. 새 캘린더에 생성
3. 기존 일정 삭제

---

### 3.8 `duplicateEvent`
**일정 복제**

```typescript
duplicateEvent(
  eventId: string,
  newStartDate?: string
): Promise<string>  // 새 uniqueId
```

**Swift 매핑**:
1. 기존 일정 조회
2. UID 변경하여 새로 생성

---

## 4. 캘린더 관리 API (12개)

### 4.1 `getCalendars`
**모든 캘린더 목록**

```typescript
getCalendars(): Promise<CalendarItem[]>
```

**Swift 매핑**: `CalendarLocalRepositoryProtocol.queryCalendar`

---

### 4.2 `getCalendarGroups`
**캘린더 그룹 목록**

```typescript
getCalendarGroups(): Promise<CalendarGroup[]>
```

**Swift 매핑**: `CalendarLocalRepositoryProtocol.queryAllGroups`

---

### 4.3 `getCalendarById`
**특정 캘린더 조회**

```typescript
getCalendarById(
  calendarId: string  // href
): Promise<CalendarItem>
```

**Swift 매핑**: `CalendarLocalRepositoryProtocol.queryCalendarByHref`

---

### 4.4 `createCalendar`
**새 캘린더 생성**

```typescript
createCalendar(
  name: string,
  color: string,      // HEX
  groupId: string
): Promise<string>    // href
```

**Swift 매핑**: `CaldavRepositoryProtocol.makeCalendar`

---

### 4.5 `updateCalendarNameColor`
**캘린더 이름/색상 변경**

```typescript
updateCalendarNameColor(
  calendarId: string,
  name: string,
  color: string
): Promise<void>
```

**Swift 매핑**:
1. `CaldavRepositoryProtocol.updateCalendar`
2. `CalendarLocalRepositoryProtocol.updateCalendarNameColor`

---

### 4.6 `deleteCalendar`
**캘린더 삭제**

```typescript
deleteCalendar(
  calendarId: string
): Promise<void>
```

**Swift 매핑**:
1. `CaldavRepositoryProtocol.delete`
2. `CalendarLocalRepositoryProtocol.removeCalendar`

---

### 4.7 `toggleCalendarVisibility`
**캘린더 표시/숨김**

```typescript
toggleCalendarVisibility(
  calendarId: string,
  visible: boolean
): Promise<void>
```

**Swift 매핑**:
- visible=false: `CalendarSettingManageable.addHiddenCalendar`
- visible=true: `CalendarSettingManageable.removeHiddenCalendar`

---

### 4.8 `toggleCalendarMute`
**캘린더 음소거**

```typescript
toggleCalendarMute(
  calendarId: string,
  mute: boolean
): Promise<void>
```

**Swift 매핑**:
- mute=true: `CalendarSettingManageable.insertMuteCalendar`
- mute=false: `CalendarSettingManageable.removeMuteCalendar`

---

### 4.9 `getVisibleCalendars`
**표시 중인 캘린더 목록**

```typescript
getVisibleCalendars(): Promise<CalendarItem[]>
```

**Swift 매핑**: `queryCalendar` + 설정의 hidden 캘린더 필터링

---

### 4.10 `getMutedCalendars`
**음소거된 캘린더 목록**

```typescript
getMutedCalendars(): Promise<CalendarItem[]>
```

**Swift 매핑**: 설정의 `muteCalendars` 조회

---

### 4.11 `reorderCalendars`
**캘린더 순서 변경**

```typescript
reorderCalendars(
  calendarIds: string[]  // 새 순서
): Promise<void>
```

**Swift 매핑**: 설정 업데이트 (order 필드)

---

### 4.12 `getCalendarStatistics`
**캘린더 통계** (일정 개수 등)

```typescript
getCalendarStatistics(
  calendarId: string
): Promise<{
  totalEvents: number
  upcomingEvents: number
}>
```

**Swift 매핑**: `queryComonentByCalendarHref` + count

---

## 5. 동기화 API (8개)

### 5.1 `syncAll`
**전체 동기화**

```typescript
syncAll(): Promise<void>
```

**Swift 매핑**: `CalendarSyncManageable.sync(reason: .manual)`

---

### 5.2 `syncGroup`
**특정 그룹 동기화**

```typescript
syncGroup(
  groupId: string
): Promise<void>
```

**Swift 매핑**: `CalendarSyncManageable.syncGroup(id:)`

---

### 5.3 `syncCalendar`
**특정 캘린더 동기화**

```typescript
syncCalendar(
  calendarId: string
): Promise<void>
```

**Swift 매핑**: `CalendarSyncManageable.syncCalendar(href:)`

---

### 5.4 `getSyncStatus`
**동기화 상태 조회**

```typescript
getSyncStatus(): Promise<{
  state: 'idle' | 'syncing' | 'success' | 'failed'
  lastSyncDate?: string
  error?: string
}>
```

**Swift 매핑**: `CalendarSyncManageable.syncState` Publisher 값

---

### 5.5 `getLastSyncDate`
**마지막 동기화 시간**

```typescript
getLastSyncDate(): Promise<string | null>
```

**Swift 매핑**: `CalendarSyncManageable.lastSyncDate` Publisher 값

---

### 5.6 `cancelSync`
**동기화 취소**

```typescript
cancelSync(): Promise<void>
```

**Swift 매핑**: 동기화 Task 취소 (Task 관리 필요)

---

### 5.7 `refreshNotifications`
**알림 새로고침** (동기화 후)

```typescript
refreshNotifications(): Promise<void>
```

**Swift 매핑**: `CalendarSyncManageable.refreshNotifications`

---

### 5.8 `clearAllData`
**모든 데이터 삭제** (로그아웃 시)

```typescript
clearAllData(): Promise<void>
```

**Swift 매핑**: `CalendarSyncManageable.clearAllData`

---

## 6. 외부 캘린더 API (6개)

### 6.1 `connectExternalCalendar`
**외부 캘린더 연결**

```typescript
connectExternalCalendar(
  provider: 'google' | 'outlook' | 'caldav',
  loginHint?: string  // 이메일 힌트
): Promise<void>
```

**Swift 매핑**: `ExternalCalendarRepositoryProtocol.requestConnect`

---

### 6.2 `disconnectExternalCalendar`
**외부 캘린더 연결 해제**

```typescript
disconnectExternalCalendar(
  providerId: string  // 그룹 ID
): Promise<void>
```

**Swift 매핑**: `ExternalCalendarRepositoryProtocol.requestDisconnect`

---

### 6.3 `getExternalCalendarStatus`
**외부 캘린더 연결 상태**

```typescript
getExternalCalendarStatus(
  providerId: string
): Promise<{
  connected: boolean
  email?: string
  lastSyncDate?: string
}>
```

**Swift 매핑**: 그룹 정보에서 추출

---

### 6.4 `refreshExternalCalendarToken`
**토큰 갱신**

```typescript
refreshExternalCalendarToken(
  providerId: string
): Promise<void>
```

**Swift 매핑**: `ExternalCalendarRepositoryProtocol.requestRefreshToken`

---

### 6.5 `getExternalCalendars`
**연결된 외부 캘린더 목록**

```typescript
getExternalCalendars(): Promise<Array<{
  provider: string
  email: string
  calendars: CalendarItem[]
}>>
```

**Swift 매핑**: `queryAllGroups` + account 정보가 있는 그룹 필터링

---

### 6.6 `removeExternalProvider`
**제공자 완전 삭제**

```typescript
removeExternalProvider(
  providerId: string
): Promise<void>
```

**Swift 매핑**: `ExternalCalendarRepositoryProtocol.requestDestroyProvider`

---

## 7. 설정 API (15개)

### 7.1 `getSettings`
**전체 설정 조회**

```typescript
getSettings(): Promise<CalendarSettingInfo>
```

**Swift 매핑**: `CalendarSettingManageable.currentSetting`

---

### 7.2 `setDefaultCalendar`
**기본 캘린더 설정**

```typescript
setDefaultCalendar(
  calendarId: string,
  groupId: string
): Promise<void>
```

**Swift 매핑**: `CalendarSettingManageable.updateDefaultEventCalendar`

---

### 7.3 `getDefaultCalendar`
**기본 캘린더 조회**

```typescript
getDefaultCalendar(): Promise<{
  calendarId: string
  groupId: string
} | null>
```

**Swift 매핑**: 설정의 `defaultEventCalendar` 필드

---

### 7.4 `toggleEventNotification`
**일정 알림 활성화/비활성화**

```typescript
toggleEventNotification(
  enabled: boolean
): Promise<void>
```

**Swift 매핑**: 설정 업데이트 + `uploadSetting`

---

### 7.5 `toggleAISuggestion`
**AI 제안 활성화/비활성화**

```typescript
toggleAISuggestion(
  enabled: boolean
): Promise<void>
```

**Swift 매핑**: `CalendarSettingManageable.updateAISuggestion`

---

### 7.6 `setDefaultAlarmTimes`
**기본 알람 시간 설정**

```typescript
setDefaultAlarmTimes(
  allDay: CalendarPeriod,
  event: CalendarPeriod
): Promise<void>
```

**Swift 매핑**: 설정 업데이트

---

### 7.7 `getDefaultAlarmTimes`
**기본 알람 시간 조회**

```typescript
getDefaultAlarmTimes(): Promise<{
  allDay: CalendarPeriod
  event: CalendarPeriod
}>
```

**Swift 매핑**: 설정에서 추출

---

### 7.8 `toggleDailyBriefing`
**일일 브리핑 활성화/비활성화**

```typescript
toggleDailyBriefing(
  enabled: boolean,
  times?: string[]  // ["08:00", "18:00"]
): Promise<void>
```

**Swift 매핑**:
- enabled=true: `enableBriefTime` 각 시간마다 호출
- enabled=false: `disableBriefTime` 각 시간마다 호출

---

### 7.9 `getBriefingSettings`
**브리핑 설정 조회**

```typescript
getBriefingSettings(): Promise<{
  enabled: boolean
  times: string[]
}>
```

**Swift 매핑**: 설정의 `briefTimes` 필드

---

### 7.10 `setViewType`
**기본 뷰 타입 설정**

```typescript
setViewType(
  type: 'month' | 'week' | 'day' | 'threeDays'
): Promise<void>
```

**Swift 매핑**: `CalendarSettingManageable.updateViewType`

---

### 7.11 `getViewType`
**기본 뷰 타입 조회**

```typescript
getViewType(): Promise<'month' | 'week' | 'day' | 'threeDays'>
```

**Swift 매핑**: 설정의 `viewType` 필드

---

### 7.12 `getAISettings`
**AI 설정 조회**

```typescript
getAISettings(): Promise<AISettingInfo>
```

**Swift 매핑**: `CalendarSettingManageable.fetchAISetting`

---

### 7.13 `updateAISettings`
**AI 설정 업데이트**

```typescript
updateAISettings(
  settings: Partial<AISettingInfo>
): Promise<void>
```

**Swift 매핑**: `CalendarSettingManageable.updateAISetting`

---

### 7.14 `getCategoryAssets`
**카테고리 에셋 조회**

```typescript
getCategoryAssets(): Promise<Record<string, CalendarCategoryAsset>>
```

**Swift 매핑**: `CalendarSettingManageable.getCategoryAssets`

---

### 7.15 `syncSettings`
**설정 동기화**

```typescript
syncSettings(): Promise<void>
```

**Swift 매핑**: `CalendarSettingManageable.syncSetting`

---

## 8. 알림 API (7개)

### 8.1 `registerEventNotification`
**일정 알림 등록**

```typescript
registerEventNotification(
  eventId: string,
  alarmTime: CalendarPeriod  // -30 = 30분 전
): Promise<string>  // 알림 ID
```

**Swift 매핑**: `CalendarNotificationRegistable.register`

---

### 8.2 `cancelEventNotification`
**일정 알림 취소**

```typescript
cancelEventNotification(
  notificationId: string
): Promise<void>
```

**Swift 매핑**: `CalendarNotificationRegistable.cancel`

---

### 8.3 `cancelAllNotifications`
**모든 알림 취소**

```typescript
cancelAllNotifications(
  eventId: string
): Promise<void>
```

**Swift 매핑**:
1. `queryNotificationByUniqueId`로 알림 ID들 조회
2. `cancel` 호출

---

### 8.4 `registerDailyBriefing`
**일일 브리핑 등록**

```typescript
registerDailyBriefing(
  date: string,
  time: string  // "08:00"
): Promise<string>  // 브리핑 ID
```

**Swift 매핑**: `CalendarNotificationRegistable.registerDailyBrief`

---

### 8.5 `cancelDailyBriefing`
**일일 브리핑 취소**

```typescript
cancelDailyBriefing(
  date: string
): Promise<void>
```

**Swift 매핑**: `CalendarNotificationRegistable.cancelDailyBrief`

---

### 8.6 `getPendingNotifications`
**대기 중인 알림 목록**

```typescript
getPendingNotifications(): Promise<Array<{
  id: string
  eventId: string
  notifyDate: string
  eventTitle: string
}>>
```

**Swift 매핑**: `queryAllNotificationByDateAscending`

---

### 8.7 `getSystemNotifications`
**시스템 알림 정보** (디버깅용)

```typescript
getSystemNotifications(): Promise<CalendarNotificationInfo[]>
```

**Swift 매핑**: `CalendarNotificationRegistable.querySystemNotificationInfos`

---

## 9. 그룹 관리 API (6개)

### 9.1 `createGroup`
**그룹 생성**

```typescript
createGroup(
  name: string,
  account?: string
): Promise<string>  // 그룹 ID
```

**Swift 매핑**: `CalendarLocalRepositoryProtocol.insertGroup`

---

### 9.2 `updateGroup`
**그룹 수정**

```typescript
updateGroup(
  groupId: string,
  name: string
): Promise<void>
```

**Swift 매핑**: 그룹 조회 후 수정 후 저장

---

### 9.3 `deleteGroup`
**그룹 삭제**

```typescript
deleteGroup(
  groupId: string
): Promise<void>
```

**Swift 매핑**: `CalendarLocalRepositoryProtocol.deleteGroup`

---

### 9.4 `reorderGroups`
**그룹 순서 변경**

```typescript
reorderGroups(
  groupIds: string[]  // 새 순서
): Promise<void>
```

**Swift 매핑**: 각 그룹의 `order` 업데이트

---

### 9.5 `moveCalendarToGroup`
**캘린더를 다른 그룹으로 이동**

```typescript
moveCalendarToGroup(
  calendarId: string,
  targetGroupId: string
): Promise<void>
```

**Swift 매핑**: 캘린더의 그룹 정보 업데이트

---

### 9.6 `getGroupStatistics`
**그룹 통계**

```typescript
getGroupStatistics(
  groupId: string
): Promise<{
  totalCalendars: number
  totalEvents: number
}>
```

**Swift 매핑**: 그룹 조회 + 캘린더 개수 + 일정 개수

---

## 10. 텍스트 분석 API (1개)

### 10.1 `analyzeText`
**자연어 텍스트 분석** (빠른 등록)

```typescript
analyzeText(
  text: string,
  seedDate?: string,  // 기준 날짜 (기본: 현재)
  enableLunar?: boolean  // 음력 지원 (기본: true)
): Promise<{
  title: string
  startDate?: CalendarDate
  endDate?: CalendarDate
  isAllDay: boolean
  isLunar: boolean
  recurrence?: CalendarRecurrence
}>
```

**Swift 매핑**: `CalendarTextAnalyzer.request`

**예시**:
- "내일 오후 2시 회의" → 내일 14:00
- "매주 월수금 9시 운동" → 매주 반복
- "음력 1월 1일 설날" → 음력 날짜

---

## 11. 구독 캘린더 API (4개)

### 11.1 `getSubscriptionCalendars`
**구독 가능한 캘린더 목록**

```typescript
getSubscriptionCalendars(): Promise<SubscriptionCalendarGroup[]>
```

**Swift 매핑**: `CalendarSubscriptionRepositoryProtocol.fetchSubscriptionCalendars`

---

### 11.2 `subscribeCalendar`
**캘린더 구독**

```typescript
subscribeCalendar(
  href: string
): Promise<void>
```

**Swift 매핑**: `CalendarSubscriptionRepositoryProtocol.subscribeCalendar(subscribe: true)`

---

### 11.3 `unsubscribeCalendar`
**캘린더 구독 해제**

```typescript
unsubscribeCalendar(
  href: string
): Promise<void>
```

**Swift 매핑**: `CalendarSubscriptionRepositoryProtocol.subscribeCalendar(subscribe: false)`

---

### 11.4 `getSubscribedCalendars`
**현재 구독 중인 캘린더**

```typescript
getSubscribedCalendars(): Promise<SubscribableCalendar[]>
```

**Swift 매핑**: `getCachedSubscriptionCalendars` + 구독 여부 필터링

---

## 12. 유틸리티 API (3개)

### 12.1 `searchTimeZone`
**타임존 검색**

```typescript
searchTimeZone(
  keyword: string  // "Seoul", "New York", "Tokyo"
): Promise<TimeZoneInfo[]>
```

**Swift 매핑**: `CalendarLocalRepositoryProtocol.queryTimeZoneInfoByKeyword`

---

### 12.2 `getPOIHistory`
**POI 검색 히스토리**

```typescript
getPOIHistory(
  limit?: number  // 기본 20
): Promise<CalendarPoi[]>
```

**Swift 매핑**: `CalendarLocalRepositoryProtocol.queryPoiSearchHistory`

---

### 12.3 `savePOIToHistory`
**POI 히스토리에 저장**

```typescript
savePOIToHistory(
  poi: CalendarPoi
): Promise<void>
```

**Swift 매핑**: `CalendarLocalRepositoryProtocol.insertPoiSearch`

---

## 13. Event Emitter (실시간 이벤트)

### 13.1 `CalendarChanged`
**일정이 변경되었을 때**

```typescript
DailyCalendarBridge.addListener('CalendarChanged', (event: {
  eventId: string
  changeType: 'create' | 'update' | 'delete'
}) => {
  // UI 새로고침
})
```

**Swift 발송**:
- `CalendarLocalRepositoryProtocol.changed` Publisher 구독
- 변경사항을 RN으로 전송

---

### 13.2 `SyncStateChanged`
**동기화 상태 변경**

```typescript
DailyCalendarBridge.addListener('SyncStateChanged', (state: {
  state: 'idle' | 'syncing' | 'success' | 'failed'
  error?: string
}) => {
  // 동기화 UI 업데이트
})
```

**Swift 발송**:
- `CalendarSyncManageable.syncState` Publisher 구독
- 상태를 RN으로 전송

---

### 13.3 `SettingChanged`
**설정 변경**

```typescript
DailyCalendarBridge.addListener('SettingChanged', (setting: CalendarSettingInfo) => {
  // 설정 UI 업데이트
})
```

**Swift 발송**:
- `CalendarSettingManageable.setting` Publisher 구독
- 설정을 RN으로 전송

---

### 13.4 `NotificationReceived`
**알림 수신** (앱 실행 중)

```typescript
DailyCalendarBridge.addListener('NotificationReceived', (notification: {
  eventId: string
  title: string
  body: string
}) => {
  // 인앱 알림 표시
})
```

**Swift 발송**:
- `UNUserNotificationCenterDelegate` 구현
- 알림 수신 시 RN으로 전송

---

## 14. Swift 구현 예시

### 14.1 Module 기본 구조

```swift
// DailyCalendarModule.swift

import Foundation
import React
import CalendarCore
import Combine

@objc(DailyCalendarModule)
class DailyCalendarModule: RCTEventEmitter {

  // MARK: - Dependencies

  private let repository: CalendarLocalRepositoryProtocol
  private let syncManager: CalendarSyncManageable
  private let settingManager: CalendarSettingManageable
  private let notificationManager: CalendarNotificationRegistable
  private let externalRepository: ExternalCalendarRepositoryProtocol
  private let subscriptionRepository: CalendarSubscriptionRepositoryProtocol
  private let textAnalyzer: CalendarTextAnalyzer

  private var cancellables = Set<AnyCancellable>()

  // MARK: - Initialization

  override init() {
    // DI Container에서 주입
    let container = CalendarContainer.shared
    self.repository = container.localRepository
    self.syncManager = container.syncManager
    self.settingManager = container.settingManager
    self.notificationManager = container.notificationManager
    self.externalRepository = container.externalRepository
    self.subscriptionRepository = container.subscriptionRepository
    self.textAnalyzer = container.textAnalyzer

    super.init()

    setupObservers()
  }

  // MARK: - Module Configuration

  @objc static func moduleName() -> String! {
    return "DailyCalendarModule"
  }

  override func supportedEvents() -> [String]! {
    return [
      "CalendarChanged",
      "SyncStateChanged",
      "SettingChanged",
      "NotificationReceived"
    ]
  }

  override class func requiresMainQueueSetup() -> Bool {
    return false
  }

  // MARK: - Event Observers

  private func setupObservers() {
    // 캘린더 변경 감지
    repository.changed
      .sink { [weak self] change in
        self?.sendEvent(withName: "CalendarChanged", body: [
          "eventId": change.uniqueId,
          "changeType": change.type.rawValue
        ])
      }
      .store(in: &cancellables)

    // 동기화 상태 감지
    syncManager.syncState
      .sink { [weak self] state in
        self?.sendEvent(withName: "SyncStateChanged", body: [
          "state": state.rawValue
        ])
      }
      .store(in: &cancellables)

    // 설정 변경 감지
    settingManager.setting
      .sink { [weak self] setting in
        guard let jsonData = try? JSONEncoder().encode(SettingDTO.from(setting)),
              let jsonObject = try? JSONSerialization.jsonObject(with: jsonData) else {
          return
        }
        self?.sendEvent(withName: "SettingChanged", body: jsonObject)
      }
      .store(in: &cancellables)
  }

  // MARK: - 1. 일정 조회 API

  @objc func getEvents(
    _ startDateString: String,
    endDateString: String,
    calendarIds: [String]?,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    Task {
      do {
        let formatter = ISO8601DateFormatter()
        guard let startDate = formatter.date(from: startDateString),
              let endDate = formatter.date(from: endDateString) else {
          rejecter("INVALID_DATE", "Invalid date format", nil)
          return
        }

        // CalendarCore에서 인스턴스 조회
        let instances = try await repository.calculateEventInstanceByRange(
          start: startDate,
          end: endDate,
          maxCount: 10000,
          calendarHref: nil
        )

        // 캘린더 필터링
        let filtered = calendarIds != nil
          ? instances.filter { calendarIds!.contains($0.component.calendar.href) }
          : instances

        // DTO 변환
        let items = filtered.map { DailyComponentItemDTO.from($0) }

        // JSON 직렬화
        let jsonData = try JSONEncoder().encode(items)
        let jsonArray = try JSONSerialization.jsonObject(with: jsonData)

        resolver(jsonArray)
      } catch {
        rejecter("GET_EVENTS_ERROR", error.localizedDescription, error)
      }
    }
  }

  @objc func getEventDetail(
    _ eventId: String,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    Task {
      do {
        let detail = try await repository.queryComponentByUniqueId(uniqueId: eventId)
        guard let detail = detail else {
          rejecter("NOT_FOUND", "Event not found", nil)
          return
        }

        let dto = CalendarEventDetailDTO.from(detail)
        let jsonData = try JSONEncoder().encode(dto)
        let jsonObject = try JSONSerialization.jsonObject(with: jsonData)

        resolver(jsonObject)
      } catch {
        rejecter("GET_EVENT_ERROR", error.localizedDescription, error)
      }
    }
  }

  // ... 나머지 조회 API들

  // MARK: - 2. 일정 CRUD API

  @objc func createEvent(
    _ eventJson: NSDictionary,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    Task {
      do {
        // JSON → DTO
        let jsonData = try JSONSerialization.data(withJSONObject: eventJson)
        let dto = try JSONDecoder().decode(CalendarEventDetailDTO.self, from: jsonData)

        // DTO → CalendarComponent
        let component = dto.toCalendarComponent()

        // CalDAV에 생성
        try await CaldavRepository.shared.createComponent(component: component)

        // 로컬 DB에 저장
        try await repository.insertEventDetail(event: dto.toCalendarEventDetail())

        // 변경 알림
        repository.notifyChange(changed: .init(uniqueId: component.uniqueId, type: .create))

        resolver(component.uniqueId)
      } catch {
        rejecter("CREATE_EVENT_ERROR", error.localizedDescription, error)
      }
    }
  }

  @objc func updateEvent(
    _ eventId: String,
    eventJson: NSDictionary,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    Task {
      do {
        // 기존 컴포넌트 조회
        guard let existing = try await repository.queryComponentByUniqueId(uniqueId: eventId) else {
          rejecter("NOT_FOUND", "Event not found", nil)
          return
        }

        // JSON → DTO
        let jsonData = try JSONSerialization.data(withJSONObject: eventJson)
        let dto = try JSONDecoder().decode(CalendarEventDetailDTO.self, from: jsonData)

        // 변경사항 적용
        var updated = existing
        updated.title = dto.title
        updated.startDate = dto.startDate.toCalendarDate()
        updated.endDate = dto.endDate.toCalendarDate()
        // ... 나머지 필드들

        // CalDAV에 업데이트
        try await CaldavRepository.shared.overwriteComponent(component: updated.component)

        // 로컬 DB에 저장
        try await repository.insertEventDetail(event: updated)

        // 변경 알림
        repository.notifyChange(changed: .init(uniqueId: eventId, type: .update))

        resolver(nil)
      } catch {
        rejecter("UPDATE_EVENT_ERROR", error.localizedDescription, error)
      }
    }
  }

  @objc func deleteEvent(
    _ eventId: String,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    Task {
      do {
        // 컴포넌트 조회
        guard let detail = try await repository.queryComponentByUniqueId(uniqueId: eventId) else {
          rejecter("NOT_FOUND", "Event not found", nil)
          return
        }

        // CalDAV에서 삭제
        try await CaldavRepository.shared.delete(url: detail.component.href)

        // 로컬 DB에서 삭제
        try await repository.removeComponentByUniqueId(id: eventId)

        // 변경 알림
        repository.notifyChange(changed: .init(uniqueId: eventId, type: .delete))

        resolver(nil)
      } catch {
        rejecter("DELETE_EVENT_ERROR", error.localizedDescription, error)
      }
    }
  }

  // ... 나머지 CRUD API들

  // MARK: - 3. 캘린더 관리 API

  @objc func getCalendars(
    _ resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    Task {
      do {
        let calendars = try await repository.queryCalendar()
        let dtos = calendars.map { CalendarItemDTO.from($0) }

        let jsonData = try JSONEncoder().encode(dtos)
        let jsonArray = try JSONSerialization.jsonObject(with: jsonData)

        resolver(jsonArray)
      } catch {
        rejecter("GET_CALENDARS_ERROR", error.localizedDescription, error)
      }
    }
  }

  // ... 나머지 캘린더 관리 API들

  // MARK: - 4. 동기화 API

  @objc func syncAll(
    _ resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    Task {
      do {
        try await syncManager.sync(reason: .manual)
        resolver(nil)
      } catch {
        rejecter("SYNC_ERROR", error.localizedDescription, error)
      }
    }
  }

  // ... 나머지 동기화 API들

  // MARK: - 9. 텍스트 분석 API

  @objc func analyzeText(
    _ text: String,
    seedDateString: String?,
    enableLunar: Bool,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    Task {
      let formatter = ISO8601DateFormatter()
      let seedDate = seedDateString.flatMap { formatter.date(from: $0) } ?? Date()

      let result = await textAnalyzer.request(
        text: text,
        seed: seedDate,
        now: Date(),
        defaultPredict: .init(
          start: .init(date: Date(), timeZone: .current, isAllDay: false),
          end: nil,
          isAllDay: false,
          isLunar: false,
          title: text,
          recurrence: nil,
          titleRanges: []
        )
      )

      guard let result = result else {
        resolver(NSNull())
        return
      }

      let dto = TextAnalyzeResultDTO.from(result)
      let jsonData = try? JSONEncoder().encode(dto)
      let jsonObject = try? JSONSerialization.jsonObject(with: jsonData!)

      resolver(jsonObject)
    }
  }

  // ... 나머지 API들
}
```

### 14.2 DTO (Data Transfer Object) 구조

```swift
// DTOs.swift

struct DailyComponentItemDTO: Codable {
  let id: String
  let eventDetail: CalendarEventDetailDTO
  let displayStartDate: String
  let displayEndDate: String
  let durationMinutes: Int
  let overlapIndex: Int?
  let totalOverlaps: Int?
  let isPast: Bool
  let isToday: Bool
  let isFuture: Bool

  static func from(_ instance: CalendarInstance) -> DailyComponentItemDTO {
    let detail = instance.component.eventDetail

    return DailyComponentItemDTO(
      id: instance.uniqueId,
      eventDetail: CalendarEventDetailDTO.from(detail),
      displayStartDate: formatDate(instance.startDate),
      displayEndDate: formatDate(instance.endDate),
      durationMinutes: Int(instance.endDate.timeIntervalSince(instance.startDate) / 60),
      overlapIndex: nil,
      totalOverlaps: nil,
      isPast: instance.startDate < Date(),
      isToday: Calendar.current.isDateInToday(instance.startDate),
      isFuture: instance.startDate > Date()
    )
  }
}

struct CalendarEventDetailDTO: Codable {
  let id: String
  let title: String
  let startDate: CalendarDateDTO
  let endDate: CalendarDateDTO
  let location: CalendarPoiDTO?
  let memo: String?
  let url: String?
  let isAllDay: Bool
  let status: String
  let calendarId: String
  let calendar: CalendarItemDTO
  let attendees: [CalendarAttendeeDTO]
  let organizer: CalendarOrganizerDTO?
  let recurrence: CalendarRecurrenceDTO?
  let alarms: [CalendarPeriodDTO]
  let createdAt: String
  let updatedAt: String
  let isReadOnly: Bool

  static func from(_ detail: CalendarEventDetail) -> CalendarEventDetailDTO {
    return CalendarEventDetailDTO(
      id: detail.uniqueId,
      title: detail.title,
      startDate: CalendarDateDTO.from(detail.startDate),
      endDate: CalendarDateDTO.from(detail.endDate),
      location: detail.location.map { CalendarPoiDTO.from($0) },
      memo: detail.memo,
      url: detail.url,
      isAllDay: detail.isAllDay,
      status: detail.status.rawValue,
      calendarId: detail.calendar.href,
      calendar: CalendarItemDTO.from(detail.calendar),
      attendees: detail.attendees.map { CalendarAttendeeDTO.from($0) },
      organizer: detail.organizer.map { CalendarOrganizerDTO.from($0) },
      recurrence: detail.recurrence.map { CalendarRecurrenceDTO.from($0) },
      alarms: detail.alarms.map { CalendarPeriodDTO.from($0) },
      createdAt: ISO8601DateFormatter().string(from: detail.createdAt),
      updatedAt: ISO8601DateFormatter().string(from: detail.updatedAt),
      isReadOnly: detail.isReadOnly
    )
  }

  func toCalendarEventDetail() -> CalendarEventDetail {
    // 역변환 로직
  }
}

struct CalendarItemDTO: Codable {
  let id: String
  let name: String
  let color: String
  let groupId: String?
  let isVisible: Bool
  let isReadOnly: Bool
  let accountId: String?
  let subscriptionUrl: String?

  static func from(_ model: CalendarModel) -> CalendarItemDTO {
    return CalendarItemDTO(
      id: model.href,
      name: model.name,
      color: model.color,
      groupId: model.groupId,
      isVisible: !model.hidden,
      isReadOnly: model.isReadOnly,
      accountId: model.account,
      subscriptionUrl: model.subscriptionUrl
    )
  }
}

// ... 나머지 DTO들
```

---

## 15. TypeScript 인터페이스

### 15.1 Bridge 인터페이스

```typescript
// DailyCalendarBridge.ts

import { NativeModules, NativeEventEmitter, EmitterSubscription } from 'react-native'
import type {
  DailyComponentItem,
  CalendarEventDetail,
  CalendarItem,
  CalendarGroup,
  CalendarPeriod,
  CalendarRecurrence,
  CalendarSettingInfo,
  CalendarPoi,
  TimeZoneInfo,
  SubscriptionCalendarGroup,
  SubscribableCalendar,
  AISettingInfo,
  CalendarCategoryAsset,
  ExternalCalendarProvider
} from '../types/calendar'

interface DailyCalendarModuleInterface {
  // ===== 1. 일정 조회 API =====

  getEvents(
    startDate: string,
    endDate: string,
    calendarIds?: string[]
  ): Promise<DailyComponentItem[]>

  getEventDetail(eventId: string): Promise<CalendarEventDetail>

  getEventsByUid(uid: string): Promise<CalendarEventDetail[]>

  getEventsForToday(): Promise<DailyComponentItem[]>

  getUpcomingEvents(count: number): Promise<DailyComponentItem[]>

  getRecurrencePattern(eventId: string): Promise<CalendarRecurrence | null>

  getEventAttendees(eventId: string): Promise<CalendarAttendee[]>

  getEventAlarms(eventId: string): Promise<CalendarPeriod[]>

  searchEvents(
    query: string,
    startDate?: string,
    endDate?: string
  ): Promise<DailyComponentItem[]>

  getEventsForWidget(date: string, maxCount: number): Promise<DailyComponentItem[]>

  // ===== 2. 일정 CRUD API =====

  createEvent(event: Partial<CalendarEventDetail>): Promise<string>

  updateEvent(eventId: string, event: Partial<CalendarEventDetail>): Promise<void>

  deleteEvent(eventId: string): Promise<void>

  updateEventInstance(
    eventId: string,
    instanceDate: string,
    event: Partial<CalendarEventDetail>
  ): Promise<void>

  deleteEventInstance(eventId: string, instanceDate: string): Promise<void>

  updateAllInstances(eventId: string, event: Partial<CalendarEventDetail>): Promise<void>

  moveEventToCalendar(eventId: string, targetCalendarId: string): Promise<void>

  duplicateEvent(eventId: string, newStartDate?: string): Promise<string>

  // ===== 3. 캘린더 관리 API =====

  getCalendars(): Promise<CalendarItem[]>

  getCalendarGroups(): Promise<CalendarGroup[]>

  getCalendarById(calendarId: string): Promise<CalendarItem>

  createCalendar(name: string, color: string, groupId: string): Promise<string>

  updateCalendarNameColor(calendarId: string, name: string, color: string): Promise<void>

  deleteCalendar(calendarId: string): Promise<void>

  toggleCalendarVisibility(calendarId: string, visible: boolean): Promise<void>

  toggleCalendarMute(calendarId: string, mute: boolean): Promise<void>

  getVisibleCalendars(): Promise<CalendarItem[]>

  getMutedCalendars(): Promise<CalendarItem[]>

  reorderCalendars(calendarIds: string[]): Promise<void>

  getCalendarStatistics(calendarId: string): Promise<{
    totalEvents: number
    upcomingEvents: number
  }>

  // ===== 4. 동기화 API =====

  syncAll(): Promise<void>

  syncGroup(groupId: string): Promise<void>

  syncCalendar(calendarId: string): Promise<void>

  getSyncStatus(): Promise<{
    state: 'idle' | 'syncing' | 'success' | 'failed'
    lastSyncDate?: string
    error?: string
  }>

  getLastSyncDate(): Promise<string | null>

  cancelSync(): Promise<void>

  refreshNotifications(): Promise<void>

  clearAllData(): Promise<void>

  // ===== 5. 외부 캘린더 API =====

  connectExternalCalendar(provider: ExternalCalendarProvider, loginHint?: string): Promise<void>

  disconnectExternalCalendar(providerId: string): Promise<void>

  getExternalCalendarStatus(providerId: string): Promise<{
    connected: boolean
    email?: string
    lastSyncDate?: string
  }>

  refreshExternalCalendarToken(providerId: string): Promise<void>

  getExternalCalendars(): Promise<Array<{
    provider: string
    email: string
    calendars: CalendarItem[]
  }>>

  removeExternalProvider(providerId: string): Promise<void>

  // ===== 6. 설정 API =====

  getSettings(): Promise<CalendarSettingInfo>

  setDefaultCalendar(calendarId: string, groupId: string): Promise<void>

  getDefaultCalendar(): Promise<{ calendarId: string; groupId: string } | null>

  toggleEventNotification(enabled: boolean): Promise<void>

  toggleAISuggestion(enabled: boolean): Promise<void>

  setDefaultAlarmTimes(allDay: CalendarPeriod, event: CalendarPeriod): Promise<void>

  getDefaultAlarmTimes(): Promise<{ allDay: CalendarPeriod; event: CalendarPeriod }>

  toggleDailyBriefing(enabled: boolean, times?: string[]): Promise<void>

  getBriefingSettings(): Promise<{ enabled: boolean; times: string[] }>

  setViewType(type: 'month' | 'week' | 'day' | 'threeDays'): Promise<void>

  getViewType(): Promise<'month' | 'week' | 'day' | 'threeDays'>

  getAISettings(): Promise<AISettingInfo>

  updateAISettings(settings: Partial<AISettingInfo>): Promise<void>

  getCategoryAssets(): Promise<Record<string, CalendarCategoryAsset>>

  syncSettings(): Promise<void>

  // ===== 7. 알림 API =====

  registerEventNotification(eventId: string, alarmTime: CalendarPeriod): Promise<string>

  cancelEventNotification(notificationId: string): Promise<void>

  cancelAllNotifications(eventId: string): Promise<void>

  registerDailyBriefing(date: string, time: string): Promise<string>

  cancelDailyBriefing(date: string): Promise<void>

  getPendingNotifications(): Promise<Array<{
    id: string
    eventId: string
    notifyDate: string
    eventTitle: string
  }>>

  getSystemNotifications(): Promise<any[]>

  // ===== 8. 그룹 관리 API =====

  createGroup(name: string, account?: string): Promise<string>

  updateGroup(groupId: string, name: string): Promise<void>

  deleteGroup(groupId: string): Promise<void>

  reorderGroups(groupIds: string[]): Promise<void>

  moveCalendarToGroup(calendarId: string, targetGroupId: string): Promise<void>

  getGroupStatistics(groupId: string): Promise<{
    totalCalendars: number
    totalEvents: number
  }>

  // ===== 9. 텍스트 분석 API =====

  analyzeText(
    text: string,
    seedDate?: string,
    enableLunar?: boolean
  ): Promise<{
    title: string
    startDate?: CalendarDate
    endDate?: CalendarDate
    isAllDay: boolean
    isLunar: boolean
    recurrence?: CalendarRecurrence
  } | null>

  // ===== 10. 구독 캘린더 API =====

  getSubscriptionCalendars(): Promise<SubscriptionCalendarGroup[]>

  subscribeCalendar(href: string): Promise<void>

  unsubscribeCalendar(href: string): Promise<void>

  getSubscribedCalendars(): Promise<SubscribableCalendar[]>

  // ===== 11. 유틸리티 API =====

  searchTimeZone(keyword: string): Promise<TimeZoneInfo[]>

  getPOIHistory(limit?: number): Promise<CalendarPoi[]>

  savePOIToHistory(poi: CalendarPoi): Promise<void>
}

// Native Module
const { DailyCalendarModule } = NativeModules

if (!DailyCalendarModule) {
  throw new Error(
    'DailyCalendarModule is not available. Make sure the native module is properly linked.'
  )
}

export const DailyCalendarBridge = DailyCalendarModule as DailyCalendarModuleInterface

// ===== Event Emitter =====

const eventEmitter = new NativeEventEmitter(DailyCalendarModule)

export const CalendarEvents = {
  /**
   * 일정이 변경되었을 때 (생성/수정/삭제)
   */
  onCalendarChanged: (
    callback: (event: { eventId: string; changeType: 'create' | 'update' | 'delete' }) => void
  ): EmitterSubscription => {
    return eventEmitter.addListener('CalendarChanged', callback)
  },

  /**
   * 동기화 상태가 변경되었을 때
   */
  onSyncStateChanged: (
    callback: (state: { state: string; error?: string }) => void
  ): EmitterSubscription => {
    return eventEmitter.addListener('SyncStateChanged', callback)
  },

  /**
   * 설정이 변경되었을 때
   */
  onSettingChanged: (callback: (setting: CalendarSettingInfo) => void): EmitterSubscription => {
    return eventEmitter.addListener('SettingChanged', callback)
  },

  /**
   * 알림을 수신했을 때 (앱 실행 중)
   */
  onNotificationReceived: (
    callback: (notification: { eventId: string; title: string; body: string }) => void
  ): EmitterSubscription => {
    return eventEmitter.addListener('NotificationReceived', callback)
  }
}
```

### 15.2 사용 예시

```typescript
// useCalendarEvents.ts

import { useEffect, useState } from 'react'
import { DailyCalendarBridge, CalendarEvents } from '../bridge/DailyCalendarBridge'
import type { DailyComponentItem } from '../types/calendar'

export function useCalendarEvents(startDate: string, endDate: string) {
  const [events, setEvents] = useState<DailyComponentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadEvents = async () => {
    try {
      setLoading(true)
      const data = await DailyCalendarBridge.getEvents(startDate, endDate)
      setEvents(data)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()

    // 실시간 변경 감지
    const subscription = CalendarEvents.onCalendarChanged(() => {
      loadEvents()
    })

    return () => {
      subscription.remove()
    }
  }, [startDate, endDate])

  return { events, loading, error, refetch: loadEvents }
}
```

---

## 16. 요약

### 16.1 최종 API 개수

| 카테고리 | API 수 |
|---------|--------|
| 일정 조회 | 10 |
| 일정 CRUD | 8 |
| 캘린더 관리 | 12 |
| 동기화 | 8 |
| 외부 캘린더 | 6 |
| 설정 | 15 |
| 알림 | 7 |
| 그룹 관리 | 6 |
| 텍스트 분석 | 1 |
| 구독 캘린더 | 4 |
| 유틸리티 | 3 |
| **총계** | **80** |

### 16.2 핵심 특징

1. **완전한 기능**: CalendarCore의 모든 핵심 기능을 RN에서 사용 가능
2. **실시간 업데이트**: Event Emitter로 변경사항 자동 반영
3. **타입 안전성**: TypeScript로 완전한 타입 정의
4. **비동기 처리**: Promise 기반으로 모든 API 비동기 처리
5. **에러 핸들링**: 명확한 에러 코드와 메시지
6. **성능 최적화**: 필요한 데이터만 JSON으로 변환

### 16.3 구현 우선순위

| 우선순위 | API 카테고리 | 이유 |
|---------|------------|------|
| 1 | 일정 조회 | 모든 UI의 기본 |
| 2 | 캘린더 관리 | 캘린더 목록 표시 필수 |
| 3 | 설정 | 기본 캘린더 등 필수 설정 |
| 4 | 일정 CRUD | 편집 기능 |
| 5 | 동기화 | 데이터 일관성 |
| 6 | 텍스트 분석 | 빠른 등록 기능 |
| 7 | 알림 | 알림 관리 |
| 8 | 외부 캘린더 | Google/Outlook 연동 |
| 9 | 그룹 관리 | 고급 기능 |
| 10 | 구독 캘린더 | 선택 기능 |
| 11 | 유틸리티 | 보조 기능 |

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-26
**작성자**: Claude Sonnet 4.5
