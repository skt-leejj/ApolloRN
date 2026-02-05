import {useEffect, useCallback} from 'react';
import {DailyCalendarBridge} from '../../../bridge/DailyCalendarBridge';
import {useCalendarStore} from './useCalendarStore';
import {
  addMonths,
  addWeeks,
  addDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  toDateKey,
} from '../../../utils/dateUtils';

export function useCalendarEvents() {
  const {
    viewType,
    selectedDate,
    events,
    calendars,
    loading,
    setEvents,
    appendEvents,
    setCalendars,
    setLoading,
  } = useCalendarStore();

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      let start: Date;
      let end: Date;

      switch (viewType) {
        case 'month': {
          const monthStart = startOfMonth(addMonths(selectedDate, -2));
          const monthEnd = endOfMonth(addMonths(selectedDate, 2));
          start = startOfWeek(monthStart, {weekStartsOn: 0});
          end = endOfWeek(monthEnd, {weekStartsOn: 0});
          break;
        }
        case 'list': {
          start = addDays(selectedDate, -30);
          end = addDays(selectedDate, 30);
          break;
        }
        case 'week': {
          start = startOfWeek(addWeeks(selectedDate, -2), {weekStartsOn: 0});
          end = endOfWeek(addWeeks(selectedDate, 2), {weekStartsOn: 0});
          break;
        }
        case 'threeDays': {
          start = addDays(selectedDate, -6);
          end = addDays(selectedDate, 8);
          break;
        }
        case 'day': {
          start = addDays(selectedDate, -3);
          end = addDays(selectedDate, 3);
          break;
        }
      }

      const fetchedEvents = await DailyCalendarBridge.getEvents(
        toDateKey(start),
        toDateKey(end),
      );
      setEvents(fetchedEvents);
    } catch (_e) {
      // 에러 시 빈 배열 유지
    } finally {
      setLoading(false);
    }
  }, [viewType, selectedDate, setEvents, setLoading]);

  const loadCalendars = useCallback(async () => {
    try {
      const cals = await DailyCalendarBridge.getCalendars();
      setCalendars(cals);
    } catch (_e) {
      // 에러 시 빈 배열 유지
    }
  }, [setCalendars]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    loadCalendars();
  }, [loadCalendars]);

  const loadMoreEvents = useCallback(
    async (startDate: string, endDate: string) => {
      try {
        const newEvents = await DailyCalendarBridge.getEvents(
          startDate,
          endDate,
        );
        appendEvents(newEvents);
      } catch (_e) {
        // 에러 시 무시
      }
    },
    [appendEvents],
  );

  return {events, calendars, loading, refreshEvents: loadEvents, loadMoreEvents};
}
