/**
 * Deck represents the 40-card Scopa deck.
 *
 * @class Deck
 * Manages deck creation, shuffling, and dealing mechanics.
 * Implements Fisher-Yates shuffle for randomization.
 *
 * Internal suit/rank keys remain stable for existing tests, SGF, and
 * optional alternate deck asset mapping.
 */

import { Card } from "./card.js";

const SUITS = ["denari", "coppe", "spade", "bastoni"];
const RANKS = [
  { key: "asso", value: 1 },
  { key: "2", value: 2 },
  { key: "3", value: 3 },
  { key: "4", value: 4 },
  { key: "5", value: 5 },
  { key: "6", value: 6 },
  { key: "7", value: 7 },
  { key: "fante", value: 8 },
  { key: "cavallo", value: 9 },
  { key: "re", value: 10 },
];

export class Deck {
  constructor(cards = null) {
    this.cards = cards || this._createDeck();
  }

  /**
   * Create a complete 40-card Scopa deck
   * @private
   * @returns {Card[]}
   */
  _createDeck() {
    const deck = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push(new Card(suit, rank.key, rank.value));
      }
    }
    return deck;
  }

  /**
   * Shuffle deck using Fisher-Yates algorithm
   * @returns {Deck} New shuffled deck instance
   */
  shuffle() {
    const shuffled = [...this.cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return new Deck(shuffled);
  }

  /**
   * Deterministic shuffle using a seeded PRNG.
   * Intended for test/replay workflows (FR-17.5).
   *
   * @param {string|number} seed
   * @returns {Deck} New deterministically shuffled deck instance
   */
  shuffleDeterministic(seed) {
    const rng = createSeededRng(seed);
    const shuffled = [...this.cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return new Deck(shuffled);
  }

  /**
   * Draw n cards from top of deck
   * @param {number} n
   * @returns {Object} {drawn: Card[], remaining: Deck}
   */
  draw(n) {
    const drawn = this.cards.slice(0, n);
    const remaining = new Deck(this.cards.slice(n));
    return { drawn, remaining };
  }

  /**
   * Get number of cards remaining
   * @returns {number}
   */
  get remaining() {
    return this.cards.length;
  }

  /**
   * Check if deck is empty
   * @returns {boolean}
   */
  get isEmpty() {
    return this.cards.length === 0;
  }
}

function hashSeed(seed) {
  const text = String(seed ?? "");
  let h = 2166136261 >>> 0;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function createSeededRng(seed) {
  // 32-bit LCG: deterministic and fast for non-crypto shuffle reproducibility.
  let state = hashSeed(seed) || 1;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}
