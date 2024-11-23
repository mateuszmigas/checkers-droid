import { describe, it, expect } from "vitest";
import { translateEvent } from "./translator";
import { GameEvent } from "@/game-logic/gameEvent";
import { PlayerType } from "@/game-logic/types";

describe("translateEvent", () => {
  it.each([
    {
      event: { type: "GAME_OVER", winner: "PLAYER_ONE" },
      player: "PLAYER_ONE",
      expected: "Game Over - You Win!",
    },
    {
      event: { type: "GAME_OVER", winner: "PLAYER_TWO" },
      player: "PLAYER_ONE",
      expected: "Game Over - Opponent Wins!",
    },
    {
      event: { type: "GAME_OVER", result: "DRAW" },
      player: "PLAYER_ONE",
      expected: "Game Over - It's a Draw!",
    },
    {
      event: { type: "TURN_CHANGED", player: "PLAYER_ONE" },
      player: "PLAYER_ONE",
      expected: "Your Turn",
    },
    {
      event: { type: "TURN_CHANGED", player: "PLAYER_TWO" },
      player: "PLAYER_ONE",
      expected: "Opponent's Turn",
    },
    {
      event: {
        type: "PIECE_CROWNED",
        position: { row: 1, col: 3 },
        player: "PLAYER_ONE",
      },
      player: "PLAYER_ONE",
      expected: "You Crowned a Piece at (3, 1)",
    },
    {
      event: {
        type: "PIECE_CROWNED",
        position: { row: 1, col: 3 },
        player: "PLAYER_TWO",
      },
      player: "PLAYER_ONE",
      expected: "Opponent Crowned a Piece at (3, 1)",
    },
    {
      event: {
        type: "PIECE_MOVED",
        from: { row: 1, col: 3 },
        to: { row: 2, col: 4 },
        player: "PLAYER_ONE",
      },
      player: "PLAYER_ONE",
      expected: "You Moved a Piece from (3, 1) to (4, 2)",
    },
    {
      event: {
        type: "PIECE_MOVED",
        from: { row: 1, col: 3 },
        to: { row: 2, col: 4 },
        player: "PLAYER_TWO",
      },
      player: "PLAYER_ONE",
      expected: "Opponent Moved a Piece from (3, 1) to (4, 2)",
    },
    {
      event: {
        type: "PIECE_CAPTURED",
        position: { row: 1, col: 3 },
        player: "PLAYER_ONE",
      },
      player: "PLAYER_ONE",
      expected: "You Captured a Piece at (3, 1)",
    },
    {
      event: {
        type: "PIECE_CAPTURED",
        position: { row: 1, col: 3 },
        player: "PLAYER_TWO",
      },
      player: "PLAYER_ONE",
      expected: "Opponent Captured a Piece at (3, 1)",
    },
  ] as {
    event: GameEvent;
    player: PlayerType;
    expected: string;
  }[])(
    "should translate %s event for %s to %s",
    ({ event, player, expected }) => {
      const result = translateEvent(event, player);
      expect(result).toBe(expected);
    }
  );
});

