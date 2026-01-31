import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import type {DailyComponentItem} from '../../../types/calendar';
import {COLORS} from '../../../utils/colors';
import {EventListItem} from './EventListItem';

interface DateSectionProps {
  date: Date;
  events: DailyComponentItem[];
  onEventPress?: (eventId: string) => void;
}

export function DateSection({date, events, onEventPress}: DateSectionProps) {
  const formatDateHeader = (targetDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);

    const month = targetDate.getMonth() + 1;
    const day = targetDate.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[targetDate.getDay()];
    const dateString = `${month}월 ${day}일(${weekday})`;

    if (target.getTime() === today.getTime()) {
      return {
        text: `오늘 ${dateString}`,
        isToday: true,
      };
    } else if (target.getTime() === tomorrow.getTime()) {
      return {
        text: `내일 ${dateString}`,
        isToday: false,
      };
    } else {
      return {
        text: dateString,
        isToday: false,
      };
    }
  };

  const header = formatDateHeader(date);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text
          style={[
            styles.headerText,
            header.isToday && styles.headerTextToday,
          ]}>
          {header.text}
        </Text>
      </View>

      {events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>일정이 없어요.</Text>
        </View>
      ) : (
        <View style={styles.eventsContainer}>
          {events.map(event => (
            <EventListItem
              key={event.id}
              event={event}
              onPress={onEventPress}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  headerTextToday: {
    color: COLORS.todayBg,
  },
  emptyContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textTertiary,
  },
  eventsContainer: {
    gap: 0,
  },
});
