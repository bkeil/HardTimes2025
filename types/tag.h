#ifndef HT2025_TYPES_TAG_H
#define HT2025_TYPES_TAG_H

#include <string_view>

#include "absl/container/flat_hash_map.h"

namespace ht2025 {

using TagID = int;
using TagHarmony = int;

struct TaggedText {
    std::string text;
    std::vector<TagID> tags;
};

class Tags {
   public:
    Tags() : next_id_(1) {}

    TagID GetTag(std::string_view tag) const;
    TagHarmony GetHarmony(TagID selector, TagID selection) const;
    std::string_view GetText(TagID tag) const;

    TagID RegisterTag(std::string_view tag);
    void SetHarmony(TagID selector, TagID selection, TagHarmony weight);

   private:
    TagID next_id_;
    absl::flat_hash_map<std::string, TagID> tag_ids_;
    absl::flat_hash_map<std::pair<TagID, TagID>, TagHarmony> interactions_;
};

}  // namespace ht2025

#endif  // HT2025_TYPES_TAG_H