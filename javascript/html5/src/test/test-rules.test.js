/**
 * Test suite for RulesEngine module
 * Tests: forced capture, special initial conditions, move validation
 * Requirements: FR-4.1, FR-4.3 (Game rules)
 */

import { describe, expect, it } from "vitest";
import { Card } from "../core/card.js";
import { RulesEngine } from "../core/rules.js";

describe("RulesEngine", () => {
  it("should detect forced capture when exact match exists", () => {
    // Given: a played card with a valid table capture
    // When: checking forced-capture status
    // Then: forced-capture should be reported as true
    const tableCards = [
      new Card("denari", "5", 5),
      new Card("coppe", "7", 7),
      new Card("spade", "3", 3),
    ];
    const playedCard = new Card("bastoni", "5", 5);

    const isForced = RulesEngine.isCaptureForced(playedCard, tableCards);
    expect(isForced).toBe(true);
  });

  it("should validate valid move without capture", () => {
    // Given: a move where no legal capture exists
    // When: validating the move
    // Then: discard-only move should be accepted
    const playedCard = new Card("denari", "5", 5);
    const tableCards = [new Card("coppe", "3", 3)];

    const result = RulesEngine.validateMove(playedCard, tableCards, []);
    expect(result.valid).toBe(true);
  });

  it("should invalidate move with incorrect capture sum", () => {
    // Given: selected capture cards that do not match played value
    // When: validating the move
    // Then: validation should fail
    const playedCard = new Card("denari", "7", 7);
    const tableCards = [new Card("coppe", "2", 2), new Card("spade", "3", 3)];
    const selectedCapture = [new Card("coppe", "2", 2)];

    const result = RulesEngine.validateMove(
      playedCard,
      tableCards,
      selectedCapture,
    );
    expect(result.valid).toBe(false);
  });
});
