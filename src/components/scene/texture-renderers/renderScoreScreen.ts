const padding = 10;

type Rectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const drawScoreRect = (
  context: OffscreenCanvasRenderingContext2D,
  rect: Rectangle,
  scored: number,
  color: string
) => {
  context.fillStyle = color;
  const sections = 12;
  const gap = 2;
  const sectionHeight =
    (rect.height - padding * 2 - gap * (sections - 1)) / sections;
  const sectionWidth = rect.width - padding * 2;
  const startX = rect.x + padding;

  for (let i = 0; i < scored; i++) {
    const y =
      rect.y + rect.height - padding - (i + 1) * (sectionHeight + gap) + gap;
    context.fillRect(startX, y, sectionWidth, sectionHeight);
  }
};

const drawTurnRect = (
  context: OffscreenCanvasRenderingContext2D,
  rect: Rectangle,
  text: string,
  color: string
) => {
  context.fillStyle = color;

  const lines = text.toUpperCase().split("\n");
  const longestLine = Math.max(...lines.map((line) => line.length));
  const fontSize = 80 - longestLine * 2;
  const lineHeight = fontSize * 1.2;

  context.font = `bold ${fontSize}px Orbitron, sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";

  const totalHeight = lineHeight * lines.length;
  const startY = rect.y + (rect.height - totalHeight) / 2 + lineHeight / 2;
  const centerX = rect.x + rect.width / 2;

  lines.forEach((line, index) => {
    const centerY = startY + index * lineHeight;
    context.fillText(line, centerX, centerY);
  });
};

const drawEventsRect = (
  context: OffscreenCanvasRenderingContext2D,
  rect: Rectangle,
  events: string[],
  color: string
) => {
  context.fillStyle = color;
  context.font = "20px Orbitron, sans-serif";
  context.textAlign = "left";
  context.textBaseline = "top";

  const maxEvents = 8;
  const lineHeight = 28;
  const textX = rect.x + padding;
  const startY = rect.y + padding;

  const recentEvents = events.slice(-maxEvents);

  recentEvents.forEach((event, index) => {
    const textY = startY + index * lineHeight;
    const maxWidth = rect.width - padding * 2;
    context.fillText(event, textX, textY, maxWidth);
  });
};

export const renderScoreScreen = (
  context: OffscreenCanvasRenderingContext2D,
  scoredPieces: number,
  playerTurnText: string,
  events: string[],
  color: string
) => {
  const { width, height } = context.canvas;

  context.fillStyle = "black";
  context.fillRect(0, 0, width, height);

  context.strokeStyle = color;
  context.lineWidth = 2;

  /* Score */
  const scoreRect: Rectangle = {
    x: padding,
    y: padding,
    width: width * 0.1 - padding,
    height: height - 2 * padding,
  };
  context.strokeRect(
    scoreRect.x,
    scoreRect.y,
    scoreRect.width,
    scoreRect.height
  );
  drawScoreRect(context, scoreRect, scoredPieces, color);

  /* Turn */
  const turnRect: Rectangle = {
    x: scoreRect.x + scoreRect.width + padding,
    y: padding,
    width: width * 0.5 - padding,
    height: height - 2 * padding,
  };

  context.strokeRect(turnRect.x, turnRect.y, turnRect.width, turnRect.height);
  drawTurnRect(context, turnRect, playerTurnText, color);

  /* Events */
  const eventsRect: Rectangle = {
    x: turnRect.x + turnRect.width + padding,
    y: padding,
    width: width * 0.4 - padding * 2,
    height: height - 2 * padding,
  };

  context.strokeRect(
    eventsRect.x,
    eventsRect.y,
    eventsRect.width,
    eventsRect.height
  );
  drawEventsRect(context, eventsRect, events, color);
};
