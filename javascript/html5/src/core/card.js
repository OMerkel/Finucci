/**
 * Card represents a single playing card in the Scopa deck.
 *
 * @class Card
 * @typedef {Object} Card
 * @property {string} suit - Canonical internal key (legacy-compatible): "denari", "coppe", "spade", "bastoni"
 * @property {string} rank - Canonical internal key (legacy-compatible): "asso", "2", "3", "4", "5", "6", "7", "fante", "cavallo", "re"
 * @property {number} value - Card value: 1 (asso), 2-7 (face value), 8 (fante), 9 (cavallo), 10 (re)
 *
 * Immutable card implementation following frozen dataclass pattern.
 */

export const ITALIAN_SUIT_NAMES = Object.freeze({
  denari: "denari",
  coppe: "coppe",
  spade: "spade",
  bastoni: "bastoni",
});

export const ITALIAN_RANK_NAMES = Object.freeze({
  asso: "asso",
  fante: "fante",
  cavallo: "cavallo",
  re: "re",
});

export function formatCardNameItalian(cardLike) {
  if (!cardLike) return "";
  const suitName = ITALIAN_SUIT_NAMES[cardLike.suit] || cardLike.suit;
  const rankName = ITALIAN_RANK_NAMES[cardLike.rank] || cardLike.rank;
  return `${rankName} di ${suitName}`;
}

export class Card {
  constructor(suit, rank, value) {
    this.suit = suit;
    this.rank = rank;
    this.value = value;
    Object.freeze(this);
  }

  /**
   * Get display name for card
   * @returns {string} e.g. "asso di denari", "7 di spade"
   */
  get displayName() {
    return formatCardNameItalian(this);
  }

  /**
   * Compare two cards for equality
   * @param {Card} other
   * @returns {boolean}
   */
  equals(other) {
    return this.suit === other.suit && this.rank === other.rank;
  }

  /**
   * String representation
   * @returns {string}
   */
  toString() {
    return this.displayName;
  }
}
