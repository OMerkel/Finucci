/**
 * Test suite for Persistence
 * Tests: SGF parsing/export, stats tracking, config loading
 * Requirements: FR-14.1, FR-14.2, FR-14.3, FR-14.4, FR-14.6, FR-16.1, FR-16.2
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  exportToSGF,
  PlayerStats,
  parseSGF,
  StatisticsManager,
} from "../persistence/persistence-manager.js";

describe("Persistence", () => {
  let statsManager;

  beforeEach(() => {
    statsManager = new StatisticsManager();
  });

  describe("SGF Export/Import", () => {
    it("should export game to SGF format", () => {
      // Given: game data
      const gameData = {
        players: ["Alice", "Bob"],
        hands: [[], []],
        tableCards: ["asso di denari", "2 di coppe"],
        captured: [["3 di spade"], ["4 di bastoni"]],
        scores: [10, 8],
        moveHistory: ["play Asso", "capture 2", "play 2"],
      };

      // When: exporting to SGF
      const sgf = exportToSGF(gameData);

      // Then: should produce valid SGF string
      expect(sgf).toContain("(;GM[Scopa]");
      expect(sgf).toContain("P1[Alice]");
      expect(sgf).toContain("P2[Bob]");
      expect(sgf).toContain("S1[10]");
      expect(sgf).toContain("S2[8]");
    });

    it("should parse SGF game record", () => {
      // Given: SGF format string
      const sgf =
        "(;GM[Scopa]P1[Alice]P2[Bob]H1[asso di denari,2 di coppe]H2[3 di spade]T[4 di bastoni]C1[5 di denari]C2[6 di coppe]S1[10]S2[8]M[play Asso,capture 2])";

      // When: parsing SGF
      const parsed = parseSGF(sgf);

      // Then: should extract game data
      expect(parsed).not.toBeNull();
      expect(parsed.players[0]).toBe("Alice");
      expect(parsed.players[1]).toBe("Bob");
      expect(parsed.hands[0]).toContain("asso di denari");
      expect(parsed.tableCards).toContain("4 di bastoni");
    });

    it("should handle null SGF input gracefully", () => {
      // Given: null SGF
      // When: parsing null
      const parsed = parseSGF(null);

      // Then: should return null
      expect(parsed).toBeNull();
    });

    it("should roundtrip SGF (export and reimport)", () => {
      // Given: game data
      const original = {
        players: ["Player1", "Player2"],
        hands: [["asso di denari"], ["2 di coppe"]],
        tableCards: ["3 di spade"],
        captured: [[], []],
        scores: [0, 0],
        moveHistory: [],
      };

      // When: export then parse
      const sgf = exportToSGF(original);
      const parsed = parseSGF(sgf);

      // Then: parsed data should match original
      expect(parsed.players).toEqual(original.players);
      expect(parsed.hands).toEqual(original.hands);
      expect(parsed.scores).toEqual(undefined); // Not in parsed format
    });
  });

  describe("Player Statistics", () => {
    it("should track player statistics", () => {
      // Given: player stats
      const stats = new PlayerStats("Alice");

      // When: recording rounds
      stats.recordRound({ won: true, score: 10, Scope: 2 });
      stats.recordRound({ won: true, score: 8, Scope: 1 });
      stats.recordRound({ won: false, score: 5, Scope: 0 });

      // Then: should accumulate correctly
      expect(stats.roundsPlayed).toBe(3);
      expect(stats.roundsWon).toBe(2);
      expect(stats.totalScore).toBe(23);
      expect(stats.totalScope).toBe(3);
    });

    it("should calculate win rate", () => {
      // Given: player with 7 wins in 10 rounds
      const stats = new PlayerStats("Bob");
      for (let i = 0; i < 10; i++) {
        stats.recordRound({ won: i < 7 });
      }

      // When: calculating win rate
      const winRate = stats.getWinRate();

      // Then: should be 70%
      expect(winRate).toBe(70);
    });

    it("should calculate average Scope per round", () => {
      // Given: player with 5 rounds
      const stats = new PlayerStats("Charlie");
      const ScopaCounts = [2, 1, 3, 0, 2];
      ScopaCounts.forEach((count) => {
        stats.recordRound({ won: true, Scope: count });
      });

      // When: calculating average
      const avg = stats.getAverageScope();

      // Then: should be 1.6
      expect(avg).toBe(1.6);
    });

    it("should calculate average score per round", () => {
      // Given: player with 4 rounds
      const stats = new PlayerStats("Diana");
      [10, 15, 20, 5].forEach((score) => {
        stats.recordRound({ won: true, score });
      });

      // When: calculating average
      const avg = stats.getAverageScore();

      // Then: should be 12.5
      expect(avg).toBe(12.5);
    });

    it("should return 0 for stats when no rounds played", () => {
      // Given: new player stats
      const stats = new PlayerStats("Eve");

      // When: checking stats
      // Then: should handle zero division gracefully
      expect(stats.getWinRate()).toBe(0);
      expect(stats.getAverageScope()).toBe(0);
      expect(stats.getAverageScore()).toBe(0);
    });

    it("should reset player statistics", () => {
      // Given: player with stats
      const stats = new PlayerStats("Frank");
      stats.recordRound({ won: true, score: 10 });

      // When: resetting
      const reset = stats.reset();

      // Then: should have new instance with zero values
      expect(reset.roundsPlayed).toBe(0);
      expect(reset.totalScore).toBe(0);
      expect(reset.playerName).toBe("Frank");
    });
  });

  describe("Statistics Manager", () => {
    it("should track multiple player statistics", () => {
      // Given: game result
      const gameResult = {
        player1: {
          name: "Alice",
          won: true,
          score: 15,
          Scope: 2,
        },
        player2: {
          name: "Bob",
          won: false,
          score: 12,
          Scope: 1,
        },
      };

      // When: recording game
      statsManager.recordGame(gameResult);

      // Then: both players should have stats
      const allStats = statsManager.getAllStats();
      expect(allStats.Alice.roundsPlayed).toBe(1);
      expect(allStats.Bob.roundsPlayed).toBe(1);
      expect(allStats.Alice.winRate).toBe(100);
      expect(allStats.Bob.winRate).toBe(0);
    });

    it("should accumulate stats across multiple games", () => {
      // Given: multiple game results
      const games = [
        {
          player1: { name: "Alice", won: true, score: 10 },
          player2: { name: "Bob", won: false, score: 5 },
        },
        {
          player1: { name: "Alice", won: true, score: 12 },
          player2: { name: "Bob", won: false, score: 8 },
        },
        {
          player1: { name: "Alice", won: false, score: 8 },
          player2: { name: "Bob", won: true, score: 14 },
        },
      ];

      // When: recording all games
      games.forEach((game) => {
        statsManager.recordGame(game);
      });

      // Then: should accumulate correctly
      const stats = statsManager.getAllStats();
      expect(stats.Alice.roundsPlayed).toBe(3);
      expect(stats.Alice.roundsWon).toBe(2);
      expect(stats.Alice.totalScore).toBe(30);
    });

    it("should clear all statistics", () => {
      // Given: manager with stats
      statsManager.recordGame({
        player1: { name: "Alice", won: true },
        player2: { name: "Bob", won: false },
      });

      // When: clearing
      statsManager.clear();

      // Then: should be empty
      expect(statsManager.getAllStats()).toEqual({});
      expect(statsManager.gameHistory.length).toBe(0);
    });
  });
});
