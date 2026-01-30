import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import type {WeekEventLayout} from './MonthUtils';
import {LAYOUT} from '../../../utils/colors';

interface EventChipProps {
  layout: WeekEventLayout;
  cellWidth: number;
}

export function EventChip({layout, cellWidth}: EventChipProps) {
  const {event, startCol, endCol, row} = layout;
  const calendarColor = event.eventDetail.calendar.color;
  const bgColor = calendarColor + '33';
  const span = endCol - startCol + 1;
  const isReadOnly = event.eventDetail.isReadOnly;

  const chipTop =
    28 + 4 + row * (LAYOUT.eventChipHeight + LAYOUT.eventChipGap); // dayNumber height + gap + row offset

  return (
    <View
      style={[
        styles.chip,
        {
          position: 'absolute',
          top: chipTop,
          left: startCol * cellWidth + 2,
          width: span * cellWidth - 4,
          height: LAYOUT.eventChipHeight,
          backgroundColor: bgColor,
        },
      ]}>
      <Text
        style={[styles.chipText, {color: calendarColor}]}
        numberOfLines={1}>
        {event.eventDetail.title}
        {isReadOnly ? ' 🔒' : ''}
      </Text>
    </View>
  );
}

interface OverflowIndicatorProps {
  count: number;
  col: number;
  row: number;
  cellWidth: number;
}

export function OverflowIndicator({
  count,
  col,
  row,
  cellWidth,
}: OverflowIndicatorProps) {
  if (count <= 0) {return null;}

  const chipTop =
    28 + 4 + row * (LAYOUT.eventChipHeight + LAYOUT.eventChipGap);

  return (
    <View
      style={[
        styles.overflow,
        {
          position: 'absolute',
          top: chipTop,
          left: col * cellWidth + 2,
          width: cellWidth - 4,
          height: LAYOUT.eventChipHeight,
        },
      ]}>
      <Text style={styles.overflowText}>+{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 3,
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 10,
    fontWeight: '500',
  },
  overflow: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  overflowText: {
    fontSize: 10,
    color: '#888888',
    fontWeight: '500',
  },
});
