/**
 * Configuration Module
 * Manages game configuration: target scores, settanta methods, house rules, AI parameters
 * Requirements: FR-11 (Game Configuration), FR-12.3, FR-17.1, FR-17.3, FR-UI-1.3
 */

/**
 * Default game configuration
 * FR-11: Configurable game parameters
 */
export const DEFAULT_MANDATORY_CAPTURE_DISPLAY_DURATION_MS = 6000;

export const DEFAULT_CONFIG = {
  // Game play settings
  targetScore: 11,
  settantaMethod: "numerical", // FR-11.2: "numerical", "prime", or "simplified"
  requireMinimumLead: true,
  minimumLead: 2,

  // House rules
  enableFinalCardScopa: false, // FR-11.3: By default, do not award Scopa on the final card of the round

  // AI settings
  aiStrategy: "greedy", // "greedy", "negamax", "mcts"
  aiResponseTime: 5000, // milliseconds, FR-12.3
  negamaxTimeout: 4500, // iterative deepening timeout
  mctsRolloutsPerDecision: 1000, // FR-17.1

  // Display/UI settings
  mandatoryCaptureDisplayDurationMs:
    DEFAULT_MANDATORY_CAPTURE_DISPLAY_DURATION_MS, // FR-UI-1.3
  animationEnabled: true,
  soundEnabled: false,

  // Metadata
  ruleProfile: "digital_default",
  ruleProfileVersion: "1.0.0",
};

/**
 * Explicit rule profiles (FR-11.4)
 */
export const RULE_PROFILES = {
  classic_scopa: {
    targetScore: 11,
    settantaMethod: "prime",
    requireMinimumLead: true,
    minimumLead: 2,
    enableFinalCardScopa: false,
    ruleProfile: "classic_scopa",
    ruleProfileVersion: "1.0.0",
  },
  digital_default: {
    ...DEFAULT_CONFIG,
    ruleProfile: "digital_default",
    ruleProfileVersion: "1.0.0",
  },
};

/**
 * Configuration validation schema
 */
const VALIDATION_SCHEMA = {
  targetScore: {
    type: "number",
    min: 10,
    max: 30,
    description: "Game target score (10-30)",
  },
  settantaMethod: {
    type: "string",
    enum: ["numerical", "prime", "simplified"],
    description: "Settanta scoring method",
  },
  enableFinalCardScopa: { type: "boolean" },
  aiStrategy: {
    type: "string",
    enum: ["greedy", "negamax", "mcts"],
    description: "AI strategy",
  },
  aiResponseTime: {
    type: "number",
    min: 500,
    max: 30000,
    description: "AI response time in ms",
  },
  mctsRolloutsPerDecision: {
    type: "number",
    min: 100,
    max: 10000,
    description: "MCTS rollout count per decision",
  },
  mandatoryCaptureDisplayDurationMs: {
    type: "number",
    min: 1000,
    max: 10000,
    description: "Mandatory capture display duration in ms",
  },
  ruleProfile: {
    type: "string",
    enum: ["classic_scopa", "digital_default"],
    description: "Selected rule profile",
  },
  ruleProfileVersion: {
    type: "string",
    description: "Rule profile version",
  },
};

/**
 * Get a rule profile by name
 *
 * @param {string} profileName - classic_scopa | digital_default
 * @returns {Object} Profile configuration object
 */
export function getRuleProfile(profileName) {
  const profile = RULE_PROFILES[profileName];
  if (!profile) {
    throw new Error(
      `Unknown rule profile: ${profileName}. Available: ${Object.keys(RULE_PROFILES).join(", ")}`,
    );
  }
  return { ...profile };
}

/**
 * Apply a rule profile atomically at game start, with optional overrides
 *
 * @param {string} profileName - classic_scopa | digital_default
 * @param {Object} overrides - Additional per-game overrides
 * @returns {Object} Complete validated configuration
 */
export function applyRuleProfile(profileName, overrides = {}) {
  const profile = getRuleProfile(profileName);
  return createConfiguration({ ...profile, ...overrides });
}

/**
 * Load configuration from JSON object
 * FR-17.3: Load configuration from file
 *
 * @param {Object} configData - Configuration object
 * @returns {Object} Merged configuration with defaults
 */
export function loadConfiguration(configData) {
  if (!configData || typeof configData !== "object") {
    return { ...DEFAULT_CONFIG };
  }

  return {
    ...DEFAULT_CONFIG,
    ...configData,
    settantaMethod: configData.settantaMethod ?? DEFAULT_CONFIG.settantaMethod,
  };
}

/**
 * Validate configuration against schema
 * FR-17.3: Validate configuration values
 *
 * @param {Object} config - Configuration to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateConfiguration(config) {
  const errors = [];

  if (!config || typeof config !== "object") {
    return { valid: false, errors: ["Configuration must be an object"] };
  }

  // Check each property against schema
  for (const [key, schema] of Object.entries(VALIDATION_SCHEMA)) {
    const value = config[key];

    if (value === undefined) continue; // Optional if using defaults

    // Type check
    const typeMatches =
      (schema.type === "string" && typeof value === "string") ||
      (schema.type === "number" && typeof value === "number") ||
      (schema.type === "boolean" && typeof value === "boolean") ||
      (schema.type === "object" && typeof value === "object") ||
      (schema.type === "function" && typeof value === "function") ||
      (schema.type === "undefined" && typeof value === "undefined") ||
      (schema.type === "bigint" && typeof value === "bigint") ||
      (schema.type === "symbol" && typeof value === "symbol");

    if (!typeMatches) {
      errors.push(`${key}: expected ${schema.type}, got ${typeof value}`);
      continue;
    }

    // Enum validation
    if (schema.enum && !schema.enum.includes(value)) {
      errors.push(
        `${key}: must be one of ${schema.enum.join(", ")}, got "${value}"`,
      );
    }

    // Range validation
    if (schema.min !== undefined && value < schema.min) {
      errors.push(`${key}: must be >= ${schema.min}, got ${value}`);
    }
    if (schema.max !== undefined && value > schema.max) {
      errors.push(`${key}: must be <= ${schema.max}, got ${value}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create configuration with custom values
 * FR-11: Custom game configuration
 *
 * @param {Object} overrides - Configuration overrides
 * @returns {Object} Complete configuration
 */
export function createConfiguration(overrides = {}) {
  const config = loadConfiguration(overrides);

  // Validate the merged config
  const validation = validateConfiguration(config);

  if (!validation.valid) {
    throw new Error(`Invalid configuration: ${validation.errors.join("; ")}`);
  }

  return config;
}

/**
 * Get configuration preset
 * Common game variants
 *
 * @param {string} preset - Preset name: "standard", "quick", "tournament"
 * @returns {Object} Preset configuration
 */
export function getConfigurationPreset(preset) {
  const presets = {
    standard: {
      targetScore: 11,
      settantaMethod: "numerical",
      aiStrategy: "negamax",
      aiResponseTime: 5000,
    },
    quick: {
      targetScore: 15,
      settantaMethod: "simplified",
      aiStrategy: "greedy",
      aiResponseTime: 2000,
    },
    tournament: {
      targetScore: 30,
      settantaMethod: "numerical",
      aiStrategy: "mcts",
      aiResponseTime: 8000,
      mctsRolloutsPerDecision: 2000,
    },
  };

  if (!presets[preset]) {
    throw new Error(
      `Unknown preset: ${preset}. Available: ${Object.keys(presets).join(", ")}`,
    );
  }

  return createConfiguration(presets[preset]);
}
