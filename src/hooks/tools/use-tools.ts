import { useCallback, useEffect, useRef } from 'react';
import { activeToolAtom, selectedShapesMapAtom } from '@/stores/canvasStore';
import { useAtom, useAtomValue } from 'jotai';
import Konva from 'konva';

import { Tool } from '@/types/konva';

import { usePencilTool } from './use-pencil-tool';
import { useShapingTool } from './use-shaping-tool';
import { useTransformerTool } from './use-transformer-tool';

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

export type CommonStatus = {
  isMouseDown: boolean;
  konvaShape: Konva.Shape | null;
  mouseInfo: MouseInfo;
};

const getDefaultCommonStatus = (): CommonStatus => ({
  isMouseDown: false,
  konvaShape: null,
  mouseInfo: {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    cx: 0,
    cy: 0,
    width: 0,
    height: 0,
  },
});

export type SharedArgs = [React.RefObject<Konva.Layer>, CommonStatus];

export type BaseToolProps = {
  shapeLayerRef: React.RefObject<Konva.Layer>;
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
  shapeLayerRef: React.RefObject<Konva.Layer>,
  previewLayerRef: React.RefObject<Konva.Layer>
): UseToolsReturnValue => {
  const [activeTool, setActiveTool] = useAtom(activeToolAtom); // 目前選中的工具
  const selectedShapesMap = useAtomValue(selectedShapesMapAtom); // 被選取的圖形 map
  const previousActiveToolRef = useRef<Tool | null>(null);

  const commonStatusRef = useRef<CommonStatus>(getDefaultCommonStatus());

  // 重設工具相關狀態與清空 previewLayer
  const reset = useCallback(() => {
    commonStatusRef.current = getDefaultCommonStatus();

    previewLayerRef.current?.destroyChildren();
  }, [previewLayerRef]);

  const baseToolProps = {
    shapeLayerRef, // shapes 圖層
    previewLayerRef, // 預覽圖層
    commonStatusRef, // 共用狀態
    reset, // 重設函式
  };

  // 工具的事件處理函式（onMouseDown、onMouseMove、onMouseUp、onClick）
  const pencilToolHandlers = usePencilTool(baseToolProps);
  const shapingToolHandlers = useShapingTool(baseToolProps);
  const transformerToolHandlers = useTransformerTool(baseToolProps);

  // 切換工具時，重置狀態、預覽層
  useEffect(() => {
    if (activeTool === Tool.HAND) return;

    reset();
  }, [activeTool, reset]);

  // 按下空白鍵時，切換成拖曳 Stage 模式，並在返回時回到上一次所選工具
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      if (e.key === ' ') {
        e.preventDefault();

        setActiveTool(Tool.HAND);
        if (activeTool !== Tool.HAND) {
          previousActiveToolRef.current = activeTool;
          return Tool.HAND;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();

        setActiveTool(previousActiveToolRef.current || Tool.HAND);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeTool, setActiveTool]);

  // 根據選中的工具取得對應的事件處理函式
  const getHandlersByTool = (): UseToolsReturnValue => {
    switch (activeTool) {
      case Tool.TRANSFORMER:
        return transformerToolHandlers;
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

  /**
   * 滑鼠按下時的預設邏輯
   */
  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const target = e.target;
    const stage = e.target.getStage();

    // 是否是 Transformer 填充的 shape（shouldOverdrawWholeArea 啟用）
    const isTransformerFilledShape = target.getAttr('name') === 'back';

    // 如果點擊 Transformer 填充的 shape 或非 Stage 上而且目標為被選取狀態，忽略工具預設功能，啟用 Shape 的 draggable 功能
    if (
      isTransformerFilledShape ||
      (target !== stage && selectedShapesMap.has(target.id()))
    )
      return;

    onMouseDown?.(e);
  };

  return {
    onMouseDown: handleMouseDown,
    onMouseMove,
    onMouseUp,
    onClick,
  };
};

const DEFAULT_HANDLERS: UseToolsReturnValue = {
  onMouseDown: () => {},
  onMouseMove: () => {},
  onMouseUp: () => {},
  onClick: () => {},
};
