/**
 * Test suite for ScopaEngine module
 * Tests: Scopa detection, award mechanics
 * Requirements: FR-6.1, FR-6.2, FR-6.3, FR-6.4 (Scopa detection and scoring)
 */

import { describe, expect, it } from "vitest";
import { Card } from "../core/card.js";
import { isScoringScopa, isTableSweep, ScopaEngine } from "../core/scopa.js";

describe("ScopaEngine", () => {
  it("should detect Scopa when table is cleared", () => {
    // Given: a capture set that removes every table card
    const playedCard = new Card("denari", "7", 7);
    const tableCards = [new Card("coppe", "7", 7)];
    const captureSet = tableCards;

    // When: Scopa detection is evaluated
    const isScopa = ScopaEngine.isScopa(playedCard, tableCards, captureSet);

    // Then: the capture is recognized as a table-clearing sweep
    expect(isScopa).toBe(true);
  });

  it("should not detect Scopa when table partially captured", () => {
    // Given: a capture set that leaves table cards behind
    const playedCard = new Card("denari", "5", 5);
    const tableCards = [
      new Card("coppe", "2", 2),
      new Card("spade", "3", 3),
      new Card("bastoni", "4", 4),
    ];
    const captureSet = [new Card("coppe", "2", 2), new Card("spade", "3", 3)];

    // When: Scopa detection is evaluated
    const isScopa = ScopaEngine.isScopa(playedCard, tableCards, captureSet);

    // Then: the move is not an Scopa
    expect(isScopa).toBe(false);
  });

  it("should award Scopa to player", () => {
    // Given: a player with no recorded scope
    const player = { name: "Player 1", scope: 0 };

    // When: an Scopa point is awarded
    const updated = ScopaEngine.awardScopa(player);

    // Then: the Scopa counter increases by one
    expect(updated.scope).toBe(1);
  });

  it("should treat leftover final table award as no Scopa even when table is emptied", () => {
    // Given: no capture move, only the end-of-round automatic award semantics
    const scored = isScoringScopa({
      tableCards: [new Card("coppe", "7", 7)],
      captureSet: [],
      remainingHandCount: 0,
      remainingDeckCount: 0,
      enableFinalCardScopa: false,
    });

    // When: Scopa scoring helper is evaluated
    // Then: automatic final award can never score an Scopa
    expect(scored).toBe(false);
  });

  it("should allow Scopa on last card of an intermediate hand when stock remains", () => {
    // Given: last card in hand clears the table but stock still remains
    const scored = isScoringScopa({
      tableCards: [new Card("coppe", "7", 7)],
      captureSet: [new Card("coppe", "7", 7)],
      remainingHandCount: 0,
      remainingDeckCount: 6,
      enableFinalCardScopa: false,
    });

    // When: Scopa scoring helper is evaluated with the house rule enabled
    // Then: the move still counts because the round is not over yet
    expect(scored).toBe(true);
  });

  it("should suppress Scopa on the final card of the round when rule is disabled", () => {
    // Given: last card in hand clears the table and stock is exhausted
    const scored = isScoringScopa({
      tableCards: [new Card("coppe", "7", 7)],
      captureSet: [new Card("coppe", "7", 7)],
      remainingHandCount: 0,
      remainingDeckCount: 0,
      enableFinalCardScopa: false,
    });

    // When: Scopa scoring helper is evaluated with the default rule
    // Then: the final-round sweep does not score an Scopa
    expect(scored).toBe(false);
  });

  it("should score Scopa on the final card of the round when option is enabled", () => {
    // Given: last card in hand clears the table and stock is exhausted
    const scored = isScoringScopa({
      tableCards: [new Card("coppe", "7", 7)],
      captureSet: [new Card("coppe", "7", 7)],
      remainingHandCount: 0,
      remainingDeckCount: 0,
      enableFinalCardScopa: true,
    });

    // When: Scopa scoring helper is evaluated with the option enabled
    // Then: the final-round sweep scores normally
    expect(scored).toBe(true);
  });

  it("should identify a table sweep only when every table card is captured", () => {
    // Given: full and partial capture sets
    const tableCards = [new Card("coppe", "2", 2), new Card("denari", "3", 3)];

    // When: comparing full and partial sweep detection
    const fullSweep = isTableSweep(tableCards, [...tableCards]);
    const partialSweep = isTableSweep(tableCards, [tableCards[0]]);

    // Then: only the full capture set counts as a sweep
    expect(fullSweep).toBe(true);
    expect(partialSweep).toBe(false);
  });
});
