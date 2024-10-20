import { useCallback, useEffect, useRef } from 'react';
import { activeToolAtom, selectedShapesMapAtom } from '@/stores/canvasStore';
import { useAtomValue } from 'jotai';
import Konva from 'konva';

import { Tool } from '@/types/konva';

import { usePencilTool } from './use-pencil-tool';
import { useShapingTool } from './use-shaping-tool';
import { useTransformer } from './use-transformer';

type MouseInfo = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cx: number;
  cy: number;
  width: number;
  height: number;
};

const DEFAULT_MOUSE_INFO: MouseInfo = {
  x1: 0,
  y1: 0,
  x2: 0,
  y2: 0,
  cx: 0,
  cy: 0,
  width: 0,
  height: 0,
};

export type CommonStatus = {
  isMouseDown: boolean;
  konvaShape: Konva.Shape | null;
  mouseInfo: MouseInfo;
};

const DEFAULT_COMMON_STATUS: CommonStatus = {
  isMouseDown: false,
  konvaShape: null,
  mouseInfo: DEFAULT_MOUSE_INFO,
};

export type SharedArgs = [React.RefObject<Konva.Layer>, CommonStatus];

export type BaseToolProps = {
  previewLayerRef: React.RefObject<Konva.Layer>;
  commonStatusRef: React.MutableRefObject<CommonStatus>;
  reset: () => void;
};

export type UseToolsReturnValue = {
  onMouseDown?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseMove?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseUp?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onClick?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
};

export const useTools = (
  previewLayerRef: React.RefObject<Konva.Layer>
): UseToolsReturnValue => {
  const activeTool = useAtomValue(activeToolAtom);
  const selectedShapesMap = useAtomValue(selectedShapesMapAtom);
  // const setShapes = useSetAtom(shapesAtom);
  // const pencilThickness = useAtomValue(pencilThicknessAtom);
  // const color = useAtomValue(colorAtom);

  // const _rgb = Konva.Util.getRGB(color);

  const commonStatusRef = useRef<CommonStatus>(DEFAULT_COMMON_STATUS);

  // const commonStatus = commonStatusRef.current;

  const reset = useCallback(() => {
    commonStatusRef.current = { ...DEFAULT_COMMON_STATUS };

    previewLayerRef.current?.destroyChildren();
    previewLayerRef.current?.clear();
  }, [previewLayerRef]);

  const baseToolProps = {
    previewLayerRef,
    commonStatusRef,
    reset,
  };

  const pencilToolHandlers = usePencilTool(baseToolProps);
  const shapingToolHandlers = useShapingTool(baseToolProps);
  const transformerHandlers = useTransformer(baseToolProps);

  // 切換工具時，重置狀態、預覽層
  useEffect(() => {
    reset();
  }, [activeTool, reset]);

  const getHandlersByTool = (): UseToolsReturnValue => {
    switch (activeTool) {
      case Tool.TRANSFORMER:
        return transformerHandlers;
      case Tool.PENCIL:
        return pencilToolHandlers;
      case Tool.SHAPING_RECTANGLE:
      case Tool.SHAPING_ELLIPSE:
        return shapingToolHandlers;
      default:
        return DEFAULT_HANDLERS;
    }
  };

  const { onMouseDown, onMouseMove, onMouseUp, onClick } = getHandlersByTool();

  const onRegularMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const target = e.target;
    const stage = e.target.getStage();

    // 如果點擊非 Stage 上而且目標為被選取狀態，忽略工具預設功能，啟用 Shape 的 draggable 功能
    if (target !== stage && selectedShapesMap.has(target.id())) return;

    onMouseDown?.(e);
  };

  const onRegularMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    onMouseMove?.(e);
  };

  const onRegularMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    onMouseUp?.(e);
  };

  const onRegularClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    onClick?.(e);
  };

  return {
    onMouseDown: onRegularMouseDown,
    onMouseMove: onRegularMouseMove,
    onMouseUp: onRegularMouseUp,
    onClick: onRegularClick,
  };
};

const DEFAULT_HANDLERS: UseToolsReturnValue = {
  onMouseDown: () => {},
  onMouseMove: () => {},
  onMouseUp: () => {},
  onClick: () => {},
};
