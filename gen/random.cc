#include "gen/random.h"

#include "types/numeric.h"

namespace ht2025 {

Seed GetSeedForLocation(Location location, Seed world_seed) { return Get2dNoiseUint(location.first, location.second, world_seed); }

}  // namespace ht2025
