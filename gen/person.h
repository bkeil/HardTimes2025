#include <string>
#include <string_view>
#include <vector>

#include "absl/base/no_destructor.h"
#include "absl/types/span.h"

namespace ht2025 {

class Background {
   public:
    Background(std::string_view name, std::string_view description) : name_(name), description_(description) {}

    std::string name() const { return name_; }
    std::string description() const { return description_; }

   private:
    std::string name_;
    std::string description_;
};

absl::Span<const Background> BACKGROUNDS();

}  // namespace ht2025
