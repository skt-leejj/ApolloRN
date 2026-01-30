import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {COLORS, LAYOUT} from '../../../utils/colors';
import type {DailyComponentItem} from '../../../types/calendar';
import {getAllDayEvents} from './TimelineUtils';

interface AllDaySectionProps {
  days: Date[];
  events: DailyComponentItem[];
}

export function AllDaySection({days, events}: AllDaySectionProps) {
  const dayAllDayEvents = days.map(day => getAllDayEvents(events, day));
  const hasAnyAllDay = dayAllDayEvents.some(evts => evts.length > 0);

  if (!hasAnyAllDay) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.timeLabelSpacer} />
      {dayAllDayEvents.map((dayEvents, idx) => (
        <View key={idx} style={styles.dayColumn}>
          {dayEvents.map(event => (
            <View
              key={event.id}
              style={[
                styles.chip,
                {backgroundColor: event.eventDetail.calendar.color + '33'},
              ]}>
              <Text
                style={[
                  styles.chipText,
                  {color: event.eventDetail.calendar.color},
                ]}
                numberOfLines={1}>
                {event.eventDetail.title}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    minHeight: LAYOUT.allDaySectionMinHeight,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.separator,
    paddingVertical: 4,
    backgroundColor: COLORS.background,
  },
  timeLabelSpacer: {
    width: LAYOUT.timeLabelWidth,
  },
  dayColumn: {
    flex: 1,
    gap: 2,
    paddingHorizontal: 1,
  },
  chip: {
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '500',
  },
});
