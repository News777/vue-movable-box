/**
 * Fixed-anchor resize for rotated rectangles (resizeMode="fixed-anchor").
 *
 * The handle's opposite corner (corner handles) or opposite edge midpoint (edge handles)
 * stays pinned at its rotated world position while the dragged handle follows the
 * pointer. Size and position are solved in pixel space, then mapped back onto the model
 * plane by the caller, so percent-unit boxes resolve with true geometry.
 */

import type { HandlePosition } from '../../../types/MovableBox';
import {
  angleToRadians,
  normalizeAngle,
  resolveTransformOrigin,
  type TransformOrigin
} from './rotation';

export interface PlaneRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface Vec2 {
  x: number;
  y: number;
}

export interface FixedAnchorResizeInput {
  /** Pixel-space rectangle at drag start. */
  start: PlaneRect;
  /** Clockwise rotation in degrees. */
  angle: number;
  /** CSS transform-origin spec resolved against the current size. */
  originSpec: string;
  handle: HandlePosition;
  /** Pointer displacement in pixel space since the drag started. */
  pointerDelta: Vec2;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  /** Start width/height ratio when ratioLock is on. */
  ratio?: number | null;
}

const EDGE_SIGNS: Record<HandlePosition, { x: -1 | 0 | 1; y: -1 | 0 | 1 }> = {
  tl: { x: -1, y: -1 },
  tm: { x: 0, y: -1 },
  tr: { x: 1, y: -1 },
  ml: { x: -1, y: 0 },
  mr: { x: 1, y: 0 },
  bl: { x: -1, y: 1 },
  bm: { x: 0, y: 1 },
  br: { x: 1, y: 1 }
};

/** Local-coordinate accessor for the dragged point of a handle. */
const dragLocal = (handle: HandlePosition, width: number, height: number): Vec2 => {
  switch (handle) {
    case 'tl':
      return { x: 0, y: 0 };
    case 'tm':
      return { x: width / 2, y: 0 };
    case 'tr':
      return { x: width, y: 0 };
    case 'ml':
      return { x: 0, y: height / 2 };
    case 'mr':
      return { x: width, y: height / 2 };
    case 'bl':
      return { x: 0, y: height };
    case 'bm':
      return { x: width / 2, y: height };
    case 'br':
      return { x: width, y: height };
    default:
      return { x: width, y: height };
  }
};

/** Local-coordinate accessor for the anchor opposite the dragged handle. */
export const anchorLocal = (handle: HandlePosition, width: number, height: number): Vec2 => {
  switch (handle) {
    case 'tl':
      return { x: width, y: height };
    case 'tm':
      return { x: width / 2, y: height };
    case 'tr':
      return { x: 0, y: height };
    case 'ml':
      return { x: width, y: height / 2 };
    case 'mr':
      return { x: 0, y: height / 2 };
    case 'bl':
      return { x: width, y: 0 };
    case 'bm':
      return { x: width / 2, y: 0 };
    case 'br':
      return { x: 0, y: 0 };
    default:
      return { x: 0, y: 0 };
  }
};

/** Maps a local point of the rectangle into pixel-space world coordinates. */
export const localToWorld = (
  rect: PlaneRect,
  angle: number,
  originSpec: string,
  point: Vec2
): Vec2 => {
  const origin = resolveTransformOrigin(originSpec, rect.width, rect.height);
  const rad = angleToRadians(normalizeAngle(angle));
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = point.x - origin.x;
  const dy = point.y - origin.y;
  return {
    x: rect.left + origin.x + dx * cos - dy * sin,
    y: rect.top + origin.y + dx * sin + dy * cos
  };
};

const clean = (value: number) => (Math.abs(value) < 1e-9 ? 0 : value);

const clampRange = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), Math.max(min, max));

/**
 * Solves the resized rectangle. The anchor world position computed from the start
 * rectangle stays fixed; the dragged handle lands at start drag point + pointerDelta.
 */
