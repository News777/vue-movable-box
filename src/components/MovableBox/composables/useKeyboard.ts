import type { DragDirection, HandlePosition } from '../types';

interface UseKeyboardOptions {
  enabled: boolean;
  step: number;
  disabled: boolean;
  readOnly: boolean;
  active: boolean;
  dragDirections: DragDirection[];
  resizeDirections: HandlePosition[];
  focusedHandle: HandlePosition | null;
  interacting: boolean;
}

interface UseKeyboardCallbacks {
  move: (direction: DragDirection, distance: number) => void;
  resize: (handle: HandlePosition, direction: DragDirection, distance: number) => void;
  deactivate: () => void;
  cancel: (source: Event | null) => void;
}

const keyMap: Partial<Record<string, DragDirection>> = {
  ArrowUp: 'top',
  ArrowDown: 'bottom',
  ArrowLeft: 'left',
  ArrowRight: 'right'
};

const handleAxes: Record<HandlePosition, DragDirection[]> = {
  tl: ['top', 'bottom', 'left', 'right'],
  tm: ['top', 'bottom'],
  tr: ['top', 'bottom', 'left', 'right'],
  ml: ['left', 'right'],
  mr: ['left', 'right'],
  bl: ['top', 'bottom', 'left', 'right'],
  bm: ['top', 'bottom'],
  br: ['top', 'bottom', 'left', 'right']
};

const oppositeDirection: Record<DragDirection, DragDirection> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left'
};

export const normalizeKeyboardStep = (step: number): number =>
  Number.isFinite(step) && step > 0 ? step : 1;

export function useKeyboard(getOptions: () => UseKeyboardOptions, callbacks: UseKeyboardCallbacks) {
  const handleKeyDown = (event: KeyboardEvent) => {
    const options = getOptions();
    const interactive = options.interacting;
    if (!interactive && (!options.enabled || options.disabled || !options.active)) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      if (interactive) callbacks.cancel(event);
      else callbacks.deactivate();
      return;
    }
    if (interactive) return;
    if (options.readOnly) return;

    const direction = keyMap[event.key];
    if (!direction) return;

    const step = normalizeKeyboardStep(options.step);

    if (options.focusedHandle && options.resizeDirections.includes(options.focusedHandle)) {
      if (!handleAxes[options.focusedHandle].includes(direction)) return;
      event.preventDefault();
      callbacks.resize(
        options.focusedHandle,
        event.shiftKey ? oppositeDirection[direction] : direction,
        step
      );
      return;
    }

    if (event.shiftKey) {
      const handle = options.resizeDirections.includes('br')
        ? 'br'
        : options.resizeDirections[0];
      if (!handle) return;
      event.preventDefault();
      callbacks.resize(handle, direction, step);
      return;
    }

    if (!options.dragDirections.includes(direction)) return;
    event.preventDefault();
    callbacks.move(direction, step);
  };

  return { handleKeyDown };
}
