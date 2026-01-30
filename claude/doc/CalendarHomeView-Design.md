# Calendar Home View - 설계 및 구현 방안

> **작성일**: 2026-01-30
> **대상 화면**: 캘린더 홈 (월/주/3일/일 뷰)
> **참고 디자인**: `claude/ref/month.png`, `claude/ref/weekday.png`, `claude/ref/3days.png`, `claude/ref/day.png`

---

## 1. 화면 분석

### 1.1 공통 요소

4개 뷰 모두 동일한 레이아웃 구조를 공유한다.

```
┌─────────────────────────────────────────┐
│  Header (네비게이션 바)                    │
├─────────────────────────────────────────┤
│  Weekday Header (요일 + 날짜)             │
├─────────────────────────────────────────┤
│  All-day Events (종일 일정 영역)           │
├─────────────────────────────────────────┤
│                                         │
│  Content Area (뷰 타입별 본문)            │
│                                         │
├─────────────────────────────────────────┤
│  Bottom Bar (오늘 / + 버튼)              │
└─────────────────────────────────────────┘
```

#### Header

| 요소 | 설명 |
|------|------|
| `<` 뒤로가기 | 왼쪽 화살표, 이전 화면으로 이동 |
| 타이틀 | 월 뷰: `1월 ∨`, 일 뷰: `1월 11일 (일) ∨` — 탭하면 날짜 선택 드롭다운 |
| 설정 아이콘 | 오른쪽 렌치(🔧) 아이콘 |
| 스캔 아이콘 | 오른쪽 카메라/스캔(📷) 아이콘 |

#### Bottom Bar

| 요소 | 설명 |
|------|------|
| `오늘` 버튼 | 중앙, 둥근 모서리의 캡슐 형태, 오늘 날짜로 스크롤 |
| `+` 버튼 | 오른쪽, 원형 버튼, 새 일정 생성 |

---

### 1.2 월 뷰 (Month View)

**참고**: `claude/ref/month.png`

#### 구조
- **스크롤 방향**: 세로 무한 스크롤 (연속 월 표시)
- **월 구분**: 월 경계에 `2월` 같은 섹션 헤더 표시
- **요일 헤더**: 상단 고정, `일 월 화 수 목 금 토` (일요일 빨간색)

#### 날짜 셀
| 상태 | 스타일 |
|------|--------|
| 일반 | 검정 텍스트 |
| 일요일 | 빨간색 텍스트 |
| 오늘 | 진한 원형 배경 (검정/다크) + 흰색 텍스트 |
| 과거 일요일 | 연한 빨간색 원형 배경 + 흰색 텍스트 (11일) |

#### 일정 표시
- 종일/다일 일정: 날짜 셀을 가로로 관통하는 색상 바 (예: `Day1 혜택` — 연보라 배경)
- 시간 일정: 해당 날짜 셀 아래에 색상 블록으로 표시 (예: `하하`, `22`, `33`)
- 색상: 캘린더별 색상 적용 (연보라, 연노랑 등)
- **overflow**: 공간 부족 시 `+6`, `+3` 같은 더보기 표시
- **잠금 아이콘**: 읽기 전용 일정에 🔒 표시 (예: `Happy 🔒`)

#### 레이아웃 규칙
- 각 주(row)에 일정이 최대 3~4줄까지 표시
- 초과하면 `+N` 텍스트로 남은 일정 수 표시
- 다일 일정은 여러 날에 걸쳐 하나의 바로 표시 (셀 연결)

---

### 1.3 주 뷰 (Week View)

**참고**: `claude/ref/weekday.png`

#### 구조
- **요일 헤더**: 요일 약자 + 날짜 숫자 (예: `목 15`)
- **종일 일정 영역**: 헤더 바로 아래, `Day1 혜택` 같은 종일 일정 표시
- **타임라인**: 세로 스크롤, 시간 라벨 왼쪽 정렬
- **7개 컬럼**: 일~토 각 요일별 컬럼

