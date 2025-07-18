#include <iostream>
#include <tuple>
#include <vector>

#include "third_party/eiserloh/SquirrelNoise5.hpp"

int main() {
    for (auto& [seed, pos] : std::vector<std::pair<unsigned int, int>>{{0, 0}, {0, 1}, {1, 0}, {1, 1}}) {
        std::cout << "seed = " << seed << "; pos = " << pos << "; noise = " << SquirrelNoise5(pos, seed) << "\n";
        unsigned int big_seed = seed + 0x8000'0000;
        int low_pos = pos - 2;
        std::cout << "seed = " << big_seed << "; pos = " << low_pos << "; noise = " << SquirrelNoise5(low_pos, big_seed) << "\n";
    }
}