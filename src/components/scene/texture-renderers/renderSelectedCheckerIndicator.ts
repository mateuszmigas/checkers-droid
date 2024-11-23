export const renderSelectedCheckerIndicator = (
  context: OffscreenCanvasRenderingContext2D,
  color: string
) => {
  context.beginPath();
  context.arc(128, 128, 110, 0, Math.PI * 2);
  context.strokeStyle = color;
  context.lineWidth = 12;
  context.stroke();
};

