import React, {useCallback, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {COLORS} from '../../utils/colors';
import {useCalendarStore} from './hooks/useCalendarStore';
import {useCalendarEvents} from './hooks/useCalendarEvents';
import {CalendarHeader} from './CalendarHeader';
import {BottomBar} from './BottomBar';
import {MonthView} from './MonthView/MonthView';
import {TimelinePager} from './TimelineView/TimelinePager';
import {ListView} from './ListView/ListView';
import {SideMenu} from './SideMenu/SideMenu';

export function CalendarHomeScreen() {
  const insets = useSafeAreaInsets();
  const {viewType, selectedDate, setSelectedDate, goToTodayTrigger} =
    useCalendarStore();
  const {events} = useCalendarEvents();
  const [sideMenuVisible, setSideMenuVisible] = useState(false);

  const handleDayPress = useCallback(
    (date: Date) => {
      setSelectedDate(date);
    },
    [setSelectedDate],
  );

  const handleEventPress = useCallback((eventId: string) => {
    // TODO: 일정 상세 화면 이동
  }, []);

  const handlePageChanged = useCallback(
    (date: Date) => {
      setSelectedDate(date);
    },
    [setSelectedDate],
  );

  const numberOfDays = viewType === 'week' ? 7 : viewType === 'threeDays' ? 3 : 1;

  const renderContent = () => {
    if (viewType === 'month') {
      return (
        <MonthView
          selectedDate={selectedDate}
          events={events}
          onDayPress={handleDayPress}
          goToTodayTrigger={goToTodayTrigger}
        />
      );
    }
    if (viewType === 'list') {
      return (
        <ListView
          selectedDate={selectedDate}
          events={events}
          onEventPress={handleEventPress}
          goToTodayTrigger={goToTodayTrigger}
        />
      );
    }
    return (
      <TimelinePager
        numberOfDays={numberOfDays as 1 | 3 | 7}
        selectedDate={selectedDate}
        events={events}
        onDayPress={handleDayPress}
        onEventPress={handleEventPress}
        onPageChanged={handlePageChanged}
        goToTodayTrigger={goToTodayTrigger}
      />
    );
  };

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <CalendarHeader onMenuOpen={() => setSideMenuVisible(true)} />
      <View style={styles.content}>{renderContent()}</View>
      <BottomBar />
      <View style={{height: insets.bottom}} />
      <SideMenu
        visible={sideMenuVisible}
        onClose={() => setSideMenuVisible(false)}
      />
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
