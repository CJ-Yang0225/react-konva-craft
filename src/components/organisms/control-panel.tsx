import { activeToolAtom } from '@/stores/canvasStore';
import { useAtom } from 'jotai';

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
      className="nes-container flex h-full w-[280px] shrink-0 flex-col justify-between px-6"
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
      <div className="flex justify-end">
        <a
          className="nes-icon github is-large"
          href="https://github.com/CJ-Yang0225/react-konva-craft"
          target="_blank"
        ></a>
      </div>
    </div>
  );
};

const TOOL_BUTTONS: AppToolButtonProps[] = [
  {
    id: Tool.TRANSFORMER,
    icon: 'mouse-pointer-2',
    label: 'Transformer',
  },
  {
    id: Tool.PENCIL,
    icon: 'pencil',
    label: 'Pencil',
  },
  {
    id: Tool.SHAPING_RECTANGLE,
    icon: 'square',
    label: 'Rectangle',
    tools: [
      {
        id: Tool.SHAPING_RECTANGLE,
        icon: 'square',
        label: 'Rectangle',
      },
      {
        id: Tool.SHAPING_ELLIPSE,
        icon: 'circle',
        label: 'Ellipse',
      },
    ],
  },
];
