#include <iostream>

#include "third_party/eiserloh/SquirrelNoise5.hpp"

int main() {
    for (int i = 0; i < 20; ++i) {
        std::cout << SquirrelNoise5(i, 1) << "\n";
    }
}