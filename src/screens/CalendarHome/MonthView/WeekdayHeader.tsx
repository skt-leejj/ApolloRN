import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {COLORS, LAYOUT} from '../../../utils/colors';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function WeekdayHeader() {
  return (
    <View style={styles.container}>
      {WEEKDAYS.map((name, idx) => (
        <View key={name} style={styles.cell}>
          <Text style={[styles.text, idx === 0 && styles.sundayText]}>
            {name}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: LAYOUT.weekdayHeaderHeight,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.separator,
    backgroundColor: COLORS.background,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
  },
  text: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  sundayText: {
    color: COLORS.textSunday,
  },
});