#### 시간 라벨 포맷
- `오전5시`, `오전6시`, ..., `오전11시`
- `오후12시` (정오)
- `오후1시`, `오후2시`, ..., `오후11시`
- `오전12시` (자정)

#### 일정 블록
- 시간에 맞는 위치에 색상 블록으로 표시
- 블록 내부에 일정 제목 텍스트
- 겹치는 일정: 가로로 분할하여 나란히 표시

---

### 1.4 3일 뷰 (3-Day View)

**참고**: `claude/ref/3days.png`

#### 구조
- 주 뷰와 동일한 타임라인 레이아웃
- **3개 컬럼**: 선택된 날짜 기준 3일 표시
- 컬럼 폭이 주 뷰보다 넓음 (7 → 3)
- 요일 헤더: `일 11`, `월 12`, `화 13`

---

### 1.5 일 뷰 (Day View)

**참고**: `claude/ref/day.png`

#### 구조
- 단일 컬럼 타임라인
- **헤더 타이틀 변경**: `1월 11일 (일) ∨` — 날짜 + 요일 표시
- **요일 헤더 없음** (날짜가 하나이므로)
- 시간 라벨: `오전 12시`, `오전 1시`, ... (오전/오후 사이 공백 있음)
- 전체 너비를 일정 블록이 사용

---

## 2. 컴포넌트 설계

### 2.1 컴포넌트 트리

```
CalendarHomeScreen
├── CalendarHeader
│   ├── BackButton
│   ├── TitleDropdown (월/날짜 표시 + 드롭다운)
│   ├── SettingsButton
│   └── ScanButton
│
├── CalendarContent
│   ├── [viewType === 'month']
│   │   └── MonthView
│   │       ├── WeekdayHeader (고정)
│   │       └── MonthScrollList (SectionList)
│   │           ├── MonthSectionHeader ("2월")
│   │           └── WeekRow
│   │               └── DayCell
│   │                   ├── DayNumber
│   │                   └── EventChipList
│   │                       ├── EventChip (단일 일정)
│   │                       ├── SpanningEventBar (다일 일정)
│   │                       └── OverflowIndicator (+N)
│   │
│   ├── [viewType === 'week']
│   │   └── TimelineView (numberOfDays=7)
│   │       ├── DayColumnHeader
│   │       ├── AllDayEventSection
│   │       └── TimelineGrid
│   │           ├── TimeLabel
│   │           ├── HourLine
│   │           └── EventBlock
│   │
│   ├── [viewType === 'threeDays']
│   │   └── TimelineView (numberOfDays=3)
│   │
│   └── [viewType === 'day']
│       └── TimelineView (numberOfDays=1)
│
└── BottomBar
    ├── TodayButton
    └── AddEventButton
```

### 2.2 주요 컴포넌트 상세

#### `CalendarHomeScreen`
- 상태 관리: `viewType`, `selectedDate`, `events`
- 뷰 타입 전환 로직
- Bridge를 통한 데이터 로딩

#### `MonthView`
- 세로 무한 스크롤 (위/아래로 월 추가 로드)
- 주(row) 단위 렌더링
- 종일/다일 일정의 가로 span 계산
- `+N` overflow 처리

#### `TimelineView` (주/3일/일 뷰 공용)
- `numberOfDays` prop으로 컬럼 수 결정 (7, 3, 1)
- 세로 스크롤 타임라인
- 종일 일정 상단 영역
- 시간 일정 블록 위치/크기 계산
- 겹치는 일정 가로 분할 처리

---

## 3. 파일 구조

