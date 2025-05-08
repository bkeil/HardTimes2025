#include <string>
#include <string_view>
#include <vector>

#include "absl/base/no_destructor.h"
#include "absl/types/span.h"
#include "types/person.h"

namespace ht2025 {

absl::Span<const Background> BACKGROUNDS();

}  // namespace ht2025
