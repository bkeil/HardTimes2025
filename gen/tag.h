#ifndef HT2025_GEN_TAG_H
#define HT2025_GEN_TAG_H

#include <fstream>
#include <string_view>

#include "gen/random.h"
#include "types/numeric.h"
#include "types/tag.h"

namespace ht2025 {

Tags LoadTags(std::string_view path);

inline TagHarmony GetHarmony(Seed seed, Index context, Index aspect, TagHarmony total_harmony) {
    return ChoseIndex(seed, context, aspect, total_harmony);
}

}  // namespace ht2025

#endif  // HT2025_GEN_TAG_H