```
src/
├── screens/
│   └── CalendarHome/
│       ├── CalendarHomeScreen.tsx        # 메인 화면
│       ├── CalendarHeader.tsx            # 상단 네비게이션 바
│       ├── BottomBar.tsx                 # 하단 오늘/추가 버튼
│       ├── MonthView/
│       │   ├── MonthView.tsx             # 월 뷰 컨테이너
│       │   ├── WeekdayHeader.tsx         # 요일 헤더 (일~토)
│       │   ├── WeekRow.tsx              # 1주 행 (7일)
│       │   ├── DayCell.tsx              # 날짜 셀
│       │   ├── EventChip.tsx            # 일정 칩/바
│       │   └── MonthUtils.ts            # 월 뷰 계산 유틸
│       ├── TimelineView/
│       │   ├── TimelineView.tsx          # 타임라인 뷰 (주/3일/일 공용)
│       │   ├── DayColumnHeader.tsx       # 날짜 컬럼 헤더
│       │   ├── AllDaySection.tsx         # 종일 일정 영역
│       │   ├── TimelineGrid.tsx          # 시간 그리드
│       │   ├── TimeLabel.tsx             # 시간 라벨 (오전/오후 N시)
│       │   ├── EventBlock.tsx            # 시간 일정 블록
│       │   └── TimelineUtils.ts          # 타임라인 계산 유틸
│       └── hooks/
│           ├── useCalendarEvents.ts      # 일정 데이터 로딩
│           ├── useMonthData.ts           # 월 뷰 데이터 가공
│           └── useTimelineLayout.ts      # 타임라인 레이아웃 계산
│
├── components/
│   └── common/
│       ├── Icon.tsx                      # 아이콘 컴포넌트
│       └── Pressable.tsx                 # 터치 피드백
│
└── utils/
    ├── dateFormat.ts                     # 날짜 포맷 (한국어)
    └── colors.ts                         # 색상 상수
```

---

## 4. 핵심 로직 설계

### 4.1 월 뷰 - 일정 배치 알고리즘

월 뷰에서 가장 복잡한 부분은 **다일 일정의 가로 span**과 **overflow 처리**.

```
주간 행(WeekRow) 렌더링 순서:
1. 해당 주에 걸친 모든 일정 수집
2. 종일/다일 일정을 먼저 배치 (기간이 긴 순서)
3. 각 일정의 시작~종료 컬럼 계산 (0~6)
4. 행(slot) 배정: 겹치지 않게 위에서부터 채움
5. 최대 표시 행 수 초과 시 +N 카운트
```

```typescript
interface WeekEventLayout {
  event: DailyComponentItem;
  startCol: number;   // 0-6 (일~토)
  endCol: number;     // 0-6
  row: number;        // 배치된 행 인덱스
}

// 예: "Day1 혜택" → startCol: 3, endCol: 5, row: 0
// 예: "하하"      → startCol: 4, endCol: 4, row: 1
```

### 4.2 타임라인 뷰 - 일정 블록 위치 계산

```typescript
interface EventBlockLayout {
  event: DailyComponentItem;
  top: number;           // 시작 시간 기준 Y 위치 (px)
  height: number;        // 일정 길이 (px)
  left: number;          // 겹침 시 X 위치 (0~1 비율)
  width: number;         // 겹침 시 너비 (0~1 비율)
  columnIndex: number;   // 요일 컬럼 (0-based)
}

// 계산:
// top = (startHour * 60 + startMinute) * PIXELS_PER_MINUTE
// height = durationMinutes * PIXELS_PER_MINUTE
// PIXELS_PER_MINUTE = HOUR_HEIGHT / 60
```

#### 겹침 처리 알고리즘

```
1. 같은 날의 일정을 시작 시간 순으로 정렬
2. 겹치는 일정 그룹 감지 (시간 범위 교집합)
3. 각 그룹 내에서 좌→우로 컬럼 배정
4. width = 1 / totalColumns, left = columnIndex / totalColumns
```

### 4.3 시간 라벨 포맷

```typescript
function formatTimeLabel(hour: number): string {
  if (hour === 0) return '오전 12시';
  if (hour < 12) return `오전 ${hour}시`;
  if (hour === 12) return '오후 12시';
  return `오후 ${hour - 12}시`;
}

// 주/3일 뷰에서는 공백 없이: "오전5시", "오후1시"
// 일 뷰에서는 공백 있이: "오전 5시", "오후 1시"
```

### 4.4 헤더 타이틀 포맷

