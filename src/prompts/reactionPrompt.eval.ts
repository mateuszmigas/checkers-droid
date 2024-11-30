import { expect } from "@playwright/test";
import { evalTest, PromptOptions } from "./evalTest";
import { createSystemPrompt } from "./systemPrompt";
import { ChromeAiManagedSession } from "@/chromeAI";
import { createReactionPromptRequest } from "./reactionPrompt";

const systemPrompt = createSystemPrompt("HUMAN", "trickster");

const createSession = (
  prompt: (input: string, options: PromptOptions) => Promise<string>
) =>
  ({
    prompt: (input: string) => prompt(input, { systemPrompt }),
  } as ChromeAiManagedSession);

evalTest(`should react to game won with joy`, async ({ prompt }) => {
  const session = createSession(prompt);
  const reactionPromptRequest = createReactionPromptRequest(
    [{ type: "GAME_OVER", winner: "PLAYER_ONE" }],
    "PLAYER_ONE",
    "joy"
  );

  const response = await session.prompt(reactionPromptRequest.prompt);
  const [emotion, message] = response.split("|");
  expect(emotion).toEqual("joy");
  expect(message).toBeTruthy();
});

evalTest(
  `should react to game ending in draw with surprise`,
  async ({ prompt }) => {
    const session = createSession(prompt);
    const reactionPromptRequest = createReactionPromptRequest(
      [{ type: "GAME_OVER", winner: "DRAW" }],
      "PLAYER_ONE",
      "surprise"
    );

    const response = await session.prompt(reactionPromptRequest.prompt);
    const [emotion, message] = response.split("|");
    expect(emotion).toEqual("contemplation");
    expect(message).toBeTruthy();
  }
);

evalTest(`should react to game lost with sadness`, async ({ prompt }) => {
  const session = createSession(prompt);
  const reactionPromptRequest = createReactionPromptRequest(
    [{ type: "GAME_OVER", winner: "PLAYER_TWO" }],
    "PLAYER_ONE",
    "sadness"
  );

  const response = await session.prompt(reactionPromptRequest.prompt);
  const [emotion, message] = response.split("|");
  expect(emotion).toEqual("sadness");
  expect(message).toBeTruthy();
});

evalTest(
  `should react to capturing opponent's piece with joy`,
  async ({ prompt }) => {
    const session = createSession(prompt);
    const reactionPromptRequest = createReactionPromptRequest(
      [
        {
          type: "PIECE_CAPTURED",
          position: { row: 3, col: 3 },
          player: "PLAYER_ONE",
        },
      ],
      "PLAYER_ONE",
      "joy"
    );

    const response = await session.prompt(reactionPromptRequest.prompt);
    const [emotion, message] = response.split("|");
    expect(emotion).toEqual("joy");
    expect(message).toBeTruthy();
  }
);

evalTest(
  `should react to losing a piece with frustration`,
  async ({ prompt }) => {
    const session = createSession(prompt);
    const reactionPromptRequest = createReactionPromptRequest(
      [{ type: "GAME_OVER", winner: "PLAYER_TWO" }],
      "PLAYER_ONE",
      "frustration"
    );

    const response = await session.prompt(reactionPromptRequest.prompt);
    const [emotion, message] = response.split("|");
    expect(emotion).toEqual("frustration");
    expect(message).toBeTruthy();
  }
);

evalTest(
  `should react to enemy piece crowned with sadness`,
  async ({ prompt }) => {
    const session = createSession(prompt);
    const reactionPromptRequest = createReactionPromptRequest(
      [
        {
          type: "PIECE_CROWNED",
          position: { row: 3, col: 3 },
          player: "PLAYER_TWO",
        },
      ],
      "PLAYER_ONE",
      "sadness"
    );

    const response = await session.prompt(reactionPromptRequest.prompt);
    const [emotion, message] = response.split("|");
    expect(emotion).toEqual("sadness");
    expect(message).toBeTruthy();
  }
);

evalTest(`should react to getting a king with joy`, async ({ prompt }) => {
  const session = createSession(prompt);
  const reactionPromptRequest = createReactionPromptRequest(
    [
      {
        type: "PIECE_MOVED",
        from: { row: 1, col: 1 },
        to: { row: 0, col: 0 },
        player: "PLAYER_ONE",
      },
      {
        type: "PIECE_CROWNED",
        position: { row: 0, col: 0 },
        player: "PLAYER_ONE",
      },
    ],
    "PLAYER_ONE",
    "joy"
  );

  const response = await session.prompt(reactionPromptRequest.prompt);
  const [emotion, message] = response.split("|");
  expect(emotion).toEqual("pride");
  expect(message).toBeTruthy();
});
