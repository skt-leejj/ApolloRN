import React, {useCallback, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/types';
import {COLORS} from '../../utils/colors';
import {useCalendarStore} from './hooks/useCalendarStore';
import {useCalendarEvents} from './hooks/useCalendarEvents';
import {CalendarHeader} from './CalendarHeader';
import {BottomBar} from './BottomBar';
import {MonthView} from './MonthView/MonthView';
import {TimelinePager} from './TimelineView/TimelinePager';
import {ListView} from './ListView/ListView';
import {SideMenu} from './SideMenu/SideMenu';
import {MonthPickerPopup} from './MonthPickerPopup';

export function CalendarHomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const {viewType, selectedDate, setSelectedDate, navigateToDate, navigateToDateTrigger} =
    useCalendarStore();
  const {events, loadMoreEvents} = useCalendarEvents();
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);

  const toggleMonthPicker = useCallback(() => {
    setMonthPickerVisible(prev => !prev);
  }, []);

  const closeMonthPicker = useCallback(() => {
    setMonthPickerVisible(false);
  }, []);

  const handleMonthPickerSelect = useCallback(
    (date: Date) => {
      navigateToDate(date);
    },
    [navigateToDate],
  );

  const handleDayPress = useCallback(
    (date: Date) => {
      setSelectedDate(date);
    },
    [setSelectedDate],
  );

  const handleEventPress = useCallback((eventId: string) => {
    navigation.navigate('EventDetail', {eventId});
  }, [navigation]);

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
          onEventPress={handleEventPress}
          navigateToDateTrigger={navigateToDateTrigger}
        />
      );
    }
    if (viewType === 'list') {
      return (
        <ListView
          selectedDate={selectedDate}
          events={events}
          onEventPress={handleEventPress}
          navigateToDateTrigger={navigateToDateTrigger}
          onLoadMoreEvents={loadMoreEvents}
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
        navigateToDateTrigger={navigateToDateTrigger}
      />
    );
  };

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <CalendarHeader
        onMenuOpen={() => setSideMenuVisible(true)}
        onTitlePress={toggleMonthPicker}
        isPopupOpen={monthPickerVisible}
      />
      <View style={styles.contentWrapper}>
        <View style={styles.content}>{renderContent()}</View>
        <BottomBar />
        <View style={{height: insets.bottom}} />
        <MonthPickerPopup
          visible={monthPickerVisible}
          selectedDate={selectedDate}
          onSelectDate={handleMonthPickerSelect}
          onClose={closeMonthPicker}
        />
      </View>
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
  contentWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
});
