import React, {useState, useCallback, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import {COLORS} from '../../utils/colors';
import {
  formatYearMonth,
  getMonthWeeks,
  getWeekdayName,
  addMonths,
  isToday,
  isSameDay,
  isSameMonth,
  isSunday,
} from '../../utils/dateUtils';

const INITIAL_PAGES = 12;
const LOAD_MORE_COUNT = 12;
const LOAD_MORE_THRESHOLD = 3;
const POPUP_MARGIN_H = 16;
const POPUP_PADDING_H = 12;

interface MonthPage {
  key: string;
  month: Date;
}

function createMonthPage(date: Date): MonthPage {
  return {
    key: `${date.getFullYear()}-${date.getMonth()}`,
    month: new Date(date.getFullYear(), date.getMonth(), 1),
  };
}

function generateInitialPages(baseDate: Date): MonthPage[] {
  const pages: MonthPage[] = [];
  for (let i = -INITIAL_PAGES; i <= INITIAL_PAGES; i++) {
    pages.push(createMonthPage(addMonths(baseDate, i)));
  }
  return pages;
}

interface MonthPickerPopupProps {
  visible: boolean;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onClose: () => void;
}

export function MonthPickerPopup({
  visible,
  selectedDate,
  onSelectDate,
  onClose,
}: MonthPickerPopupProps) {
  const {width: screenWidth} = useWindowDimensions();
  const contentWidth = screenWidth - POPUP_MARGIN_H * 2 - POPUP_PADDING_H * 2;

  const [displayMonth, setDisplayMonth] = useState(selectedDate);
  const [shouldRender, setShouldRender] = useState(visible);
  const [pages, setPages] = useState(() => generateInitialPages(selectedDate));
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const popupTranslateY = useRef(new Animated.Value(-20)).current;
  const flatListRef = useRef<FlatList>(null);
  const currentIndexRef = useRef(INITIAL_PAGES);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      setPages(generateInitialPages(selectedDate));
      setDisplayMonth(selectedDate);
      currentIndexRef.current = INITIAL_PAGES;
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(popupTranslateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(popupTranslateY, {
          toValue: -20,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => setShouldRender(false));
    }
  }, [visible, overlayOpacity, popupTranslateY, selectedDate]);

  const goToPrevMonth = useCallback(() => {
    const newIndex = currentIndexRef.current - 1;
    if (newIndex >= 0) {
      flatListRef.current?.scrollToIndex({index: newIndex, animated: true});
    }
  }, []);

  const goToNextMonth = useCallback(() => {
    const newIndex = currentIndexRef.current + 1;
    if (newIndex < pages.length) {
      flatListRef.current?.scrollToIndex({index: newIndex, animated: true});
    }
  }, [pages.length]);

  const handleEndReached = useCallback(() => {
    if (isLoadingRef.current) {
      return;
    }
    isLoadingRef.current = true;
    setPages(prev => {
      const lastPage = prev[prev.length - 1];
      const newPages = [...prev];
      for (let i = 1; i <= LOAD_MORE_COUNT; i++) {
        newPages.push(createMonthPage(addMonths(lastPage.month, i)));
      }
      return newPages;
    });
    isLoadingRef.current = false;
  }, []);

  const handleStartReached = useCallback(() => {
    if (isLoadingRef.current) {
      return;
    }
    isLoadingRef.current = true;
    setPages(prev => {
      const firstPage = prev[0];
      const newPages: MonthPage[] = [];
      for (let i = LOAD_MORE_COUNT; i >= 1; i--) {
        newPages.push(createMonthPage(addMonths(firstPage.month, -i)));
      }
      return [...newPages, ...prev];
    });
    currentIndexRef.current += LOAD_MORE_COUNT;
    isLoadingRef.current = false;
  }, []);

  const handleViewableItemsChanged = useCallback(
    ({
      viewableItems,
    }: {
      viewableItems: Array<{index: number | null; item: MonthPage}>;
    }) => {
      if (viewableItems.length === 0) {
        return;
      }
      const firstVisible = viewableItems[0];
      if (firstVisible?.item) {
        setDisplayMonth(firstVisible.item.month);
      }
      if (
        firstVisible?.index != null &&
        firstVisible.index < LOAD_MORE_THRESHOLD
      ) {
        handleStartReached();
      }
      if (firstVisible?.index != null) {
        currentIndexRef.current = firstVisible.index;
      }
    },
    [handleStartReached],
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleSelectDate = useCallback(
    (date: Date) => {
      onSelectDate(date);
      onClose();
    },
    [onSelectDate, onClose],
  );

  const getItemLayout = useCallback(
    (_data: any, index: number) => ({
      length: contentWidth,
      offset: contentWidth * index,
      index,
    }),
    [contentWidth],
  );

  const renderMonthGrid = useCallback(
    ({item}: {item: MonthPage}) => {
      const weeks = getMonthWeeks(item.month);
      return (
        <View style={{width: contentWidth}}>
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.weekRow}>
              {week.map((date, dayIndex) => {
                const inMonth = isSameMonth(date, item.month);
                const today = isToday(date);
                const selected = isSameDay(date, selectedDate) && !today;

                return (
                  <TouchableOpacity
                    key={dayIndex}
                    style={styles.dayCell}
                    onPress={() => handleSelectDate(date)}
                    activeOpacity={0.6}>
                    <View
                      style={[
                        styles.dayNumber,
                        today && styles.todayBg,
                        selected && styles.selectedBg,
                      ]}>
                      <Text
                        style={[
                          styles.dayText,
                          !inMonth && styles.otherMonthText,
                          isSunday(date) &&
                            inMonth &&
                            !today &&
                            styles.sundayText,
                          today && styles.todayText,
                          selected && styles.selectedText,
                        ]}>
                        {date.getDate()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      );
    },
    [contentWidth, selectedDate, handleSelectDate],
  );

  if (!shouldRender) {
    return null;
  }

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <Animated.View style={[styles.overlay, {opacity: overlayOpacity}]}>
        <TouchableWithoutFeedback>
          <Animated.View
            style={[
              styles.popup,
              {transform: [{translateY: popupTranslateY}]},
            ]}>
            {/* 헤더: 년월 + 좌우 화살표 */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.arrowButton}
                onPress={goToPrevMonth}>
                <Text style={styles.arrowText}>{'<'}</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>
                {formatYearMonth(displayMonth)}
              </Text>
              <TouchableOpacity
                style={styles.arrowButton}
                onPress={goToNextMonth}>
                <Text style={styles.arrowText}>{'>'}</Text>
              </TouchableOpacity>
            </View>

            {/* 요일 헤더 */}
            <View style={styles.weekdayRow}>
              {Array.from({length: 7}, (_, i) => (
                <View key={i} style={styles.weekdayCell}>
                  <Text
                    style={[
                      styles.weekdayText,
                      i === 0 && styles.sundayText,
                    ]}>
                    {getWeekdayName(i)}
                  </Text>
                </View>
              ))}
            </View>

            {/* 날짜 그리드 - FlatList 가로 페이징 */}
            <FlatList
              ref={flatListRef}
              data={pages}
              renderItem={renderMonthGrid}
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
          </Animated.View>
        </TouchableWithoutFeedback>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 100,
  },
  popup: {
    marginTop: 44,
    marginHorizontal: POPUP_MARGIN_H,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: POPUP_PADDING_H,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  arrowButton: {
    padding: 8,
  },
  arrowText: {
    fontSize: 18,
    fontWeight: '300',
    color: COLORS.textPrimary,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textPrimary,
  },
  otherMonthText: {
    color: COLORS.textTertiary,
  },
  sundayText: {
    color: COLORS.textSunday,
  },
  todayBg: {
    backgroundColor: COLORS.todayBg,
  },
  todayText: {
    color: COLORS.textWhite,
    fontWeight: '700',
  },
  selectedBg: {
    backgroundColor: COLORS.separator,
  },
  selectedText: {
    fontWeight: '700',
  },
});
