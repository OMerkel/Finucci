/**
 * Test suite for GameState module
 * Tests: state immutability, phase transitions, FSM correctness
 * Requirements: FR-1.3, FR-11.1, FR-11.2 (Game state and configuration)
 */

import { describe, expect, it } from "vitest";
import { GameState } from "../core/game-state.js";

describe("GameState", () => {
  it("should create initial game state", () => {
    // Given: no active game state
    // When: creating a new GameState
    // Then: initial phase, round, and players should be initialized
    const state = new GameState();
    expect(state.phase).toBe("setup");
    expect(state.round).toBe(1);
    expect(state.players).toHaveLength(2);
  });

  it("should be immutable (frozen)", () => {
    // Given: a GameState instance
    // When: trying to mutate a property directly
    // Then: mutation should fail
    const state = new GameState();
    expect(() => {
      state.phase = "playing";
    }).toThrow();
  });

  it("should transition to new phase creating new instance", () => {
    // Given: a GameState in setup phase
    // When: transitioning to another phase
    // Then: a new immutable state instance should be returned
    const state1 = new GameState();
    const state2 = state1.transition("dealing");
    expect(state1.phase).toBe("setup");
    expect(state2.phase).toBe("dealing");
    expect(state1).not.toBe(state2);
  });

  it("should track current player correctly", () => {
    // Given: a default two-player state
    // When: reading current player and opponent
    // Then: player pointers should resolve deterministically
    const state = new GameState();
    expect(state.currentPlayer.id).toBe("p1");
    expect(state.opponent.id).toBe("p2");
  });

  it("should detect game over state", () => {
    // Given: a running game state
    // When: transitioning to gameEnd phase
    // Then: isGameOver should become true
    const state = new GameState();
    expect(state.isGameOver).toBe(false);

    const gameOverState = state.transition("gameEnd");
    expect(gameOverState.isGameOver).toBe(true);
  });

  it("should support custom target score", () => {
    // Given: custom target score configuration
    // When: creating a new GameState
    // Then: target score should reflect configured value
    const state = new GameState({ targetScore: 11 });
    expect(state.targetScore).toBe(11);
  });

  it("should support different Settanta methods", () => {
    // Given: alternative Primiera/Settanta methods
    // When: creating states with each method
    // Then: configured method should be preserved
    const state1 = new GameState({ settantaMethod: "prime" });
    const state2 = new GameState({ settantaMethod: "numerical" });
    expect(state1.settantaMethod).toBe("prime");
    expect(state2.settantaMethod).toBe("numerical");
  });
});
