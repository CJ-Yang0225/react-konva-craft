import { useLayoutEffect, useRef } from 'react';
import {
  activeToolAtom,
  cursorAtom,
  stageHeightAtom,
  stageWidthAtom,
} from '@/stores/canvasStore';
import { useAtom, useAtomValue } from 'jotai';
import Konva from 'konva';
import { Grab } from 'lucide-react';
import { Layer, Rect, Stage } from 'react-konva';

import { Tool } from '@/types/konva';
import { useToolCursor } from '@/hooks/tools/use-tool-cursor';
import { useTools } from '@/hooks/tools/use-tools';
import { AppCursor } from '@/components/molecules/app-cursor';
import { KonvaShapes } from '@/components/organisms/konva-shapes';
import { KonvaTransformer } from '@/components/organisms/konva-transformer';

export const KonvaCanvas = () => {
  const activeTool = useAtomValue(activeToolAtom);
  const [stageWidth, setStageWidth] = useAtom(stageWidthAtom);
  const [stageHeight, setStageHeight] = useAtom(stageHeightAtom);
  const [cursor, setCursor] = useAtom(cursorAtom);

  const constraintBoxRef = useRef<HTMLDivElement>(null);

  const shapeLayerRef = useRef<Konva.Layer>(null);
  const previewLayerRef = useRef<Konva.Layer>(null);

  const { onMouseDown, onMouseMove, onMouseUp, onClick } = useTools(
    shapeLayerRef,
    previewLayerRef
  );

  const previousCursorRef = useToolCursor(activeTool);

  /**
   * 根據容器調整畫布（Stage）大小
   */
  useLayoutEffect(() => {
    const constraintBox = constraintBoxRef.current;

    const resizeObserver = new ResizeObserver((entries) => {
      const [targetElement] = entries;

      const { width: constraintBoxWidth, height: constraintBoxHeight } =
        targetElement.contentRect;

      setStageWidth(constraintBoxWidth);
      setStageHeight(constraintBoxHeight);
    });

    if (constraintBox) {
      resizeObserver.observe(constraintBox);
    }

    if (!constraintBox) return;

    return () => {
      resizeObserver.disconnect();
    };
  }, [setStageHeight, setStageWidth]);

  return (
    <div
      id="konva-canvas-constraint-box"
      className="dark h-full grow bg-[#3a3a3a]"
      ref={constraintBoxRef}
    >
      <Stage
        id="konva-canvas"
        width={stageWidth}
        height={stageHeight}
        draggable={activeTool === Tool.HAND}
        listening={activeTool !== Tool.HAND}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onClick={onClick}
        onDragStart={() => {
          setCursor({
            element: <Grab size={32} fill="white" />,
            x: 16,
            y: 16,
          });
        }}
        onDragEnd={() => {
          setCursor(previousCursorRef.current);
        }}
      >
        <Layer id="background-layer">
          {/* 背景圖 */}
          <Rect
            x={0}
            y={0}
            width={stageWidth}
            height={stageHeight}
            fill="#fbfbfb"
            listening={false}
          />
        </Layer>
        <Layer id="shapes-layer" ref={shapeLayerRef}>
          <KonvaShapes />
          <KonvaTransformer />
        </Layer>
        <Layer id="preview-layer" ref={previewLayerRef} listening={false} />
      </Stage>
      {cursor && <AppCursor icon={cursor.element} x={cursor.x} y={cursor.y} />}
    </div>
  );
};