export const resizeWithFixedAnchor = (input: FixedAnchorResizeInput): PlaneRect => {
  const { start, angle, originSpec, handle, pointerDelta } = input;
  const normalized = normalizeAngle(angle);
  const signs = EDGE_SIGNS[handle];

  const anchorWorld = localToWorld(
    start,
    normalized,
    originSpec,
    anchorLocal(handle, start.width, start.height)
  );
  const dragWorldStart = localToWorld(
    start,
    normalized,
    originSpec,
    dragLocal(handle, start.width, start.height)
  );
  const pointerWorld = {
    x: dragWorldStart.x + pointerDelta.x,
    y: dragWorldStart.y + pointerDelta.y
  };

  // The rotated local axis vector from anchor to drag point must span the pointer
  // displacement: R · (sx·w, sy·h) = P − A  →  solve size in the local frame.
  const rad = angleToRadians(normalized);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const worldDelta = { x: pointerWorld.x - anchorWorld.x, y: pointerWorld.y - anchorWorld.y };
  const localDelta = {
    x: worldDelta.x * cos + worldDelta.y * sin,
    y: -worldDelta.x * sin + worldDelta.y * cos
  };

  let width = signs.x === 0 ? start.width : clean(signs.x * localDelta.x);
  let height = signs.y === 0 ? start.height : clean(signs.y * localDelta.y);

  const minWidth = Math.max(0, input.minWidth ?? 0);
  const minHeight = Math.max(0, input.minHeight ?? 0);
  const maxWidth = Number.isFinite(input.maxWidth)
    ? Math.max(0, input.maxWidth ?? Infinity)
    : Infinity;
  const maxHeight = Number.isFinite(input.maxHeight)
    ? Math.max(0, input.maxHeight ?? Infinity)
    : Infinity;

  if (input.ratio && Number.isFinite(input.ratio) && input.ratio > 0) {
    // Express every size limit on the width axis before clamping. Repairing one axis
    // after clamping the other can violate its maximum when the configured minima and
    // maxima have no common ratio-locked size. As in local-delta mode, maxima win for
    // an impossible constraint set so the emitted rectangle never exceeds an upper cap.
    const ratio = input.ratio;
    const widthDriven =
      signs.x !== 0 && (signs.y === 0 || Math.abs(localDelta.x) >= Math.abs(localDelta.y) * ratio);
    const desiredWidth = widthDriven ? width : height * ratio;
    const lockedMinWidth = Math.max(minWidth, minHeight * ratio);
    const lockedMaxWidth = Math.min(maxWidth, maxHeight * ratio);
    width = clampRange(desiredWidth, Math.min(lockedMinWidth, lockedMaxWidth), lockedMaxWidth);
    height = width / ratio;
  } else {
    width = clampRange(width, Math.min(minWidth, maxWidth), maxWidth);
    height = clampRange(height, Math.min(minHeight, maxHeight), maxHeight);
  }

  // Reposition so the anchor keeps its start world position under the new size.
  return placeAnchorAt(
    { left: start.left, top: start.top, width, height },
    normalized,
    originSpec,
    handle,
    anchorWorld
  );
};

/**
 * Moves `rect` so the anchor point of `handle` lands on `anchorWorld` in pixel space,
 * re-resolving the transform origin against the current size.
 */
export const placeAnchorAt = (
  rect: PlaneRect,
  angle: number,
  originSpec: string,
  handle: HandlePosition,
  anchorWorld: Vec2
): PlaneRect => {
  const origin: TransformOrigin = resolveTransformOrigin(originSpec, rect.width, rect.height);
  const anchor = anchorLocal(handle, rect.width, rect.height);
  const rad = angleToRadians(normalizeAngle(angle));
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = anchor.x - origin.x;
  const dy = anchor.y - origin.y;
  return {
    ...rect,
    left: clean(anchorWorld.x - origin.x - (dx * cos - dy * sin)),
    top: clean(anchorWorld.y - origin.y - (dx * sin + dy * cos))
  };
};
