/**
 * Advanced Evaluation Heuristics Tests
 * Tests for hand composition, capture sequences, endgame, forcing moves
 * Requirements: FR-12.4, FR-15.2
 *
 * Test Coverage:
 * - Hand flexibility scoring
 * - Hand commitment penalties
 * - Capture sequence bonuses
 * - Endgame detection
 * - Endgame position adjustments
 * - Forcing move detection
 * - Strategic position evaluation
 * - Move quality estimation
 */

import { describe, expect, it } from "vitest";
import {
  estimateMoveQuality,
  evaluateEndgamePosition,
  evaluatePositionStrategic,
  isEndgame,
  scoreForcing,
  scoreHandCommitment,
  scoreHandFlexibility,
  scoreSequentialCaptures,
} from "../ai/evaluation-heuristics.js";

describe("Hand Composition Scoring", () => {
  it("should score flexible hand with matching table cards", () => {
    // Given: preconditions for "should score flexible hand with matching table cards" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const hand = [
      { value: 3, suit: "spade" },
      { value: 7, suit: "denari" },
      { value: 5, suit: "coppe" },
    ];
    const tableCards = [
      { value: 3, suit: "bastoni" },
      { value: 7, suit: "spade" },
    ];

    const score = scoreHandFlexibility(hand, tableCards);
    // 2 cards match table (3 and 7), so 2 * 0.5 = 1.0
    expect(score).toBe(1.0);
  });

  it("should return 0 for hand with no matching cards", () => {
    // Given: preconditions for "should return 0 for hand with no matching cards" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const hand = [
      { value: 1, suit: "spade" },
      { value: 2, suit: "denari" },
    ];
    const tableCards = [
      { value: 5, suit: "bastoni" },
      { value: 6, suit: "coppe" },
    ];

    const score = scoreHandFlexibility(hand, tableCards);
    expect(score).toBe(0);
  });

  it("should return 0 for empty hand", () => {
    // Given: preconditions for "should return 0 for empty hand" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    expect(scoreHandFlexibility([], [])).toBe(0);
    expect(scoreHandFlexibility([], [{ value: 3 }])).toBe(0);
  });

  it("should score commitment penalty for unplayable cards", () => {
    // Given: preconditions for "should score commitment penalty for unplayable cards" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const hand = [
      { value: 1, suit: "spade" },
      { value: 2, suit: "denari" },
      { value: 3, suit: "coppe" },
    ];
    const tableCards = [{ value: 5, suit: "bastoni" }];

    // All 3 cards unplayable, penalty = 3 * 0.3 = 0.9
    const penalty = scoreHandCommitment(hand, tableCards);
    expect(penalty).toBeCloseTo(-0.9, 5);
  });

  it("should reduce commitment penalty when cards match", () => {
    // Given: preconditions for "should reduce commitment penalty when cards match" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const hand = [
      { value: 1, suit: "spade" },
      { value: 2, suit: "denari" },
      { value: 5, suit: "coppe" },
    ];
    const tableCards = [{ value: 5, suit: "bastoni" }];

    // Only 2 cards unplayable, penalty = 2 * 0.3 = 0.6
    const penalty = scoreHandCommitment(hand, tableCards);
    expect(penalty).toBe(-0.6);
  });
});

describe("Capture Sequence Scoring", () => {
  it("should give Scopa bonus for clearing table", () => {
    // Given: preconditions for "should give Scopa bonus for clearing table" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const move = {
      card: { value: 10, suit: "spade" },
      isCapture: true,
      capturedCards: [
        { value: 5, suit: "denari" },
        { value: 5, suit: "coppe" },
      ],
    };
    const hand = [{ value: 3, suit: "bastoni" }];
    const tableCards = [
      { value: 5, suit: "denari" },
      { value: 5, suit: "coppe" },
    ];

    const score = scoreSequentialCaptures(move, hand, tableCards);
    // No cards left on table after capture (Scopa) = 20.0 (scaled from 3.0)
    expect(score).toBe(20.0);
  });

  it("should bonus for follow-up capture opportunities", () => {
    // Given: preconditions for "should bonus for follow-up capture opportunities" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const move = {
      card: { value: 5, suit: "spade" },
      isCapture: true,
      capturedCards: [{ value: 5, suit: "denari" }],
    };
    const hand = [
      { value: 5, suit: "spade" },
      { value: 3, suit: "bastoni" },
      { value: 3, suit: "coppe" },
    ];
    const tableCards = [
      { value: 5, suit: "denari" },
      { value: 3, suit: "spade" },
    ];

    const score = scoreSequentialCaptures(move, hand, tableCards);
    // After capture: table has 3-spade
    // Hand has: 3-bastoni, 3-coppe that can follow up = 2 * 5.0
    expect(score).toBe(10.0);
  });

  it("should return 0 for non-capture moves", () => {
    // Given: preconditions for "should return 0 for non-capture moves" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const move = { card: { value: 3 }, isCapture: false };
    const score = scoreSequentialCaptures(move, [], []);
    expect(score).toBe(0);
  });

  it("should handle null move", () => {
    // Given: preconditions for "should handle null move" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const score = scoreSequentialCaptures(null, [], []);
    expect(score).toBe(0);
  });
});

