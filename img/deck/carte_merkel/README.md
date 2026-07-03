# Carte da Gioco Italiane

Copyright 2026 Oliver Merkel, <merkel.oliver@web.de>

## Structure

40-card Italian deck with these four suits:

- Denari (Coins)
- Coppe (Cups)
- Spade (Swords)
- Bastoni (Clubs or Batons)

Each suit contains these ranks:

- Asso (Ace)
- 2
- 3
- 4
- 5
- 6
- 7
- Fante
- Cavallo
- Re

## Assets

Run the generator to create the complete SVG deck in this folder:

```bash
python generate_carte_da_gioco_italiane.py
```

Or run the VS Code task `Generate Carte da Gioco Italiane Deck`.

Generated files:

- `denari_asso.svg` through `denari_re.svg`
- `coppe_asso.svg` through `coppe_re.svg`
- `spade_asso.svg` through `spade_re.svg`
- `bastoni_asso.svg` through `bastoni_re.svg`
- `carte_da_gioco_italiane_back.svg`
- `carte_da_gioco_italiane_sheet.svg`

The card faces are rendered as traditional-style vector artwork intended to stay
close to a classic printed Italian deck look while remaining lightweight and
editable.
