/**
 * Test suite for Fante card inclusion.
 * Requirements: FR-1.1, FR-1.2, FR-2.1
 *
 * Note: the engine still stores legacy internal rank keys for compatibility
 * with older save data and the optional deck assets.
 */

import { describe, expect, it } from "vitest";
import { DealingEngine } from "../core/dealing.js";
import { Deck } from "../core/deck.js";
import { CardComponent } from "../ui/components/card.js";

describe("Fante Cards - Inclusion & Rendering", () => {
  it("should have exactly 4 Fante cards in deck", () => {
    // Given: preconditions for "should have exactly 4 Fante cards in deck" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const deck = new Deck();
    const fanti = deck.cards.filter((c) => c.rank === "fante");
    expect(fanti).toHaveLength(4);

    // Verify each suit has one Fante
    const suits = new Set(fanti.map((s) => s.suit));
    expect(suits).toEqual(new Set(["denari", "coppe", "spade", "bastoni"]));
  });

  it("should have Fante cards with value 8", () => {
    // Given: preconditions for "should have Fante cards with value 8" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const deck = new Deck();
    const fanti = deck.cards.filter((c) => c.rank === "fante");
    fanti.forEach((fante) => {
      expect(fante.value).toBe(8);
    });
  });

  it("should generate correct image path for Fante cards in the default deck", () => {
    // Given: preconditions for "should generate correct image path for Fante cards in the default deck" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const denariFante = { suit: "denari", rank: "fante", value: 8 };
    const cardComponent = new CardComponent(denariFante, "carte_merkel");
    const imagePath = cardComponent.getCardImagePath();
    expect(imagePath).toBe("img/deck/carte_merkel/denari_fante.svg");
  });

  it("should map Fante cards to optional deck assets", () => {
    // Given: preconditions for "should map Fante cards to optional deck assets" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const denariFante = { suit: "denari", rank: "fante", value: 8 };
    const cardComponent = new CardComponent(denariFante, "mazzo_spagnolo");
    const imagePath = cardComponent.getCardImagePath();
    expect(imagePath).toBe("img/deck/mazzo_spagnolo/oros_sota.svg");
  });

  it("should map suits and figure ranks to Spanish asset keys in mazzo_spagnolo", () => {
    // Given: canonical internal card keys
    const cards = [
      { suit: "denari", rank: "asso", value: 1 },
      { suit: "coppe", rank: "cavallo", value: 9 },
      { suit: "spade", rank: "re", value: 10 },
      { suit: "bastoni", rank: "fante", value: 8 },
    ];

    // When: resolving front-face image paths for Spanish deck
    const paths = cards.map(
      (card) => new CardComponent(card, "mazzo_spagnolo").getCardImagePath(),
    );

    // Then: paths should match generated Spanish filenames
    expect(paths).toEqual([
      "img/deck/mazzo_spagnolo/oros_as.svg",
      "img/deck/mazzo_spagnolo/copas_caballo.svg",
      "img/deck/mazzo_spagnolo/espadas_rey.svg",
      "img/deck/mazzo_spagnolo/bastos_sota.svg",
    ]);
  });

  it("should shuffle and preserve all Fante cards", () => {
    // Given: preconditions for "should shuffle and preserve all Fante cards" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const deck = new Deck();
    const shuffled = deck.shuffle();
    const fanti = shuffled.cards.filter((c) => c.rank === "fante");
    expect(fanti).toHaveLength(4);
  });

  it("should deal Fante cards in initial deal", () => {
    // Given: preconditions for "should deal Fante cards in initial deal" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    // Multiple games to increase probability of dealing a Fante
    let foundFanteDealt = false;

    for (let i = 0; i < 50 && !foundFanteDealt; i++) {
      const deck = new Deck().shuffle();
      const dealResult = DealingEngine.initialDeal(deck);

      const allDealtCards = [
        ...dealResult.p1Hand,
        ...dealResult.p2Hand,
        ...dealResult.tableCards,
      ];

      if (allDealtCards.some((c) => c.rank === "fante")) {
        foundFanteDealt = true;
      }
    }

    expect(foundFanteDealt).toBe(true);
  });

  it("should display Fante in card name", () => {
    // Given: preconditions for "should display Fante in card name" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const fante = { suit: "coppe", rank: "fante", value: 8 };
    const cardComponent = new CardComponent(fante);
    expect(cardComponent.getCardName()).toBe("fante di coppe");
  });
});
