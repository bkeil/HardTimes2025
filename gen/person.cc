#include "gen/person.h"

#include <fstream>
#include <string>
#include <vector>

#include "absl/base/no_destructor.h"
#include "absl/types/span.h"
#include "nlohmann/json.hpp"
#include "types/person.h"

namespace ht2025 {

absl::Span<const Background> BACKGROUNDS() {
    static const absl::NoDestructor<std::vector<Background>> backgrounds([]() {
        std::ifstream file("db/backgrounds.json");
        if (!file.is_open()) {
            throw std::runtime_error("Failed to open db/backgrounds.json");
        }
        nlohmann::json json;
        file >> json;
        std::vector<Background> vec;

        for (auto& [name, data] : json.items()) {
            std::string description;
            for (const auto& desc : data["description"]) {
                description += desc.get<std::string>();
            }
            vec.push_back({.name = name, .description = description});
        }
        return vec;
    }());
    return absl::MakeSpan(*backgrounds);
}

}  // namespace ht2025
