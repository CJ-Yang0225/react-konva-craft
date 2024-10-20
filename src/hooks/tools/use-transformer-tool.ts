import {
  selectedShapesMapAtom,
  selectShape,
  unselectShape,
} from '@/stores/canvasStore';
import { useAtom } from 'jotai';
import Konva from 'konva';

import { BaseToolProps } from './use-tools';

export const useTransformerTool = ({
  previewLayerRef: _previewLayerRef,
  commonStatusRef: _commonStatusRef,
  reset: _reset,
}: BaseToolProps) => {
  // 已選取的圖形 map 的 atom 與 setAtom
  const [selectedShapeMap, setSelectedShapeMap] = useAtom(
    selectedShapesMapAtom
  );

  /* TODO: 預留給選取框多選的功能 */
  // const onMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {};

  // const onMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {};

  // const onMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {};

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

    const id = target.id(); // 取得點擊圖形的 ID

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
    // onMouseDown,
    // onMouseMove,
    // onMouseUp,
    onClick,
  };
};
