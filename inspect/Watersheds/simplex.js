import { noise } from "./perlin.js";

export function Simplex(rows, cols, seed, freq = 64, octaves = 1) {
    const water = [];
    noise.seed(seed);

    let weight = 1,
        total_weight = 0;
    for (let o = 0; o < octaves; ++o) {
        total_weight += weight;
        weight /= 2;
    }

    for (let row = 0; row < rows; ++row) {
        water[row] = [];
        const y = row / freq;
        for (let col = 0; col < cols; ++col) {
            const x = col / freq;
            let w = 0;
            weight = 1;

            let factor = 1;
            for (let o = 0; o < octaves; ++o) {
                w += weight * noise.simplex2(x * factor, y * factor);
                factor *= 2;
                weight /= 2;
            }
            w /= total_weight;

            water[row][col] = Math.floor(w * 511) + 512;
        }
    }
    return water;
}
