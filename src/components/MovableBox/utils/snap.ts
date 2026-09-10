import type { GuidesEventPayload, MovableBoxRect, SnapPoint, SnapTarget } from '../types';

export type SnapStrategy = 'alignment' | 'spacing';

export interface SnapSpacingInfo {
  axis: 'horizontal' | 'vertical';
  /** The equalized gap in the leader's coordinate space. */
  gap: number;
  /** Anchor target ids in pair order; undefined entries mean an unnamed target. */
  targetIds: (string | undefined)[];
  /** Guide line coordinates (perpendicular axis values) marking the two anchor edges. */
  guides: number[];
}

export interface SnapOptions {
  /** Return false to exclude a target from snapping on the given axis. */
  filter?: (target: SnapTarget, axis: 'horizontal' | 'vertical') => boolean;
  /**
   * Strategy consultation order, resolved per axis. The first strategy that produces a
   * candidate within the threshold wins. Default: alignment first, then spacing.
   */
  priority?: SnapStrategy[];
}

export interface SnapResult {
  left: number;
  top: number;
  snapped: boolean;
  snapPoint?: SnapPoint;
  points: SnapPoint[];
  targetId?: string;
  targetIds: { horizontal?: string; vertical?: string };
  guides: GuidesEventPayload;
  spacing: SnapSpacingInfo[];
}

export interface SnapAxes {
  horizontal: boolean;
  vertical: boolean;
}

interface AlignmentCandidate {
  distance: number;
  guide: number;
  point: SnapPoint;
  targetId?: string;
  value: number;
}

interface SpacingCandidate {
  distance: number;
  value: number;
  guides: number[];
  gap: number;
  targetIds: (string | undefined)[];
}

const toFiniteNumber = (value: number | string): number | null => {
  if (typeof value === 'string' && value.trim() === '') return null;
  const converted = Number(value);
  return Number.isFinite(converted) ? converted : null;
};

const toFiniteRect = (rect: MovableBoxRect) => {
  const left = toFiniteNumber(rect.left);
  const top = toFiniteNumber(rect.top);
  const width = toFiniteNumber(rect.width);
  const height = toFiniteNumber(rect.height);
  if (left === null || top === null || width === null || height === null) return null;
  if (width < 0 || height < 0) return null;
  return { left, top, width, height };
};

export function snapToGrid(value: number, gridSize: number): number {
  const size = Number.isFinite(gridSize) && gridSize > 0 ? gridSize : 20;
  return Math.round(value / size) * size;
}

const chooseNearest = <T extends Candidate>(
  current: T | null,
  candidate: T,
  threshold: number
): T | null => {
  if (candidate.distance > threshold) return current;
  if (!current || candidate.distance < current.distance) return candidate;
  return current;
};

type Candidate = AlignmentCandidate | SpacingCandidate;

const DEFAULT_PRIORITY: SnapStrategy[] = ['alignment', 'spacing'];

interface AxisResolution {
  candidate: AlignmentCandidate | null;
  spacing: SpacingCandidate | null;
  guides: number[];
  spacingInfo: SnapSpacingInfo | null;
  value: number | null;
}

/**
 * Consults strategies in the configured order and stops at the first one producing a
 * candidate within the threshold. Candidate thunks run at most once and only when their
 * strategy is actually consulted, so disabled or superseded strategies cost nothing.
 */
const resolveAxis = (
  axis: 'horizontal' | 'vertical',
  threshold: number,
  strategies: SnapStrategy[],
  candidates: {
    alignment: () => AlignmentCandidate | null;
    spacing: () => SpacingCandidate | null;
  }
): AxisResolution => {
  for (const strategy of strategies) {
    if (strategy === 'alignment') {
      const picked = candidates.alignment();
      if (picked && picked.distance <= threshold) {
        return {
          candidate: picked,
          spacing: null,
          guides: [picked.guide],
          spacingInfo: null,
          value: picked.value
        };
      }
      continue;
    }
    const picked = candidates.spacing();
    if (picked && picked.distance <= threshold) {
      return {
        candidate: null,
        spacing: picked,
        guides: picked.guides,
        spacingInfo: {
          axis,
          gap: picked.gap,
          targetIds: picked.targetIds,
          guides: picked.guides
        },
        value: picked.value
      };
    }
  }
  return { candidate: null, spacing: null, guides: [], spacingInfo: null, value: null };
};

