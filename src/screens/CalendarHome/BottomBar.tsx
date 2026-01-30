import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {COLORS, LAYOUT} from '../../utils/colors';
import {useCalendarStore} from './hooks/useCalendarStore';

interface BottomBarProps {
  onAddEvent?: () => void;
}

export function BottomBar({onAddEvent}: BottomBarProps) {
  const goToToday = useCalendarStore(s => s.goToToday);

  return (
    <View style={styles.container}>
      <View style={styles.spacer} />
      <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
        <Text style={styles.todayText}>오늘</Text>
      </TouchableOpacity>
      <View style={styles.spacer}>
        <TouchableOpacity style={styles.addButton} onPress={onAddEvent}>
          <Text style={styles.addText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: LAYOUT.bottomBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.separator,
  },
  spacer: {
    flex: 1,
    alignItems: 'flex-end',
    paddingRight: 16,
  },
  todayButton: {
    width: LAYOUT.todayButtonWidth,
    height: LAYOUT.todayButtonHeight,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.todayButtonBorder,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  todayText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  addButton: {
    width: LAYOUT.addButtonSize,
    height: LAYOUT.addButtonSize,
    borderRadius: LAYOUT.addButtonSize / 2,
    borderWidth: 1,
    borderColor: COLORS.addButtonBorder,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  addText: {
    fontSize: 24,
    fontWeight: '300',
    color: COLORS.textPrimary,
  },
});
