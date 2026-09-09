import { afterEach } from 'vitest';
import { enableAutoUnmount } from '@vue/test-utils';

enableAutoUnmount(afterEach);

Object.defineProperty(globalThis, 'requestAnimationFrame', {
  writable: true,
  configurable: true,
  value: (callback: FrameRequestCallback) => setTimeout(() => callback(0), 0)
});

Object.defineProperty(globalThis, 'cancelAnimationFrame', {
  writable: true,
  configurable: true,
  value: (id: number) => clearTimeout(id)
});

// jsdom 24 lacks PointerEvent and pointer capture; MovableBox relies on both.
interface MinimalPointerEventInit extends MouseEventInit {
  pointerId?: number;
  pointerType?: string;
  isPrimary?: boolean;
}

class PointerEventPolyfill extends MouseEvent implements PointerEvent {
  readonly pointerId: number;
  readonly pointerType: string;
  readonly isPrimary: boolean;

  constructor(type: string, init: MinimalPointerEventInit = {}) {
    super(type, init);
    this.pointerId = init.pointerId ?? 1;
    this.pointerType = init.pointerType ?? '';
    this.isPrimary = init.isPrimary ?? true;
  }
}

// Expose settable passthroughs for MouseEvent geometry so event constructors
// assigning options (e.g. @vue/test-utils trigger) do not hit getter-only
// properties inherited from the jsdom MouseEvent prototype.
for (const key of [
  'clientX',
  'clientY',
  'screenX',
  'screenY',
  'pageX',
  'pageY',
  'offsetX',
  'offsetY',
  'movementX',
  'movementY',
  'x',
  'y',
  'button',
  'buttons'
] as const) {
  const descriptor = Object.getOwnPropertyDescriptor(MouseEvent.prototype, key);
  if (!descriptor?.get) continue;
  Object.defineProperty(PointerEventPolyfill.prototype, key, {
    configurable: true,
    enumerable: descriptor.enumerable,
    get: descriptor.get,
    set: descriptor.set ?? (() => {})
  });
}

Object.defineProperty(globalThis, 'PointerEvent', {
  writable: true,
  configurable: true,
  value: PointerEventPolyfill
});

if (typeof Element !== 'undefined') {
  for (const method of ['setPointerCapture', 'releasePointerCapture'] as const) {
    if (typeof Element.prototype[method] !== 'function') {
      Object.defineProperty(Element.prototype, method, {
        writable: true,
        configurable: true,
        value: () => {}
      });
    }
  }
  if (typeof Element.prototype.hasPointerCapture !== 'function') {
    Object.defineProperty(Element.prototype, 'hasPointerCapture', {
      writable: true,
      configurable: true,
      value: () => false
    });
  }
}
