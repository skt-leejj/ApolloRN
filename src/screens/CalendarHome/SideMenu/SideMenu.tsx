import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {COLORS} from '../../../utils/colors';
import {useCalendarStore} from '../hooks/useCalendarStore';
import {useCalendarList} from '../hooks/useCalendarList';
import {CalendarListSection} from './CalendarListSection';
import type {CalendarViewType} from '../../../types/calendar';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MENU_WIDTH = SCREEN_WIDTH * 0.82;

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
  onSettings?: () => void;
}

const VIEW_TYPE_OPTIONS: {type: CalendarViewType | 'list'; label: string}[] = [
  {type: 'month', label: '한달'},
  {type: 'week', label: '일주일'},
  {type: 'threeDays', label: '3일'},
  {type: 'day', label: '하루'},
  {type: 'list', label: '목록'},
];

export function SideMenu({visible, onClose, onSettings}: SideMenuProps) {
  const insets = useSafeAreaInsets();
  const translateX = useRef(new Animated.Value(MENU_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const {viewType, setViewType} = useCalendarStore();
  const {
    groups,
    loading,
    collapsedGroups,
    toggleGroupCollapsed,
    toggleCalendarVisibility,
  } = useCalendarList();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: MENU_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateX, backdropOpacity]);

  const handleViewTypeSelect = (type: CalendarViewType | 'list') => {
    if (type === 'list') {
      // 목록 뷰는 미구현
      return;
    }
    setViewType(type);
    onClose();
  };

  if (!visible) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[styles.backdrop, {opacity: backdropOpacity}]}
        />
      </TouchableWithoutFeedback>

      {/* Menu Panel */}
      <Animated.View
        style={[
          styles.menuContainer,
          {
            width: MENU_WIDTH,
            transform: [{translateX}],
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          <View style={{flex: 1}} />
          {onSettings && (
            <TouchableOpacity onPress={onSettings} style={styles.settingsButton}>
              <Text style={styles.settingsIcon}>⚙</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* View Type Selector */}
        <View style={styles.viewTypeSection}>
          {VIEW_TYPE_OPTIONS.map(option => {
            const isSelected =
              option.type !== 'list' && viewType === option.type;
            const isDisabled = option.type === 'list';
            return (
              <TouchableOpacity
                key={option.type}
                style={[
                  styles.viewTypeButton,
                  isSelected && styles.viewTypeButtonSelected,
                  isDisabled && styles.viewTypeButtonDisabled,
                ]}
                onPress={() => handleViewTypeSelect(option.type)}
                disabled={isDisabled}>
                <Text
                  style={[
                    styles.viewTypeText,
                    isSelected && styles.viewTypeTextSelected,
                    isDisabled && styles.viewTypeTextDisabled,
                  ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Calendar List */}
        <ScrollView style={styles.calendarListContainer} bounces={false}>
          <CalendarListSection
            groups={groups}
            loading={loading}
            collapsedGroups={collapsedGroups}
            onToggleGroup={toggleGroupCollapsed}
            onToggleCalendar={toggleCalendarVisibility}
            onAddCalendar={() => {
              // TODO: 캘린더 추가 화면
            }}
          />
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.background,
    shadowColor: '#000',
    shadowOffset: {width: -2, height: 0},
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
  },
  closeButton: {
    padding: 8,
  },
  closeIcon: {
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 20,
    color: COLORS.textPrimary,
  },
  viewTypeSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  viewTypeButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
  },
  viewTypeButtonSelected: {
    backgroundColor: COLORS.todayBg,
  },
  viewTypeButtonDisabled: {
    opacity: 0.4,
  },
  viewTypeText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  viewTypeTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  viewTypeTextDisabled: {
    color: COLORS.textTertiary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.separator,
    marginHorizontal: 16,
  },
  calendarListContainer: {
    flex: 1,
  },
});
