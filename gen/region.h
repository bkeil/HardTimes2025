#ifndef HT2025_GEN_REGION_H
#define HT2025_GEN_REGION_H

#include "types/culture.h"
#include "types/numeric.h"
#include "types/region.h"

namespace ht2025 {

const Region& GetRegion(Location location, int gen_level, Seed world_seed);

const Culture& GetCulture(Seed seed);

}  // namespace ht2025

#endif  // HT2025_GEN_REGION_H