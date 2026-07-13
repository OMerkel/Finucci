/**
 * Test suite for PWA contract
 * Tests: manifest, service worker strategies, build-output compatibility hooks
 * Requirements: FR-18.1, FR-18.2, FR-18.3, FR-18.4
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("PWA", () => {
  it("should provide a valid install manifest with required fields", () => {
    // Given: preconditions for "should provide a valid install manifest with required fields" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const manifestPath = resolve(process.cwd(), "src/manifest.json");
    expect(existsSync(manifestPath)).toBe(true);

    const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));

    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBeTruthy();
    expect(manifest.scope).toBeTruthy();
    expect(manifest.display).toBe("standalone");
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  it("should register install/activate/fetch handlers in service worker", () => {
    // Given: preconditions for "should register install/activate/fetch handlers in service worker" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const swPath = resolve(process.cwd(), "src/sw.js");
    expect(existsSync(swPath)).toBe(true);

    const sw = readFileSync(swPath, "utf-8");
    expect(sw).toContain("self.addEventListener(\"install\"");
    expect(sw).toContain("self.addEventListener(\"activate\"");
    expect(sw).toContain("self.addEventListener(\"fetch\"");
  });

  it("should cache app shell for offline start", () => {
    // Given: preconditions for "should cache app shell for offline start" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const swPath = resolve(process.cwd(), "src/sw.js");
    const sw = readFileSync(swPath, "utf-8");

    expect(sw).toContain("APP_SHELL_ASSETS");
    expect(sw).toContain("./index.html");
    expect(sw).toContain("./manifest.json");
    expect(sw).toContain("networkFirstNavigation");
  });

  it("should include runtime caching strategy for static assets", () => {
    // Given: preconditions for "should include runtime caching strategy for static assets" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const swPath = resolve(process.cwd(), "src/sw.js");
    const sw = readFileSync(swPath, "utf-8");

    expect(sw).toContain("staleWhileRevalidate");
    expect(sw).toContain("destination === \"style\"");
    expect(sw).toContain("destination === \"script\"");
    expect(sw).toContain("destination === \"worker\"");
    expect(sw).toContain("destination === \"image\"");
    expect(sw).toContain("destination === \"font\"");
  });

  it("should define build hooks that copy manifest and service worker to dist", () => {
    // Given: preconditions for "should define build hooks that copy manifest and service worker to dist" are established
    // When: executing the behavior under test
    // Then: assertions should confirm the expected result
    const viteConfigPath = resolve(process.cwd(), "vite.config.js");
    expect(existsSync(viteConfigPath)).toBe(true);

    const viteConfig = readFileSync(viteConfigPath, "utf-8");
    expect(viteConfig).toContain("src/sw.js");
    expect(viteConfig).toContain("dist/sw.js");
    expect(viteConfig).toContain("src/manifest.json");
    expect(viteConfig).toContain("dist/manifest.json");
  });
});
