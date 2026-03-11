// MovableBox 类型定义
export type HandlePosition = 'tl' | 'tm' | 'tr' | 'mr' | 'br' | 'bm' | 'bl' | 'ml';
export type HandlesSet = HandlePosition[];

export interface MovableBoxRect {
  left: number | string;
  top: number | string;
  width: number | string;
  height: number | string;
  zIndex?: number;
}

export interface BoundsMargin {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface SnapConfig {
  enabled: boolean;
  gridSize: number;
  snapThreshold: number;
}

export interface AlignConfig {
  enabled: boolean;
  snapToElements: boolean;
  snapThreshold: number;
}

export interface CollisionConfig {
  enabled: boolean;
  allowOverlap: boolean;
}

export interface MovableBoxExpose {
  getConfig: () => Required<Omit<MovableBoxRect, 'zIndex'>> & Record<string, any>;
  setPosition: (left: number, top: number) => void;
  setSize: (width: number, height: number) => void;
  reset: () => void;
  activate: () => void;
  deactivate: () => void;
}
