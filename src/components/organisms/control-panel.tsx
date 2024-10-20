import { activeToolAtom } from '@/stores/canvasStore';
import { useAtom } from 'jotai';
import { MousePointer2, Pencil, Plus } from 'lucide-react';

import { Tool } from '@/types/konva';
import {
  AppToolButton,
  AppToolButtonProps,
} from '@/components/molecules/app-tool-button';

export const ControlPanel = () => {
  const [activeTool, setActiveTool] = useAtom(activeToolAtom);

  return (
    <div
      id="control-panel"
      className="nes-container h-full w-[280px] shrink-0 px-6"
    >
      <div className="grid grid-cols-3 gap-x-0.5">
        {TOOL_BUTTONS.map((props) => {
          const isActive =
            props.id === activeTool ||
            props.tools?.some(({ id }) => id === activeTool);

          return (
            <AppToolButton
              key={props.id}
              {...props}
              onClick={(newTool) => {
                // 切換 tool 的 active 狀態
                if (newTool !== activeTool) {
                  setActiveTool(newTool);
                } else {
                  setActiveTool(Tool.HAND); // 回到手型工具
                }
              }}
              onToolChange={(newTool) => {
                setActiveTool(newTool);
              }}
              active={isActive}
            />
          );
        })}
      </div>
    </div>
  );
};

const TOOL_BUTTONS: AppToolButtonProps[] = [
  {
    id: Tool.TRANSFORMER,
    icon: 'mouse-pointer-2',
    label: 'Transformer',
    cursor: {
      element: <MousePointer2 size={32} fill="white" />,
      x: 4,
      y: 4,
    },
  },
  {
    id: Tool.PENCIL,
    icon: 'pencil',
    label: 'Pencil',
    cursor: {
      element: <Pencil size={32} fill="white" />,
      x: 0,
      y: 32,
    },
  },
  {
    id: Tool.SHAPING_RECTANGLE,
    icon: 'square',
    label: 'Rectangle',
    cursor: {
      element: <Plus size={36} />,
      x: 12,
      y: 12,
    },
    tools: [
      {
        id: Tool.SHAPING_RECTANGLE,
        icon: 'square',
        label: 'Rectangle',
        cursor: {
          element: <Plus size={36} />,
          x: 12,
          y: 12,
        },
      },
      {
        id: Tool.SHAPING_ELLIPSE,
        icon: 'circle',
        label: 'Ellipse',
        cursor: {
          element: <Plus size={36} />,
          x: 12,
          y: 12,
        },
      },
    ],
  },
];
