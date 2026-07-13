/**
 * Scopa helpers for sweep detection and scoring eligibility.
 */

export const ScopaEngine = {
  isScopa(playedCard, tableCards, captureSet) {
    void playedCard;
    return (
      Array.isArray(tableCards) &&
      Array.isArray(captureSet) &&
      tableCards.length > 0 &&
      captureSet.length === tableCards.length
    );
  },

  awardScopa(player) {
    return {
      ...player,
      scope: (player.scope || 0) + 1,
    };
  },
};

export function isTableSweep(tableCards, captureSet) {
  return (
    Array.isArray(tableCards) &&
    Array.isArray(captureSet) &&
    tableCards.length > 0 &&
    captureSet.length === tableCards.length
  );
}

export function isScoringScopa({
  tableCards,
  captureSet,
  remainingHandCount,
  remainingDeckCount,
  enableFinalCardScopa = false,
}) {
  if (!isTableSweep(tableCards, captureSet)) {
    return false;
  }

  if (
    !enableFinalCardScopa &&
    remainingHandCount === 0 &&
    remainingDeckCount === 0
  ) {
    return false;
  }

  return true;
}
