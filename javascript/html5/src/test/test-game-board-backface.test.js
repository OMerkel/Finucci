/**
 * Test suite for GameBoard backface asset resolution.
 * Requirements: FR-UI-2.1, FR-UI-2.2, FR-UI-2.3
 */

import { describe, expect, it } from "vitest";
import { Card } from "../core/card.js";
import { GameBoard } from "../ui/components/game-board.js";

function createGameState() {
  return {
    currentPlayerIndex: 0,
    dealerIndex: 1,
    players: [
      {
        score: 0,
        hand: [new Card("denari", "5", 5)],
        pile: [],
      },
      {
        score: 0,
        hand: [new Card("coppe", "3", 3), new Card("spade", "6", 6)],
        pile: [],
      },
    ],
    tableCards: [new Card("bastoni", "2", 2)],
    deck: { cards: [new Card("denari", "asso", 1)] },
    stats: { Scope: [0, 0] },
    phase: "playing",
  };
}

describe("GameBoard backface image mapping", () => {
  it("should use carte_da_gioco_italiane_back.svg for default carte_merkel deck", () => {
    // Given: default deck with hidden north hand cards
    const board = new GameBoard(createGameState(), "carte_merkel", ["human", "ai"]);

    // When: rendering board element
    const element = board.createElement();

    // Then: hidden card backs should use the Italian backface asset
    const hiddenBackImage = element.querySelector(
      ".player-area-north .card-back .card-image",
    );
    expect(hiddenBackImage).not.toBeNull();
    expect(hiddenBackImage.getAttribute("src")).toContain(
      "img/deck/carte_merkel/carte_da_gioco_italiane_back.svg",
    );
  });

  it("should use the same mapped backface for deck pile in default deck", () => {
    // Given: default deck with remaining stock cards
    const board = new GameBoard(createGameState(), "carte_merkel", ["human", "ai"]);

    // When: rendering board element
    const element = board.createElement();

    // Then: deck pile back should use the Italian backface asset
    const deckBack = element.querySelector(".deck-back");
    expect(deckBack).not.toBeNull();
    expect(deckBack.getAttribute("src")).toContain(
      "img/deck/carte_merkel/carte_da_gioco_italiane_back.svg",
    );
  });

  it("should use baraja_espanola_back.svg for mazzo_spagnolo deck", () => {
    // Given: Spanish deck selection with hidden north hand cards
    const board = new GameBoard(createGameState(), "mazzo_spagnolo", ["human", "ai"]);

    // When: rendering board element
    const element = board.createElement();

    // Then: hidden card backs should use the Spanish backface asset
    const hiddenBackImage = element.querySelector(
      ".player-area-north .card-back .card-image",
    );
    expect(hiddenBackImage).not.toBeNull();
    expect(hiddenBackImage.getAttribute("src")).toContain(
      "img/deck/mazzo_spagnolo/baraja_espanola_back.svg",
    );
  });
});
