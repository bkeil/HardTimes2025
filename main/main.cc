#include <iomanip>
#include <iostream>

#include "absl/container/node_hash_map.h"
#include "absl/container/node_hash_set.h"
#include "absl/log/initialize.h"
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

    constexpr int LEFT = 0, TOP = 0, RIGHT = 3, BOTTOM = 3;

    std::cerr << " ";
    for (int x = LEFT; x < RIGHT; ++x) {
        std::cerr << x;
    }
    std::cerr << "\n";
    for (int y = TOP; y < BOTTOM; ++y) {
        std::cerr << y;
        for (int x = LEFT; x < RIGHT; ++x) {
            int w = std::floor(std::log10(x)) + 1;
            Location loc{x, y};
            auto& region = GetRegion(loc, 2, world_seed);
            if (region.superior) {
                auto& sup_loc = *region.superior;
                auto delta = sup_loc - loc;
                std::cerr << std::setw(w) << map_chars[delta];
            } else {
                std::cerr << std::setw(w) << "•";
            }
        }
        std::cerr << "\n";
    }

    for (int y = TOP; y < BOTTOM; ++y) {
        for (int x = LEFT; x < RIGHT; ++x) {
            Location loc = {x, y};
            const Region& region = GetRegion(loc, 2, world_seed);
            std::cout << "\"" << *region.name << "\x0D\x0A\x0D\x0A"
                      << (region.superior
                              ? (absl::StrCat(" (part of ", GetRegion(*region.superior, 2, world_seed).name.value(),
                                              /*" [", region.superior->first, ", ", region.superior->second, "]",/**/ ")"))
                              : (absl::StrCat(" (apex)")))
                      << (x == (RIGHT - 1) ? "\"\x0D\x0A" : "\",");
        }
    }
}

}  // namespace ht2025

int main(int argc, char** argv) {
    // absl::InitializeLog();

    ht2025::Demo();
}