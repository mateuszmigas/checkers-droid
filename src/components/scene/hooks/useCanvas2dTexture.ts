import { useMemo, useRef } from "react";
import {
  CanvasTexture,
  MagnificationTextureFilter,
  MinificationTextureFilter,
} from "three";

type Canvas2dTextureOptions = {
  minFilter: MinificationTextureFilter;
  magFilter: MagnificationTextureFilter;
};

export const useCanvas2dTexture = (
  size: { width: number; height: number },
  options?: Canvas2dTextureOptions
) => {
  const context = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
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

  return { context, textureRef };
};
