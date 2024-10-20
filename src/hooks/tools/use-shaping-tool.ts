import { SHAPING_TOOL_MINIMUM_SIZE } from '@/constants/konva';
import { activeToolAtom, selectShape, shapesAtom } from '@/stores/canvasStore';
import { useAtomValue, useSetAtom } from 'jotai';
import Konva from 'konva';

import { Ellipse, Rectangle, ShapeType, Tool } from '@/types/konva';
import {
  getKonvaEllipseConfig,
  getKonvaRectConfig,
  getRectangleAreaProperties,
} from '@/lib/konva';

import { useBaseShapeConfig } from './use-base-shape-config';
import { BaseToolProps } from './use-tools';

export const useShapingTool = ({
  previewLayerRef,
  commonStatusRef,
  reset,
}: BaseToolProps) => {
  const activeTool = useAtomValue(activeToolAtom);
  const setShapes = useSetAtom(shapesAtom);

  const createBaseShapeConfig = useBaseShapeConfig();

  const commonStatus = commonStatusRef.current;
  const previewLayer = previewLayerRef.current;

  const onMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();

    const position = stage?.getRelativePointerPosition();

    if (!position || !previewLayer) return;

    commonStatus.mouseInfo = {
      x1: position.x,
      y1: position.y,
      x2: position.x,
      y2: position.y,
      cx: position.x,
      cy: position.y,
      width: 0,
      height: 0,
    };

    commonStatus.isMouseDown = true;

    switch (activeTool) {
      case Tool.SHAPING_RECTANGLE:
        commonStatus.konvaShape = new Konva.Rect({
          ...position,
          ...createBaseShapeConfig(ShapeType.RECTANGLE),
          width: 0,
          height: 0,
        });
        previewLayer.add(commonStatus.konvaShape);
        break;

      case Tool.SHAPING_ELLIPSE:
        commonStatus.konvaShape = new Konva.Ellipse({
          ...position,
          ...createBaseShapeConfig(ShapeType.ELLIPSE),
          radiusX: 0,
          radiusY: 0,
        });
        previewLayer.add(commonStatus.konvaShape);
        break;
    }
  };

  const onMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();

    const position = stage?.getRelativePointerPosition();

    if (!commonStatus.isMouseDown || !commonStatus.konvaShape || !position)
      return;

    const { x1, y1 } = commonStatus.mouseInfo;

    const { cx, cy, width, height } = getRectangleAreaProperties(
      { x: x1, y: y1 },
      { x: position.x, y: position.y }
    );

    switch (activeTool) {
      case Tool.SHAPING_RECTANGLE:
        Object.assign(commonStatus.mouseInfo, {
          x2: position.x,
          y2: position.y,
          cx,
          cy,
          width,
          height,
        });

        commonStatus.konvaShape?.setAttrs(
          getKonvaRectConfig({ cx, cy, width, height })
        );
        break;

      case Tool.SHAPING_ELLIPSE:
        Object.assign(commonStatus.mouseInfo, {
          x2: position.x,
          y2: position.y,
          cx,
          cy,
          width,
          height,
        });

        commonStatus.konvaShape?.setAttrs(
          getKonvaEllipseConfig({ cx, cy, width, height })
        );
        break;
    }
  };

  const onMouseUp = () => {
    if (!commonStatus.isMouseDown || !commonStatus.konvaShape) return;

    const shapeConfig = commonStatus.konvaShape.getAttrs() as
      | Rectangle
      | Ellipse;

    const { width, height } = commonStatus.mouseInfo;

    // 如果尺寸小於限制的最小尺寸，則不加入到 shapes 中
    if (
      width < SHAPING_TOOL_MINIMUM_SIZE ||
      height < SHAPING_TOOL_MINIMUM_SIZE
    ) {
      reset();
      return;
    }

    setShapes((prevShapes) => [...prevShapes, { ...shapeConfig }]);

    selectShape(shapeConfig.id);

    reset();
  };

  return {
    onMouseDown,
    onMouseMove,
    onMouseUp,
  };
};
