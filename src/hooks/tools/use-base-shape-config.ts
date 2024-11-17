import {
  DEFAULT_FILL_OPACITY,
  DEFAULT_SHAPING_TOOL_STROKE_WIDTH,
} from '@/constants/konva';
import { colorAtom, pencilThicknessAtom } from '@/stores/canvasStore';
import { useAtomValue } from 'jotai';
import Konva from 'konva';

import { Shape, ShapeType } from '@/types/konva';
import { generateId } from '@/lib/konva';

export const useBaseShapeConfig = () => {
  const color = useAtomValue(colorAtom);
  const pencilThickness = useAtomValue(pencilThicknessAtom);

  return <T extends ShapeType>(shapeType: T): Extract<Shape, { type: T }> => {
    const id = generateId();
    const rgb = Konva.Util.getRGB(color);

    const sharedConfig = {
      id,
      type: shapeType,
      draggable: false,
    } as Extract<Shape, { type: T }>;

    switch (shapeType) {
      case ShapeType.LINE:
        return {
          ...sharedConfig,
          stroke: color,
          strokeWidth: pencilThickness,
          lineCap: 'round',
          lineJoin: 'round',
          closed: false,
        };
      case ShapeType.RECTANGLE:
      case ShapeType.ELLIPSE:
        return {
          ...sharedConfig,
          fill: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${DEFAULT_FILL_OPACITY})`,
          stroke: color,
          strokeWidth: DEFAULT_SHAPING_TOOL_STROKE_WIDTH,
        };
      default:
        return sharedConfig;
    }
  };
};
