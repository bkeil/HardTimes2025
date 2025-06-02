#ifndef HT2025_GEN_TAG_H
#define HT2025_GEN_TAG_H

#include <fstream>
#include <string_view>

#include "types/tag.h"

namespace ht2025 {

Tags LoadTags(std::string_view path);

}  // namespace ht2025

#endif  // HT2025_GEN_TAG_H