import type {DailyComponentItem} from '../../../types/calendar';
import {
  isSameDay,
  getDay,
  parseDateString,
  startOfDay,
  addDays,
} from '../../../utils/dateUtils';

export interface WeekEventLayout {
  event: DailyComponentItem;
  startCol: number; // 0-6
  endCol: number; // 0-6
  row: number; // 배치된 행 인덱스
}

/**
 * 이벤트가 특정 주(7일)와 겹치는지 확인하고
 * 해당 주에서의 시작/종료 컬럼을 반환.
 */
function getEventColumnsInWeek(
  event: DailyComponentItem,
  weekDays: Date[],
): {startCol: number; endCol: number} | null {
  const eventStart = startOfDay(
    parseDateString(event.eventDetail.startDate.date),
  );
  const eventEnd = startOfDay(
    parseDateString(event.eventDetail.endDate.date),
  );
  const weekStart = startOfDay(weekDays[0]);
  const weekEnd = startOfDay(weekDays[6]);

  // 이 주와 겹치지 않으면 null
  if (eventEnd < weekStart || eventStart > weekEnd) {
    return null;
  }

  let startCol = 0;
  let endCol = 6;

  for (let i = 0; i < 7; i++) {
    if (isSameDay(weekDays[i], eventStart) || weekDays[i] >= eventStart) {
      startCol = i;
      break;
    }
  }

  for (let i = 6; i >= 0; i--) {
    if (isSameDay(weekDays[i], eventEnd) || weekDays[i] <= eventEnd) {
      endCol = i;
      break;
    }
  }

  return {startCol, endCol};
}

/**
 * 주 단위 이벤트 레이아웃 계산.
 * 종일/다일 이벤트를 먼저 배치하고, 시간 이벤트를 배치.
 * maxRows 초과 시 overflow 카운트 반환.
 */
export function calculateWeekEventLayouts(
  events: DailyComponentItem[],
  weekDays: Date[],
  maxRows: number = 3,
): {layouts: WeekEventLayout[]; overflowByDay: number[]} {
  // 이 주에 해당하는 이벤트를 추출하고 컬럼 범위 계산
  const eventsWithCols: {
    event: DailyComponentItem;
    startCol: number;
    endCol: number;
    span: number;
    isAllDay: boolean;
  }[] = [];

  for (const event of events) {
    const cols = getEventColumnsInWeek(event, weekDays);
    if (cols) {
      eventsWithCols.push({
        event,
        startCol: cols.startCol,
        endCol: cols.endCol,
        span: cols.endCol - cols.startCol + 1,
        isAllDay: event.eventDetail.isAllDay,
      });
    }
  }

  // 정렬: 종일 우선, span 큰 것 우선, 시작 컬럼 작은 것 우선
  eventsWithCols.sort((a, b) => {
    if (a.isAllDay !== b.isAllDay) {return a.isAllDay ? -1 : 1;}
    if (a.span !== b.span) {return b.span - a.span;}
    return a.startCol - b.startCol;
  });

  // 행(slot) 배정: 각 행에서 어떤 컬럼이 사용 중인지 추적
  const rowOccupancy: boolean[][] = []; // rowOccupancy[row][col] = occupied
  const layouts: WeekEventLayout[] = [];

  for (const item of eventsWithCols) {
    let assignedRow = -1;

    // 빈 행 찾기
    for (let row = 0; row < rowOccupancy.length; row++) {
      let fits = true;
      for (let col = item.startCol; col <= item.endCol; col++) {
        if (rowOccupancy[row][col]) {
          fits = false;
          break;
        }
      }
      if (fits) {
        assignedRow = row;
        break;
      }
    }

    // 빈 행 없으면 새 행 추가
    if (assignedRow === -1) {
      assignedRow = rowOccupancy.length;
      rowOccupancy.push(new Array(7).fill(false));
    }

    // 행에 배치
    for (let col = item.startCol; col <= item.endCol; col++) {
      rowOccupancy[assignedRow][col] = true;
    }

    layouts.push({
      event: item.event,
      startCol: item.startCol,
      endCol: item.endCol,
      row: assignedRow,
    });
  }

  // maxRows 초과 이벤트 수 계산 (날짜별)
  const overflowByDay = new Array(7).fill(0);
  for (const layout of layouts) {
    if (layout.row >= maxRows) {
      for (let col = layout.startCol; col <= layout.endCol; col++) {
        overflowByDay[col]++;
      }
    }
  }

  // maxRows 내의 레이아웃만 반환
  const visibleLayouts = layouts.filter(l => l.row < maxRows);

  return {layouts: visibleLayouts, overflowByDay};
}

/**
 * 특정 날짜의 이벤트 목록 반환 (종일 + 시간 모두)
 */
export function getEventsForDay(
  events: DailyComponentItem[],
  day: Date,
): DailyComponentItem[] {
  return events.filter(event => {
    const eventStart = startOfDay(
      parseDateString(event.eventDetail.startDate.date),
    );
    const eventEnd = startOfDay(
      parseDateString(event.eventDetail.endDate.date),
    );
    const target = startOfDay(day);
    return target >= eventStart && target <= eventEnd;
  });
}
