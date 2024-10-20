import { useLayoutEffect, useRef } from 'react';
import {
  activeToolAtom,
  cursorAtom,
  stageHeightAtom,
  stageWidthAtom,
} from '@/stores/canvasStore';
import { useAtom, useAtomValue } from 'jotai';
import Konva from 'konva';
import { Grab, Hand } from 'lucide-react';
import { Layer, Rect, Stage } from 'react-konva';

import { Tool } from '@/types/konva';
import { useTools } from '@/hooks/tools/use-tools';
import { KonvaShapes } from '@/components/organisms/konva-shapes';
import { KonvaTransformer } from '@/components/organisms/konva-transformer';

import { AppCursor } from '../molecules/app-cursor';

export const KonvaCanvas = () => {
  const activeTool = useAtomValue(activeToolAtom);
  const [stageWidth, setStageWidth] = useAtom(stageWidthAtom);
  const [stageHeight, setStageHeight] = useAtom(stageHeightAtom);
  const [cursor, setCursor] = useAtom(cursorAtom);

  const constraintBoxRef = useRef<HTMLDivElement>(null);

  const previewLayerRef = useRef<Konva.Layer>(null);

  const { onMouseDown, onMouseMove, onMouseUp, onClick } =
    useTools(previewLayerRef);

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
      className="dark h-full grow bg-background"
      ref={constraintBoxRef}
    >
      <Stage
        id="konva-canvas"
        width={stageWidth}
        height={stageHeight}
        draggable={activeTool === Tool.HAND}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onClick={onClick}
        onDragStart={() => {
          setCursor({
            element: <Grab size={32} fill="white" />,
            x: 0,
            y: 0,
          });
        }}
        onDragEnd={() => {
          setCursor({
            element: <Hand size={32} fill="white" />,
            x: 0,
            y: 0,
          });
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
        <Layer id="shapes-layer">
          <KonvaShapes />
          <KonvaTransformer />
        </Layer>
        <Layer id="preview-layer" ref={previewLayerRef} listening={false} />
      </Stage>
      {cursor && <AppCursor icon={cursor.element} x={cursor.x} y={cursor.y} />}
    </div>
  );
};
