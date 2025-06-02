#include "gen/name.h"

#include <fstream>
#include <regex>

#include "absl/base/no_destructor.h"
#include "absl/log/log.h"
#include "absl/types/span.h"
#include "gen/grammar.h"
#include "gen/random.h"
#include "gen/tag.h"
#include "nlohmann/json.hpp"
#include "types/numeric.h"

namespace ht2025 {
namespace {

std::vector<std::vector<std::string>> LoadStringLists(std::string_view filename) {
    std::ifstream file(filename.data());
    if (!file.is_open()) {
        throw std::runtime_error("Failed to open db/person_name_lists.json");
    }
    nlohmann::json json;
    file >> json;

    std::vector<std::vector<std::string>> vec;
    for (const auto& list : json) {
        std::vector<std::string>& string_list = vec.emplace_back();
        for (const auto& name : list) {
            string_list.emplace_back(name.get<std::string>());
        }
    }
    return vec;
}

}  // namespace

std::string RegionName(Seed seed) {
    static const absl::NoDestructor<Tags> tags(LoadTags("db/tags.jsonc"));
    static TagID flavor1 = tags->GetTag("Nature");
    static TagID flavor2 = tags->GetTag("Tree");
    static absl::NoDestructor<Grammar> grammar(
        ([] { return Grammar(LoadRules("db/region_name_grammar.json", *tags), "rules", &*tags); })());
    return grammar->GenerateString(seed, 0, {flavor1, flavor1, flavor2, flavor2});
}

absl::Span<absl::Span<const std::string>> PERSON_NAMES() {
    static absl::NoDestructor<std::vector<std::vector<std::string>>> name_lists(LoadStringLists("db/person_name_lists.json"));
    static absl::NoDestructor<std::vector<absl::Span<const std::string>>> names([]() {
        std::vector<absl::Span<const std::string>> vec;
        for (const auto& name_list : *name_lists) {
            vec.emplace_back(absl::MakeSpan(name_list));
        }
        return vec;
    }());
    return absl::MakeSpan(*names);
}

}  // namespace ht2025
