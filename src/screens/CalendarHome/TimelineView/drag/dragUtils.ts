import {LAYOUT} from '../../../../utils/colors';
import type {DailyComponentItem} from '../../../../types/calendar';
import type {EventBlockLayout} from '../TimelineUtils';
import {SNAP_PX} from './constants';

/**
 * Y 좌표를 15분 단위로 snap
 */
export function snapToTimeGrid(y: number): number {
  'worklet';
  return Math.round(y / SNAP_PX) * SNAP_PX;
}

/**
 * X 좌표를 컬럼 인덱스로 변환
 */
export function snapToColumn(
  x: number,
  columnWidth: number,
  numberOfDays: number,
): number {
  'worklet';
  const col = Math.floor(x / columnWidth);
  return Math.max(0, Math.min(col, numberOfDays - 1));
}

/**
 * Y 좌표(content 기준)를 분(minutes)으로 변환
 * hourHeight=60 → 1px = 1min
 */
export function yToMinutes(y: number): number {
  'worklet';
  return Math.round(y * (60 / LAYOUT.hourHeight));
}

/**
 * 분(minutes)을 Y 좌표로 변환
 */
export function minutesToY(minutes: number): number {
  'worklet';
  return minutes * (LAYOUT.hourHeight / 60);
}

/**
 * 새로운 시작/종료 날짜를 계산
 */
export function computeNewDates(
  originalEvent: DailyComponentItem,
  days: Date[],
  newColumnIndex: number,
  newStartMinutes: number,
): {newStartDate: Date; newEndDate: Date} {
  const durationMinutes = originalEvent.durationMinutes;
  const targetDay = days[newColumnIndex];

  const newStartDate = new Date(targetDay);
  newStartDate.setHours(0, 0, 0, 0);
  newStartDate.setMinutes(newStartMinutes);

  const newEndDate = new Date(newStartDate);
  newEndDate.setMinutes(newStartDate.getMinutes() + durationMinutes);

  return {newStartDate, newEndDate};
}

/**
 * 이벤트가 드래그 가능한지 확인
 */
export function isDraggable(event: DailyComponentItem): boolean {
  return !event.eventDetail.isReadOnly && !event.eventDetail.isAllDay;
}

/**
 * 새 시작 분이 유효 범위(0~24시) 내인지 확인
 */
export function clampStartMinutes(
  startMinutes: number,
  durationMinutes: number,
): number {
  'worklet';
  const maxStart = 24 * 60 - durationMinutes;
  return Math.max(0, Math.min(startMinutes, maxStart));
}

/**
 * EventBlockLayout에서 원본 시작 분을 추출
 */
export function getOriginalStartMinutes(layout: EventBlockLayout): number {
  return yToMinutes(layout.top);
}
