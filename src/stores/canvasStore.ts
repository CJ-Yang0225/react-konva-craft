import { atom, createStore } from 'jotai';
import { focusAtom } from 'jotai-optics';

import { Shape, Tool } from '@/types/konva';

export type SelectedShapesMap = Map<string, boolean>;

export type CanvasState = {
  activeTool: Tool;
  stageWidth: number;
  stageHeight: number;
  pencilThickness: number;
  shapes: Shape[];
  selectedShapesMap: SelectedShapesMap;
  color: string;
  cursor?: { element: React.ReactElement; x?: number; y?: number };
};

const DEFAULT_CANVAS_STATE: CanvasState = {
  activeTool: Tool.HAND,
  stageWidth: 0,
  stageHeight: 0,
  pencilThickness: 10,
  shapes: [],
  selectedShapesMap: new Map(),
  color: '#1e293b',
  cursor: undefined,
};

export const canvasStateAtom = atom(DEFAULT_CANVAS_STATE);

export const activeToolAtom = focusAtom(canvasStateAtom, (optic) =>
  optic.prop('activeTool')
);
export const stageWidthAtom = focusAtom(canvasStateAtom, (optic) =>
  optic.prop('stageWidth')
);
export const stageHeightAtom = focusAtom(canvasStateAtom, (optic) =>
  optic.prop('stageHeight')
);
export const pencilThicknessAtom = focusAtom(canvasStateAtom, (optic) =>
  optic.prop('pencilThickness')
);
export const shapesAtom = focusAtom(canvasStateAtom, (optic) =>
  optic.prop('shapes')
);
export const selectedShapesMapAtom = focusAtom(canvasStateAtom, (optic) =>
  optic.prop('selectedShapesMap')
);
export const colorAtom = focusAtom(canvasStateAtom, (optic) =>
  optic.prop('color')
);
export const cursorAtom = focusAtom(canvasStateAtom, (optic) =>
  optic.prop('cursor')
);

export const canvasStore = createStore();

const setShapes = (newShapes: Shape[] | ((newShapes: Shape[]) => Shape[])) => {
  canvasStore.set(shapesAtom, newShapes);
};

const setSelectedShapesMap = (
  newMap:
    | SelectedShapesMap
    | ((prevSelectedShapeMap: SelectedShapesMap) => SelectedShapesMap)
) => {
  canvasStore.set(selectedShapesMapAtom, newMap);
};

/**
 * 選取一個 shape（第二個參數決定是否多選）
 */
export const selectShape = (id: string, multiSelect = false) => {
  if (!id) return;

  setSelectedShapesMap((prevSelectedShapeMap) => {
    const newSelectedShapesMap: SelectedShapesMap = multiSelect
      ? new Map(prevSelectedShapeMap)
      : new Map();

    newSelectedShapesMap.set(id, true);

    return newSelectedShapesMap;
  });
};

/**
 * 取消選取一個 shape
 */
export const unselectShape = (id: string) => {
  if (!id) return;

  setSelectedShapesMap((prevSelectedShapeMap) => {
    const newSelectedShapesMap = new Map(prevSelectedShapeMap);

    if (newSelectedShapesMap.has(id)) {
      newSelectedShapesMap.delete(id);
      return newSelectedShapesMap;
    }

    return prevSelectedShapeMap;
  });
};

/**
 * 取消選取所有 shape(s)
 */
export const unselectAllShapes = () => {
  setSelectedShapesMap((prevSelectedShapeMap) => {
    if (prevSelectedShapeMap.size === 0) return prevSelectedShapeMap; // 減少不必要的 re-render

    return new Map();
  });
};

/**
 * 選取多個 shapes
 */
export const selectMultipleShapes = (ids: string[]) => {
  if (!ids.length) return;

  setSelectedShapesMap(
    new Map(
      ids.reduce<[string, boolean][]>((idAndShapePairList, id) => {
        if (id) {
          idAndShapePairList.push([id, true]);
        }

        return idAndShapePairList;
      }, [])
    )
  );
};

/**
 * 刪除全部被選取的 shape(s)
 */
export const deleteAllSelectedShapes = () => {
  const selectedShapesMap = canvasStore.get(selectedShapesMapAtom);

  if (selectedShapesMap.size === 0) return;

  setShapes((prevShapes) =>
    prevShapes.filter((shape) => !selectedShapesMap.has(shape.id))
  );
  setSelectedShapesMap(new Map());
};
