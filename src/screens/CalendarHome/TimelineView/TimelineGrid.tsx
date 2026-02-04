import React, {useState, useCallback, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import type {LayoutChangeEvent} from 'react-native';
import type {GestureType, ComposedGesture} from 'react-native-gesture-handler';
import {COLORS, LAYOUT} from '../../../utils/colors';
import {TimeLabel} from './TimeLabel';
import {EventBlock} from './EventBlock';
import type {EventBlockLayout} from './TimelineUtils';

interface TimelineGridProps {
  numberOfDays: number;
  eventLayouts: EventBlockLayout[];
  withSpace?: boolean;
  onEventPress?: (eventId: string) => void;
  gestureMap?: Map<string, GestureType | ComposedGesture>;
  draggedEventId?: string | null;
  onColumnWidthChange?: (width: number) => void;
}

const HOURS = Array.from({length: 24}, (_, i) => i);

export function TimelineGrid({
  numberOfDays,
  eventLayouts,
  withSpace = false,
  onEventPress,
  gestureMap,
  draggedEventId,
  onColumnWidthChange,
}: TimelineGridProps) {
  const totalHeight = 24 * LAYOUT.hourHeight;
  const [gridWidth, setGridWidth] = useState(0);

  const onGridLayout = useCallback((e: LayoutChangeEvent) => {
    setGridWidth(e.nativeEvent.layout.width);
  }, []);

  const columnWidth = gridWidth > 0 ? gridWidth / numberOfDays : 0;

  // columnWidth 변경 시 부모에게 알림
  useEffect(() => {
    if (columnWidth > 0) {
      onColumnWidthChange?.(columnWidth);
    }
  }, [columnWidth, onColumnWidthChange]);

  return (
    <View style={[styles.container, {height: totalHeight}]}>
      {/* 시간 라벨 + 수평선 */}
      {HOURS.map(hour => (
        <View
          key={hour}
          style={[styles.hourRow, {top: hour * LAYOUT.hourHeight}]}>
          <TimeLabel hour={hour} withSpace={withSpace} />
          <View style={styles.hourLine} />
        </View>
      ))}

      {/* 이벤트 영역 (시간 라벨 오른쪽) */}
      <View style={styles.eventArea} onLayout={onGridLayout}>
        {/* 컬럼 구분선 */}
        {Array.from({length: numberOfDays - 1}, (_, i) => (
          <View
            key={`divider-${i}`}
            style={[
              styles.columnDivider,
              {left: columnWidth * (i + 1)},
            ]}
          />
        ))}

        {/* 일정 블록 */}
        {gridWidth > 0 &&
          eventLayouts.map((layout, idx) => {
            const colOffset = layout.columnIndex * columnWidth;
            const blockWidth = layout.width * columnWidth - 1;
            const blockLeft = colOffset + layout.left * columnWidth;
            const isDragging = draggedEventId === layout.event.id;
            const gesture = gestureMap?.get(layout.event.id) ?? null;

            return (
              <EventBlock
                key={`${layout.event.id}-${idx}`}
                layout={layout}
                onPress={onEventPress}
                gesture={gesture}
                isDragging={isDragging}
                positionStyle={{
                  top: layout.top,
                  left: blockLeft,
                  width: blockWidth,
                  height: layout.height,
                }}
              />
            );
          })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexDirection: 'row',
  },
  hourRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    zIndex: 0,
  },
  hourLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.hourLine,
  },
  eventArea: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: LAYOUT.timeLabelWidth,
    right: 0,
  },
  columnDivider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.hourLine,
    zIndex: 1,
  },
});
