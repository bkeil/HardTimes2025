#ifndef HT2025_GEN_GRAMMAR_H_
#define HT2025_GEN_GRAMMAR_H_

#include <string>
#include <string_view>
#include <vector>

#include "absl/container/flat_hash_map.h"
#include "types/numeric.h"
#include "types/tag.h"

namespace ht2025 {
using GrammarRules = absl::flat_hash_map<std::string, std::vector<TaggedText>>;
using Symbol = std::string;

GrammarRules LoadRules(std::string_view path, const Tags& tags);

class Grammar {
   public:
    Grammar(GrammarRules rules, Symbol start, const Tags* tags);

    std::vector<std::string_view> GenerateParts(Seed seed, Index context, const std::vector<TagID>& selector_tags) const;
    std::string GenerateString(Seed seed, Index context, const std::vector<TagID>& selector_tags) const;

   private:
    struct Production {
        std::vector<Symbol> symbols;
        std::vector<TagID> tags;
    };

    void Execute(Seed seed, Index context, const Symbol& symbol, Index* count, std::vector<TagID>* tags,
                 std::vector<std::string_view>* out) const;

    absl::flat_hash_map<Symbol, std::vector<Production>> rules_;
    Symbol start_;
    const Tags* tags_;
};

}  // namespace ht2025

#endif  // HT2025_GEN_GRAMMAR_H_