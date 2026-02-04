import React from 'react';
import {StyleSheet} from 'react-native';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import type {SharedValue} from 'react-native-reanimated';
import {LAYOUT} from '../../../../utils/colors';
import type {CreateDragSharedValues} from './types';

interface CreateOverlayProps {
  sharedValues: CreateDragSharedValues;
  scrollViewY: SharedValue<number>;
}

export function CreateOverlay({
  sharedValues,
  scrollViewY,
}: CreateOverlayProps) {
  const animatedStyle = useAnimatedStyle(() => {
    if (!sharedValues.overlayOpacity.value) {
      return {opacity: 0};
    }

    // content 좌표 → viewport 좌표 변환
    const viewportTop =
      sharedValues.overlayTopY.value -
      sharedValues.expectedScroll.value +
      scrollViewY.value;

    const height =
      sharedValues.overlayBottomY.value - sharedValues.overlayTopY.value;

    return {
      opacity: sharedValues.overlayOpacity.value,
      top: viewportTop,
      left: LAYOUT.timeLabelWidth + sharedValues.overlayX.value,
      width: sharedValues.overlayWidth.value,
      height,
    };
  });

  return (
    <Animated.View
      style={[styles.overlay, animatedStyle]}
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    zIndex: 999,
  },
});
