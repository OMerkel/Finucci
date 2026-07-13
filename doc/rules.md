# Scopa

## Overview

Scopa is an Italian fishing-and-capturing card game played by matching the value
of the card you play to cards on the table. The name scopa means broom or sweep
and refers to the special play in which a player captures every card currently
on the table in a single turn.

This document describes a complete two-player ruleset using a 40-card Italian
deck. It is written as a practical, play-ready reference and also notes the
main scoring variations you may encounter.

## Players

- 2 players.

## Deck

Use a 40-card Italian deck with these four suits:

- Denari (Coins)
- Coppe (Cups)
- Spade (Swords)
- Bastoni (Batons)

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

## Card Values In Play

For capture validation and primiera evaluation, cards count as follows:

| Card | Value |
| --- | ---: |
| Asso | 1 |
| 2 | 2 |
| 3 | 3 |
| 4 | 4 |
| 5 | 5 |
| 6 | 6 |
| 7 | 7 |
| Fante | 8 |
| Cavallo | 9 |
| Re | 10 |

Important: on many Italian decks the picture cards are visually distinct but in
play they correspond to values 8, 9, and 10.

## Objective

The objective is to score points by:

- capturing cards,
- making scope,
- taking the 7 of Denari (Settebello),
- winning card-majority categories,
- and winning the primiera category.

The usual game is played over several rounds until one player reaches the target
score.

Most commonly: **First to at least 11 points with a 2-point lead wins**.

## Main Terms

- Table: the face-up cards in the center that can be captured.
- Capture: playing one card and taking table card(s) whose value matches the
  played card under Scopa capture rules.
- Scopa: a capture that clears every card from the table.
- Trick pile or capture pile: the face-down pile of cards a player has won in
  the round.
- Opening layout: the first 4 cards dealt face up to the table at the start of
  the round.

## Before The Round

### Choose The First Dealer

Use any neutral method, such as:

- drawing a random card,
- cutting the deck,
- or agreeing randomly.

After each round, the deal passes to the next player. In many descriptions the
deal passes to the right; the important point is to rotate the dealer
consistently.

Within a single round, the dealer does not change. The same dealer performs the
opening deal and all re-deals until the round ends.

### Shuffle

The dealer thoroughly shuffles the 40 cards.

Recommended physical procedure:

1. Gather all 40 cards from the previous round.
2. Square the deck so no card is exposed.
3. Shuffle several times using overhand, riffle, or table wash methods.
4. Present the deck to the opponent for a cut.

### Cut

The non-dealer cuts the shuffled deck once. The dealer reassembles the pack and
deals from the top.

If you are playing casually and do not wish to cut every round, you may skip the
cut by agreement, but formal play usually includes it.

## Initial Deal And Table Setup

At the start of each round:

1. The dealer gives 3 cards face down to each player.
2. Cards are usually dealt one at a time in counterclockwise order, starting
   with the player to the dealer's right. With only two players, this simply
   alternates between the two players.
3. After both players have 3 cards, the dealer deals 4 cards face up to the
   table.
4. The undealt remainder stays face down as a stock for later hands within the
   same round.

With 2 players, the 40-card deck is exhausted exactly as follows:

- 6 cards are dealt to the players in the opening hand,
- 4 cards are dealt to the table,
- 30 cards remain,
- then 5 more deals of 3 cards to each player consume the rest of the deck.

So each round consists of:

- 1 opening deal with 3 cards each plus 4 to the table,
- followed by 5 further re-deals of 3 cards each to each player,
- for a total of 6 three-card hands per player in the round.

## Who Plays First

The player to the dealer's right plays first. With two players, that is simply
the non-dealer.

Turns continue alternately until both players have played all 3 cards from their
current hand.

## Structure Of A Turn

On your turn, you must play exactly 1 card from your hand face up.

That played card does one of two things:

1. It captures one legal set of table cards according to Scopa capture rules.
2. If no capture is possible, the card stays on the table as a new table card.

After your turn ends, the other player takes the next turn.

## How Captures Work

In Scopa, a played card captures either:

- one table card of the same value, or
- a combination of table cards whose summed values equal the played card value.

Examples:

- If the table shows Asso, 3, 4, 7 and you play a 4, you capture the 4.
- If the table shows 2 and 3 and you play a 5, you capture 2 plus 3.
- If the table shows 6 and Cavallo, a played Asso captures neither, because
  value 1 does not match 6, 9, or 6+9.
- If the table shows Re and 5, a played 5 captures the 5 only. It cannot capture
  Re plus 5 because 10+5 does not equal 5.

### One Capture Set Per Turn

Your played card captures exactly one legal set of table cards.

If several different legal sets are available, you choose which one to take,
except when exact-match priority applies (see below).

