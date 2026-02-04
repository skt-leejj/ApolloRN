import type {SharedValue} from 'react-native-reanimated';
import type {EventBlockLayout} from '../TimelineUtils';

export interface DragState {
  isDragging: boolean;
  draggedEventId: string | null;
  originalLayout: EventBlockLayout | null;
  /** Content coordinate Y (includes scroll offset) */
  contentY: number;
  /** Column index being dragged to */
  targetColumnIndex: number;
  /** Snapped Y in content coordinates */
  snappedY: number;
}

export interface DragSharedValues {
  isDragging: SharedValue<boolean>;
  overlayX: SharedValue<number>;
  overlayY: SharedValue<number>;
  overlayWidth: SharedValue<number>;
  overlayHeight: SharedValue<number>;
  overlayOpacity: SharedValue<number>;
  // 드래그 시작 기준 Y (auto scroll 시 같이 이동)
  startContentY: SharedValue<number>;
  // 드래그 중 예상 스크롤 위치 (onScroll 비동기 지연 보정용)
  expectedScroll: SharedValue<number>;
  // Pan 제스처가 실제로 활성화되었는지 (long press만으로는 false)
  panActive: SharedValue<boolean>;
}
