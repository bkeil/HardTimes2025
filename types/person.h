#ifndef HT2025_TYPES_PERSON_H
#define HT2025_TYPES_PERSON_H

#include <string>

#include "types/numeric.h"

namespace ht2025 {

struct Background {
    std::string name;
    std::string description;
};

struct Person {
    Seed seed;
    Location location;
};

}  // namespace ht2025

#endif  // HT2025_TYPES_PERSON_H
