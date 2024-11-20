import { GameEvent } from "../gameEvent";
import { CheckerPosition, PlayerType } from "../types";

//You are an AI opponent 'Checker Droid' in a checkers game against a 'Player'.
export const systemPrompt = `
You are an AI opponent 'Checker Droid' in a checkers game against a human player.
- Always use "You" when referring to the player
- Always use "Me" or "I" when referring to yourself
- Respond to player moves from a first-person perspective
- Never ask for coordinates
- Use plain text + emojis
- Keep responses brief
`;

// me/you close to king
// me/you lost a piece
// me/you captured a piece
// me/you moved a piece
// game over

export const welcomePrompt =
  "Say hello to the player, and tell them you are waiting for their move";
// const movePrompt = (moves: CheckerValidMoveMap) =>
//   `This is a set of possible moves: ${JSON.stringify(moves)}`;

export const mapEvent = (
  event: GameEvent,
  aiPlayerType: PlayerType
): string => {
  const getPlayerText = (player: PlayerType) =>
    player === aiPlayerType ? "Me" : "Player";

  const formatPosition = (pos: CheckerPosition) => `(${pos.col},${pos.row})`;

  switch (event.type) {
    case "PIECE_MOVED":
      return `${getPlayerText(
        event.player
      )} moved a piece from ${formatPosition(event.from)} to ${formatPosition(
        event.to
      )}.`;

    case "PIECE_CAPTURED":
      return `${getPlayerText(
        event.player
      )} captured a piece at ${formatPosition(event.position)}.`;

    case "PIECE_CROWNED":
      return `${getPlayerText(
        event.player
      )} crowned a piece at ${formatPosition(event.position)}.`;

    case "TURN_CHANGED":
      return `It's ${
        event.player === aiPlayerType ? "Checker Droid's" : "Player's"
      } turn.`;

    case "GAME_OVER":
      if ("winner" in event) {
        return `Game over - ${getPlayerText(event.winner)} win!`;
      }
      return `Game over - It's a draw!`;

    case "INVALID_MOVE":
      return `Invalid move attempted.`;
  }
};

export const createEventsPrompt = (
  events: GameEvent[],
  aiPlayerType: PlayerType
) => {
  const eventDescriptions = events
    .map((event) => mapEvent(event, aiPlayerType))
    .join("\n");

  return `
  Based on the recent game events described below, generate:
1. A short, vivid message that captures the essence of the events
2. An emotion that authentically reflects the game state

<Constraints>
- Message must be 1-2 sentences
- Directly reference specific events
- Avoid speculation or complex analysis
</Constraints>

<Emotion Options>
["Happy", "Sad", "Surprised", "Angry", "Confident", "Anxious", "Neutral"]

<Context Interpretation Guidelines>
- Observe precise movement details
- Note player actions and turn progression
- Translate game mechanics into human-relatable emotional responses
</Context>

<Events>
${eventDescriptions}
</Events>

<Response Format>
{
  "message": "Concise, event-focused comment",
  "emotion": "Emotion matching game state"
}
</Response Format>
  `;
};

