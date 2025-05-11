#ifndef HT2025_GEN_NAME_H
#define HT2025_GEN_NAME_H

#include <string>

#include "absl/types/span.h"
#include "types/numeric.h"

namespace ht2025 {

absl::Span<absl::Span<const std::string>> PERSON_NAMES();

std::string RegionName(Seed seed);

}  // namespace ht2025

#endif  // HT2025_GEN_NAME_H
