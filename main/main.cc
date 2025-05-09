#include <iostream>

#include "absl/container/node_hash_map.h"
#include "absl/container/node_hash_set.h"
#include "absl/log/log.h"
#include "absl/strings/str_format.h"
#include "gen/person.h"
#include "gen/region.h"
#include "types/numeric.h"
#include "types/person.h"
#include "types/region.h"

namespace ht2025 {

template <typename T, typename U>
std::pair<T, U> operator-(const std::pair<T, U>& p1, const std::pair<T, U>& p2) {
    return {p1.first - p2.first, p1.second - p2.second};
}

void Demo() {
    Seed world_seed = 12345;

    absl::node_hash_map<Location, absl::node_hash_set<Location>> apex_regions;
    absl::node_hash_map<Location, std::string> map_chars;
    map_chars[{-1, -1}] = "↖";
    map_chars[{-1, 0}] = "←";
    map_chars[{-1, 1}] = "↙";
    map_chars[{0, -1}] = "↑";
    map_chars[{0, 0}] = "•";
    map_chars[{0, 1}] = "↓";
    map_chars[{1, -1}] = "↗";
    map_chars[{1, 0}] = "→";
    map_chars[{1, 1}] = "↘";

    constexpr int LEFT = 0, TOP = 0, RIGHT = 10, BOTTOM = 10;

    for (int y = TOP; y < BOTTOM; ++y) {
        for (int x = LEFT; x < RIGHT; ++x) {
            Location loc{x, y};
            auto& region = GetRegion(loc, 2, world_seed);
            auto* cursor = &region;
            while (cursor->superior) {
                cursor = &GetRegion(*cursor->superior, 2, world_seed);
            }
            apex_regions[{cursor->x, cursor->y}].insert({x, y});
        }
    }

    std::cout << " ";
    for (int x = LEFT; x < RIGHT; ++x) {
        std::cout << x;
    }
    std::cout << "\n";
    for (int y = TOP; y < BOTTOM; ++y) {
        std::cout << y;
        for (int x = LEFT; x < RIGHT; ++x) {
            Location loc{x, y};
            auto& region = GetRegion(loc, 2, world_seed);
            if (region.superior) {
                auto& sup_loc = *region.superior;
                auto delta = sup_loc - loc;
                std::cout << map_chars[delta];
            } else {
                std::cout << "•";
            }
        }
        std::cout << "\n";
    }

    for (int x = 0; x < 5; ++x) {
        for (int y = 0; y < 5; ++y) {
            Location loc = {x, y};
            const Region& region = GetRegion(loc, 2, world_seed);
            LOG(INFO) << "Region at " << loc.first << ", " << loc.second << ": " << *region.name
                      << (region.superior ? (absl::StrCat(" (part of ", GetRegion(*region.superior, 2, world_seed).name.value(),
                                                          " [", region.superior->first, ", ", region.superior->second, "])"))
                                          : (absl::StrCat(" (apex)")))
                      << " (culture: " << *region.culture << ")";
        }
    }
}

}  // namespace ht2025

int main(int argc, char** argv) { ht2025::Demo(); }