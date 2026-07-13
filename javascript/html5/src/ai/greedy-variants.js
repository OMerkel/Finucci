/**
 * Greedy Strategy Variants
 * Implements specialized Greedy strategies with different tactical approaches
 *
 * Purpose: Create multi-tier AI difficulty system for competitive play
 */

import { CaptureEngine } from "../core/capture.js";
import { isScoringScopa } from "../core/scopa.js";

/**
 * RISK-AVERSE GREEDY: Prioritizes safe, guaranteed captures
 * Characteristics:
 * - Strongly prefers Scope (clearing the table)
 * - Avoids leaving high-value cards for opponent
 * - Conservative with settebello (7-of-denari, only takes when safe)
 * Difficulty: MEDIUM - More predictable, plays defensively
 */
export function selectRiskAverseMove(hand, tableCards, gameState) {
  if (!hand || hand.length === 0) {
    return null;
  }

  let bestMove = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  // Phase 1: Look for Scope (safest captures)
  for (const card of hand) {
    const captures = CaptureEngine.getValidCaptures(card, tableCards);

    if (captures.length > 0) {
      for (const capture of captures) {
        const isScopa = isScoringScopa({
          tableCards,
          captureSet: capture,
          remainingHandCount: hand.length - 1,
          remainingDeckCount: gameState?.deck?.cards?.length || 0,
          enableFinalCardScopa: gameState?.enableFinalCardScopa ?? false,
        });

        // Only consider Scopa in this phase
        if (isScopa) {
          const move = {
            card,
            capture,
            isCapture: true,
            isScopa: true,
          };

          const score = 1000; // Heavy Scopa bonus
          if (score > bestScore) {
            bestScore = score;
            bestMove = move;
          }
        }
      }
    }
  }

  // Phase 2: If no Scopa, look for multiple-card captures (safer than single)
  if (!bestMove) {
    for (const card of hand) {
      const captures = CaptureEngine.getValidCaptures(card, tableCards);

      if (captures.length > 0) {
        for (const capture of captures) {
          // Prefer captures with 3+ cards (very safe)
          if (capture.length >= 3) {
            const move = {
              card,
              capture,
              isCapture: true,
              isScopa: false,
            };

            const score = 500 + capture.length * 50; // Bonus for multi-card captures
            if (score > bestScore) {
              bestScore = score;
              bestMove = move;
            }
          }
        }
      }
    }
  }

  // Phase 3: If no multi-card capture, look for any capture
  if (!bestMove) {
    for (const card of hand) {
      const captures = CaptureEngine.getValidCaptures(card, tableCards);

      if (captures.length > 0) {
        for (const capture of captures) {
          const move = {
            card,
            capture,
            isCapture: true,
            isScopa: false,
          };

          // Value-based scoring but conservative
          let score = 200;

          if (card.rank === "7" && card.suit === "denari") {
            score += 30; // Moderate bonus for settebello (7-of-denari)
          }

          score += card.value * 8; // Slightly lower multiplier for conservatism

          if (score > bestScore) {
            bestScore = score;
            bestMove = move;
          }
        }
      }
    }
  }

  // Phase 4: If no capture, discard safely (low-value first)
  if (!bestMove) {
    if (hand && hand.length > 0) {
      let bestDiscard = hand[0];
      let bestDiscardScore = 11 - (hand[0].value || 0); // Invert: prefer low cards

      for (let i = 1; i < hand.length; i++) {
        const score = 11 - (hand[i].value || 0);
        if (score > bestDiscardScore) {
          bestDiscardScore = score;
          bestDiscard = hand[i];
        }
      }

      bestMove = { card: bestDiscard, isCapture: false };
    } else {
      return null;
    }
  }

  return bestMove;
}

/**
 * CARD-PRESERVING GREEDY: Focuses on securing high-value cards
 * Characteristics:
 * - Aggressively captures high-value cards (face cards, denari)
 * - Strategically discards low-value cards early
 * - Reserves high-value cards in hand when possible
 * Difficulty: HARD - Wins value trades consistently
 */
