# Hard Times 2025: Design Document

"Hard Times" is a procedural generation experiment focused on creating an infinite, hierarchically structured game world. The project prioritizes deterministic generation, thematic consistency through tag-based harmony, and a multi-pass generation pipeline.

## 1. Core Philosophy

### Infinite & Deterministic
The world is an infinite grid of **Regions**. Every property of a region must be derivable from its coordinates `(x, y)` and a global `world_seed`. This ensures that any part of the world can be re-created at any time without storing the entire map.

### Persistence: The "Event Log" Vision
While the base world is deterministic, player actions and world-changing events require persistence.
*   **Base Layer:** Purely deterministic generation.
*   **Event Layer:** A log of "world-changing events" applied on top of the base layer.
*   **Fetching:** When a region is requested, the engine generates the base and then "replays" relevant events to produce the current state.

### Hierarchical Sovereignty
The world is not just a collection of tiles; it is a forest of "Supreme Domains."
1.  **Superior:** Every region identifies a neighbor with higher "Power" (currently a simple noise seed) as its `superior`.
2.  **Apex:** A region with a higher seed than all its neighbors is an `Apex`.
3.  **Supreme:** By following `superior` links, every region identifies its `Supreme` ancestor (the Apex at the root of its tree). This effectively partitions the world into "natural" political or thematic borders.

---

## 2. The Generation Pipeline (Gen Levels)

To prevent circular dependencies in an infinite world, generation is split into **Gen Levels**.

### The Dependency Rule
> **Level N of a region can ONLY depend on Level N-1 (or lower) attributes of its neighbors.**

*   **Level 0: Foundation**
    *   Basic coordinates and local `seed` (derived from `world_seed`).
*   **Level 1: Connectivity**
    *   Determines the `superior` neighbor.
    *   Identifies if the region is an `Apex`.
*   **Level 2: Identity**
    *   Calculates `Supreme` ancestry.
    *   Generates **Culture** and **Name**.
*   **Future Levels (Gen 3+):**
    *   Economy, local landmarks, population stats, and history.

---

## 3. Systems

### Tag Harmony System (`db/tags.jsonc`)
A thematic engine that defines "Harmony" between different concepts (Tags).
*   **Harmony:** A weighted value (positive or negative) between two tags.
*   **Usage:** Used to bias random selections. For example, a region with the "Coastal" tag will have high harmony with "Fish" and "Shipwright," making those choices more likely in names and descriptions.

### Stochastic Grammar (`gen/grammar.h`)
A recursive production system for generating text.
*   **Tagged Productions:** Rules in the grammar can be associated with tags.
*   **Biased Selection:** When generating a string, the engine passes "flavor tags" which are compared against the production tags using the Harmony system to select the most "fitting" text.

### Memoization & Caching
Currently, `gen/region.cc` uses a global in-memory cache (`absl::node_hash_map`) to store generated regions. 
*   **Abstraction:** `FetchRegion` is the primary entry point, intended to eventually handle disk-based swapping/LRU caching.

---

## 4. Current Status & Known Shortcomings

### Status
*   **World Map:** A basic Raylib-based inspector (`//inspect:map`) visualizes the hierarchy and supreme domain borders.
*   **Naming:** Grammar engine is functional and used for region naming.
*   **Tags:** A rich set of initial tags and harmonies is defined in `db/`.

### Shortcomings
*   **Hardcoded Flavors:** Region naming currently hardcodes "Undead" and "Defense" tags as placeholders.
*   **Culture Integration:** The `Culture` type is defined but not yet fully integrated into the naming or behavior of regions.
*   **Power Calculation:** Currently, "Power" is just a raw noise seed. It needs to be replaced with a multi-layered calculation (water, soil, minerals, etc.).
*   **Thread Safety:** The current global memoization is not thread-safe.

---

## 5. Roadmap
1.  **Multi-layered Power:** Implement a more complex "Power" function for Level 1 generation.
2.  **Culture Flow:** Implement the logic where `Supreme` regions define a base culture that filters down the `superior` links, with local variations.
3.  **Persistence Layer:** Begin implementing the event-log system to allow for persistent world changes.
4.  **Disk Swapping:** Transition the memoization from a simple map to an LRU cache that can offload to disk.
