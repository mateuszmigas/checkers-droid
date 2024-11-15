export type FaceExpression = "happy" | "sad" | "focused";

interface FaceParams {
  leftEyebrowAngle: number;
  rightEyebrowAngle: number;
  mouthWidth: number;
  mouthHeight: number;
  mouthY: number;
}

const expressionParams: Record<FaceExpression, FaceParams> = {
  happy: {
    leftEyebrowAngle: -0.3,
    rightEyebrowAngle: 0.3,
    mouthWidth: 0.4,
    mouthHeight: 0.15,
    mouthY: 0.65,
  },
  sad: {
    leftEyebrowAngle: 0.3,
    rightEyebrowAngle: -0.3,
    mouthWidth: 0.3,
    mouthHeight: 0.08,
    mouthY: 0.75,
  },
  focused: {
    leftEyebrowAngle: 0,
    rightEyebrowAngle: 0,
    mouthWidth: 0.25,
    mouthHeight: 0.05,
    mouthY: 0.7,
  },
};

export const drawFace = (
  context: CanvasRenderingContext2D,
  expression: FaceExpression
) => {
  const { width, height } = context.canvas;
  const params = expressionParams[expression];

  // Clear background
  context.fillStyle = "black";
  context.fillRect(0, 0, width, height);

  // Common settings for drawing
  context.strokeStyle = "blue";
  context.fillStyle = "blue";
  context.lineWidth = 20;

  // Draw eyes (always circles)
  const drawEye = (x: number) => {
    context.beginPath();
    context.arc(x, height * 0.4, 40, 0, Math.PI * 2);
    context.fill();
  };

  drawEye(width * 0.3); // Left eye
  drawEye(width * 0.7); // Right eye

  // Draw eyebrows
  const eyebrowLength = 80;
  const eyebrowDistance = 60;

  const drawEyebrow = (x: number, angle: number) => {
    context.save();
    context.translate(x, height * 0.3);
    context.rotate(angle);
    context.beginPath();
    context.moveTo(-eyebrowLength / 2, -eyebrowDistance);
    context.lineTo(eyebrowLength / 2, -eyebrowDistance);
    context.stroke();
    context.restore();
  };

  drawEyebrow(width * 0.3, params.leftEyebrowAngle); // Left eyebrow
  drawEyebrow(width * 0.7, params.rightEyebrowAngle); // Right eyebrow

  // Draw mouth (always rectangle with varying dimensions)
  const mouthWidth = width * params.mouthWidth;
  const mouthHeight = height * params.mouthHeight;
  const mouthX = width * 0.5 - mouthWidth / 2;
  const mouthY = height * params.mouthY;

  context.fillRect(mouthX, mouthY, mouthWidth, mouthHeight);
};

