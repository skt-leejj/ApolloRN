import type {SharedValue} from 'react-native-reanimated';
import {
  useSharedValue,
  useAnimatedReaction,
  useFrameCallback,
  scrollTo,
} from 'react-native-reanimated';
import type Animated from 'react-native-reanimated';
import {LAYOUT} from '../../../../utils/colors';
import {EDGE_THRESHOLD, SCROLL_SPEED_PX_PER_SEC} from './constants';
import {snapToTimeGrid} from './dragUtils';

interface UseCreateAutoScrollParams {
  scrollRef: React.RefObject<Animated.ScrollView>;
  isCreating: SharedValue<boolean>;
  panActive: SharedValue<boolean>;
  overlayTopY: SharedValue<number>;
  overlayBottomY: SharedValue<number>;
  expectedScroll: SharedValue<number>;
  scrollViewY: SharedValue<number>;
  scrollViewHeight: SharedValue<number>;
}

export function useCreateAutoScroll({
  scrollRef,
  isCreating,
  panActive,
  overlayTopY,
  overlayBottomY,
  expectedScroll,
  scrollViewY,
  scrollViewHeight,
}: UseCreateAutoScrollParams) {
  const scrollDirection = useSharedValue(0);

  // Edge 감지: top이 상단 edge 근처면 위로, bottom이 하단 edge 근처면 아래로
  useAnimatedReaction(
    () => ({
      creating: isCreating.value,
      panning: panActive.value,
      topY: overlayTopY.value,
      bottomY: overlayBottomY.value,
      offset: expectedScroll.value,
      viewHeight: scrollViewHeight.value,
    }),
    (current) => {
      if (!current.creating || !current.panning) {
        scrollDirection.value = 0;
        return;
      }

      const relativeTop = current.topY - current.offset;
      const relativeBottom = current.bottomY - current.offset;

      if (relativeTop < EDGE_THRESHOLD) {
        scrollDirection.value = -1;
      } else if (relativeBottom > current.viewHeight - EDGE_THRESHOLD) {
        scrollDirection.value = 1;
      } else {
        scrollDirection.value = 0;
      }
    },
  );

  // Frame callback으로 실제 스크롤 수행
  useFrameCallback((frame) => {
    'worklet';
    if (scrollDirection.value === 0) {return;}

    const currentOffset = expectedScroll.value;
    const maxScroll = 24 * LAYOUT.hourHeight - scrollViewHeight.value;
    const dtMs = frame.timeSincePreviousFrame ?? 16.67;
    const deltaStep = (SCROLL_SPEED_PX_PER_SEC * dtMs) / 1000;
    let newOffset: number;

    if (scrollDirection.value < 0) {
      newOffset = Math.max(0, currentOffset - deltaStep);
    } else {
      newOffset = Math.min(maxScroll, currentOffset + deltaStep);
    }

    if (newOffset === currentOffset) {return;}

    const delta = newOffset - currentOffset;
    const maxContentY = 24 * LAYOUT.hourHeight;

    expectedScroll.value = newOffset;

    // Auto-scroll 시 확장 중인 edge를 함께 이동 (15분 그리드 snap 유지)
    if (scrollDirection.value < 0) {
      // 위로 스크롤 → top edge 확장
      overlayTopY.value = Math.max(0, snapToTimeGrid(overlayTopY.value + delta));
    } else {
      // 아래로 스크롤 → bottom edge 확장
      overlayBottomY.value = Math.min(maxContentY, snapToTimeGrid(overlayBottomY.value + delta));
    }

    scrollTo(scrollRef, 0, newOffset, false);
  });
}
