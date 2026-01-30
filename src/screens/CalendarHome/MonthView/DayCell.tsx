import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {COLORS} from '../../../utils/colors';
import {isToday, isSunday, isSameMonth} from '../../../utils/dateUtils';

interface DayCellProps {
  date: Date;
  currentMonth: Date;
  onPress?: (date: Date) => void;
}

export function DayCell({date, currentMonth, onPress}: DayCellProps) {
  const today = isToday(date);
  const sunday = isSunday(date);
  const inMonth = isSameMonth(date, currentMonth);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(date)}
      activeOpacity={0.6}>
      <View style={[styles.numberContainer, today && styles.todayBg]}>
        <Text
          style={[
            styles.numberText,
            sunday && !today && styles.sundayText,
            !inMonth && styles.otherMonthText,
            today && styles.todayText,
          ]}>
          {date.getDate()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 4,
  },
  numberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayBg: {
    backgroundColor: COLORS.todayBg,
  },
  numberText: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textPrimary,
  },
  sundayText: {
    color: COLORS.textSunday,
  },
  otherMonthText: {
    color: COLORS.textTertiary,
  },
  todayText: {
    color: COLORS.textWhite,
    fontWeight: '700',
  },
});
