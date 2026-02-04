import React, {useMemo, useEffect, useState, useCallback} from 'react';
import {View, StyleSheet, type LayoutChangeEvent} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedRef,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import {COLORS, LAYOUT} from '../../../utils/colors';
import type {DailyComponentItem} from '../../../types/calendar';
import {DayColumnHeader} from './DayColumnHeader';
import {AllDaySection} from './AllDaySection';
import {TimelineGrid} from './TimelineGrid';
import {calculateEventBlockLayouts} from './TimelineUtils';
import {useDragEvent} from './drag/useDragEvent';
import {useAutoScroll} from './drag/useAutoScroll';
import {DragOverlay} from './drag/DragOverlay';

interface TimelineViewProps {
  numberOfDays: 1 | 3 | 7;
  days: Date[];
  events: DailyComponentItem[];
  onDayPress?: (date: Date) => void;
  onEventPress?: (eventId: string) => void;
}

export function TimelineView({
  numberOfDays,
  days,
  events,
  onDayPress,
  onEventPress,
}: TimelineViewProps) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useSharedValue(0);
  const withSpace = numberOfDays === 1;

  // ScrollView layout 정보 (자동 스크롤/오버레이 위치용)
  const scrollViewY = useSharedValue(0);
  const scrollViewHeight = useSharedValue(0);
  const [columnWidth, setColumnWidth] = useState(0);

  // 모든 날짜의 이벤트 레이아웃 계산
  const eventLayouts = useMemo(() => {
    return days.flatMap((day, colIdx) =>
      calculateEventBlockLayouts(events, day, colIdx),
    );
  }, [days, events]);

  // 스크롤 오프셋 추적
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollOffset.value = event.contentOffset.y;
    },
  });

  // 드래그 이벤트 훅
  const {
    dragState,
    dragSharedValues,
    gestureMap,
    scrollEnabled,
  } = useDragEvent({
    numberOfDays,
    days,
    events,
    eventLayouts,
    columnWidth,
    scrollOffset,
    onEventPress,
  });

  // 자동 스크롤 훅
  useAutoScroll({
    scrollRef,
    isDragging: dragSharedValues.isDragging,
    panActive: dragSharedValues.panActive,
    overlayY: dragSharedValues.overlayY,
    overlayHeight: dragSharedValues.overlayHeight,
    startContentY: dragSharedValues.startContentY,
    expectedScroll: dragSharedValues.expectedScroll,
    scrollViewY,
    scrollViewHeight,
  });

  // 초기 스크롤 위치: 오전 7시 부근
  useEffect(() => {
    const initialScrollY = 7 * LAYOUT.hourHeight;
    setTimeout(() => {
      scrollRef.current?.scrollTo({y: initialScrollY, animated: false});
    }, 100);
  }, [scrollRef]);

  const handleScrollViewLayout = useCallback((e: LayoutChangeEvent) => {
    const {y, height} = e.nativeEvent.layout;
    scrollViewY.value = y;
    scrollViewHeight.value = height;
  }, [scrollViewY, scrollViewHeight]);

  const handleColumnWidthChange = useCallback((width: number) => {
    setColumnWidth(width);
  }, []);

  return (
    <View style={styles.container}>
      {/* 요일 헤더 (일 뷰에서는 숨김) */}
      {numberOfDays > 1 && (
        <DayColumnHeader days={days} onDayPress={onDayPress} />
      )}

      {/* 종일 일정 영역 */}
      <AllDaySection days={days} events={events} />

      {/* 타임라인 스크롤 영역 */}
      <Animated.ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        scrollEnabled={scrollEnabled}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onLayout={handleScrollViewLayout}>
        <TimelineGrid
          numberOfDays={numberOfDays}
          eventLayouts={eventLayouts}
          withSpace={withSpace}
          onEventPress={onEventPress}
          gestureMap={gestureMap}
          draggedEventId={dragState.draggedEventId}
          onColumnWidthChange={handleColumnWidthChange}
        />
      </Animated.ScrollView>

      {/* 드래그 오버레이 (ScrollView 밖에 렌더링) */}
      <DragOverlay
        draggedEventId={dragState.draggedEventId}
        events={events}
        sharedValues={dragSharedValues}
        scrollViewY={scrollViewY}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
});