| 뷰 타입 | 포맷 | 예시 |
|---------|------|------|
| month | `N월` | `1월 ∨` |
| week | `N월` | `1월 ∨` |
| threeDays | `N월` | `1월 ∨` |
| day | `N월 D일 (요일)` | `1월 11일 (일) ∨` |

---

## 5. 상태 관리

### 5.1 Store 설계 (Zustand)

```typescript
interface CalendarHomeState {
  // 뷰 상태
  viewType: CalendarViewType;          // 'month' | 'week' | 'day' | 'threeDays'
  selectedDate: Date;                  // 현재 선택/포커스된 날짜
  visibleRange: { start: Date; end: Date };  // 현재 화면에 보이는 날짜 범위

  // 데이터
  events: DailyComponentItem[];        // 현재 범위의 일정 목록
  calendars: CalendarItem[];           // 캘린더 목록
  loading: boolean;

  // 액션
  setViewType: (type: CalendarViewType) => void;
  setSelectedDate: (date: Date) => void;
  goToToday: () => void;
  loadEvents: (start: Date, end: Date) => Promise<void>;
}
```

### 5.2 데이터 로딩 전략

| 뷰 | 로딩 범위 | 프리페치 |
|----|----------|---------|
| month | 현재 월 ± 2개월 | 스크롤 방향으로 1개월 추가 |
| week | 현재 주 ± 2주 | 스크롤 방향으로 1주 추가 |
| threeDays | 현재 3일 ± 6일 | 스크롤 방향으로 3일 추가 |
| day | 현재 일 ± 3일 | 스크롤 방향으로 1일 추가 |

---

## 6. 스타일 상수

### 6.1 색상

```typescript
const COLORS = {
  // 텍스트
  textPrimary: '#000000',
  textSecondary: '#666666',
  textSunday: '#FF3B30',      // 일요일 빨간색
  textSaturday: '#000000',     // 토요일은 기본색

  // 배경
  background: '#FFFFFF',
  todayBg: '#1C1C1E',         // 오늘 날짜 원형 배경 (다크)
  todayText: '#FFFFFF',
  pastSundayBg: '#FFB5B0',    // 과거 일요일 (연빨강 배경)

  // 구분선
  separator: '#E5E5EA',
  hourLine: '#F2F2F7',

  // 버튼
  todayButtonBorder: '#C7C7CC',
  addButtonBorder: '#C7C7CC',
};
```

### 6.2 레이아웃

```typescript
const LAYOUT = {
  // 헤더
  headerHeight: 44,

  // 월 뷰
  weekdayHeaderHeight: 24,
  dayCellMinHeight: 80,       // 최소 행 높이
  eventChipHeight: 16,
  eventChipGap: 2,
  maxVisibleEvents: 3,        // 초과 시 +N 표시

  // 타임라인 뷰
  hourHeight: 60,              // 1시간 높이 (px)
  timeLabalWidth: 60,          // 시간 라벨 폭
  dayColumnHeaderHeight: 50,   // 날짜 헤더 높이
  allDaySectionMinHeight: 30,

  // 하단 바
  bottomBarHeight: 60,
  todayButtonWidth: 80,
  todayButtonHeight: 40,
  addButtonSize: 48,
};
```

---

## 7. 구현 순서

### Step 1: 기반 구조

| # | 작업 | 설명 |
|---|------|------|
| 1-1 | 프로젝트 세팅 | react-navigation, zustand 설치 및 설정 |
| 1-2 | 공통 유틸리티 | 날짜 포맷, 색상 상수, 아이콘 |
| 1-3 | CalendarHomeScreen | 메인 화면 뼈대 + viewType 전환 |
| 1-4 | CalendarHeader | 헤더 바 |
| 1-5 | BottomBar | 오늘/추가 버튼 |

### Step 2: 타임라인 뷰 (주/3일/일 공용)

| # | 작업 | 설명 |
|---|------|------|
| 2-1 | TimelineView 기본 구조 | 스크롤, 시간 그리드, 시간 라벨 |
| 2-2 | DayColumnHeader | 요일 + 날짜 헤더 |
| 2-3 | AllDaySection | 종일 일정 영역 |
| 2-4 | EventBlock | 시간 일정 블록 렌더링 |
| 2-5 | 겹침 처리 | 일정 겹침 레이아웃 알고리즘 |
| 2-6 | numberOfDays 분기 | 7/3/1 컬럼 대응 |

