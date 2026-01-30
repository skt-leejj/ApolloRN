import React, {useState, useCallback, useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import type {LayoutChangeEvent} from 'react-native';
import {LAYOUT} from '../../../utils/colors';
import type {DailyComponentItem} from '../../../types/calendar';
import {DayCell} from './DayCell';
import {EventChip, OverflowIndicator} from './EventChip';
import {calculateWeekEventLayouts} from './MonthUtils';

interface WeekRowProps {
  weekDays: Date[];
  currentMonth: Date;
  events: DailyComponentItem[];
  onDayPress?: (date: Date) => void;
}

export function WeekRow({
  weekDays,
  currentMonth,
  events,
  onDayPress,
}: WeekRowProps) {
  const [rowWidth, setRowWidth] = useState(0);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setRowWidth(e.nativeEvent.layout.width);
  }, []);

  const cellWidth = rowWidth / 7;

  const {layouts, overflowByDay} = useMemo(
    () => calculateWeekEventLayouts(events, weekDays, LAYOUT.maxVisibleEvents),
    [events, weekDays],
  );

  const rowHeight =
    28 +
    4 +
    LAYOUT.maxVisibleEvents * (LAYOUT.eventChipHeight + LAYOUT.eventChipGap) +
    LAYOUT.eventChipHeight; // overflow indicator space

  return (
    <View style={[styles.container, {height: rowHeight}]} onLayout={onLayout}>
      {/* 날짜 셀 */}
      <View style={styles.dayCells}>
        {weekDays.map((day, idx) => (
          <DayCell
            key={idx}
            date={day}
            currentMonth={currentMonth}
            onPress={onDayPress}
          />
        ))}
      </View>

      {/* 이벤트 칩 (절대 위치) */}
      {rowWidth > 0 &&
        layouts.map((layout, idx) => (
          <EventChip
            key={`${layout.event.id}-${idx}`}
            layout={layout}
            cellWidth={cellWidth}
          />
        ))}

      {/* Overflow 표시 */}
      {rowWidth > 0 &&
        overflowByDay.map((count, col) =>
          count > 0 ? (
            <OverflowIndicator
              key={`overflow-${col}`}
              count={count}
              col={col}
              row={LAYOUT.maxVisibleEvents}
              cellWidth={cellWidth}
            />
          ) : null,
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  dayCells: {
    flexDirection: 'row',
  },
});
