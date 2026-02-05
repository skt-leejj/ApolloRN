import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import type {DailyComponentItem} from '../../../types/calendar';
import {COLORS} from '../../../utils/colors';
import {DateSection} from './DateSection';

interface ListViewProps {
  selectedDate: Date;
  events: DailyComponentItem[];
  onEventPress?: (eventId: string) => void;
  navigateToDateTrigger?: number;
  onLoadMoreEvents?: (startDate: string, endDate: string) => Promise<void>;
}

interface DateSectionType {
  date: Date;
  dateKey: string;
  events: DailyComponentItem[];
}

const DAYS_TO_LOAD = 30;
const SCROLL_THRESHOLD = 2000;

function getDateKey(date: Date) {
  return date.toISOString().split('T')[0];
}

function buildEventsMap(events: DailyComponentItem[]) {
  const map = new Map<string, DailyComponentItem[]>();
  events.forEach(event => {
    const eventDate = new Date(event.eventDetail.startDate.date);
    const key = getDateKey(eventDate);
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(event);
  });
  return map;
}

function buildSections(
  centerDate: Date,
  daysRange: number,
  eventsMap: Map<string, DailyComponentItem[]>,
): DateSectionType[] {
  const center = new Date(centerDate);
  center.setHours(0, 0, 0, 0);

  const start = new Date(center);
  start.setDate(start.getDate() - daysRange);

  const end = new Date(center);
  end.setDate(end.getDate() + daysRange);

  const sections: DateSectionType[] = [];
  const current = new Date(start);

  while (current <= end) {
    const dateKey = getDateKey(current);
    sections.push({
      date: new Date(current),
      dateKey,
      events: eventsMap.get(dateKey) || [],
    });
    current.setDate(current.getDate() + 1);
  }

  return sections;
}