### Step 3: 월 뷰

| # | 작업 | 설명 |
|---|------|------|
| 3-1 | MonthView 기본 구조 | 세로 스크롤 + WeekdayHeader |
| 3-2 | WeekRow / DayCell | 주 행 + 날짜 셀 |
| 3-3 | EventChip | 단일 일정 칩 |
| 3-4 | SpanningEventBar | 다일 일정 가로 바 |
| 3-5 | Overflow (+N) | 일정 초과 표시 |
| 3-6 | 무한 스크롤 | 위/아래 월 추가 로드 |

### Step 4: 상호작용

| # | 작업 | 설명 |
|---|------|------|
| 4-1 | 날짜 선택 | 탭하여 날짜 선택, 뷰 전환 |
| 4-2 | 오늘 이동 | 오늘 버튼 → 현재 날짜로 스크롤 |
| 4-3 | 스와이프 | 좌우 스와이프로 기간 이동 |
| 4-4 | 일정 탭 | 일정 탭 → 상세 화면 이동 |

---

## 8. 라이브러리 선택

### 8.1 타임라인 뷰

**직접 구현 방식 채택**.

이유:
- `@howljs/calendar-kit`: 기능이 풍부하나, Apollo 디자인에 맞추려면 커스터마이징 범위가 넓어 오히려 제약이 됨
- 직접 구현 시 디자인 정확도, 성능 제어, 한국어 시간 포맷 등 완전 제어 가능
- `ScrollView` + 절대 위치 배치로 충분히 구현 가능

### 8.2 월 뷰

**직접 구현 방식 채택**.

이유:
- `react-native-calendars`: 기본 월 달력에는 적합하나, Apollo의 **다일 일정 span 바** 및 **무한 스크롤 월 리스트** 구현이 어려움
- `SectionList` 기반 커스텀 구현이 디자인 충실도와 성능 측면에서 적합

### 8.3 사용할 외부 라이브러리

| 라이브러리 | 용도 |
|-----------|------|
| `zustand` | 상태 관리 |
| `date-fns` | 날짜 계산/포맷 |
| `react-native-reanimated` | 스크롤 애니메이션 (선택) |
| `react-native-gesture-handler` | 스와이프 제스처 |

---

## 9. 성능 고려사항

| 이슈 | 대응 |
|------|------|
| 월 뷰 무한 스크롤 | `SectionList` + `getItemLayout`으로 고정 높이 최적화 |
| 타임라인 렌더링 | 보이는 시간 범위만 렌더링 (windowing) |
| 일정 레이아웃 계산 | `useMemo`로 캐싱, 날짜 변경 시에만 재계산 |
| 다일 일정 span | 주 단위로 pre-compute 후 캐시 |
| 뷰 전환 | `React.lazy` 또는 조건부 렌더링, 마운트 비용 최소화 |

---

## 10. 디자인 노트

### 일정 칩 색상 매핑

디자인에서 관찰된 색상:
- **연보라**: 기본 캘린더 일정 (파랑 계열 캘린더의 연한 배경)
- **연노랑**: 다른 캘린더 일정
- 텍스트 색상: 항상 검정/진회색

→ 캘린더 `color` 값을 기반으로 **배경은 opacity 20%, 텍스트는 원본 색상** 처리.

### 오늘 날짜 표시

- 월 뷰: 진한 원형 배경 (#1C1C1E) + 흰색 숫자
- 주/3일 뷰: 빨간색 원형 배경 (#FF3B30) + 흰색 숫자
- 일 뷰: 헤더에 날짜 표시 (원형 없음)

### 월 경계 표시

- 다음 달 시작 시 `2월` 같은 섹션 헤더 (왼쪽 정렬, 굵은 텍스트)
- 자연스러운 연속 스크롤 (월 간 구분선 없음)

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-30
