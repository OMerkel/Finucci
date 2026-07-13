/**
 * Test suite for Card module
 * Tests: card creation, equality, display
 * Requirement: FR-1.1 (Deck composition - individual cards)
 */

import { describe, expect, it } from "vitest";
import { Card } from "../core/card.js";

describe("Card", () => {
  it("should create a card with suit, rank, and value", () => {
    // Given: suit "denari", rank "asso", and value 1
    // When: creating a card instance
    // Then: card fields should match the provided values
    const card = new Card("denari", "asso", 1);
    expect(card.suit).toBe("denari");
    expect(card.rank).toBe("asso");
    expect(card.value).toBe(1);
  });

  it("should be immutable (frozen)", () => {
    // Given: a created card instance
    // When: attempting to mutate a frozen property
    // Then: mutation should fail
    const card = new Card("denari", "asso", 1);
    expect(() => {
      card.value = 2;
    }).toThrow();
  });

  it("should have correct display name", () => {
    // Given: a created card
    // When: reading the display name
    // Then: display name should be human-readable and deterministic
    const card = new Card("denari", "asso", 1);
    expect(card.displayName).toBe("asso di denari");
  });

  it("should compare cards for equality", () => {
    // Given: cards with same and different suit/rank combinations
    // When: comparing cards for equality
    // Then: identical cards should match and different cards should not
    const card1 = new Card("denari", "asso", 1);
    const card2 = new Card("denari", "asso", 1);
    const card3 = new Card("coppe", "asso", 1);
    expect(card1.equals(card2)).toBe(true);
    expect(card1.equals(card3)).toBe(false);
  });

  it("should have proper string representation", () => {
    // Given: a card with known rank and suit
    // When: converting it to string
    // Then: string representation should match expected format
    const card = new Card("spade", "7", 7);
    expect(card.toString()).toBe("7 di spade");
  });
});
