import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {COLORS} from '../../utils/colors';
import {formatHeaderTitle} from '../../utils/dateUtils';
import {useCalendarStore} from './hooks/useCalendarStore';

interface CalendarHeaderProps {
  onBack?: () => void;
  onSettings?: () => void;
  onScan?: () => void;
  onMenuOpen?: () => void;
  onTitlePress?: () => void;
  isPopupOpen?: boolean;
}

export function CalendarHeader({
  onBack,
  onSettings,
  onScan,
  onMenuOpen,
  onTitlePress,
  isPopupOpen = false,
}: CalendarHeaderProps) {
  const {viewType, selectedDate} = useCalendarStore();
  const title = formatHeaderTitle(selectedDate, viewType);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backIcon}>{'<'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.titleContainer}
        onPress={onTitlePress}
        activeOpacity={0.6}>
        <Text style={styles.titleText}>{title}</Text>
        <Text style={styles.dropdownArrow}>{isPopupOpen ? ' ∧' : ' ∨'}</Text>
      </TouchableOpacity>

      <View style={styles.rightIcons}>
        <TouchableOpacity style={styles.iconButton} onPress={onMenuOpen}>
          <Text style={styles.iconText}>🔧</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: COLORS.background,
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    fontSize: 20,
    color: COLORS.textPrimary,
    fontWeight: '300',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  dropdownArrow: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  rightIcons: {
    flexDirection: 'row',
    marginLeft: 'auto',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  iconText: {
    fontSize: 20,
  },
});
