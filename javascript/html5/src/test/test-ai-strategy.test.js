/**
 * Test suite for AI Strategy
 * Tests: greedy heuristic evaluation, move prioritization
 * Requirements: FR-15.1, FR-15.2, FR-12.4 (Greedy AI strategy)
 */

import { describe, expect, it } from "vitest";
import {
  evaluateMoveQuality,
  prioritizeScope,
  prioritizeSettebello,
  selectGreedyMove,
  selectHighestValueCapture,
  selectSafeDiscard,
} from "../ai/ai-strategy.js";
import { selectMomentumMove } from "../ai/greedy-variants.js";
import { Card } from "../core/card.js";

describe("AI Strategy - Greedy", () => {
  describe("Move Quality Evaluation", () => {
    it("should prioritize Scope", () => {
      // Given: two moves, one is Scopa
      const normalCapture = {
        card: new Card("denari", "7", 7),
        isCapture: true,
        isScopa: false,
      };
      const ScopaMove = {
        card: new Card("bastoni", "3", 3),
        isCapture: true,
        isScopa: true,
      };

      // When: evaluating moves
      const normalScore = evaluateMoveQuality(normalCapture, {});
      const scopeScore = evaluateMoveQuality(ScopaMove, {});

      // Then: Scopa should score much higher (+1000)
      expect(scopeScore).toBeGreaterThan(normalScore + 500);
    });

    it("should prioritize settebello (7 of denari)", () => {
      // Given: two captures
      const settebello = {
        card: new Card("denari", "7", 7),
        isCapture: true,
        isScopa: false,
      };
      const otherCard = {
        card: new Card("coppe", "5", 5),
        isCapture: true,
        isScopa: false,
      };

      // When: evaluating
      const sevenScore = evaluateMoveQuality(settebello, {});
      const otherScore = evaluateMoveQuality(otherCard, {});

      // Then: settebello should score higher
      expect(sevenScore).toBeGreaterThan(otherScore);
    });

    it("should score discards lower than captures", () => {
      // Given: capture vs discard
      const capture = {
        card: new Card("spade", "4", 4),
        isCapture: true,
      };
      const discard = {
        card: new Card("bastoni", "6", 6),
        isCapture: false,
      };

      // When: evaluating
      const captureScore = evaluateMoveQuality(capture, {});
      const discardScore = evaluateMoveQuality(discard, {});

      // Then: capture scores higher
      expect(captureScore).toBeGreaterThan(discardScore);
    });

    it("should prefer low-value discards over high-value", () => {
      // Given: two discard options
      const lowDiscard = {
        card: new Card("spade", "2", 2),
        isCapture: false,
      };
      const highDiscard = {
        card: new Card("bastoni", "re", 10),
        isCapture: false,
      };

      // When: evaluating
      const lowScore = evaluateMoveQuality(lowDiscard, {});
      const highScore = evaluateMoveQuality(highDiscard, {});

      // Then: low-value card scores higher for discard
      expect(lowScore).toBeGreaterThan(highScore);
    });

    it("should penalize risky discards of scoring cards", () => {
    // Given: preconditions for "should prioritize Scope" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
      const riskyDiscard = {
        card: new Card("denari", "7", 7),
        isCapture: false,
      };
      const saferDiscard = {
        card: new Card("bastoni", "7", 7),
        isCapture: false,
      };
      const gameState = {
        tableCards: [new Card("coppe", "7", 7)],
      };

      const riskyScore = evaluateMoveQuality(riskyDiscard, gameState);
      const saferScore = evaluateMoveQuality(saferDiscard, gameState);

      expect(saferScore).toBeGreaterThan(riskyScore);
    });
  });

  describe("Greedy Move Selection", () => {
    it("should select Scopa when available", () => {
      // Given: hand and table with Scopa possibility
      const hand = [new Card("denari", "5", 5)];
      const tableCards = [new Card("coppe", "2", 2), new Card("spade", "3", 3)];
      const gameState = {};

      // When: selecting greedy move
      const move = selectGreedyMove(hand, tableCards, gameState);

      // Then: should select the move
      expect(move).not.toBeNull();
      expect(move.card.rank).toBe("5");
    });

    it("should select settebello when available", () => {
      // Given: hand with settebello (internal suit key: denari)
      const hand = [new Card("denari", "7", 7), new Card("bastoni", "2", 2)];
      const tableCards = [new Card("coppe", "3", 3)]; // Not capturable by settebello
      const gameState = {};

      // When: selecting greedy move
      const move = selectGreedyMove(hand, tableCards, gameState);

      // Then: should select a move (will be discard)
      expect(move).not.toBeNull();
      expect(move.card).toBeDefined();
    });

    it("should select safe discard when no capture possible", () => {
      // Given: hand and table with no captures
      const hand = [
        new Card("spade", "re", 10),
        new Card("bastoni", "2", 2),
        new Card("coppe", "fante", 8),
      ];
      const tableCards = [new Card("denari", "cavallo", 9)];
      const gameState = {};

      // When: selecting discard
      const move = selectGreedyMove(hand, tableCards, gameState);

      // Then: should select lowest value card (2 of bastoni)
      expect(move).not.toBeNull();
      expect(move.isCapture).toBe(false);
      expect(move.card.rank).toBe("2");
    });

    it("should return null for empty hand", () => {
      // Given: empty hand
      const hand = [];
      const tableCards = [new Card("denari", "5", 5)];
      const gameState = {};

      // When: selecting move
      const move = selectGreedyMove(hand, tableCards, gameState);

      // Then: should return null
      expect(move).toBeNull();
    });

    it("should prefer a capture that includes a denari table card", () => {
      // Given: two exact-match captures for same hand card (one includes denari)
      const hand = [new Card("spade", "5", 5)];
      const tableCards = [
        new Card("coppe", "5", 5),
        new Card("denari", "5", 5),
      ];

      // When: selecting greedy move
      const move = selectGreedyMove(hand, tableCards, {});

      // Then: capture should include the denari card
      expect(move).not.toBeNull();
      expect(move.isCapture).toBe(true);
      expect(move.capture.some((card) => card.suit === "denari")).toBe(true);
    });

    it("should avoid discarding denari seven when safer discard exists", () => {
    // Given: preconditions for "should select Scopa when available" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
      const hand = [new Card("denari", "7", 7), new Card("bastoni", "6", 6)];
      const tableCards = [new Card("coppe", "5", 5)];

      const move = selectGreedyMove(hand, tableCards, { tableCards });

      expect(move).not.toBeNull();
      expect(move.isCapture).toBe(false);
      expect(move.card.rank).toBe("6");
      expect(move.card.suit).toBe("bastoni");
    });
  });

  describe("Momentum Variant", () => {
    it("should work with currentPlayerIndex from game state", () => {
    // Given: preconditions for "should work with currentPlayerIndex from game state" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
      const hand = [new Card("denari", "5", 5), new Card("bastoni", "2", 2)];
      const tableCards = [new Card("coppe", "3", 3)];
      const gameState = {
        targetScore: 11,
        currentPlayerIndex: 1,
        players: [{ score: 2 }, { score: 6 }],
        deck: { cards: [] },
        enableFinalCardScopa: false,
      };

      const move = selectMomentumMove(hand, tableCards, gameState);

      expect(move).not.toBeNull();
      expect(move.card).toBeDefined();
    });
  });

  describe("Move Priority Functions", () => {
    it("should identify Scopa moves", () => {
      // Given: Scopa move
      const ScopaMove = {
        card: new Card("bastoni", "3", 3),
        isScopa: true,
        isCapture: true,
      };
      const normalMove = {
        card: new Card("bastoni", "3", 3),
        isScopa: false,
        isCapture: true,
      };

      // When: checking priority
      // Then: only Scopa returns true
      expect(prioritizeScope(ScopaMove)).toBe(true);
      expect(prioritizeScope(normalMove)).toBe(false);
    });

    it("should identify settebello", () => {
      // Given: settebello move
      const settebello = {
        card: new Card("denari", "7", 7),
        isCapture: true,
      };
      const otherSeven = {
        card: new Card("coppe", "7", 7),
        isCapture: true,
      };

      // When: checking priority
      // Then: only settebello returns true
      expect(prioritizeSettebello(settebello)).toBe(true);
      expect(prioritizeSettebello(otherSeven)).toBe(false);
    });
  });

  describe("Card Selection Helpers", () => {
    it("should select highest value capture", () => {
      // Given: valid moves
      const moves = [
        { card: new Card("denari", "3", 3), isCapture: true },
        { card: new Card("coppe", "7", 7), isCapture: true },
        { card: new Card("spade", "5", 5), isCapture: true },
      ];

      // When: selecting highest
      const selected = selectHighestValueCapture(moves);

      // Then: should select 7 of coppe
      expect(selected.card.rank).toBe("7");
    });

    it("should select safe discard (lowest value)", () => {
      // Given: hand
      const hand = [
        new Card("denari", "re", 10),
        new Card("coppe", "2", 2),
        new Card("spade", "5", 5),
      ];

      // When: selecting discard
      const selected = selectSafeDiscard(hand);

      // Then: should select 2 of coppe
      expect(selected.rank).toBe("2");
    });
  });
});
