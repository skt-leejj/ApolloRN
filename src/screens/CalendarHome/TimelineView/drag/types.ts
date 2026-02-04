import type {SharedValue} from 'react-native-reanimated';
import type {EventBlockLayout} from '../TimelineUtils';

// ── Create Event (empty space long-press) ──

export interface CreateDragState {
  isCreating: boolean;
  /** Anchor Y in content coordinates (center of initial block) */
  anchorY: number;
  /** Top Y in content coordinates (snapped) */
  topY: number;
  /** Bottom Y in content coordinates (snapped) */
  bottomY: number;
  /** Column index where creation started */
  columnIndex: number;
}

export interface CreateDragSharedValues {
  isCreating: SharedValue<boolean>;
  /** Overlay top Y (content coordinates) */
  overlayTopY: SharedValue<number>;
  /** Overlay bottom Y (content coordinates) */
  overlayBottomY: SharedValue<number>;
  /** Overlay X position */
  overlayX: SharedValue<number>;
  /** Overlay width */
  overlayWidth: SharedValue<number>;
  overlayOpacity: SharedValue<number>;
  /** Anchor Y - fixed center point from long press */
  anchorY: SharedValue<number>;
  /** Expected scroll offset (for auto-scroll sync) */
  expectedScroll: SharedValue<number>;
  /** Pan gesture active flag */
  panActive: SharedValue<boolean>;
}

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
