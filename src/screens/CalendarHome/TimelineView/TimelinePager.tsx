import React, {useState, useRef, useCallback, useEffect} from 'react';
import {FlatList, useWindowDimensions, StyleSheet, View} from 'react-native';
import type {DailyComponentItem} from '../../../types/calendar';
import {
  addDays,
  getWeekDays,
  getThreeDays,
  startOfWeek,
} from '../../../utils/dateUtils';
import {TimelineView} from './TimelineView';

interface TimelinePagerProps {
  numberOfDays: 1 | 3 | 7;
  selectedDate: Date;
  events: DailyComponentItem[];
  onDayPress?: (date: Date) => void;
  onEventPress?: (eventId: string) => void;
  onPageChanged?: (date: Date) => void;
  navigateToDateTrigger?: number;
}

interface TimelinePage {
  key: string;
  days: Date[];
  referenceDate: Date;
}

const INITIAL_PAGES = 12; // 초기 ±12 페이지
const LOAD_MORE_COUNT = 12; // 추가 로드 시 12 페이지씩
const LOAD_MORE_THRESHOLD = 3;

function getDaysForPage(baseDate: Date, numberOfDays: 1 | 3 | 7): Date[] {
  switch (numberOfDays) {
    case 7:
      return getWeekDays(baseDate);
    case 3:
      return getThreeDays(baseDate);
    case 1:
    default:
      return [baseDate];
  }
}

function getPageStep(numberOfDays: 1 | 3 | 7): number {
  return numberOfDays;
}

function getPageBaseDate(
  selectedDate: Date,
  numberOfDays: 1 | 3 | 7,
): Date {
  if (numberOfDays === 7) {
    return startOfWeek(selectedDate, {weekStartsOn: 0});
  }
  return selectedDate;
}

function createPage(
  baseDate: Date,
  numberOfDays: 1 | 3 | 7,
): TimelinePage {
  const days = getDaysForPage(baseDate, numberOfDays);
  return {
    key: `${baseDate.getFullYear()}-${baseDate.getMonth()}-${baseDate.getDate()}`,
    days,
    referenceDate: baseDate,
  };
}

function generateInitialPages(
  selectedDate: Date,
  numberOfDays: 1 | 3 | 7,
): TimelinePage[] {
  const baseDate = getPageBaseDate(selectedDate, numberOfDays);
  const step = getPageStep(numberOfDays);
  const pages: TimelinePage[] = [];

  for (let i = -INITIAL_PAGES; i <= INITIAL_PAGES; i++) {
    const pageBase = addDays(baseDate, i * step);
    pages.push(createPage(pageBase, numberOfDays));
  }

  return pages;
}

export function TimelinePager({
  numberOfDays,
  selectedDate,
  events,
  onDayPress,
  onEventPress,
  onPageChanged,
  navigateToDateTrigger,
}: TimelinePagerProps) {
  const {width} = useWindowDimensions();
  const flatListRef = useRef<FlatList>(null);
  const [pages, setPages] = useState(() =>
    generateInitialPages(selectedDate, numberOfDays),
  );
  const isLoadingRef = useRef(false);
  const currentIndexRef = useRef(INITIAL_PAGES);

  // numberOfDays 변경 시 페이지 재생성
  useEffect(() => {
    setPages(generateInitialPages(selectedDate, numberOfDays));
    currentIndexRef.current = INITIAL_PAGES;
  }, [numberOfDays]);

  // 외부 날짜 이동 요청 (오늘 버튼, MonthPickerPopup 등)
  useEffect(() => {
    if (navigateToDateTrigger == null || navigateToDateTrigger === 0) {
      return;
    }
    setPages(generateInitialPages(selectedDate, numberOfDays));
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({index: INITIAL_PAGES, animated: true});
    }, 50);
  }, [navigateToDateTrigger]); // selectedDate가 아닌 trigger에만 반응

  // 뒤쪽에 페이지 추가
  const handleEndReached = useCallback(() => {
    if (isLoadingRef.current) {
      return;
    }
    isLoadingRef.current = true;
    const step = getPageStep(numberOfDays);
    setPages(prev => {
      const lastPage = prev[prev.length - 1];
      const newPages = [...prev];
      for (let i = 1; i <= LOAD_MORE_COUNT; i++) {
        const pageBase = addDays(lastPage.referenceDate, i * step);
        newPages.push(createPage(pageBase, numberOfDays));
      }
      return newPages;
    });
    isLoadingRef.current = false;
  }, [numberOfDays]);

  // 앞쪽에 페이지 추가
  const handleStartReached = useCallback(() => {
    if (isLoadingRef.current) {
      return;
    }
    isLoadingRef.current = true;
    const step = getPageStep(numberOfDays);
    setPages(prev => {
      const firstPage = prev[0];
      const newPages: TimelinePage[] = [];
      for (let i = LOAD_MORE_COUNT; i >= 1; i--) {
        const pageBase = addDays(firstPage.referenceDate, -i * step);
        newPages.push(createPage(pageBase, numberOfDays));
      }
      return [...newPages, ...prev];
    });
    isLoadingRef.current = false;
  }, [numberOfDays]);

  // 스크롤 위치 감시 → 상단 근접 시 앞쪽 데이터 추가
  const handleViewableItemsChanged = useCallback(
    ({viewableItems}: {viewableItems: Array<{index: number | null; item: TimelinePage}>}) => {
      if (viewableItems.length === 0) {
        return;
      }
      const firstVisible = viewableItems[0];
      if (firstVisible?.index != null && firstVisible.index < LOAD_MORE_THRESHOLD) {
        handleStartReached();
      }
      // 페이지 변경 시 selectedDate 동기화
      if (firstVisible?.item && onPageChanged) {
        onPageChanged(firstVisible.item.referenceDate);
      }
    },
    [handleStartReached, onPageChanged],
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderPage = useCallback(
    ({item}: {item: TimelinePage}) => {
      return (
        <View style={{width}}>
          <TimelineView
            numberOfDays={numberOfDays}
            days={item.days}
            events={events}
            onDayPress={onDayPress}
            onEventPress={onEventPress}
          />
        </View>
      );
    },
    [width, numberOfDays, events, onDayPress, onEventPress],
  );

  const getItemLayout = useCallback(
    (_data: any, index: number) => ({
      length: width,
      offset: width * index,
      index,
    }),
    [width],
  );

  return (
    <FlatList
      ref={flatListRef}
      data={pages}
      renderItem={renderPage}
      keyExtractor={item => item.key}
      horizontal
      pagingEnabled
      initialScrollIndex={INITIAL_PAGES}
      getItemLayout={getItemLayout}
      showsHorizontalScrollIndicator={false}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      onViewableItemsChanged={handleViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      maintainVisibleContentPosition={{minIndexForVisible: 0}}
      removeClippedSubviews
      maxToRenderPerBatch={3}
      windowSize={3}
    />
  );
}
