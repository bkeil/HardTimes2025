#ifndef HT2025_GEN_RANDOM_H
#define HT2025_GEN_RANDOM_H

#include "absl/types/span.h"
#include "third_party/eiserloh/SquirrelNoise5.hpp"
#include "types/numeric.h"

namespace ht2025 {

inline Index ChoseIndex(Seed seed, Index context, Index aspect, Index max) { return Get2dNoiseUint(context, aspect, seed) % max; }

template <typename T>
T& Choice(Seed seed, Index context, Index aspect, absl::Span<T> choices) {
    return choices[ChoseIndex(seed, context, aspect, choices.size())];
}

inline Seed GetSeed(Seed seed, Index context, Index aspect) { return Get2dNoiseUint(context, aspect, seed); }

Seed GetSeedForLocation(Location location, Seed superior_seed);

}  // namespace ht2025

#endif  // HT2025_GEN_RANDOM_H
