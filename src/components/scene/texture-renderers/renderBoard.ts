export const renderBoard = (
  context: CanvasRenderingContext2D,
  events: string[]
) => {
  const { width, height } = context.canvas;

  // Background
  context.fillStyle = "rgba(0, 0, 0, 0.75)";
  context.fillRect(0, 0, width, height);

  // Draw columns
  const columnWidth = width / 2;
  const padding = 20;
  const borderColor = "#0095ff"; // Cyberpunk blue
  const borderWidth = 2;

  // Left column
  context.strokeStyle = borderColor;
  context.lineWidth = borderWidth;
  context.strokeRect(
    padding,
    padding,
    columnWidth - padding * 1.5,
    height - padding * 2
  );

  // Right column
  context.strokeRect(
    columnWidth + padding / 2,
    padding,
    columnWidth - padding * 1.5,
    height - padding * 2
  );

  // Display events in the left column if needed
  context.fillStyle = borderColor;
  context.font = "16px 'Courier New'";
  events.slice(0, 10).forEach((event, index) => {
    context.fillText(event, padding * 2, padding * 2 + index * 24);
  });
};
