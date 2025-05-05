#ifndef HT2025_GEN_RANDOM_H
#define HT2025_GEN_RANDOM_H

#include "absl/types/span.h"
#include "third_party/eiserloh/SquirrelNoise5.hpp"

namespace ht2025 {

using Seed = unsigned int;
using Index = int;

template <typename T>
T& Choice(Seed seed, Index context, Index aspect, absl::Span<T> choices) {
    return choices[Get2dNoiseUint(context, aspect, seed) % choices.size()];
}

}  // namespace ht2025

#endif  // HT2025_GEN_RANDOM_H