describe("Endgame Detection", () => {
  it("should detect endgame when deck has 6 cards", () => {
    // Given: preconditions for "should detect endgame when deck has 6 cards" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const gameState = {
      deck: { cards: Array(6).fill({ value: 1 }) },
    };
    expect(isEndgame(gameState)).toBe(true);
  });

  it("should detect endgame when deck has fewer than 6 cards", () => {
    // Given: preconditions for "should detect endgame when deck has fewer than 6 cards" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const gameState = {
      deck: { cards: Array(3).fill({ value: 1 }) },
    };
    expect(isEndgame(gameState)).toBe(true);
  });

  it("should not detect endgame when deck has more than 6 cards", () => {
    // Given: preconditions for "should not detect endgame when deck has more than 6 cards" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const gameState = {
      deck: { cards: Array(20).fill({ value: 1 }) },
    };
    expect(isEndgame(gameState)).toBe(false);
  });

  it("should handle empty or missing deck", () => {
    // Given: preconditions for "should handle empty or missing deck" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    expect(isEndgame({ deck: null })).toBe(false);
    expect(isEndgame(null)).toBe(false);
    expect(isEndgame({ deck: { cards: [] } })).toBe(true);
  });
});

describe("Endgame Position Evaluation", () => {
  it("should add bonus for Scopa in endgame", () => {
    // Given: preconditions for "should add bonus for Scopa in endgame" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const gameState = {
      deck: { cards: Array(6).fill({ value: 1 }) },
    };
    const move = {
      isCapture: true,
      capturedCards: [
        { value: 5, suit: "denari" },
        { value: 5, suit: "coppe" },
        { value: 5, suit: "spade" },
      ],
    };

    const baseScore = 2;
    const adjusted = evaluateEndgamePosition(baseScore, move, gameState);
    // Scopa bonus (3+ cards) = 1.5 + base = 3.5
    expect(adjusted).toBeGreaterThan(baseScore);
  });

  it("should not adjust score outside endgame", () => {
    // Given: preconditions for "should not adjust score outside endgame" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const gameState = {
      deck: { cards: Array(20).fill({ value: 1 }) },
    };
    const move = { isCapture: true };

    const baseScore = 2;
    const adjusted = evaluateEndgamePosition(baseScore, move, gameState);
    expect(adjusted).toBe(baseScore);
  });

  it("should bonus high-value captures in endgame (7-denari, face cards)", () => {
    // Given: preconditions for "should bonus high-value captures in endgame (7-denari, face cards)" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const gameState = {
      deck: { cards: Array(3).fill({ value: 1 }) },
    };
    const move = {
      isCapture: true,
      capturedCards: [
        { value: 7, suit: "denari", rank: "7" },
        { value: 10, suit: "spade" },
      ],
    };

    const baseScore = 1;
    const adjusted = evaluateEndgamePosition(baseScore, move, gameState);
    // 7-denari + face card (2 high value) = 2 * 0.5 + Scopa check bonus
    expect(adjusted).toBeGreaterThan(baseScore);
  });
});

describe("Forcing Move Detection", () => {
  it("should give bonus when opponent has no moves", () => {
    // Given: preconditions for "should give bonus when opponent has no moves" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const move = { card: { value: 3 } };
    const opponentMoves = [];

    const score = scoreForcing(move, opponentMoves);
    expect(score).toBe(10.0);
  });

  it("should give bonus when opponent forced to single move", () => {
    // Given: preconditions for "should give bonus when opponent forced to single move" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const move = { card: { value: 3 } };
    const opponentMoves = [{ card: { value: 5 }, isCapture: true }];

    const score = scoreForcing(move, opponentMoves);
    expect(score).toBe(7.5);
  });

  it("should give bonus when all opponent moves are capture", () => {
    // Given: preconditions for "should give bonus when all opponent moves are capture" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const move = { card: { value: 3 } };
    const opponentMoves = [
      { card: { value: 5 }, isCapture: true },
      { card: { value: 7 }, isCapture: true },
    ];

    const score = scoreForcing(move, opponentMoves);
    expect(score).toBe(4.0);
  });

  it("should return 0 when opponent has good options", () => {
    // Given: preconditions for "should return 0 when opponent has good options" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const move = { card: { value: 3 } };
    const opponentMoves = [
      { card: { value: 5 }, isCapture: false },
      { card: { value: 7 }, isCapture: true },
      { card: { value: 3 }, isCapture: true },
    ];

    const score = scoreForcing(move, opponentMoves);
    expect(score).toBe(0);
  });
});

