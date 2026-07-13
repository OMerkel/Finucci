/**
 * Test suite for game message templates.
 * Requirements: NFR-4.1, NFR-4.2
 */

import { describe, expect, it } from "vitest";

import { GAME_MESSAGES } from "../config/messages.js";

describe("Game Messages", () => {
  it("exposes key static messages", () => {
    // Given: preconditions for "exposes key static messages" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    // Given static UI messages, when read directly, then canonical text is stable.
    expect(GAME_MESSAGES.EMPTY_HAND).toBe("No cards in hand");
    expect(GAME_MESSAGES.INVALID_MOVE_GENERIC).toBe(
      "Invalid move. Please try again.",
    );
    expect(GAME_MESSAGES.SCOPA_TOAST).toBe("🧹 ¡Scopa! +1 point 🧹");
    expect(GAME_MESSAGES.ROUND_COMPLETE_TOAST).toContain("Round complete");
  });

  it("formats invalid capture sum message", () => {
    // Given: preconditions for "formats invalid capture sum message" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    // Given capture values, when formatting, then the message explains mismatch.
    const msg = GAME_MESSAGES.INVALID_CAPTURE_SUM(7, 6, 13);
    expect(msg).toBe(
      "Invalid capture! Table sum 6 does not match played value 7 (total 13).",
    );
  });

  it("formats dynamic move and ai errors", () => {
    // Given: preconditions for "formats dynamic move and ai errors" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    // Given runtime error details, when interpolated, then user-facing error text is deterministic.
    expect(GAME_MESSAGES.INVALID_MOVE_ERROR("bad move")).toBe(
      "Invalid move: bad move",
    );
    expect(GAME_MESSAGES.AI_MOVE_INVALID("bad ai move")).toBe(
      "AI move invalid: bad ai move",
    );
  });

  it("formats preview and resolution messages", () => {
    // Given: preconditions for "formats preview and resolution messages" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    // Given move context, when building preview/resolution text, then descriptions stay consistent.
    const handCard = { rank: "7", suit: "denari" };

    expect(GAME_MESSAGES.PREVIEW_DISCARD(handCard)).toBe(
      "Preview discard: play 7 di denari to table.",
    );
    expect(GAME_MESSAGES.PREVIEW_CAPTURE("7 + 8", 15)).toBe(
      "Preview capture: selected table cards 7 + 8 = 15.",
    );
    expect(GAME_MESSAGES.PREVIEW_SCOPA("7 + 8", 15)).toContain("Scopa");

    expect(GAME_MESSAGES.RESOLUTION_DISCARD(handCard)).toBe(
      "Discarded 7 di denari to the table.",
    );
    expect(GAME_MESSAGES.RESOLUTION_CAPTURE(2, "7 + 8", 15)).toBe(
      "Captured 2 card(s): table sum 7 + 8 = 15.",
    );
    expect(GAME_MESSAGES.RESOLUTION_SCOPA_SUFFIX).toContain("Scopa");
  });
});
