import { CaptureEngine } from "./capture.js";

/**
 * RulesEngine enforces game rules.
 * Handles: forced capture and move legality checks
 * Requirement: FR-4.3, FR-11 (Game rules enforcement)
 */
export const RulesEngine = {
  /**
   * Enforce forced capture rule
   * If capture possible, must capture (cannot discard)
   * @param {Card} playedCard
   * @param {Card[]} tableCards
   * @returns {boolean} True if capture is forced
   */
  isCaptureForced(playedCard, tableCards) {
    return CaptureEngine.hasCapture(playedCard, tableCards);
  },

  /**
   * Validate move against rules
   * @param {Card} playedCard
   * @param {Card[]} tableCards
   * @param {Card[]} selectedCapture
   * @returns {Object} {valid: boolean, reason?: string}
   */
  validateMove(playedCard, tableCards, selectedCapture) {
    // If no capture selected, check if forced
    if (!selectedCapture || selectedCapture.length === 0) {
      const captureForced = RulesEngine.isCaptureForced(playedCard, tableCards);
      if (captureForced) {
        return {
          valid: false,
          reason: "Capture is forced when available",
        };
      }
      return { valid: true };
    }

    const legalCaptures = CaptureEngine.getValidCaptures(
      playedCard,
      tableCards,
    );
    const isLegalCapture = legalCaptures.some(
      (candidate) =>
        candidate.length === selectedCapture.length &&
        candidate.every((candidateCard) =>
          selectedCapture.some((selectedCard) =>
            selectedCard.equals(candidateCard),
          ),
        ),
    );

    if (!isLegalCapture) {
      return {
        valid: false,
        reason: "Selected cards are not a legal capture for this played card",
      };
    }

    return { valid: true };
  },
};
