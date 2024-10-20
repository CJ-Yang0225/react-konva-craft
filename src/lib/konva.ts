import Konva from 'konva';

import { Coordinate } from '@/types/konva';

export const generateId = (prefix: 'shape' | 'group' = 'shape') => {
  return `${prefix}-${Date.now().toString()}-${performance.now().toFixed(3)}`;
};

type RectangleAreaProperties = {
  cx: number;
  cy: number;
  width: number;
  height: number;
};

export const getRectangleAreaProperties = (
  start: Coordinate,
  end: Coordinate
): RectangleAreaProperties => {
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);
  const cx = (start.x + end.x) / 2; // 中心點 x
  const cy = (start.y + end.y) / 2; // 中心點 y

  return { cx, cy, width, height };
};

export const getKonvaRectConfig = ({
  cx,
  cy,
  width,
  height,
}: RectangleAreaProperties): Partial<Konva.RectConfig> => ({
  x: cx - width / 2,
  y: cy - height / 2,
  width,
  height,
});

export const getKonvaEllipseConfig = ({
  cx,
  cy,
  width,
  height,
}: RectangleAreaProperties): Partial<Konva.EllipseConfig> => ({
  x: cx,
  y: cy,
  radiusX: width / 2,
  radiusY: height / 2,
});
