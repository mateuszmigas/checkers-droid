import { extend } from "@react-three/fiber";
import { useCallback, useMemo, useRef } from "react";
import {
  CanvasTexture,
  type MagnificationTextureFilter,
  type MinificationTextureFilter,
} from "three";

extend({ CanvasTexture });

type Canvas2dTextureOptions = {
  minFilter: MinificationTextureFilter;
  magFilter: MagnificationTextureFilter;
};

export const useCanvas2dTexture = (
  size: { width: number; height: number },
  options?: Canvas2dTextureOptions
) => {
  const context = useMemo(() => {
    const canvas = new OffscreenCanvas(size.width, size.height);
    return canvas.getContext("2d")!;
  }, [size.height, size.width]);

  const textureRef = useRef<CanvasTexture>(
    (() => {
      const texture = new CanvasTexture(context.canvas);
      if (options) {
        Object.assign(texture, options);
      }
      return texture;
    })()
  );

  const updateTexture = useCallback(
    (draw: (context: OffscreenCanvasRenderingContext2D) => void) => {
      draw(context);
      textureRef.current.needsUpdate = true;
    },
    [context, textureRef]
  );

  return { textureRef, updateTexture };
};

