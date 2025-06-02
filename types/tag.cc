#include "types/tag.h"

#include "absl/log/check.h"
#include "absl/log/log.h"
#include "absl/strings/str_cat.h"

namespace ht2025 {

TagID Tags::RegisterTag(std::string_view tag) {
    if (!tag_ids_.contains(tag)) {
        tag_ids_[tag] = next_id_;
        LOG(INFO) << "Registered tag " << tag;
        ++next_id_;
    }
    return tag_ids_[tag];
}

TagID Tags::GetTag(std::string_view tag) const {
    CHECK(tag_ids_.contains(tag)) << tag;
    return tag_ids_.at(tag);
}

std::string_view Tags::GetText(TagID tag) const {
    for (const auto& [text, id] : tag_ids_) {
        if (id == tag) return text;
    }
    throw std::runtime_error(absl::StrCat("Missing text for ", tag));
}

void Tags::SetHarmony(TagID selector, TagID selection, TagHarmony weight) {
    interactions_[std::make_pair(selector, selection)] = weight;
}

TagHarmony Tags::GetHarmony(TagID selector, TagID selection) const {
    auto it = interactions_.find(std::make_pair(selector, selection));
    if (it == interactions_.end()) return 0;
    return it->second;
}

}  // namespace ht2025