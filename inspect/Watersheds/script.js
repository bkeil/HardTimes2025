import { DiamondSquare } from "./diamond_square.js";
import { noise } from "./perlin.js";

// Get a reference to the canvas element
/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("myCanvas");

/** @type {HTMLInputElement} */
const seed_input = document.getElementById("seed");

/** @type {HTMLSelectElement} */
const waterfunc_input = document.getElementById("waterfunc");

const width = canvas.width,
    height = canvas.height;
const grid = 10,
    stroke = 4;

// Get the 2D rendering context
const ctx = canvas.getContext("2d");

function Simplex(rows, cols, seed, freq = 64, octaves = 1) {
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

for (const chunk_size of [4, 8, 16, 32, 64]) {
    const funcname = "DiamondSquare" + chunk_size;
    window[funcname] = (rows, cols, seed) =>
        DiamondSquare(rows, cols, seed, chunk_size);
    const option = document.createElement("option");
    option.label = "Diamond Square " + chunk_size;
    option.value = funcname;
    waterfunc_input.appendChild(option);
}

for (const freq of [4, 24, 64]) {
    for (const octaves of [1, 2, 4]) {
        const funcname = "Simplex" + freq + "_" + octaves;
        window[funcname] = (rows, cols, seed) =>
            Simplex(rows, cols, seed, freq, octaves);
        const option = document.createElement("option");
        option.label = `Simplex ${freq} ${octaves}`;
        option.value = funcname;
        waterfunc_input.appendChild(option);
    }
}

let Watertable = window.DiamondSquare16;

function drawWorld() {
    ctx.clearRect(0, 0, width, height);
    const seed = parseInt(seed_input.value, 10);
    console.log("seed", seed);
    const cols = Math.floor(width / grid),
        rows = Math.floor(height / grid);
    console.log("cols", cols, "rows", rows);
    const chunks = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => ({}))
    );

    // Moisture map
    const water = Watertable(rows, cols, seed);

    // Layer 1

    for (let row = 0; row < rows; ++row) {
        for (let col = 0; col < cols; col++) {
            const chunk = chunks[row][col];
            chunk.row = row;
            chunk.col = col;
            chunk.water = water[row][col];
        }
    }

    // Layer 2

    for (let row = 1; row < rows - 1; ++row) {
        for (let col = 1; col < cols - 1; ++col) {
            const chunk = chunks[row][col];
            let wettest_neighbor = chunk;
            for (let dr = -1; dr < 2; ++dr) {
                for (let dc = -1; dc < 2; ++dc) {
                    const neighbor = chunks[row + dr][col + dc];
                    if (neighbor.water > wettest_neighbor.water) {
                        wettest_neighbor = neighbor;
                    }
                }
            }
            if (wettest_neighbor != chunk) {
                chunk["flows_to"] = wettest_neighbor;
            }
        }
    }

    for (let row = 0; row < rows; ++row) {
        for (let col = 0; col < cols; ++col) {
            let chunk = chunks[row][col];
            const x = col * grid,
                y = row * grid;
            const red = 256 - Math.floor(chunk.water / 4);
            ctx.fillStyle = `rgb(${red}, 255, 0)`;
            ctx.fillRect(x, y, grid - 1, grid - 1);
        }
    }

    console.log("Drawing...");

    ctx.strokeStyle = "blue";
    for (let row = 0; row < rows; ++row) {
        for (let col = 0; col < cols; ++col) {
            let chunk = chunks[row][col];
            const x = col * grid,
                y = row * grid;
            if (chunk.water < 256) continue;
            let dest = chunk.flows_to;
            if (dest) {
                ctx.beginPath();
                ctx.moveTo(x + grid / 2, y + grid / 2);
                ctx.lineTo(
                    dest.col * grid + grid / 2,
                    dest.row * grid + grid / 2
                );
                ctx.lineWidth = stroke * ((chunk.water - 255) / 768) + 1;
                ctx.stroke();
            }
        }
    }
}

seed_input.addEventListener("change", drawWorld);

waterfunc_input.addEventListener("change", () => {
    Watertable = window[waterfunc_input.value];
    drawWorld();
});

window.onload = function () {
    waterfunc_input.value = "DiamondSquare64";
    seed_input.value = -45;
    waterfunc_input.dispatchEvent(new Event("change"));
};
