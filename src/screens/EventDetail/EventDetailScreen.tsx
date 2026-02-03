import React, {useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {EventDetailScreenProps} from '../../navigation/types';
import {COLORS} from '../../utils/colors';
import {
  parseDateString,
  formatFullDate,
  formatDetailTime,
  calculateDDay,
  formatRecurrenceLabel,
} from '../../utils/dateUtils';
import {DailyCalendarBridge} from '../../bridge/DailyCalendarBridge';
import {useEventDetail} from './useEventDetail';

export function EventDetailScreen({route, navigation}: EventDetailScreenProps) {
  const {eventId} = route.params;
  const insets = useSafeAreaInsets();
  const {event, loading, error} = useEventDetail(eventId);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleEdit = useCallback(() => {
    // TODO: 편집 화면 이동
  }, []);

  const handleDelete = useCallback(async () => {
    if (!event) {
      return;
    }

    const isRecurring = !!event.recurrence;

    if (isRecurring) {
      Alert.alert('반복 일정 삭제', '이 일정을 어떻게 삭제하시겠습니까?', [
        {text: '취소', style: 'cancel'},
        {
          text: '이 일정만 삭제',
          style: 'destructive',
          onPress: async () => {
            await DailyCalendarBridge.deleteEvent(event.id);
            navigation.goBack();
          },
        },
        {
          text: '모든 반복 일정 삭제',
          style: 'destructive',
          onPress: async () => {
            await DailyCalendarBridge.deleteEvent(event.id);
            navigation.goBack();
          },
        },
      ]);
    } else {
      Alert.alert('일정 삭제', '이 일정을 삭제하시겠습니까?', [
        {text: '취소', style: 'cancel'},
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            await DailyCalendarBridge.deleteEvent(event.id);
            navigation.goBack();
          },
        },
      ]);
    }
  }, [event, navigation]);

  if (loading) {
    return (
      <View style={[styles.centered, {paddingTop: insets.top}]}>
        <ActivityIndicator size="large" color={COLORS.textTertiary} />
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={[styles.centered, {paddingTop: insets.top}]}>
        <Text style={styles.errorText}>
          {error || '일정을 찾을 수 없습니다.'}
        </Text>
        <TouchableOpacity onPress={handleBack} style={styles.errorBackButton}>
          <Text style={styles.errorBackText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const startDate = parseDateString(event.startDate.date);
  const endDate = parseDateString(event.endDate.date);
  const dDay = calculateDDay(startDate);

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
          <Text style={styles.backIcon}>{'<'}</Text>
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
        <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
          <Text style={styles.editIcon}>{'✎'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{paddingBottom: insets.bottom + 32}}
        showsVerticalScrollIndicator={false}>
        {/* 타이틀 + D-day */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{event.title}</Text>
          <View style={styles.dDayBadge}>
            <Text style={styles.dDayText}>{dDay}</Text>
          </View>
        </View>

        {/* 일정 시간 */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>일정 시간</Text>
            {/* 날씨 플레이스홀더 */}
            <Text style={styles.weatherPlaceholder}>☀ 맑음 · 23°C</Text>
          </View>

          <View style={styles.card}>
            {/* 시작 */}
            <View style={styles.dateBlock}>
              <View style={styles.dateLabelBadge}>
                <Text style={styles.dateLabelText}>시작</Text>
              </View>
              <Text style={styles.dateText}>{formatFullDate(startDate)}</Text>
              {!event.isAllDay && (
                <Text style={styles.timeText}>{formatDetailTime(startDate)}</Text>
              )}
            </View>

            {/* 종료 */}
            <View style={[styles.dateBlock, styles.dateBlockEnd]}>
              <View style={[styles.dateLabelBadge, styles.dateLabelEnd]}>
                <Text style={[styles.dateLabelText, styles.dateLabelEndText]}>
                  종료
                </Text>
              </View>
              <Text style={styles.dateText}>{formatFullDate(endDate)}</Text>
              {!event.isAllDay && (
                <Text style={styles.timeText}>{formatDetailTime(endDate)}</Text>
              )}
            </View>

            {/* 알림 */}
            {event.alarms.length > 0 && (
              <View style={styles.alarmRow}>
                <Text style={styles.alarmIcon}>🔔</Text>
                <Text style={styles.alarmLabel}>알림</Text>
                <Text style={styles.alarmValue}>
                  {event.alarms.map(a => a.label).join(', ')}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* 반복 / 캘린더 */}
        <View style={styles.badgeRow}>
          <View style={styles.infoBadge}>
            <Text style={styles.infoBadgeLabel}>반복</Text>
            <Text style={styles.infoBadgeValue}>
              {event.recurrence
                ? formatRecurrenceLabel(event.recurrence)
                : '없음'}
            </Text>
          </View>
          <View style={styles.infoBadge}>
            <Text style={styles.infoBadgeLabel}>캘린더</Text>
            <View style={styles.calendarBadgeValue}>
              <View
                style={[
                  styles.calendarDot,
                  {backgroundColor: event.calendar.color},
                ]}
              />
              <Text style={styles.infoBadgeValue}>
                {event.calendar.name}
              </Text>
            </View>
          </View>
        </View>

        {/* 장소 */}
        {event.location && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>장소</Text>
            <View style={styles.card}>
              {/* 지도 플레이스홀더 */}
              <View style={styles.mapPlaceholder} />
              <View style={styles.locationInfo}>
                <View style={styles.locationTextBlock}>
                  <Text style={styles.locationName}>
                    {event.location.name}
                  </Text>
                  {event.location.address && (
                    <Text style={styles.locationAddress}>
                      {event.location.address}
                    </Text>
                  )}
                </View>
                <TouchableOpacity style={styles.mapButton}>
                  <Text style={styles.mapButtonText}>지도 보기</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* 메모 */}
        {event.memo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>메모</Text>
            <View style={styles.card}>
              <Text style={styles.memoText}>{event.memo}</Text>
            </View>
          </View>
        )}

        {/* 노트로 녹음 시작 */}
        <TouchableOpacity style={styles.recordButton} activeOpacity={0.6}>
          <Text style={styles.recordButtonText}>노트로 녹음 시작</Text>
        </TouchableOpacity>

        {/* 일정 삭제 */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.6}>
          <Text style={styles.deleteButtonText}>일정 삭제</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  errorBackButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  errorBackText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },

  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 8,
    backgroundColor: '#F5F5F5',
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSpacer: {
    flex: 1,
  },
  backIcon: {
    fontSize: 22,
    color: COLORS.textPrimary,
    fontWeight: '300',
  },
  editIcon: {
    fontSize: 20,
    color: COLORS.textPrimary,
  },

  scrollView: {
    flex: 1,
  },

  // 타이틀
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  dDayBadge: {
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  dDayText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A73E8',
  },

  // 섹션
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  weatherPlaceholder: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },

  // 카드
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
  },

  // 날짜 블록
  dateBlock: {
    marginBottom: 16,
  },
  dateBlockEnd: {
    marginBottom: 0,
  },
  dateLabelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 8,
  },
  dateLabelEnd: {
    backgroundColor: '#FDE8E8',
  },
  dateLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A73E8',
  },
  dateLabelEndText: {
    color: '#E84A3B',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  timeText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },

  // 알림
  alarmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.separator,
  },
  alarmIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  alarmLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  alarmValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },

  // 반복/캘린더 뱃지
  badgeRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  infoBadge: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  infoBadgeLabel: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginBottom: 6,
  },
  infoBadgeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  calendarBadgeValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },

  // 장소
  mapPlaceholder: {
    height: 100,
    backgroundColor: '#E5E5EA',
    borderRadius: 8,
    marginBottom: 12,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationTextBlock: {
    flex: 1,
  },
  locationName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  mapButton: {
    backgroundColor: '#F0F0F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  mapButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A73E8',
  },

  // 메모
  memoText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },

  // 녹음 버튼
  recordButton: {
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.separator,
    marginTop: 8,
    marginBottom: 24,
  },
  recordButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  // 삭제 버튼
  deleteButton: {
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
});
