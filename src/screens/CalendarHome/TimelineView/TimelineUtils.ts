import type {DailyComponentItem} from '../../../types/calendar';
import {parseDateString, isSameDay, getHours, getMinutes} from '../../../utils/dateUtils';
import {LAYOUT} from '../../../utils/colors';

export interface EventBlockLayout {
  event: DailyComponentItem;
  top: number;
  height: number;
  left: number;
  width: number;
  columnIndex: number;
}

/**
 * 시간 일정의 Y 위치와 높이를 계산
 */
function getTimePosition(dateStr: string): number {
  const d = parseDateString(dateStr);
  return (getHours(d) * 60 + getMinutes(d)) * (LAYOUT.hourHeight / 60);
}

/**
 * 시간 범위가 겹치는지 확인
 */
function isOverlapping(a: DailyComponentItem, b: DailyComponentItem): boolean {
  const aStart = new Date(a.eventDetail.startDate.date).getTime();
  const aEnd = new Date(a.eventDetail.endDate.date).getTime();
  const bStart = new Date(b.eventDetail.startDate.date).getTime();
  const bEnd = new Date(b.eventDetail.endDate.date).getTime();
  return aStart < bEnd && bStart < aEnd;
}

/**
 * 겹치는 일정을 그룹으로 묶음
 */
function groupOverlappingEvents(
  events: DailyComponentItem[],
): DailyComponentItem[][] {
  if (events.length === 0) {return [];}

  const sorted = [...events].sort(
    (a, b) =>
      new Date(a.eventDetail.startDate.date).getTime() -
      new Date(b.eventDetail.startDate.date).getTime(),
  );

  const groups: DailyComponentItem[][] = [];
  let currentGroup: DailyComponentItem[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const event = sorted[i];
    const overlapsWithGroup = currentGroup.some(e => isOverlapping(e, event));

    if (overlapsWithGroup) {
      currentGroup.push(event);
    } else {
      groups.push(currentGroup);
      currentGroup = [event];
    }
  }
  groups.push(currentGroup);

  return groups;
}

/**
 * 특정 날짜의 시간 일정 레이아웃을 계산.
 * 겹치는 일정을 가로로 분할.
 */
export function calculateEventBlockLayouts(
  events: DailyComponentItem[],
  day: Date,
  dayColumnIndex: number,
): EventBlockLayout[] {
  // 해당 날짜의 시간 일정만 필터
  const dayEvents = events.filter(e => {
    if (e.eventDetail.isAllDay) {return false;}
    const eventStart = parseDateString(e.eventDetail.startDate.date);
    return isSameDay(eventStart, day);
  });

  const groups = groupOverlappingEvents(dayEvents);
  const layouts: EventBlockLayout[] = [];

  for (const group of groups) {
    const totalCols = group.length;
    group.forEach((event, colIdx) => {
      const top = getTimePosition(event.eventDetail.startDate.date);
      const bottom = getTimePosition(event.eventDetail.endDate.date);
      const height = Math.max(bottom - top, LAYOUT.hourHeight / 4); // 최소 15분 높이

      layouts.push({
        event,
        top,
        height,
        left: colIdx / totalCols,
        width: 1 / totalCols,
        columnIndex: dayColumnIndex,
      });
    });
  }

  return layouts;
}

/**
 * 종일 일정 필터
 */
export function getAllDayEvents(
  events: DailyComponentItem[],
  day: Date,
): DailyComponentItem[] {
  return events.filter(e => {
    if (!e.eventDetail.isAllDay) {return false;}
    const eventStart = parseDateString(e.eventDetail.startDate.date);
    const eventEnd = parseDateString(e.eventDetail.endDate.date);
    return day >= eventStart && day <= eventEnd;
  });
}
