import React, {useCallback, useEffect, useRef, useState} from 'react';
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
import {DailyCalendarBridge} from '../../../bridge/DailyCalendarBridge';

interface ListViewProps {
  selectedDate: Date;
  events: DailyComponentItem[];
  onEventPress?: (eventId: string) => void;
  navigateToDateTrigger?: number;
}

interface DateSectionType {
  date: Date;
  dateKey: string;
  events: DailyComponentItem[];
}

const DAYS_TO_LOAD = 30;
const SCROLL_THRESHOLD = 2000;

export function ListView({
  selectedDate,
  events,
  onEventPress,
  navigateToDateTrigger,
}: ListViewProps) {
  const [dateSections, setDateSections] = useState<DateSectionType[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialScrollIndex, setInitialScrollIndex] = useState<number>(0);
  const flatListRef = useRef<FlatList>(null);
  const startDateRef = useRef<Date>(new Date());
  const endDateRef = useRef<Date>(new Date());
  const isLoadingRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const allEventsRef = useRef<Map<string, DailyComponentItem[]>>(new Map());
  const dateSectionsRef = useRef<DateSectionType[]>([]);

  const getDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const initializeDateRange = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(today);
    start.setDate(start.getDate() - DAYS_TO_LOAD);

    const end = new Date(today);
    end.setDate(end.getDate() + DAYS_TO_LOAD);

    startDateRef.current = start;
    endDateRef.current = end;

    const sections: DateSectionType[] = [];
    const current = new Date(start);

    while (current <= end) {
      const dateKey = getDateKey(current);
      sections.push({
        date: new Date(current),
        dateKey,
        events: allEventsRef.current.get(dateKey) || [],
      });
      current.setDate(current.getDate() + 1);
    }

    return sections;
  }, []);

  // 초기 데이터 로드
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    // props로 받은 events를 맵으로 변환
    const eventsMap = new Map<string, DailyComponentItem[]>();
    events.forEach(event => {
      const eventDate = new Date(event.eventDetail.startDate.date);
      const key = getDateKey(eventDate);
      if (!eventsMap.has(key)) {
        eventsMap.set(key, []);
      }
      eventsMap.get(key)!.push(event);
    });

    allEventsRef.current = eventsMap;

    const sections = initializeDateRange();

    // 오늘 인덱스 찾기
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIndex = sections.findIndex(section => {
      return getDateKey(section.date) === getDateKey(today);
    });

    if (todayIndex !== -1) {
      setInitialScrollIndex(todayIndex);
    }

    setDateSections(sections);
    dateSectionsRef.current = sections;
  }, [initializeDateRange, events]);

  // 외부 날짜 이동 요청 (오늘 버튼, MonthPickerPopup 등)
  useEffect(() => {
    if (navigateToDateTrigger == null || navigateToDateTrigger === 0) {
      return;
    }
    // selectedDate 기준으로 해당 날짜 섹션으로 스크롤
    const targetKey = getDateKey(selectedDate);
    const targetIndex = dateSectionsRef.current.findIndex(
      section => getDateKey(section.date) === targetKey,
    );
    if (targetIndex !== -1) {
      flatListRef.current?.scrollToIndex({index: targetIndex, animated: true});
    }
  }, [navigateToDateTrigger]); // selectedDate가 아닌 trigger에만 반응

  const loadMoreDays = useCallback(
    async (direction: 'past' | 'future') => {
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;
      setLoadingMore(true);

      try {
        const sections: DateSectionType[] = [];
        let loadStartDate: Date;
        let loadEndDate: Date;

        if (direction === 'past') {
          const start = new Date(startDateRef.current);
          start.setDate(start.getDate() - DAYS_TO_LOAD);
          loadStartDate = start;
          loadEndDate = new Date(startDateRef.current);
          loadEndDate.setDate(loadEndDate.getDate() - 1);

          const current = new Date(start);
          while (current < startDateRef.current) {
            const dateKey = getDateKey(current);
            sections.push({
              date: new Date(current),
              dateKey,
              events: allEventsRef.current.get(dateKey) || [],
            });
            current.setDate(current.getDate() + 1);
          }

          startDateRef.current = start;
        } else {
          const end = new Date(endDateRef.current);
          end.setDate(end.getDate() + DAYS_TO_LOAD);
          loadStartDate = new Date(endDateRef.current);
          loadStartDate.setDate(loadStartDate.getDate() + 1);
          loadEndDate = end;

          const current = new Date(endDateRef.current);
          current.setDate(current.getDate() + 1);

          while (current <= end) {
            const dateKey = getDateKey(current);
            sections.push({
              date: new Date(current),
              dateKey,
              events: allEventsRef.current.get(dateKey) || [],
            });
            current.setDate(current.getDate() + 1);
          }

          endDateRef.current = end;
        }

        // 새로운 날짜 범위의 이벤트 로드
        const startDateString = loadStartDate.toISOString().split('T')[0];
        const endDateString = loadEndDate.toISOString().split('T')[0];
        const newEvents = await DailyCalendarBridge.getEvents(
          startDateString,
          endDateString,
        );

        // 새로운 이벤트를 ref에 추가
        newEvents.forEach(event => {
          const eventDate = new Date(event.eventDetail.startDate.date);
          const key = getDateKey(eventDate);
          if (!allEventsRef.current.has(key)) {
            allEventsRef.current.set(key, []);
          }
          const existing = allEventsRef.current.get(key)!;
          // 중복 체크
          if (!existing.find(e => e.id === event.id)) {
            existing.push(event);
          }
        });

        // 새로 추가된 섹션에 이벤트 할당
        sections.forEach(section => {
          section.events = allEventsRef.current.get(section.dateKey) || [];
        });

        // 섹션 추가 (기존 섹션은 참조 유지)
        setDateSections(prev => {
          const newSections =
            direction === 'past'
              ? [...sections, ...prev]
              : [...prev, ...sections];
          dateSectionsRef.current = newSections;
          return newSections;
        });
      } catch (error) {
        console.error('Failed to load more days:', error);
      } finally {
        isLoadingRef.current = false;
        setLoadingMore(false);
      }
    },
    [],
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;

      // 상단 근처에서 과거 데이터 로드
      if (contentOffset.y < SCROLL_THRESHOLD) {
        loadMoreDays('past');
      }

      // 하단 근처에서 미래 데이터 로드
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
          // 스크롤 실패 시 재시도
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
