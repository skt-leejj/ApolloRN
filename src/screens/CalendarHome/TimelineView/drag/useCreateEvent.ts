import {useCallback, useMemo, useState, useEffect} from 'react';
import {Gesture} from 'react-native-gesture-handler';
import type {GestureType, ComposedGesture} from 'react-native-gesture-handler';
import {useSharedValue, runOnJS} from 'react-native-reanimated';
import type {SharedValue} from 'react-native-reanimated';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {LAYOUT} from '../../../../utils/colors';
import {snapToTimeGrid, yToMinutes} from './dragUtils';
import type {CreateDragSharedValues} from './types';
import type {EventBlockLayout} from '../TimelineUtils';
import {
  LONG_PRESS_DURATION,
  DEFAULT_CREATE_DURATION_MIN,
  MIN_CREATE_DURATION_MIN,
} from './constants';

interface UseCreateEventParams {
  numberOfDays: 1 | 3 | 7;
  days: Date[];
  eventLayouts: EventBlockLayout[];
  columnWidth: number;
  scrollOffset: SharedValue<number>;
  onCreateEvent?: (startDate: Date, endDate: Date) => void;
}

interface UseCreateEventReturn {
  createSharedValues: CreateDragSharedValues;
  createGesture: GestureType | ComposedGesture | null;
  createScrollEnabled: boolean;
}

