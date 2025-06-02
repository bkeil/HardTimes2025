#include "types/tag.h"

#include "absl/log/check.h"
#include "absl/log/log.h"

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

void Tags::SetWeight(TagID selector, TagID selection, TagHarmony weight) {
    interactions_[std::make_pair(selector, selection)] = weight;
}

}  // namespace ht2025