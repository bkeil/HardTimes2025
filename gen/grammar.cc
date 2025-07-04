#include "gen/grammar.h"

#include <fstream>
#include <regex>

#include "absl/log/check.h"
#include "absl/log/log.h"
#include "absl/strings/str_cat.h"
#include "absl/strings/str_join.h"
#include "gen/random.h"
#include "gen/tag.h"
#include "nlohmann/json.hpp"

namespace ht2025 {

GrammarRules LoadRules(std::string_view path, const Tags& tags) {
    std::ifstream file(path.data());
    if (!file.is_open()) {
        throw std::runtime_error(absl::StrCat("Failed to open ", path));
    }
    nlohmann::json json = nlohmann::json::parse(file, nullptr, true, true);

    GrammarRules rules;
    for (const auto& [symbol, productions] : json.items()) {
        for (const auto& rule : productions) {
            const auto& expansion = rule[0].get<std::string>();
            const auto& selections = rule[1];
            std::vector<TagID> selection_tags;
            for (const auto& tag : selections) {
                selection_tags.push_back(tags.GetTag(tag.get<std::string_view>()));
            }
            rules[symbol].emplace_back(expansion, std::move(selection_tags));
        }
    }
    return rules;
}

namespace {
bool IsTerminal(const Symbol& symbol) { return symbol.size() < 2 || symbol[0] != '$' || symbol[1] != '{'; }
}  // namespace

Grammar::Grammar(GrammarRules rules, Symbol start, const Tags* tags) : start_(std::move(start)), tags_(tags) {
    std::regex chunker(R"re(\$\{[^}]+\}|[^$]+)re");
    for (auto& [symbol, productions] : rules) {
        for (auto& production : productions) {
            Production p;
            std::smatch match;
            std::string::const_iterator cursor = (production.text.cbegin());
            while (std::regex_search(cursor, production.text.cend(), match, chunker)) {
                p.symbols.emplace_back(match[0]);
                cursor = match.suffix().first;
            }
            p.tags = production.tags;
            rules_[symbol].emplace_back(std::move(p));
        }
    }
}

std::vector<std::string_view> Grammar::GenerateParts(Seed seed, Index context, const std::vector<TagID>& selector_tags) const {
    std::vector<std::string_view> terminals;
    std::vector<TagID> tags = selector_tags;
    int count = 0;
    Execute(seed, context, start_, &count, &tags, &terminals);
    return terminals;
}

std::string Grammar::GenerateString(Seed seed, Index context, const std::vector<TagID>& selector_tags) const {
    return absl::StrJoin(GenerateParts(seed, context, selector_tags), "");
}

void Grammar::Execute(Seed seed, Index context, const Symbol& symbol, Index* count, std::vector<TagID>* tags,
                      std::vector<std::string_view>* out) const {
    if (!rules_.contains(symbol)) {
        std::cerr << "Missing expansion for >>" << symbol << "<<\n";
        out->push_back(symbol);
        return;
    }

    const auto& productions = rules_.at(symbol);
    std::vector<int> index_weights(productions.size());
    int total_weight = 0;
    for (int i = 0; i < productions.size(); ++i) {
        const auto& p = productions.at(i);
        TagHarmony weight = 4;
        for (const TagID selector : *tags) {
            for (const TagID selection : p.tags) {
                weight += tags_->GetHarmony(selector, selection);
            }
        };
        if (weight < 0) weight = 0;
        index_weights[i] = weight;
        total_weight += weight;
    }

    const Production* p = nullptr;
    if (total_weight > 0) {
        TagHarmony target = GetHarmony(seed, context, *count, total_weight);
        for (int i = 0; i < index_weights.size(); ++i) {
            target -= index_weights[i];
            if (target < 0) {
                p = &productions.at(i);
                break;
            }
        }
    } else {
        p = &Choice(seed, context, *count, absl::MakeSpan(rules_.at(symbol)));
    }
    if (true) {
        LOG(ERROR) << "No production chosen.";
        LOG(ERROR) << "Selection Tags:";
        for (const TagID tag : *tags) {
            LOG(ERROR) << tags_->GetText(tag);
        }
        LOG(ERROR) << "Productions:";
        for (int i = 0; i < index_weights.size(); ++i) {
            LOG(ERROR) << absl::StrJoin(productions[i].symbols, " ") << "; Harmony " << index_weights[i];
        }
        TagHarmony target = GetHarmony(seed, context, *count, total_weight);
        LOG(ERROR) << "Target harmony " << target;
        QCHECK(p != nullptr);
    }

    ++(*count);

    tags->insert(tags->end(), p->tags.begin(), p->tags.end());

    for (const auto& symbol : p->symbols) {
        if (IsTerminal(symbol)) {
            out->push_back(symbol);
        } else {
            Execute(seed, context, symbol.substr(2, symbol.size() - 3), count, tags, out);
        }
    }
}

}  // namespace ht2025