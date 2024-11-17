import { FC, useEffect, useState } from 'react';
import { PopoverContentProps } from '@radix-ui/react-popover';

import { Tool } from '@/types/konva';
import { cn } from '@/lib/utils';
import { Icon, IconProps } from '@/components/ui/icon';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export type ToolState = Pick<
  AppToolButtonProps,
  'id' | 'icon' | 'label' | 'disabled'
>;

export interface AppToolButtonProps {
  id: Tool;
  icon: IconProps['name'];
  tools?: Omit<AppToolButtonProps, 'tools'>[];
  label?: string;
  className?: string;
  disabled?: boolean;
  active?: boolean;
  onClick?: (newTool: Tool) => void;
  onToolChange?: (newTool: Tool) => void;
  expanded?: boolean;
  popoverContentProps?: PopoverContentProps;
}

export const AppToolButton: FC<AppToolButtonProps> = ({
  id,
  icon,
  label,
  tools,
  className,
  active,
  disabled = false,
  onClick,
  onToolChange,
  expanded = false,
  popoverContentProps,
}) => {
  const [state, setState] = useState<ToolState>({
    id,
    icon,
    label,
    disabled,
  });

  const isExpandable = tools && tools.length > 0;

  /**
   * `state.disabled` 可由外部控制
   */
  useEffect(() => {
    setState((prevState) =>
      prevState.disabled !== disabled
        ? {
            ...prevState,
            disabled,
          }
        : prevState
    );
  }, [disabled]);

  return (
    <Popover defaultOpen={expanded}>
      <PopoverTrigger asChild>
        <button
          data-tool-id={state.id}
          className={cn(
            'nes-btn group relative flex h-[52px] w-16 items-center justify-center',
            {
              'is-disabled': state.disabled,
              'is-primary': active,
            },
            className
          )}
          disabled={disabled}
          onClick={() => {
            if (isExpandable) return;
            onClick?.(state.id);
          }}
        >
          <Icon
            className="-ml-1 -mt-1"
            name={state.icon}
            strokeWidth={active ? 3.5 : 3}
            size={32}
          />
          {isExpandable && (
            <Icon
              className="absolute -bottom-0.5 -right-0.5 transition-transform group-hover:translate-y-0.5"
              name="chevron-down"
              strokeWidth={3}
              size={16}
            />
          )}
        </button>
      </PopoverTrigger>
      {isExpandable && (
        <PopoverContent
          side="bottom"
          sideOffset={16}
          align="center"
          {...popoverContentProps}
          className={cn(
            'w-60 rounded-lg p-0 shadow-[0px_0px_20px_0px_rgba(0,0,0,0.1)]',
            popoverContentProps?.className
          )}
          collisionBoundary={collisionBoundary}
          collisionPadding={collisionPadding}
          asChild
        >
          <div className="nes-container is-rounded flex w-20 flex-col items-stretch gap-y-3">
            {tools?.map(({ icon, id, disabled, label }) => {
              const checked = active && state.id === id;

              return (
                <label
                  key={id}
                  className="mb-0 flex w-full select-none items-center"
                >
                  <input
                    id={id}
                    className="nes-radio"
                    data-tool-id={id}
                    type="radio"
                    name="tool-group"
                    disabled={disabled}
                    checked={checked}
                    onChange={() => {
                      setState((prevState) => ({
                        ...prevState,
                        id,
                        icon,
                      }));
                      onToolChange?.(id);
                    }}
                  />
                  <span className="flex grow items-center gap-x-1.5 text-xl font-bold before:!top-1.5">
                    <Icon name={icon} size={30} strokeWidth={2.5} />
                    {label}
                  </span>
                </label>
              );
            })}
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
};

const collisionBoundary: PopoverContentProps['collisionBoundary'] = [
  document.getElementById('control-panel'),
];

const collisionPadding: PopoverContentProps['collisionPadding'] = {
  top: 12,
  left: 16,
  right: 16,
  bottom: 12,
};
