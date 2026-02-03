import {useState, useEffect, useCallback} from 'react';
import {DailyCalendarBridge} from '../../bridge/DailyCalendarBridge';
import type {CalendarEventDetail} from '../../types/calendar';

interface UseEventDetailResult {
  event: CalendarEventDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useEventDetail(eventId: string): UseEventDetailResult {
  const [event, setEvent] = useState<CalendarEventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const detail = await DailyCalendarBridge.getEventDetail(eventId);
      setEvent(detail);
    } catch (e) {
      setError(e instanceof Error ? e.message : '일정을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  return {event, loading, error, refetch: fetchEvent};
}