export function useCreateEvent({
  numberOfDays,
  days,
  eventLayouts,
  columnWidth,
  scrollOffset,
  onCreateEvent,
}: UseCreateEventParams): UseCreateEventReturn {
  const [createScrollEnabled, setCreateScrollEnabled] = useState(true);

  // Shared values for UI thread
  const isCreatingSV = useSharedValue(false);
  const overlayTopYSV = useSharedValue(0);
  const overlayBottomYSV = useSharedValue(0);
  const overlayXSV = useSharedValue(0);
  const overlayWidthSV = useSharedValue(0);
  const overlayOpacitySV = useSharedValue(0);
  const anchorYSV = useSharedValue(0);
  const expectedScrollSV = useSharedValue(0);
  const panActiveSV = useSharedValue(false);
  const eventRectsSV = useSharedValue<
    {x: number; y: number; width: number; height: number}[]
  >([]);

  // Snap change tracking for haptic
  const prevSnappedTop = useSharedValue(0);
  const prevSnappedBottom = useSharedValue(0);

  // Worklet shared: start gesture Y
  const gestureStartYSV = useSharedValue(0);
  const columnIndexSV = useSharedValue(0);

  const halfDefaultPx = (DEFAULT_CREATE_DURATION_MIN / 2) * (LAYOUT.hourHeight / 60);
  const halfMinPx = (MIN_CREATE_DURATION_MIN / 2) * (LAYOUT.hourHeight / 60);
  const maxContentY = 24 * LAYOUT.hourHeight;

  const createSharedValues: CreateDragSharedValues = useMemo(
    () => ({
      isCreating: isCreatingSV,
      overlayTopY: overlayTopYSV,
      overlayBottomY: overlayBottomYSV,
      overlayX: overlayXSV,
      overlayWidth: overlayWidthSV,
      overlayOpacity: overlayOpacitySV,
      anchorY: anchorYSV,
      expectedScroll: expectedScrollSV,
      panActive: panActiveSV,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- SharedValue refs are stable
    [],
  );

  const eventRects = useMemo(() => {
    if (columnWidth <= 0) {return [];}
    return eventLayouts.map(layout => {
      const colOffset = layout.columnIndex * columnWidth;
      return {
        x: colOffset + layout.left * columnWidth,
        y: layout.top,
        width: layout.width * columnWidth - 1,
        height: layout.height,
      };
    });
  }, [eventLayouts, columnWidth]);

  useEffect(() => {
    eventRectsSV.value = eventRects;
  }, [eventRects, eventRectsSV]);

  // --- JS thread callbacks ---

  const handleCreateStart = useCallback(() => {
    setCreateScrollEnabled(false);
    ReactNativeHapticFeedback.trigger('impactMedium');
  }, []);

  const handleSnapChange = useCallback(() => {
    ReactNativeHapticFeedback.trigger('impactLight');
  }, []);

  const handleCreateEnd = useCallback(
    (colIndex: number, finalTopY: number, finalBottomY: number) => {
      const startMinutes = yToMinutes(finalTopY);
      const endMinutes = yToMinutes(finalBottomY);

      const targetDay = days[colIndex];
      if (targetDay) {
        const startDate = new Date(targetDay);
        startDate.setHours(0, 0, 0, 0);
        startDate.setMinutes(startMinutes);

        const endDate = new Date(targetDay);
        endDate.setHours(0, 0, 0, 0);
        endDate.setMinutes(endMinutes);

        console.log(
          `[CreateEvent] start=${startDate.toISOString()}, end=${endDate.toISOString()}`,
        );

        onCreateEvent?.(startDate, endDate);
      }

      setCreateScrollEnabled(true);
    },
    [days, onCreateEvent],
  );

  // --- Gesture ---
  // Pan.activateAfterLongPress를 사용하여 ScrollView와 충돌 방지
  // 롱프레스 대기 중에는 일반 스크롤이 정상 동작하고, 활성화 후에만 제스처가 작동

  const createGesture = useMemo(() => {
    if (columnWidth <= 0) {return null;}

    const pan = Gesture.Pan()
      .activateAfterLongPress(LONG_PRESS_DURATION)
      .onTouchesDown((e, stateManager) => {
        'worklet';
        const touch = e.allTouches[0] ?? e.changedTouches[0];
        if (!touch) {return;}

        const x = touch.x;
        const y = touch.y;
        const rects = eventRectsSV.value;

        for (let i = 0; i < rects.length; i++) {
          const r = rects[i];
          if (
            x >= r.x &&
            x <= r.x + r.width &&
            y >= r.y &&
            y <= r.y + r.height
          ) {
            stateManager.fail();
            return;
          }
        }
      })
      .onStart(e => {
        'worklet';
        // e.y는 eventArea 기준 content 좌표 (ScrollView 내부이므로 scrollOffset 불필요)
        const touchContentY = e.y;

        // 앵커(중심)를 15분 단위로 snap
        const anchor = snapToTimeGrid(touchContentY);

        // ±30분 (1시간 블록)
        let topY = snapToTimeGrid(anchor - halfDefaultPx);
        let bottomY = snapToTimeGrid(anchor + halfDefaultPx);

        // 경계 클램핑
        if (topY < 0) {
          topY = 0;
          bottomY = snapToTimeGrid(topY + halfDefaultPx * 2);
        }
        if (bottomY > maxContentY) {
          bottomY = maxContentY;
          topY = snapToTimeGrid(bottomY - halfDefaultPx * 2);
        }

        // 컬럼 결정
        const colIndex = numberOfDays > 1
          ? Math.max(0, Math.min(Math.floor(e.x / columnWidth), numberOfDays - 1))
          : 0;

        const colX = colIndex * columnWidth;

        // Shared values 설정
        anchorYSV.value = anchor;
        overlayTopYSV.value = topY;
        overlayBottomYSV.value = bottomY;
        overlayXSV.value = colX;
        overlayWidthSV.value = columnWidth;
        overlayOpacitySV.value = 1;
        isCreatingSV.value = true;
        expectedScrollSV.value = scrollOffset.value;
        columnIndexSV.value = colIndex;
        gestureStartYSV.value = touchContentY;

        prevSnappedTop.value = topY;
        prevSnappedBottom.value = bottomY;

        runOnJS(handleCreateStart)();
      })
      .onUpdate(e => {
        'worklet';
        panActiveSV.value = true;

        const anchor = anchorYSV.value;
        // 현재 터치의 content Y
        const currentContentY = gestureStartYSV.value + e.translationY;

        // 터치가 앵커 위인지 아래인지로 확장 방향 결정
        let newTop: number;
        let newBottom: number;

        if (currentContentY < anchor - halfDefaultPx) {
          // 초기 블록 상단 밖으로 드래그 → top 확장
          newTop = snapToTimeGrid(currentContentY);
          newBottom = snapToTimeGrid(anchor + halfDefaultPx);
          // minimum duration 보장 (30분)
          if (newBottom - newTop < halfMinPx * 2) {
            newTop = snapToTimeGrid(newBottom - halfMinPx * 2);
          }
        } else if (currentContentY > anchor + halfDefaultPx) {
          // 초기 블록 하단 밖으로 드래그 → bottom 확장
          newTop = snapToTimeGrid(anchor - halfDefaultPx);
          newBottom = snapToTimeGrid(currentContentY);
          // minimum duration 보장 (30분)
          if (newBottom - newTop < halfMinPx * 2) {
            newBottom = snapToTimeGrid(newTop + halfMinPx * 2);
          }
        } else {
          // anchor 근처 → 초기 1시간 블록 유지
          newTop = snapToTimeGrid(anchor - halfDefaultPx);
          newBottom = snapToTimeGrid(anchor + halfDefaultPx);
        }

        // 경계 클램핑
        newTop = Math.max(0, newTop);
        newBottom = Math.min(maxContentY, newBottom);

        overlayTopYSV.value = newTop;
        overlayBottomYSV.value = newBottom;

        // snap 변경 시 햅틱
        if (newTop !== prevSnappedTop.value || newBottom !== prevSnappedBottom.value) {
          prevSnappedTop.value = newTop;
          prevSnappedBottom.value = newBottom;
          runOnJS(handleSnapChange)();
        }

      })
      .onEnd(() => {
        'worklet';
        panActiveSV.value = false;
        overlayOpacitySV.value = 0;
        isCreatingSV.value = false;

        const finalTop = overlayTopYSV.value;
        const finalBottom = overlayBottomYSV.value;
        const colIndex = columnIndexSV.value;

        runOnJS(handleCreateEnd)(colIndex, finalTop, finalBottom);
      })
      .onFinalize(() => {
        'worklet';
        // 제스처가 비정상 종료된 경우에도 상태 정리
        if (isCreatingSV.value) {
          panActiveSV.value = false;
          overlayOpacitySV.value = 0;
          isCreatingSV.value = false;

          const finalTop = overlayTopYSV.value;
          const finalBottom = overlayBottomYSV.value;
          const colIndex = columnIndexSV.value;

          runOnJS(handleCreateEnd)(colIndex, finalTop, finalBottom);
        }
      });

    return pan;
  }, [
    columnWidth,
    numberOfDays,
    scrollOffset,
    halfDefaultPx,
    halfMinPx,
    maxContentY,
    handleCreateStart,
    handleCreateEnd,
    handleSnapChange,
  ]);

  return {
    createSharedValues,
    createGesture,
    createScrollEnabled,
  };
}
