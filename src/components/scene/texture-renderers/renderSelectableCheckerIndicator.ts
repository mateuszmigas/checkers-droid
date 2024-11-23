export const renderSelectableCheckerIndicator = (
  context: OffscreenCanvasRenderingContext2D,
  color: string
) => {
  context.beginPath();
  context.arc(128, 128, 110, 0, Math.PI * 2);
  context.strokeStyle = color;
  context.lineWidth = 8;
  context.setLineDash([20, 20]);
  context.stroke();
};

