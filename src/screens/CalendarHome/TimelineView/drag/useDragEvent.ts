import {useCallback, useMemo, useState, useRef} from 'react';
import {Gesture} from 'react-native-gesture-handler';
import type {GestureType, ComposedGesture} from 'react-native-gesture-handler';
import {useSharedValue, runOnJS} from 'react-native-reanimated';
import type {SharedValue} from 'react-native-reanimated';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {LAYOUT} from '../../../../utils/colors';
import type {DailyComponentItem} from '../../../../types/calendar';
import type {EventBlockLayout} from '../TimelineUtils';
import {
  snapToTimeGrid,
  snapToColumn,
  yToMinutes,
  isDraggable,
  clampStartMinutes,
  computeNewDates,
} from './dragUtils';
import type {DragState, DragSharedValues} from './types';
import {DailyCalendarBridge} from '../../../../bridge/DailyCalendarBridge';
import {useCalendarStore} from '../../hooks/useCalendarStore';
import {LONG_PRESS_DURATION} from './constants';

interface UseDragEventParams {
  numberOfDays: 1 | 3 | 7;
  days: Date[];
  events: DailyComponentItem[];
  eventLayouts: EventBlockLayout[];
  columnWidth: number;
  scrollOffset: SharedValue<number>;
  onEventPress?: (eventId: string) => void;
}

interface UseDragEventReturn {
  dragState: DragState;
  dragSharedValues: DragSharedValues;
  gestureMap: Map<string, GestureType | ComposedGesture>;
  scrollEnabled: boolean;
}

