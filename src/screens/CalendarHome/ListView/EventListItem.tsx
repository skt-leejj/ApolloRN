import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import type {DailyComponentItem} from '../../../types/calendar';
import {COLORS} from '../../../utils/colors';

interface EventListItemProps {
  event: DailyComponentItem;
  onPress?: (eventId: string) => void;
}

export function EventListItem({event, onPress}: EventListItemProps) {
  const {eventDetail, displayStartDate} = event;
  const {title, isAllDay, calendar} = eventDetail;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? '오후' : '오전';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${period} ${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  const handlePress = () => {
    onPress?.(eventDetail.id);
  };

  return (
    <TouchableOpacity
      style={[styles.container, {backgroundColor: calendar.color}]}
      onPress={handlePress}
      activeOpacity={0.7}>
      <View style={styles.content}>
        {!isAllDay && (
          <Text style={styles.time}>{formatTime(displayStartDate)}</Text>
        )}
        <Text style={styles.calendarName}>{calendar.name}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 4,
    overflow: 'hidden',
  },
  content: {
    padding: 12,
  },
  time: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.6)',
    marginBottom: 2,
  },
  calendarName: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
  },
});
