/**
 * Test suite for CaptureEngine module
 * Tests: capture validation, subset generation, preference rules
 * Requirements: FR-4.1, FR-4.4 (Capture mechanics)
 */

import { describe, expect, it } from "vitest";
import { CaptureEngine } from "../core/capture.js";
import { Card } from "../core/card.js";

describe("CaptureEngine", () => {
  it("should find valid multi-card captures that sum to played value", () => {
    // Given: a played card and multiple table-card combinations
    // When: querying valid capture sets
    // Then: multi-card combinations that match played value should be returned
    const playedCard = new Card("denari", "7", 7);
    const tableCards = [
      new Card("coppe", "3", 3),
      new Card("spade", "4", 4),
      new Card("bastoni", "asso", 1),
    ];

    const captures = CaptureEngine.getValidCaptures(playedCard, tableCards);
    expect(captures).toHaveLength(1);
    expect(captures[0]).toHaveLength(2);
  });

  it("should return exact single-card match when present", () => {
    // Given: an exact single-card match on the table
    // When: querying valid capture sets
    // Then: the exact single-card capture should be included
    const playedCard = new Card("denari", "5", 5);
    const tableCards = [
      new Card("coppe", "5", 5),
      new Card("spade", "2", 2),
      new Card("bastoni", "3", 3),
    ];

    const captures = CaptureEngine.getValidCaptures(playedCard, tableCards);
    expect(captures).toHaveLength(1);
    expect(captures[0]).toHaveLength(1);
    expect(captures[0][0].value).toBe(5);
  });

  it("should detect if capture is available", () => {
    // Given: a played card with at least one capture option
    // When: checking capture availability
    // Then: hasCapture should return true
    const playedCard = new Card("denari", "5", 5);
    const tableCards = [new Card("coppe", "2", 2), new Card("spade", "3", 3)];

    const has = CaptureEngine.hasCapture(playedCard, tableCards);
    expect(has).toBe(true);
  });

  it("should apply exact-match priority", () => {
    // Given: both single exact-match and multi-card sum captures
    // When: applying exact-match priority
    // Then: only exact-match captures should remain
    const singleCard = [[new Card("denari", "5", 5)]];
    const multiCard = [
      [new Card("denari", "2", 2), new Card("denari", "3", 3)],
    ];
    const captures = [...singleCard, ...multiCard];

    const preferred = CaptureEngine.applySingleComplementPreference(captures);
    expect(preferred).toHaveLength(1);
    expect(preferred[0]).toHaveLength(1);
  });
});