export function useDragEvent({
  numberOfDays,
  days,
  events,
  eventLayouts,
  columnWidth,
  scrollOffset,
  onEventPress,
}: UseDragEventParams): UseDragEventReturn {
  const setEvents = useCalendarStore(s => s.setEvents);

  // JS-side drag state
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedEventId: null,
    originalLayout: null,
    contentY: 0,
    targetColumnIndex: 0,
    snappedY: 0,
  });

  const [scrollEnabled, setScrollEnabled] = useState(true);

  // 최신 events를 항상 추적하는 ref (stale closure 방지)
  const eventsRef = useRef<DailyComponentItem[]>(events);
  eventsRef.current = events;

  // 최신 days를 항상 추적하는 ref
  const daysRef = useRef<Date[]>(days);
  daysRef.current = days;

  // 원본 이벤트 배열 저장 (롤백용)
  const originalEventsRef = useRef<DailyComponentItem[]>([]);
  // 이전 snap 값 저장 (햅틱 트리거용) - worklet에서 접근하므로 shared value 사용
  const prevSnappedY = useSharedValue(0);
  const prevSnappedCol = useSharedValue(0);

  // worklet 간 공유 상태 (drag 활성화/시작 좌표)
  const dragActivatedSV = useSharedValue(false);
  const startContentYSV = useSharedValue(0);
  const startColumnXSV = useSharedValue(0);

  // Shared values (UI thread 애니메이션용)
  const isDraggingSV = useSharedValue(false);
  const overlayX = useSharedValue(0);
  const overlayY = useSharedValue(0);
  const overlayWidth = useSharedValue(0);
  const overlayHeight = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);
  const expectedScrollSV = useSharedValue(0);
  const panActiveSV = useSharedValue(false);

  const dragSharedValues: DragSharedValues = useMemo(
    () => ({
      isDragging: isDraggingSV,
      overlayX,
      overlayY,
      overlayWidth,
      overlayHeight,
      overlayOpacity,
      startContentY: startContentYSV,
      expectedScroll: expectedScrollSV,
      panActive: panActiveSV,
    }),
    [isDraggingSV, overlayX, overlayY, overlayWidth, overlayHeight, overlayOpacity, startContentYSV, expectedScrollSV, panActiveSV],
  );

  // --- JS thread callbacks ---

  const handleDragStart = useCallback(
    (eventId: string, layout: EventBlockLayout) => {
      originalEventsRef.current = [...eventsRef.current];

      setDragState({
        isDragging: true,
        draggedEventId: eventId,
        originalLayout: layout,
        contentY: layout.top,
        targetColumnIndex: layout.columnIndex,
        snappedY: layout.top,
      });
      setScrollEnabled(false);
      ReactNativeHapticFeedback.trigger('impactMedium');
    },
    [],
  );

  const handleSnapChange = useCallback(() => {
    ReactNativeHapticFeedback.trigger('impactLight');
  }, []);

  const handleDragUpdate = useCallback(
    (snappedY: number, colIndex: number) => {
      setDragState(prev => ({
        ...prev,
        snappedY,
        targetColumnIndex: colIndex,
        contentY: snappedY,
      }));
    },
    [],
  );

  const handleDragEnd = useCallback(
    async (
      eventId: string,
      _layout: EventBlockLayout,
      finalSnappedY: number,
      finalColIndex: number,
    ) => {
      const currentEvents = eventsRef.current;
      const currentDays = daysRef.current;

      const event = currentEvents.find(e => e.id === eventId);
      if (!event) {
        setDragState(prev => ({
          ...prev,
          isDragging: false,
          draggedEventId: null,
        }));
        setScrollEnabled(true);
        return;
      }

      const newStartMinutes = clampStartMinutes(
        yToMinutes(finalSnappedY),
        event.durationMinutes,
      );

      const {newStartDate, newEndDate} = computeNewDates(
        event,
        currentDays,
        finalColIndex,
        newStartMinutes,
      );

      // Optimistic update
      const updatedEvents = currentEvents.map(e => {
        if (e.id !== eventId) {return e;}
        return {
          ...e,
          eventDetail: {
            ...e.eventDetail,
            startDate: {
              ...e.eventDetail.startDate,
              date: newStartDate.toISOString(),
            },
            endDate: {
              ...e.eventDetail.endDate,
              date: newEndDate.toISOString(),
            },
          },
          displayStartDate: newStartDate.toISOString(),
          displayEndDate: newEndDate.toISOString(),
        };
      });
      setEvents(updatedEvents);

      // 드래그 상태 해제
      setDragState({
        isDragging: false,
        draggedEventId: null,
        originalLayout: null,
        contentY: 0,
        targetColumnIndex: 0,
        snappedY: 0,
      });
      setScrollEnabled(true);

      // Bridge API 호출
      try {
        await DailyCalendarBridge.updateEvent(eventId, {
          startDate: {
            date: newStartDate.toISOString(),
            timeZone: event.eventDetail.startDate.timeZone,
            isAllDay: false,
          },
          endDate: {
            date: newEndDate.toISOString(),
            timeZone: event.eventDetail.endDate.timeZone,
            isAllDay: false,
          },
        });
      } catch {
        // 실패 시 롤백
        setEvents(originalEventsRef.current);
      }
    },
    [setEvents],
  );

  const handleDragCancel = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedEventId: null,
      originalLayout: null,
      contentY: 0,
      targetColumnIndex: 0,
      snappedY: 0,
    });
    setScrollEnabled(true);
  }, []);

  // --- Gesture Map (layout별 gesture를 캐싱) ---

  const gestureMap = useMemo(() => {
    const map = new Map<string, GestureType | ComposedGesture>();
    if (columnWidth <= 0) {return map;}

    for (const layout of eventLayouts) {
      const event = layout.event;

      if (!isDraggable(event)) {
        continue;
      }

      const longPress = Gesture.LongPress()
        .minDuration(LONG_PRESS_DURATION)
        .onStart(() => {
          'worklet';
          dragActivatedSV.value = true;

          // overlay 초기 위치 설정 (즉시 스냅 적용)
          const colX = layout.columnIndex * columnWidth;
          const snappedStartY = snapToTimeGrid(layout.top);
          overlayX.value = colX;
          overlayY.value = snappedStartY;
          overlayWidth.value = columnWidth;
          overlayHeight.value = layout.height;
          overlayOpacity.value = 1;
          isDraggingSV.value = true;

          startContentYSV.value = snappedStartY;
          startColumnXSV.value = colX;
          expectedScrollSV.value = scrollOffset.value;

          prevSnappedY.value = snappedStartY;
          prevSnappedCol.value = layout.columnIndex;

          runOnJS(handleDragStart)(event.id, layout);
        });

      const pan = Gesture.Pan()
        .manualActivation(true)
        .onTouchesMove((_e, stateManager) => {
          'worklet';
          if (dragActivatedSV.value) {
            stateManager.activate();
          }
        })
        .onUpdate(e => {
          'worklet';
          panActiveSV.value = true;
          // 새 Y 좌표 (content 기준)
          let newY = startContentYSV.value + e.translationY;
          newY = snapToTimeGrid(newY);
          newY = Math.max(0, Math.min(newY, 24 * LAYOUT.hourHeight - layout.height));

          // 새 X / 컬럼 계산
          let newColIndex = layout.columnIndex;
          if (numberOfDays > 1) {
            const newX = startColumnXSV.value + e.translationX;
            newColIndex = snapToColumn(newX + columnWidth / 2, columnWidth, numberOfDays);
          }

          const newColX = newColIndex * columnWidth;
          overlayX.value = newColX;
          overlayY.value = newY;

          // snap 변경 시 햅틱
          const prevY = prevSnappedY.value;
          const prevCol = prevSnappedCol.value;
          if (newY !== prevY || newColIndex !== prevCol) {
            prevSnappedY.value = newY;
            prevSnappedCol.value = newColIndex;
            runOnJS(handleSnapChange)();
          }

          runOnJS(handleDragUpdate)(newY, newColIndex);
        })
        .onEnd(() => {
          'worklet';
          if (!dragActivatedSV.value) {return;}
          dragActivatedSV.value = false;
          panActiveSV.value = false;
          overlayOpacity.value = 0;
          isDraggingSV.value = false;

          const finalY = overlayY.value;
          const finalCol = numberOfDays > 1
            ? snapToColumn(overlayX.value + columnWidth / 2, columnWidth, numberOfDays)
            : layout.columnIndex;

          runOnJS(handleDragEnd)(event.id, layout, finalY, finalCol);
        })
        .onFinalize(() => {
          'worklet';
          if (dragActivatedSV.value) {
            dragActivatedSV.value = false;
            panActiveSV.value = false;
            overlayOpacity.value = 0;
            isDraggingSV.value = false;
            runOnJS(handleDragCancel)();
          }
        });

      // tap gesture (기존 onPress 유지)
      const tap = Gesture.Tap().onEnd(() => {
        'worklet';
        if (onEventPress) {
          runOnJS(onEventPress)(event.id);
        }
      });

      // LongPress가 활성화된 후에만 Pan이 동작
      const dragGesture = Gesture.Simultaneous(longPress, pan);
      map.set(event.id, Gesture.Exclusive(dragGesture, tap));
    }

    return map;
  }, [
    eventLayouts,
    columnWidth,
    numberOfDays,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    handleDragUpdate,
    handleSnapChange,
    onEventPress,
    overlayX,
    overlayY,
    overlayWidth,
    overlayHeight,
    overlayOpacity,
    isDraggingSV,
    dragActivatedSV,
    startContentYSV,
    startColumnXSV,
    prevSnappedY,
    prevSnappedCol,
    panActiveSV,
  ]);

  return {
    dragState,
    dragSharedValues,
    gestureMap,
    scrollEnabled,
  };
}
