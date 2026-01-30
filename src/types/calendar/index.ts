/**
 * Calendar Types - Barrel Export
 */

// Data Models
export type {
  CalendarDate,
  CalendarPoi,
  CalendarPeriod,
  CalendarAttendee,
  CalendarOrganizer,
  CalendarRecurrence,
  CalendarItem,
  CalendarGroup,
  CalendarEventDetail,
  DailyComponentItem,
  CalendarNotificationInfo,
} from './CalendarModels';

// Enums & Constants
export type {
  CalendarComponentStatus,
  CalendarComponentType,
  AttendeeStatus,
  RecurrenceFrequency,
  CalendarWeek,
  CalendarViewType,
  CalendarSyncState,
  CalendarSyncReason,
  CalendarChangeType,
  CalendarErrorCode,
  CalendarUiError,
  CalendarSettingGroupType,
} from './CalendarEnums';
export { CALENDAR_WEEK_INDEX } from './CalendarEnums';

// External Calendar
export type {
  ExternalCalendarProvider,
  ExternalCalendarStatus,
  ExternalCalendarConnection,
  CalendarOauthError,
} from './ExternalCalendar';

// Settings
export type {
  CalendarSettingInfo,
  BriefingSettings,
  AISettingInfo,
  CalendarCategoryAsset,
} from './CalendarSettings';

// Subscription & Utility
export type {
  SubscriptionCalendarGroup,
  SubscribableCalendar,
  TimeZoneInfo,
  TextAnalyzeResult,
} from './CalendarSubscription';
