# Apollo Calendar & Daily - React Native 전환 가이드

> **작성일**: 2026-01-26
> **대상 모듈**: ApolloCalendar, ApolloDaily
> **목적**: iOS 네이티브 UI를 React Native로 전환하여 개발 효율성 향상

---

## 목차

1. [현황 분석](#1-현황-분석)
2. [인터페이스 추출 결과](#2-인터페이스-추출-결과)
3. [React Native 전환 방안](#3-react-native-전환-방안)
4. [3단계 실행 계획](#4-3단계-실행-계획)
5. [코드 구현 예시](#5-코드-구현-예시)
6. [일정 및 체크리스트](#6-일정-및-체크리스트)

---

## 1. 현황 분석

### 1.1 모듈 구조

#### ApolloCalendar 모듈

```
ApolloCalendar/
├── CalendarCore/          # 코어 비즈니스 로직 및 데이터 모델
│   ├── Sources/
│   │   ├── Caldav/       # CalDAV 프로토콜 구현
│   │   ├── CoreData/     # 데이터 영속성
│   │   ├── Model/        # 데이터 모델 (38개 파일)
│   │   ├── Network/      # API 통신
│   │   ├── Recurrence/   # 반복 일정 처리
│   │   └── ...
│
├── CalendarUI/            # UI 컴포넌트 및 비즈니스 로직
│   ├── Sources/
│   │   ├── Business/      # 비즈니스 로직
│   │   ├── TextAnalyzer/  # 자연어 분석
│   │   ├── View/          # SwiftUI Views
│   │   └── ...
│
└── libical/               # C 라이브러리 (외부 의존성)
```

#### ApolloDaily 모듈

```
ApolloDaily/
├── ApolloDaily/           # 메인 모듈 (UI + 비즈니스 로직)
│   ├── Sources/
│   │   ├── Business/      # 비즈니스 로직
│   │   │   ├── ExternalCalendar/       # 외부 캘린더 연동
│   │   │   └── ...
│   │   ├── UI/            # UI 컴포넌트
│   │   │   ├── Home/      # 홈 화면 (월, 주, 일, 3일 뷰)
│   │   │   ├── Detail/    # 상세 화면
│   │   │   ├── Edit/      # 편집 화면
│   │   │   ├── QuickEdit/ # 빠른 편집
│   │   │   ├── Setting/   # 설정 UI
│   │   │   └── SideMenu/  # 사이드 메뉴
│   │   └── ...
│
└── ApolloDailyData/       # 데이터 계층
```

### 1.2 아키텍처 흐름

```
┌─────────────────────────────────────────────────────────┐
│                  ApolloDaily (Swift)                     │
│  DailyHomeView (SwiftUI)                                │
│  ├── DailyRouterViewModel (라우팅)                       │
│  ├── DailyMonthListModel (월 뷰)                         │
│  ├── DailyDayTimeLineViewModel (일 뷰)                   │
│  └── ...                                                │
└────────────────────────┬────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────┐
│              ApolloCalendar (Swift)                      │
│  CalendarUI (UI Components & Business Logic)            │
│  └── CalendarCore (Business Logic & Data Models)        │
│      ├── CalendarSyncManager (동기화)                    │
│      ├── CaldavRepository (CalDAV)                       │
│      ├── CalendarModel (데이터 모델)                     │
│      └── CalendarComponent (일정)                        │
└─────────────────────────────────────────────────────────┘
```

### 1.3 기존 React Native 인프라

**위치**: `Projects/ApolloReactNative/`

- **RNBridge.swift**: RCTBridge 싱글톤 관리
- **RNViewController.swift**: RN 뷰 호스팅
- **이미 구현된 화면**: DailySetting (설정 화면)

---

## 2. 인터페이스 추출 결과

### 2.1 분석 개요

- **총 파일 수**: 162개
- **Business Layer**: 20개 파일
- **UI Layer**: 127개 파일
- **ApolloDaily에서 사용하는 핵심 타입**: 약 60개

### 2.2 TOP 10 사용 빈도 타입

| 순위 | 타입명 | 빈도 | 역할 |
|------|--------|------|------|
| 1 | **CalendarLocalRepositoryProtocol** | 29회 | 모든 데이터 조회의 핵심 인터페이스 |
| 2 | **DailyComponentItem** | 36회 | Daily UI의 핵심 일정 모델 |
| 3 | **CalendarItem** | 24회 | 캘린더 기본 정보 (이름, 색상, 그룹) |
| 4 | **CalendarSettingManageable** | 17회 | 설정 관리 인터페이스 |
| 5 | **CalendarPreviewHelper** | 19회 | UI 미리보기 헬퍼 |
| 6 | **CalendarDate** | 19회 | 일정 시작/종료 시간 (타임존 포함) |
| 7 | **CalendarPoi** | 19회 | 장소 정보 (위치, 좌표) |
| 8 | **CalendarEventDetail** | 16회 | 상세 일정 (참석자, 주최자 등) |
| 9 | **CalendarPeriod** | 15회 | 알람 시간 간격 (1시간 전, 30분 전) |
| 10 | **CalendarRecurrence** | 12회 | 반복 일정 규칙 (매일, 매주 등) |

### 2.3 카테고리별 인터페이스 (60개)

#### 1️⃣ 데이터 모델 (14개)
- CalendarItem, CalendarDate, CalendarPoi, CalendarEventDetail, CalendarPeriod
- CalendarRecurrence, CalendarInstance, CalendarComponent, CalendarGroup
- CalendarModel, CalendarAttendee, CalendarOrganizer, CalendarGroupItem
- CalendarCollection

#### 2️⃣ 프로토콜/인터페이스 (12개)
- CalendarLocalRepositoryProtocol (29회)
- CalendarSettingManageable (17회)
- CalendarSyncManageable (11회)
- CaldavRepositoryProtocol
- CalendarOauthProtocol
- ExternalCalendarUseCaseable
- CalendarSubscriptionRepositoryProtocol
- CalendarNotificationRegistable
- 기타...

#### 3️⃣ 열거형/상태 타입 (12개)
- CalendarUiError, CalendarSettingGroupType, CalendarComponentStatus
- CalendarOauthError, CalendarWeek, CalendarError
- CalendarComponentType, CalendarSyncState, CalendarSyncResult
- 기타...

#### 4️⃣ 외부 캘린더 도메인 (7개)
- ExternalCalendarProvider (9회)
- ExternalCalendarSettingViewModel (8회)
- CalendarSyncUseCase, CalendarSyncUseCaseable
- ExternalCalendarStatus, ExternalCalendarApi
- ExternalCalendarUseCase

#### 5️⃣ UI 유틸리티 (13개)
- CalendarUI (123회 - 프레임워크)
- DailyComponentItem (36회)
- CalendarPreviewHelper (19회)
- CalendarTextAnalyzer (텍스트 분석)
- MinuteUnit, TimeZoneInfo, CalendarUiConst
- 기타...

#### 6️⃣ 설정 도메인 (2개)
- CalendarSettingInfo (10회)
- CalendarSettingGroupType (8회)

### 2.4 기능별 주요 타입 매핑

| 기능 | 사용되는 주요 타입 | 파일 수 |
|------|-------------------|--------|
| **일정 조회** | CalendarLocalRepositoryProtocol, CalendarEventDetail, CalendarInstance | 45+ |
| **일정 작성/편집** | CalendarDate, CalendarPeriod, CalendarRecurrence, CalendarPoi, CalendarAttendee | 30+ |
| **외부 캘린더 연동** | ExternalCalendarProvider, CalendarOauthProtocol, CaldavRepositoryProtocol | 10+ |
| **동기화** | CalendarSyncManageable, CalendarSyncReason, CalendarSyncState | 15+ |
| **알림** | CalendarPeriod, CalendarNotificationRegistable, CalendarAiNotificationItem | 8+ |
| **설정** | CalendarSettingManageable, CalendarSettingInfo, CalendarItem | 25+ |
| **UI 표시** | DailyComponentItem, CalendarPreviewHelper, CalendarUiError | 60+ |
| **텍스트 분석** | CalendarTextAnalyzer, CalendarDate, CalendarRecurrence | 6+ |

---

## 3. React Native 전환 방안

### 3.1 하이브리드 아키텍처 (권장)

```
┌─────────────────────────────────────────────────────┐
│           React Native Layer (UI만)                 │
│                                                     │
│  [월뷰] [주뷰] [일뷰] [3일뷰]                        │
│  [상세] [편집] [설정] [메뉴]                         │
│                                                     │
│  ↓ DailyCalendarBridge (TypeScript)                │
└──────────────────┬──────────────────────────────────┘
                   │
                   ↓ (Native Module)
┌──────────────────────────────────────────────────────┐
│        DailyCalendarModule (Swift)                   │
│        - JSON 직렬화/역직렬화                         │
│        - Promise 기반 비동기 처리                     │
│        - 이벤트 발신 (EventEmitter)                   │
└──────────────────┬──────────────────────────────────┘
                   │
                   ↓
┌──────────────────────────────────────────────────────┐
│         CalendarCore (그대로 유지)                    │
│         - CalendarSyncManager                        │
│         - CaldavRepository                           │
│         - CalendarModel, CalendarComponent           │
│         - ExternalCalendarRepository                 │
└──────────────────────────────────────────────────────┘
```

**핵심 원칙:**
- **RN**: View + ViewModel (UI 로직)
- **Native**: Model + Repository + UseCase (비즈니스 로직)
- **Bridge**: 양방향 통신 (RN ↔ Native)

### 3.2 전환 우선순위

#### ✅ RN으로 전환할 UI (권장)

| 우선순위 | 화면 | 이유 | 복잡도 |
|---------|------|------|--------|
| 1 | **Setting 화면** | 이미 구현됨 ✓ | 낮음 |
| 2 | **SideMenu** | 정적 UI, 단순 네비게이션 | 낮음 |
| 3 | **Detail 화면** | 일정 상세 보기, 읽기 전용 | 중간 |
| 4 | **Picker 계열** | 날짜/시간/캘린더 선택기 | 중간 |
| 5 | **QuickEdit** | 간단한 편집 폼 | 중간 |
| 6 | **Edit 화면** | 전체 편집 폼 | 높음 |
| 7 | **Home - Day 뷰** | 타임라인 뷰 (단일 날짜) | 높음 |
| 8 | **Home - Month 뷰** | 월별 캘린더 그리드 | 매우 높음 |
| 9 | **Home - Week 뷰** | 주간 타임라인 | 매우 높음 |
| 10 | **Home - 3-Day 뷰** | 3일 타임라인 | 매우 높음 |

#### ❌ Native로 유지할 부분

| 컴포넌트 | 이유 |
|---------|------|
| **CalendarCore** | 비즈니스 로직, 데이터 모델, 동기화 엔진 |
| **CalendarTextAnalyzer** | 자연어 처리 (20+ Matcher), Swift 최적화 |
| **CalDAV/iCal 처리** | C 라이브러리(libical) 의존 |
| **CoreData 계층** | 영속성 관리 |
| **OAuth 인증 플로우** | MSAL 프레임워크 의존 |

### 3.3 추천 React Native 라이브러리

| SwiftUI 컴포넌트 | React Native 대체 | 라이브러리 |
|-----------------|------------------|-----------|
| `List` | `FlatList`, `SectionList` | 기본 제공 |
| `ScrollView` | `ScrollView` | 기본 제공 |
| `VStack`, `HStack` | `View` + `flexDirection` | 기본 제공 |
| **타임라인 뷰** | `react-native-calendar-kit` | [@howljs/calendar-kit](https://github.com/howljs/calendar-kit) |
| **월 캘린더** | `react-native-calendars` | [wix/react-native-calendars](https://github.com/wix/react-native-calendars) |
| **날짜 피커** | `@react-native-community/datetimepicker` | 커뮤니티 |

### 3.4 장단점 분석

#### ✅ 장점

| 장점 | 설명 |
|------|------|
| **독립적 개발** | iOS 프로젝트 빌드 없이 RN만 Metro 서버로 빠르게 개발 가능 |
| **빠른 반복** | Hot Reload로 UI 변경사항 즉시 확인 (1-2초) |
| **낮은 리스크** | 기존 iOS 앱에 영향 없이 별도 개발 → 안정성 검증 후 통합 |
| **팀 분업 가능** | RN 팀은 UI 개발, iOS 팀은 Native Module 개발 병렬 작업 |
| **Mock 데이터로 Edge Case 테스트** | 실제 데이터 없이도 다양한 시나리오 테스트 가능 |
| **기존 패턴 재활용** | 현재 DailySetting이 이미 이 방식으로 구현됨 ✓ |

#### ⚠️ 주의사항

| 주의사항 | 해결 방법 |
|---------|----------|
| **인터페이스 변경** | Mock 개발 중 인터페이스가 바뀔 수 있음 → TypeScript로 타입 먼저 정의 |
| **디자인 불일치** | Native와 다르게 보일 수 있음 → 디자인 토큰 공유, 스크린샷 비교 |
| **통합 시 버그** | Mock과 실제 데이터 형식 차이 → Interface 명세서 엄격히 관리 |
| **중복 작업** | Mock 데이터 생성 시간 → 나중에 테스트 데이터로 재활용 |

### 3.5 리스크 관리

#### 높은 리스크

| 리스크 | 영향 | 완화 방안 |
|--------|------|----------|
| **성능 저하** | 타임라인 뷰에서 렉 발생 | 네이티브 모듈로 렌더링 최적화, JSI 사용 |
| **브릿지 오버헤드** | 대량 데이터 전송 시 지연 | 배치 처리, 페이지네이션 |
| **CalendarCore 강한 결합** | Swift 타입 의존성 | Protocol-based 인터페이스 설계 |
| **외부 라이브러리 의존** | libical, MSAL | Native에 유지, 브릿지로 감싸기 |

---

## 4. 3단계 실행 계획

### Phase 1: 인터페이스 정의서 작성 (1주)

#### 목표
위에서 추출한 **TOP 10 + 핵심 타입 60개**를 TypeScript로 정의

#### 파일 구조

```
ReactNative/
└── src/
    └── types/
        ├── calendar/
        │   ├── CalendarModels.ts      # 기본 모델 (14개)
        │   ├── CalendarProtocols.ts   # 프로토콜/인터페이스 (12개)
        │   ├── CalendarEnums.ts       # 열거형 (12개)
        │   ├── ExternalCalendar.ts    # 외부 캘린더 (7개)
        │   └── UIHelpers.ts           # UI 유틸리티 (13개)
        └── bridge/
            └── DailyCalendarBridge.ts # Native Module 인터페이스
```

#### 주요 타입 예시

```typescript
/** 일정 기본 정보 */
export interface CalendarItem {
  id: string
  name: string
  color: string
  groupId?: string
  isVisible: boolean
  isReadOnly: boolean
}

/** 일정 시작/종료 시간 */
export interface CalendarDate {
  date: string  // ISO 8601 format
  timeZone: string
  isAllDay: boolean
}

/** Daily UI 핵심 모델 */
export interface DailyComponentItem {
  id: string
  eventDetail: CalendarEventDetail
  displayStartDate: string
  displayEndDate: string
  durationMinutes: number
  overlapIndex?: number
  totalOverlaps?: number
  isPast: boolean
  isToday: boolean
  isFuture: boolean
}
```

---

### Phase 2: 별도 RN 프로젝트에서 Mock UI 개발 (4-8주)

#### 2-1. 프로젝트 설정

```bash
# 새 RN 프로젝트 생성
npx react-native@latest init ApolloCalendarMock --template react-native-template-typescript

cd ApolloCalendarMock

# 필수 라이브러리 설치
npm install @react-navigation/native @react-navigation/stack
npm install react-native-calendars  # 월 뷰
npm install @howljs/calendar-kit     # 타임라인 뷰
npm install @react-native-community/datetimepicker
npm install date-fns                 # 날짜 유틸리티
npm install zustand                  # 상태 관리
```

#### 2-2. Mock 데이터 생성

```typescript
// src/mocks/mockData.ts

export const mockCalendars: CalendarItem[] = [
  {
    id: 'cal-1',
    name: '내 캘린더',
    color: '#FF5733',
    isVisible: true,
    isReadOnly: false
  },
  // ...
]

export const mockEvents: DailyComponentItem[] = [
  {
    id: 'event-1',
    eventDetail: {
      title: '팀 회의',
      startDate: { date: '2026-01-26T14:00:00+09:00', timeZone: 'Asia/Seoul', isAllDay: false },
      endDate: { date: '2026-01-26T15:00:00+09:00', timeZone: 'Asia/Seoul', isAllDay: false },
      // ...
    },
    // ...
  },
  // 다양한 시나리오: 종일 일정, 반복 일정, 겹치는 일정 등
]
```

#### 2-3. Mock Bridge 구현

```typescript
// src/mocks/mockBridge.ts

export const MockDailyCalendarBridge: DailyCalendarModuleInterface = {
  getEvents: async (startDate, endDate, calendarIds) => {
    await new Promise(resolve => setTimeout(resolve, 1000)) // 시뮬레이션
    return mockEvents.filter(/* 필터링 로직 */)
  },

  createEvent: async (event) => {
    await new Promise(resolve => setTimeout(resolve, 800))
    console.log('Mock: Create event', event)
    return 'new-event-id'
  },

  // ... 모든 메서드 Mock 구현
}
```

#### 2-4. 화면 개발 우선순위

1. **SideMenu** (1주) - 가장 단순
2. **Detail 화면** (1-2주) - 읽기 전용
3. **QuickEdit** (1-2주) - 간단한 입력
4. **Day 뷰** (2-3주) - 타임라인
5. **Month 뷰** (2-3주) - 캘린더 그리드
6. **Week 뷰** (1-2주)
7. **3-Day 뷰** (1주)
8. **Edit 화면** (2-3주) - 복잡한 폼

---

### Phase 3: iOS 프로젝트 통합 (2-4주)

#### 3-1. Native Module 구현 (Swift)

```swift
// Projects/ApolloReactNative/ApolloReactNative/Sources/DailyCalendarModule.swift

@objc(DailyCalendarModule)
class DailyCalendarModule: RCTEventEmitter {

  private let repository: CalendarLocalRepositoryProtocol
  private let syncManager: CalendarSyncManageable

  @objc func getEvents(
    _ startDateString: String,
    endDateString: String,
    calendarIds: [String]?,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    Task {
      do {
        let instances = try await repository.fetchInstances(...)
        let items = instances.map { DailyComponentItemDTO.from($0) }
        let jsonData = try JSONEncoder().encode(items)
        let jsonArray = try JSONSerialization.jsonObject(with: jsonData)
        resolver(jsonArray)
      } catch {
        rejecter("GET_EVENTS_ERROR", error.localizedDescription, error)
      }
    }
  }

  // ... 모든 메서드 구현
}
```

#### 3-2. DTO (Data Transfer Object) 정의

```swift
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
    // CalendarInstance → DTO 변환 로직
  }
}
```

#### 3-3. React Native 코드 통합

```typescript
// ReactNative/src/bridge/DailyCalendarBridge.ts

const isDevelopment = __DEV__ && !NativeModules.DailyCalendarModule

export const DailyCalendarBridge: DailyCalendarModuleInterface = isDevelopment
  ? require('../mocks/mockBridge').MockDailyCalendarBridge
  : NativeModules.DailyCalendarModule
```

#### 3-4. 라우팅 연결

```swift
// Projects/ApolloDaily/ApolloDaily/Sources/UI/DailyRouter/DailyRouterView.swift

case .dailyMonthView:
    return RNNavigationHelper.rnView(for: .dailyMonthView)

case .dailyDayView:
    return RNNavigationHelper.rnView(for: .dailyDayView)
```

---

## 5. 코드 구현 예시

### 5.1 TypeScript 타입 정의

```typescript
// ReactNative/src/types/calendar/CalendarModels.ts

/** 일정 기본 정보 (24회 사용) */
export interface CalendarItem {
  id: string
  name: string
  color: string  // HEX 색상
  groupId?: string
  isVisible: boolean
  isReadOnly: boolean
  accountId?: string
  subscriptionUrl?: string
}

/** 일정 시작/종료 시간 (19회) */
export interface CalendarDate {
  date: string  // ISO 8601 format
  timeZone: string  // "Asia/Seoul"
  isAllDay: boolean
}

/** 장소 정보 (19회) */
export interface CalendarPoi {
  name: string
  address?: string
  latitude?: number
  longitude?: number
  poiId?: string  // TMap POI ID
}

/** 상세 일정 (16회) */
export interface CalendarEventDetail {
  id: string
  title: string
  startDate: CalendarDate
  endDate: CalendarDate
  location?: CalendarPoi
  memo?: string
  url?: string
  isAllDay: boolean
  status: CalendarComponentStatus
  calendarId: string
  calendar: CalendarItem

  // 참석자 정보
  attendees: CalendarAttendee[]
  organizer?: CalendarOrganizer

  // 반복 및 알람
  recurrence?: CalendarRecurrence
  alarms: CalendarPeriod[]

  // 메타 정보
  createdAt: string
  updatedAt: string
  isReadOnly: boolean
}

/** Daily UI 핵심 모델 (36회 - 최다 사용) */
export interface DailyComponentItem {
  id: string
  eventDetail: CalendarEventDetail

  // UI 표시용
  displayStartDate: string  // "2026-01-26 14:00"
  displayEndDate: string
  durationMinutes: number

  // 겹침 처리
  overlapIndex?: number
  totalOverlaps?: number

  // 상태
  isPast: boolean
  isToday: boolean
  isFuture: boolean
}

/** 알람 시간 간격 (15회) */
export interface CalendarPeriod {
  minutes: number  // -30 = 30분 전
  label: string    // "30분 전"
}

/** 반복 일정 규칙 (12회) */
export interface CalendarRecurrence {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number  // 1 = 매일, 2 = 격일
  endDate?: string
  count?: number    // 5번 반복
  byWeekDay?: number[]  // [0, 2, 4] = 월/수/금
  byMonthDay?: number   // 15 = 매월 15일
}

/** 참석자 */
export interface CalendarAttendee {
  email: string
  name?: string
  status: 'accepted' | 'declined' | 'tentative' | 'needsAction'
  isOptional: boolean
}

/** 주최자 */
export interface CalendarOrganizer {
  email: string
  name?: string
}

/** 캘린더 그룹 */
export interface CalendarGroup {
  id: string
  name: string
  order: number
  calendars: CalendarItem[]
}
```

### 5.2 Native Module Bridge 인터페이스

```typescript
// ReactNative/src/bridge/DailyCalendarBridge.ts

import { NativeModules, NativeEventEmitter } from 'react-native'
import type {
  CalendarEventDetail,
  DailyComponentItem,
  CalendarItem,
  CalendarGroup,
  ExternalCalendarProvider
} from '../types/calendar'

interface DailyCalendarModuleInterface {
  // ===== 조회 API =====

  /** 특정 기간의 일정 조회 */
  getEvents(
    startDate: string,  // "2026-01-01"
    endDate: string,
    calendarIds?: string[]
  ): Promise<DailyComponentItem[]>

  /** 일정 상세 조회 */
  getEventDetail(eventId: string): Promise<CalendarEventDetail>

  /** 모든 캘린더 목록 */
  getCalendars(): Promise<CalendarItem[]>

  /** 캘린더 그룹 목록 */
  getCalendarGroups(): Promise<CalendarGroup[]>

  // ===== CRUD API =====

  /** 일정 생성 */
  createEvent(event: Partial<CalendarEventDetail>): Promise<string>

  /** 일정 수정 */
  updateEvent(eventId: string, event: Partial<CalendarEventDetail>): Promise<void>

  /** 일정 삭제 */
  deleteEvent(eventId: string): Promise<void>

  // ===== 동기화 API =====

  /** 수동 동기화 */
  syncCalendars(): Promise<void>

  /** 동기화 상태 조회 */
  getSyncStatus(): Promise<{
    state: string
    lastSyncTime?: string
    error?: string
  }>

  // ===== 외부 캘린더 API =====

  /** 외부 캘린더 연결 */
  connectExternalCalendar(
    provider: ExternalCalendarProvider,
    loginHint?: string
  ): Promise<void>

  /** 외부 캘린더 해제 */
  disconnectExternalCalendar(calendarId: string): Promise<void>

  // ===== 설정 API =====

  /** 기본 캘린더 설정 */
  setDefaultCalendar(calendarId: string): Promise<void>

  /** AI 카테고리 토글 */
  toggleAICategory(enabled: boolean): Promise<void>

  // ===== 텍스트 분석 (빠른 등록) =====

  /** 자연어 분석 */
  analyzeText(text: string): Promise<{
    title?: string
    startDate?: CalendarDate
    location?: string
  }>

  // ===== 네비게이션 (Native 화면으로 이동) =====

  /** Native 상세 화면 열기 */
  navigateToNativeDetail(eventId: string): void

  /** Native 편집 화면 열기 */
  navigateToNativeEdit(eventId: string): void

  /** 뒤로 가기 */
  goBack(): void
}

// Native Module
const { DailyCalendarModule } = NativeModules
export const DailyCalendarBridge = DailyCalendarModule as DailyCalendarModuleInterface

// Event Emitter (실시간 변경 감지)
const eventEmitter = new NativeEventEmitter(DailyCalendarModule)

export const CalendarEvents = {
  /** 일정이 변경되었을 때 */
  onCalendarChanged: (callback: (eventId: string, changeType: 'create' | 'update' | 'delete') => void) => {
    return eventEmitter.addListener('CalendarChanged', callback)
  },

  /** 동기화 상태 변경 */
  onSyncStateChanged: (callback: (state: string) => void) => {
    return eventEmitter.addListener('SyncStateChanged', callback)
  }
}
```

### 5.3 React Native 화면 예시 - Day 뷰

```tsx
// ApolloCalendarMock/src/screens/DayView/DayViewScreen.tsx

import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import { TimelineCalendar, PackedEvent } from '@howljs/calendar-kit'
import { format } from 'date-fns'
import { MockDailyCalendarBridge } from '../../mocks/mockBridge'
import type { DailyComponentItem } from '../../types/calendar'

export const DayViewScreen: React.FC = () => {
  const [events, setEvents] = useState<PackedEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    loadEvents()
  }, [selectedDate])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const startDate = format(selectedDate, 'yyyy-MM-dd')
      const endDate = startDate

      const items = await MockDailyCalendarBridge.getEvents(startDate, endDate)

      // DailyComponentItem → PackedEvent 변환
      const packedEvents = items.map((item: DailyComponentItem): PackedEvent => ({
        id: item.id,
        title: item.eventDetail.title,
        start: item.eventDetail.startDate.date,
        end: item.eventDetail.endDate.date,
        color: item.eventDetail.calendar.color
      }))

      setEvents(packedEvents)
    } catch (error) {
      console.error('Failed to load events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEventPress = (eventId: string) => {
    console.log('Event pressed:', eventId)
    // 상세 화면으로 이동
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <TimelineCalendar
      events={events}
      selectedDate={selectedDate}
      onDateChanged={setSelectedDate}
      onEventPress={handleEventPress}
      theme={{
        backgroundColor: '#FFFFFF',
        timeLabel: {
          fontSize: 12,
          color: '#666666'
        },
        nowIndicatorColor: '#FF5733'
      }}
    />
  )
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
```

---

## 6. 일정 및 체크리스트

### 6.1 예상 일정

| Phase | 기간 | 산출물 |
|-------|------|--------|
| **Phase 1** | 1주 | TypeScript 인터페이스 정의서 (60개 타입) |
| **Phase 2** | 4-8주 | Mock 프로젝트 + 전체 화면 UI |
| **Phase 3** | 2-4주 | iOS 통합 + Native Module + 검증 |
| **총 기간** | **7-13주** | 완전한 RN 전환 |

### 6.2 Phase 1 체크리스트 (1주)

- [ ] TypeScript 인터페이스 정의
  - [ ] CalendarModels.ts (14개 타입)
  - [ ] CalendarProtocols.ts (12개 타입)
  - [ ] CalendarEnums.ts (12개 타입)
  - [ ] ExternalCalendar.ts (7개 타입)
  - [ ] UIHelpers.ts (13개 타입)
- [ ] DailyCalendarBridge 인터페이스 정의
- [ ] Mock 데이터 구조 설계
- [ ] 인터페이스 명세서 문서화

### 6.3 Phase 2 체크리스트 (4-8주)

- [ ] 프로젝트 설정
  - [ ] RN 프로젝트 생성
  - [ ] 필수 라이브러리 설치
  - [ ] 네비게이션 설정
- [ ] Mock 구현
  - [ ] mockData.ts (다양한 시나리오)
  - [ ] mockBridge.ts (모든 API 구현)
- [ ] 화면 개발
  - [ ] SideMenu (1주)
  - [ ] Detail 화면 (1-2주)
  - [ ] QuickEdit (1-2주)
  - [ ] Day 뷰 (2-3주)
  - [ ] Month 뷰 (2-3주)
  - [ ] Week 뷰 (1-2주)
  - [ ] 3-Day 뷰 (1주)
  - [ ] Edit 화면 (2-3주)
- [ ] UI/UX 검증
  - [ ] 디자인 시스템 적용
  - [ ] 인터랙션 구현
  - [ ] 성능 테스트

### 6.4 Phase 3 체크리스트 (2-4주)

- [ ] Native Module 구현
  - [ ] DailyCalendarModule.swift
  - [ ] DTO 클래스들
  - [ ] JSON 직렬화/역직렬화
  - [ ] EventEmitter 구현
- [ ] iOS 통합
  - [ ] RNScreenType 확장
  - [ ] DailyRouterView 연결
  - [ ] 라우팅 테스트
- [ ] 브릿지 연결
  - [ ] Mock → Real Bridge 전환
  - [ ] API 호출 테스트
  - [ ] 에러 핸들링
- [ ] 통합 테스트
  - [ ] CRUD 동작 검증
  - [ ] 동기화 테스트
  - [ ] 외부 캘린더 연동 테스트
  - [ ] 성능 프로파일링
- [ ] 최종 검증
  - [ ] QA 테스트
  - [ ] 버그 수정
  - [ ] 문서화

### 6.5 전환 전 최종 확인사항

- [ ] CalendarCore API 안정화 여부
- [ ] RN 팀 리소스 확보
- [ ] 디자인 시스템 준비 (Figma → RN 컴포넌트)
- [ ] 성능 벤치마크 기준 설정
- [ ] A/B 테스트 계획
- [ ] 롤백 전략 수립

---

## 7. 핵심 인사이트

### 7.1 아키텍처 특징

1. **Clean Architecture**: CalendarCore(비즈니스 로직) ↔ CalendarUI(UI) 분리
2. **Protocol-Based Design**: 프로토콜을 통한 의존성 역전
3. **Multi-View Support**: 월/주/일/3일 뷰 모드 지원
4. **React Native Integration**: 일부 설정 화면을 RN으로 구현

### 7.2 모듈 간 의존성

- **단방향**: ApolloDaily → ApolloCalendar
- **ApolloDaily는 ApolloCalendar 없이 작동 불가**
- **React Native는 선택적**: 일부 화면만 RN 사용 가능

### 7.3 성능 최적화 고려사항

| 이슈 | 해결 방법 |
|------|----------|
| 렌더링 성능 | `FlatList`의 `getItemLayout`, `removeClippedSubviews` 사용 |
| 메모리 관리 | 가상화 리스트 + 윈도잉 (visible 범위만 렌더링) |
| 브릿지 병목 | 배치 처리 (한 번에 여러 일정 전달), JSI 고려 |
| 동기화 부하 | Native에서 백그라운드 처리 → 완료 시 이벤트 발신 |
| 애니메이션 | `react-native-reanimated` 사용 (UI 스레드에서 실행) |

---

## 8. 참고 자료

### 8.1 핵심 파일 경로

#### CalendarCore
- `/Users/1113969/Workspace/Apollo-iOS/Projects/ApolloCalendar/CalendarCore/Sources/CalendarSyncManager.swift`
- `/Users/1113969/Workspace/Apollo-iOS/Projects/ApolloCalendar/CalendarCore/Sources/CaldavRepository.swift`
- `/Users/1113969/Workspace/Apollo-iOS/Projects/ApolloCalendar/CalendarCore/Sources/Model/`

#### ApolloDaily
- `/Users/1113969/Workspace/Apollo-iOS/Projects/ApolloDaily/ApolloDaily/Sources/UI/Home/DailyHomeView.swift`
- `/Users/1113969/Workspace/Apollo-iOS/Projects/ApolloDaily/ApolloDaily/Sources/UI/DailyRouter/DailyRouterViewModel.swift`
- `/Users/1113969/Workspace/Apollo-iOS/Projects/ApolloDaily/ApolloDaily/Sources/Business/ExternalCalendar/`

#### React Native Bridge
- `/Users/1113969/Workspace/Apollo-iOS/Projects/ApolloReactNative/ApolloReactNative/Sources/RNBridge.swift`
- `/Users/1113969/Workspace/Apollo-iOS/Projects/ApolloReactNative/ApolloReactNative/Sources/RNViewController.swift`
- `/Users/1113969/Workspace/Apollo-iOS/ReactNative/src/bridge/DailySettingBridge.ts`

### 8.2 추천 라이브러리

- **타임라인 뷰**: [@howljs/calendar-kit](https://github.com/howljs/calendar-kit)
- **월 캘린더**: [react-native-calendars](https://github.com/wix/react-native-calendars)
- **날짜 피커**: [@react-native-community/datetimepicker](https://github.com/react-native-datetimepicker/datetimepicker)
- **상태 관리**: [zustand](https://github.com/pmndrs/zustand)
- **애니메이션**: [react-native-reanimated](https://github.com/software-mansion/react-native-reanimated)

---

## 9. 결론

이 가이드에 제시된 **3단계 접근법** (인터페이스 정의 → Mock UI 개발 → iOS 통합)을 따르면:

✅ **안정적**: 기존 앱에 영향 없이 점진적 전환
✅ **효율적**: RN Hot Reload로 빠른 개발
✅ **검증 가능**: Mock 데이터로 Edge Case 테스트
✅ **병렬 작업**: 팀 분업으로 개발 속도 향상
✅ **낮은 리스크**: 화면 단위 검증 후 통합

**예상 기간**: 7-13주로 완전한 RN 전환 달성 가능

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-26
**작성자**: Claude Sonnet 4.5
