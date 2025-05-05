#include <iostream>

#include "gen/person.h"
#include "gen/random.h"

int main(int argc, char** argv) {
    std::cout << "Hello, World!" << std::endl;

    ht2025::Seed seed = 12345;

    const auto backgrounds = ht2025::BACKGROUNDS();
    for (int i = 0; i < 10; ++i) {
        ht2025::Background background = ht2025::Choice(seed, i, 0, backgrounds);
        std::cout << "Background " << i << ": " << background.name() << std::endl;
    }

    std::cout << "Goodbye, World!" << std::endl;
    return 0;
}