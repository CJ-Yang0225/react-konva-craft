import 'lucide-react';

import React, { FC, useEffect, useRef } from 'react';

import { encodeSvg } from '@/lib/utils';

export interface AppCursorProps {
  icon: React.ReactElement;
  x?: number;
  y?: number;
  fallbackCursor?: CursorType;
  important?: boolean;
}

export const AppCursor: FC<AppCursorProps> = ({
  icon,
  x,
  y,
  fallbackCursor = 'auto',
  important = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!icon) return;

    const divElement = ref.current;

    if (!divElement) return;

    const parentElement = divElement.parentElement;

    if (!parentElement) return;

    // 1. 創建 Lucide React 元件的 SVG
    const svgComponent = icon;

    // 2. 將 SVG 元素轉換為 Base64 字串
    const svgBase64 = encodeSvg(svgComponent);

    // 3. 將 SVG 元素設置到 parentElement 的 style cursor 中
    parentElement.style.setProperty(
      'cursor',
      `url(${svgBase64}) ${x || y ? `${x} ${y}` : ''}, ${fallbackCursor}`,
      important ? 'important' : ''
    );

    return () => {
      parentElement.style.removeProperty('cursor');
    };
  }, [fallbackCursor, icon, important, x, y]);

  return <div ref={ref} />;
};

export type CursorType =
  | 'auto'
  | 'default'
  | 'none'
  | 'context-menu'
  | 'help'
  | 'pointer'
  | 'progress'
  | 'wait'
  | 'cell'
  | 'crosshair'
  | 'text'
  | 'vertical-text'
  | 'alias'
  | 'copy'
  | 'move'
  | 'no-drop'
  | 'not-allowed'
  | 'grab'
  | 'grabbing'
  | 'all-scroll'
  | 'col-resize'
  | 'row-resize'
  | 'n-resize'
  | 'e-resize'
  | 's-resize'
  | 'w-resize'
  | 'ne-resize'
  | 'nw-resize'
  | 'se-resize'
  | 'sw-resize'
  | 'ew-resize'
  | 'ns-resize'
  | 'nesw-resize'
  | 'nwse-resize'
  | 'zoom-in'
  | 'zoom-out'
  | `url(${string})`;
