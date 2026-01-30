import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {COLORS, LAYOUT} from '../../../utils/colors';
import {getDay, isToday, isSunday, getWeekdayName} from '../../../utils/dateUtils';

interface DayColumnHeaderProps {
  days: Date[];
  onDayPress?: (date: Date) => void;
}

export function DayColumnHeader({days, onDayPress}: DayColumnHeaderProps) {
  return (
    <View style={styles.container}>
      {/* 시간 라벨 영역의 빈 공간 */}
      <View style={styles.timeLabelSpacer} />
      {days.map((day, idx) => {
        const dayOfWeek = getDay(day);
        const weekdayName = getWeekdayName(dayOfWeek);
        const dayNumber = day.getDate();
        const today = isToday(day);
        const sunday = isSunday(day);

        return (
          <TouchableOpacity
            key={idx}
            style={styles.dayColumn}
            onPress={() => onDayPress?.(day)}>
            <Text
              style={[
                styles.weekdayText,
                sunday && styles.sundayText,
                today && styles.todayWeekdayText,
              ]}>
              {weekdayName}
            </Text>
            <View
              style={[
                styles.dayNumberContainer,
                today && styles.todayNumberBg,
              ]}>
              <Text
                style={[
                  styles.dayNumberText,
                  sunday && !today && styles.sundayText,
                  today && styles.todayNumberText,
                ]}>
                {dayNumber}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: LAYOUT.dayColumnHeaderHeight,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.separator,
    backgroundColor: COLORS.background,
  },
  timeLabelSpacer: {
    width: LAYOUT.timeLabelWidth,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  sundayText: {
    color: COLORS.textSunday,
  },
  todayWeekdayText: {
    color: COLORS.todayTimelineBg,
  },
  dayNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayNumberBg: {
    backgroundColor: COLORS.todayTimelineBg,
  },
  dayNumberText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  todayNumberText: {
    color: COLORS.textWhite,
    fontWeight: '700',
  },
});
