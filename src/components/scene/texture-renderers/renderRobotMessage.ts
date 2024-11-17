export const renderRobotMessage = (
  context: CanvasRenderingContext2D,
  message: string
) => {
  const { width, height } = context.canvas;
  const borderRadius = 40;
  const borderWidth = 4;

  // Clear the canvas
  context.clearRect(0, 0, width, height);

  // Create rounded rectangle path
  context.beginPath();
  context.moveTo(borderRadius, 0);
  context.lineTo(width - borderRadius, 0);
  context.quadraticCurveTo(width, 0, width, borderRadius);
  context.lineTo(width, height - borderRadius);
  context.quadraticCurveTo(width, height, width - borderRadius, height);
  context.lineTo(borderRadius, height);
  context.quadraticCurveTo(0, height, 0, height - borderRadius);
  context.lineTo(0, borderRadius);
  context.quadraticCurveTo(0, 0, borderRadius, 0);
  context.closePath();

  // Fill background
  context.fillStyle = "rgba(0, 0, 0, 0.4)";
  context.fill();

  // Draw border
  context.strokeStyle = "rgba(255, 255, 255, 0.8)";
  context.lineWidth = borderWidth;
  context.stroke();

  // Set text style
  context.fillStyle = "white";
  context.font = "bold 48px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";

  // Render message in center
  context.fillText(message, width / 2, height / 2);
};

