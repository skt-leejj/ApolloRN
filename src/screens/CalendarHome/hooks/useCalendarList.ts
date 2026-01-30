import {useEffect, useState, useCallback} from 'react';
import {DailyCalendarBridge} from '../../../bridge/DailyCalendarBridge';
import type {CalendarGroup} from '../../../types/calendar';

export function useCalendarList() {
  const [groups, setGroups] = useState<CalendarGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const data = await DailyCalendarBridge.getCalendarGroups();
      setGroups(data);
    } catch (e) {
      console.warn('[useCalendarList] getCalendarGroups failed:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const toggleGroupCollapsed = useCallback((groupId: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  const toggleCalendarVisibility = useCallback(
    async (calendarId: string, visible: boolean) => {
      try {
        await DailyCalendarBridge.toggleCalendarVisibility(calendarId, visible);
        setGroups(prev =>
          prev.map(group => ({
            ...group,
            calendars: group.calendars.map(cal =>
              cal.id === calendarId ? {...cal, isVisible: visible} : cal,
            ),
          })),
        );
      } catch (e) {
        console.warn('[useCalendarList] toggleCalendarVisibility failed:', e);
      }
    },
    [],
  );

  return {
    groups,
    loading,
    collapsedGroups,
    toggleGroupCollapsed,
    toggleCalendarVisibility,
    refetch: fetchGroups,
  };
}
