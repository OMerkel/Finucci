/**
 * Card Component
 * Renders individual playing cards with SVG graphics and interaction
 */

export class CardComponent {
  constructor(card, deckName = "carte_merkel") {
    this.card = card;
    this.deckName = deckName;
    this.element = null;
    this.isSelected = false;
  }

  /**
   * Get SVG path for card
   * @returns {string} Path to card SVG
   */
  getCardImagePath() {
    const canonicalToItalian = {
      suit: {
        denari: "denari",
        coppe: "coppe",
        spade: "spade",
        bastoni: "bastoni",
      },
      rank: {
        asso: "asso",
        fante: "fante",
        re: "re",
      },
    };

    const italianToSpanishDeckKeys = {
      suit: {
        denari: "oros",
        coppe: "copas",
        spade: "espadas",
        bastoni: "bastos",
      },
      rank: {
        asso: "as",
        fante: "sota",
        cavallo: "caballo",
        re: "rey",
      },
    };

    if (this.deckName === "carte_merkel") {
      const suit = canonicalToItalian.suit[this.card.suit] || this.card.suit;
      const rank = canonicalToItalian.rank[this.card.rank] || this.card.rank;
      return `img/deck/${this.deckName}/${suit}_${rank}.svg`;
    }

    if (this.deckName === "mazzo_spagnolo") {
      const suit =
        italianToSpanishDeckKeys.suit[this.card.suit] || this.card.suit;
      const rank =
        italianToSpanishDeckKeys.rank[this.card.rank] || this.card.rank;
      return `img/deck/${this.deckName}/${suit}_${rank}.svg`;
    }

    return `img/deck/${this.deckName}/${this.card.suit}_${this.card.rank}.svg`;
  }

  /**
   * Get card display name
   * @returns {string}
   */
  getCardName() {
    const rankNames = {
      asso: "asso",
      fante: "fante",
      cavallo: "cavallo",
      re: "re",
    };
    const rankName = rankNames[this.card.rank] || this.card.rank;
    const suitNames = {
      denari: "denari",
      coppe: "coppe",
      spade: "spade",
      bastoni: "bastoni",
    };
    const suitName = suitNames[this.card.suit] || this.card.suit;
    return `${rankName} di ${suitName}`;
  }

  /**
   * Create card element
   * @param {Object} options - Rendering options
   * @returns {HTMLElement}
   */
  createElement(options = {}) {
    const { clickable = true, onSelect = null } = options;

    const div = document.createElement("div");
    div.className = "card-element";
    div.dataset.suit = this.card.suit;
    div.dataset.rank = this.card.rank;
    div.title = this.getCardName();

    const img = document.createElement("img");
    img.src = this.getCardImagePath();
    img.alt = this.getCardName();
    img.className = "card-image";
    img.loading = "lazy";

    if (clickable) {
      div.classList.add("card-clickable");
      div.setAttribute("role", "button");
      div.setAttribute("tabindex", "0");
      div.setAttribute("aria-label", this.getCardName());

      const handleSelect = () => {
        this.toggleSelect(); // Update visual state immediately
        if (onSelect) onSelect(this); // Then notify GameBoard
      };

      div.addEventListener("click", handleSelect);
      div.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleSelect();
        }
      });
    }

    div.appendChild(img);
    this.element = div;
    return div;
  }

  /**
   * Toggle selection state
   */
  toggleSelect() {
    this.isSelected = !this.isSelected;
    if (this.element) {
      this.element.classList.toggle("card-selected", this.isSelected);
    }
  }

  /**
   * Set selection state
   */
  setSelected(selected) {
    this.isSelected = selected;
    if (this.element) {
      this.element.classList.toggle("card-selected", selected);
    }
  }

  /**
   * Get card data for identification
   */
  getCardData() {
    return {
      suit: this.card.suit,
      rank: this.card.rank,
      value: this.card.value,
    };
  }
}

/**
 * Create multiple card elements
 */
export function createCardElements(
  cards,
  deckName = "carte_merkel",
  options = {},
) {
  return cards.map((card) => {
    const cardComponent = new CardComponent(card, deckName);
    return cardComponent.createElement(options);
  });
}
