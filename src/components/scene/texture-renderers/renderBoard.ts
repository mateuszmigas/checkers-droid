interface RenderBoardProps {
  context: CanvasRenderingContext2D;
  events: string[];
}

export const renderBoard = ({ context, events }: RenderBoardProps) => {
  const { width, height } = context.canvas;

  // Clear background
  context.fillStyle = "#2a2a2a";
  context.fillRect(0, 0, width, height);

  // Setup text style
  context.fillStyle = "white";
  context.font = "48px Arial";

  // Render events from bottom to top
  events.reverse().forEach((event, index) => {
    const y = height - (index + 1) * 50;
    context.fillText(event, 20, y);
  });
};

