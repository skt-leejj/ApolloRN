import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  addWeeks,
  addDays,
  format,
  isSameDay,
  isSameMonth,
  isToday as dateFnsIsToday,
  isSunday,
  getDay,
  eachDayOfInterval,
  eachWeekOfInterval,
  differenceInMinutes,
  parseISO,
  startOfDay,
  getHours,
  getMinutes,
} from 'date-fns';

export {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  addWeeks,
  addDays,
  isSameDay,
  isSameMonth,
  isSunday,
  getDay,
  eachDayOfInterval,
  eachWeekOfInterval,
  differenceInMinutes,
  parseISO,
  startOfDay,
  getHours,
  getMinutes,
};

export const isToday = dateFnsIsToday;

const WEEKDAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export function getWeekdayName(dayIndex: number): string {
  return WEEKDAY_NAMES[dayIndex];
}

export function formatMonthTitle(date: Date): string {
  return `${date.getMonth() + 1}월`;
}

export function formatDayTitle(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = WEEKDAY_NAMES[getDay(date)];
  return `${month}월 ${day}일 (${weekday})`;
}

export function formatHeaderTitle(
  date: Date,
  viewType: 'month' | 'week' | 'day' | 'threeDays',
): string {
  if (viewType === 'day') {
    return formatDayTitle(date);
  }
  return formatMonthTitle(date);
}

/**
 * 시간 라벨 포맷
 * 주/3일 뷰: "오전5시", "오후1시" (공백 없음)
 * 일 뷰: "오전 5시", "오후 1시" (공백 있음)
 */
export function formatTimeLabel(
  hour: number,
  withSpace: boolean = false,
): string {
  const sp = withSpace ? ' ' : '';
  if (hour === 0) {return `오전${sp}12시`;}
  if (hour < 12) {return `오전${sp}${hour}시`;}
  if (hour === 12) {return `오후${sp}12시`;}
  return `오후${sp}${hour - 12}시`;
}

/**
 * 해당 월의 전체 주(week) 배열 생성.
 * 각 주는 7일(일~토) 배열.
 */
export function getMonthWeeks(date: Date): Date[][] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);

  const calendarStart = startOfWeek(monthStart, {weekStartsOn: 0});
  const calendarEnd = endOfWeek(monthEnd, {weekStartsOn: 0});

  const weeks: Date[][] = [];
  const allDays = eachDayOfInterval({start: calendarStart, end: calendarEnd});

  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  return weeks;
}

/**
 * 주 뷰용: 주의 시작일(일요일)부터 7일 반환
 */
export function getWeekDays(date: Date): Date[] {
  const weekStart = startOfWeek(date, {weekStartsOn: 0});
  return eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6),
  });
}

/**
 * 3일 뷰용: 기준 날짜부터 3일 반환
 */
export function getThreeDays(date: Date): Date[] {
  return eachDayOfInterval({
    start: date,
    end: addDays(date, 2),
  });
}

/**
 * ISO 날짜 문자열을 Date 객체로 파싱
 */
export function parseDateString(dateStr: string): Date {
  if (dateStr.includes('T')) {
    return parseISO(dateStr);
  }
  return new Date(dateStr + 'T00:00:00');
}

/**
 * 날짜 포맷: YYYY-MM-DD
 */
export function toDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}