export function selectCardPreservingMove(hand, tableCards, gameState) {
  if (!hand || hand.length === 0) {
    return null;
  }

  let bestMove = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  // Helper: Calculate card rarity/value score
  function cardValueScore(card) {
    let score = 0;

    // Face cards very valuable
    if (
      card.value === 10 ||
      card.rank === "fante" ||
      card.rank === "cavallo" ||
      card.rank === "re"
    ) {
      score += 30;
    } else if (card.value >= 8) {
      score += 15;
    }

    // Denari suit valuable (internal key "denari")
    if (card.suit === "denari") {
      score += 10;
    }

    // Settebello (7 of denari) is most valuable
    if (card.rank === "7" && card.suit === "denari") {
      score += 50;
    }

    return score;
  }

  // Phase 1: Capture high-value cards on table
  for (const card of hand) {
    const captures = CaptureEngine.getValidCaptures(card, tableCards);

    if (captures.length > 0) {
      for (const capture of captures) {
        // Score based on value of cards being captured
        let captureValue = 0;
        for (const capturedCard of capture) {
          captureValue += cardValueScore(capturedCard);
        }

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

        const score = (isScopa ? 1200 : 200) + captureValue;

        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
    }
  }

  // If no capture, select discard based on card value preservation
  if (!bestMove) {
    if (hand && hand.length > 0) {
      let bestDiscard = hand[0];
      let bestDiscardValue = cardValueScore(hand[0]); // Lower is better (we want to discard low-value)

      for (let i = 1; i < hand.length; i++) {
        const value = cardValueScore(hand[i]);
        if (value < bestDiscardValue) {
          bestDiscardValue = value;
          bestDiscard = hand[i];
        }
      }

      bestMove = { card: bestDiscard, isCapture: false };
    } else {
      return null;
    }
  }

  return bestMove;
}

/**
 * MOMENTUM-BASED GREEDY: Makes decisions based on score situation
 * Characteristics:
 * - When ahead: Conservative, avoids risky plays
 * - When behind: Aggressive, takes calculated risks
 * - Adapts strategy to current game state
 * Difficulty: HARD - Reactive, difficult to predict
 */
export function selectMomentumMove(hand, tableCards, gameState) {
  if (!hand || hand.length === 0) {
    return null;
  }

  // Calculate score differential
  const player1Score = gameState.players[0].score || 0;
  const player2Score = gameState.players[1].score || 0;
  const currentPlayerIndex = Number.isInteger(gameState.currentPlayerIndex)
    ? gameState.currentPlayerIndex
    : (gameState.currentPlayer ?? 0);
  const myScore = currentPlayerIndex === 0 ? player1Score : player2Score;
  const oppScore = currentPlayerIndex === 0 ? player2Score : player1Score;
  const scoreDiff = myScore - oppScore;
  const targetScore = Math.max(11, Number(gameState.targetScore) || 11);
  const largeLead = Math.max(2, Math.round(targetScore * 0.25));
  const mediumLead = Math.max(1, Math.round(targetScore * 0.12));

  let bestMove = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  // Helper: Evaluate move aggressiveness based on score
  function getMomentumMultiplier() {
    if (scoreDiff > largeLead) {
      // Ahead significantly: be very conservative
      return 0.5;
    }
    if (scoreDiff > mediumLead) {
      // Slightly ahead: moderately conservative
      return 0.8;
    }
    if (scoreDiff < -largeLead) {
      // Behind significantly: be very aggressive
      return 2.0;
    }
    if (scoreDiff < -mediumLead) {
      // Slightly behind: moderately aggressive
      return 1.5;
    }
    return 1.0; // Tied: normal scoring
  }

  const momentum = getMomentumMultiplier();

  // Evaluate all possible captures
  for (const card of hand) {
    const captures = CaptureEngine.getValidCaptures(card, tableCards);

    if (captures.length > 0) {
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

        let score = 100 * momentum; // Base capture score

        if (isScopa) {
          score += 1000 * momentum;
        }

        // Settebello bonus (adjusted by momentum)
        if (card.rank === "7" && card.suit === "denari") {
          score += 50 * momentum;
        }

        // Card value bonus (adjusted by momentum)
        score += (card.value || 0) * 10 * momentum;

        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
    }
  }

  // If no capture, select discard based on momentum
  if (!bestMove) {
    if (hand && hand.length > 0) {
      let bestDiscard = hand[0];
      let bestDiscardScore;

      if (scoreDiff < -largeLead) {
        // Behind: try to preserve cards (discard low)
        bestDiscardScore = hand[0].value || 0;
      } else {
        // Normal or ahead: prefer low-value discard
        bestDiscardScore = 11 - (hand[0].value || 0);
      }

      for (let i = 1; i < hand.length; i++) {
        let score;
        if (scoreDiff < -largeLead) {
          score = hand[i].value || 0;
        } else {
          score = 11 - (hand[i].value || 0);
        }

        if (
          (scoreDiff < -largeLead && score < bestDiscardScore) ||
          (scoreDiff >= -largeLead && score > bestDiscardScore)
        ) {
          bestDiscardScore = score;
          bestDiscard = hand[i];
        }
      }

      bestMove = { card: bestDiscard, isCapture: false };
    } else {
      return null;
    }
  }

  return bestMove;
}