describe("Strategic Position Evaluation", () => {
  it("should combine all evaluation factors", () => {
    // Given: preconditions for "should combine all evaluation factors" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const gameState = {
      scores: [10, 8],
      currentPlayerIndex: 0,
      players: [{ hand: [{ value: 3 }] }, { hand: [] }],
      tableCards: [{ value: 3 }],
      deck: { cards: Array(20).fill({ value: 1 }) },
    };

    const move = {
      card: { value: 3, suit: "spade" },
      isCapture: true,
      capturedCards: [{ value: 3, suit: "denari" }],
    };

    const score = evaluatePositionStrategic(
      2,
      move,
      gameState.players[0].hand,
      gameState.tableCards,
      gameState,
      [],
    );

    // Should include base score + strategic bonuses
    expect(score).toBeGreaterThanOrEqual(2);
  });

  it("should handle null move gracefully", () => {
    // Given: preconditions for "should handle null move gracefully" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const gameState = {
      scores: [10, 8],
      currentPlayerIndex: 0,
      players: [{ hand: [{ value: 3 }] }, { hand: [] }],
      tableCards: [{ value: 5 }],
    };

    const score = evaluatePositionStrategic(
      0,
      null,
      gameState.players[0].hand,
      gameState.tableCards,
      gameState,
      [],
    );

    expect(typeof score).toBe("number");
  });
});

describe("Move Quality Estimation", () => {
  it("should prioritize captures over discards", () => {
    // Given: preconditions for "should prioritize captures over discards" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const captureMove = {
      card: { value: 5 },
      isCapture: true,
      capturedCards: [{ value: 5, suit: "denari" }],
    };
    const discardMove = { card: { value: 3 }, isCapture: false };

    const captureQuality = estimateMoveQuality(captureMove, [], []);
    const discardQuality = estimateMoveQuality(discardMove, [], []);

    expect(captureQuality).toBeGreaterThan(discardQuality);
  });

  it("should prioritize larger captures (Scope)", () => {
    // Given: preconditions for "should prioritize larger captures (Scope)" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const smallCapture = {
      card: { value: 5 },
      isCapture: true,
      capturedCards: [{ value: 5, suit: "denari" }],
    };
    const largeCapture = {
      card: { value: 10 },
      isCapture: true,
      capturedCards: [
        { value: 5, suit: "denari" },
        { value: 5, suit: "coppe" },
        { value: 5, suit: "spade" },
      ],
    };

    const smallQuality = estimateMoveQuality(smallCapture, [], []);
    const largeQuality = estimateMoveQuality(largeCapture, [], []);

    expect(largeQuality).toBeGreaterThan(smallQuality);
  });

  it("should deprioritize forced discards (no options)", () => {
    // Given: preconditions for "should deprioritize forced discards (no options)" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const forcedDiscard = {
      card: { value: 1 },
      isCapture: false,
    };
    const optionalDiscard = {
      card: { value: 3 },
      isCapture: false,
    };

    const hand = [{ value: 1 }, { value: 3 }];
    const tableCards = [{ value: 3, suit: "denari" }];

    const forcedQuality = estimateMoveQuality(forcedDiscard, hand, tableCards);
    const optionalQuality = estimateMoveQuality(
      optionalDiscard,
      hand,
      tableCards,
    );

    expect(optionalQuality).toBeGreaterThan(forcedQuality);
  });

  it("should give Scopa bonus for 4+ card captures", () => {
    // Given: preconditions for "should give Scopa bonus for 4+ card captures" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const smallCapture = {
      card: { value: 5 },
      isCapture: true,
      capturedCards: [{ value: 1 }, { value: 2 }],
    };
    const Scopa = {
      card: { value: 5 },
      isCapture: true,
      capturedCards: [{ value: 1 }, { value: 2 }, { value: 1 }, { value: 1 }],
    };

    const smallQuality = estimateMoveQuality(smallCapture, [], []);
    const ScopaQuality = estimateMoveQuality(Scopa, [], []);

    expect(ScopaQuality).toBeGreaterThan(smallQuality);
  });
});