export function ListView({
  selectedDate,
  events,
  onEventPress,
  navigateToDateTrigger,
  onLoadMoreEvents,
}: ListViewProps) {
  const flatListRef = useRef<FlatList>(null);
  const startDateRef = useRef<Date>(new Date());
  const endDateRef = useRef<Date>(new Date());
  const isLoadingRef = useRef(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // events props → Map으로 변환
  const eventsMap = useMemo(() => buildEventsMap(events), [events]);

  // 날짜 섹션 생성 (centerDate 기준)
  const [centerDate, setCenterDate] = useState(() => new Date());
  const [dateSections, setDateSections] = useState<DateSectionType[]>([]);
  const [initialScrollIndex, setInitialScrollIndex] = useState(0);

  // centerDate 변경 시 섹션 재생성
  useEffect(() => {
    const sections = buildSections(centerDate, DAYS_TO_LOAD, eventsMap);

    const center = new Date(centerDate);
    center.setHours(0, 0, 0, 0);

    startDateRef.current = new Date(center);
    startDateRef.current.setDate(startDateRef.current.getDate() - DAYS_TO_LOAD);
    endDateRef.current = new Date(center);
    endDateRef.current.setDate(endDateRef.current.getDate() + DAYS_TO_LOAD);

    // 중심 날짜의 인덱스
    const centerKey = getDateKey(center);
    const centerIndex = sections.findIndex(s => s.dateKey === centerKey);

    setDateSections(sections);
    if (centerIndex !== -1) {
      setInitialScrollIndex(centerIndex);
    }
  }, [centerDate]); // eslint-disable-line react-hooks/exhaustive-deps

  // eventsMap 변경 시 기존 섹션의 이벤트 동기화
  useEffect(() => {
    setDateSections(prev =>
      prev.map(section => ({
        ...section,
        events: eventsMap.get(section.dateKey) || [],
      })),
    );
  }, [eventsMap]);

  // 외부 날짜 이동 요청 (오늘 버튼, MonthPickerPopup 등)
  useEffect(() => {
    if (navigateToDateTrigger == null || navigateToDateTrigger === 0) {
      return;
    }
    setCenterDate(new Date(selectedDate));

    // 스크롤 이동은 다음 렌더 후
    const targetDate = new Date(selectedDate);
    targetDate.setHours(0, 0, 0, 0);
    setTimeout(() => {
      const targetKey = getDateKey(targetDate);
      const sections = buildSections(targetDate, DAYS_TO_LOAD, eventsMap);
      const targetIndex = sections.findIndex(s => s.dateKey === targetKey);
      if (targetIndex !== -1) {
        flatListRef.current?.scrollToIndex({index: targetIndex, animated: false});
      }
    }, 0);
  }, [navigateToDateTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  // 스크롤 확장 시 날짜 섹션 추가 + 이벤트 로드 요청
  const loadMoreDays = useCallback(
    async (direction: 'past' | 'future') => {
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;
      setLoadingMore(true);

      try {
        const newSections: DateSectionType[] = [];
        let loadStartDate: string;
        let loadEndDate: string;

        if (direction === 'past') {
          const newStart = new Date(startDateRef.current);
          newStart.setDate(newStart.getDate() - DAYS_TO_LOAD);

          const current = new Date(newStart);
          while (current < startDateRef.current) {
            const dateKey = getDateKey(current);
            newSections.push({
              date: new Date(current),
              dateKey,
              events: eventsMap.get(dateKey) || [],
            });
            current.setDate(current.getDate() + 1);
          }

          loadStartDate = getDateKey(newStart);
          const prevDay = new Date(startDateRef.current);
          prevDay.setDate(prevDay.getDate() - 1);
          loadEndDate = getDateKey(prevDay);

          startDateRef.current = newStart;
        } else {
          const newEnd = new Date(endDateRef.current);
          newEnd.setDate(newEnd.getDate() + DAYS_TO_LOAD);

          const current = new Date(endDateRef.current);
          current.setDate(current.getDate() + 1);

          while (current <= newEnd) {
            const dateKey = getDateKey(current);
            newSections.push({
              date: new Date(current),
              dateKey,
              events: eventsMap.get(dateKey) || [],
            });
            current.setDate(current.getDate() + 1);
          }

          const nextDay = new Date(endDateRef.current);
          nextDay.setDate(nextDay.getDate() + 1);
          loadStartDate = getDateKey(nextDay);
          loadEndDate = getDateKey(newEnd);

          endDateRef.current = newEnd;
        }

        // store를 통해 이벤트 로드 요청
        if (onLoadMoreEvents) {
          await onLoadMoreEvents(loadStartDate, loadEndDate);
        }

        // 섹션 추가
        setDateSections(prev =>
          direction === 'past'
            ? [...newSections, ...prev]
            : [...prev, ...newSections],
        );
      } catch (error) {
        console.error('Failed to load more days:', error);
      } finally {
        isLoadingRef.current = false;
        setLoadingMore(false);
      }
    },
    [eventsMap, onLoadMoreEvents],
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;

      if (contentOffset.y < SCROLL_THRESHOLD) {
        loadMoreDays('past');
      }

      if (
        contentOffset.y + layoutMeasurement.height >
        contentSize.height - SCROLL_THRESHOLD
      ) {
        loadMoreDays('future');
      }
    },
    [loadMoreDays],
  );

  const renderItem = useCallback(
    ({item}: {item: DateSectionType}) => (
      <DateSection
        date={item.date}
        events={item.events}
        onEventPress={onEventPress}
      />
    ),
    [onEventPress],
  );

  const keyExtractor = useCallback(
    (item: DateSectionType) => item.dateKey,
    [],
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={dateSections}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        initialScrollIndex={initialScrollIndex}
        onScroll={handleScroll}
        scrollEventThrottle={400}
        onScrollToIndexFailed={info => {
          setTimeout(() => {
            if (
              flatListRef.current &&
              info.index < dateSections.length &&
              info.index >= 0
            ) {
              flatListRef.current.scrollToIndex({
                index: info.index,
                animated: false,
              });
            }
          }, 100);
        }}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.listContent}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
        removeClippedSubviews={false}
      />
      {loadingMore && (
        <View style={styles.loadingMoreContainer}>
          <ActivityIndicator size="small" color={COLORS.todayBg} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingVertical: 8,
  },
  loadingMoreContainer: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
