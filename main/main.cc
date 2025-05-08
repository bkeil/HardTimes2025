#include <iostream>

#include "absl/log/log.h"
#include "absl/strings/str_format.h"
#include "gen/person.h"
#include "gen/region.h"
#include "types/numeric.h"
#include "types/person.h"
#include "types/region.h"

namespace ht2025 {

void Demo() {
    Seed world_seed = 12345;
    for (int x = 0; x < 3; ++x) {
        for (int y = 0; y < 3; ++y) {
            GetRegion({x, y}, 2, world_seed);
        }
    }
    for (int x = 0; x < 3; ++x) {
        for (int y = 0; y < 3; ++y) {
            Location loc = {x, y};
            const Region& region = GetRegion(loc, 2, world_seed);
            LOG(INFO) << "Region at " << loc.first << ", " << loc.second << ": " << *region.name;
        }
    }
}

}  // namespace ht2025

int main(int argc, char** argv) { ht2025::Demo(); }