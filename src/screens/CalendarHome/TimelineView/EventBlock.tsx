import React from 'react';
import {Text, TouchableOpacity, StyleSheet} from 'react-native';
import type {ViewStyle} from 'react-native';
import {GestureDetector} from 'react-native-gesture-handler';
import type {GestureType, ComposedGesture} from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import type {EventBlockLayout} from './TimelineUtils';

interface EventBlockProps {
  layout: EventBlockLayout;
  onPress?: (eventId: string) => void;
  positionStyle?: ViewStyle;
  gesture?: GestureType | ComposedGesture | null;
  isDragging?: boolean;
}

export function EventBlock({
  layout,
  onPress,
  positionStyle,
  gesture,
  isDragging,
}: EventBlockProps) {
  const {event} = layout;
  const calendarColor = event.eventDetail.calendar.color;
  const bgColor = calendarColor + '33';

  const containerStyle = [
    styles.container,
    positionStyle,
    {backgroundColor: bgColor, borderLeftColor: calendarColor},
    isDragging && styles.dragging,
  ];

  // gesture가 있는 경우 GestureDetector + Animated.View로 래핑
  if (gesture) {
    return (
      <GestureDetector gesture={gesture}>
        <Animated.View style={containerStyle}>
          <Text
            style={[styles.title, {color: calendarColor}]}
            numberOfLines={2}>
            {event.eventDetail.title}
          </Text>
        </Animated.View>
      </GestureDetector>
    );
  }

  // gesture가 없는 경우 (isReadOnly 등) 기존 TouchableOpacity 유지
  return (
    <TouchableOpacity
      style={containerStyle}
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
  dragging: {
    opacity: 0.5,
  },
});
