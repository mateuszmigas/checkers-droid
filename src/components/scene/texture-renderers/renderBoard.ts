interface RenderBoardProps {
  context: CanvasRenderingContext2D;
  events: string[];
}

export const renderBoard = ({ context, events }: RenderBoardProps) => {
  const { width, height } = context.canvas;

  // Clear background
  context.fillStyle = "rgba(0, 0, 0, 0.9)";
  context.fillRect(0, 0, width, height);

  // Add matrix-style gradient with blue
  const gradient = context.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "rgba(0, 149, 255, 0.1)");
  gradient.addColorStop(1, "rgba(0, 149, 255, 0.2)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  // Setup text style for main text
  context.fillStyle = "#0095ff"; // Cyberpunk blue
  context.font = "bold 56px 'Courier New'";
  context.shadowColor = "#0095ff";
  context.shadowBlur = 10;

  // Render events from bottom to top with a typing effect
  events.reverse().forEach((event, index) => {
    const y = height - (index + 1) * 70;
    const opacity = 1 - index * 0.15;
    context.fillStyle = `rgba(0, 149, 255, ${opacity})`;
    context.fillText(event, 30, y);
  });

  // Reset shadow
  context.shadowBlur = 0;
};

