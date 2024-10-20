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
  const setShapes = useSetAtom(shapesAtom); // 用於更新形狀列表

  // 快速取得工具的基本形狀設定（id、類型、顏色、邊寬、透明度等等）
  const createBaseShapeConfig = useBaseShapeConfig();

  const commonStatus = commonStatusRef.current; // 共用狀態
  const previewLayer = previewLayerRef.current; // 預覽圖層

  // 處理滑鼠按下事件，開始繪製
  const onMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();

    const position = stage?.getRelativePointerPosition(); // 取得滑鼠相對位置

    if (!position || !previewLayer) return;

    // 初始化 Konva Line 物件
    const konvaLine = new Konva.Line({
      ...createBaseShapeConfig(ShapeType.LINE),
      points: [position.x, position.y], // 建立初始點
    });

    // 將 Konva Line 物件新增至 previewLayer
    previewLayer.add(konvaLine);

    // 更新相關狀態
    commonStatus.isMouseDown = true;

    // 儲存到 ref 中
    commonStatus.konvaShape = konvaLine;
  };

  // 處理滑鼠移動事件，更新線段
  const onMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();

    const position = stage?.getRelativePointerPosition();

    if (!commonStatus.isMouseDown || !commonStatus.konvaShape || !position)
      return;

    const { points } = commonStatus.konvaShape.getAttrs() as Line;

    // 更新每次移動的點位
    commonStatus.konvaShape?.setAttr(
      'points',
      points.concat([position.x, position.y])
    );
  };

  // 處理滑鼠放開事件，結束繪製
  const onMouseUp = () => {
    if (!commonStatus.isMouseDown || !commonStatus.konvaShape) return;

    const shapeConfig = commonStatus.konvaShape.getAttrs() as Line;

    // 真正將繪製的線段儲存到 shapes atom 中
    setShapes((prevShapes) => [...prevShapes, { ...shapeConfig }]);

    // 重設工具相關狀態與清空 previewLayer
    reset();
  };

  // 返回事件處理函式
  return {
    onMouseUp,
    onMouseMove,
    onMouseDown,
  };
};
