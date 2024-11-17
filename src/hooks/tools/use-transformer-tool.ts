import {
  selectedShapesMapAtom,
  selectMultipleShapes,
  selectShape,
  unselectShape,
} from '@/stores/canvasStore';
import { useAtom } from 'jotai';
import Konva from 'konva';

import { getKonvaRectConfig, getRectangleAreaProperties } from '@/lib/konva';

import { BaseToolProps } from './use-tools';

export const useTransformerTool = ({
  shapeLayerRef,
  previewLayerRef,
  commonStatusRef,
  reset,
}: BaseToolProps) => {
  // 已選取的圖形 map 的 atom 與 setAtom
  const [selectedShapeMap, setSelectedShapeMap] = useAtom(
    selectedShapesMapAtom
  );

  const commonStatus = commonStatusRef.current; // 共用狀態
  const previewLayer = previewLayerRef.current; // 預覽圖層
  const shapeLayer = shapeLayerRef.current; // shapes 圖層

  // 處理滑鼠按下事件，開始繪製
  const onMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();

    const position = stage?.getRelativePointerPosition(); // 取得滑鼠相對位置

    if (!position || !previewLayer || selectedShapeMap.size > 0) return;

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

    // 儲存到 ref 中
    commonStatus.konvaShape = new Konva.Rect({
      ...position,
      fill: 'rgba(0, 161, 255, 0.3)',
      width: 0,
      height: 0,
    });
    previewLayer.add(commonStatus.konvaShape);
  };

  // 處理滑鼠移動事件，更新多選框矩形屬性
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
  };

  // 處理滑鼠放開事件，判定多選目標
  const onMouseUp = () => {
    if (!commonStatus.isMouseDown || !commonStatus.konvaShape) return;

    const selectionRectBoundingBox = commonStatus.konvaShape?.getClientRect();

    // 與選取框相交的 shape ids
    const intersectedShapeIds =
      shapeLayer?.find('.shape')?.reduce<string[]>((ids, shape) => {
        const shapeBoundingBox = shape.getClientRect();

        // 如果選取框與 shape 相交，則將 shape 加入到 selectedShapes 中
        if (
          selectionRectBoundingBox &&
          Konva.Util.haveIntersection(
            selectionRectBoundingBox,
            shapeBoundingBox
          )
        ) {
          ids.push(shape.id());
        }

        return ids;
      }, []) || [];

    selectMultipleShapes(intersectedShapeIds);

    reset();
  };

  // 處理點擊事件，用來選取或取消選取圖形
  const onClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const target = e.target; // 點擊到的目標
    const stage = e.target.getStage();

    // 如果點擊到的目標是 Stage，就取消所有已選取的 shape(s)
    if (target === stage) {
      setSelectedShapeMap((prevSelectedShapeMap) => {
        if (prevSelectedShapeMap.size === 0) return prevSelectedShapeMap; // 減少不必要的 re-render
        return new Map();
      });
      return;
    }

    // 檢查是否按下 Ctrl, Meta 或 Shift 鍵，判定是否多選模式
    const isCtrlOrMetaKeyPressed = e.evt.ctrlKey || e.evt.metaKey;
    const isShiftKeyPressed = e.evt.shiftKey;
    const isMultiSelectMode = isCtrlOrMetaKeyPressed || isShiftKeyPressed;

    // 如果是 Transformer 填充的 shape（shouldOverdrawWholeArea 啟用）
    const isTransformerFilledShape = target.getAttr('name') === 'back';

    let id: string | undefined;

    if (isTransformerFilledShape) {
      const position = stage?.getRelativePointerPosition();

      if (position) {
        id = shapeLayer
          ?.find('.shape')
          ?.find((shape) => {
            const shapeBoundingBox = shape.getClientRect();

            return Konva.Util.haveIntersection(shapeBoundingBox, {
              x: position.x,
              y: position.y,
              width: 0,
              height: 0,
            });
          })
          ?.id();
      }
    } else {
      id = target.id();
    }

    if (!id) return;

    // 已經被選取且按住 Ctrl 或 Meta 鍵，就取消選取
    if (selectedShapeMap.has(id)) {
      if (isMultiSelectMode) {
        unselectShape(id); // 取消選取
      }
    } else {
      selectShape(id, isMultiSelectMode); // 選取圖形，若處於多選模式則不清除之前的選取
    }
  };

  // 返回事件處理函式
  return {
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onClick,
  };
};
