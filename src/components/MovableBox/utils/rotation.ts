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

export interface TransformOrigin {
  x: number;
  y: number;
}

const TRANSFORM_ORIGIN_KEYWORDS = new Set(['left', 'center', 'right', 'top', 'bottom']);
const TRANSFORM_ORIGIN_LENGTH = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:px|%)$/;
const TRANSFORM_ORIGIN_ZERO = /^[+-]?(?:0+(?:\.0*)?|\.0+)$/;
const HORIZONTAL_ORIGIN_KEYWORDS = new Set(['left', 'right']);
const VERTICAL_ORIGIN_KEYWORDS = new Set(['top', 'bottom']);

const isOriginLength = (value: string) =>
  TRANSFORM_ORIGIN_LENGTH.test(value) || TRANSFORM_ORIGIN_ZERO.test(value);

const isValidOriginPair = (first: string, second: string) => {
  if (isOriginLength(first)) {
    return isOriginLength(second) || second === 'center' || VERTICAL_ORIGIN_KEYWORDS.has(second);
  }
  if (HORIZONTAL_ORIGIN_KEYWORDS.has(first)) {
    return isOriginLength(second) || second === 'center' || VERTICAL_ORIGIN_KEYWORDS.has(second);
  }
  if (VERTICAL_ORIGIN_KEYWORDS.has(first)) {
    return second === 'center' || HORIZONTAL_ORIGIN_KEYWORDS.has(second);
  }
  return first === 'center';
};

/** Keeps the supported CSS subset intact and maps unsupported syntax to center. */
export const normalizeTransformOrigin = (spec: string): string => {
  if (!spec) return 'center';
  const parts = spec.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (parts.length === 0 || parts.length > 2) return 'center';
  const tokensAreSupported = parts.every(
    part =>
      TRANSFORM_ORIGIN_KEYWORDS.has(part) ||
      TRANSFORM_ORIGIN_LENGTH.test(part) ||
      TRANSFORM_ORIGIN_ZERO.test(part)
  );
  if (!tokensAreSupported) return 'center';
  if (parts.length === 2 && !isValidOriginPair(parts[0], parts[1])) return 'center';
  return parts.join(' ');
};

/**
 * Resolves a CSS transform-origin ('center', 'top left', '50% 50%', '10px 20px') into
 * element-local coordinates for the given size. Keywords bind to their own axis in any
 * order ('top left' === 'left top'); unparsable parts fall back to center.
 */
export const resolveTransformOrigin = (
  spec: string,
  width: number,
  height: number
): TransformOrigin => {
  const fallback: TransformOrigin = { x: width / 2, y: height / 2 };
  const normalized = normalizeTransformOrigin(spec);
  const parts = normalized.split(' ');

  let x: number | null = null;
  let y: number | null = null;
  const assign = (value: number) => {
    if (x === null) x = value;
    else if (y === null) y = value;
  };

  for (const part of parts) {
    if (part === 'left') x = 0;
    else if (part === 'right') x = width;
    else if (part === 'top') y = 0;
    else if (part === 'bottom') y = height;
    else if (part === 'center') assign(x === null ? width / 2 : height / 2);
    else if (part.endsWith('%')) {
      const percent = Number(part.slice(0, -1));
      if (!Number.isFinite(percent)) return fallback;
      assign((percent / 100) * (x === null ? width : height));
    } else {
      const length = Number.parseFloat(part);
      if (!Number.isFinite(length)) return fallback;
      assign(length);
    }
  }
  return { x: x ?? width / 2, y: y ?? height / 2 };
};

/**
 * AABB of the rectangle rotated about an arbitrary transform origin. Rotating about a
 * non-center origin shifts the center-rotation AABB by a constant d = R(C - O) + (O - C)
 * that depends only on the element geometry, so translation stays 1:1 equivariant.
 */
export const rotatedAABBAt = (
  rect: PlaneRect,
  angle: number,
  origin: TransformOrigin
): PlaneRect => {
  const centerAABB = rotatedAABB(rect, angle);
  const normalized = normalizeAngle(angle);
  if (normalized === 0) return centerAABB;
  const rad = angleToRadians(normalized);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const ux = rect.width / 2 - origin.x;
  const uy = rect.height / 2 - origin.y;
  const dX = clean(ux * cos - uy * sin - ux);
  const dY = clean(ux * sin + uy * cos - uy);
  return {
    left: clean(centerAABB.left + dX),
    top: clean(centerAABB.top + dY),
    width: centerAABB.width,
    height: centerAABB.height
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