You do not combine multiple separate capture groups in the same turn unless all
the chosen table cards together form one single legal set with your played card.

### Forced Capture Rule

In the standard rules, if the card you play can make a legal capture, you must
capture. You may not deliberately leave a capturable combination on the table
after playing that card.

However, you are usually free to choose which card from your hand to play. So
the tactical decision often happens before the card hits the table.

### Exact-Match Priority Rule

In standard Scopa play, if the table contains one or more single cards with the
same value as the played card, you must capture by exact value match and may not
instead take a multi-card sum.

Example:

- If the table is 5, 2, 3 and you play a 5, you must capture the table 5, not
  2+3.

### Where Captured Cards Go

When you capture:

1. Take the table cards you captured.
2. Take the card you played from your hand.
3. Place all captured cards into your own capture pile.

Players usually keep captured cards face down. When a capture is a scopa, it is
common to place one card of that capture face up or sideways so scope can be
counted easily at the end of the round.

## Scopa: The Sweep

A scopa occurs when your capture removes every card from the table, leaving
the table empty.

This matters because:

- each scopa is worth 1 point at scoring time,
- and sweeping the table can also deny the opponent future capture choices.

Important distinction:

- clearing the table by a normal capture during play is a scopa,
- receiving leftover table cards at the very end of the round is not a scopa.

Default digital ruleset clarification:

- a table-clearing capture made with a player's final card of the round does
  not score a scopa by default,
- this applies only when that player has no cards left in hand after the
  capture and the stock is already exhausted,
- clearing the table with the last card of an intermediate 3-card hand still
  counts as a scopa because a re-deal is still pending.

## If No Capture Is Possible

If the card you play cannot capture any legal set, the card remains face up on
the table.

This increases the number of cards available to your opponent and can create
future capture combinations, so discards matter strategically.

## End Of A 3-Card Hand And Re-Deal

Once both players have played all 3 cards from hand:

1. Do not score yet.
2. The dealer gives each player 3 new face-down cards.
3. No extra cards are dealt to the table on these later deals.
4. Play resumes with the next player in turn order (the player who would act
   next if cards had remained in hand).

For two players, this means the same player leads every 3-card hand in that
round: the non-dealer.

This continues until the stock is exhausted and both players have played the
final 3-card hand of the round.

## End Of The Round

When all cards from the deck have been dealt and both players have played their
last card:

1. Any cards still left face up on the table go to the player who made the last
   capture.
2. Those leftover cards are simply added to that player's capture pile.
3. This final award does not count as a scopa, even if it empties the table.
4. Players then score the round.

If no one ever made a capture, which is theoretically possible but extremely
unusual, agree before play how to handle it. The usual practical solution is
that the leftover table cards remain unclaimed because there is no last
capturer. In real play this situation is effectively negligible.

## Standard Scoring Categories

At the end of the round, count points from category awards and scope.

The standard widely used categories are:

| Category | Usual Value | How It Is Won |
| --- | ---: | --- |
| Cards | 1 point | Player with more captured cards |
| Denari | 1 point | Player with more Denari cards |
| Settebello | 1 point | Player who captured the 7 of Denari |
| Primiera | 1 point | Player with the better primiera |
| Each scopa | 1 point each | One point per sweep made during play |

This means a round normally contains:

- 4 category points that may be awarded,
- plus any extra points from scope.

## Counting The Basic Categories

### 1. Cards

The player with more total captured cards scores 1 point.

With a 40-card deck:

- if one player has more than 20 cards, that player wins the point,
- if both players have 20 cards, no one scores this category.

### 2. Denari

The player with more Denari cards scores 1 point.

Since there are 10 Denari in the deck:

- 6 to 4, 7 to 3, and similar results win the point,
- 5 to 5 is a tie and no one scores the category.

### 3. Settebello

The player who captured the 7 of Denari scores 1 point.

This card is one of the most important cards in the game because it helps with:

- its own category point,
- the Denari majority,
- and often the primiera category.

### 4. Primiera

Primiera is evaluated by selecting each player's best captured card in each suit
and comparing totals.

For primiera, rank strength is valued as follows:

| Rank For Primiera | Value |
| --- | ---: |
| 7 | 21 |
| 6 | 18 |
| Asso | 16 |
| 5 | 15 |
| 4 | 14 |
| 3 | 13 |
| 2 | 12 |
| Fante, Cavallo, Re | 10 |

Each player chooses their best captured card in each suit, adds the four values,
and the higher total wins the point.

If both totals are equal, the category is tied and no one scores.

## Optional Simplified Primiera Method

Some groups use a simplified modern method:

1. Count how many sevens each player captured.
2. The player with more sevens wins the category point.
3. If both players captured the same number of sevens, the category is tied.

This version is easier to teach and faster to score, but it is less nuanced than
the full primiera valuation.
