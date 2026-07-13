/**
 * Test suite for Turn module
 * Tests: turn creation, card play, capture selection
 * Requirement: FR-3.2 (Turn structure)
 */

import { describe, expect, it } from "vitest";
import { Card } from "../core/card.js";
import { Turn } from "../core/turn.js";

describe("Turn", () => {
  it("should create turn for player", () => {
    // Given: a player and current table cards
    // When: creating a Turn instance
    // Then: turn metadata should be initialized for that player
    const player = { id: "p1", name: "Player 1" };
    const tableCards = [];

    const turn = new Turn(player, tableCards);
    expect(turn.player.id).toBe("p1");
    expect(turn.cardPlayed).toBeNull();
  });

  it("should play card", () => {
    // Given: an active turn and a card in hand
    // When: playing the card
    // Then: cardPlayed should store the played card
    const player = { id: "p1" };
    const card = new Card("denari", "5", 5);
    const turn = new Turn(player, []);

    const updated = turn.playCard(card);
    expect(updated.cardPlayed).toEqual(card);
  });

  it("should select capture", () => {
    // Given: a played card and a candidate capture set
    // When: selecting capture cards for the turn
    // Then: captureSet should contain selected table cards
    const player = { id: "p1" };
    const card = new Card("denari", "7", 7);
    const captureCards = [new Card("coppe", "7", 7)];

    const turn = new Turn(player, []).playCard(card);
    const updated = turn.selectCapture(captureCards);
    expect(updated.captureSet).toHaveLength(1);
  });

  it("should discard without capture", () => {
    // Given: a played card with no capture selection
    // When: choosing discard flow
    // Then: captureSet should remain empty
    const player = { id: "p1" };
    const card = new Card("denari", "3", 3);

    const turn = new Turn(player, []).playCard(card);
    const updated = turn.discard();
    expect(updated.captureSet).toHaveLength(0);
  });
});
