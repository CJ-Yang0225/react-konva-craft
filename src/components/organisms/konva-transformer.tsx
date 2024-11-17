import { useEffect, useRef } from 'react';
import {
  deleteAllSelectedShapes,
  selectedShapesMapAtom,
} from '@/stores/canvasStore';
import { useAtomValue } from 'jotai';
import Konva from 'konva';
import { Transformer } from 'react-konva';

export const KonvaTransformer = () => {
  const selectedShapeMap = useAtomValue(selectedShapesMapAtom);

  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    const transformer = transformerRef.current;

    if (transformer) {
      const layer = transformer.getLayer();
      transformer.nodes(
        Array.from(selectedShapeMap.keys()).reduce<Konva.Node[]>(
          (nodes, id) => {
            const foundNode = layer?.findOne(`#${id}`);

            if (foundNode) {
              nodes.push(foundNode);
            }

            return nodes;
          },
          []
        )
      );
    }
  }, [selectedShapeMap]);

  /**
   * 按下 Delete 或 Backspace 鍵時，刪除全部被選取的 shape(s)
   */
  useEffect(() => {
    const handleSelectedShapesDelete = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteAllSelectedShapes();
      }
    };

    window.addEventListener('keydown', handleSelectedShapesDelete);

    return () => {
      window.removeEventListener('keydown', handleSelectedShapesDelete);
    };
  }, []);

  return <Transformer ref={transformerRef} shouldOverdrawWholeArea />;
};
