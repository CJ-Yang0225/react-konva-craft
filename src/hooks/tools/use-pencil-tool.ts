import { shapesAtom } from '@/stores/canvasStore';
import { useSetAtom } from 'jotai';
import Konva from 'konva';

import { Line, ShapeType } from '@/types/konva';

import { useBaseShapeConfig } from './use-base-shape-config';
import { BaseToolProps } from './use-tools';

export const usePencilTool = ({
  previewLayerRef,
  commonStatusRef,
  reset,
}: BaseToolProps) => {
  const setShapes = useSetAtom(shapesAtom);

  const createBaseShapeConfig = useBaseShapeConfig();

  const commonStatus = commonStatusRef.current;
  const previewLayer = previewLayerRef.current;

  const onMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();

    const position = stage?.getRelativePointerPosition();

    if (!position || !previewLayer) return;

    const konvaLine = new Konva.Line({
      ...createBaseShapeConfig(ShapeType.LINE),
      points: [position.x, position.y],
    });

    previewLayer.add(konvaLine);

    commonStatus.isMouseDown = true;
    commonStatus.konvaShape = konvaLine;
  };

  const onMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();

    const position = stage?.getRelativePointerPosition();

    if (!commonStatus.isMouseDown || !commonStatus.konvaShape || !position)
      return;

    const { points } = commonStatus.konvaShape.getAttrs() as Line;

    commonStatus.konvaShape?.setAttr(
      'points',
      points.concat([position.x, position.y])
    );
  };

  const onMouseUp = () => {
    if (!commonStatus.isMouseDown || !commonStatus.konvaShape) return;

    const shapeConfig = commonStatus.konvaShape.getAttrs() as Line;

    setShapes((prevShapes) => [...prevShapes, { ...shapeConfig }]);

    reset();
  };

  return {
    onMouseUp,
    onMouseMove,
    onMouseDown,
  };
};
