// 对齐吸附功能
import type { MovableBoxRect } from '../types';

export interface SnapResult {
  left: number;
  top: number;
  snapped: boolean;
  snapPoint?: 'left' | 'right' | 'top' | 'bottom' | 'center-x' | 'center-y';
}

/**
 * 对齐到网格
 */
export function snapToGrid(value: number, gridSize: number, threshold = 10): number {
  const remainder = value % gridSize;
  if (remainder < threshold) {
    return Math.round(value / gridSize) * gridSize;
  }
  if (remainder > gridSize - threshold) {
    return (Math.round(value / gridSize) + 1) * gridSize;
  }
  return value;
}

/**
 * 对齐到元素边缘
 * @param current 当前元素位置
 * @param targets 目标元素数组
 * @param threshold 吸附阈值
 */
export function snapToElements(
  current: { left: number; top: number; width: number; height: number },
  targets: MovableBoxRect[],
  threshold = 10
): SnapResult {
  let newLeft = current.left;
  let newTop = current.top;
  let snapped = false;
  let snapPoint: SnapResult['snapPoint'];

  const currentRight = current.left + current.width;
  const currentBottom = current.top + current.height;
  const currentCenterX = current.left + current.width / 2;
  const currentCenterY = current.top + current.height / 2;

  for (const target of targets) {
    const tLeft = Number(target.left);
    const tTop = Number(target.top);
    const tWidth = Number(target.width);
    const tHeight = Number(target.height);
    const tRight = tLeft + tWidth;
    const tBottom = tTop + tHeight;
    const tCenterX = tLeft + tWidth / 2;
    const tCenterY = tTop + tHeight / 2;

    // 左边缘对齐
    if (Math.abs(current.left - tLeft) < threshold) {
      newLeft = tLeft;
      snapped = true;
      snapPoint = 'left';
    }
    // 右边缘对齐
    else if (Math.abs(currentRight - tRight) < threshold) {
      newLeft = tRight - current.width;
      snapped = true;
      snapPoint = 'right';
    }
    // 左边缘对齐到目标右边缘
    else if (Math.abs(current.left - tRight) < threshold) {
      newLeft = tRight;
      snapped = true;
      snapPoint = 'left';
    }
    // 右边缘对齐到目标左边缘
    else if (Math.abs(currentRight - tLeft) < threshold) {
      newLeft = tLeft - current.width;
      snapped = true;
      snapPoint = 'right';
    }
    // 垂直居中对齐
    else if (Math.abs(currentCenterX - tCenterX) < threshold) {
      newLeft = tCenterX - current.width / 2;
      snapped = true;
      snapPoint = 'center-x';
    }

    // 上边缘对齐
    if (Math.abs(current.top - tTop) < threshold) {
      newTop = tTop;
      snapped = true;
      snapPoint = 'top';
    }
    // 下边缘对齐
    else if (Math.abs(currentBottom - tBottom) < threshold) {
      newTop = tBottom - current.height;
      snapped = true;
      snapPoint = 'bottom';
    }
    // 上边缘对齐到目标下边缘
    else if (Math.abs(current.top - tBottom) < threshold) {
      newTop = tBottom;
      snapped = true;
      snapPoint = 'top';
    }
    // 下边缘对齐到目标上边缘
    else if (Math.abs(currentBottom - tTop) < threshold) {
      newTop = tTop - current.height;
      snapped = true;
      snapPoint = 'bottom';
    }
    // 水平居中对齐
    else if (Math.abs(currentCenterY - tCenterY) < threshold) {
      newTop = tCenterY - current.height / 2;
      snapped = true;
      snapPoint = 'center-y';
    }
  }

  return { left: newLeft, top: newTop, snapped, snapPoint };
}

/**
 * 生成对齐辅助线数据
 */
export function getSnapGuides(
  current: { left: number; top: number; width: number; height: number },
  targets: MovableBoxRect[],
  threshold = 10
): { vertical: number[]; horizontal: number[] } {
  const vertical: number[] = [];
  const horizontal: number[] = [];

  const currentCenterX = current.left + current.width / 2;
  const currentCenterY = current.top + current.height / 2;

  for (const target of targets) {
    const tLeft = Number(target.left);
    const tTop = Number(target.top);
    const tWidth = Number(target.width);
    const tHeight = Number(target.height);
    const tRight = tLeft + tWidth;
    const tBottom = tTop + tHeight;
    const tCenterX = tLeft + tWidth / 2;
    const tCenterY = tTop + tHeight / 2;

    // 垂直辅助线
    if (Math.abs(current.left - tLeft) < threshold) vertical.push(tLeft);
    if (Math.abs(current.left + current.width - tRight) < threshold) vertical.push(tRight);
    if (Math.abs(current.left - tRight) < threshold) vertical.push(tRight);
    if (Math.abs(current.left + current.width - tLeft) < threshold) vertical.push(tLeft);
    if (Math.abs(currentCenterX - tCenterX) < threshold) vertical.push(tCenterX);

    // 水平辅助线
    if (Math.abs(current.top - tTop) < threshold) horizontal.push(tTop);
    if (Math.abs(current.top + current.height - tBottom) < threshold) horizontal.push(tBottom);
    if (Math.abs(current.top - tBottom) < threshold) horizontal.push(tBottom);
    if (Math.abs(current.top + current.height - tTop) < threshold) horizontal.push(tTop);
    if (Math.abs(currentCenterY - tCenterY) < threshold) horizontal.push(tCenterY);
  }

  return { vertical: [...new Set(vertical)], horizontal: [...new Set(horizontal)] };
}
