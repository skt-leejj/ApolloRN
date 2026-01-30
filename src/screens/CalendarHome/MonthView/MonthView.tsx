import React, {useMemo, useRef, useCallback, useEffect} from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';
import {COLORS} from '../../../utils/colors';
import type {DailyComponentItem} from '../../../types/calendar';
import {
  addMonths,
  getMonthWeeks,
  isSameMonth,
  isToday,
  formatMonthTitle,
} from '../../../utils/dateUtils';
import {WeekdayHeader} from './WeekdayHeader';
import {WeekRow} from './WeekRow';

interface MonthViewProps {
  selectedDate: Date;
  events: DailyComponentItem[];
  onDayPress?: (date: Date) => void;
}

interface MonthSection {
  key: string;
  month: Date;
  weeks: Date[][];
}

const MONTHS_RANGE = 12; // 현재 월 기준 ±12개월

function generateMonthSections(centerDate: Date): MonthSection[] {
  const sections: MonthSection[] = [];
  for (let i = -MONTHS_RANGE; i <= MONTHS_RANGE; i++) {
    const month = addMonths(centerDate, i);
    const weeks = getMonthWeeks(month);
    sections.push({
      key: `${month.getFullYear()}-${month.getMonth()}`,
      month,
      weeks,
    });
  }
  return sections;
}

export function MonthView({selectedDate, events, onDayPress}: MonthViewProps) {
  const flatListRef = useRef<FlatList>(null);

  const sections = useMemo(
    () => generateMonthSections(selectedDate),
    [selectedDate],
  );

  // 현재 월 인덱스로 초기 스크롤
  const initialIndex = MONTHS_RANGE;

  const renderMonthItem = useCallback(
    ({item}: {item: MonthSection}) => {
      return (
        <View style={styles.monthContainer}>
          {/* 월 헤더 (첫 번째 월 제외 시 표시) */}
          <Text style={styles.monthHeader}>
            {formatMonthTitle(item.month)}
          </Text>
          {item.weeks.map((weekDays, weekIdx) => (
            <WeekRow
              key={`${item.key}-w${weekIdx}`}
              weekDays={weekDays}
              currentMonth={item.month}
              events={events}
              onDayPress={onDayPress}
            />
          ))}
        </View>
      );
    },
    [events, onDayPress],
  );

  const getItemLayout = useCallback(
    (_data: any, index: number) => {
      // 대략적인 높이 추정 (주 수에 따라 다름)
      const estimatedHeight = 450;
      return {
        length: estimatedHeight,
        offset: estimatedHeight * index,
        index,
      };
    },
    [],
  );

  return (
    <View style={styles.container}>
      <WeekdayHeader />
      <FlatList
        ref={flatListRef}
        data={sections}
        renderItem={renderMonthItem}
        keyExtractor={item => item.key}
        initialScrollIndex={initialIndex}
        getItemLayout={getItemLayout}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={3}
        windowSize={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  monthContainer: {
    paddingBottom: 8,
  },
  monthHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
});
