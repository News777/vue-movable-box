import { describe, expect, it } from 'vitest';
import type { ExtendsMovableBox, MovableBoxProps } from './MovableBox';

interface ConsumerBox {
  left: number;
  top: number;
  width: number;
  height: number;
  label: string;
}

interface CustomFields {
  label: string;
}

describe('MovableBox public types', () => {
  it('accepts interface-based models and generic custom fields', () => {
    const model: ConsumerBox = {
      left: 1,
      top: 2,
      width: 3,
      height: 4,
      label: 'box'
    };
    const extended: ExtendsMovableBox<CustomFields> = model;
    const props: MovableBoxProps<CustomFields> = { modelValue: model, memberId: 'box' };

    expect(extended.label).toBe('box');
    expect(props.modelValue.label).toBe('box');
    expect(props.memberId).toBe('box');
  });
});
