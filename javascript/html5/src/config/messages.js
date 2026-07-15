/**
 * UI message templates for game flow and status text.
 * Centralizing messages avoids duplicated inline literals.
 */

import { formatCardNameItalian } from "../core/card.js";

export const GAME_MESSAGES = {
  EMPTY_HAND: "No cards in hand",
  INVALID_MOVE_GENERIC: "Invalid move. Please try again.",
  SELECT_ONE_HAND_CARD: "Please select only ONE card from your hand!",
  CARD_NOT_FOUND: "Card not found in hand or table!",
  SELECT_HAND_CARD: "Please select a card from your hand!",
  SYSTEM_ERROR_TRY_AGAIN: "An error occurred. Please try again.",

  SCOPA_TOAST: "🧹 Scopa! +1 point 🧹",

  ROUND_COMPLETE_TOAST: "Round complete! Starting new round...",
  ROUND_COMPLETE_STATUS: "Round complete. Dealing next round...",

  INVALID_CAPTURE_SUM: (handValue, tableSum, total) =>
    `Invalid capture! Table sum ${tableSum} does not match played value ${handValue} (total ${total}).`,

  INVALID_MOVE_ERROR: (error) => `Invalid move: ${error}`,
  AI_MOVE_INVALID: (error) => `AI move invalid: ${error}`,

  PREVIEW_DISCARD: (handCard) =>
    `Preview discard: play ${formatCardNameItalian(handCard)} to table.`,
  PREVIEW_CAPTURE: (terms, total) =>
    `Preview capture: selected table cards ${terms} = ${total}.`,
  PREVIEW_SCOPA: (terms, total) =>
    `Preview Scopa: selected table cards ${terms} = ${total}. 🧹Table sweep (+1)!🧹`,

  RESOLUTION_DISCARD: (handCard) =>
    `Discarded ${formatCardNameItalian(handCard)} to the table.`,
  RESOLUTION_CAPTURE: (count, terms, total) =>
    `Captured ${count} card(s): table sum ${terms} = ${total}.`,
  RESOLUTION_SCOPA_SUFFIX: " 🧹Scopa scored (+1)!🧹",
};
