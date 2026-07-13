/**
 * Test suite for ScoringEngine module
 * Tests: all 5 scoring categories
 * Requirements: FR-8.1, FR-8.2, FR-8.3, FR-8.4, FR-8.5 (Scoring rules)
 */

import { describe, expect, it } from "vitest";
import { Card } from "../core/card.js";
import { ScoringEngine } from "../core/scoring.js";

describe("ScoringEngine", () => {
  it("should score cards category correctly", () => {
    // Given: captured-card totals for both players
    // When: scoring the cards category
    // Then: majority player should receive the category point
    const result1 = ScoringEngine.scoreCards(25, 15);
    expect(result1.p1).toBe(1);
    expect(result1.p2).toBe(0);

    const result2 = ScoringEngine.scoreCards(15, 15);
    expect(result2.p1).toBe(0);
    expect(result2.p2).toBe(0);
  });

  it("should score denari category correctly", () => {
    // Given: denari counts for both players
    // When: scoring the denari category
    // Then: player with more denari should receive one point
    const result = ScoringEngine.scoreDenari(7, 3);
    expect(result.p1).toBe(1);
    expect(result.p2).toBe(0);
  });

  it("should score 7 of denari correctly", () => {
    // Given: ownership state of 7 of denari
    // When: scoring settebello category
    // Then: owning player should receive one point
    const result1 = ScoringEngine.scoreSettebello(true, false);
    expect(result1.p1).toBe(1);
    expect(result1.p2).toBe(0);

    const result2 = ScoringEngine.scoreSettebello(false, false);
    expect(result2.p1).toBe(0);
    expect(result2.p2).toBe(0);
  });

  it("should score Scope correctly", () => {
    // Given: per-player scopa counts
    // When: scoring scope
    // Then: each player should receive points equal to scopa count
    const result = ScoringEngine.scoreScope(3, 2);
    expect(result.p1).toBe(3);
    expect(result.p2).toBe(2);
  });

  it("should score Settanta using Primiera method from rules", () => {
    // Given: captured piles evaluated with Primiera method
    // When: scoring Settanta/Primiera category
    // Then: player with stronger Primiera vector should receive one point
    const p1Cards = [
      new Card("denari", "7", 7),
      new Card("coppe", "7", 7),
      new Card("spade", "6", 6),
      new Card("bastoni", "5", 5),
    ];

    const p2Cards = [
      new Card("denari", "7", 7),
      new Card("coppe", "7", 7),
      new Card("spade", "asso", 1),
      new Card("bastoni", "asso", 1),
    ];

    const result = ScoringEngine.scoreSettanta("prime", p1Cards, p2Cards);
    expect(result).toEqual({ p1: 1, p2: 0 });
  });

  it("should tie Settanta when Primiera vectors are equal", () => {
    // Given: equal Primiera vectors for both players
    // When: scoring Settanta/Primiera category
    // Then: no player should receive the category point
    const p1Cards = [
      new Card("denari", "7", 7),
      new Card("coppe", "6", 6),
      new Card("spade", "asso", 1),
      new Card("bastoni", "5", 5),
    ];
    const p2Cards = [
      new Card("denari", "7", 7),
      new Card("coppe", "6", 6),
      new Card("spade", "asso", 1),
      new Card("bastoni", "5", 5),
    ];

    const result = ScoringEngine.scoreSettanta("prime", p1Cards, p2Cards);
    expect(result).toEqual({ p1: 0, p2: 0 });
  });
});
