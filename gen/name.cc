#include "gen/name.h"

#include <fstream>
#include <regex>

#include "absl/base/no_destructor.h"
#include "absl/container/flat_hash_map.h"
#include "absl/log/log.h"
#include "absl/types/span.h"
#include "gen/random.h"
#include "nlohmann/json.hpp"
#include "types/numeric.h"

namespace ht2025 {
namespace {

using Grammar = absl::flat_hash_map<std::string, std::vector<std::string>>;

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
    static absl::NoDestructor<Grammar> grammar(([] {
        std::ifstream file("db/region_name_grammar.json");
        if (!file.is_open()) {
            throw std::runtime_error("Failed to open db/region_name_grammar.json");
        }
        nlohmann::json json;
        file >> json;

        Grammar grammar;
        for (const auto& [symbol, replacments] : json.items()) {
            for (const auto& rule : replacments) {
                grammar[symbol].emplace_back(rule.get<std::string>());
            }
        }
        return grammar;
    })());
    static absl::NoDestructor<std::regex> non_terminal(R"re(\$\{([^}]+)\})re");

    std::string name = Choice(seed, 0, 0, absl::MakeSpan((*grammar)["rules"]));
    LOG(INFO) << "Name (0): " << name;

    int aspect = 1;
    std::smatch match;
    while (std::regex_search(name, match, *non_terminal)) {
        const std::string& non_terminal = match[1];
        if (!grammar->contains(non_terminal)) {
            LOG(ERROR) << "No grammar rule for " << non_terminal;
            break;
        }
        const std::string& replacement = Choice(seed, 0, aspect, absl::MakeSpan((*grammar)[non_terminal]));
        name.replace(match.position(0), match.length(0), replacement);
        ++aspect;
    }

    return name;
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
