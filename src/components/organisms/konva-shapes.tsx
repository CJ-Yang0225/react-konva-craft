import React from 'react';
import { selectedShapesMapAtom, shapesAtom } from '@/stores/canvasStore';
import { useAtom, useAtomValue } from 'jotai';
import Konva from 'konva';
import { Ellipse, KonvaNodeEvents, Line, Rect } from 'react-konva';

import { Shape, ShapeType } from '@/types/konva';

export const KonvaShapes = React.memo(() => {
  const [shapes, setShapes] = useAtom(shapesAtom);
  const selectedShapesMap = useAtomValue(selectedShapesMapAtom);

  const onDragEnd = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const target = e.target;

    const shapeConfig = target.getAttrs() as Shape;

    const { id } = shapeConfig;

    /**
     * 注意：線段類型的 x, y 代表偏移量，非座標
     *
     * points 是由 x1, y1, x2, y2 組成的陣列，每個點加上偏移量才是實際的座標
     */
    setShapes((prevShapes) =>
      prevShapes.map((shape) =>
        shape.id === id ? { ...shape, ...shapeConfig } : shape
      )
    );
  };

  const renderShapes = () => {
    return shapes.map((shape) => {
      const baseConfig: Konva.ShapeConfig | KonvaNodeEvents = {
        name: 'shape',
        draggable: selectedShapesMap.has(shape.id),
        onDragEnd,
      };
      switch (shape.type) {
        case ShapeType.LINE:
          return <Line key={shape.id} {...baseConfig} {...shape} />;
        case ShapeType.RECTANGLE:
          return <Rect key={shape.id} {...baseConfig} {...shape} />;
        case ShapeType.ELLIPSE:
          return <Ellipse key={shape.id} {...baseConfig} {...shape} />;
        default:
          return null;
      }
    });
  };

  return <>{renderShapes()}</>;
});
