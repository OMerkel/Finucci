/**
 * Test suite for Deck module
 * Tests: deck creation, shuffling, drawing cards
 * Requirements: FR-1.1, FR-1.2, FR-17.5 (Deck composition and shuffle behavior)
 */

import { describe, expect, it } from "vitest";
import { Deck } from "../core/deck.js";

describe("Deck", () => {
  it("should create a complete 40-card deck", () => {
    // Given: no pre-existing deck state
    // When: creating a new deck
    // Then: the deck should contain exactly 40 cards
    const deck = new Deck();
    expect(deck.cards).toHaveLength(40);
  });

  it("should have 10 cards per suit", () => {
    // Given: a complete deck
    // When: grouping cards by suit
    // Then: each suit should contain exactly 10 cards
    const deck = new Deck();
    const suits = ["denari", "coppe", "spade", "bastoni"];
    for (const suit of suits) {
      const suitCards = deck.cards.filter((card) => card.suit === suit);
      expect(suitCards).toHaveLength(10);
    }
  });

  it("should shuffle deck and produce different order", () => {
    // Given: a deck in original order
    // When: shuffling the deck
    // Then: resulting order should differ (with high probability)
    const deck = new Deck();
    const original = deck.cards.map((c) => c.displayName).join(",");
    const shuffled = deck.shuffle();
    const shuffledStr = shuffled.cards.map((c) => c.displayName).join(",");
    expect(shuffledStr).not.toBe(original);
  });

  it("should draw n cards from deck", () => {
    // Given: a full deck
    // When: drawing five cards
    // Then: five cards are drawn and remaining count decreases accordingly
    const deck = new Deck();
    const { drawn, remaining } = deck.draw(5);
    expect(drawn).toHaveLength(5);
    expect(remaining.remaining).toBe(35);
  });

  it("should indicate when deck is empty", () => {
    // Given: an empty deck
    // When: reading isEmpty
    // Then: isEmpty should be true
    const deck = new Deck([]);
    expect(deck.isEmpty).toBe(true);
  });

  it("should produce deterministic order for the same seed", () => {
    // Given: a deterministic shuffle seed
    // When: shuffling multiple times with the same seed
    // Then: resulting orders should be identical
    const deck = new Deck();
    const seed = "replay-seed-42";

    const a = deck
      .shuffleDeterministic(seed)
      .cards.map((c) => c.displayName)
      .join(",");
    const b = deck
      .shuffleDeterministic(seed)
      .cards.map((c) => c.displayName)
      .join(",");

    expect(a).toBe(b);
  });

  it("should produce different orders for different seeds", () => {
    // Given: two different deterministic shuffle seeds
    // When: shuffling with each seed
    // Then: resulting orders should differ
    const deck = new Deck();

    const a = deck
      .shuffleDeterministic("seed-a")
      .cards.map((c) => c.displayName)
      .join(",");
    const b = deck
      .shuffleDeterministic("seed-b")
      .cards.map((c) => c.displayName)
      .join(",");

    expect(a).not.toBe(b);
  });

  it("should have correct card values", () => {
    // Given: a complete deck
    // When: checking representative rank values
    // Then: value mapping should follow Scopa rules
    const deck = new Deck();
    const as = deck.cards.find((c) => c.rank === "asso");
    expect(as.value).toBe(1);

    const re = deck.cards.find((c) => c.rank === "re");
    expect(re.value).toBe(10);
  });
});
