import React, {useState, useRef, useCallback, useEffect} from 'react';
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
  onEventPress?: (eventId: string) => void;
  navigateToDateTrigger?: number;
}

interface MonthSection {
  key: string;
  month: Date;
  weeks: Date[][];
}

const INITIAL_RANGE = 12; // 초기 ±12개월
const LOAD_MORE_COUNT = 12; // 추가 로드 시 12개월씩
const LOAD_MORE_THRESHOLD = 3; // 끝에서 3개 남으면 추가 로드

function createMonthSection(date: Date): MonthSection {
  const weeks = getMonthWeeks(date);
  return {
    key: `${date.getFullYear()}-${date.getMonth()}`,
    month: date,
    weeks,
  };
}

function generateInitialSections(centerDate: Date): MonthSection[] {
  const sections: MonthSection[] = [];
  for (let i = -INITIAL_RANGE; i <= INITIAL_RANGE; i++) {
    sections.push(createMonthSection(addMonths(centerDate, i)));
  }
  return sections;
}

export function MonthView({selectedDate, events, onDayPress, onEventPress, navigateToDateTrigger}: MonthViewProps) {
  const flatListRef = useRef<FlatList>(null);
  const [sections, setSections] = useState(() =>
    generateInitialSections(selectedDate),
  );
  const isLoadingRef = useRef(false);
  const isNavigatingRef = useRef(false);

  // 초기 스크롤 인덱스
  const initialIndex = INITIAL_RANGE;

  // 외부 날짜 이동 요청 (오늘 버튼, MonthPickerPopup 등)
  useEffect(() => {
    if (navigateToDateTrigger == null || navigateToDateTrigger === 0) {
      return;
    }
    isNavigatingRef.current = true;
    setSections(generateInitialSections(selectedDate));
  }, [navigateToDateTrigger]); // selectedDate가 아닌 trigger에만 반응

  // sections 변경 후 즉시 스냅 (네비게이션 중일 때만)
  useEffect(() => {
    if (!isNavigatingRef.current) {
      return;
    }
    flatListRef.current?.scrollToIndex({index: INITIAL_RANGE, animated: false});
    isNavigatingRef.current = false;
  }, [sections]);

  // 뒤쪽에 월 추가 (아래로 스크롤)
  const handleEndReached = useCallback(() => {
    if (isLoadingRef.current) {
      return;
    }
    isLoadingRef.current = true;
    setSections(prev => {
      const lastMonth = prev[prev.length - 1].month;
      const newSections = [...prev];
      for (let i = 1; i <= LOAD_MORE_COUNT; i++) {
        newSections.push(createMonthSection(addMonths(lastMonth, i)));
      }
      return newSections;
    });
    isLoadingRef.current = false;
  }, []);

  // 앞쪽에 월 추가 (위로 스크롤)
  const handleStartReached = useCallback(() => {
    if (isLoadingRef.current) {
      return;
    }
    isLoadingRef.current = true;
    setSections(prev => {
      const firstMonth = prev[0].month;
      const newSections: MonthSection[] = [];
      for (let i = LOAD_MORE_COUNT; i >= 1; i--) {
        newSections.push(createMonthSection(addMonths(firstMonth, -i)));
      }
      return [...newSections, ...prev];
    });
    isLoadingRef.current = false;
  }, []);

  // 스크롤 위치 감시 → 상단 근접 시 앞쪽 데이터 추가
  const handleViewableItemsChanged = useCallback(
    ({viewableItems}: {viewableItems: Array<{index: number | null}>}) => {
      if (isNavigatingRef.current) {
        return;
      }
      if (viewableItems.length === 0) {
        return;
      }
      const firstVisible = viewableItems[0]?.index;
      if (firstVisible != null && firstVisible < LOAD_MORE_THRESHOLD) {
        handleStartReached();
      }
    },
    [handleStartReached],
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 10,
  }).current;

  const renderMonthItem = useCallback(
    ({item}: {item: MonthSection}) => {
      return (
        <View style={styles.monthContainer}>
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
              onEventPress={onEventPress}
            />
          ))}
        </View>
      );
    },
    [events, onDayPress, onEventPress],
  );

  const getItemLayout = useCallback(
    (_data: any, index: number) => {
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
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        maintainVisibleContentPosition={{minIndexForVisible: 0}}
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
