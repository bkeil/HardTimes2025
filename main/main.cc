#include <iostream>

#include "gen/person.h"
#include "third_party/eiserloh/SquirrelNoise5.hpp"

int main(int argc, char** argv) {
    std::cout << "Hello, World!" << std::endl;

    for (const auto& background : ht2025::BACKGROUNDS()) {
        std::cout << "Background: " << background.name() << ", Description: " << background.description() << std::endl;
    }

    return 0;
}