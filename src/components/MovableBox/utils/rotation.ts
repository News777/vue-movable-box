/**
 * Rotation geometry helpers. All angles are degrees, clockwise, matching CSS `rotate()`.
 * Bounds, snapping, and collision semantics for rotated boxes operate on the axis-aligned
 * bounding box (AABB) of the rotated rectangle; see README "Rotation and Transform Origin".
 */

export interface PlaneRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Parses an angle, falls back to 0 for non-finite values, and wraps it into (-180, 180]. */
export const normalizeAngle = (value: number | string | undefined | null): number => {
  const converted = typeof value === 'number' ? value : Number(value ?? 0);
  if (!Number.isFinite(converted)) return 0;
  const wrapped = ((converted % 360) + 360) % 360;
  return wrapped > 180 ? wrapped - 360 : wrapped;
};

export const angleToRadians = (angle: number): number => (angle * Math.PI) / 180;

// Trigonometry leaves ~1e-14 residue at exact quarter turns; round it away.
const clean = (value: number) => Math.round(value * 1e9) / 1e9;

export const rotatedAABB = (rect: PlaneRect, angle: number): PlaneRect => {
  const normalized = normalizeAngle(angle);
  if (normalized === 0) return { ...rect };
  const rad = angleToRadians(normalized);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const aabbWidth = Math.abs(rect.width * cos) + Math.abs(rect.height * sin);
  const aabbHeight = Math.abs(rect.width * sin) + Math.abs(rect.height * cos);
  return {
    left: clean(rect.left + (rect.width - aabbWidth) / 2),
    top: clean(rect.top + (rect.height - aabbHeight) / 2),
    width: clean(aabbWidth),
    height: clean(aabbHeight)
  };
};

/**
 * Maps a screen-space movement delta into the box's local (unrotated) space so resize
 * handles keep working along their rotated edges. Screen delta rotates by -angle.
 */
export const deltaToLocal = (
  deltaX: number,
  deltaY: number,
  angle: number
): { x: number; y: number } => {
  const normalized = normalizeAngle(angle);
  if (normalized === 0) return { x: deltaX, y: deltaY };
  const rad = angleToRadians(normalized);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: clean(deltaX * cos + deltaY * sin),
    y: clean(-deltaX * sin + deltaY * cos)
  };
};
