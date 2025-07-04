#include "gen/region.h"

#include <stack>

#include "absl/base/no_destructor.h"
#include "absl/container/node_hash_map.h"
#include "absl/log/log.h"
#include "gen/aspects.h"
#include "gen/name.h"
#include "gen/random.h"

namespace ht2025 {
namespace {
void GenRegion(Region& region, int gen_level, Seed world_seed);

Region& FetchRegion(Location location, int gen_level, Seed world_seed) {
    static absl::NoDestructor<absl::node_hash_map<Location, Region>> regions;
    if (!regions->contains(location)) {
        LOG(INFO) << "Generating region at " << location.first << ", " << location.second;
        Region& region = (*regions)[location];
        region.gen_level = 0;
        region.location = location;
        region.seed = GetSeedForLocation(location, world_seed);
    }

    Region& region = (*regions)[location];
    if (region.gen_level < gen_level) {
        GenRegion((*regions)[location], gen_level, world_seed);
    }

    return (*regions)[location];
};

}  // namespace

const Region& GetRegion(Location location, int gen_level, Seed world_seed) { return FetchRegion(location, gen_level, world_seed); };

const Culture& GetCulture(Seed seed, const Tags& tags) {
    static absl::NoDestructor<absl::node_hash_map<Seed, Culture>> cultures;
    if (!cultures->contains(seed)) {
        Culture& culture = (*cultures)[seed];
        const size_t num_tags = tags.size();
        culture.tag1 = ChoseIndex(seed, aspects::region::CULTURE, aspects::culture::TAG1, num_tags);
        culture.tag2 = ChoseIndex(seed, aspects::region::CULTURE, aspects::culture::TAG2, num_tags);
    }
    return cultures->at(seed);
}

namespace {

// std::vector<std::vector<Region*>> GetNeighbors(Location location, int radius, int gen_level, Seed seed) {
//     std::vector<std::vector<Region*>> neighbors;
//     for (int i = -radius; i <= radius; ++i) {
//         for (int j = -radius; j <= radius; ++j) {
//             if (i == 0 && j == 0) continue;
//             Location loc = {location.first + i, location.second + j};
//             Region& region = GetRegion(loc, gen_level, seed);
//             neighbors.push_back(&region);
//         }
//     }
//     return neighbors;
// }

// Determines:
// 1. The superior region of the current region.
void GenRegion1(Region& region, Seed world_seed) {
    LOG(INFO) << "Expanding region at " << region.x << ", " << region.y << " to level 1";
    Region* superior = &region;
    for (int i = -1; i <= 1; ++i) {
        for (int j = -1; j <= 1; ++j) {
            if (i == 0 && j == 0) continue;
            Location loc = {region.x + i, region.y + j};
            Region& neighbor = FetchRegion(loc, 0, world_seed);
            if (neighbor.seed > superior->seed) {
                superior = &neighbor;
            }
        }
    }
    if (superior != &region) {
        LOG(INFO) << "Found superior region at " << superior->x << ", " << superior->y;
        region.superior = {superior->x, superior->y};
    } else {
        LOG(INFO) << "This is the apex!";
    }
    region.gen_level = 1;
}

Index GetCulture(Region& region, Seed world_seed) {
    if (region.culture.has_value()) {
        LOG(INFO) << "Found culture at " << region.x << ", " << region.y << ": " << *region.culture;
        return *region.culture;
    }
    if (region.superior.has_value()) {
        Region& superior = FetchRegion(*region.superior, 1, world_seed);
        LOG(INFO) << "Chasing culture to " << superior.x << ", " << superior.y;
        return GetCulture(superior, world_seed);
    }
    region.culture = GetSeedForLocation({0, 0}, region.seed);
    LOG(INFO) << "Set culture at " << region.x << ", " << region.y << " to " << *region.culture;
    return *region.culture;
}

// Determines:
// 1. The culture
// 2. The name
void GenRegion2(Region& region, Seed world_seed) {
    LOG(INFO) << "Expanding region at " << region.x << ", " << region.y << " to level 2";
    if (region.gen_level < 1) {
        GenRegion1(region, world_seed);
    }

    region.culture = GetCulture(region, world_seed);

    region.name = RegionName(region.seed);
    LOG(INFO) << "Name: " << *region.name;

    region.gen_level = 2;
}

void GenRegion(Region& region, int gen_level, Seed world_seed) {
    switch (gen_level) {
        case 1:
            GenRegion1(region, world_seed);
            break;
        case 2:
            GenRegion2(region, world_seed);
            break;
        default:
            break;
    }
}

}  // namespace
}  // namespace ht2025
