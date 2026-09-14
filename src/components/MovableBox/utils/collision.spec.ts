import { describe, expect, it } from 'vitest';
import {
  checkAllCollisions,
  checkCollision,
  findFirstCollisionPathInterval,
  getDominantCollision,
  getTotalOverlapArea,
  isValidCollisionTarget
} from './collision';

describe('collision utilities', () => {
  it('does not treat touching edges as a collision', () => {
    expect(
      checkCollision(
        { left: 0, top: 0, width: 10, height: 10 },
        { left: 10, top: 0, width: 10, height: 10 }
      ).colliding
    ).toBe(false);
  });

  it('reports overlap area and the dominant target deterministically', () => {
    const results = checkAllCollisions(
      { left: 0, top: 0, width: 20, height: 20 },
      [
        { id: 'small', left: 15, top: 0, width: 20, height: 20 },
        { id: 'large', left: 10, top: 0, width: 20, height: 20 }
      ]
    );
    expect(getTotalOverlapArea(results)).toBe(300);
    expect(getDominantCollision(results)).toMatchObject({ targetId: 'large', overlapArea: 200 });
  });

  it('ignores invalid targets and an explicitly excluded id', () => {
    const results = checkAllCollisions(
      { left: 0, top: 0, width: 20, height: 20 },
      [
        { id: 'self', left: 0, top: 0, width: 20, height: 20 },
        { id: 'invalid', left: 'x', top: 0, width: 20, height: 20 },
        { id: 'empty', left: ' ', top: 0, width: 20, height: 20 }
      ],
      'self'
    );
    expect(results).toEqual([]);
  });

  it('ignores zero-area targets during continuous path checks', () => {
    const from = { left: 0, top: 0, width: 10, height: 10 };
    const to = { ...from, left: 100 };

    expect(
      findFirstCollisionPathInterval(from, to, [
        { id: 'zero-width', left: 50, top: 0, width: 0, height: 20 },
        { id: 'zero-height', left: 50, top: 0, width: 20, height: 0 }
      ])
    ).toBeNull();
  });

  it('validates finite positive-area public targets', () => {
    expect(isValidCollisionTarget({ left: 1, top: 2, width: 3, height: 4 })).toBe(true);
    expect(isValidCollisionTarget({ left: 'invalid', top: 2, width: 3, height: 4 })).toBe(false);
    expect(isValidCollisionTarget({ left: 1, top: 2, width: 0, height: 4 })).toBe(false);
  });
});
