/**
 * AutoDraggable 工具函数库
 * 提供数值计算、事件处理、边界限制等功能
 */

import Decimal from 'decimal.js';

// 常量定义
const DEFAULT_DECIMAL_PLACES = 2;
const DEFAULT_SCALE = 1;

/**
 * 安全数值转换
 * 将任意值转换为数字，NaN 时返回默认值
 */
export const valIsNaN = (
  value: number | string | undefined | null,
  replaceVal: number = 1
): number => {
  if (value === null || value === undefined || value === '') {
    return replaceVal;
  }
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num as number) ? replaceVal : (num as number);
};

/**
 * 计算最终数值
 * 根据缩放比例和小数设置计算实际值
 */
export const figureFinalValue = (
  value: string | number,
  scale: number | string | undefined,
  isKeepDecimals: boolean = false,
  decimalPlaces: number = DEFAULT_DECIMAL_PLACES
): number => {
  const scaleOfNumber = valIsNaN(scale, DEFAULT_SCALE);
  const valueOfNumber = valIsNaN(value);

  // 避免除以零
  if (scaleOfNumber === 0) {
    return isKeepDecimals
      ? new Decimal(valueOfNumber).toDecimalPlaces(decimalPlaces).toNumber()
      : Math.round(valueOfNumber);
  }

  const result = valueOfNumber / scaleOfNumber;

  return isKeepDecimals
    ? new Decimal(result).toDecimalPlaces(decimalPlaces).toNumber()
    : Math.round(result);
};

/**
 * 设置数值单位
 * 将数值转换为带单位的字符串
 */
export const setValUnit = (
  val: string | number | undefined | null,
  unitType: string = 'px'
): string => {
  if (val === null || val === undefined || val === '') {
    return '0';
  }
  return `${val}${unitType}`;
};

/**
 * 边界限制
 * 确保值在 min 和 max 之间
 */
export const restrictToBounds = (
  value: number,
  min: number,
  max: number,
  limitAreaForParent: boolean = true
): number => {
  if (!limitAreaForParent) {
    return value;
  }
  return Math.min(Math.max(value, min), max);
};

/**
 * 添加事件监听
 * 支持鼠标和触摸事件
 */
export function addEvent<K extends keyof HTMLElementEventMap>(
  el: HTMLElement | null | undefined,
  event: K,
  handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
): void {
  if (!el) return;
  el.addEventListener(event, handler as EventListener, options);
}

/**
 * 移除事件监听
 * 注意：options 必须与 addEvent 时一致
 */
export function removeEvent<K extends keyof HTMLElementEventMap>(
  el: HTMLElement | null | undefined,
  event: K,
  handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => void,
  options?: boolean | EventListenerOptions
): void {
  if (!el) return;
  el.removeEventListener(event, handler as EventListener, options);
}

/**
 * 计算保持比例的最大宽高
 * 用于等比缩放时计算最大允许尺寸
 */
export const figureRatioMax = (
  wVal: number,
  hVal: number,
  w: number,
  h: number
): number[] => {
  if (w === 0 || h === 0) {
    return [wVal, hVal];
  }
  
  const wRate = wVal / w;
  const hRate = hVal / h;
  
  if (wRate > hRate) {
    return [keepDecimalsToNum(w * hRate), keepDecimalsToNum(hVal)];
  } else {
    return [keepDecimalsToNum(wVal), keepDecimalsToNum(h * wRate)];
  }
};

/**
 * 保留小数位
 * 使用 Decimal.js 确保精度
 */
export const keepDecimalsToNum = (
  val: number,
  defaultVal: number = 1,
  decimalPlaces: number = DEFAULT_DECIMAL_PLACES
): number => {
  const newVal = new Decimal(val)
    .toDecimalPlaces(decimalPlaces)
    .toNumber();
  return valIsNaN(newVal, defaultVal);
};

/**
 * 获取元素的父元素和边界信息
 */
export const getParentBounds = (
  element: HTMLElement,
  limitAreaClass?: string
): { parent: HTMLElement | null; rect: DOMRect | null } => {
  const parent = limitAreaClass
    ? document.querySelector(limitAreaClass) as HTMLElement
    : element.parentElement;

  if (!parent) {
    return { parent: null, rect: null };
  }

  return {
    parent,
    rect: parent.getBoundingClientRect()
  };
};

/**
 * 计算两个 DOM 元素的相对位置
 */
export const getRelativePosition = (
  childRect: DOMRect,
  parentRect: DOMRect
): { left: number; top: number } => {
  return {
    left: childRect.left - parentRect.left,
    top: childRect.top - parentRect.top
  };
};

/**
 * 深度克隆对象
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  
  if (obj instanceof Object) {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  
  return obj;
};

/**
 * 防抖函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

/**
 * 节流函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): ((...args: Parameters<T>) => void) => {
  let lastTime = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      fn(...args);
    }
  };
};

/**
 * 判断是否为触摸设备
 */
export const isTouchDevice = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * 获取事件坐标
 * 统一处理鼠标和触摸事件
 */
export const getEventCoords = (event: MouseEvent | TouchEvent): { x: number; y: number } => {
  if ('touches' in event && event.touches.length > 0) {
    return {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    };
  }
  
  if ('changedTouches' in event && event.changedTouches.length > 0) {
    return {
      x: event.changedTouches[0].clientX,
      y: event.changedTouches[0].clientY
    };
  }
  
  // MouseEvent fallback
  const mouseEvent = event as MouseEvent;
  return {
    x: mouseEvent.clientX,
    y: mouseEvent.clientY
  };
};
