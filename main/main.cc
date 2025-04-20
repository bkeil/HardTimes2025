#include <iostream>

#include "third_party/eiserloh/SquirrelNoise5.hpp"

int main(int argc, char** argv) {
    for (int r = 0; r < 5; ++r) {
        for (int c = 0; c < 5; ++c) {
            std::cout << Get2dNoiseUint(c, r) << "\t";
        }
        std::cout << "\n";
    }
}