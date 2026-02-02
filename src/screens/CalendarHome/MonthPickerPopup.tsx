import React, {useState, useCallback, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  PanResponder,
  type GestureResponderEvent,
  type PanResponderGestureState,
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
  const [displayMonth, setDisplayMonth] = useState(selectedDate);
  const [shouldRender, setShouldRender] = useState(visible);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const popupTranslateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
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
  }, [visible, overlayOpacity, popupTranslateY]);

  const goToPrevMonth = useCallback(() => {
    setDisplayMonth(prev => addMonths(prev, -1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setDisplayMonth(prev => addMonths(prev, 1));
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState,
      ) => Math.abs(gestureState.dx) > 15,
      onPanResponderRelease: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState,
      ) => {
        if (gestureState.dx > 50) {
          setDisplayMonth(prev => addMonths(prev, -1));
        } else if (gestureState.dx < -50) {
          setDisplayMonth(prev => addMonths(prev, 1));
        }
      },
    }),
  ).current;

  const handleSelectDate = useCallback(
    (date: Date) => {
      onSelectDate(date);
      onClose();
    },
    [onSelectDate, onClose],
  );

  if (!shouldRender) {
    return null;
  }

  const weeks = getMonthWeeks(displayMonth);

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

            {/* 날짜 그리드 */}
            <View {...panResponder.panHandlers}>
            {weeks.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.weekRow}>
                {week.map((date, dayIndex) => {
                  const inMonth = isSameMonth(date, displayMonth);
                  const today = isToday(date);
                  const selected =
                    isSameDay(date, selectedDate) && !today;

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
                            isSunday(date) && inMonth && !today && styles.sundayText,
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
    marginHorizontal: 16,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
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
