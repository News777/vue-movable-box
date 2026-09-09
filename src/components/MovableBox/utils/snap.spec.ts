import { describe, expect, it } from 'vitest';
import { snapToElements, snapToGrid } from './snap';

describe('snap utilities', () => {
  it('snaps to the nearest candidate independently on both axes', () => {
    const result = snapToElements(
      { left: 8, top: 11, width: 20, height: 20 },
      [
        { id: 'far', left: 5, top: 8, width: 20, height: 20 },
        { id: 'near', left: 10, top: 12, width: 20, height: 20 }
      ],
      5
    );
    expect(result).toMatchObject({ left: 10, top: 12, snapped: true, targetId: 'near' });
    expect(result.points).toEqual(['left', 'top']);
    expect(result.guides).toEqual({ vertical: [10], horizontal: [12] });
  });

  it('uses target order as the stable tie breaker and includes the threshold boundary', () => {
    const result = snapToElements(
      { left: 10, top: 100, width: 20, height: 20 },
      [
        { id: 'first', left: 5, top: 200, width: 20, height: 20 },
        { id: 'second', left: 15, top: 300, width: 20, height: 20 }
      ],
      5
    );
    expect(result.left).toBe(5);
    expect(result.targetId).toBe('first');
  });

  it('ignores invalid targets and falls back for invalid grid sizes', () => {
    const result = snapToElements(
      { left: 1, top: 2, width: 3, height: 4 },
      [
        { left: 'bad', top: 0, width: 10, height: 10 },
        { left: ' ', top: 0, width: 10, height: 10 },
        { left: 0, top: 0, width: -10, height: 10 }
      ],
      10
    );
    expect(result.snapped).toBe(false);
    expect(snapToGrid(31, 0)).toBe(40);
  });

  it('equalizes spacing between the two anchors a rect travels between', () => {
    const result = snapToElements(
      { left: 122, top: 500, width: 50, height: 50 },
      [
        { id: 'a', left: 0, top: 0, width: 50, height: 50 },
        { id: 'b', left: 250, top: 0, width: 50, height: 50 }
      ],
      10
    );
    expect(result.left).toBe(125);
    expect(result.snapped).toBe(true);
    expect(result.points).toEqual([]);
    expect(result.guides.vertical).toEqual([50, 250]);
    expect(result.spacing).toEqual([
      { axis: 'horizontal', gap: 75, targetIds: ['a', 'b'], guides: [50, 250] }
    ]);
  });

  it('keeps spacing within the threshold and requires the rect to travel between anchors', () => {
    const anchors = [
      { id: 'a', left: 0, top: 0, width: 50, height: 50 },
      { id: 'b', left: 250, top: 0, width: 50, height: 50 }
    ];
    const beyondThreshold = snapToElements(
      { left: 100, top: 500, width: 50, height: 50 },
      anchors,
      10
    );
    expect(beyondThreshold.snapped).toBe(false);
    expect(beyondThreshold.spacing).toEqual([]);

    const outsidePair = snapToElements(
      { left: 500, top: 500, width: 50, height: 50 },
      anchors,
      10
    );
    expect(outsidePair.snapped).toBe(false);
    expect(outsidePair.spacing).toEqual([]);
  });

  it('respects snap filters per axis', () => {
    const result = snapToElements(
      { left: 8, top: 11, width: 20, height: 20 },
      [
        { id: 'far', left: 5, top: 8, width: 20, height: 20 },
        { id: 'near', left: 10, top: 12, width: 20, height: 20 }
      ],
      5,
      { horizontal: true, vertical: true },
      { filter: (target, axis) => !(target.id === 'near' && axis === 'horizontal') }
    );
    expect(result.left).toBe(5);
    expect(result.targetIds.horizontal).toBe('far');
    expect(result.top).toBe(12);
    expect(result.targetIds.vertical).toBe('near');
  });

  it('lets snap priority decide between alignment and spacing strategies', () => {
    const targets = [
      { id: 'a', left: 0, top: 0, width: 50, height: 50 },
      { id: 'b', left: 250, top: 0, width: 50, height: 50 },
      { id: 'edge', left: 120, top: 400, width: 50, height: 50 }
    ];
    // Rect at 122: alignment offers left=120 (distance 2), spacing offers left=125 (distance 3).
    const current = { left: 122, top: 100, width: 50, height: 50 };

    const alignmentFirst = snapToElements(current, targets, 10);
    expect(alignmentFirst.left).toBe(120);
    expect(alignmentFirst.spacing).toEqual([]);

    const spacingFirst = snapToElements(current, targets, 10, undefined, {
      priority: ['spacing', 'alignment']
    });
    expect(spacingFirst.left).toBe(125);
    expect(spacingFirst.spacing[0]).toMatchObject({ axis: 'horizontal', gap: 75 });
  });
});
