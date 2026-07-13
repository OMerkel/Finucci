/**
 * Game Engine - Central Game Orchestrator
 * Coordinates all game components: rules, AI, turns, rounds, scoring
 * Requirement: FR-2, FR-3, FR-6 (Game flow, turn management, round management)
 */

import { getAIMove } from "../ai/ai-manager.js";
import { CaptureEngine } from "./capture.js";
import { DealingEngine } from "./dealing.js";
import { Deck } from "./deck.js";
import { GameState } from "./game-state.js";
import { isScoringScopa } from "./scopa.js";
import { ScoringEngine } from "./scoring.js";

/**
 * GameEngine orchestrates complete game flow
 * @class GameEngine
 */
export class GameEngine {
  /**
   * Initialize game engine
   *
   * @param {Object} config - Game configuration
   */
  constructor(config = {}) {
    // Normalize players to objects if they're strings
    const normalizedConfig = {
      ...config,
      players: config.players
        ? config.players.map((p, i) =>
            typeof p === "string"
              ? {
                  id: `p${i + 1}`,
                  name: p,
                  score: 0,
                  hand: [],
                  pile: [],
                }
              : p,
          )
        : undefined,
    };

    this.config = normalizedConfig;
    this.gameState = new GameState(normalizedConfig);
    this.moveHistory = [];
    this.currentRound = 0;
    const configuredDealer = Number.isInteger(normalizedConfig.dealerIndex)
      ? normalizedConfig.dealerIndex
      : 1;
    this.currentDealerIndex = configuredDealer === 0 ? 0 : 1;
    this.deck = null;
    this.lastRoundSummary = null;
  }

  /**
   * Start new game
   * Deal initial hands and set up game
   */
  startGame() {
    // Create and shuffle deck
    this.deck = new Deck().shuffle();

    // Deal cards using DealingEngine
    const dealResult = DealingEngine.initialDeal(this.deck);

    // Create players with dealt cards
    const players = [
      {
        id: "p1",
        name: this.config.players?.[0]?.name || "Player 1",
        score: this.gameState?.players[0]?.score || 0,
        hand: dealResult.p1Hand,
        pile: [],
      },
      {
        id: "p2",
        name: this.config.players?.[1]?.name || "Player 2",
        score: this.gameState?.players[1]?.score || 0,
        hand: dealResult.p2Hand,
        pile: [],
      },
    ];

    const clampedDealerIndex = this.currentDealerIndex === 0 ? 0 : 1;
    const openingTableCards = [...dealResult.tableCards];

    // Create new game state with dealt cards
    this.config = {
      ...this.config,
      dealerIndex: clampedDealerIndex,
    };

    this.gameState = new GameState({
      ...this.config,
      players,
      tableCards: openingTableCards,
      deck: dealResult.remainingDeck,
      phase: "playing",
      currentPlayerIndex: 1 - clampedDealerIndex,
      dealerIndex: clampedDealerIndex,
      stats: {
        scope: [0, 0],
        Scope: [0, 0],
        cardsCaptured: [[], []],
        totalScope: 0,
      },
    });

    this.moveHistory = [];
    if (this.currentRound === 0) {
      this.currentRound = 1;
    }

    return this.gameState;
  }

