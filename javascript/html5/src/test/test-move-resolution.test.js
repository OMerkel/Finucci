/**
 * Test suite for move resolution and type tracking
 * Regression tests for issue: moveType/Scopa not returned from playTurn()
 * Issue: Captures were being displayed as "Discarded a card"
 * Requirements: FR-3.2, FR-4.1, FR-4.5, FR-6.1, FR-6.2
 */

import { beforeEach, describe, expect, it } from "vitest";
import { Card } from "../core/card.js";
import { GameEngine } from "../core/game-engine.js";
import { GameState } from "../core/game-state.js";

describe("Move Resolution - Type Tracking and Return Values", () => {
  let gameEngine;
  let gameState;

  beforeEach(() => {
    gameEngine = new GameEngine();
    gameEngine.startGame();
    gameState = gameEngine.gameState;
  });

  describe("playTurn() - moveType and Scopa tracking", () => {
    it("should return moveType='discard' for discard moves", () => {
      // Given: Player has hand and will discard
      const handCard = new Card("coppe", "4", 4);
      const controlledState = new GameState({
        ...gameEngine.config,
        players: [
          { hand: [handCard], pile: [], score: 0 },
          { hand: [], pile: [], score: 0 },
        ],
        tableCards: [new Card("spade", "7", 7)],
        deck: gameState.deck,
        phase: "playing",
        currentPlayerIndex: 0,
        stats: { Scope: [0, 0] },
      });
      gameEngine.gameState = controlledState;
      const move = {
        card: handCard,
        isCapture: false,
      };

      // When: Player discards
      const result = gameEngine.playTurn(0, move);

      // Then: moveType should be 'discard'
      expect(result.success).toBe(true);
      expect(result.moveType).toBe("discard");
      expect(result.Scopa).toBe(false);
    });

    it("should return moveType='capture' and Scopa=false for regular captures", () => {
      // Given: Setup board with specific cards
      const handCard = new Card("denari", "fante", 8);
      const tableCard1 = new Card("bastoni", "2", 2);
      const tableCard2 = new Card("spade", "6", 6);
      const tableCard3 = new Card("coppe", "asso", 1);

      // Create new game state with these cards
      const newGameState = new GameState({
        ...gameEngine.config,
        players: [
          { hand: [handCard], pile: [], score: 0 },
          { hand: [], pile: [], score: 0 },
        ],
        tableCards: [tableCard1, tableCard2, tableCard3],
        deck: gameState.deck,
        phase: "playing",
        currentPlayerIndex: 0,
        stats: { Scope: [0, 0] },
      });
      gameEngine.gameState = newGameState;

      const move = {
        card: handCard,
        capture: [tableCard1, tableCard2], // 2 + 6 = 8, matching played card value
        isCapture: true,
        isScopa: false,
      };

      // When: Player captures
      const result = gameEngine.playTurn(0, move);

      // Then: moveType should be 'capture' and Scopa should be false
      expect(result.success).toBe(true);
      expect(result.moveType).toBe("capture");
      expect(result.Scopa).toBe(false);
    });

    it("should return Scopa=true when capturing all table cards", () => {
      // Given: setup board where capture cards sum to played card value
      const handCard = new Card("denari", "fante", 8);
      const tableCard1 = new Card("bastoni", "2", 2);
      const tableCard2 = new Card("spade", "6", 6);
      const tableCards = [tableCard1, tableCard2]; // 2 + 6 = 8, matching played card value 8

      const newGameState = new GameState({
        ...gameEngine.config,
        players: [
          { hand: [handCard], pile: [], score: 0 },
          { hand: [], pile: [], score: 0 },
        ],
        tableCards: tableCards,
        deck: gameState.deck,
        phase: "playing",
        currentPlayerIndex: 0,
        stats: { Scope: [0, 0] },
      });
      gameEngine.gameState = newGameState;

      const move = {
        card: handCard,
        capture: tableCards, // Capturing ALL table cards
        isCapture: true,
        isScopa: true, // Flag indicating it's an Scopa
      };

      // When: Player captures entire table
      const result = gameEngine.playTurn(0, move);

      // Then: moveType should be 'capture' and Scopa should be true
      expect(result.success).toBe(true);
      expect(result.moveType).toBe("capture");
      expect(result.Scopa).toBe(true);
    });

    it("should include updatedState in successful move result", () => {
      // Given: Player will make a move
      const handCard = new Card("coppe", "4", 4);
      const controlledState = new GameState({
        ...gameEngine.config,
        players: [
          { hand: [handCard], pile: [], score: 0 },
          { hand: [], pile: [], score: 0 },
        ],
        tableCards: [new Card("spade", "7", 7)],
        deck: gameState.deck,
        phase: "playing",
        currentPlayerIndex: 0,
        stats: { Scope: [0, 0] },
      });
      gameEngine.gameState = controlledState;
      const move = {
        card: handCard,
        isCapture: false,
      };

      // When: Move is executed
      const result = gameEngine.playTurn(0, move);

      // Then: Result should include updated game state
      expect(result.success).toBe(true);
      expect(result.updatedState).toBeDefined();
      expect(result.updatedState).toBeInstanceOf(GameState);
      expect(result.updatedState.currentPlayerIndex).not.toBe(
        gameState.currentPlayerIndex,
      );
    });
  });

  describe("Card removal verification", () => {
    it("should remove hand card from game state after capture", () => {
      // Given: Player selects hand card 7 and table cards summing to 8
      const handCard = new Card("denari", "fante", 8);
      const otherCard = new Card("coppe", "3", 3);
      const tableCard1 = new Card("bastoni", "2", 2);
      const tableCard2 = new Card("spade", "6", 6);

      const newGameState = new GameState({
        ...gameEngine.config,
        players: [
          { hand: [handCard, otherCard], pile: [], score: 0 },
          { hand: [], pile: [], score: 0 },
        ],
        tableCards: [tableCard1, tableCard2],
        deck: gameState.deck,
        phase: "playing",
        currentPlayerIndex: 0,
        stats: { Scope: [0, 0] },
      });
      gameEngine.gameState = newGameState;

      const move = {
        card: handCard,
        capture: [tableCard1, tableCard2],
        isCapture: true,
        isScopa: true,
      };

      // When: Move executed
      const result = gameEngine.playTurn(0, move);

      // Then: Hand should no longer contain the played card
      expect(result.success).toBe(true);
      const newHand = result.updatedState.players[0].hand;
      expect(newHand).toHaveLength(1);
      expect(newHand[0].rank).toBe("3");
      expect(newHand.some((c) => c.rank === "fante")).toBe(false);
    });

    it("should remove table cards from game state after capture", () => {
      // Given: Specific setup with hand 7 and table 2+6
      const handCard = new Card("denari", "fante", 8);
      const tableCard1 = new Card("bastoni", "2", 2);
      const tableCard2 = new Card("spade", "6", 6);
      const tableCard3 = new Card("coppe", "3", 3); // Extra card not captured

      const newGameState = new GameState({
        ...gameEngine.config,
        players: [
          { hand: [handCard], pile: [], score: 0 },
          { hand: [], pile: [], score: 0 },
        ],
        tableCards: [tableCard1, tableCard2, tableCard3],
        deck: gameState.deck,
        phase: "playing",
        currentPlayerIndex: 0,
        stats: { Scope: [0, 0] },
      });
      gameEngine.gameState = newGameState;

      const move = {
        card: handCard,
        capture: [tableCard1, tableCard2],
        isCapture: true,
        isScopa: false,
      };

      // When: Move executed
      const result = gameEngine.playTurn(0, move);

      // Then: Table should only have the uncaptured card
      expect(result.success).toBe(true);
      expect(result.updatedState.tableCards).toHaveLength(1);
      expect(result.updatedState.tableCards[0].rank).toBe("3");
    });

    it("should add captured cards to player pile after capture", () => {
      // Given: Player capturing specific cards
      const handCard = new Card("denari", "fante", 8);
      const tableCard1 = new Card("bastoni", "2", 2);
      const tableCard2 = new Card("spade", "6", 6);

      const newGameState = new GameState({
        ...gameEngine.config,
        players: [
          { hand: [handCard], pile: [], score: 0 },
          { hand: [], pile: [], score: 0 },
        ],
        tableCards: [tableCard1, tableCard2],
        deck: gameState.deck,
        phase: "playing",
        currentPlayerIndex: 0,
        stats: { Scope: [0, 0] },
      });
      gameEngine.gameState = newGameState;

      const move = {
        card: handCard,
        capture: [tableCard1, tableCard2],
        isCapture: true,
        isScopa: false,
      };

      // When: Move executed
      const result = gameEngine.playTurn(0, move);

      // Then: Pile should contain hand card + captured cards
      expect(result.success).toBe(true);
      const newPile = result.updatedState.players[0].pile;
      expect(newPile).toHaveLength(3);
      expect(newPile.map((c) => c.rank).sort()).toEqual(
        ["2", "6", "fante"].sort(),
      );
    });
  });

  describe("Scopa flag tracking", () => {
    it("should increment Scopa stats when Scopa=true", () => {
      // Given: Board setup for Scopa (capturing all table cards)
      const handCard = new Card("denari", "fante", 8);
      const tableCard1 = new Card("bastoni", "2", 2);
      const tableCard2 = new Card("spade", "6", 6);

      const newGameState = new GameState({
        ...gameEngine.config,
        players: [
          { hand: [handCard], pile: [], score: 0 },
          { hand: [], pile: [], score: 0 },
        ],
        tableCards: [tableCard1, tableCard2],
        deck: gameState.deck,
        phase: "playing",
        currentPlayerIndex: 0,
        stats: { Scope: [0, 0] },
      });
      gameEngine.gameState = newGameState;

      const move = {
        card: handCard,
        capture: [tableCard1, tableCard2],
        isCapture: true,
        isScopa: true,
      };

      // When: Move executed with Scopa
      const result = gameEngine.playTurn(0, move);

      // Then: Scopa count should increment
      expect(result.success).toBe(true);
      expect(result.updatedState.stats.Scope[0]).toBe(1);
      expect(result.updatedState.stats.Scope[1]).toBe(0);
    });

    it("should NOT increment Scopa stats when isScopa=false despite capturing", () => {
      // Given: Capture that's not an Scopa (some cards remain on table)
      const handCard = new Card("denari", "fante", 8);
      const tableCard1 = new Card("bastoni", "2", 2);
      const tableCard2 = new Card("spade", "6", 6);
      const tableCard3 = new Card("coppe", "5", 5);

      const newGameState = new GameState({
        ...gameEngine.config,
        players: [
          { hand: [handCard], pile: [], score: 0 },
          { hand: [], pile: [], score: 0 },
        ],
        tableCards: [tableCard1, tableCard2, tableCard3],
        deck: gameState.deck,
        phase: "playing",
        currentPlayerIndex: 0,
        stats: { Scope: [0, 0] },
      });
      gameEngine.gameState = newGameState;

      const move = {
        card: handCard,
        capture: [tableCard1, tableCard2],
        isCapture: true,
        isScopa: false, // Not an Scopa - card still on table
      };

      // When: Move executed without Scopa
      const result = gameEngine.playTurn(0, move);

      // Then: Scopa count should NOT increment
      expect(result.success).toBe(true);
      expect(result.updatedState.stats.Scope[0]).toBe(0);
      expect(result.updatedState.stats.Scope[1]).toBe(0);
    });
  });

  describe("Move validation - Scopa rule", () => {
    it("should reject capture where selected table sum does not match played value", () => {
      // Given: Cards that do not match played card value
      const handCard = new Card("denari", "fante", 8);
      const tableCard1 = new Card("bastoni", "2", 2);
      const tableCard2 = new Card("spade", "3", 3);

      const newGameState = new GameState({
        ...gameEngine.config,
        players: [
          { hand: [handCard], pile: [], score: 0 },
          { hand: [], pile: [], score: 0 },
        ],
        tableCards: [tableCard1, tableCard2],
        deck: gameState.deck,
        phase: "playing",
        currentPlayerIndex: 0,
        stats: { Scope: [0, 0] },
      });
      gameEngine.gameState = newGameState;

      const move = {
        card: handCard,
        capture: [tableCard1, tableCard2],
        isCapture: true,
        isScopa: true,
      };

      // When: Move attempted
      const result = gameEngine.playTurn(0, move);

      // Then: Should fail validation
      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid capture");
    });

    it("should accept capture where selected table sum matches played value", () => {
      // Given: Cards whose selected table values match played value
      const handCard = new Card("denari", "fante", 8);
      const tableCard1 = new Card("bastoni", "2", 2);
      const tableCard2 = new Card("spade", "6", 6);

      const newGameState = new GameState({
        ...gameEngine.config,
        players: [
          { hand: [handCard], pile: [], score: 0 },
          { hand: [], pile: [], score: 0 },
        ],
        tableCards: [tableCard1, tableCard2],
        deck: gameState.deck,
        phase: "playing",
        currentPlayerIndex: 0,
        stats: { Scope: [0, 0] },
      });
      gameEngine.gameState = newGameState;

      const move = {
        card: handCard,
        capture: [tableCard1, tableCard2],
        isCapture: true,
        isScopa: true,
      };

      // When: Move attempted
      const result = gameEngine.playTurn(0, move);

      // Then: Should succeed
      expect(result.success).toBe(true);
      expect(result.moveType).toBe("capture");
    });
  });
});