// Entries arrive pre-filtered: `snapToElements` only collects targets whose filter passed
// for the axis, so this function performs no filtering of its own.
const spacingCandidatesForAxis = (
  axis: 'horizontal' | 'vertical',
  start: number,
  size: number,
  limit: number,
  entries: { rect: { left: number; top: number; width: number; height: number }; id?: string }[]
): SpacingCandidate | null => {
  const anchorStart = (rect: { left: number; top: number }) =>
    axis === 'horizontal' ? rect.left : rect.top;
  const anchorEnd = (rect: { left: number; top: number; width: number; height: number }) =>
    axis === 'horizontal' ? rect.left + rect.width : rect.top + rect.height;

  // Equal spacing applies while the moving rect travels between two anchors: collect the
  // anchors it has already passed and the ones it has not reached yet, then pair them.
  const beforeEntries: typeof entries = [];
  const afterEntries: typeof entries = [];
  for (const entry of entries) {
    if (anchorEnd(entry.rect) <= start) beforeEntries.push(entry);
    if (anchorStart(entry.rect) >= start + size) afterEntries.push(entry);
  }

  let nearest: SpacingCandidate | null = null;
  for (const before of beforeEntries) {
    for (const after of afterEntries) {
      const slot = anchorStart(after.rect) - anchorEnd(before.rect) - size;
      if (slot < 0) continue;
      const gap = slot / 2;
      const value = anchorEnd(before.rect) + gap;
      const distance = Math.abs(start - value);
      if (distance > limit) continue;
      if (!nearest || distance < nearest.distance) {
        nearest = {
          distance,
          value,
          gap,
          guides: [anchorEnd(before.rect), anchorStart(after.rect)],
          targetIds: [before.id, after.id]
        };
      }
    }
  }
  return nearest;
};

