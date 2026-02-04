import {LAYOUT} from '../../../../utils/colors';

// Drag activation
export const LONG_PRESS_DURATION = 400;

// Snap grid (15-minute intervals)
export const SNAP_PX = LAYOUT.hourHeight / 4;

// Auto-scroll
export const EDGE_THRESHOLD = 60; // px from top/bottom edge
export const SCROLL_SPEED = 0.1; // px per frame (useFrameCallback @60fps)

