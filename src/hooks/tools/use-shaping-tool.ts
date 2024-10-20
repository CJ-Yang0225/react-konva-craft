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
  const activeTool = useAtomValue(activeToolAtom); // 目前選中的工具
  const setShapes = useSetAtom(shapesAtom); // 用於更新形狀列表

  // 快速取得工具的基本形狀設定（id、類型、顏色、邊寬、透明度等等）
  const createBaseShapeConfig = useBaseShapeConfig();

  const commonStatus = commonStatusRef.current; // 共用狀態
  const previewLayer = previewLayerRef.current; // 預覽圖層

  // 處理滑鼠按下事件，開始繪製
  const onMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();

    const position = stage?.getRelativePointerPosition();

    if (!position || !previewLayer) return;

    commonStatus.mouseInfo = {
      x1: position.x, // 起始點 X 座標
      y1: position.y, // 起始點 Y 座標
      x2: position.x,
      y2: position.y,
      cx: position.x,
      cy: position.y,
      width: 0,
      height: 0,
    };

    // 更新相關狀態
    commonStatus.isMouseDown = true;

    // 根據選中的工具生成 Konva Rect 或 Ellipse 物件
    switch (activeTool) {
      case Tool.SHAPING_RECTANGLE:
        // 儲存到 ref 中
        commonStatus.konvaShape = new Konva.Rect({
          ...position,
          ...createBaseShapeConfig(ShapeType.RECTANGLE),
          width: 0,
          height: 0,
        });
        previewLayer.add(commonStatus.konvaShape);
        break;

      case Tool.SHAPING_ELLIPSE:
        // 儲存到 ref 中
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

  // 處理滑鼠移動事件，更新形狀屬性
  const onMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();

    const position = stage?.getRelativePointerPosition();

    if (!commonStatus.isMouseDown || !commonStatus.konvaShape || !position)
      return;

    const { x1, y1 } = commonStatus.mouseInfo;

    // Utility function 計算兩點圍成的矩形之屬性
    const { cx, cy, width, height } = getRectangleAreaProperties(
      { x: x1, y: y1 },
      { x: position.x, y: position.y }
    );

    // 根據工具更新矩形或橢圓形的屬性
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
          // Utility function 取得 Konva RectConfig
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
          // Utility function 取得 Konva EllipseConfig
          getKonvaEllipseConfig({ cx, cy, width, height })
        );
        break;
    }
  };

  // 處理滑鼠放開事件，結束繪製
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
      reset(); // 重設工具相關狀態與清空 previewLayer
      return;
    }

    // 真正將繪製的線段儲存到 shapes atom 中
    setShapes((prevShapes) => [...prevShapes, { ...shapeConfig }]);

    // 預設選取建立完的，方便使用者直接調整
    selectShape(shapeConfig.id);

    // 重設工具相關狀態與清空 previewLayer
    reset();
  };

  // 返回事件處理函式
  return {
    onMouseDown,
    onMouseMove,
    onMouseUp,
  };
};
