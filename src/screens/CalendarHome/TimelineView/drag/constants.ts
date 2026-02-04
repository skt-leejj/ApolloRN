import {LAYOUT} from '../../../../utils/colors';

// Drag activation
export const LONG_PRESS_DURATION = 400;

// Snap grid (15-minute intervals)
export const SNAP_PX = LAYOUT.hourHeight / 4;

// Create event defaults
export const DEFAULT_CREATE_DURATION_MIN = 60; // initial block = 1 hour
export const MIN_CREATE_DURATION_MIN = 30; // minimum = 30 minutes

// Auto-scroll
export const EDGE_THRESHOLD = 60; // px from top/bottom edge
export const SCROLL_SPEED_PX_PER_SEC = 240; // px per second (time-based)
