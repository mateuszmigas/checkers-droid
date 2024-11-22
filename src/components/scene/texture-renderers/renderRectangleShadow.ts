export const renderRectangleShadow = (
  context: CanvasRenderingContext2D,
  size: number
) => {
  context.shadowColor = "black";
  context.shadowBlur = 25;
  context.fillStyle = "black";
  context.fillRect(size * 0.2, size * 0.2, size * 0.6, size * 0.6);
};

