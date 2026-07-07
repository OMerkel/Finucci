# Software Architecture Diagrams

## System Diagrams

This section contains comprehensive visual representations of the system
architecture:

- [Core Class Architecture](#core-class-architecture-diagram): class diagram of
  entity relationships and core domain models.
- [GameState FSM](#gamestate-fsm-state-chart): state chart for game phase
  transitions.
- [Layered Architecture](#layered-architecture-diagram): graph of logical layers
  and component organization.
- [Deployment Architecture](#deployment-architecture): deployment view of the
  browser runtime environment.
- [Human Turn Sequence](#human-turn-sequence-diagram): sequence diagram for a
  human player turn.
- [AI Turn Sequence](#ai-turn-sequence-diagram-async): sequence diagram for
  asynchronous AI computation.
- [Greedy Strategy Flow](#greedy-strategy-flow-chart): flowchart for the greedy
  heuristic algorithm.
- [Negamax Iterative Deepening](#negamax-iterative-deepening-flow-chart):
  flowchart for alpha-beta search with time adaptation.
- [MCTS UCT/UCB1](#mcts-uctucb1-flow-chart): flowchart for Monte Carlo tree
  search with selection, expansion, and simulation.
- [Round Scoring Flow](#round-scoring-flow-chart): flowchart for scoring
  categories and calculation.
- [Capture Validation Flow](#capture-validation-flow-chart): flowchart for
  capture legality checking and execution.
- [Rule Profile Resolution](#rule-profile-resolution-flow-chart): flowchart for
    resolving `classic_scopa` and `digital_default` runtime behavior.
- [Deterministic Shuffle Mode](#deterministic-shuffle-mode-flow-chart):
    flowchart for seeded test/replay shuffling.

---

### Core Class Architecture Diagram

```mermaid
classDiagram
    class Card {
        -suit: string
        -rank: string
        +getValue() int
        +toString() string
        +equals(Card) bool
    }

    class Deck {
        -cards: Card[]
        -stock: Card[]
        +createStandardDeck() Deck
        +shuffle() void
        +deal(count) Card[]
        +remaining() int
        +isEmpty() bool
    }

    class GameState {
        -phase: string
        -round: int
        -dealer: Player
        -currentPlayer: Player
        -table: Card[]
        -hands: Map~Player,Card[]~
        -piles: Map~Player,Card[]~
        -scores: Map~Player,int~
        -lastCapturer: Player
        +transition(newPhase, updates) GameState
        +currentPlayer Player
        +opponent Player
        +isGameOver bool
        +winner Player
    }

    class Turn {
        -gameState: GameState
        -playerId: string
        +playCard(card, capture) void
        +canCapture(card) bool
        +getAvailableCaptures(card) Capture[]
        +getAvailableDiscards() Card[]
    }

    class CaptureEngine {
        +isValidCapture(played, table) bool
        +findAllCaptures(played, table) Capture[]
        +enforcePreference(captures) Capture
        +executeCapture(state, player, card, table) GameState
    }

    class ScoringEngine {
        +scoreRound(state) Map~Player,int~
        +scoreCards(pile1, pile2) int
        +scoreDenari(pile1, pile2) int
        +scoreSevenDenari(pile1, pile2) int
        +scorePrimiera(pile1, pile2, method) int
        +countScopas(pile1, pile2) int
    }

    class ScopaEngine {
        +isScopa(before, after) bool
        +awardScopa(player) Player
    }

    class ScopaRules {
        +isTableSweep(tableCards, captureSet) bool
        +isScoringScopa(config) bool
    }

    GameState --> Deck: contains
    GameState --> Card: plays
    GameState --> Turn: initiates
    Turn --> CaptureEngine: validates
    Turn --> Card: with
    CaptureEngine --> GameState: updates
    ScoringEngine --> GameState: evaluates
    ScopaEngine --> GameState: detects sweep
    ScopaRules --> GameState: evaluates round-end sweep rule
```

---

### GameState FSM State Chart

```mermaid
stateDiagram-v2
    [*] --> Setup: Create Game

    Setup --> Dealing: Deal Initial

    Dealing --> Playing: Both players have 3 cards

    Playing --> CaptureDisplay: Player plays card
    CaptureDisplay --> Playing: Display for configured duration then execute move

    Playing --> Redeal: Both players out of cards
    Redeal --> Playing: New 3 cards dealt

    Playing --> RoundEnd: Stock exhausted and both out of cards

    RoundEnd --> Scoring: Award final table

    Scoring --> GameEnd: Win condition reached
    Scoring --> Dealing: Start new round

    GameEnd --> [*]: Game Over

```

---

### Layered Architecture Diagram

```mermaid
graph TB
    subgraph Presentation[" Presentation Layer "]
        direction TB
        GameView["GameView or GameUI<br/>Main game board"]
        Controls["GameBoard and UI controls<br/>Player input"]
        OptionsMenu["Difficulty selector and settings<br/>Configuration UI"]
        StatsView["Statistics panel<br/>Stats display"]
    end

    subgraph GameLogic[" Game Logic Layer "]
        direction TB
        GameState["GameState<br/>FSM and state"]
        CardLogic["Card and Deck<br/>Card management"]
        Capture["Capture Engine<br/>Validation"]
        Scoring["Scoring Engine<br/>Score calculation"]
        Turn["Turn Handler<br/>Turn execution"]
    end

    subgraph AI[" AI Layer "]
        direction TB
        AIManager["AI manager module<br/>Runtime validation path"]
        Greedy["Greedy<br/>Fast heuristic"]
        Negamax["Negamax<br/>Iterative deepening strategy"]
        MCTS["MCTS<br/>Rollout strategy"]
        Worker["Web Worker<br/>Optional async executor"]
    end

    subgraph Persistence[" Persistence Layer "]
        direction TB
        SGF["Persistence Manager<br/>SGF parse/export"]
        StatsManager["Statistics Manager<br/>Session stats"]
        ConfigMgr["Configuration Module<br/>Runtime config"]
    end

    GameView --> GameState
    Controls --> GameState
    OptionsMenu --> ConfigMgr
    StatsView --> StatsManager
    GameState --> CardLogic
    GameState --> Capture
    GameState --> Scoring
    GameState --> Turn
    AIManager --> Greedy
    AIManager --> Negamax
    AIManager --> MCTS
    AIManager -. async path .-> Worker
    Worker -. executes .-> Negamax
    Worker -. executes .-> MCTS
    StatsManager --> GameState
    SGF --> GameState
```

---

### Deployment Architecture

```mermaid
graph LR
    subgraph Browser["Web Browser<br/>(Chrome/Firefox/Safari)"]
        direction TB
        HTML["index.html<br/>Application shell"]
        Bundle["assets/*.js<br/>Bundled source code"]
        CSS["assets/*.css<br/>Bundled styling"]
        CardAssets["img/deck/.../*.svg<br/>Card images"]
    end

    subgraph Storage["Session Storage and Memory"]
        SessionStats["Session Statistics<br/>(Session-only)"]
    end

    HTML -->|loads| Bundle
    HTML -->|styles| CSS
    Bundle -->|loads| CardAssets
    Bundle -->|tracks| SessionStats
```

---

### Human Turn Sequence Diagram

```mermaid
sequenceDiagram
    participant UI as GameView
    participant Handler as Turn Handler
    participant Logic as Game Logic
    participant Engine as Capture Engine
    participant Bus as Event Bus

    UI->>Handler: onCardSelected(card)
    Handler->>Logic: getAvailableCaptures(card)
    Logic->>Engine: findAllCaptures(card, table)
    Engine-->>Logic: captures[]
    Logic-->>Handler: captures or allowDiscard

    alt Has Captures
        UI->>Handler: onCaptureSetSelected(tableCards)
    else No Captures
        Handler->>Logic: playCard(card)
    end

    Handler->>Logic: validateMove(card, capture)
    Logic->>Logic: checkForcedCapture()

    alt Move Valid
        Logic->>Engine: executeCapture()
        Engine-->>Logic: newGameState
        Logic->>Bus: emit('game-state-changed', newState)
        Bus->>UI: update(newState)
        UI->>UI: render()
    else Move Invalid
        Handler-->>UI: showError('Invalid move')
    end
```

---

### AI Turn Sequence Diagram (Async)

```mermaid
sequenceDiagram
    participant Controller as GameController
    participant Mgr as AIManager module
    participant Strategy as AI Strategy
    participant Engine as GameEngine
    participant View as GameView

    Controller->>Mgr: request AI move
    Mgr->>Strategy: execute selected strategy
    Strategy->>Strategy: evaluate moves
    Strategy-->>Mgr: bestMove
    Mgr-->>Controller: Promise resolves

    Controller->>Engine: playTurn(playerIndex, move)
    Engine-->>Controller: newGameState
    Controller->>View: updateGameBoard(newGameState)
    View->>View: render()
    View->>View: showStatus('AI played card')
```

---

### Greedy Strategy Flow Chart

```mermaid
flowchart TD
    Start([Get Available Moves]) --> CheckCaptures{Captures available?}

    CheckCaptures -->|No| FindDiscard[Find safest discard]
    FindDiscard --> ReturnDiscard[Return discard]

    CheckCaptures -->|Yes| FilterScopas{Any scoring scopas?}

    FilterScopas -->|Yes| Scopas[Evaluate scoring scopa moves]
    Scopas --> ScopaPriority{Settebello (7 of Denari) in scopa?}
    ScopaPriority -->|Yes| ReturnScopa7[Return Settebello (7 of Denari) scopa]
    ScopaPriority -->|No| ReturnScopa[Return highest-value scopa]

    FilterScopas -->|No| Check7Denari{Can capture Settebello (7 of Denari)?}

    Check7Denari -->|Yes| Return7[Return Settebello (7 of Denari) capture]

    Check7Denari -->|No| RankRemaining[Rank remaining captures by value]
    RankRemaining --> EvalValue{High-value cards?}

    EvalValue -->|Yes| ReturnHighValue[Return highest-value capture]
    EvalValue -->|No| ReturnFirstValid[Return first valid capture]

    ReturnDiscard --> End([Return Move])
    ReturnScopa7 --> End
    ReturnScopa --> End
    Return7 --> End
    ReturnHighValue --> End
    ReturnFirstValid --> End
```

---

### Negamax Iterative Deepening Flow Chart

```mermaid
flowchart TD
    Start([Start Search]) --> Init[depth := 1 and best := null]
    Init --> Loop{Time left and depth less than maxDepth?}

    Loop -->|Yes| Negamax[Run Negamax with alpha-beta bounds]
    Negamax --> UpdateBest[Update bestMove with current depth result]
    UpdateBest --> CheckTime{Time for next depth?}
    CheckTime -->|Yes| IncrDepth[depth plus one]
    IncrDepth --> Loop
    CheckTime -->|No| Return1[Return best move from completed depth]
    Loop -->|No| Return2[Return best move from last completed depth]

    Return1 --> End([Best Move Found])
    Return2 --> End
```

---

### MCTS UCT/UCB1 Flow Chart

```mermaid
flowchart TD
    Start([Start MCTS Loop]) --> Time{Time remaining and rollouts < max?}

    Time -->|Yes| Selection[Selection phase: traverse tree using UCB1]
    Selection --> AtLeaf{Leaf fully expanded?}

    AtLeaf -->|No| Expansion[Expansion phase: add one child move]
    AtLeaf -->|Yes| UseLeaf[Use current leaf]
    Expansion --> Simulation[Simulation phase: play random moves]
    UseLeaf --> Simulation

    Simulation --> Evaluate[Evaluate terminal result]
    Evaluate --> Backprop[Backpropagation: update statistics]
    Backprop --> Increment[rolloutCount plus one]
    Increment --> Time

    Time -->|No| SelectBest[Select best child]
    SelectBest --> End([Return Best Move])
```

---

### Round Scoring Flow Chart

```mermaid
flowchart TD
    Start([Round Complete]) --> CheckStock{Stock empty?}
    CheckStock -->|No| Wait[Wait for stock]
    Wait --> CheckStock
    CheckStock -->|Yes| Award[Award final table cards to last capturer]

    Award --> GetPiles[Get both player piles with all captured cards]
    GetPiles --> ScoreCards[Score cards category]
    ScoreCards --> ScoreCards_Result{Result}
    ScoreCards_Result -->|P1 wins| AddP1_1[P1 plus one]
    ScoreCards_Result -->|Tie| Skip1[Skip]
    ScoreCards_Result -->|P2 wins| AddP2_1[P2 plus one]

    AddP1_1 --> ScoreDenari[Score denari category]
    Skip1 --> ScoreDenari
    AddP2_1 --> ScoreDenari

    ScoreDenari --> ScoreDenari_Result{Result}
    ScoreDenari_Result -->|P1 wins| AddP1_2[P1 plus one]
    ScoreDenari_Result -->|Tie| Skip2[Skip]
    ScoreDenari_Result -->|P2 wins| AddP2_2[P2 plus one]

    AddP1_2 --> Score7Denari[Score Settebello (7 of Denari)]
    Skip2 --> Score7Denari
    AddP2_2 --> Score7Denari

    Score7Denari --> Has7{Who captured Settebello (7 of Denari)?}
    Has7 -->|P1| AddP1_3[P1 plus one]
    Has7 -->|P2| AddP2_3[P2 plus one]
    Has7 -->|Neither| Skip3[Skip]

    AddP1_3 --> ScorePrimiera[Score primiera]
    AddP2_3 --> ScorePrimiera
    Skip3 --> ScorePrimiera

    ScorePrimiera --> PrimieraResult{Winner}
    PrimieraResult -->|P1| AddP1_4[P1 plus one]
    PrimieraResult -->|Tie| Skip4[Skip]
    PrimieraResult -->|P2| AddP2_4[P2 plus one]

    AddP1_4 --> CountScopas[Count scopas]
    Skip4 --> CountScopas
    AddP2_4 --> CountScopas

    CountScopas --> UpdateCum[Update cumulative scores]
    UpdateCum --> RecordStats[Record stats and winner]
    RecordStats --> End([Round Scoring Complete])
```

---

### Capture Validation Flow Chart

```mermaid
flowchart TD
    Start([Player plays card]) --> GetValue[Get played card value]
    GetValue --> GetTable[Get all table cards]
    GetTable --> CheckSingle[Check single exact-match cards]
    CheckSingle --> HasSingle{Exact single-card match exists?}
    HasSingle -->|Yes| ReturnExact[Return exact-match capture only]
    HasSingle -->|No| GenerateSubsets[Generate all subsets of table cards]

    GenerateSubsets --> CheckSubsets{For each subset}
    CheckSubsets --> CalcSum[Sum table subset values]
    CalcSum --> CheckMatch{Subset total equals played value?}

    CheckMatch -->|Yes| Valid[Valid capture found]
    CheckMatch -->|No| NextSubset{More subsets?}

    Valid --> CollectCaptures[Collect all valid captures]
    CollectCaptures --> ReturnMulti[Return all multi-card captures]

    NextSubset -->|Yes| CheckSubsets
    NextSubset -->|No| NoCapture[No valid captures]
    NoCapture --> AllowDiscard[Allow discard]

    ReturnExact --> CheckForced[Forced capture rule]
    ReturnMulti --> CheckForced

    CheckForced --> ExecuteCapture[Execute capture and remove cards]
    ExecuteCapture --> MoveToPlayer[Add to player pile]
    MoveToPlayer --> CheckScopa[Check if table is now empty]
    CheckScopa --> RecordScopa{Scoring scopa?}
    RecordScopa -->|Yes| AddScopa[Record scopa point]
    RecordScopa -->|No| SkipScopa[No scopa under active rule]

    AddScopa --> UpdateState[Update GameState]
    SkipScopa --> UpdateState
    AllowDiscard --> UpdateState

    UpdateState --> EndTurn[End player turn]
    EndTurn --> End([Turn Complete])
```

---

### Rule Profile Resolution Flow Chart

```mermaid
flowchart TD
    Start([Game configuration load]) --> SelectProfile{Profile selected?}

    SelectProfile -->|classic_scopa| Classic[Load classic_scopa defaults]
    SelectProfile -->|digital_default| Digital[Load digital_default defaults]
    SelectProfile -->|none| Fallback[Use documented product default profile]

    Classic --> Merge[Merge explicit user overrides]
    Digital --> Merge
    Fallback --> Merge

    Merge --> Validate[Validate config schema and ranges]
    Validate --> Resolve[Resolve effective options]
    Resolve --> Apply[Apply targetScore, primieraMethod, scopa options, AI strategy]
    Apply --> StartRound([Start game with resolved runtime config])
```

---

### Deterministic Shuffle Mode Flow Chart

```mermaid
flowchart TD
    Start([Deck initialization]) --> Deterministic{deterministicShuffle.enabled?}

    Deterministic -->|No| RandomShuffle[Use standard shuffle RNG]
    Deterministic -->|Yes| SeedCheck{Seed provided?}

    SeedCheck -->|No| Error[Reject deterministic mode config]
    SeedCheck -->|Yes| SeedRng[Initialize seeded RNG]

    SeedRng --> Shuffle[Shuffle deck with seeded RNG]
    RandomShuffle --> Shuffle

    Shuffle --> PersistMeta[Persist seed/profile/config metadata for replay]
    PersistMeta --> ReplayCheck{Same seed + profile + config?}
    ReplayCheck -->|Yes| SameOrder[Reproduce identical deck order]
    ReplayCheck -->|No| DifferentOrder[Allow different order]

    SameOrder --> End([Ready for deterministic test/replay])
    DifferentOrder --> End
    Error --> End
```
