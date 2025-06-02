#include "gen/tag.h"

#include "absl/log/check.h"
#include "absl/log/log.h"
#include "absl/strings/str_cat.h"
#include "nlohmann/json.hpp"

namespace ht2025 {

Tags LoadTags(std::string_view path) {
    LOG(INFO) << "Loading tags from " << path;
    Tags tags;
    std::ifstream file(path.data());
    if (!file.is_open()) {
        throw std::runtime_error(absl::StrCat("Failed to open tags file ", path));
    }
    nlohmann::json json = nlohmann::json::parse(file, nullptr, true, true);

    QCHECK(json.is_object());

    // It is expected that every tag should appear as a selector tag, so we register them first.
    // We will crash below if there is a tag in the selections that does not appear as a selector.
    for (const auto& [selector, interactions] : json.items()) {
        tags.RegisterTag(selector);
        QCHECK(interactions.is_object()) << " for selector " << selector;
    }

    for (const auto& [selector, interactions] : json.items()) {
        TagID selector_tag = tags.GetTag(selector);
        for (const auto& [selection, weight] : interactions.items()) {
            QCHECK(weight.is_number()) << " for selector " << selector << " selection " << selection;
            TagID selection_tag = tags.GetTag(selection);
            tags.SetWeight(selector_tag, selection_tag, weight.get<TagHarmony>());
        }
    }

    return tags;
}

}  // namespace ht2025