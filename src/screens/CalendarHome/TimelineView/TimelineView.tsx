import React, {useMemo, useRef, useEffect} from 'react';
import {View, ScrollView, StyleSheet} from 'react-native';
import {COLORS, LAYOUT} from '../../../utils/colors';
import type {DailyComponentItem} from '../../../types/calendar';
import {DayColumnHeader} from './DayColumnHeader';
import {AllDaySection} from './AllDaySection';
import {TimelineGrid} from './TimelineGrid';
import {calculateEventBlockLayouts} from './TimelineUtils';

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
  const scrollViewRef = useRef<ScrollView>(null);
  const withSpace = numberOfDays === 1;

  // 모든 날짜의 이벤트 레이아웃 계산
  const eventLayouts = useMemo(() => {
    return days.flatMap((day, colIdx) =>
      calculateEventBlockLayouts(events, day, colIdx),
    );
  }, [days, events]);

  // 초기 스크롤 위치: 오전 7시 부근
  useEffect(() => {
    const initialScrollY = 7 * LAYOUT.hourHeight;
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({y: initialScrollY, animated: false});
    }, 100);
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
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <TimelineGrid
          numberOfDays={numberOfDays}
          eventLayouts={eventLayouts}
          withSpace={withSpace}
          onEventPress={onEventPress}
        />
      </ScrollView>
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
