import Konva from 'konva';

/**
 * 工具類型
 */
export enum Tool {
  /**
   * 手形工具
   *
   * 拖曳整個畫布（Stage）
   */
  HAND = 'HAND',

  /**
   * 變形工具
   *
   * 可以對畫布上的形狀進行：拖曳、縮小、放大、旋轉
   */
  TRANSFORMER = 'TRANSFORMER',

  /**
   * 塑型工具 - 矩形
   *
   * 快速繪製矩形
   */
  SHAPING_RECTANGLE = 'SHAPING_RECTANGLE',

  /**
   * 塑型工具 - 橢圓形
   *
   * 快速繪製橢圓形
   */
  SHAPING_ELLIPSE = 'SHAPING_ELLIPSE',

  /**
   * 鉛筆
   *
   * 自由繪製線段
   */
  PENCIL = 'PENCIL',
}

/**
 * 形狀類型
 */
export const enum ShapeType {
  RECTANGLE = 'RECTANGLE',
  ELLIPSE = 'ELLIPSE',
  LINE = 'LINE',
}

/**
 * 二維座標
 */
export interface Coordinate {
  x: number;
  y: number;
}

/**
 * 基本形狀的樣式設定
 */
interface BaseStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
}

/**
 * 基本形狀的狀態
 */
export interface BaseShape extends Coordinate, BaseStyle {
  id: string;
  type: ShapeType;
  rotation?: number;
  scale?: { x: number; y: number };
  visible?: boolean;
  draggable?: boolean;
}

/**
 * 矩形的狀態
 */
export interface Rectangle extends BaseShape {
  type: ShapeType.RECTANGLE;
  width: number;
  height: number;
}

/**
 * 橢圓形的狀態
 */
export interface Ellipse extends BaseShape {
  type: ShapeType.ELLIPSE;
  radiusX: number;
  radiusY: number;
}

/**
 * 線段的狀態
 */
export interface Line extends Omit<BaseShape, 'x' | 'y'> {
  type: ShapeType.LINE;
  x?: number;
  y?: number;
  points: number[]; // [x1, y1, x2, y2, ...]
  lineCap?: Konva.LineConfig['lineCap'];
  lineJoin?: Konva.LineConfig['lineJoin'];
  closed?: boolean;
}

export type Shape = Rectangle | Ellipse | Line;
