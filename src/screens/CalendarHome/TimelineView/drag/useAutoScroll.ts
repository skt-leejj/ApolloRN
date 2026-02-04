import {useCallback} from 'react';
import type {SharedValue} from 'react-native-reanimated';
import {
  useSharedValue,
  useAnimatedReaction,
  useFrameCallback,
  runOnJS,
} from 'react-native-reanimated';
import type Animated from 'react-native-reanimated';
import {LAYOUT} from '../../../../utils/colors';
import {EDGE_THRESHOLD, SCROLL_SPEED} from './constants';

interface UseAutoScrollParams {
  scrollRef: React.RefObject<Animated.ScrollView>;
  isDragging: SharedValue<boolean>;
  panActive: SharedValue<boolean>;
  overlayY: SharedValue<number>;
  overlayHeight: SharedValue<number>;
  startContentY: SharedValue<number>;
  expectedScroll: SharedValue<number>;
  scrollViewY: SharedValue<number>;
  scrollViewHeight: SharedValue<number>;
}

export function useAutoScroll({
  scrollRef,
  isDragging,
  panActive,
  overlayY,
  overlayHeight,
  startContentY,
  expectedScroll,
  scrollViewY,
  scrollViewHeight,
}: UseAutoScrollParams) {
  // 스크롤 방향: -1 = up, 0 = none, 1 = down
  const scrollDirection = useSharedValue(0);

  const performScroll = useCallback((newOffset: number) => {
    scrollRef.current?.scrollTo({y: newOffset, animated: false});
  }, [scrollRef]);

  // UI thread에서 edge 감지 → scrollDirection 업데이트
  useAnimatedReaction(
    () => ({
      dragging: isDragging.value,
      panning: panActive.value,
      y: overlayY.value,
      offset: expectedScroll.value,
      viewY: scrollViewY.value,
      viewHeight: scrollViewHeight.value,
    }),
    (current) => {
      if (!current.dragging || !current.panning) {
        scrollDirection.value = 0;
        return;
      }

      // content Y → viewport 상대 Y 변환
      const relativeY = current.y - current.offset;

      if (relativeY < EDGE_THRESHOLD) {
        scrollDirection.value = -1;
      } else if (relativeY > current.viewHeight - EDGE_THRESHOLD) {
        scrollDirection.value = 1;
      } else {
        scrollDirection.value = 0;
      }
    },
  );

  // UI thread frame callback으로 실제 스크롤 수행 (race condition 없음)
  useFrameCallback(() => {
    'worklet';
    if (scrollDirection.value === 0) {return;}

    const currentOffset = expectedScroll.value;
    const maxScroll = 24 * LAYOUT.hourHeight - scrollViewHeight.value;
    let newOffset: number;

    if (scrollDirection.value < 0) {
      newOffset = Math.max(0, currentOffset - SCROLL_SPEED);
    } else {
      newOffset = Math.min(maxScroll, currentOffset + SCROLL_SPEED);
    }

    if (newOffset === currentOffset) {return;}

    const delta = newOffset - currentOffset;
    const maxContentY = 24 * LAYOUT.hourHeight - overlayHeight.value;

    // expectedScroll을 UI thread에서 즉시 동기 업데이트 (scrollOffset은 onScroll에 위임)
    expectedScroll.value = newOffset;

    // auto scroll 시 overlay와 drag 기준 Y를 함께 이동시켜 sticky 유지
    overlayY.value = Math.max(
      0,
      Math.min(overlayY.value + delta, maxContentY),
    );
    startContentY.value = Math.max(
      0,
      Math.min(startContentY.value + delta, maxContentY),
    );

    runOnJS(performScroll)(newOffset);
  });
}
