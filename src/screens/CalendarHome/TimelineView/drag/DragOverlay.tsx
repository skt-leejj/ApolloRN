import React from 'react';
import {Text, StyleSheet} from 'react-native';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import type {SharedValue} from 'react-native-reanimated';
import {LAYOUT} from '../../../../utils/colors';
import type {DragSharedValues} from './types';
import type {DailyComponentItem} from '../../../../types/calendar';

interface DragOverlayProps {
  draggedEventId: string | null;
  events: DailyComponentItem[];
  sharedValues: DragSharedValues;
  scrollViewY: SharedValue<number>;
}

export function DragOverlay({
  draggedEventId,
  events,
  sharedValues,
  scrollViewY,
}: DragOverlayProps) {
  const animatedStyle = useAnimatedStyle(() => {
    if (!sharedValues.overlayOpacity.value) {
      return {opacity: 0};
    }

    // content 좌표 → viewport 좌표 변환 (expectedScroll은 동기 업데이트되므로 지연 없음)
    const viewportY =
      sharedValues.overlayY.value - sharedValues.expectedScroll.value + scrollViewY.value;

    return {
      opacity: sharedValues.overlayOpacity.value,
      top: viewportY,
      left: LAYOUT.timeLabelWidth + sharedValues.overlayX.value,
      width: sharedValues.overlayWidth.value,
      height: sharedValues.overlayHeight.value,
    };
  });

  const event = draggedEventId
    ? events.find(e => e.id === draggedEventId)
    : null;

  if (!event) {
    return null;
  }
  const calendarColor = event.eventDetail.calendar.color;
  const bgColor = blendHexOnWhite(calendarColor, 0.4);

  return (
    <Animated.View
      style={[
        styles.overlay,
        {backgroundColor: bgColor, borderLeftColor: calendarColor},
        animatedStyle,
      ]}
      pointerEvents="none">
      <Text style={[styles.title, {color: calendarColor}]} numberOfLines={2}>
        {event.eventDetail.title}
      </Text>
    </Animated.View>
  );
}

function blendHexOnWhite(hex: string, alpha: number) {
  const parsed = parseHexColor(hex);
  if (!parsed) {
    return hex;
  }
  const {r, g, b} = parsed;
  const clampAlpha = Math.max(0, Math.min(1, alpha));
  const rr = Math.round(r * clampAlpha + 255 * (1 - clampAlpha));
  const gg = Math.round(g * clampAlpha + 255 * (1 - clampAlpha));
  const bb = Math.round(b * clampAlpha + 255 * (1 - clampAlpha));
  return `#${toHex(rr)}${toHex(gg)}${toHex(bb)}`;
}

function parseHexColor(hex: string) {
  const normalized = hex.trim();
  if (/^#([0-9a-fA-F]{6})$/.test(normalized)) {
    const r = parseInt(normalized.slice(1, 3), 16);
    const g = parseInt(normalized.slice(3, 5), 16);
    const b = parseInt(normalized.slice(5, 7), 16);
    return {r, g, b};
  }
  if (/^#([0-9a-fA-F]{3})$/.test(normalized)) {
    const r = parseInt(normalized[1] + normalized[1], 16);
    const g = parseInt(normalized[2] + normalized[2], 16);
    const b = parseInt(normalized[3] + normalized[3], 16);
    return {r, g, b};
  }
  return null;
}

function toHex(value: number) {
  return value.toString(16).padStart(2, '0');
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    borderLeftWidth: 3,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    overflow: 'hidden',
    zIndex: 999,
    // 떠있는 느낌 그림자
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  title: {
    fontSize: 11,
    fontWeight: '500',
  },
});
