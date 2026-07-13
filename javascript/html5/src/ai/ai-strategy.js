/**
 * AI Strategy Module - Greedy Heuristic
 * Implements greedy move selection strategy for AI players
 * Requirements: FR-15.1, FR-15.2, FR-12.4 (Greedy AI strategy behavior)
 */

import { CaptureEngine } from "../core/capture.js";
import { isScoringScopa } from "../core/scopa.js";

const PRIME_RANK_SCORE = {
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

function getPrimeRankScore(card) {
  if (!card) return 0;
  const rank = String(card.rank);
  return PRIME_RANK_SCORE[rank] || 10;
}

function scoreCapturedCard(card) {
  if (!card) return 0;

  let score = card.value || 0;

  if (card.suit === "denari") {
    score += 18;
  }

  if (card.rank === "7") {
    score += 20;
  }

  if (card.rank === "7" && card.suit === "denari") {
    score += 80;
  }

  // Primiera potential: reward cards that are strong in Primiera evaluation.
  score += Math.round(getPrimeRankScore(card) * 0.4);

  return score;
}

function getSubsetCountBySum(tableCards, targetSum) {
  const cards = Array.isArray(tableCards) ? tableCards : [];
  let count = 0;

  function walk(index, sum, usedAny) {
    if (index === cards.length) {
      if (usedAny && sum === targetSum) {
        count += 1;
      }
      return;
    }

    walk(index + 1, sum, usedAny);
    walk(index + 1, sum + (cards[index].value || 0), true);
  }

  walk(0, 0, false);
  return count;
}

function scoreDiscardRisk(card, tableCards) {
  if (!card) return 0;

  let risk = 0;
  const existingSameValue = tableCards.filter(
    (c) => c.value === card.value,
  ).length;

  // Duplicating a table value increases exact-capture availability next turn.
  risk += existingSameValue * 14;

  const comboCount = getSubsetCountBySum(tableCards, card.value || 0);
  risk += comboCount * 4;

  if (card.suit === "denari") {
    risk += 18;
  }
  if (card.rank === "7") {
    risk += 14;
  }
  if (card.rank === "7" && card.suit === "denari") {
    risk += 30;
  }

  return risk;
}

/**
 * Evaluate move quality score
 * Higher score = better move
 * Scoring priorities:
 * 1. Scopa (capture all table cards): +1000
 * 2. Settebello (7 of denari): +50
 * 3. Other high-value cards: +value
 * 4. Safe discards (low value): +1
 *
 * @param {Object} move - {card, isCapture, isScopa}
 * @param {Object} gameState - Current game state
 * @returns {number} Quality score
 */
export function evaluateMoveQuality(move, gameState) {
  if (!move) return 0;

  const tableCards = gameState?.tableCards || [];
  let score = 0;

  // Scopa bonus (capturing all table cards)
  if (move.isScopa) {
    score += 1000;
  }

  // Capture bonus
  if (move.isCapture) {
    score += 100;

    // Prefer captures that secure Scopa scoring categories from the table.
    if (Array.isArray(move.capture)) {
      const capturedDenari = move.capture.filter(
        (capturedCard) => capturedCard?.suit === "denari",
      ).length;
      score += capturedDenari * 25;

      let capturedValueScore = 0;
      for (const capturedCard of move.capture) {
        capturedValueScore += scoreCapturedCard(capturedCard);
      }
      score += capturedValueScore;
    }

    // Settebello bonus (7 of denari, most valuable single card)
    if (move.card && move.card.rank === "7" && move.card.suit === "denari") {
      score += 50;
    }

    // High-value card bonus
    if (move.card) {
      const cardValue = move.card.value;
      score += cardValue * 10;
    }
  } else {
    // Discard heuristic: prefer low-value cards but penalize risky table gifts.
    if (move.card) {
      const cardValue = move.card.value;
      score += Math.max(0, 11 - cardValue); // Higher for low-value cards (max value is 10)
      score -= scoreDiscardRisk(move.card, tableCards);
    }
  }

  return score;
}

/**
 * Get card value (use the value property directly)
 *
 * @param {Object} card - Card object
 * @returns {number} Card value 0-10
 */
function getCardValue(card) {
  if (!card) return 0;
  return card.value || 0;
}

/**
 * Select best move using greedy heuristic
 * Strategy: Evaluate all possible moves and select highest score
 *
 * @param {Object[]} hand - Player's hand
 * @param {Object[]} tableCards - Table cards
 * @param {Object} gameState - Current game state
 * @returns {Object} Selected move {card, capture, Scopa}
 */
export function selectGreedyMove(hand, tableCards, gameState) {
  if (!hand || hand.length === 0) {
    return null;
  }

  let bestMove = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  // Evaluate capture moves
  for (const card of hand) {
    const captures = CaptureEngine.getValidCaptures(card, tableCards);

    if (captures.length > 0) {
      // Has valid captures - check all combinations
      for (const capture of captures) {
        const isScopa = isScoringScopa({
          tableCards,
          captureSet: capture,
          remainingHandCount: hand.length - 1,
          remainingDeckCount: gameState?.deck?.cards?.length || 0,
          enableFinalCardScopa: gameState?.enableFinalCardScopa ?? false,
        });
        const move = {
          card,
          capture,
          isCapture: true,
          isScopa,
        };

        const score = evaluateMoveQuality(move, gameState);
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
    }
  }

  // If no capture found, select best discard
  if (!bestMove) {
    let bestDiscard = hand[0];
    let bestDiscardScore = evaluateMoveQuality(
      { card: hand[0], isCapture: false },
      gameState,
    );

    for (let i = 1; i < hand.length; i++) {
      const move = { card: hand[i], isCapture: false };
      const score = evaluateMoveQuality(move, gameState);
      if (score > bestDiscardScore) {
        bestDiscardScore = score;
        bestDiscard = hand[i];
      }
    }

    bestMove = { card: bestDiscard, isCapture: false };
  }

  return bestMove;
}

/**
 * Prioritize Scope in move list
 * Return true if move results in Scopa
 *
 * @param {Object} move - {card, capture, isScopa}
 * @returns {boolean}
 */
export function prioritizeScope(move) {
  return move && move.isScopa === true;
}

/**
 * Prioritize settebello (7 of denari)
 *
 * @param {Object} move - {card, capture, isScopa}
 * @returns {boolean}
 */
export function prioritizeSettebello(move) {
  return (
    move?.card &&
    move.card.rank === "7" &&
    move.card.suit === "denari" &&
    move.isCapture === true
  );
}

/**
 * Select highest value capture from valid moves
 *
 * @param {Object[]} validMoves - Valid capture moves
 * @returns {Object} Highest value move
 */
export function selectHighestValueCapture(validMoves) {
  if (!validMoves || validMoves.length === 0) {
    return null;
  }

  return validMoves.reduce((best, current) => {
    const bestValue = getCardValue(best.card);
    const currentValue = getCardValue(current.card);
    return currentValue > bestValue ? current : best;
  });
}

/**
 * Select safe discard (lowest value card)
 *
 * @param {Object[]} hand - Player's hand
 * @returns {Object} Lowest value card
 */
export function selectSafeDiscard(hand) {
  if (!hand || hand.length === 0) {
    return null;
  }

  return hand.reduce((lowestCard, current) => {
    const lowestValue = getCardValue(lowestCard);
    const currentValue = getCardValue(current);
    return currentValue < lowestValue ? current : lowestCard;
  });
}
