import React from 'react';
import {Text, TouchableOpacity, StyleSheet} from 'react-native';
import type {ViewStyle} from 'react-native';
import type {EventBlockLayout} from './TimelineUtils';

interface EventBlockProps {
  layout: EventBlockLayout;
  columnWidth: number;
  onPress?: (eventId: string) => void;
  style?: ViewStyle;
}

export function EventBlock({layout, columnWidth, onPress, style}: EventBlockProps) {
  const {event, top, height, left, width} = layout;
  const calendarColor = event.eventDetail.calendar.color;
  const bgColor = calendarColor + '33';

  const defaultStyle: ViewStyle = {
    top,
    height,
    left: left * columnWidth,
    width: width * columnWidth - 1,
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        defaultStyle,
        {backgroundColor: bgColor, borderLeftColor: calendarColor},
        style,
      ]}
      activeOpacity={0.7}
      onPress={() => onPress?.(event.id)}>
      <Text style={[styles.title, {color: calendarColor}]} numberOfLines={2}>
        {event.eventDetail.title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    borderLeftWidth: 3,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  title: {
    fontSize: 11,
    fontWeight: '500',
  },
});
