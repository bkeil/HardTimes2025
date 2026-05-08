# Hard Times 2025: Generative System Design (`gen/`)

The `gen/` directory contains the core procedural generation engine for "Hard Times". Its primary responsibility is to transform pure data (Seeds and Contexts) into structured game content (Regions, Names, Cultures) in a strictly deterministic and thematic manner.

## 1. Core Principles

### Determinism via "Aspect Hash-Noise"
The generation relies entirely on deterministic functions. Instead of a traditional PRNG that mutates state (like `std::mt19937`), the system uses **SquirrelNoise5**, acting as a fast, state-free hash function.
*   **Why SquirrelNoise?** It provides extremely fast, high-quality randomness while guaranteeing cross-platform determinism (unlike some standard library implementations which may vary by compiler/OS).
*   **The Inputs:** Every random choice requires a `Seed` (the base identity of the object), a `Context` (usually spatial or structural ID), and an `Aspect`.
*   **Aspects (`aspects.h`):** To prevent different generation steps for the same object from producing correlated results, every distinct generation task (e.g., picking a name vs. picking a culture tag) uses a unique `Aspect` enum value. This acts as a domain separator for the noise function.

### Thematic Consistency via Tag Harmony
The engine strives for content that makes thematic sense. This is driven by the Tag system (`tag.h/cc`).
*   **Harmony Weights:** Tags have pre-defined relationships (loaded from `tags.jsonc`). A positive weight means concepts attract (e.g., "Water" and "Fish"); negative means they repel.
*   **Selection Bias:** When the system needs to make a stochastic choice (like generating a name using the Grammar system), it takes a set of "Selector Tags" (the context) and evaluates the "Harmony" of the available options. 
*   **Mathematical Weighting:** The system uses a "roulette wheel" selection. To handle negative harmony values seamlessly, a base weight of `4` is added to all evaluations. For example, a harmony of `-3` results in a weight of `1`, while a harmony of `+3` results in a weight of `7`. Any resulting weight less than `0` is clamped to `0`, effectively eliminating that choice. Deterministic noise then picks an option based on these final weights.

## 2. Subsystems

### 2.1 The Region Pipeline (`region.cc`)
The entry point for generating the world geography and political structure.
*   **Lazy Evaluation:** Regions are generated on-demand via `FetchRegion`.
*   **Gen Levels:** Generation is broken into strict phases to prevent infinite recursion.
    *   *Level 1:* Discovers the `superior` neighbor by comparing seeds (finding local gradients of Power).
    *   *Level 2:* Traverses the `superior` links to find the `Supreme` apex, and then generates the Region's `Culture` and `Name`.

### 2.2 The Grammar Engine (`grammar.cc`)
A recursive, stochastic text generation system.
*   **Tagged Productions:** Grammar rules (`db/region_name_grammar.json`) are tagged with concepts (e.g., the word "Citadel" has the "Defense" tag).
*   **Contextual Execution:** When `GenerateString` is called, it takes `Selector Tags` (e.g., the "flavor" of the region). It evaluates all valid productions for a symbol, calculates a combined harmony score for each based on the selector tags, and deterministically rolls a choice weighted by those scores.

### 2.3 Culture and Identity (`person.cc`, `name.cc`)
*   **Culture:** A combination of tags deterministically chosen via `ChoseIndex`. It acts as the "genetic makeup" of a region's identity.
*   **Names:** Uses the Grammar engine, passing in specific flavor tags to generate contextually appropriate titles and place names.

## 3. Workflow Summary
When a new Region at `(X, Y)` is requested:
1.  **Seed Derivation:** `GetSeedForLocation(location, world_seed)` uses spatial noise to assign a base `Seed`.
2.  **Hierarchy:** It inspects its neighbors' seeds to find its `superior` and eventually its `Supreme` ancestor.
3.  **Identity:** Using its `Seed` and the `CULTURE` aspect, it rolls for its base Culture tags.
4.  **Naming:** It passes its identity tags into the Grammar Engine, which uses the `NAME` aspect and the Tag Harmony graph to deterministically generate an appropriate name.
