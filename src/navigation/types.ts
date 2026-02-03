import type {NativeStackScreenProps} from '@react-navigation/native-stack';

export type RootStackParamList = {
  CalendarHome: undefined;
  EventDetail: {eventId: string};
};

export type CalendarHomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'CalendarHome'
>;

export type EventDetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'EventDetail'
>;
