/**
 * CaptureEngine validates and executes capture moves.
 * Handles: capture validation, single-complement preference, forced capture
 * Requirement: FR-4, FR-5 (Capture mechanics)
 */
export const CaptureEngine = {
  /**
   * Get all valid capture combinations from table for card
   * Scopa rule:
   * 1) if exact single-card matches exist, only those are legal
   * 2) otherwise any multi-card set summing to played card value is legal
   * @param {Card} playedCard
   * @param {Card[]} tableCards
   * @returns {Card[][]} Array of valid capture sets
   */
  getValidCaptures(playedCard, tableCards) {
    const target = playedCard.value;
    const exactMatches = tableCards.filter((card) => card.value === target);

    // Exact-match priority: if any single exact capture exists, sums are forbidden.
    if (exactMatches.length > 0) {
      return exactMatches.map((card) => [card]);
    }

    const validCaptures = [];

    // Generate all subsets of table cards
    const subsets = CaptureEngine._generateSubsets(tableCards);

    // Valid multi-card captures sum to the played card value.
    for (const subset of subsets) {
      if (subset.length < 2) continue;
      const sum = subset.reduce((acc, card) => acc + card.value, 0);
      if (sum === target) {
        validCaptures.push(subset);
      }
    }

    return validCaptures;
  },

  /**
   * Check if capture is available
   * @param {Card} playedCard
   * @param {Card[]} tableCards
   * @returns {boolean}
   */
  hasCapture(playedCard, tableCards) {
    return CaptureEngine.getValidCaptures(playedCard, tableCards).length > 0;
  },

  /**
   * Enforce exact-match priority
   * If any 1-card captures exist, multi-card captures are not allowed
   * @param {Card[][]} captures
   * @returns {Card[][]}
   */
  applyExactMatchPriority(captures) {
    const singleCard = captures.filter((c) => c.length === 1);
    if (singleCard.length > 0) {
      return singleCard;
    }
    return captures;
  },

  applySingleComplementPreference(captures) {
    return CaptureEngine.applyExactMatchPriority(captures);
  },

  /**
   * Generate all subsets of array
   * @private
   * @param {Array} arr
   * @returns {Array[]}
   */
  _generateSubsets(arr) {
    const subsets = [];
    for (let i = 0; i < 2 ** arr.length; i++) {
      const subset = [];
      for (let j = 0; j < arr.length; j++) {
        if (i & (1 << j)) {
          subset.push(arr[j]);
        }
      }
      if (subset.length > 0) {
        subsets.push(subset);
      }
    }
    return subsets;
  },
};
