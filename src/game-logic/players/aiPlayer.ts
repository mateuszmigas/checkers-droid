import { delay } from "@/utils/promise";
import { GameState, getPlayerValidMoves } from "../gameState";
import {
  AIPlayerEmotion,
  CheckerPosition,
  CheckerValidMove,
  CheckerValidMoveMap,
  PlayerType,
} from "../types";
import { EventEmitter } from "@/utils/eventEmitter";
import { GameEvent } from "../gameEvent";
import { chromeApi, ChromeSession } from "@/chromeAI";

export type AIPlayerEvents =
  | { type: "EMOTION_CHANGED"; emotion: AIPlayerEmotion }
  | {
      type: "MESSAGE_CHANGED";
      message: string | ReadableStream<string>;
    };

const systemPrompt = `
You are Checker Droid, a skilled but casual checkers bot.
Watch and respond to player moves. Never ask for coordinates.
Use plain text + emojis. Keep responses brief.
`;

// me/you close to king
// me/you lost a piece
// me/you captured a piece
// me/you moved a piece
// game over

const welcomePrompt =
  "Say hello to the player, and tell them you are waiting for their move";
// const movePrompt = (moves: CheckerValidMoveMap) =>
//   `This is a set of possible moves: ${JSON.stringify(moves)}`;
// const eventsReactionPrompt = (events: GameEvent[]) =>
//   `The player has performed the following events: ${JSON.stringify(
//     events
//   )}. React to them.`;

export class AIPlayer extends EventEmitter<AIPlayerEvents> {
  private session: ChromeSession | undefined;

  constructor(private readonly playerType: PlayerType) {
    super();

    chromeApi.createSession(systemPrompt).then((session) => {
      this.session = session;
      const promptStream = this.session.promptStreaming(welcomePrompt);

      setTimeout(() => {
        this.emit({
          type: "MESSAGE_CHANGED",
          message: promptStream,
        });

        this.emit({
          type: "EMOTION_CHANGED",
          emotion: "happy",
        });
      }, 500);
    });
  }

  async getMove(
    gameState: GameState
  ): Promise<{ from: CheckerPosition; to: CheckerPosition } | null> {
    // Get all valid moves for black pieces
    await delay(Math.random() * 250);
    const validMoves: CheckerValidMoveMap = getPlayerValidMoves(
      this.playerType,
      gameState
    );

    // Convert the map to an array of moves with their starting positions
    const allMoves: { from: CheckerPosition; move: CheckerValidMove }[] = [];

    // Use entries() to iterate over the CustomMap
    validMoves.entries().forEach(([position, moves]) => {
      moves.forEach((move) => {
        allMoves.push({ from: position, move });
      });
    });

    // Prioritize capture moves
    const captureMoves = allMoves.filter(({ move }) => move.isCapture);

    if (captureMoves.length > 0) {
      // Choose a random capture move
      const randomMove =
        captureMoves[Math.floor(Math.random() * captureMoves.length)];
      return {
        from: randomMove.from,
        to: randomMove.move.targetPosition,
      };
    }

    // If no capture moves, choose a random regular move
    if (allMoves.length > 0) {
      const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
      return {
        from: randomMove.from,
        to: randomMove.move.targetPosition,
      };
    }

    return null;
  }

  async notify(gameEvents: GameEvent[]) {
    const types = gameEvents.map((event) => event.type);

    if (types.includes("PIECE_CAPTURED")) {
      setTimeout(() => {
        this.emit({
          type: "MESSAGE_CHANGED",
          message: "I'm so happy for you!",
        });
        this.emit({
          type: "EMOTION_CHANGED",
          emotion: "happy",
        });
      }, Math.random() * 1000);
      return;
    }
    if (types.includes("PIECE_MOVED")) {
      setTimeout(() => {
        this.emit({
          type: "MESSAGE_CHANGED",
          message: "Oh no, you moved a piece!",
        });
        this.emit({
          type: "EMOTION_CHANGED",
          emotion: "sad",
        });
      }, Math.random() * 1000);
    }
  }
}

export class HardcodedAIPlayer extends EventEmitter<AIPlayerEvents> {
  constructor(private readonly playerType: PlayerType) {
    super();

    setTimeout(() => {
      this.emit({
        type: "MESSAGE_CHANGED",
        message: "Hello, I'm your AI opponent!",
      });
    }, Math.random() * 1000);
  }

  async getMove(
    gameState: GameState
  ): Promise<{ from: CheckerPosition; to: CheckerPosition } | null> {
    // Get all valid moves for black pieces
    await delay(Math.random() * 250);
    const validMoves: CheckerValidMoveMap = getPlayerValidMoves(
      this.playerType,
      gameState
    );

    // Convert the map to an array of moves with their starting positions
    const allMoves: { from: CheckerPosition; move: CheckerValidMove }[] = [];

    // Use entries() to iterate over the CustomMap
    validMoves.entries().forEach(([position, moves]) => {
      moves.forEach((move) => {
        allMoves.push({ from: position, move });
      });
    });

    // Prioritize capture moves
    const captureMoves = allMoves.filter(({ move }) => move.isCapture);

    if (captureMoves.length > 0) {
      // Choose a random capture move
      const randomMove =
        captureMoves[Math.floor(Math.random() * captureMoves.length)];
      return {
        from: randomMove.from,
        to: randomMove.move.targetPosition,
      };
    }

    // If no capture moves, choose a random regular move
    if (allMoves.length > 0) {
      const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
      return {
        from: randomMove.from,
        to: randomMove.move.targetPosition,
      };
    }

    return null;
  }

  async notify(gameEvents: GameEvent[]) {
    const types = gameEvents.map((event) => event.type);

    if (types.includes("PIECE_CAPTURED")) {
      setTimeout(() => {
        this.emit({
          type: "MESSAGE_CHANGED",
          message: "I'm so happy for you!",
        });
        this.emit({
          type: "EMOTION_CHANGED",
          emotion: "happy",
        });
      }, Math.random() * 1000);
      return;
    }
    if (types.includes("PIECE_MOVED")) {
      setTimeout(() => {
        this.emit({
          type: "MESSAGE_CHANGED",
          message: "Oh no, you moved a piece!",
        });
        this.emit({
          type: "EMOTION_CHANGED",
          emotion: "sad",
        });
      }, Math.random() * 1000);
    }
  }
}

// export const AIPlayer = ChromeAIPlayer;
