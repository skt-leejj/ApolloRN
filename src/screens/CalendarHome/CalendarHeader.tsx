import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Modal, StyleSheet} from 'react-native';
import {COLORS} from '../../utils/colors';
import {formatHeaderTitle} from '../../utils/dateUtils';
import {useCalendarStore} from './hooks/useCalendarStore';
import type {CalendarViewType} from '../../types/calendar';

interface CalendarHeaderProps {
  onBack?: () => void;
  onSettings?: () => void;
  onScan?: () => void;
}

const VIEW_TYPE_OPTIONS: {type: CalendarViewType; label: string}[] = [
  {type: 'month', label: '월'},
  {type: 'week', label: '주'},
  {type: 'threeDays', label: '3일'},
  {type: 'day', label: '일'},
];

export function CalendarHeader({
  onBack,
  onSettings,
  onScan,
}: CalendarHeaderProps) {
  const {viewType, selectedDate, setViewType} = useCalendarStore();
  const title = formatHeaderTitle(selectedDate, viewType);
  const [showViewPicker, setShowViewPicker] = useState(false);

  const handleTitlePress = () => {
    setShowViewPicker(true);
  };

  const handleViewTypeSelect = (type: CalendarViewType) => {
    setViewType(type);
    setShowViewPicker(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backIcon}>{'<'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.titleContainer} onPress={handleTitlePress}>
        <Text style={styles.titleText}>{title}</Text>
        <Text style={styles.dropdownArrow}> ∨</Text>
      </TouchableOpacity>

      <View style={styles.rightIcons}>
        <TouchableOpacity style={styles.iconButton} onPress={onSettings}>
          <Text style={styles.iconText}>🔧</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={onScan}>
          <Text style={styles.iconText}>📷</Text>
        </TouchableOpacity>
      </View>

      {/* 뷰 타입 선택 모달 */}
      <Modal
        visible={showViewPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowViewPicker(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowViewPicker(false)}>
          <View style={styles.pickerContainer}>
            {VIEW_TYPE_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.type}
                style={[
                  styles.pickerOption,
                  viewType === option.type && styles.pickerOptionSelected,
                ]}
                onPress={() => handleViewTypeSelect(option.type)}>
                <Text
                  style={[
                    styles.pickerOptionText,
                    viewType === option.type && styles.pickerOptionTextSelected,
                  ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    paddingTop: 100,
    paddingLeft: 40,
  },
  pickerContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    width: 120,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  pickerOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  pickerOptionSelected: {
    backgroundColor: '#F2F2F7',
  },
  pickerOptionText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  pickerOptionTextSelected: {
    fontWeight: '600',
  },
});
