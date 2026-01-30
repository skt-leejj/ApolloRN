import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ActivityIndicator} from 'react-native';
import {COLORS} from '../../../utils/colors';
import type {CalendarGroup, CalendarItem} from '../../../types/calendar';

interface CalendarListSectionProps {
  groups: CalendarGroup[];
  loading: boolean;
  collapsedGroups: Set<string>;
  onToggleGroup: (groupId: string) => void;
  onToggleCalendar: (calendarId: string, visible: boolean) => void;
  onEditCalendar?: (calendar: CalendarItem) => void;
  onAddCalendar?: () => void;
}

function CalendarCheckbox({color, checked}: {color: string; checked: boolean}) {
  return (
    <View
      style={[
        styles.checkbox,
        {borderColor: color},
        checked && {backgroundColor: color},
      ]}>
      {checked && <Text style={styles.checkmark}>{'✓'}</Text>}
    </View>
  );
}

export function CalendarListSection({
  groups,
  loading,
  collapsedGroups,
  onToggleGroup,
  onToggleCalendar,
  onEditCalendar,
  onAddCalendar,
}: CalendarListSectionProps) {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.textSecondary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {groups.map(group => {
        const isCollapsed = collapsedGroups.has(group.id);
        return (
          <View key={group.id} style={styles.groupContainer}>
            <TouchableOpacity
              style={styles.groupHeader}
              onPress={() => onToggleGroup(group.id)}>
              <Text style={styles.groupName}>{group.name}</Text>
              {group.account && (
                <Text style={styles.groupAccount}>{group.account}</Text>
              )}
              <Text style={styles.collapseIcon}>
                {isCollapsed ? '›' : '⌄'}
              </Text>
            </TouchableOpacity>

            {!isCollapsed &&
              group.calendars.map(calendar => (
                <View key={calendar.id} style={styles.calendarRow}>
                  <TouchableOpacity
                    style={styles.calendarCheckArea}
                    onPress={() =>
                      onToggleCalendar(calendar.id, !calendar.isVisible)
                    }>
                    <CalendarCheckbox
                      color={calendar.color}
                      checked={calendar.isVisible}
                    />
                    <Text style={styles.calendarName} numberOfLines={1}>
                      {calendar.name}
                    </Text>
                  </TouchableOpacity>
                  {!calendar.isReadOnly && onEditCalendar && (
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => onEditCalendar(calendar)}>
                      <Text style={styles.editIcon}>✎</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
          </View>
        );
      })}

      {onAddCalendar && (
        <TouchableOpacity style={styles.addButton} onPress={onAddCalendar}>
          <Text style={styles.addIcon}>+</Text>
          <Text style={styles.addText}>캘린더 추가</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  groupContainer: {
    marginBottom: 4,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  groupName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    flex: 1,
  },
  groupAccount: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginRight: 8,
  },
  collapseIcon: {
    fontSize: 16,
    color: COLORS.textTertiary,
  },
  calendarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 20,
    paddingRight: 16,
  },
  calendarCheckArea: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkmark: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  calendarName: {
    fontSize: 15,
    color: COLORS.textPrimary,
    flex: 1,
  },
  editButton: {
    padding: 8,
  },
  editIcon: {
    fontSize: 16,
    color: COLORS.textTertiary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.separator,
  },
  addIcon: {
    fontSize: 20,
    color: COLORS.textSecondary,
    marginRight: 10,
    fontWeight: '300',
  },
  addText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
});
