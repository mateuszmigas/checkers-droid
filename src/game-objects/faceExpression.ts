export type FaceExpression = "happy" | "sad" | "focused";

export const drawFace = (
  context: CanvasRenderingContext2D,
  expression: FaceExpression
) => {
  const { width, height } = context.canvas;

  // Clear background
  context.fillStyle = "black";
  context.fillRect(0, 0, width, height);

  // Common settings for drawing
  context.strokeStyle = "blue";
  context.fillStyle = "blue";
  context.lineWidth = 20;

  const eyeRadius = 50;
  const mouthRadius = 150;

  // Draw eyes based on expression
  switch (expression) {
    case "happy":
      // Left eye
      context.beginPath();
      context.ellipse(
        width * 0.3,
        height * 0.3,
        eyeRadius,
        eyeRadius,
        0,
        0,
        Math.PI * 2
      );
      context.fill();
      // Right eye
      context.beginPath();
      context.ellipse(
        width * 0.7,
        height * 0.3,
        eyeRadius,
        eyeRadius,
        0,
        0,
        Math.PI * 2
      );
      context.fill();

      // Mouth
      context.beginPath();
      context.moveTo(width * 0.2, height * 0.7);
      context.bezierCurveTo(
        width * 0.35,
        height * 0.9,
        width * 0.65,
        height * 0.9,
        width * 0.8,
        height * 0.7
      );
      context.fill();
      break;

    case "sad":
      // Sad eyes (curved down lines)
      context.beginPath();
      context.arc(
        width * 0.3,
        height * 0.45,
        eyeRadius,
        -0.3,
        Math.PI + 0.3,
        true
      );
      context.stroke();
      context.beginPath();
      context.arc(
        width * 0.7,
        height * 0.45,
        eyeRadius,
        -0.3,
        Math.PI + 0.3,
        true
      );
      context.stroke();

      // Sad mouth (curved down)
      context.beginPath();
      context.arc(
        width * 0.5,
        height * 0.7,
        mouthRadius,
        Math.PI,
        Math.PI * 2,
        false
      );
      context.stroke();
      break;

    case "focused":
      // Focused eyes (straight lines)
      context.beginPath();
      context.moveTo(width * 0.25, height * 0.4);
      context.lineTo(width * 0.35, height * 0.4);
      context.moveTo(width * 0.65, height * 0.4);
      context.lineTo(width * 0.75, height * 0.4);
      context.stroke();

      // Focused mouth (straight line)
      context.beginPath();
      context.moveTo(width * 0.4, height * 0.6);
      context.lineTo(width * 0.6, height * 0.6);
      context.stroke();
      break;
  }
};

