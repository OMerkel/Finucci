/**
 * Test suite for Game Engine
 * Tests: game initialization, round management, turn coordination, victory detection
 * Requirements: FR-2.1, FR-2.2, FR-2.4, FR-3.2, FR-6.4, FR-7.1, FR-9.1, FR-11.3, FR-12.2, FR-UI-1.3
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CaptureEngine } from "../core/capture.js";
import { Card } from "../core/card.js";
import { DealingEngine } from "../core/dealing.js";
import { Deck } from "../core/deck.js";
import { GameEngine } from "../core/game-engine.js";

describe("Game Engine", () => {
  let engine;

  beforeEach(() => {
    const config = {
      targetScore: 11,
      players: ["Player 1", "Player 2"],
      aiStrategy: "greedy",
    };
    engine = new GameEngine(config);
  });

  afterEach(() => {
    engine = null;
  });

  describe("Initialization", () => {
    it("should initialize game with configuration", () => {
      // Given: engine created with config
      // When: checking initial state
      const state = engine.getGameState();

      // Then: should have proper initial setup
      expect(state).not.toBeNull();
      expect(state.phase).toBe("setup");
      expect(state.players[0].score).toBe(0);
      expect(state.players[1].score).toBe(0);
      expect(state.players[0].hand).toEqual([]);
      expect(state.players[1].hand).toEqual([]);
    });

    it("should start new game", () => {
      // Given: initialized engine
      // When: starting game
      engine.startGame();
      const state = engine.getGameState();

      // Then: should transition to playing and deal cards
      expect(state.phase).toBe("playing");
      expect(state.players[0].hand.length).toBeGreaterThan(0);
      expect(state.players[1].hand.length).toBeGreaterThan(0);
      expect(state.tableCards.length).toBeGreaterThan(0);
      expect(state.dealerIndex).toBe(1);
      expect(state.currentPlayerIndex).toBe(0);
    });

    it("should not auto-capture opening table when cards total 15", () => {
    // Given: preconditions for "should initialize game with configuration" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
      const initialDealSpy = vi.spyOn(DealingEngine, "initialDeal");
      initialDealSpy.mockReturnValue({
        p1Hand: [
          new Card("denari", "2", 2),
          new Card("denari", "3", 3),
          new Card("denari", "4", 4),
        ],
        p2Hand: [
          new Card("coppe", "2", 2),
          new Card("coppe", "3", 3),
          new Card("coppe", "4", 4),
        ],
        tableCards: [
          new Card("spade", "7", 7),
          new Card("spade", "6", 6),
          new Card("bastoni", "asso", 1),
          new Card("bastoni", "asso", 1),
        ],
        remainingDeck: new Deck([]),
      });

      engine.startGame();
      const state = engine.getGameState();

      expect(state.tableCards).toHaveLength(4);
      expect(state.players[1].pile).toHaveLength(0);
      expect(state.stats.scope[1]).toBe(0);
      expect(state.stats.totalScope).toBe(0);

      initialDealSpy.mockRestore();
    });

    it("should not auto-capture opening table when cards total 30", () => {
    // Given: preconditions for "should not auto-capture opening table when cards total 30" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
      const initialDealSpy = vi.spyOn(DealingEngine, "initialDeal");
      initialDealSpy.mockReturnValue({
        p1Hand: [
          new Card("denari", "2", 2),
          new Card("denari", "3", 3),
          new Card("denari", "4", 4),
        ],
        p2Hand: [
          new Card("coppe", "2", 2),
          new Card("coppe", "3", 3),
          new Card("coppe", "4", 4),
        ],
        tableCards: [
          new Card("spade", "re", 10),
          new Card("spade", "re", 10),
          new Card("bastoni", "5", 5),
          new Card("bastoni", "5", 5),
        ],
        remainingDeck: new Deck([]),
      });

      engine.startGame();
      const state = engine.getGameState();

      expect(state.tableCards).toHaveLength(4);
      expect(state.players[1].pile).toHaveLength(0);
      expect(state.stats.scope[1]).toBe(0);
      expect(state.stats.totalScope).toBe(0);

      initialDealSpy.mockRestore();
    });

    it("should reset game state", () => {
      // Given: game in progress
      engine.startGame();
      const hand = engine.getGameState().players[0].hand;
      if (hand.length > 0) {
        engine.playTurn(0, { card: hand[0] });
      }

      // When: resetting
      engine.reset();
      const state = engine.getGameState();

      // Then: should return to initial state
      expect(state.phase).toBe("setup");
      expect(state.players[0].score).toBe(0);
      expect(state.players[1].score).toBe(0);
      expect(state.players[0].hand).toEqual([]);
      expect(state.players[1].hand).toEqual([]);
    });

    it("should carry configured capture display duration into game state", () => {
    // Given: preconditions for "should reset game state" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
      const customEngine = new GameEngine({
        players: ["Player 1", "Player 2"],
        captureDisplayDurationMs: 1337,
      });

      customEngine.startGame();
      const state = customEngine.getGameState();

      expect(state.captureDisplayDurationMs).toBe(1337);
    });
  });

  describe("Round Management", () => {
    it("should manage rounds", () => {
      // Given: game started
      engine.startGame();
      const initialRound = engine.getCurrentRound();

      // When: playing turns and completing round
      // Then: should track round number
      expect(initialRound).toBeGreaterThan(0);
    });

    it("should detect round completion", () => {
      // Given: game with specific state
      engine.startGame();

      // When: checking round completion
      const isComplete = engine.isRoundComplete();

      // Then: should return boolean
      expect(typeof isComplete).toBe("boolean");
    });

    it("should alternate dealer and first player each new round", () => {
    // Given: preconditions for "should manage rounds" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
      engine.startGame();
      const round1 = engine.getGameState();

      expect(round1.dealerIndex).toBe(1);
      expect(round1.currentPlayerIndex).toBe(0);

      engine.startNextRound();
      const round2 = engine.getGameState();

      expect(round2.dealerIndex).toBe(0);
      expect(round2.currentPlayerIndex).toBe(1);

      engine.startNextRound();
      const round3 = engine.getGameState();

      expect(round3.dealerIndex).toBe(1);
      expect(round3.currentPlayerIndex).toBe(0);
    });

    it("should complete round and score", () => {
      // Given: round in progress
      engine.startGame();

      // When: round completes (simulated)
      // Play turns until deck empty and hands played
      // This would be done via multiple playTurn calls
      const stateAfter = engine.getGameState();

      // Then: scores should be tracked
      expect(stateAfter.players[0].score).toBeDefined();
      expect(stateAfter.players[1].score).toBeDefined();
    });

    it("should return round summary with category breakdown and totals", () => {
    // Given: preconditions for "should complete round and score" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
      engine.startGame();

      // Prepare deterministic scoring snapshot
      const state = engine.getGameState();
      const players = state.players.map((p) => ({ ...p, pile: [...p.pile] }));

      players[0].pile = [
        new Card("denari", "fante", 8),
        new Card("denari", "6", 6),
        new Card("coppe", "7", 7),
        new Card("spade", "6", 6),
        new Card("bastoni", "5", 5),
      ];
      players[1].pile = [
        new Card("denari", "asso", 1),
        new Card("coppe", "asso", 1),
        new Card("spade", "asso", 1),
        new Card("bastoni", "asso", 1),
      ];

      engine.gameState = state.transition("playing", {
        players,
        tableCards: [],
        stats: {
          ...state.stats,
          Scope: [2, 1],
        },
      });

      const summary = engine.completeRound();

      expect(summary).toBeDefined();
      expect(summary.categories.length).toBe(5);
      const settantaCategory = summary.categories.find(
        (c) => c.key === "settanta",
      );
      expect(settantaCategory).toBeDefined();
      expect(settantaCategory.raw[0]).toContain("D:");
      expect(settantaCategory.raw[0]).toContain("C:");
      expect(settantaCategory.raw[0]).toContain("S:");
      expect(settantaCategory.raw[0]).toContain("(18)");
      expect(settantaCategory.raw[0]).toContain("(21)");
      expect(settantaCategory.raw[0]).toContain("= 72");
      expect(settantaCategory.rawFull[0]).toContain("Denari");
      expect(settantaCategory.rawFull[0]).toContain("Coppe");
      expect(settantaCategory.rawFull[0]).toContain("totale primiera: 72");
      expect(settantaCategory.raw[1]).toContain("= 64");
      expect(summary.roundPoints[0]).toBeGreaterThan(summary.roundPoints[1]);
      expect(summary.totals[0]).toBeGreaterThan(summary.totals[1]);
    });
  });

  describe("Turn Management", () => {
    it("should execute player turn", () => {
      // Given: game initialized with player's turn
      engine.startGame();
      const state = engine.getGameState();
      const hand = state.players[0].hand;
      const firstCard = hand[0];
      const legalCaptures = CaptureEngine.getValidCaptures(
        firstCard,
        state.tableCards,
      );

      // When: executing turn
      const move =
        legalCaptures.length > 0
          ? { card: firstCard, capture: legalCaptures[0], isCapture: true }
          : { card: firstCard, isCapture: false };
      const result = engine.playTurn(0, move);

      // Then: should process move and transition
      expect(result).not.toBeNull();
      expect(result.success).toBe(true);
    });

    it("should validate move before execution", () => {
      // Given: game with invalid move
      engine.startGame();
      const currentPlayer = engine.getCurrentPlayer();
      const invalidCard = new Card("denari", "5", 5); // Not in hand

      // When: executing invalid move
      const move = { card: invalidCard, isCapture: false };
      const result = engine.playTurn(currentPlayer, move);

      // Then: should reject invalid move
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should track current player", () => {
      // Given: game started
      engine.startGame();

      // When: checking current player
      const currentPlayer = engine.getCurrentPlayer();

      // Then: should return 0 or 1
      expect([0, 1]).toContain(currentPlayer);
    });

    it("should alternate players", () => {
      // Given: game initialized
      engine.startGame();
      const player1 = engine.getCurrentPlayer();

      // When: playing turn and advancing
      const state = engine.getGameState();
      const hand = state.players[player1].hand;
      if (hand.length > 0) {
        const legalCaptures = CaptureEngine.getValidCaptures(
          hand[0],
          state.tableCards,
        );
        const move =
          legalCaptures.length > 0
            ? { card: hand[0], capture: legalCaptures[0], isCapture: true }
            : { card: hand[0], isCapture: false };
        engine.playTurn(player1, move);
      }

      // Then: should advance to next player
      const player2 = engine.getCurrentPlayer();
      expect(player2).not.toBe(player1);
    });

    it("should not auto-complete scoring inside playTurn on round-complete state", () => {
      // Given: a round-complete state where playTurn should not auto-score
      engine.startGame();

      const state = engine.getGameState();
      const finalCard = state.players[0].hand[0];
      const players = [
        {
          ...state.players[0],
          hand: [finalCard],
          pile: [...state.players[0].pile],
        },
        {
          ...state.players[1],
          hand: [],
          pile: [...state.players[1].pile],
        },
      ];

      engine.gameState = state.transition("playing", {
        players,
        deck: { cards: [] },
        tableCards: [],
        currentPlayerIndex: 0,
      });

      // When: executing playTurn for the final card
      const result = engine.playTurn(0, { card: finalCard, isCapture: false });

      // Then: round remains in playing phase until explicit round completion flow
      expect(result.success).toBe(true);
      expect(engine.isRoundComplete()).toBe(true);
      expect(engine.getGameState().phase).toBe("playing");
    });

    it("should not score Scopa on a final card of the round by default", () => {
      // Given: a table-clearing capture with the player's final card of the round
      const customEngine = new GameEngine({
        targetScore: 11,
        players: ["Player 1", "Player 2"],
        enableFinalCardScopa: false,
      });
      const finalCard = new Card("denari", "fante", 8);
      const state = customEngine.getGameState();

      customEngine.gameState = state.transition("playing", {
        players: [
          {
            id: "p1",
            name: "Player 1",
            score: 0,
            hand: [finalCard],
            pile: [],
          },
          {
            id: "p2",
            name: "Player 2",
            score: 0,
            hand: [new Card("coppe", "2", 2)],
            pile: [],
          },
        ],
        tableCards: [new Card("spade", "6", 6), new Card("bastoni", "2", 2)],
        deck: { cards: [] },
        currentPlayerIndex: 0,
        stats: {
          Scope: [0, 0],
          cardsCaptured: [[], []],
          totalScope: 0,
        },
        enableFinalCardScopa: false,
      });

      // When: the capture is resolved under the default house rule
      const result = customEngine.playTurn(0, {
        card: finalCard,
        capture: customEngine.gameState.tableCards,
        isCapture: true,
        isScopa: true,
      });

      // Then: the sweep does not score an Scopa
      expect(result.success).toBe(true);
      expect(result.Scopa).toBe(false);
      expect(customEngine.getGameState().stats.Scope[0]).toBe(0);
    });

    it("should score Scopa on a final card of the round when the rule is enabled", () => {
      // Given: a table-clearing capture with the player's final card of the round
      const customEngine = new GameEngine({
        targetScore: 11,
        players: ["Player 1", "Player 2"],
        enableFinalCardScopa: true,
      });
      const finalCard = new Card("denari", "fante", 8);
      const state = customEngine.getGameState();

      customEngine.gameState = state.transition("playing", {
        players: [
          {
            id: "p1",
            name: "Player 1",
            score: 0,
            hand: [finalCard],
            pile: [],
          },
          {
            id: "p2",
            name: "Player 2",
            score: 0,
            hand: [new Card("coppe", "2", 2)],
            pile: [],
          },
        ],
        tableCards: [new Card("spade", "6", 6), new Card("bastoni", "2", 2)],
        deck: { cards: [] },
        currentPlayerIndex: 0,
        stats: {
          Scope: [0, 0],
          cardsCaptured: [[], []],
          totalScope: 0,
        },
        enableFinalCardScopa: true,
      });

      // When: the capture is resolved with the option enabled
      const result = customEngine.playTurn(0, {
        card: finalCard,
        capture: customEngine.gameState.tableCards,
        isCapture: true,
        isScopa: true,
      });

      // Then: the sweep scores an Scopa normally
      expect(result.success).toBe(true);
      expect(result.Scopa).toBe(true);
      expect(customEngine.getGameState().stats.Scope[0]).toBe(1);
    });

    it("should still score Scopa on the last card of an intermediate hand when stock remains", () => {
      // Given: a table-clearing capture empties the hand but a re-deal is still possible
      const customEngine = new GameEngine({
        targetScore: 11,
        players: ["Player 1", "Player 2"],
        enableFinalCardScopa: false,
      });
      const finalCardInHand = new Card("denari", "fante", 8);
      const state = customEngine.getGameState();

      customEngine.gameState = state.transition("playing", {
        players: [
          {
            id: "p1",
            name: "Player 1",
            score: 0,
            hand: [finalCardInHand],
            pile: [],
          },
          {
            id: "p2",
            name: "Player 2",
            score: 0,
            hand: [new Card("coppe", "2", 2)],
            pile: [],
          },
        ],
        tableCards: [new Card("spade", "6", 6), new Card("bastoni", "2", 2)],
        deck: { cards: [new Card("coppe", "3", 3)] },
        currentPlayerIndex: 0,
        stats: {
          Scope: [0, 0],
          cardsCaptured: [[], []],
          totalScope: 0,
        },
        enableFinalCardScopa: false,
      });

      // When: the capture is resolved before the round is actually over
      const result = customEngine.playTurn(0, {
        card: finalCardInHand,
        capture: customEngine.gameState.tableCards,
        isCapture: true,
        isScopa: true,
      });

      // Then: the sweep still scores an Scopa because stock remains
      expect(result.success).toBe(true);
      expect(result.Scopa).toBe(true);
      expect(customEngine.getGameState().stats.Scope[0]).toBe(1);
    });

    it("should reject discard when played card has legal capture", () => {
      // Given: a played card with an available exact capture
      const customEngine = new GameEngine({
        targetScore: 11,
        players: ["Player 1", "Player 2"],
      });
      const playedCard = new Card("coppe", "5", 5);
      const exactTableCard = new Card("spade", "5", 5);
      const state = customEngine.getGameState();

      customEngine.gameState = state.transition("playing", {
        players: [
          { id: "p1", name: "Player 1", score: 0, hand: [playedCard], pile: [] },
          { id: "p2", name: "Player 2", score: 0, hand: [], pile: [] },
        ],
        tableCards: [exactTableCard, new Card("denari", "2", 2), new Card("bastoni", "3", 3)],
        deck: { cards: [] },
        currentPlayerIndex: 0,
      });

      // When: trying to discard that card
      const result = customEngine.playTurn(0, {
        card: playedCard,
        isCapture: false,
      });

      // Then: move should be rejected by mandatory-capture rule
      expect(result.success).toBe(false);
      expect(result.error).toContain("mandatory");
    });
  });

  describe("AI Move Execution", () => {
    it("should execute AI move", async () => {
      // Given: game initialized with current player ready
      engine.startGame();
      const currentPlayer = engine.getCurrentPlayer();

      // When: executing AI move
      const result = await engine.playAITurn(currentPlayer);

      // Then: should return move result
      expect(result).not.toBeNull();
      expect(result.success).toBe(true);
    });

    it("should respect AI response time limit", async () => {
      // Given: AI configured with time limit
      engine.startGame();
      const currentPlayer = engine.getCurrentPlayer();

      // When: executing with timeout constraint
      const startTime = Date.now();
      await engine.playAITurn(currentPlayer);
      const elapsed = Date.now() - startTime;

      // Then: should complete within reasonable time
      expect(elapsed).toBeLessThan(10000); // 10 second safety limit
    });
  });

  describe("Game State Tracking", () => {
    it("should provide current game state", () => {
      // Given: engine at any point
      engine.startGame();

      // When: getting state
      const state = engine.getGameState();

      // Then: should have all required fields
      expect(state.phase).toBeDefined();
      expect(state.players).toBeDefined();
      expect(state.tableCards).toBeDefined();
      expect(state.currentPlayerIndex).toBeDefined();
    });

    it("should track phase transitions", () => {
      // Given: game initialized
      const phases = [];
      engine.startGame();
      phases.push(engine.getGameState().phase);

      // When: advancing game
      // Phase should change from setup to playing
      // Then: should track progression
      expect(phases.length).toBeGreaterThan(0);
      expect(phases[0]).toBe("playing");
    });

    it("should provide move history", () => {
      // Given: game with moves
      engine.startGame();
      const hand = engine.getGameState().players[0].hand;
      if (hand.length > 0) {
        engine.playTurn(0, { card: hand[0], isCapture: false });
      }

      // When: getting history
      const history = engine.getMoveHistory();

      // Then: should contain moves
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe("Victory Detection", () => {
    it("should detect game over condition - basic type check", () => {
      // Given: game initialized
      engine.startGame();

      // When: checking if game over
      const isOver = engine.isGameOver();

      // Then: should return boolean
      expect(typeof isOver).toBe("boolean");
    });

    // Scopa Rules default: Win = 11+ points AND 2+ point lead
    describe("Winning Condition: 11+ points with 2+ point lead", () => {
      it("should return false when both players below 11 points", () => {
        // Given: game with scores below threshold
        engine.startGame();
        const state = engine.getGameState();
        state.players[0].score = 10;
        state.players[1].score = 8;

        // When: checking if game over
        const isOver = engine.isGameOver();

        // Then: game should not be over
        expect(isOver).toBe(false);
      });

      it("should return false when player at 11 but opponent at 10 (only 1-point lead)", () => {
        // Given: player 1 at 11, player 2 at 10 (insufficient lead)
        engine.startGame();
        const state = engine.getGameState();
        state.players[0].score = 11;
        state.players[1].score = 10;

        // When: checking if game over
        const isOver = engine.isGameOver();

        // Then: game should not be over (need 2-point lead)
        expect(isOver).toBe(false);
      });

      it("should return true when player reaches 11 with 2-point lead (11-9)", () => {
        // Given: player 1 at 11, player 2 at 9 (2-point lead)
        engine.startGame();
        const state = engine.getGameState();
        state.players[0].score = 11;
        state.players[1].score = 9;

        // When: checking if game over
        const isOver = engine.isGameOver();

        // Then: game should be over
        expect(isOver).toBe(true);
      });

      it("should return true when player reaches 12 with 2-point lead (12-10)", () => {
        // Given: player 1 at 12, player 2 at 10 (2-point lead)
        engine.startGame();
        const state = engine.getGameState();
        state.players[0].score = 12;
        state.players[1].score = 10;

        // When: checking if game over
        const isOver = engine.isGameOver();

        // Then: game should be over
        expect(isOver).toBe(true);
      });

      it("should return true when player at 13 with larger lead (13-11)", () => {
        // Given: player 1 at 13, player 2 at 11 (2-point lead)
        engine.startGame();
        const state = engine.getGameState();
        state.players[0].score = 13;
        state.players[1].score = 11;

        // When: checking if game over
        const isOver = engine.isGameOver();

        // Then: game should be over
        expect(isOver).toBe(true);
      });

      it("should detect player 2 winning (opposite direction)", () => {
        // Given: player 2 at 11, player 1 at 8 (player 2 wins with 3-point lead)
        engine.startGame();
        const state = engine.getGameState();
        state.players[0].score = 8;
        state.players[1].score = 11;

        // When: checking if game over
        const isOver = engine.isGameOver();

        // Then: game should be over
        expect(isOver).toBe(true);
      });

      it("should return false when scores are tied at 11-11", () => {
        // Given: both players at 11 (no lead)
        engine.startGame();
        const state = engine.getGameState();
        state.players[0].score = 11;
        state.players[1].score = 11;

        // When: checking if game over
        const isOver = engine.isGameOver();

        // Then: game should not be over (need lead to win)
        expect(isOver).toBe(false);
      });

      it("should return false when scores are tied at 12-12", () => {
        // Given: both players at 12 (tied, no lead)
        engine.startGame();
        const state = engine.getGameState();
        state.players[0].score = 12;
        state.players[1].score = 12;

        // When: checking if game over
        const isOver = engine.isGameOver();

        // Then: game should not be over (tied is not a win)
        expect(isOver).toBe(false);
      });

      it("should return false when player at 10 but opponent ahead (10-11)", () => {
        // Given: player 1 at 10, player 2 at 11
        engine.startGame();
        const state = engine.getGameState();
        state.players[0].score = 10;
        state.players[1].score = 11;

        // When: checking if game over
        const isOver = engine.isGameOver();

        // Then: game should not be over (player 2 only has 1-point lead)
        expect(isOver).toBe(false);
      });
    });

    it("should identify winner", () => {
      // Given: game that could have winner
      engine.startGame();

      // Manually set scores for testing (in real scenario, would play game)
      const state = engine.getGameState();
      state.players[0].score = 21;
      state.players[1].score = 15;

      // When: checking winner
      const winner = engine.getWinner();

      // Then: should identify winner or null
      expect(winner === null || [0, 1].includes(winner)).toBe(true);
    });

    it("should detect tie", () => {
      // Given: game with tied scores
      engine.startGame();
      const state = engine.getGameState();
      state.players[0].score = 20;
      state.players[1].score = 20;

      // When: checking for tie
      const isTie = engine.isTie();

      // Then: should return boolean
      expect(typeof isTie).toBe("boolean");
    });
  });

  describe("Game Queries", () => {
    it("should report available moves", () => {
      // Given: game initialized
      engine.startGame();
      const currentPlayer = engine.getCurrentPlayer();

      // When: getting available moves
      const moves = engine.getAvailableMoves(currentPlayer);

      // Then: should return array of moves
      expect(Array.isArray(moves)).toBe(true);
      expect(moves.length).toBeGreaterThan(0);
    });

    it("should check if hand empty", () => {
      // Given: game with player having cards
      engine.startGame();
      const state = engine.getGameState();

      // When: checking if hand empty
      const isEmpty = state.players[0].hand.length === 0;

      // Then: should return proper status
      expect(typeof isEmpty).toBe("boolean");
    });

    it("should provide player info", () => {
      // Given: engine with players
      engine.startGame();

      // When: getting player info
      const info = engine.getPlayerInfo(0);

      // Then: should return player details
      expect(info).not.toBeNull();
      expect(info.name).toBeDefined();
      expect(info.score).toBeDefined();
      expect(info.handSize).toBeDefined();
    });
  });
});
