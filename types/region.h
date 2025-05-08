#ifndef HT2025_TYPES_REGION_H
#define HT2025_TYPES_REGION_H

#include <optional>
#include <string_view>

#include "absl/strings/str_cat.h"
#include "types/numeric.h"

namespace ht2025 {

struct Region {
    template <typename Sink>
    friend void AbslStringify(Sink& sink, const Region& region) {
        absl::StrAppend(&sink, "Region{", region.x, ", ", region.y, ", gen_level=", region.gen_level, ", seed=", region.seed,
                        ", superior=",
                        region.superior.has_value() ? absl::StrCat(region.superior->first, ", ", region.superior->second) : "null",
                        ", culture=", region.culture.has_value() ? absl::StrCat(region.culture.value()) : "null",
                        ", name=", region.name.has_value() ? *region.name : "null", "}");
    }
    int gen_level;
    Index x, y;
    Seed seed;

    // Gen Level 1
    std::optional<Location> superior;

    // Gen Level 2
    std::optional<Index> culture;
    std::optional<std::string_view> name;
};

}  // namespace ht2025

#endif  // HT2025_TYPES_REGION_H