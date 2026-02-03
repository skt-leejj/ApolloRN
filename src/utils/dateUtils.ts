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

export function formatYearMonth(date: Date): string {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
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

/**
 * 전체 날짜 포맷: "2025년 7월 10일 수요일"
 */
export function formatFullDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = WEEKDAY_NAMES[getDay(date)];
  return `${year}년 ${month}월 ${day}일 ${weekday}요일`;
}

/**
 * 시간 포맷: "오전 8시 20분"
 */
export function formatDetailTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? '오후' : '오전';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  if (minutes === 0) {
    return `${period} ${displayHours}시`;
  }
  return `${period} ${displayHours}시 ${minutes}분`;
}

/**
 * D-day 계산: "D-8", "D-Day", "D+3"
 */
export function calculateDDay(targetDate: Date): string {
  const today = startOfDay(new Date());
  const target = startOfDay(targetDate);
  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    return 'D-Day';
  }
  if (diffDays > 0) {
    return `D-${diffDays}`;
  }
  return `D+${Math.abs(diffDays)}`;
}

/**
 * 반복 패턴 라벨: "매일", "매주", "7개월 간격" 등
 */
export function formatRecurrenceLabel(recurrence: {
  frequency: string;
  interval: number;
}): string {
  const {frequency, interval} = recurrence;
  if (interval === 1) {
    switch (frequency) {
      case 'daily':
        return '매일';
      case 'weekly':
        return '매주';
      case 'monthly':
        return '매월';
      case 'yearly':
        return '매년';
      default:
        return '반복';
    }
  }
  switch (frequency) {
    case 'daily':
      return `${interval}일 간격`;
    case 'weekly':
      return `${interval}주 간격`;
    case 'monthly':
      return `${interval}개월 간격`;
    case 'yearly':
      return `${interval}년 간격`;
    default:
      return `${interval} 간격`;
  }
}
