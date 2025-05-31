#include "gen/grammar.h"

#include <fstream>
#include <regex>

#include "absl/strings/str_join.h"
#include "gen/random.h"
#include "nlohmann/json.hpp"

namespace ht2025 {

GrammarRules LoadRules(std::string_view path) {
    std::ifstream file("db/region_name_grammar.json");
    if (!file.is_open()) {
        throw std::runtime_error("Failed to open db/region_name_grammar.json");
    }
    nlohmann::json json;
    file >> json;

    GrammarRules rules;
    for (const auto& [symbol, productions] : json.items()) {
        for (const auto& rule : productions) {
            const auto& expansion = rule[0].get<std::string>();
            rules[symbol].emplace_back(expansion);
        }
    }
    return rules;
}

namespace {
bool IsTerminal(const Symbol& symbol) { return symbol.size() < 2 || symbol[0] != '$' || symbol[1] != '{'; }
}  // namespace

Grammar::Grammar(GrammarRules rules, Symbol start) : start_(std::move(start)) {
    std::regex chunker(R"re(\$\{[^}]+\}|[^$]+)re");
    for (auto& [symbol, productions] : rules) {
        for (auto& production : productions) {
            Production p;
            std::smatch match;
            std::string::const_iterator cursor = (production.cbegin());
            while (std::regex_search(cursor, production.cend(), match, chunker)) {
                p.symbols.emplace_back(match[0]);
                cursor = match.suffix().first;
            }
            rules_[symbol].emplace_back(std::move(p));
        }
    }
}

std::vector<std::string_view> Grammar::GenerateParts(Seed seed, Index context) const {
    std::vector<std::string_view> terminals;
    int count = 0;
    Execute(seed, context, start_, &count, &terminals);
    return terminals;
}

std::string Grammar::GenerateString(Seed seed, Index context) const { return absl::StrJoin(GenerateParts(seed, context), ""); }

void Grammar::Execute(Seed seed, Index context, const Symbol& symbol, Index* count, std::vector<std::string_view>* out) const {
    if (!rules_.contains(symbol)) {
        std::cerr << "Missing expansion for >>" << symbol << "<<\n";
        out->push_back(symbol);
        return;
    }
    const Production& p = Choice(seed, context, *count, absl::MakeSpan(rules_.at(symbol)));
    ++(*count);
    for (const auto& symbol : p.symbols) {
        if (IsTerminal(symbol)) {
            out->push_back(symbol);
        } else {
            Execute(seed, context, symbol.substr(2, symbol.size() - 3), count, out);
        }
    }
}

}  // namespace ht2025