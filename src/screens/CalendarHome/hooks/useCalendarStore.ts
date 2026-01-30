import {create} from 'zustand';
import type {CalendarViewType} from '../../../types/calendar';
import type {DailyComponentItem, CalendarItem} from '../../../types/calendar';

interface CalendarHomeState {
  viewType: CalendarViewType;
  selectedDate: Date;
  events: DailyComponentItem[];
  calendars: CalendarItem[];
  loading: boolean;
  goToTodayTrigger: number;

  setViewType: (type: CalendarViewType) => void;
  setSelectedDate: (date: Date) => void;
  goToToday: () => void;
  setEvents: (events: DailyComponentItem[]) => void;
  setCalendars: (calendars: CalendarItem[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useCalendarStore = create<CalendarHomeState>(set => ({
  viewType: 'month',
  selectedDate: new Date(),
  events: [],
  calendars: [],
  loading: false,
  goToTodayTrigger: 0,

  setViewType: type => set({viewType: type}),
  setSelectedDate: date => set({selectedDate: date}),
  goToToday: () =>
    set(state => ({
      selectedDate: new Date(),
      goToTodayTrigger: state.goToTodayTrigger + 1,
    })),
  setEvents: events => set({events}),
  setCalendars: calendars => set({calendars}),
  setLoading: loading => set({loading}),
}));
