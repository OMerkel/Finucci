/**
 * ScoringEngine calculates scores from captured cards.
 * Handles: all 5 scoring categories (Cards, Denari, Settebello, Settanta, Scope)
 * Requirement: FR-8 (Scoring rules)
 */
export const ScoringEngine = {
  /**
   * Score cards category (majority)
   * @param {number} cardsPlayer1
   * @param {number} cardsPlayer2
   * @returns {Object} {p1: 0|1, p2: 0|1}
   */
  scoreCards(cardsPlayer1, cardsPlayer2) {
    if (cardsPlayer1 > cardsPlayer2) return { p1: 1, p2: 0 };
    if (cardsPlayer2 > cardsPlayer1) return { p1: 0, p2: 1 };
    return { p1: 0, p2: 0 };
  },

  /**
   * Score denari category (majority)
   * @param {number} denariPlayer1
   * @param {number} denariPlayer2
   * @returns {Object} {p1: 0|1, p2: 0|1}
   */
  scoreDenari(denariPlayer1, denariPlayer2) {
    if (denariPlayer1 > denariPlayer2) return { p1: 1, p2: 0 };
    if (denariPlayer2 > denariPlayer1) return { p1: 0, p2: 1 };
    return { p1: 0, p2: 0 };
  },

  /**
   * Score settebello (7 of denari)
   * @param {boolean} player1Has
   * @param {boolean} player2Has
   * @returns {Object} {p1: 0|1, p2: 0|1}
   */
  scoreSettebello(player1Has, player2Has) {
    if (player1Has) return { p1: 1, p2: 0 };
    if (player2Has) return { p1: 0, p2: 1 };
    return { p1: 0, p2: 0 };
  },

  /**
  * Score Settanta/Primiera (method-dependent)
   * @param {string} method "prime" | "simplified" | "numerical"
   * @param {Array} cardsPlayer1
   * @param {Array} cardsPlayer2
   * @returns {Object} {p1: 0|1|2, p2: 0|1|2}
   */
  scoreSettanta(method, cardsPlayer1, cardsPlayer2) {
    const p1Cards = cardsPlayer1 || [];
    const p2Cards = cardsPlayer2 || [];

    if (method === "simplified") {
      const p1Sevens = p1Cards.filter((c) => c.rank === "7").length;
      const p2Sevens = p2Cards.filter((c) => c.rank === "7").length;
      if (p1Sevens > p2Sevens) return { p1: 1, p2: 0 };
      if (p2Sevens > p1Sevens) return { p1: 0, p2: 1 };
      return { p1: 0, p2: 0 };
    }

    if (method === "numerical") {
      const numericalWeight = {
        7: 21,
        6: 18,
        asso: 16,
        5: 15,
        4: 14,
        3: 13,
        2: 12,
        fante: 10,
        cavallo: 10,
        re: 10,
      };

      const p1Score = scoreBestPerSuit(p1Cards, numericalWeight);
      const p2Score = scoreBestPerSuit(p2Cards, numericalWeight);

      if (p1Score > p2Score) return { p1: 1, p2: 0 };
      if (p2Score > p1Score) return { p1: 0, p2: 1 };
      return { p1: 0, p2: 0 };
    }

    // Default and recommended rules.md path: Primiera-style lexicographic comparison
    const primeRank = {
      7: 8,
      6: 7,
      asso: 6,
      5: 5,
      4: 4,
      3: 3,
      2: 2,
      fante: 1,
      cavallo: 1,
      re: 1,
    };

    const p1Vector = primeVectorByBestPerSuit(p1Cards, primeRank);
    const p2Vector = primeVectorByBestPerSuit(p2Cards, primeRank);

    for (let i = 0; i < p1Vector.length; i++) {
      if (p1Vector[i] > p2Vector[i]) return { p1: 1, p2: 0 };
      if (p2Vector[i] > p1Vector[i]) return { p1: 0, p2: 1 };
    }

    return { p1: 0, p2: 0 };
  },

  /**
   * Score Scope (sweep count)
   * @param {number} ScopePlayer1
   * @param {number} ScopePlayer2
   * @returns {Object} {p1: ScopePlayer1, p2: ScopePlayer2}
   */
  scoreScope(ScopePlayer1, ScopePlayer2) {
    return { p1: ScopePlayer1, p2: ScopePlayer2 };
  },
};

function scoreBestPerSuit(cards, weightByRank) {
  const suits = ["denari", "coppe", "spade", "bastoni"];
  let total = 0;

  for (const suit of suits) {
    let best = 0;
    for (const card of cards) {
      if (card.suit !== suit) continue;
      const value = weightByRank[card.rank] || 0;
      if (value > best) best = value;
    }
    total += best;
  }

  return total;
}

function primeVectorByBestPerSuit(cards, primeRank) {
  const suits = ["denari", "coppe", "spade", "bastoni"];
  const bestPerSuit = [];

  for (const suit of suits) {
    let best = 0;
    for (const card of cards) {
      if (card.suit !== suit) continue;
      const value = primeRank[card.rank] || 0;
      if (value > best) best = value;
    }
    bestPerSuit.push(best);
  }

  return bestPerSuit.sort((a, b) => b - a);
}
