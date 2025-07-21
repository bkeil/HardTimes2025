import { noise } from "./perlin.js";

export function Simplex(
    rows,
    cols,
    seed,
    freq = 64,
    octaves = 1,
    max_relief,
    allow_negative
) {
    const value = [];
    noise.seed(seed);

    let weight = 1,
        total_weight = 0;
    for (let o = 0; o < octaves; ++o) {
        total_weight += weight;
        weight /= 2;
    }

    for (let row = 0; row < rows; ++row) {
        value[row] = [];
        const y = row / freq;
        for (let col = 0; col < cols; ++col) {
            const x = col / freq;
            let w = 0;
            weight = 1;

            let factor = 1;
            for (let o = 0; o < octaves; ++o) {
                w +=
                    weight *
                    noise.simplex2(x * factor + factor, y * factor - factor);
                factor *= 2;
                weight /= 2;
            }
            w /= total_weight;

            if (!allow_negative) w = (1 + w) / 2;

            value[row][col] = Math.floor(w * max_relief);
        }
    }
    return value;
}
