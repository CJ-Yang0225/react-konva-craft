import { useEffect, useRef } from 'react';
import { cursorAtom } from '@/stores/canvasStore';
import { useAtom } from 'jotai';
import { Hand, MousePointer2, Pencil, Plus } from 'lucide-react';

import { Tool } from '@/types/konva';

export const useToolCursor = (activeTool: Tool) => {
  const [cursor, setCursor] = useAtom(cursorAtom);
  const previousCursorRef = useRef<typeof cursor>();

  useEffect(() => {
    setCursor(getCursorByTool(activeTool));

    return () => {
      setCursor(undefined);
    };
  }, [activeTool, setCursor]);

  useEffect(() => {
    // 記錄每次變化的前一次 cursor
    return () => {
      previousCursorRef.current = cursor;
    };
  }, [cursor]);

  return previousCursorRef;
};

const getCursorByTool = (activeTool: Tool) => {
  switch (activeTool) {
    case Tool.HAND:
      return {
        element: <Hand size={32} fill="white" />,
        x: 16,
        y: 16,
      };
    case Tool.TRANSFORMER:
      return {
        element: <MousePointer2 size={32} fill="white" />,
        x: 4,
        y: 4,
      };
    case Tool.SHAPING_RECTANGLE:
    case Tool.SHAPING_ELLIPSE:
      return {
        element: <Plus size={36} />,
        x: 12,
        y: 12,
      };
    case Tool.PENCIL:
      return {
        element: <Pencil size={32} fill="white" />,
        x: 0,
        y: 32,
      };
  }
};
