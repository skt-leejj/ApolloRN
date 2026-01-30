import React, {useMemo, useCallback} from 'react';
import {View, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {COLORS} from '../../utils/colors';
import {getWeekDays, getThreeDays} from '../../utils/dateUtils';
import {useCalendarStore} from './hooks/useCalendarStore';
import {useCalendarEvents} from './hooks/useCalendarEvents';
import {CalendarHeader} from './CalendarHeader';
import {BottomBar} from './BottomBar';
import {MonthView} from './MonthView/MonthView';
import {TimelineView} from './TimelineView/TimelineView';

export function CalendarHomeScreen() {
  const insets = useSafeAreaInsets();
  const {viewType, selectedDate, setSelectedDate, setViewType} =
    useCalendarStore();
  const {events} = useCalendarEvents();

  // 뷰 타입에 따른 날짜 배열
  const days = useMemo(() => {
    switch (viewType) {
      case 'week':
        return getWeekDays(selectedDate);
      case 'threeDays':
        return getThreeDays(selectedDate);
      case 'day':
        return [selectedDate];
      default:
        return [];
    }
  }, [viewType, selectedDate]);

  const handleDayPress = useCallback(
    (date: Date) => {
      setSelectedDate(date);
    },
    [setSelectedDate],
  );

  const handleEventPress = useCallback((eventId: string) => {
    // TODO: 일정 상세 화면 이동
  }, []);

  const renderContent = () => {
    switch (viewType) {
      case 'month':
        return (
          <MonthView
            selectedDate={selectedDate}
            events={events}
            onDayPress={handleDayPress}
          />
        );
      case 'week':
        return (
          <TimelineView
            numberOfDays={7}
            days={days}
            events={events}
            onDayPress={handleDayPress}
            onEventPress={handleEventPress}
          />
        );
      case 'threeDays':
        return (
          <TimelineView
            numberOfDays={3}
            days={days}
            events={events}
            onDayPress={handleDayPress}
            onEventPress={handleEventPress}
          />
        );
      case 'day':
        return (
          <TimelineView
            numberOfDays={1}
            days={days}
            events={events}
            onDayPress={handleDayPress}
            onEventPress={handleEventPress}
          />
        );
    }
  };

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <CalendarHeader />
      <View style={styles.content}>{renderContent()}</View>
      <BottomBar />
      <View style={{height: insets.bottom}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
});