export function snapToElements(
  current: { left: number; top: number; width: number; height: number },
  targets: SnapTarget[],
  threshold = 10,
  axes: SnapAxes = { horizontal: true, vertical: true },
  options: SnapOptions = {}
): SnapResult {
  const limit = Math.max(0, Number.isFinite(threshold) ? threshold : 10);
  const right = current.left + current.width;
  const bottom = current.top + current.height;
  const centerX = current.left + current.width / 2;
  const centerY = current.top + current.height / 2;
  const strategies =
    options.priority && options.priority.length > 0 ? options.priority : DEFAULT_PRIORITY;
  const needsAlignment = strategies.includes('alignment');
  const needsSpacing = strategies.includes('spacing');
  const passesFilter = (target: SnapTarget, axis: 'horizontal' | 'vertical') =>
    options.filter ? options.filter(target, axis) !== false : true;

  type Entry = { rect: NonNullable<ReturnType<typeof toFiniteRect>>; id?: string };

  // Filter results are memoized so a target sees exactly one filter call per axis no
  // matter how many strategies later consume the outcome.
  const axisCache = new Map<SnapTarget, { horizontal: boolean; vertical: boolean }>();
  const enabledAxesFor = (target: SnapTarget) => {
    let enabled = axisCache.get(target);
    if (!enabled) {
      enabled = {
        horizontal: axes.horizontal && passesFilter(target, 'horizontal'),
        vertical: axes.vertical && passesFilter(target, 'vertical')
      };
      axisCache.set(target, enabled);
    }
    return enabled;
  };

  let alignmentResolution: { x: AlignmentCandidate | null; y: AlignmentCandidate | null } | null =
    null;
  const computeAlignment = () => {
    let nearestX: AlignmentCandidate | null = null;
    let nearestY: AlignmentCandidate | null = null;
    for (const target of targets) {
      const rect = toFiniteRect(target);
      if (!rect) continue;
      const enabled = enabledAxesFor(target);
      if (!enabled.horizontal && !enabled.vertical) continue;

      const targetRight = rect.left + rect.width;
      const targetBottom = rect.top + rect.height;
      const targetCenterX = rect.left + rect.width / 2;
      const targetCenterY = rect.top + rect.height / 2;
      const targetId = target.id;

      if (enabled.horizontal) {
        const xCandidates: AlignmentCandidate[] = [
          {
            distance: Math.abs(current.left - rect.left),
            value: rect.left,
            guide: rect.left,
            point: 'left',
            targetId
          },
          {
            distance: Math.abs(right - targetRight),
            value: targetRight - current.width,
            guide: targetRight,
            point: 'right',
            targetId
          },
          {
            distance: Math.abs(current.left - targetRight),
            value: targetRight,
            guide: targetRight,
            point: 'left',
            targetId
          },
          {
            distance: Math.abs(right - rect.left),
            value: rect.left - current.width,
            guide: rect.left,
            point: 'right',
            targetId
          },
          {
            distance: Math.abs(centerX - targetCenterX),
            value: targetCenterX - current.width / 2,
            guide: targetCenterX,
            point: 'center-x',
            targetId
          }
        ];
        for (const candidate of xCandidates) nearestX = chooseNearest(nearestX, candidate, limit);
      }

      if (enabled.vertical) {
        const yCandidates: AlignmentCandidate[] = [
          {
            distance: Math.abs(current.top - rect.top),
            value: rect.top,
            guide: rect.top,
            point: 'top',
            targetId
          },
          {
            distance: Math.abs(bottom - targetBottom),
            value: targetBottom - current.height,
            guide: targetBottom,
            point: 'bottom',
            targetId
          },
          {
            distance: Math.abs(current.top - targetBottom),
            value: targetBottom,
            guide: targetBottom,
            point: 'top',
            targetId
          },
          {
            distance: Math.abs(bottom - rect.top),
            value: rect.top - current.height,
            guide: rect.top,
            point: 'bottom',
            targetId
          },
          {
            distance: Math.abs(centerY - targetCenterY),
            value: targetCenterY - current.height / 2,
            guide: targetCenterY,
            point: 'center-y',
            targetId
          }
        ];
        for (const candidate of yCandidates) nearestY = chooseNearest(nearestY, candidate, limit);
      }
    }
    return { x: nearestX, y: nearestY };
  };
  const alignmentFor = (axis: 'horizontal' | 'vertical'): AlignmentCandidate | null => {
    if (!needsAlignment) return null;
    if (!alignmentResolution) alignmentResolution = computeAlignment();
    return axis === 'horizontal' ? alignmentResolution.x : alignmentResolution.y;
  };

  const horizontalEntries: Entry[] = [];
  const verticalEntries: Entry[] = [];
  let spacingEntriesComputed = false;
  const computeSpacingEntries = () => {
    for (const target of targets) {
      const rect = toFiniteRect(target);
      if (!rect) continue;
      const enabled = enabledAxesFor(target);
      if (enabled.horizontal) horizontalEntries.push({ rect, id: target.id });
      if (enabled.vertical) verticalEntries.push({ rect, id: target.id });
    }
    spacingEntriesComputed = true;
  };
  const spacingFor = (axis: 'horizontal' | 'vertical'): SpacingCandidate | null => {
    if (!needsSpacing) return null;
    if (!spacingEntriesComputed) computeSpacingEntries();
    return axis === 'horizontal'
      ? spacingCandidatesForAxis(
          'horizontal',
          current.left,
          current.width,
          limit,
          horizontalEntries
        )
      : spacingCandidatesForAxis('vertical', current.top, current.height, limit, verticalEntries);
  };

  const horizontal = axes.horizontal
    ? resolveAxis('horizontal', limit, strategies, {
        alignment: () => alignmentFor('horizontal'),
        spacing: () => spacingFor('horizontal')
      })
    : null;
  const vertical = axes.vertical
    ? resolveAxis('vertical', limit, strategies, {
        alignment: () => alignmentFor('vertical'),
        spacing: () => spacingFor('vertical')
      })
    : null;

  const xAlignment = horizontal?.candidate ?? null;
  const yAlignment = vertical?.candidate ?? null;
  const points = [xAlignment?.point, yAlignment?.point].filter((point): point is SnapPoint =>
    Boolean(point)
  );
  const spacing = [horizontal?.spacingInfo, vertical?.spacingInfo].filter(
    (info): info is SnapSpacingInfo => Boolean(info)
  );

  return {
    left: horizontal?.value ?? current.left,
    top: vertical?.value ?? current.top,
    snapped: points.length > 0 || spacing.length > 0,
    snapPoint: points[0],
    points,
    targetId: xAlignment?.targetId ?? yAlignment?.targetId,
    targetIds: { horizontal: xAlignment?.targetId, vertical: yAlignment?.targetId },
    guides: {
      vertical: horizontal?.guides ?? [],
      horizontal: vertical?.guides ?? []
    },
    spacing
  };
}

export function getSnapGuides(
  current: { left: number; top: number; width: number; height: number },
  targets: SnapTarget[],
  threshold = 10,
  axes?: SnapAxes
): GuidesEventPayload {
  return snapToElements(current, targets, threshold, axes).guides;
}
