import {
  selectedShapesMapAtom,
  selectShape,
  unselectShape,
} from '@/stores/canvasStore';
import { useAtom } from 'jotai';
import Konva from 'konva';

import { BaseToolProps } from './use-tools';

export const useTransformer = ({
  previewLayerRef: _previewLayerRef,
  commonStatusRef: _commonStatusRef,
  reset: _reset,
}: BaseToolProps) => {
  const [selectedShapeMap, setSelectedShapeMap] = useAtom(
    selectedShapesMapAtom
  );

  // const onMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {};

  // const onMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {};

  // const onMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {};

  const onClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const target = e.target;
    const stage = e.target.getStage();

    // 如果點擊到的目標是 Stage，就取消所有已選取的 shape(s)
    if (target === stage) {
      setSelectedShapeMap((prevSelectedShapeMap) => {
        if (prevSelectedShapeMap.size === 0) return prevSelectedShapeMap; // 減少不必要的 re-render
        return new Map();
      });
      return;
    }

    const isCtrlOrMetaKeyPressed = e.evt.ctrlKey || e.evt.metaKey;
    const isShiftKeyPressed = e.evt.shiftKey;
    const isMultiSelectMode = isCtrlOrMetaKeyPressed || isShiftKeyPressed;

    const id = target.id();

    // 已經被選取且按住 Ctrl 或 Meta 鍵，就取消選取
    if (selectedShapeMap.has(id)) {
      if (isMultiSelectMode) {
        unselectShape(id);
      }
    } else {
      selectShape(id, isMultiSelectMode);
    }
  };

  return {
    // onMouseDown,
    // onMouseMove,
    // onMouseUp,
    onClick,
  };
};
