/**
 * Configuration constants and defaults
 */

export const CONFIG = {
  // Game settings
  TARGET_SCORES: [11, 15, 21, 30],
  DEFAULT_TARGET_SCORE: 11,

  // Settanta methods
  SETTANTA_METHODS: ["prime", "simplified", "numerical"],
  DEFAULT_SETTANTA_METHOD: "prime",

  // AI strategies
  AI_STRATEGIES: ["greedy", "negamax", "mcts"],
  DEFAULT_AI_STRATEGY: "greedy",

  // AI parameters
  AI_RESPONSE_TIME_LIMIT: 5000, // ms
  NEGAMAX_DEFAULT_DEPTH: 4,
  MCTS_DEFAULT_ROLLOUTS: 1000,

  // Game phases
  PHASES: [
    "setup",
    "dealing",
    "playing",
    "redeal",
    "roundEnd",
    "scoring",
    "gameEnd",
  ],

  // Card ranks and suits
  SUITS: ["denari", "coppe", "spade", "bastoni"],
  RANKS: [
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
  ],
};
