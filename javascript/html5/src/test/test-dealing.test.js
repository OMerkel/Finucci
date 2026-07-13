/**
 * Test suite for Dealing module
 * Tests: initial deal, re-deal, final card award
 * Requirements: FR-2.1, FR-2.2, FR-7.2 (Dealing mechanics)
 */

import { describe, expect, it } from "vitest";
import { DealingEngine } from "../core/dealing.js";
import { Deck } from "../core/deck.js";

describe("DealingEngine", () => {
  it("should execute initial deal correctly", () => {
    // Given: a shuffled full deck
    // When: executing initialDeal
    // Then: each player and table should receive correct card counts
    const deck = new Deck().shuffle();
    const result = DealingEngine.initialDeal(deck);

    expect(result.p1Hand).toHaveLength(3);
    expect(result.p2Hand).toHaveLength(3);
    expect(result.tableCards).toHaveLength(4);
    expect(result.remainingDeck.remaining).toBe(30);
  });

  it("should handle re-deal", () => {
    // Given: a deck state ready for next hand deal
    // When: executing reDeal
    // Then: both players should receive new cards and deck should shrink
    const deck = new Deck([]);
    for (let i = 0; i < 30; i++) {
      deck.cards.push(
        new (require("../core/card.js").Card)("denari", "asso", 1),
      );
    }

    const result = DealingEngine.reDeal(deck);
    expect(result.p1Hand).toHaveLength(3);
    expect(result.p2Hand).toHaveLength(3);
    expect(result.remainingDeck.remaining).toBe(24);
  });

  it("should award final table cards to last capturer", () => {
    // Given: leftover table cards and the last capturer
    // When: awarding final cards
    // Then: leftover cards should be moved to the capturer pile
    const player = { name: "Player 1", pile: [] };
    const tableCards = [
      new (require("../core/card.js").Card)("denari", "2", 2),
    ];

    const updated = DealingEngine.awardFinalCards(tableCards, player);
    expect(updated.pile).toHaveLength(1);
  });
});
