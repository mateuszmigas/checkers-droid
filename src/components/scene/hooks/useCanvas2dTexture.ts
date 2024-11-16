import { useMemo, useRef } from "react";
import { CanvasTexture } from "three";

export const useCanvas2dTexture = (size: { width: number; height: number }) => {
  const context = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    return canvas.getContext("2d")!;
  }, []);

  const textureRef = useRef<CanvasTexture>(new CanvasTexture(context.canvas));

  return { context, textureRef };
};

