const padding = 10;
const color = "#0DE8E9";

type Rectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const drawScoreRect = (
  context: OffscreenCanvasRenderingContext2D,
  rect: Rectangle,
  scored: number
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
  text: string
) => {
  context.fillStyle = color;
  context.font = "bold 80px Orbitron, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;
  context.fillText(text.toUpperCase(), centerX, centerY);
};

const drawEventsRect = (
  context: OffscreenCanvasRenderingContext2D,
  rect: Rectangle,
  events: string[]
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
  _events: string[]
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
  drawScoreRect(context, scoreRect, 5);

  /* Turn */
  const turnRect: Rectangle = {
    x: scoreRect.x + scoreRect.width + padding,
    y: padding,
    width: width * 0.5 - padding,
    height: height - 2 * padding,
  };

  context.strokeRect(turnRect.x, turnRect.y, turnRect.width, turnRect.height);
  drawTurnRect(context, turnRect, "You Lose");

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
  drawEventsRect(context, eventsRect, [
    "Player 1 draws a card",
    "Robot plays Ace of Spades",
    "Player 1 wins the trick",
    "Robot shuffles the deck",
    "New round begins",
    "Player 1 leads with King of Hearts",
    "Robot follows with Queen of Hearts",
    "Player 1 takes the lead",
  ]);
};
