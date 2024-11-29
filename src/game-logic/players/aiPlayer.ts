import { GameState, getPlayerValidMoves } from "../gameState";
import { AIPlayerEmotion, PlayerType } from "../types";
import { EventEmitter } from "@/utils/eventEmitter";
import { GameEvent } from "../gameEvent";
import { chromeApi, ChromeAiManagedSession } from "@/chromeAI";
import { createMovePromptRequest, sessionOptions } from "@/prompts/movePrompt";
import { createSystemPrompt } from "@/prompts/systemPrompt";
import { createWelcomePrompt } from "@/prompts/welcomePrompt";
import { runWithStructuredOutput } from "@/utils/prompt";
import { createEventsPromptRequest } from "@/prompts/eventsPrompt";
import { withMinDuration } from "@/utils/promise";
import { withCompletionTracking } from "@/utils/stream";
import { analyzeMoveConsequences } from "../moveConsequence";

export type AIPlayerEvents =
  | { type: "EMOTION_CHANGED"; emotion: AIPlayerEmotion }
  | { type: "MESSAGE_CHANGED"; message: string | ReadableStream<string> };

export class AiPlayer extends EventEmitter<AIPlayerEvents> {
  private selectMoveSession: ChromeAiManagedSession | null = null;
  private reactionSession: ChromeAiManagedSession | null = null;
  private isMessageStreamInProgress = false;

  constructor(
    private readonly playerType: PlayerType,
    opponentType: "HUMAN" | "AI"
  ) {
    super();

    const systemPrompt = createSystemPrompt(opponentType);
    const init = async () => {
      const createSessions = async () => {
        this.selectMoveSession = await chromeApi.createManagedSession({
          systemPrompt,
          ...sessionOptions,
        });
        if (opponentType === "HUMAN") {
          this.reactionSession = await chromeApi.createManagedSession({
            systemPrompt,
            // default values
          });
        }
      };

      await withMinDuration(createSessions(), 500);

      if (this.reactionSession) {
        const welcomeStream = await this.reactionSession.promptStreaming(
          createWelcomePrompt()
        );
        this.isMessageStreamInProgress = true;
        this.emit({
          type: "MESSAGE_CHANGED",
          message: welcomeStream.pipeThrough(
            withCompletionTracking(() => {
              this.isMessageStreamInProgress = false;
            })
          ),
        });
      }
      this.emit({ type: "EMOTION_CHANGED", emotion: "joy" });
    };

    init();
  }

  async getMove(gameState: GameState) {
    const moves = getPlayerValidMoves(this.playerType, gameState)
      .entries()
      .flatMap(([position, targets]) =>
        targets.map((target) => {
          const move = { from: position, to: target.targetPosition };
          const consequences = analyzeMoveConsequences(gameState, move);
          return { ...move, consequences };
        })
      );

    if (moves.length === 0) return null;

    const promptRequest = createMovePromptRequest(
      moves,
      { shot: 0 }, // default value
      ({ shot }) => shot >= 0 && shot < moves.length
    );

    const response = await withMinDuration(
      runWithStructuredOutput(this.selectMoveSession!, promptRequest),
      1000 // in case the AI is too fast
    );

    return moves[response.data.shot];
  }

  async notify(gameState: GameState, gameEvents: GameEvent[]) {
    if (
      !this.reactionSession ||
      gameState.currentTurn === this.playerType ||
      this.isMessageStreamInProgress
    ) {
      return;
    }

    const promptRequest = createEventsPromptRequest(
      gameEvents,
      this.playerType,
      "joy"
    );

    const response = await this.reactionSession.promptStreaming(
      promptRequest.prompt
    );

    this.isMessageStreamInProgress = true;
    const messageStream = promptRequest.handleEmotionThenStreamMessage(
      response,
      (emotion) => this.emit({ type: "EMOTION_CHANGED", emotion }),
      () => {
        this.isMessageStreamInProgress = false;
      }
    );

    this.emit({
      type: "MESSAGE_CHANGED",
      message: messageStream,
    });
  }

  dispose() {
    this.selectMoveSession?.destroy();
    this.reactionSession?.destroy();
  }
}