  /**
   * Play turn for player
   * Execute move, handle captures, transition
   *
   * @param {number} playerIndex - Player 0 or 1
   * @param {Object} move - {card, capture?, isCapture, isScopa}
   * @returns {Object} {success, error?, updatedState}
   */
  playTurn(playerIndex, move) {
    try {
      // Validate it's player's turn
      if (this.gameState.currentPlayerIndex !== playerIndex) {
        return { success: false, error: "Not your turn" };
      }

      // Validate move
      const hand = this.gameState.players[playerIndex].hand;
      const cardInHand = hand.some((c) => c.equals(move.card));
      if (!cardInHand) {
        return { success: false, error: "Card not in hand" };
      }

      const legalCaptures = CaptureEngine.getValidCaptures(
        move.card,
        this.gameState.tableCards,
      );
      const captureIsMandatory = legalCaptures.length > 0;
      if (
        captureIsMandatory &&
        (!move.isCapture || !Array.isArray(move.capture) || move.capture.length === 0)
      ) {
        return {
          success: false,
          error: "Capture is mandatory for the played card",
        };
      }

      // Update game state with new values
      const newHand = hand.filter((c) => !c.equals(move.card));
      const newPile = [...this.gameState.players[playerIndex].pile];

      // Handle capture if applicable
      let newTableCards = this.gameState.tableCards;
      const newStats = { ...this.gameState.stats };
      let moveType = "discard"; // Default to discard
      let isScopa = false;

      if (move.isCapture && move.capture) {
        const isLegalCapture = legalCaptures.some(
          (candidate) =>
            candidate.length === move.capture.length &&
            candidate.every((candidateCard) =>
              move.capture.some((selectedCard) =>
                selectedCard.equals(candidateCard),
              ),
            ),
        );

        if (!isLegalCapture) {
          return {
            success: false,
            error: "Invalid capture for played card",
          };
        }

        // Add to captured pile
        newPile.push(move.card);
        newPile.push(...move.capture);

        // Remove from table
        newTableCards = this.gameState.tableCards.filter(
          (tc) => !move.capture.some((c) => c.equals(tc)),
        );

        // Check for Scopa using configured house rule.
        if (
          isScoringScopa({
            tableCards: this.gameState.tableCards,
            captureSet: move.capture,
            remainingHandCount: newHand.length,
            remainingDeckCount: this.gameState.deck?.cards?.length || 0,
            enableFinalCardScopa: this.config.enableFinalCardScopa,
          })
        ) {
          if (!Array.isArray(newStats.scope)) {
            newStats.scope = [0, 0];
          }
          if (!Array.isArray(newStats.Scope)) {
            newStats.Scope = [...newStats.scope];
          }

          newStats.scope[playerIndex] += 1;
          newStats.Scope[playerIndex] = newStats.scope[playerIndex];
          newStats.totalScope =
            (newStats.scope?.[0] || 0) + (newStats.scope?.[1] || 0);
          isScopa = true;
        }

        moveType = "capture"; // This was a capture move
      } else {
        // Discard: add to table
        newTableCards = [...this.gameState.tableCards, move.card];
      }

      // Record move
      this.moveHistory.push({
        round: this.currentRound,
        player: playerIndex,
        move: {
          ...move,
          isScopa,
        },
        timestamp: Date.now(),
      });

      // Check if both players' hands are empty
      const bothHandsEmpty =
        newHand.length === 0 &&
        this.gameState.players[1 - playerIndex].hand.length === 0;

      // Check if round will complete after this move
      const roundWillComplete =
        bothHandsEmpty &&
        (!this.gameState.deck || this.gameState.deck.cards.length === 0);

      // Update players array with new hand and pile
      let updatedPlayers = this.gameState.players.map((p, i) =>
        i === playerIndex ? { ...p, hand: newHand, pile: newPile } : p,
      );

      // If both hands are empty but deck has cards, deal new hands
      let nextPlayerIndex = 1 - playerIndex;
      if (
        bothHandsEmpty &&
        this.gameState.deck &&
        this.gameState.deck.cards.length > 0
      ) {
        const deck = this.gameState.deck;
        const newHands = [[], []];

        // Deal 3 cards to player 0
        for (let i = 0; i < 3 && deck.cards.length > 0; i++) {
          newHands[0].push(deck.cards.pop());
        }

        // Deal 3 cards to player 1
        for (let i = 0; i < 3 && deck.cards.length > 0; i++) {
          newHands[1].push(deck.cards.pop());
        }

        // Update players with newly dealt cards
        updatedPlayers = updatedPlayers.map((p, i) => ({
          ...p,
          hand: newHands[i],
        }));

        // Next player is whoever would normally play after current player
        nextPlayerIndex = 1 - playerIndex;
      } else if (roundWillComplete) {
        nextPlayerIndex = playerIndex; // End of round marker
      } else {
        nextPlayerIndex = 1 - playerIndex;
      }

      // Create new game state for immutability
      this.gameState = new GameState({
        ...this.config,
        players: updatedPlayers,
        tableCards: newTableCards,
        deck: this.gameState.deck,
        phase: this.gameState.phase,
        currentPlayerIndex: nextPlayerIndex,
        stats: newStats,
      });

      return {
        success: true,
        moveType,
        isScopa,
        Scopa: isScopa,
        updatedState: this.gameState,
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Execute AI turn
   * AI selects move asynchronously
   *
   * @param {number} playerIndex - Player index
   * @returns {Promise<Object>} {success, error?, move}
   */
  async playAITurn(playerIndex) {
    try {
      // Validate it's AI's turn
      if (this.gameState.currentPlayerIndex !== playerIndex) {
        return { success: false, error: "Not AI's turn" };
      }

      // Get AI move
      const playerConfig = this.config;
      const hand = this.gameState.players[playerIndex].hand;
      const tableCards = this.gameState.tableCards;

      const aiMove = await getAIMove(
        playerConfig,
        hand,
        tableCards,
        this.gameState,
      );

      // Execute move
      return this.playTurn(playerIndex, aiMove);
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Complete current round
   * Award final cards, score, prepare next round
   */
  completeRound() {
    const stateBeforeScoring = this.gameState;

    // Final table cards go to last capturer (not an Scopa)
    const lastCaptureMove = [...this.moveHistory]
      .reverse()
      .find((m) => m?.move?.isCapture);
    const lastCapturerIndex =
      typeof lastCaptureMove?.player === "number"
        ? lastCaptureMove.player
        : null;

    const playersForScoring = this.gameState.players.map((player) => ({
      ...player,
      pile: [...(player.pile || [])],
    }));

    const finalTableCards = [...(this.gameState.tableCards || [])];
    if (lastCapturerIndex !== null && finalTableCards.length > 0) {
      playersForScoring[lastCapturerIndex].pile.push(...finalTableCards);
    }

    // Calculate scores based on captured cards in round piles
    const pile0 = playersForScoring[0].pile;
    const pile1 = playersForScoring[1].pile;

    const roundScores = [0, 0];
    const breakdown = [];

    // 1. Score cards (majority of 40 cards total)
    const cardsScore = ScoringEngine.scoreCards(pile0.length, pile1.length);
    roundScores[0] += cardsScore.p1;
    roundScores[1] += cardsScore.p2;
    breakdown.push({
      key: "cards",
      label: "Captured Cards",
      raw: [pile0.length, pile1.length],
      points: [cardsScore.p1, cardsScore.p2],
    });

    // 2. Score denari (majority of denari captured)
    const denari0 = pile0.filter((c) => c.suit === "denari").length;
    const denari1 = pile1.filter((c) => c.suit === "denari").length;
    const denariScore = ScoringEngine.scoreDenari(denari0, denari1);
    roundScores[0] += denariScore.p1;
    roundScores[1] += denariScore.p2;
    breakdown.push({
      key: "denari",
      label: "Denari",
      raw: [denari0, denari1],
      points: [denariScore.p1, denariScore.p2],
    });

    // 3. Score settebello (7 of denari)
    const hasSettebello0 = pile0.some(
      (c) => c.suit === "denari" && c.rank === "7",
    );
    const hasSettebello1 = pile1.some(
      (c) => c.suit === "denari" && c.rank === "7",
    );
    const settebelloScore = ScoringEngine.scoreSettebello(
      hasSettebello0,
      hasSettebello1,
    );
    roundScores[0] += settebelloScore.p1;
    roundScores[1] += settebelloScore.p2;
    breakdown.push({
      key: "settebello",
      label: "Settebello (7 di Denari)",
      raw: [hasSettebello0 ? "yes" : "no", hasSettebello1 ? "yes" : "no"],
      points: [settebelloScore.p1, settebelloScore.p2],
    });

    // 4. Score Settanta/Primiera category using configured rules method.
    const settantaMethod =
      this.gameState.settantaMethod ?? this.config.settantaMethod ?? "numerical";
    const settantaScore = ScoringEngine.scoreSettanta(
      settantaMethod,
      pile0,
      pile1,
    );
    const p1Primiera = buildPrimieraSummary(pile0, settantaMethod);
    const p2Primiera = buildPrimieraSummary(pile1, settantaMethod);
    roundScores[0] += settantaScore.p1;
    roundScores[1] += settantaScore.p2;
    breakdown.push({
      key: "settanta",
      label: "Settanta (Primiera)",
      raw: [p1Primiera.short, p2Primiera.short],
      rawFull: [p1Primiera.display, p2Primiera.display],
      points: [settantaScore.p1, settantaScore.p2],
    });

    // 5. Score scope (each scopa worth 1 point)
    const scope0 =
      this.gameState.stats?.scope?.[0] ??
      this.gameState.stats?.Scope?.[0] ??
      0;
    const scope1 =
      this.gameState.stats?.scope?.[1] ??
      this.gameState.stats?.Scope?.[1] ??
      0;
    const scopeScore = ScoringEngine.scoreScope(scope0, scope1);
    roundScores[0] += scopeScore.p1;
    roundScores[1] += scopeScore.p2;
    breakdown.push({
      key: "scope",
      label: "Scope",
      raw: [scope0, scope1],
      points: [scopeScore.p1, scopeScore.p2],
    });

    // Add round scores to player totals
    const previousTotals = [
      this.gameState.players[0].score || 0,
      this.gameState.players[1].score || 0,
    ];
    const nextTotals = [
      previousTotals[0] + roundScores[0],
      previousTotals[1] + roundScores[1],
    ];

    this.gameState = new GameState({
      ...this.config,
      players: [
        {
          ...playersForScoring[0],
          score: nextTotals[0],
          hand: [],
        },
        {
          ...playersForScoring[1],
          score: nextTotals[1],
          hand: [],
        },
      ],
      tableCards: [],
      deck: this.gameState.deck,
      phase: "scoring",
      currentPlayerIndex: stateBeforeScoring.currentPlayerIndex,
      stats: this.gameState.stats,
    });

    const isGameOver = this.isGameOver();
    if (isGameOver) {
      this.gameState = this.gameState.transition("gameEnd");
    }

    const winnerIndex = isGameOver ? this.getWinner() : null;
    this.lastRoundSummary = {
      round: this.currentRound,
      categories: breakdown,
      roundPoints: roundScores,
      previousTotals,
      totals: nextTotals,
      finalTableAward: {
        cardsAwarded: finalTableCards.length,
        lastCapturerIndex,
      },
      isGameOver,
      winnerIndex,
    };

    return this.lastRoundSummary;
  }

  /**
   * Start next round after round summary has been acknowledged
   */
  startNextRound() {
    this.currentRound += 1;
    this.currentDealerIndex = 1 - this.currentDealerIndex;
    return this.startGame();
  }

  /**
   * Check if round is complete
   * Round complete when deck empty AND all hands played
   *
   * @returns {boolean}
   */
  isRoundComplete() {
    const deckEmpty =
      !this.gameState.deck || this.gameState.deck.cards.length === 0;
    const allHandsEmpty = this.gameState.players.every(
      (p) => !p.hand || p.hand.length === 0,
    );
    const result = deckEmpty && allHandsEmpty;

    // DEBUG logging for moves where both might be empty
    if (
      (this.gameState.players[0].hand.length === 0 &&
        this.gameState.players[1].hand.length === 0) ||
      (this.gameState.deck && this.gameState.deck.cards.length === 0)
    ) {
      //console.log(`[isRoundComplete] deck=${this.gameState.deck?.cards.length || 0}, p0=${this.gameState.players[0].hand.length}, p1=${this.gameState.players[1].hand.length}, result=${result}`);
    }

    return result;
  }

  /**
   * Check if game is over
    * Scopa default: first to configured target score (11) with a required 2-point lead.
    * Alternate targets and lead values can be configured.
   *
   * @returns {boolean}
   */
  isGameOver() {
    const p1Score = this.gameState.players[0].score;
    const p2Score = this.gameState.players[1].score;
    const targetScore = this.config.targetScore ?? 11;
    const requireMinimumLead = this.config.requireMinimumLead ?? true;
    const minimumLead = this.config.minimumLead ?? 2;

    const p1Reached = p1Score >= targetScore;
    const p2Reached = p2Score >= targetScore;

    if (!p1Reached && !p2Reached) {
      return false;
    }

    if (!requireMinimumLead) {
      return true;
    }

    if (p1Reached && p1Score - p2Score >= minimumLead) {
      return true;
    }

    if (p2Reached && p2Score - p1Score >= minimumLead) {
      return true;
    }

    return false;
  }

  /**
   * Get winner
   *
   * @returns {number|null} Player index or null if tied/not over
   */
  getWinner() {
    if (!this.isGameOver()) {
      return null;
    }

    if (this.gameState.players[0].score > this.gameState.players[1].score) {
      return 0;
    }
    if (this.gameState.players[1].score > this.gameState.players[0].score) {
      return 1;
    }
    return null; // Tie
  }

  /**
   * Check if game is tied
   *
   * @returns {boolean}
   */
  isTie() {
    return (
      this.isGameOver() &&
      this.gameState.players[0].score === this.gameState.players[1].score
    );
  }

  /**
   * Get current game state
   *
   * @returns {Object}
   */
  getGameState() {
    return this.gameState;
  }

  /**
   * Get current player index
   *
   * @returns {number}
   */
  getCurrentPlayer() {
    return this.gameState.currentPlayerIndex;
  }

  /**
   * Get current round number
   *
   * @returns {number}
   */
  getCurrentRound() {
    return this.currentRound;
  }

  /**
   * Get move history
   *
   * @returns {Array}
   */
  getMoveHistory() {
    return this.moveHistory;
  }

  /**
   * Get available moves for player
   * All cards in hand can be played (discard or capture)
   *
   * @param {number} playerIndex - Player index
   * @returns {Array} Available moves
   */
  getAvailableMoves(playerIndex) {
    const hand = this.gameState.players[playerIndex]?.hand;
    if (!hand || hand.length === 0) {
      return [];
    }

    const moves = [];

    for (const card of hand) {
      // Discard option
      moves.push({ card, isCapture: false });

      // Capture options
      const captures = CaptureEngine.getValidCaptures(
        card,
        this.gameState.tableCards,
      );
      for (const capture of captures) {
        moves.push({
          card,
          capture,
          isCapture: true,
          isScopa: isScoringScopa({
            tableCards: this.gameState.tableCards,
            captureSet: capture,
            remainingHandCount: hand.length - 1,
            remainingDeckCount: this.gameState.deck?.cards?.length || 0,
            enableFinalCardScopa: this.gameState.enableFinalCardScopa,
          }),
        });
      }
    }

    return moves;
  }

  /**
   * Get player info
   *
   * @param {number} playerIndex - Player index
   * @returns {Object}
   */
  getPlayerInfo(playerIndex) {
    const player = this.gameState.players[playerIndex];
    return {
      name: player?.name || `Player ${playerIndex + 1}`,
      score: player?.score || 0,
      handSize: player?.hand?.length || 0,
      capturedSize: player?.pile?.length || 0,
      scope: this.gameState.stats?.scope?.[playerIndex] || 0,
    };
  }

  /**
   * Reset game to initial state
   */
  reset() {
    this.gameState = new GameState(this.config);
    this.moveHistory = [];
    this.currentRound = 0;
    const configuredDealer = Number.isInteger(this.config.dealerIndex)
      ? this.config.dealerIndex
      : 1;
    this.currentDealerIndex = configuredDealer === 0 ? 0 : 1;
    this.deck = null;
  }
}

const PRIME_VALUE_BY_RANK = {
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

const PRIME_LABEL_BY_VALUE = {
  8: "7",
  7: "6",
  6: "Asso",
  5: "5",
  4: "4",
  3: "3",
  2: "2",
  1: "Figure",
  0: "-",
};

const PRIMIERA_NUMERICAL_BY_RANK = {
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

function buildPrimieraSummary(cards, method) {
  if (method === "numerical") {
    return buildPrimieraNumericalSummary(cards);
  }
  if (method === "simplified") {
    const sevens = cards.filter((card) => card.rank === "7").length;
    return {
      display: `Sette catturati: ${sevens}`,
      short: `7s:${sevens}`,
    };
  }

  return buildPrimeSignature(cards);
}

function buildPrimieraNumericalSummary(cards) {
  const suits = ["denari", "coppe", "spade", "bastoni"];
  const bestBySuit = [];

  for (const suit of suits) {
    let bestCard = null;
    let bestValue = 0;
    for (const card of cards) {
      if (card.suit !== suit) continue;
      const value = PRIMIERA_NUMERICAL_BY_RANK[card.rank] || 0;
      if (value > bestValue) {
        bestValue = value;
        bestCard = card;
      }
    }
    bestBySuit.push({ suit, card: bestCard, value: bestValue });
  }

  const total = bestBySuit.reduce((sum, entry) => sum + entry.value, 0);
  const suitOrder = { denari: "D", coppe: "C", spade: "S", bastoni: "B" };
  const suitNames = {
    denari: "Denari",
    coppe: "Coppe",
    spade: "Spade",
    bastoni: "Bastoni",
  };
  const rankNames = {
    asso: "Asso",
    fante: "Fante",
    cavallo: "Cavallo",
    re: "Re",
  };

  const short = `${bestBySuit
    .map(({ suit, card, value }) => {
      const rank = card ? rankToShort(card.rank) : "-";
      return `${suitOrder[suit]}:${rank}(${value})`;
    })
    .join(" ")} = ${total}`;

  const display = `${bestBySuit
    .map(({ suit, card, value }) => {
      const rankKey = card?.rank;
      const rankLabel = rankKey ? rankNames[rankKey] || rankKey : "-";
      return `${suitNames[suit]} ${rankLabel}=${value}`;
    })
    .join(", ")} (totale primiera: ${total})`;

  return { short, display, total };
}

function buildPrimeSignature(cards) {
  const suits = ["denari", "coppe", "spade", "bastoni"];
  const bestValues = [];
  const bestRanksBySuit = [];

  for (const suit of suits) {
    let best = 0;
    let bestRank = null;
    for (const card of cards) {
      if (card.suit !== suit) continue;
      const value = PRIME_VALUE_BY_RANK[card.rank] || 0;
      if (value > best) {
        best = value;
        bestRank = card.rank;
      }
    }
    bestValues.push(best);
    bestRanksBySuit.push(bestRank);
  }

  const vector = bestValues.sort((a, b) => b - a);
  const label = vector.map((v) => PRIME_LABEL_BY_VALUE[v] || "-").join(", ");

  const suitNames = {
    denari: "Denari",
    coppe: "Coppe",
    spade: "Spade",
    bastoni: "Bastoni",
  };

  const rankNames = {
    asso: "Asso",
    fante: "Fante",
    cavallo: "Cavallo",
    re: "Re",
  };

  const suitBest = suits
    .map((suit, index) => {
      const rank = bestRanksBySuit[index];
      const rankLabel = rank ? rankNames[rank] || rank : "-";
      return `${suitNames[suit]} ${rankLabel}`;
    })
    .join(", ");

  const display = `${suitBest} (primiera: ${label})`;
  const short = `D:${rankToShort(bestRanksBySuit[0])} C:${rankToShort(bestRanksBySuit[1])} S:${rankToShort(bestRanksBySuit[2])} B:${rankToShort(bestRanksBySuit[3])} (primiera: ${label})`;

  return { vector, label, display, short };
}

function rankToShort(rank) {
  if (!rank) return "-";
  if (rank === "asso") return "A";
  if (rank === "fante") return "F";
  if (rank === "cavallo") return "C";
  if (rank === "re") return "Re";
  return rank;
}
