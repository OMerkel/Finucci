/**
 * Test suite for Configuration
 * Tests: config loading, validation, defaults, presets
 * Requirements: FR-11.1, FR-11.2, FR-11.3, FR-11.4, FR-12.3, FR-17.1, FR-17.3, FR-UI-1.3
 */

import { describe, expect, it } from "vitest";
import {
  applyRuleProfile,
  createConfiguration,
  DEFAULT_MANDATORY_CAPTURE_DISPLAY_DURATION_MS,
  getConfigurationPreset,
  getRuleProfile,
  loadConfiguration,
  RULE_PROFILES,
  validateConfiguration,
} from "../config/configuration.js";

describe("Configuration", () => {
  it("should load default configuration", () => {
    // Given: no configuration
    // When: loading default
    const config = loadConfiguration({});

    // Then: should have default values
    expect(config.targetScore).toBe(11);
    expect(config.settantaMethod).toBe("numerical");
    expect(config.aiStrategy).toBe("greedy");
    expect(config.enableFinalCardScopa).toBe(false);
    expect(config.mandatoryCaptureDisplayDurationMs).toBe(
      DEFAULT_MANDATORY_CAPTURE_DISPLAY_DURATION_MS,
    );
  });

  it("should merge custom values with defaults", () => {
    // Given: custom configuration
    const custom = { targetScore: 15, settantaMethod: "prime" };

    // When: loading with overrides
    const config = loadConfiguration(custom);

    // Then: should have mixed values
    expect(config.targetScore).toBe(15);
    expect(config.settantaMethod).toBe("prime");
    expect(config.aiStrategy).toBe("greedy"); // default preserved
  });

  it("should validate correct configuration", () => {
    // Given: valid configuration
    const config = {
      targetScore: 11,
      settantaMethod: "numerical",
      aiResponseTime: 5000,
    };

    // When: validating
    const result = validateConfiguration(config);

    // Then: should be valid
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it("should reject invalid target score", () => {
    // Given: config with out-of-range targetScore
    const config = { targetScore: 100 }; // exceeds max of 30

    // When: validating
    const result = validateConfiguration(config);

    // Then: should be invalid
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("should reject invalid Settanta method", () => {
    // Given: config with invalid method
    const config = { settantaMethod: "invalid" };

    // When: validating
    const result = validateConfiguration(config);

    // Then: should be invalid
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("settantaMethod"))).toBe(true);
  });

  it("should support custom target scores (15, 21, 30)", () => {
    // Given: custom target scores
    const scores = [15, 21, 30];

    // When: creating configs with each
    const configs = scores.map((score) =>
      createConfiguration({ targetScore: score }),
    );

    // Then: all should be valid
    configs.forEach((cfg, idx) => {
      expect(cfg.targetScore).toBe(scores[idx]);
    });
  });

  it("should support numerical Settanta method", () => {
    // Given: numerical Settanta config
    // When: creating config
    const config = createConfiguration({ settantaMethod: "numerical" });

    // Then: should accept it
    expect(config.settantaMethod).toBe("numerical");
  });

  it("should support Primiera Settanta method", () => {
    // Given: Primiera Settanta config
    // When: creating config
    const config = createConfiguration({ settantaMethod: "prime" });

    // Then: should accept it
    expect(config.settantaMethod).toBe("prime");
  });

  it("should support simplified Settanta method", () => {
    // Given: simplified Settanta config
    // When: creating config
    const config = createConfiguration({ settantaMethod: "simplified" });

    // Then: should accept it
    expect(config.settantaMethod).toBe("simplified");
  });

  it("should load standard preset configuration", () => {
    // Given: standard preset
    // When: loading preset
    const config = getConfigurationPreset("standard");

    // Then: should have standard values
    expect(config.targetScore).toBe(11);
    expect(config.aiStrategy).toBe("negamax");
  });

  it("should load quick preset configuration", () => {
    // Given: quick preset
    // When: loading preset
    const config = getConfigurationPreset("quick");

    // Then: should have quick values
    expect(config.targetScore).toBe(15);
    expect(config.aiStrategy).toBe("greedy");
  });

  it("should load tournament preset configuration", () => {
    // Given: tournament preset
    // When: loading preset
    const config = getConfigurationPreset("tournament");

    // Then: should have tournament values
    expect(config.targetScore).toBe(30);
    expect(config.aiStrategy).toBe("mcts");
    expect(config.mctsRolloutsPerDecision).toBe(2000);
  });

  it("should throw on unknown preset", () => {
    // Given: unknown preset name
    // When: loading preset
    // Then: should throw error
    expect(() => getConfigurationPreset("unknown")).toThrow();
  });

  it("should throw on invalid configuration", () => {
    // Given: invalid config
    const invalid = { targetScore: 100, settantaMethod: "invalid" };

    // Then: should throw
    expect(() => createConfiguration(invalid)).toThrow();
  });

  it("should support configurable mandatory capture display duration", () => {
    // Given: preconditions for "should load default configuration" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const config = createConfiguration({
      mandatoryCaptureDisplayDurationMs: 6000,
    });
    expect(config.mandatoryCaptureDisplayDurationMs).toBe(6000);
  });

  it("should reject too-small mandatory capture display duration", () => {
    // Given: preconditions for "should reject too-small mandatory capture display duration" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const result = validateConfiguration({
      mandatoryCaptureDisplayDurationMs: 500,
    });
    expect(result.valid).toBe(false);
    expect(
      result.errors.some((e) =>
        e.includes("mandatoryCaptureDisplayDurationMs"),
      ),
    ).toBe(true);
  });

  it("should expose explicit rule profiles", () => {
    // Given: preconditions for "should expose explicit rule profiles" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    expect(Object.keys(RULE_PROFILES)).toContain("classic_scopa");
    expect(Object.keys(RULE_PROFILES)).toContain("digital_default");
  });

  it("should provide classic_scopa profile defaults", () => {
    // Given: preconditions for "should provide classic_scopa profile defaults" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const profile = getRuleProfile("classic_scopa");
    expect(profile.ruleProfile).toBe("classic_scopa");
    expect(profile.targetScore).toBe(11);
    expect(profile.requireMinimumLead).toBe(true);
    expect(profile.enableFinalCardScopa).toBe(false);
  });

  it("should apply rule profiles atomically with metadata", () => {
    // Given: preconditions for "should apply rule profiles atomically with metadata" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const config = applyRuleProfile("digital_default");
    expect(config.ruleProfile).toBe("digital_default");
    expect(typeof config.ruleProfileVersion).toBe("string");
    expect(config.targetScore).toBe(11);
  });

  it("should allow overrides on top of selected rule profile", () => {
    // Given: preconditions for "should allow overrides on top of selected rule profile" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const config = applyRuleProfile("classic_scopa", {
      targetScore: 15,
      aiStrategy: "mcts",
    });
    expect(config.ruleProfile).toBe("classic_scopa");
    expect(config.targetScore).toBe(15);
    expect(config.aiStrategy).toBe("mcts");
  });
});
